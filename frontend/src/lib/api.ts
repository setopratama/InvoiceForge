const BASE_URL = import.meta.env.PUBLIC_API_URL ? import.meta.env.PUBLIC_API_URL.replace('/api', '') : 'http://localhost:3001';
const API_BASE_URL = `${BASE_URL}/api`;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...options?.headers };
  if (!(options?.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'Something went wrong');
  }

  return result.data;
}

export const api = {
  // Invoices
  getInvoices: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return request<any[]>(`/invoices?${query}`);
  },
  getInvoice: (id: string) => request<any>(`/invoices/${id}`),
  createInvoice: (data: any) => request<any>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateInvoice: (id: string, data: any) => request<any>(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInvoice: (id: string) => request<any>(`/invoices/${id}`, { method: 'DELETE' }),
  cloneInvoice: (id: string) => request<any>(`/invoices/${id}/clone`, { method: 'POST' }),
  updateInvoiceStatus: (id: string, status: string) => request<any>(`/invoices/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Clients
  getClients: () => request<any[]>('/clients'),
  getClient: (id: string) => request<any>(`/clients/${id}`),
  createClient: (data: any) => request<any>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: string, data: any) => request<any>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id: string) => request<any>(`/clients/${id}`, { method: 'DELETE' }),

  // PICs
  getPICs: () => request<any[]>('/pics'),
  getPIC: (id: string) => request<any>(`/pics/${id}`),
  createPIC: (data: any) => request<any>('/pics', { method: 'POST', body: JSON.stringify(data) }),
  updatePIC: (id: string, data: any) => request<any>(`/pics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePIC: (id: string) => request<any>(`/pics/${id}`, { method: 'DELETE' }),
  uploadPICSignature: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<any>(`/pics/${id}/upload-signature`, { method: 'POST', body: formData });
  },
  // Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (data: any) => request<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Logs
  logError: (data: { message: string; details?: string }) => request<any>('/logs/error', { method: 'POST', body: JSON.stringify(data) }).catch(() => {}), // Ignore if logging itself fails
  
  BASE_URL,
};
