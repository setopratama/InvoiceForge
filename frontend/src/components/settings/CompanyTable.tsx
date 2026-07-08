import { useState, useEffect } from 'preact/hooks';
import { Plus, Edit2, Trash2, X, Save, Building, Mail, Phone, MapPin, Hash, CreditCard } from 'lucide-preact';
import { api } from '../../lib/api';

export default function CompanyTable() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    name: '', address: '', email: '', phone: '', npwp: '',
    bank_info: { bank_name: '', account_number: '', account_name: '' },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', address: '', email: '', phone: '', npwp: '', bank_info: { bank_name: '', account_number: '', account_name: '' } });
    setShowModal(true);
  };

  const openEdit = (company: any) => {
    setEditingId(company.id);
    setForm({
      name: company.name,
      address: company.address,
      email: company.email,
      phone: company.phone || '',
      npwp: company.npwp || '',
      bank_info: { ...company.bank_info },
    });
    setShowModal(true);
  };

  const handleSave = async (e: Event) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.updateCompany(editingId, form);
      } else {
        await api.createCompany(form);
      }
      setShowModal(false);
      fetchCompanies();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus perusahaan ini?')) return;
    try {
      await api.deleteCompany(id);
      setCompanies(companies.filter(c => c.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div class="bg-white border border-stone-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-stone-200 flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-widest text-stone-500">
          {companies.length} Perusahaan
        </span>
        <button
          onClick={openCreate}
          class="flex items-center gap-2 bg-stone-900 text-white py-2 px-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Perusahaan
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-stone-50 border-b border-stone-200">
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Perusahaan</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Email</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Bank</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td colSpan={4} class="px-6 py-12 text-center text-stone-400 text-sm italic">Memuat...</td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={4} class="px-6 py-12 text-center text-stone-400 text-sm italic">Belum ada perusahaan.</td>
              </tr>
            ) : (
              companies.map((c) => (
                <tr key={c.id} class="hover:bg-stone-50 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="text-sm font-bold text-stone-900">{c.name}</div>
                    <div class="text-[10px] text-stone-400 mt-0.5">{c.npwp ? `NPWP: ${c.npwp}` : ''}</div>
                  </td>
                  <td class="px-6 py-4 text-sm text-stone-600">{c.email}</td>
                  <td class="px-6 py-4 text-sm text-stone-600 font-mono-industrial">{c.bank_info?.bank_name} - {c.bank_info?.account_number}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)} class="p-2 text-stone-400 hover:text-stone-900 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} class="p-2 text-stone-400 hover:text-red-600 transition-colors" title="Hapus">
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

      {/* Modal Form */}
      {showModal && (
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div class="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div class="flex items-center justify-between p-6 border-b border-stone-200">
              <h3 class="text-sm font-bold uppercase tracking-widest">
                {editingId ? 'Edit Perusahaan' : 'Tambah Perusahaan'}
              </h3>
              <button onClick={() => setShowModal(false)} class="p-1 text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} class="p-6 space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Nama Perusahaan</label>
                <input required type="text" class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                  value={form.name} onInput={(e: any) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Alamat</label>
                <textarea required rows={2} class="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-900 transition-colors resize-none"
                  value={form.address} onInput={(e: any) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Email</label>
                  <input required type="email" class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                    value={form.email} onInput={(e: any) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Telepon</label>
                  <input type="text" class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                    value={form.phone} onInput={(e: any) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">NPWP (opsional)</label>
                <input type="text" class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 font-mono-industrial transition-colors"
                  value={form.npwp} onInput={(e: any) => setForm({ ...form, npwp: e.target.value })} />
              </div>
              <div class="pt-4 border-t border-stone-100">
                <div class="flex items-center gap-2 text-stone-400 mb-4">
                  <CreditCard className="w-4 h-4" />
                  <span class="text-[10px] font-bold uppercase tracking-widest">Informasi Bank</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="space-y-2">
                    <label class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Nama Bank</label>
                    <input required type="text" class="w-full border-b border-stone-200 py-1 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                      value={form.bank_info.bank_name} onInput={(e: any) => setForm({ ...form, bank_info: { ...form.bank_info, bank_name: e.target.value } })} />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Nomor Rekening</label>
                    <input required type="text" class="w-full border-b border-stone-200 py-1 text-sm focus:outline-none focus:border-stone-900 font-mono-industrial transition-colors"
                      value={form.bank_info.account_number} onInput={(e: any) => setForm({ ...form, bank_info: { ...form.bank_info, account_number: e.target.value } })} />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Atas Nama</label>
                    <input required type="text" class="w-full border-b border-stone-200 py-1 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                      value={form.bank_info.account_name} onInput={(e: any) => setForm({ ...form, bank_info: { ...form.bank_info, account_name: e.target.value } })} />
                  </div>
                </div>
              </div>
              <div class="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  class="py-2 px-6 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  class="flex items-center gap-2 bg-stone-900 text-white py-2 px-6 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
