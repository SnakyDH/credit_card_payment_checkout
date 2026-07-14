#!/usr/bin/env bash
set -euo pipefail

# Deploy payment-checkout API to AWS (Elastic Beanstalk + RDS)
# Usage: ./scripts/aws-deploy.sh [all|rds|migrate|eb|deploy|verify]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

AWS_CLI="${AWS_CLI:-aws}"
EB_CLI="${EB_CLI:-eb}"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"
APP_NAME="${EB_APP_NAME:-payment-checkout-api}"
ENV_NAME="${EB_ENV_NAME:-payment-checkout-api-dev}"
RDS_ID="${RDS_ID:-payment-checkout-api-db}"
INSTANCE_TYPE="${EB_INSTANCE_TYPE:-t3.micro}"
DB_CLASS="${RDS_INSTANCE_CLASS:-db.t4g.micro}"
DB_STORAGE="${RDS_ALLOCATED_STORAGE:-20}"
STATE_FILE="$ROOT_DIR/.aws-deploy-state"

export PATH="/c/Program Files/Amazon/AWSCLIV2:/c/Users/SnakyDH/AppData/Local/Programs/Python/Python312/Scripts:$PATH"

log() { echo "[aws-deploy] $*"; }
die() { echo "[aws-deploy] ERROR: $*" >&2; exit 1; }

