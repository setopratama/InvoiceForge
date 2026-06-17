import { readJson, writeJson } from '../utils/storage.js';
import type { Settings } from '../schemas/settings.schema.js';

const FILENAME = 'settings.json';

export const SettingsService = {
  async get() {
    const data = await readJson<Settings>(FILENAME);
    if (!data || (Array.isArray(data) && data.length === 0)) {
       return {
         enable_tax: true,
         ppn: 11,
         currency: "IDR",
         company_name: "PT Software Kita",
         company_address: "Jl. Contoh No. 1, Jakarta",
         company_email: "invoice@softwarekita.co.id",
         company_phone: "021-12345678",
         company_npwp: "01.234.567.8-901.000",
         bank_info: {
           bank_name: "BCA",
           account_number: "1234567890",
           account_name: "PT Software Kita"
         }
       } as Settings;
    }
    return data as unknown as Settings;
  },

  async update(data: Settings) {
    await writeJson(FILENAME, data);
    return data;
  }
};
