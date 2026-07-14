import { productsApiService } from "@/modules/coffee/services/products-api.service";
import { presignedApiService } from "@/modules/presigned/services/presigned-api.service";
import { transactionApiService } from "@/modules/transaction/services/transaction-api.service";
import { useMemo } from "react";

export interface ApiServices {
  products: typeof productsApiService;
  presigned: typeof presignedApiService;
  transactions: typeof transactionApiService;
}

export function useApi(): ApiServices {
  return useMemo(
    () => ({
      products: productsApiService,
      presigned: presignedApiService,
      transactions: transactionApiService,
    }),
    [],
  );
}
