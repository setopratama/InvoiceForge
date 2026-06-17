import { useState, useEffect } from 'preact/hooks';
import { Save, Building, CreditCard, Info, Percent } from 'lucide-preact';
import { api } from '../../lib/api';

export default function SettingsForm() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      alert('Pengaturan berhasil disimpan');
    } catch (e: any) {
      console.error('Settings Save failed:', e);
      api.logError({ 
        message: 'Settings Update failed', 
        details: `Error: ${e.message}, Data: ${JSON.stringify(settings)}` 
      });
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div class="p-10 text-center text-stone-400 italic">Memuat pengaturan...</div>;
  if (!settings) return <div class="p-10 text-center text-red-500 italic">Gagal memuat pengaturan.</div>;

  return (
    <form onSubmit={handleSubmit} class="space-y-10">
      {/* PPN & Currency */}
      <section class="bg-white border border-stone-200 p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
          <div class="flex items-center gap-2 text-stone-400">
            <Percent className="w-4 h-4" />
            <span class="text-[10px] font-bold uppercase tracking-widest">Pajak & Mata Uang</span>
          </div>
          <label class="flex items-center gap-3 cursor-pointer">
            <span class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Aktifkan PPN</span>
            <div class="relative">
              <input 
                type="checkbox" 
                class="sr-only" 
                checked={settings.enable_tax}
                onChange={(e: any) => setSettings({ ...settings, enable_tax: e.target.checked })}
              />
              <div class={`block w-10 h-6 rounded-full transition-colors ${settings.enable_tax ? 'bg-stone-900' : 'bg-stone-300'}`}></div>
              <div class={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.enable_tax ? 'translate-x-4' : ''}`}></div>
            </div>
          </label>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class={`space-y-2 transition-opacity ${!settings.enable_tax ? 'opacity-50 pointer-events-none' : ''}`}>
            <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Nilai PPN (%)</label>
            <input 
              type="number"
              class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors font-mono-industrial"
              value={settings.ppn}
              disabled={!settings.enable_tax}
              onInput={(e: any) => setSettings({ ...settings, ppn: parseFloat(e.target.value) })}
            />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Mata Uang</label>
            <input 
              type="text"
              class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors"
              value={settings.currency}
              onInput={(e: any) => setSettings({ ...settings, currency: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* Company Identity */}
      <section class="bg-white border border-stone-200 p-8 space-y-6">
        <div class="flex items-center gap-2 text-stone-400 mb-2">
          <Building className="w-4 h-4" />
          <span class="text-[10px] font-bold uppercase tracking-widest">Identitas Perusahaan</span>
        </div>
        <div class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Nama Perusahaan</label>
            <input 
              type="text"
              class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors font-bold"
              value={settings.company_name}
              onInput={(e: any) => setSettings({ ...settings, company_name: e.target.value })}
            />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Alamat</label>
            <textarea 
              class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors resize-none"
              rows={2}
              value={settings.company_address}
              onInput={(e: any) => setSettings({ ...settings, company_address: e.target.value })}
            ></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Email</label>
              <input 
                type="email"
                class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors"
                value={settings.company_email}
                onInput={(e: any) => setSettings({ ...settings, company_email: e.target.value })}
              />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Nomer Telpon</label>
              <input 
                type="text"
                class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors"
                value={settings.company_phone}
                onInput={(e: any) => setSettings({ ...settings, company_phone: e.target.value })}
              />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">NPWP</label>
              <input 
                type="text"
                class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors font-mono-industrial"
                value={settings.company_npwp}
                onInput={(e: any) => setSettings({ ...settings, company_npwp: e.target.value })}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Default Payment Info */}
      <section class="bg-white border border-stone-200 p-8 space-y-6">
        <div class="flex items-center gap-2 text-stone-400 mb-2">
          <CreditCard className="w-4 h-4" />
          <span class="text-[10px] font-bold uppercase tracking-widest">Informasi Pembayaran Default</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Nama Bank</label>
            <input 
              type="text"
              class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors"
              value={settings.bank_info.bank_name}
              onInput={(e: any) => setSettings({ ...settings, bank_info: { ...settings.bank_info, bank_name: e.target.value } })}
            />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Nomor Rekening</label>
            <input 
              type="text"
              class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors font-mono-industrial"
              value={settings.bank_info.account_number}
              onInput={(e: any) => setSettings({ ...settings, bank_info: { ...settings.bank_info, account_number: e.target.value } })}
            />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Atas Nama</label>
            <input 
              type="text"
              class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors"
              value={settings.bank_info.account_name}
              onInput={(e: any) => setSettings({ ...settings, bank_info: { ...settings.bank_info, account_name: e.target.value } })}
            />
          </div>
        </div>
      </section>

      <div class="flex justify-end pt-6">
        <button 
          type="submit"
          disabled={saving}
          class="flex items-center gap-3 bg-stone-900 text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
        >
          <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
          {saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
        </button>
      </div>
    </form>
  );
}
