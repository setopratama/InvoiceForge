import { Hono } from 'hono';
import { InvoiceService } from '../services/invoice.service.js';
import { InvoiceSchema } from '../schemas/invoice.schema.js';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const invoice = new Hono();

invoice.get('/', async (c) => {
  const status = c.req.query('status');
  const clientId = c.req.query('client_id');
  const search = c.req.query('search');

  let invoices = await InvoiceService.getAll();

  if (status) {
    invoices = invoices.filter(inv => inv.status === status);
  }
  if (clientId) {
    invoices = invoices.filter(inv => inv.client_id === clientId);
  }
  if (search) {
    const lowerSearch = search.toLowerCase();
    invoices = invoices.filter(inv => 
      (inv.invoice_number && inv.invoice_number.toLowerCase().includes(lowerSearch)) ||
      (inv.notes && inv.notes.toLowerCase().includes(lowerSearch))
    );
  }

  return c.json({ success: true, data: invoices });
});

invoice.get('/:id', async (c) => {
  const id = c.req.param('id');
  const inv = await InvoiceService.getById(id);
  if (!inv) {
    return c.json({ success: false, error: { code: 'INVOICE_NOT_FOUND', message: 'Invoice not found' } }, 404);
  }
  return c.json({ success: true, data: inv });
});

invoice.post('/', zValidator('json', InvoiceSchema), async (c) => {
  const data = c.req.valid('json');
  const newInvoice = await InvoiceService.create(data);
  return c.json({ success: true, data: newInvoice, message: 'Invoice created successfully' }, 201);
});

invoice.put('/:id', zValidator('json', InvoiceSchema.partial()), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  try {
    const updatedInvoice = await InvoiceService.update(id, data);
    if (!updatedInvoice) {
      return c.json({ success: false, error: { code: 'INVOICE_NOT_FOUND', message: 'Invoice not found' } }, 404);
    }
    return c.json({ success: true, data: updatedInvoice, message: 'Invoice updated successfully' });
  } catch (error: any) {
    if (error.message === 'INVOICE_IMMUTABLE') {
      return c.json({ success: false, error: { code: 'INVOICE_IMMUTABLE', message: 'Paid or cancelled invoices cannot be edited' } }, 403);
    }
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, 500);
  }
});

invoice.patch('/:id/status', zValidator('json', z.object({ status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']) })), async (c) => {
  const id = c.req.param('id');
  const { status } = c.req.valid('json');
  const updatedInvoice = await InvoiceService.updateStatus(id, status);
  if (!updatedInvoice) {
    return c.json({ success: false, error: { code: 'INVOICE_NOT_FOUND', message: 'Invoice not found' } }, 404);
  }
  return c.json({ success: true, data: updatedInvoice, message: 'Status updated successfully' });
});

invoice.post('/:id/clone', async (c) => {
  const id = c.req.param('id');
  const cloned = await InvoiceService.clone(id);
  if (!cloned) {
    return c.json({ success: false, error: { code: 'INVOICE_NOT_FOUND', message: 'Original invoice not found' } }, 404);
  }
  return c.json({ success: true, data: cloned, message: 'Invoice cloned successfully' }, 201);
});

invoice.delete('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const success = await InvoiceService.delete(id);
    if (!success) {
      return c.json({ success: false, error: { code: 'INVOICE_NOT_FOUND', message: 'Invoice not found' } }, 404);
    }
    return c.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error: any) {
    if (error.message === 'INVOICE_PAID_CANNOT_DELETE') {
      return c.json({ success: false, error: { code: 'INVOICE_PAID_CANNOT_DELETE', message: 'Paid invoices cannot be deleted' } }, 403);
    }
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, 500);
  }
});

export default invoice;
