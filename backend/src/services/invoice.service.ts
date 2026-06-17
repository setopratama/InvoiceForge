import { readJson, writeJson } from '../utils/storage.js';
import { generateId, generateInvoiceNumber } from '../utils/id.js';
import type { Invoice, InvoiceItem } from '../schemas/invoice.schema.js';

const FILENAME = 'invoices.json';

function calculateInvoice(invoice: Invoice): Invoice {
  const items = invoice.items.map(item => ({
    ...item,
    subtotal: item.quantity * item.unit_price,
  }));

  const subtotal = items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  
  let discountAmount = 0;
  if (invoice.discount) {
    if (invoice.discount.type === 'percentage') {
      discountAmount = (subtotal * invoice.discount.value) / 100;
    } else {
      discountAmount = invoice.discount.value;
    }
  }

  const taxAmount = invoice.tax ? ((subtotal - discountAmount) * invoice.tax.ppn) / 100 : 0;
  const total = subtotal - discountAmount + taxAmount;

  return {
    ...invoice,
    items,
    subtotal,
    discount: invoice.discount ? { ...invoice.discount, amount: discountAmount } : undefined,
    tax: invoice.tax ? { ...invoice.tax, amount: taxAmount } : undefined,
    total,
  };
}

export const InvoiceService = {
  async getAll() {
    return await readJson<Invoice[]>(FILENAME);
  },

  async getById(id: string) {
    const invoices = await this.getAll();
    return invoices.find(inv => inv.id === id);
  },

  async create(data: Invoice) {
    const invoices = await this.getAll();
    const id = await generateId('INV', FILENAME);
    const invoice_number = await generateInvoiceNumber();
    
    const calculated = calculateInvoice(data);
    const newInvoice = {
      ...calculated,
      id,
      invoice_number,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    invoices.push(newInvoice);
    await writeJson(FILENAME, invoices);
    return newInvoice;
  },

  async update(id: string, data: Partial<Invoice>) {
    const invoices = await this.getAll();
    const index = invoices.findIndex(inv => inv.id === id);
    if (index === -1) return null;

    const currentInvoice = invoices[index];
    if (currentInvoice.status === 'paid' || currentInvoice.status === 'cancelled') {
      throw new Error('INVOICE_IMMUTABLE');
    }

    const merged = { ...currentInvoice, ...data };
    const calculated = calculateInvoice(merged as Invoice);
    
    const updatedInvoice = {
      ...calculated,
      updated_at: new Date().toISOString(),
    };
    
    invoices[index] = updatedInvoice;
    await writeJson(FILENAME, invoices);
    return updatedInvoice;
  },

  async updateStatus(id: string, status: Invoice['status']) {
    const invoices = await this.getAll();
    const index = invoices.findIndex(inv => inv.id === id);
    if (index === -1) return null;

    invoices[index].status = status;
    invoices[index].updated_at = new Date().toISOString();
    
    await writeJson(FILENAME, invoices);
    return invoices[index];
  },

  async delete(id: string) {
    const invoices = await this.getAll();
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return false;

    if (invoice.status === 'paid') {
      throw new Error('INVOICE_PAID_CANNOT_DELETE');
    }

    const filteredInvoices = invoices.filter(inv => inv.id !== id);
    await writeJson(FILENAME, filteredInvoices);
    return true;
  },

  async clone(id: string) {
    const original = await this.getById(id);
    if (!original) return null;

    const { id: _, invoice_number: __, status: ___, created_at: ____, updated_at: _____, ...rest } = original;
    
    const clonedData: Invoice = {
      ...(rest as Invoice),
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      is_clone: true,
      cloned_from: id,
    };

    return await this.create(clonedData);
  }
};
