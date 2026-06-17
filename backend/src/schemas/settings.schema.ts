import { z } from 'zod';

export const SettingsSchema = z.object({
  enable_tax: z.boolean().default(true),
  ppn: z.number().min(0).max(100),
  currency: z.string().default('IDR'),
  company_name: z.string().min(1),
  company_address: z.string().min(1),
  company_email: z.string().email(),
  company_phone: z.string().optional(),
  company_npwp: z.string().optional(),
  bank_info: z.object({
    bank_name: z.string(),
    account_number: z.string(),
    account_name: z.string(),
  })
});

export type Settings = z.infer<typeof SettingsSchema>;
