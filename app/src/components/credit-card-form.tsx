import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { CardBrandLogos } from "@/components/card-brand-logos";
import { ThemedText } from "@/components/themed-text";
import { Toast } from "@/components/toast";
import { CoffeePalette, Spacing } from "@/constants/theme";
import { CurrencyFormatter } from "@/formatters/currency-formatter";
import { isTransactionRejectedError } from "@/modules/shared/api/error-messages";
import {
  finishTransaction,
  initTransaction,
} from "@/modules/transaction/store/transaction.thunk";
import {
  resetTransaction,
  setTransactionResult,
} from "@/modules/transaction/store/transaction.slice";
import {
  DeliveryRequest,
  PaymentCard,
  PresignedDocument,
  TransactionStatus,
} from "@/modules/transaction/types/transaction-api.types";
import {
  CardBrand,
  detectCardBrand,
  formatCardNumber,
  isExpiryValid,
  luhnIsValid,
  maskCardNumber,
  onlyDigits,
} from "@/modules/transaction/utils/card-brand";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export type CheckoutStep = "form" | "summary";

type CardFieldKey = keyof PaymentCard;
type DeliveryFieldKey = keyof DeliveryRequest;
type FieldKey = CardFieldKey | DeliveryFieldKey;

interface CreditCardFormProps {
  productId: string;
  quantity: number;
  productName: string;
  unitPrice: number;
  presignedDocuments: PresignedDocument[];
  onStepChange?: (step: CheckoutStep) => void;
  onCompleted?: () => void;
}

interface CheckoutFormValues {
  paymentCard: PaymentCard;
  delivery: DeliveryRequest;
}

interface FormErrors {
  number?: string;
  holderName?: string;
  expMonth?: string;
  expYear?: string;
  cvc?: string;
  customer?: string;
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  customerEmail?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(values: CheckoutFormValues): FormErrors {
  const errors: FormErrors = {};
  const { paymentCard, delivery } = values;
  const digits = onlyDigits(paymentCard.number);
  const brand = detectCardBrand(digits);

  if (digits.length !== 16) {
    errors.number = "El número debe tener 16 dígitos";
  } else if (brand === CardBrand.UNKNOWN) {
    errors.number = "Solo se aceptan tarjetas Visa o Mastercard";
  } else if (!luhnIsValid(digits)) {
    errors.number = "Número de tarjeta inválido";
  }

  if (!paymentCard.holderName.trim()) {
    errors.holderName = "Ingresa el nombre del titular";
  }

  if (!isExpiryValid(paymentCard.expMonth, paymentCard.expYear)) {
    errors.expMonth = "Fecha de vencimiento inválida";
  }

  if (!/^\d{3,4}$/.test(paymentCard.cvc)) {
    errors.cvc = "CVC inválido";
  }

  if (!delivery.customer.trim()) {
    errors.customer = "Ingresa el nombre del destinatario";
  }

  if (!delivery.address.trim()) {
    errors.address = "Ingresa la dirección";
  }

  if (!delivery.city.trim()) {
    errors.city = "Ingresa la ciudad";
  }

  if (!delivery.region.trim()) {
    errors.region = "Ingresa la región";
  }

  if (!delivery.country.trim()) {
    errors.country = "Ingresa el país";
  }

  const postalDigits = onlyDigits(delivery.postalCode);
  if (!postalDigits) {
    errors.postalCode = "Ingresa el código postal";
  }

  const phoneDigits = onlyDigits(delivery.phone);
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phone = "Teléfono inválido (7-15 dígitos)";
  }

  if (!delivery.customerEmail.trim()) {
    errors.customerEmail = "Ingresa el correo electrónico";
  } else if (!EMAIL_REGEX.test(delivery.customerEmail.trim())) {
    errors.customerEmail = "Correo electrónico inválido";
  }

  return errors;
}

function markAllTouched(): Partial<Record<FieldKey, boolean>> {
  return {
    number: true,
    holderName: true,
    expMonth: true,
    expYear: true,
    cvc: true,
    customer: true,
    address: true,
    city: true,
    region: true,
    postalCode: true,
    country: true,
    phone: true,
    customerEmail: true,
  };
}

