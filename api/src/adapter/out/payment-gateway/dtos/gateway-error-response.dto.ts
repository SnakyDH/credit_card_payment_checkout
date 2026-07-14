export interface GatewayErrorResponseDto {
  error?: {
    type?: string;
    reason?: string;
    message?: string | string[];
  };
}
