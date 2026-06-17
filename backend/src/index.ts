import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import * as fs from 'fs';
import * as path from 'path';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from '@hono/node-server/serve-static';
import clientRoutes from './routes/client.js';
import { BACKEND_DIR } from './utils/storage.js';
import picRoutes from './routes/pic.js';
import invoiceRoutes from './routes/invoice.js';
import settingsRoutes from './routes/settings.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: '*', // In production, replace with frontend URL
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// Serve static files from uploads directory
app.use('/uploads/*', serveStatic({ root: BACKEND_DIR }));

// Ensure uploads directory exists
const uploadDir = path.join(BACKEND_DIR, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes
app.route('/api/clients', clientRoutes);
app.route('/api/pics', picRoutes);
app.route('/api/invoices', invoiceRoutes);
app.route('/api/settings', settingsRoutes);

// Frontend Error Logger
app.post('/api/logs/error', async (c) => {
  try {
    const body = await c.req.json();
    const logDir = path.join(BACKEND_DIR, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logMessage = `[${new Date().toISOString()}] FRONTEND ERROR\nMessage: ${body.message}\nDetails: ${body.details || 'N/A'}\n\n`;
    fs.appendFileSync(path.join(logDir, 'error.log'), logMessage);
    
    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false }, 500);
  }
});

// Health check
app.get('/', (c) => c.text('InvoiceForge API is running'));

// Global Error Handler and Logger
app.onError((err, c) => {
  console.error(`[Error] ${c.req.method} ${c.req.url}`, err);
  
  try {
    const logDir = path.join(BACKEND_DIR, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logMessage = `[${new Date().toISOString()}] ${c.req.method} ${c.req.url}\nError: ${err.message}\nStack: ${err.stack}\n\n`;
    fs.appendFileSync(path.join(logDir, 'error.log'), logMessage);
  } catch (logErr) {
    console.error('Failed to write to error log:', logErr);
  }

  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

const port = 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