export function CreditCardForm({
  productId,
  quantity,
  productName,
  unitPrice,
  presignedDocuments,
  onStepChange,
  onCompleted,
}: CreditCardFormProps) {
  const dispatch = useAppDispatch();
  const { initStatus, finishStatus, init } = useAppSelector(
    (state) => state.transaction,
  );

  const [step, setStep] = useState<CheckoutStep>("form");
  const [toast, setToast] = useState<string | null>(null);
  const [number, setNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country] = useState("CO");
  const [phone, setPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>(
    {},
  );

  useEffect(() => {
    dispatch(resetTransaction());
  }, [dispatch]);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  const brand = detectCardBrand(onlyDigits(number));

  const formValues: CheckoutFormValues = useMemo(
    () => ({
      paymentCard: {
        number: onlyDigits(number),
        holderName: holderName.trim(),
        expMonth,
        expYear,
        cvc,
      },
      delivery: {
        customer: customer.trim(),
        address: address.trim(),
        city: city.trim(),
        region: region.trim(),
        postalCode: onlyDigits(postalCode),
        country: country.trim(),
        phone: onlyDigits(phone),
        customerEmail: customerEmail.trim(),
      },
    }),
    [
      number,
      holderName,
      expMonth,
      expYear,
      cvc,
      customer,
      address,
      city,
      region,
      postalCode,
      country,
      phone,
      customerEmail,
    ],
  );

  const errors = useMemo(() => validateForm(formValues), [formValues]);
  const isValid = Object.keys(errors).length === 0;
  const isInitLoading = initStatus === "loading";
  const isFinishLoading = finishStatus === "loading";

  const markTouched = (field: FieldKey) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleContinue = async () => {
    setTouched(markAllTouched());

    if (!isValid) {
      return;
    }

    const action = await dispatch(
      initTransaction({
        productId: Number(productId),
        quantity,
        presignedDocuments,
      }),
    );

    if (initTransaction.fulfilled.match(action)) {
      setStep("summary");
      return;
    }

    setToast(action.payload ?? "No se pudo iniciar la transacción");
  };

  const handleConfirmPayment = async () => {
    if (!init) {
      return;
    }

    const action = await dispatch(
      finishTransaction({
        transactionId: init.transactionId,
        paymentCard: formValues.paymentCard,
        delivery: formValues.delivery,
      }),
    );

    if (finishTransaction.fulfilled.match(action)) {
      onCompleted?.();
      return;
    }

    const message = action.payload ?? "No se pudo completar el pago";

    if (isTransactionRejectedError(message)) {
      dispatch(
        setTransactionResult({
          id: init.transactionId,
          total: init.total ?? unitPrice * quantity,
          status: TransactionStatus.REJECTED,
          deliveryFee: 0,
          product: { name: productName, quantity },
        }),
      );
      onCompleted?.();
      return;
    }

    setToast(message);
  };

  const renderFieldError = (field: FieldKey, message?: string) =>
    touched[field] && message ? (
      <ThemedText type="small" style={styles.errorText}>
        {message}
      </ThemedText>
    ) : null;

  const renderFormStep = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <ThemedText type="default" style={styles.title}>
        Tarjeta de crédito
      </ThemedText>

      <CardBrandLogos activeBrand={brand} />

      <View style={styles.fieldGroup}>
        <ThemedText type="small" style={styles.label}>
          Número de tarjeta
        </ThemedText>
        <TextInput
          style={styles.input}
          value={number}
          onChangeText={(value) => setNumber(formatCardNumber(value))}
          onBlur={() => markTouched("number")}
          keyboardType="number-pad"
          maxLength={19}
          placeholder="4111 1111 1111 1111"
          placeholderTextColor={CoffeePalette.mutedText}
        />
        {renderFieldError("number", errors.number)}
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText type="small" style={styles.label}>
          Nombre del titular
        </ThemedText>
        <TextInput
          style={styles.input}
          value={holderName}
          onChangeText={setHolderName}
          onBlur={() => markTouched("holderName")}
          autoCapitalize="characters"
          placeholder="NOMBRE APELLIDO"
          placeholderTextColor={CoffeePalette.mutedText}
        />
        {renderFieldError("holderName", errors.holderName)}
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.rowField]}>
          <ThemedText type="small" style={styles.label}>
            Mes
          </ThemedText>
          <TextInput
            style={styles.input}
            value={expMonth}
            onChangeText={(value) => setExpMonth(onlyDigits(value).slice(0, 2))}
            onBlur={() => markTouched("expMonth")}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="MM"
            placeholderTextColor={CoffeePalette.mutedText}
          />
        </View>

        <View style={[styles.fieldGroup, styles.rowField]}>
          <ThemedText type="small" style={styles.label}>
            Año
          </ThemedText>
          <TextInput
            style={styles.input}
            value={expYear}
            onChangeText={(value) => setExpYear(onlyDigits(value).slice(0, 2))}
            onBlur={() => markTouched("expYear")}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="YY"
            placeholderTextColor={CoffeePalette.mutedText}
          />
        </View>

        <View style={[styles.fieldGroup, styles.rowField]}>
          <ThemedText type="small" style={styles.label}>
            CVC
          </ThemedText>
          <TextInput
            style={styles.input}
            value={cvc}
            onChangeText={(value) => setCvc(onlyDigits(value).slice(0, 4))}
            onBlur={() => markTouched("cvc")}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="123"
            placeholderTextColor={CoffeePalette.mutedText}
            secureTextEntry
          />
        </View>
      </View>

      {(touched.expMonth || touched.expYear) && errors.expMonth ? (
        <ThemedText type="small" style={styles.errorText}>
          {errors.expMonth}
        </ThemedText>
      ) : null}

      {renderFieldError("cvc", errors.cvc)}

      <ThemedText type="default" style={[styles.title, styles.sectionTitle]}>
        Datos de entrega
      </ThemedText>

      <View style={styles.fieldGroup}>
        <ThemedText type="small" style={styles.label}>
          Destinatario
        </ThemedText>
        <TextInput
          style={styles.input}
          value={customer}
          onChangeText={setCustomer}
          onBlur={() => markTouched("customer")}
          autoCapitalize="words"
          placeholder="Nombre completo"
          placeholderTextColor={CoffeePalette.mutedText}
        />
        {renderFieldError("customer", errors.customer)}
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText type="small" style={styles.label}>
          Dirección
        </ThemedText>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          onBlur={() => markTouched("address")}
          autoCapitalize="words"
          placeholder="Calle, número, apartamento"
          placeholderTextColor={CoffeePalette.mutedText}
        />
        {renderFieldError("address", errors.address)}
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.rowField]}>
          <ThemedText type="small" style={styles.label}>
            Ciudad
          </ThemedText>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            onBlur={() => markTouched("city")}
            autoCapitalize="words"
            placeholder="Ciudad"
            placeholderTextColor={CoffeePalette.mutedText}
          />
          {renderFieldError("city", errors.city)}
        </View>

        <View style={[styles.fieldGroup, styles.rowField]}>
          <ThemedText type="small" style={styles.label}>
            Región
          </ThemedText>
          <TextInput
            style={styles.input}
            value={region}
            onChangeText={setRegion}
            onBlur={() => markTouched("region")}
            autoCapitalize="words"
            placeholder="Región"
            placeholderTextColor={CoffeePalette.mutedText}
          />
          {renderFieldError("region", errors.region)}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.rowField]}>
          <ThemedText type="small" style={styles.label}>
            Código postal
          </ThemedText>
          <TextInput
            style={styles.input}
            value={postalCode}
            onChangeText={(value) => setPostalCode(onlyDigits(value))}
            onBlur={() => markTouched("postalCode")}
            keyboardType="number-pad"
            placeholder="110111"
            placeholderTextColor={CoffeePalette.mutedText}
          />
          {renderFieldError("postalCode", errors.postalCode)}
        </View>

        <View style={[styles.fieldGroup, styles.rowField]}>
          <ThemedText type="small" style={styles.label}>
            País
          </ThemedText>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={country}
            editable={false}
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText type="small" style={styles.label}>
          Teléfono
        </ThemedText>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={(value) => setPhone(onlyDigits(value).slice(0, 15))}
          onBlur={() => markTouched("phone")}
          keyboardType="phone-pad"
          placeholder="3001234567"
          placeholderTextColor={CoffeePalette.mutedText}
        />
        {renderFieldError("phone", errors.phone)}
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText type="small" style={styles.label}>
          Correo electrónico
        </ThemedText>
        <TextInput
          style={styles.input}
          value={customerEmail}
          onChangeText={setCustomerEmail}
          onBlur={() => markTouched("customerEmail")}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="correo@ejemplo.com"
          placeholderTextColor={CoffeePalette.mutedText}
        />
        {renderFieldError("customerEmail", errors.customerEmail)}
      </View>

      <Pressable
        style={[
          styles.submitButton,
          (!isValid || isInitLoading) && styles.submitButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={!isValid || isInitLoading}
      >
        {isInitLoading ? (
          <ActivityIndicator color={CoffeePalette.warmWhite} />
        ) : (
          <ThemedText type="default" style={styles.submitButtonText}>
            Continuar
          </ThemedText>
        )}
      </Pressable>
    </ScrollView>
  );

  const renderSummaryStep = () => {
    const summaryTotal = init?.total ?? unitPrice * quantity;
    const cardBrand = detectCardBrand(formValues.paymentCard.number);

    return (
      <View style={styles.stepContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryContainer}>
            <ThemedText type="default" style={styles.title}>
              Resumen de pago
            </ThemedText>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View>
                  <ThemedText type="small" style={styles.summaryLabel}>
                    Producto
                  </ThemedText>
                  <ThemedText type="default" style={styles.summaryValue}>
                    {productName}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="small" style={styles.summaryLabel}>
                    Cantidad
                  </ThemedText>
                  <ThemedText type="default" style={styles.summaryValue}>
                    {quantity}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="small" style={styles.summaryLabel}>
                Precio unitario
              </ThemedText>
              <ThemedText type="default" style={styles.summaryValue}>
                {CurrencyFormatter.format(unitPrice)}
              </ThemedText>

              <ThemedText type="small" style={styles.summaryLabel}>
                Total
              </ThemedText>
              <ThemedText type="title" style={styles.summaryTotal}>
                {CurrencyFormatter.format(summaryTotal)}
              </ThemedText>
            </View>

            <View style={styles.summaryCard}>
              <ThemedText type="small" style={styles.summaryLabel}>
                Entrega
              </ThemedText>
              <ThemedText type="default" style={styles.summaryValue}>
                {formValues.delivery.customer}
              </ThemedText>
              <ThemedText type="small" style={styles.summaryText}>
                {formValues.delivery.address}, {formValues.delivery.city}
              </ThemedText>
            </View>

            <View style={styles.summaryCard}>
              <ThemedText type="small" style={styles.summaryLabel}>
                Tarjeta
              </ThemedText>
              <ThemedText type="default" style={styles.summaryValue}>
                {maskCardNumber(formValues.paymentCard.number)}
              </ThemedText>
              <ThemedText type="small" style={styles.summaryText}>
                {cardBrand === CardBrand.UNKNOWN ? "Tarjeta" : cardBrand}
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.submitButton,
              styles.footerButton,
              isFinishLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleConfirmPayment}
            disabled={isFinishLoading}
          >
            <ThemedText type="default" style={styles.submitButtonText}>
              Confirmar y pagar
            </ThemedText>
          </Pressable>
        </View>

        <Modal visible={isFinishLoading} transparent animationType="fade">
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={CoffeePalette.forest} />
              <ThemedText type="default" style={styles.loadingText}>
                Procesando pago...
              </ThemedText>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {step === "form" && renderFormStep()}
      {step === "summary" && renderSummaryStep()}
      <Toast message={toast} onHide={() => setToast(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    position: "relative",
  },
  scrollView: {
    flex: 1,
  },
  container: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  title: {
    color: CoffeePalette.forest,
    fontWeight: "600",
  },
  sectionTitle: {
    marginTop: Spacing.two,
  },
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.two,
    justifyContent: "space-between",
  },
  summaryContainer: {
    gap: Spacing.three,
  },
  badgeRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  fieldGroup: {
    gap: Spacing.one,
  },
  label: {
    color: CoffeePalette.forest,
    fontWeight: "600",
  },
  input: {
    backgroundColor: CoffeePalette.warmWhite,
    borderWidth: 1,
    borderColor: CoffeePalette.beige,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    color: CoffeePalette.charcoal,
  },
  inputDisabled: {
    backgroundColor: CoffeePalette.beige,
    color: CoffeePalette.mutedText,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  rowField: {
    flex: 1,
  },
  errorText: {
    color: CoffeePalette.coffee,
  },
  submitButton: {
    backgroundColor: CoffeePalette.forest,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: "center",
    marginTop: Spacing.two,
  },
  footer: {
    paddingTop: Spacing.three,
  },
  footerButton: {
    marginTop: 0,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingBox: {
    backgroundColor: CoffeePalette.warmWhite,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    minWidth: 200,
    shadowColor: CoffeePalette.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingText: {
    color: CoffeePalette.forest,
    fontWeight: "600",
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    color: CoffeePalette.warmWhite,
    fontWeight: "bold",
  },
  secondaryButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: "center",
    borderWidth: 1,
    borderColor: CoffeePalette.forest,
  },
  secondaryButtonText: {
    color: CoffeePalette.forest,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: CoffeePalette.cream,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  summaryLabel: {
    color: CoffeePalette.mutedText,
    marginTop: Spacing.one,
  },
  summaryValue: {
    color: CoffeePalette.forest,
    fontWeight: "600",
  },
  summaryText: {
    color: CoffeePalette.charcoal,
  },
  summaryTotal: {
    color: CoffeePalette.coffee,
  },
});
