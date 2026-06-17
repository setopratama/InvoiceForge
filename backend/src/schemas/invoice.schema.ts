import { z } from 'zod';

export const InvoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  detail: z.string().optional().nullable(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  subtotal: z.number().optional(),
});

export const InvoiceSchema = z.object({
  id: z.string().optional(),
  invoice_number: z.string().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  client_id: z.string().min(1, 'Client is required'),
  pic_id: z.string().min(1, 'PIC is required'),
  issue_date: z.string(),
  due_date: z.string(),
  payment_terms: z.number().default(30),
  currency: z.string().default('IDR'),
  items: z.array(InvoiceItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().optional(),
  discount: z.object({
    type: z.enum(['percentage', 'fixed']).default('percentage'),
    value: z.number().default(0),
    amount: z.number().optional(),
  }).optional(),
  tax: z.object({
    ppn: z.number().default(11),
    amount: z.number().optional(),
  }).optional(),
  total: z.number().optional(),
  notes: z.string().optional().nullable(),
  bank_info: z.object({
    bank_name: z.string(),
    account_number: z.string(),
    account_name: z.string(),
  }),
  is_clone: z.boolean().default(false),
  cloned_from: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
