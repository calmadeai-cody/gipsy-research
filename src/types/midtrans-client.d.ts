declare module 'midtrans-client' {
  export interface SnapOptions {
    isProduction?: boolean
    serverKey?: string
    clientKey?: string
  }

  export interface TransactionResult {
    token: string
    redirect_url: string
  }

  export interface Snap {
    createTransaction(parameter: Record<string, unknown>): Promise<TransactionResult>
    createTransactionToken(parameter: Record<string, unknown>): Promise<string>
    createTransactionRedirectUrl(parameter: Record<string, unknown>): Promise<string>
  }

  export const Snap: {
    new (options: SnapOptions): Snap
  }

  const MidtransClient = { Snap }
  export default MidtransClient
}
