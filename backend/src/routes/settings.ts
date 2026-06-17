import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { SettingsSchema } from '../schemas/settings.schema.js';
import { SettingsService } from '../services/settings.service.js';

const settings = new Hono();

settings.get('/', async (c) => {
  const data = await SettingsService.get();
  return c.json({ success: true, data });
});

settings.put('/', zValidator('json', SettingsSchema), async (c) => {
  const data = c.req.valid('json');
  const updated = await SettingsService.update(data);
  return c.json({ success: true, data: updated, message: 'Settings updated successfully' });
});

export default settings;
