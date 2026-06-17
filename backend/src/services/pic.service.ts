import { readJson, writeJson } from '../utils/storage.js';
import { generateId } from '../utils/id.js';
import type { PIC } from '../schemas/pic.schema.js';

const FILENAME = 'pics.json';

export const PICService = {
  async getAll() {
    return await readJson<PIC[]>(FILENAME);
  },

  async getById(id: string) {
    const pics = await this.getAll();
    return pics.find(p => p.id === id);
  },

  async create(data: PIC) {
    console.log('PICService.create called with:', JSON.stringify(data));
    const pics = await this.getAll();
    const id = await generateId('PIC', FILENAME);
    const newPIC = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    pics.push(newPIC);
    await writeJson(FILENAME, pics);
    return newPIC;
  },

  async update(id: string, data: Partial<PIC>) {
    console.log(`PICService.update called for ${id} with:`, JSON.stringify(data));
    const pics = await this.getAll();
    const index = pics.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedPIC = {
      ...pics[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    pics[index] = updatedPIC;
    await writeJson(FILENAME, pics);
    return updatedPIC;
  },

  async delete(id: string) {
    const pics = await this.getAll();
    const filteredPics = pics.filter(p => p.id !== id);
    if (pics.length === filteredPics.length) return false;

    // Check if PIC is assigned to any invoice or client
    const invoices = await readJson<any>('invoices.json');
    const hasInvoices = invoices.some((inv: any) => inv.pic_id === id);
    if (hasInvoices) {
      throw new Error('PIC_IS_ASSIGNED');
    }

    const clients = await readJson<any>('clients.json');
    const hasClients = clients.some((clt: any) => clt.pic_id === id);
    if (hasClients) {
      throw new Error('PIC_IS_ASSIGNED');
    }

    await writeJson(FILENAME, filteredPics);
    return true;
  }
};
