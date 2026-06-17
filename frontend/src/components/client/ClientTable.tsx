import { useState, useEffect } from 'preact/hooks';
import { Plus, Search, Edit2, Trash2, ExternalLink } from 'lucide-preact';
import { api } from '../../lib/api';

export default function ClientTable() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      await api.deleteClient(id);
      setClients(clients.filter(c => c.id !== id));
    } catch (e: any) {
      console.error('Client Delete failed:', e);
      api.logError({ 
        message: 'Client Delete failed', 
        details: `ID: ${id}, Error: ${e.message}` 
      });
      alert(e.message);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div class="bg-white border border-stone-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search clients..." 
            class="w-full pl-10 pr-4 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 transition-colors"
            value={searchTerm}
            onInput={(e: any) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => window.location.href = '/client/create'}
          class="flex items-center justify-center gap-2 bg-stone-900 text-white py-2 px-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-stone-50 border-b border-stone-200">
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">ID</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Client Name</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Type</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Email</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td colSpan={5} class="px-6 py-12 text-center text-stone-400 text-sm italic">Loading clients...</td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={5} class="px-6 py-12 text-center text-stone-400 text-sm italic">No clients found.</td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} class="hover:bg-stone-50 transition-colors group">
                  <td class="px-6 py-4 text-xs font-mono-industrial text-stone-400">{client.id}</td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-bold text-stone-900">{client.name}</div>
                    <div class="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">{client.address}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${
                      client.type === 'corporate' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-600'
                    }`}>
                      {client.type}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-stone-600">{client.email}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => window.location.href = `/client/${client.id}`}
                        class="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id)}
                        class="p-2 text-stone-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
