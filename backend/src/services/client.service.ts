import { readJson, writeJson } from '../utils/storage.js';
import { generateId } from '../utils/id.js';
import type { Client } from '../schemas/client.schema.js';
import type { PIC } from '../schemas/pic.schema.js';

const FILENAME = 'clients.json';

export const ClientService = {
  async getAll() {
    return await readJson<Client[]>(FILENAME);
  },

  async getById(id: string) {
    const clients = await this.getAll();
    return clients.find(c => c.id === id);
  },

  async create(data: Client) {
    const clients = await this.getAll();
    const id = await generateId('CLT', FILENAME);
    const newClient = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    clients.push(newClient);
    await writeJson(FILENAME, clients);
    return newClient;
  },

  async update(id: string, data: Partial<Client>) {
    const clients = await this.getAll();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updatedClient = {
      ...clients[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    clients[index] = updatedClient;
    await writeJson(FILENAME, clients);
    return updatedClient;
  },

  async delete(id: string) {
    const clients = await this.getAll();
    const filteredClients = clients.filter(c => c.id !== id);
    if (clients.length === filteredClients.length) return false;
    
    // Check if client has invoices before deleting
    const invoices = await readJson<any>('invoices.json');
    const hasInvoices = invoices.some((inv: any) => inv.client_id === id);
    if (hasInvoices) {
      throw new Error('CLIENT_HAS_INVOICES');
    }

    await writeJson(FILENAME, filteredClients);
    return true;
  }
};
