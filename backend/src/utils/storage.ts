import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const BACKEND_DIR = join(__dirname, '..', '..');
export const DATA_DIR = join(BACKEND_DIR, 'data');

export async function readJson<T>(filename: string): Promise<T> {
  const filePath = join(DATA_DIR, filename);
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [] as unknown as T;
    }
    throw error;
  }
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
  const filePath = join(DATA_DIR, filename);
  const dir = dirname(filePath);
  
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
