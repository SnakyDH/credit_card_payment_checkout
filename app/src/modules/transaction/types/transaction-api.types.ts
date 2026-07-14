import { PresignedType } from "@/modules/presigned/types/presigned-api.types";

export enum TransactionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface PresignedDocument {
  url: string;
  type: PresignedType | string;
  token: string;
}

export interface InitTransactionRequest {
  productId: number;
  quantity: number;
  presignedDocuments: PresignedDocument[];
}

export interface InitTransactionResponse {
  transactionId: number;
  status: TransactionStatus;
  productId: number;
  quantity: number;
  total?: number;
  deliveryId?: number;
  presignedDocuments: PresignedDocument[];
  createdAt: string;
}

export interface PaymentCard {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  holderName: string;
}

export interface DeliveryRequest {
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  customerEmail: string;
  customer: string;
}

export interface FinishTransactionRequest {
  transactionId: number;
  paymentCard: PaymentCard;
  delivery: DeliveryRequest;
}

export interface FinishTransactionResponse {
  id: number;
  total: number;
  status: string;
  deliveryFee: number;
  product: {
    name: string;
    quantity: number;
  };
}

export interface TransactionProduct {
  id: number;
  name: string;
  image: string;
  price: number;
}

export interface TransactionDelivery {
  id: number;
  address: string;
  city: string;
  postalCode: string;
}

export interface GetTransactionByIdResponse {
  id: number;
  paymentGatewayTransactionId?: string;
  quantity: number;
  total?: number;
  status: string;
  createdAt: string;
  products: TransactionProduct[];
  delivery?: TransactionDelivery;
  acceptanceEndUserPolicy?: PresignedDocument;
  acceptancePersonalDataAuthorization?: PresignedDocument;
}
