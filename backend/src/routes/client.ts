import { Hono } from 'hono';
import { ClientService } from '../services/client.service.js';
import { ClientSchema } from '../schemas/client.schema.js';
import { zValidator } from '@hono/zod-validator';

const client = new Hono();

client.get('/', async (c) => {
  const clients = await ClientService.getAll();
  return c.json({ success: true, data: clients });
});

client.get('/:id', async (c) => {
  const id = c.req.param('id');
  const client = await ClientService.getById(id);
  if (!client) {
    return c.json({ success: false, error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found' } }, 404);
  }
  return c.json({ success: true, data: client });
});

client.post('/', zValidator('json', ClientSchema), async (c) => {
  const data = c.req.valid('json');
  const newClient = await ClientService.create(data);
  return c.json({ success: true, data: newClient, message: 'Client created successfully' }, 201);
});

client.put('/:id', zValidator('json', ClientSchema.partial()), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const updatedClient = await ClientService.update(id, data);
  if (!updatedClient) {
    return c.json({ success: false, error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found' } }, 404);
  }
  return c.json({ success: true, data: updatedClient, message: 'Client updated successfully' });
});

client.delete('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const success = await ClientService.delete(id);
    if (!success) {
      return c.json({ success: false, error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found' } }, 404);
    }
    return c.json({ success: true, message: 'Client deleted successfully' });
  } catch (error: any) {
    if (error.message === 'CLIENT_HAS_INVOICES') {
      return c.json({ success: false, error: { code: 'CLIENT_HAS_INVOICES', message: 'Cannot delete client with active invoices' } }, 409);
    }
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, 500);
  }
});

export default client;
