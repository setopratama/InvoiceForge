import { readJson } from './storage.js';

export async function generateId(prefix: string, filename: string): Promise<string> {
  const data = await readJson<any[]>(filename);
  if (data.length === 0) return `${prefix}-001`;

  const ids = data.map(item => {
    const parts = item.id.split('-');
    return parseInt(parts[parts.length - 1], 10);
  });
  
  const maxId = Math.max(...ids);
  const nextId = String(maxId + 1).padStart(3, '0');
  return `${prefix}-${nextId}`;
}

export async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `INV/${year}/${month}/`;

  const invoices = await readJson<any[]>('invoices.json');
  
  // Filter invoices from the same month and year
  const monthlyInvoices = invoices.filter((inv: any) => 
    inv.invoice_number && inv.invoice_number.startsWith(prefix)
  );

  let nextSeq = 1;
  if (monthlyInvoices.length > 0) {
    const sequences = monthlyInvoices.map((inv: any) => {
      const parts = inv.invoice_number.split('/');
      return parseInt(parts[parts.length - 1], 10);
    });
    nextSeq = Math.max(...sequences) + 1;
  }

  return `${prefix}${String(nextSeq).padStart(3, '0')}`;
}
