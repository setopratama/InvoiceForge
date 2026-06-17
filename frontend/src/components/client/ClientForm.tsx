import { useState, useEffect } from 'preact/hooks';
import { Save, ChevronLeft, Building, Mail, Phone, MapPin, Hash, User } from 'lucide-preact';
import { api } from '../../lib/api';

interface Props {
  clientId?: string;
}

export default function ClientForm({ clientId }: Props) {
  const [loading, setLoading] = useState(!!clientId);
  const [pics, setPics] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    address: '',
    npwp: '',
    type: 'corporate',
    pic_id: ''
  });

  useEffect(() => {
    fetchPICs();
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const fetchPICs = async () => {
    try {
      const data = await api.getPICs();
      setPics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchClient = async () => {
    try {
      const data = await api.getClient(clientId!);
      setFormData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    try {
      if (clientId) {
        await api.updateClient(clientId, formData);
        alert('Client updated successfully');
      } else {
        await api.createClient(formData);
        window.location.href = '/client';
      }
    } catch (e: any) {
      console.error('Client Save failed:', e);
      api.logError({ 
        message: 'Client Operation failed', 
        details: `ID: ${clientId || 'NEW'}, Error: ${e.message}, Data: ${JSON.stringify(formData)}` 
      });
      alert(e.message);
    }
  };

  if (loading) return <div class="p-10 text-center text-stone-400 italic">Loading client...</div>;

  return (
    <form onSubmit={handleSubmit} class="max-w-2xl bg-white border border-stone-200 shadow-sm p-8 space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2 md:col-span-2">
          <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
            <Building className="w-3 h-3" /> Client Name
          </label>
          <input 
            type="text" 
            required
            class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 transition-colors"
            value={formData.name}
            onInput={(e: any) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
            Type
          </label>
          <div class="flex gap-4 pt-2">
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="radio" 
                name="type" 
                value="corporate" 
                checked={formData.type === 'corporate'}
                onChange={() => setFormData({ ...formData, type: 'corporate' })}
              />
              Corporate
            </label>
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="radio" 
                name="type" 
                value="individual" 
                checked={formData.type === 'individual'}
                onChange={() => setFormData({ ...formData, type: 'individual' })}
              />
              Individual
            </label>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
            <User className="w-3 h-3" /> Default PIC
          </label>
          <select 
            class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors"
            value={formData.pic_id}
            onChange={(e: any) => setFormData({ ...formData, pic_id: e.target.value })}
          >
            <option value="">No Default PIC</option>
            {pics.map(p => <option value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
            <Mail className="w-3 h-3" /> Email Address
          </label>
          <input 
            type="email" 
            required
            class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 transition-colors"
            value={formData.email}
            onInput={(e: any) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
            <Phone className="w-3 h-3" /> Phone Number
          </label>
          <input 
            type="text" 
            class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 transition-colors"
            value={formData.phone}
            onInput={(e: any) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div class="space-y-2 md:col-span-2">
          <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Office Address
          </label>
          <textarea 
            required
            class="w-full border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-900 transition-colors resize-none"
            rows={3}
            value={formData.address}
            onInput={(e: any) => setFormData({ ...formData, address: e.target.value })}
          ></textarea>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
            <Hash className="w-3 h-3" /> NPWP (Optional)
          </label>
          <input 
            type="text" 
            class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 font-mono-industrial transition-colors"
            placeholder="00.000.000.0-000.000"
            value={formData.npwp}
            onInput={(e: any) => setFormData({ ...formData, npwp: e.target.value })}
          />
        </div>
      </div>

      <div class="pt-6 border-t border-stone-100 flex justify-end">
        <button 
          type="submit"
          class="flex items-center justify-center gap-2 bg-stone-900 text-white py-3 px-8 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
        >
          <Save className="w-4 h-4" />
          {clientId ? 'Update Client' : 'Save Client'}
        </button>
      </div>
    </form>
  );
}
