import { useState, useEffect } from 'preact/hooks';
import { Plus, Search, Edit2, Trash2, ShieldCheck } from 'lucide-preact';
import { api } from '../../lib/api';

export default function PICTable() {
  const [pics, setPics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPICs();
  }, []);

  const fetchPICs = async () => {
    try {
      const data = await api.getPICs();
      setPics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PIC?')) return;
    try {
      await api.deletePIC(id);
      setPics(pics.filter(p => p.id !== id));
    } catch (e: any) {
      console.error('PIC Delete failed:', e);
      api.logError({ 
        message: 'PIC Delete failed', 
        details: `ID: ${id}, Error: ${e.message}` 
      });
      alert(e.message);
    }
  };

  const filteredPics = pics.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div class="bg-white border border-stone-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search PICs..." 
            class="w-full pl-10 pr-4 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 transition-colors"
            value={searchTerm}
            onInput={(e: any) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => window.location.href = '/pic/create'}
          class="flex items-center justify-center gap-2 bg-stone-900 text-white py-2 px-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add PIC
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-stone-50 border-b border-stone-200">
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">ID</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Name</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Role / Dept</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Contact</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td colSpan={5} class="px-6 py-12 text-center text-stone-400 text-sm italic">Loading PICs...</td>
              </tr>
            ) : filteredPics.length === 0 ? (
              <tr>
                <td colSpan={5} class="px-6 py-12 text-center text-stone-400 text-sm italic">No PICs found.</td>
              </tr>
            ) : (
              filteredPics.map((pic) => (
                <tr key={pic.id} class="hover:bg-stone-50 transition-colors">
                  <td class="px-6 py-4 text-xs font-mono-industrial text-stone-400">{pic.id}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <div class="text-sm font-bold text-stone-900">{pic.name}</div>
                      {pic.signature_path && <ShieldCheck className="w-3 h-3 text-emerald-500" title="Signature available" />}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-xs font-medium text-stone-900 uppercase tracking-tight">{pic.role}</div>
                    <div class="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">{pic.department || '-'}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-stone-600">{pic.email}</div>
                    <div class="text-[10px] text-stone-400 mt-0.5">{pic.phone || '-'}</div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => window.location.href = `/pic/${pic.id}`}
                        class="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(pic.id)}
                        class="p-2 text-stone-400 hover:text-red-600 transition-colors"
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
