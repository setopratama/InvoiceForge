import { readJson, writeJson } from '../utils/storage.js';
import { generateId } from '../utils/id.js';
import type { Company } from '../schemas/company.schema.js';

const FILENAME = 'companies.json';

export const CompanyService = {
  async getAll() {
    return await readJson<Company[]>(FILENAME);
  },

  async getById(id: string) {
    const companies = await this.getAll();
    return companies.find(c => c.id === id);
  },

  async create(data: Company) {
    const companies = await this.getAll();
    const id = await generateId('COMP', FILENAME);
    const newCompany = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    companies.push(newCompany);
    await writeJson(FILENAME, companies);
    return newCompany;
  },

  async update(id: string, data: Partial<Company>) {
    const companies = await this.getAll();
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updatedCompany = {
      ...companies[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    companies[index] = updatedCompany;
    await writeJson(FILENAME, companies);
    return updatedCompany;
  },

  async delete(id: string) {
    const companies = await this.getAll();
    const filteredCompanies = companies.filter(c => c.id !== id);
    if (companies.length === filteredCompanies.length) return false;
    await writeJson(FILENAME, filteredCompanies);
    return true;
  },
};
