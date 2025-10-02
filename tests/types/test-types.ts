import { RequestInit } from '../helpers/mockCtx';

// Tipo para el contexto de prueba
export type TestContext = {
  get: (key: string, defaultValue?: any) => any;
  request: (init: RequestInit) => Promise<any>;
  nodeError: (message: string) => never;
  lastRequest?: RequestInit;
};

// Tipo para los handlers de operaciones
export type OperationHandler = (ctx: TestContext) => Promise<any>;

// Tipos comunes para respuestas de MercadoPago
export interface MercadoPagoError {
  status: number;
  message: string;
  error?: string;
  cause?: string[];
}

// Tipo para simular respuestas de API
export type ApiResponse<T = any> = T | { error: MercadoPagoError };
