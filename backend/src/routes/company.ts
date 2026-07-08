import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { CompanySchema } from '../schemas/company.schema.js';
import { CompanyService } from '../services/company.service.js';

const company = new Hono();

company.get('/', async (c) => {
  const data = await CompanyService.getAll();
  return c.json({ success: true, data });
});

company.get('/:id', async (c) => {
  const id = c.req.param('id');
  const data = await CompanyService.getById(id);
  if (!data) {
    return c.json({ success: false, error: { code: 'COMPANY_NOT_FOUND', message: 'Company not found' } }, 404);
  }
  return c.json({ success: true, data });
});

company.post('/', zValidator('json', CompanySchema.omit({ id: true, created_at: true, updated_at: true })), async (c) => {
  const data = c.req.valid('json');
  const newCompany = await CompanyService.create(data as any);
  return c.json({ success: true, data: newCompany, message: 'Company created successfully' }, 201);
});

company.put('/:id', zValidator('json', CompanySchema.partial()), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const updatedCompany = await CompanyService.update(id, data);
  if (!updatedCompany) {
    return c.json({ success: false, error: { code: 'COMPANY_NOT_FOUND', message: 'Company not found' } }, 404);
  }
  return c.json({ success: true, data: updatedCompany, message: 'Company updated successfully' });
});

company.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const success = await CompanyService.delete(id);
  if (!success) {
    return c.json({ success: false, error: { code: 'COMPANY_NOT_FOUND', message: 'Company not found' } }, 404);
  }
  return c.json({ success: true, message: 'Company deleted successfully' });
});

export default company;
