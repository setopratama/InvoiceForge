import { Hono } from 'hono';
import { PICService } from '../services/pic.service.js';
import { PICSchema } from '../schemas/pic.schema.js';
import { zValidator } from '@hono/zod-validator';
import * as fs from 'fs';
import * as path from 'path';
import { BACKEND_DIR } from '../utils/storage.js';

const pic = new Hono();

pic.get('/', async (c) => {
  const pics = await PICService.getAll();
  return c.json({ success: true, data: pics });
});

pic.get('/:id', async (c) => {
  const id = c.req.param('id');
  const pic = await PICService.getById(id);
  if (!pic) {
    return c.json({ success: false, error: { code: 'PIC_NOT_FOUND', message: 'PIC not found' } }, 404);
  }
  return c.json({ success: true, data: pic });
});

pic.post('/', zValidator('json', PICSchema, (result, c) => {
  if (!result.success) {
    console.error('PIC POST Validation failed:', result.error);
    return c.json({ success: false, error: { message: 'Validation failed', details: result.error } }, 400);
  }
}), async (c) => {
  const data = c.req.valid('json');
  console.log('PIC POST handler called with data:', JSON.stringify(data));
  const newPIC = await PICService.create(data);
  return c.json({ success: true, data: newPIC, message: 'PIC created successfully' }, 201);
});

pic.put('/:id', zValidator('json', PICSchema.partial(), (result, c) => {
  if (!result.success) {
    console.error('PIC PUT Validation failed:', result.error);
    return c.json({ success: false, error: { message: 'Validation failed', details: result.error } }, 400);
  }
}), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  console.log(`PIC PUT handler called for ${id} with data:`, JSON.stringify(data));
  const updatedPIC = await PICService.update(id, data);
  if (!updatedPIC) {
    return c.json({ success: false, error: { code: 'PIC_NOT_FOUND', message: 'PIC not found' } }, 404);
  }
  return c.json({ success: true, data: updatedPIC, message: 'PIC updated successfully' });
});

pic.delete('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const success = await PICService.delete(id);
    if (!success) {
      return c.json({ success: false, error: { code: 'PIC_NOT_FOUND', message: 'PIC not found' } }, 404);
    }
    return c.json({ success: true, message: 'PIC deleted successfully' });
  } catch (error: any) {
    if (error.message === 'PIC_IS_ASSIGNED') {
      return c.json({ success: false, error: { code: 'PIC_IS_ASSIGNED', message: 'PIC is currently assigned to client or invoice' } }, 409);
    }
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, 500);
  }
});

pic.post('/:id/upload-signature', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.parseBody();
  const file = body['file'] as File;

  if (!file) {
    return c.json({ success: false, message: 'No file uploaded' }, 400);
  }

  const pic = await PICService.getById(id);
  if (!pic) {
    return c.json({ success: false, message: 'PIC not found' }, 404);
  }

  const fileName = `${id}_signature_${Date.now()}${path.extname(file.name)}`;
  const filePath = path.join(BACKEND_DIR, 'uploads', fileName);
  const fileBuffer = await file.arrayBuffer();

  fs.writeFileSync(filePath, Buffer.from(fileBuffer));

  const signaturePath = `/uploads/${fileName}`;
  await PICService.update(id, { signature_path: signaturePath });

  return c.json({ 
    success: true, 
    data: { signature_path: signaturePath },
    message: 'Signature uploaded successfully' 
  });
});

export default pic;
