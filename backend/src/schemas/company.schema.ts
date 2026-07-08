import { z } from 'zod';

export const CompanySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Company name is required'),
  address: z.string().min(1, 'Address is required'),
  email: z.string().email(),
  phone: z.string().optional(),
  npwp: z.string().optional(),
  bank_info: z.object({
    bank_name: z.string(),
    account_number: z.string(),
    account_name: z.string(),
  }),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Company = z.infer<typeof CompanySchema>;
