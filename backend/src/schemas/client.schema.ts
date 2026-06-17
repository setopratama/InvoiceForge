import { z } from 'zod';

export const ClientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  pic_id: z.string().optional().nullable(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  address: z.string().min(1, 'Address is required'),
  npwp: z.string().optional().nullable(),
  type: z.enum(['corporate', 'individual']),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Client = z.infer<typeof ClientSchema>;
