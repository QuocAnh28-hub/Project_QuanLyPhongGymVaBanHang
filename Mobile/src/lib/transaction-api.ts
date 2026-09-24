import { baseUrl } from './account-api';

export type Transaction = {
  id: string; type: 'PACKAGE' | 'PRODUCT_ORDER'; referenceId: number;
  title: string; amount: number; date: string; status: string;
  paymentMethod: string | null;
};

export async function getTransactionHistory(accountId: number): Promise<Transaction[]> {
  const response = await fetch(`${baseUrl}/thanhtoan/history/account/${accountId}`);
  if (!response.ok) throw new Error('Không tải được lịch sử giao dịch');
  return response.json() as Promise<Transaction[]>;
}