load_env() {
  if [[ -f "$ROOT_DIR/.env.aws" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$ROOT_DIR/.env.aws"
    set +a
  elif [[ -f "$ROOT_DIR/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$ROOT_DIR/.env"
    set +a
  fi
}

check_prereqs() {
  command -v "$AWS_CLI" >/dev/null 2>&1 || die "AWS CLI not found. Install: winget install Amazon.AWSCLI"
  command -v "$EB_CLI" >/dev/null 2>&1 || die "EB CLI not found. Install: pip install awsebcli"
  command -v docker >/dev/null 2>&1 || die "Docker not found"
  command -v npm >/dev/null 2>&1 || die "npm not found"
  "$AWS_CLI" sts get-caller-identity >/dev/null 2>&1 || die "AWS credentials not configured. Run: aws configure"
  log "AWS identity: $("$AWS_CLI" sts get-caller-identity --query Arn --output text)"
  log "Region: $REGION"
}

save_state() {
  local key="$1" value="$2"
  touch "$STATE_FILE"
  if grep -q "^${key}=" "$STATE_FILE" 2>/dev/null; then
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
      sed -i "s|^${key}=.*|${key}=${value}|" "$STATE_FILE"
    else
      sed -i '' "s|^${key}=.*|${key}=${value}|" "$STATE_FILE"
    fi
  else
    echo "${key}=${value}" >>"$STATE_FILE"
  fi
}

load_state() {
  if [[ -f "$STATE_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$STATE_FILE"
  fi
}

get_default_vpc() {
  "$AWS_CLI" ec2 describe-vpcs \
    --filters Name=isDefault,Values=true \
    --query 'Vpcs[0].VpcId' \
    --output text \
    --region "$REGION"
}

get_default_subnets() {
  local vpc_id="$1"
  "$AWS_CLI" ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$vpc_id" \
    --query 'Subnets[*].SubnetId' \
    --output text \
    --region "$REGION"
}

get_my_ip() {
  curl -s --max-time 10 https://checkip.amazonaws.com | tr -d '\r\n'
}

provision_rds() {
  load_state

  DB_USERNAME="${DB_USERNAME:-postgres}"
  DB_DATABASE="${DB_DATABASE:-productsapi}"
  DB_DATABASE="${DB_DATABASE//-/}"
  DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 24)}"

  if [[ -n "${RDS_ENDPOINT:-}" ]] && "$AWS_CLI" rds describe-db-instances \
    --db-instance-identifier "$RDS_ID" \
    --region "$REGION" >/dev/null 2>&1; then
    log "RDS instance $RDS_ID already exists at $RDS_ENDPOINT"
    return 0
  fi

  local vpc_id subnet_ids my_ip
  vpc_id="$(get_default_vpc)"
  [[ "$vpc_id" != "None" && -n "$vpc_id" ]] || die "No default VPC found in $REGION"
  subnet_ids="$(get_default_subnets "$vpc_id")"
  my_ip="$(get_my_ip)"

  local sg_name="${RDS_ID}-sg"
  local sg_id
  sg_id="$("$AWS_CLI" ec2 describe-security-groups \
    --filters "Name=group-name,Values=$sg_name" "Name=vpc-id,Values=$vpc_id" \
    --query 'SecurityGroups[0].GroupId' \
    --output text \
    --region "$REGION" 2>/dev/null || true)"

  if [[ -z "$sg_id" || "$sg_id" == "None" ]]; then
    log "Creating RDS security group..."
    sg_id="$("$AWS_CLI" ec2 create-security-group \
      --group-name "$sg_name" \
      --description "RDS security group for $RDS_ID" \
      --vpc-id "$vpc_id" \
      --query 'GroupId' \
      --output text \
      --region "$REGION")"
  fi

  log "Allowing PostgreSQL from your IP ($my_ip) for migrations..."
  "$AWS_CLI" ec2 authorize-security-group-ingress \
    --group-id "$sg_id" \
    --protocol tcp \
    --port 5432 \
    --cidr "${my_ip}/32" \
    --region "$REGION" 2>/dev/null || true

  local subnet_group="${RDS_ID}-subnet-group"
  if ! "$AWS_CLI" rds describe-db-subnet-groups \
    --db-subnet-group-name "$subnet_group" \
    --region "$REGION" >/dev/null 2>&1; then
    log "Creating DB subnet group..."
    "$AWS_CLI" rds create-db-subnet-group \
      --db-subnet-group-name "$subnet_group" \
      --db-subnet-group-description "Subnet group for $RDS_ID" \
      --subnet-ids $subnet_ids \
      --region "$REGION"
  fi

  if ! "$AWS_CLI" rds describe-db-instances \
    --db-instance-identifier "$RDS_ID" \
    --region "$REGION" >/dev/null 2>&1; then
    log "Creating RDS PostgreSQL instance ($DB_CLASS)..."
    "$AWS_CLI" rds create-db-instance \
      --db-instance-identifier "$RDS_ID" \
      --db-instance-class "$DB_CLASS" \
      --engine postgres \
      --master-username "$DB_USERNAME" \
      --master-user-password "$DB_PASSWORD" \
      --allocated-storage "$DB_STORAGE" \
      --storage-type gp3 \
      --db-name "$DB_DATABASE" \
      --vpc-security-group-ids "$sg_id" \
      --db-subnet-group-name "$subnet_group" \
      --backup-retention-period 1 \
      --no-multi-az \
      --publicly-accessible \
      --storage-encrypted \
      --region "$REGION"
  fi

  log "Waiting for RDS to become available (5-10 min)..."
  "$AWS_CLI" rds wait db-instance-available \
    --db-instance-identifier "$RDS_ID" \
    --region "$REGION"

  RDS_ENDPOINT="$("$AWS_CLI" rds describe-db-instances \
    --db-instance-identifier "$RDS_ID" \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text \
    --region "$REGION")"

  save_state "RDS_ENDPOINT" "$RDS_ENDPOINT"
  save_state "RDS_SG_ID" "$sg_id"
  save_state "DB_USERNAME" "$DB_USERNAME"
  save_state "DB_PASSWORD" "$DB_PASSWORD"
  save_state "DB_DATABASE" "$DB_DATABASE"

  log "RDS ready: $RDS_ENDPOINT"
}

run_migrations() {
  load_state
  load_env
  [[ -n "${RDS_ENDPOINT:-}" ]] || die "RDS_ENDPOINT not set. Run: ./scripts/aws-deploy.sh rds"

  if [[ ! -f "$ROOT_DIR/.env" ]]; then
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  fi

  export DB_HOST="$RDS_ENDPOINT"
  export DB_PORT=5432
  export DB_USERNAME="${DB_USERNAME:-postgres}"
  export DB_PASSWORD="${DB_PASSWORD:-}"
  export DB_DATABASE="${DB_DATABASE:-productsapi}"
  export DB_DATABASE="${DB_DATABASE//-/}"
  export DB_SSL=true

  [[ -n "$DB_PASSWORD" ]] || die "DB_PASSWORD missing in .aws-deploy-state or .env.aws"

  log "Running migrations against $DB_HOST..."
  npm run migration:run

  if [[ -n "${UNSPLASH_ACCESS_KEY:-}" && -f "$ROOT_DIR/src/db/seed.ts" ]]; then
    log "Seeding products..."
    npm run seed:dev
  else
    log "Skipping local seed (runs automatically on API startup via SeedProductsHandler)"
  fi
}

init_eb() {
  if [[ ! -d "$ROOT_DIR/.elasticbeanstalk" ]]; then
    log "Initializing Elastic Beanstalk..."
    "$EB_CLI" init "$APP_NAME" \
      --region "$REGION" \
      --platform "Docker running on 64bit Amazon Linux 2023"
  else
    log "Elastic Beanstalk already initialized"
  fi
}

create_eb_env() {
  if "$EB_CLI" status "$ENV_NAME" >/dev/null 2>&1; then
    log "EB environment $ENV_NAME already exists"
    return 0
  fi

  log "Creating EB single-instance environment ($INSTANCE_TYPE)..."
  "$EB_CLI" create "$ENV_NAME" \
    --single \
    --instance-type "$INSTANCE_TYPE" \
    --timeout 20 \
    --region "$REGION"
}

set_eb_env_vars() {
  load_state
  load_env

  [[ -n "${RDS_ENDPOINT:-}" ]] || die "RDS_ENDPOINT not set"

  local db_name="${DB_DATABASE:-productsapi}"
  db_name="${db_name//-/}"

  log "Setting EB environment variables..."
  "$EB_CLI" setenv \
    DB_HOST="$RDS_ENDPOINT" \
    DB_PORT=5432 \
    DB_USERNAME="${DB_USERNAME:-postgres}" \
    DB_PASSWORD="${DB_PASSWORD:-}" \
    DB_DATABASE="$db_name" \
    PAYMENT_GATEWAY_API_URL="${PAYMENT_GATEWAY_API_URL:-}" \
    PAYMENT_GATEWAY_PUBLIC_KEY="${PAYMENT_GATEWAY_PUBLIC_KEY:-}" \
    PAYMENT_GATEWAY_PRIVATE_KEY="${PAYMENT_GATEWAY_PRIVATE_KEY:-}" \
    PAYMENT_GATEWAY_EVENTS_KEY="${PAYMENT_GATEWAY_EVENTS_KEY:-}" \
    PAYMENT_GATEWAY_INTEGRITY_KEY="${PAYMENT_GATEWAY_INTEGRITY_KEY:-}" \
    UNSPLASH_API_URL="${UNSPLASH_API_URL:-https://api.unsplash.com}" \
    UNSPLASH_ACCESS_KEY="${UNSPLASH_ACCESS_KEY:-}" \
    DB_SSL=true \
    --environment "$ENV_NAME" \
    --region "$REGION"
}

allow_eb_to_rds() {
  load_state
  [[ -n "${RDS_SG_ID:-}" ]] || die "RDS_SG_ID not set"
  [[ -n "${RDS_ENDPOINT:-}" ]] || die "RDS_ENDPOINT not set"

  local eb_sg
  eb_sg="$("$EB_CLI" status "$ENV_NAME" --region "$REGION" 2>/dev/null | grep 'SecurityGroups:' | awk '{print $2}' || true)"

  if [[ -z "$eb_sg" ]]; then
    local instance_id
    instance_id="$("$AWS_CLI" elasticbeanstalk describe-environment-resources \
      --environment-name "$ENV_NAME" \
      --region "$REGION" \
      --query 'EnvironmentResources.Instances[0].Id' \
      --output text)"
    eb_sg="$("$AWS_CLI" ec2 describe-instances \
      --instance-ids "$instance_id" \
      --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
      --output text \
      --region "$REGION")"
  fi

  [[ -n "$eb_sg" && "$eb_sg" != "None" ]] || die "Could not resolve EB security group"

  log "Allowing EB security group $eb_sg -> RDS on port 5432"
  "$AWS_CLI" ec2 authorize-security-group-ingress \
    --group-id "$RDS_SG_ID" \
    --protocol tcp \
    --port 5432 \
    --source-group "$eb_sg" \
    --region "$REGION" 2>/dev/null || true

  save_state "EB_SG_ID" "$eb_sg"
}

deploy_eb() {
  log "Deploying to Elastic Beanstalk..."
  "$EB_CLI" deploy "$ENV_NAME" --region "$REGION" --timeout 20
}

verify_deployment() {
  local url
  url="$("$EB_CLI" status "$ENV_NAME" --region "$REGION" | grep 'CNAME:' | awk '{print $2}')"
  [[ -n "$url" ]] || die "Could not resolve EB URL"

  save_state "EB_URL" "http://$url"
  log "API URL: http://$url/api"
  log "Swagger: http://$url/docs"

  log "Verifying /docs..."
  curl -sf "http://$url/docs" >/dev/null || die "/docs check failed"

  log "Verifying /api/products..."
  curl -sf "http://$url/api/products" >/dev/null || die "/api/products check failed"

  log "Deployment verified successfully"
  echo ""
  echo "========================================"
  echo "API deployed: http://$url/api"
  echo "Swagger:      http://$url/docs"
  echo "========================================"
}

update_app_env() {
  load_state
  [[ -n "${EB_URL:-}" ]] || die "EB_URL not set"

  local app_env="../app/.env"
  if [[ -f "$app_env" ]]; then
    if grep -q '^EXPO_PUBLIC_API_URL=' "$app_env"; then
      if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        sed -i "s|^EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=${EB_URL}/api|" "$app_env"
      else
        sed -i '' "s|^EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=${EB_URL}/api|" "$app_env"
      fi
    else
      echo "EXPO_PUBLIC_API_URL=${EB_URL}/api" >>"$app_env"
    fi
    log "Updated $app_env with EXPO_PUBLIC_API_URL=${EB_URL}/api"
  fi
}

main() {
  local step="${1:-all}"
  load_env
  check_prereqs

  case "$step" in
    prereqs) ;;
    rds) provision_rds ;;
    migrate) run_migrations ;;
    eb) init_eb; create_eb_env ;;
    env-vars) set_eb_env_vars ;;
    sg) allow_eb_to_rds ;;
    deploy) deploy_eb ;;
    verify) verify_deployment ;;
    app-url) update_app_env ;;
    all)
      provision_rds
      run_migrations
      init_eb
      create_eb_env
      set_eb_env_vars
      allow_eb_to_rds
      deploy_eb
      verify_deployment
      update_app_env
      ;;
    *)
      die "Unknown step: $step. Use: all|rds|migrate|eb|env-vars|sg|deploy|verify|app-url"
      ;;
  esac
}

main "$@"
