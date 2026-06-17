import { useState, useEffect } from 'preact/hooks';
import { Save, User, Mail, Phone, Briefcase, Building, FileUp, Trash2 } from 'lucide-preact';
import { api } from '../../lib/api';

interface Props {
  picId?: string;
}

export default function PICForm({ picId }: Props) {
  const [loading, setLoading] = useState(!!picId);
  const [formData, setFormData] = useState<any>({
    name: '',
    role: '',
    department: '',
    email: '',
    phone: '',
    signature_path: null
  });
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (picId) {
      fetchPIC();
    }
  }, [picId]);

  const fetchPIC = async () => {
    try {
      const data = await api.getPIC(picId!);
      setFormData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureFile(file);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log('PICForm handleSubmit. picId:', picId, 'formData:', formData);
    setSaving(true);
    try {
      let currentId = picId;
      if (picId) {
        await api.updatePIC(picId, formData);
      } else {
        const newPIC = await api.createPIC(formData);
        currentId = newPIC.id;
      }

      if (signatureFile && currentId) {
        setUploading(true);
        await api.uploadPICSignature(currentId, signatureFile);
        setUploading(false);
      }

      if (picId) {
        alert('PIC updated successfully');
        fetchPIC();
        setSignatureFile(null);
      } else {
        window.location.href = '/pic';
      }
    } catch (e: any) {
      console.error('PIC Save failed:', e);
      api.logError({ 
        message: 'PIC Operation failed', 
        details: `ID: ${picId || 'NEW'}, Error: ${e.message}` 
      });
      alert(e.message);
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div class="p-10 text-center text-stone-400 italic">Loading PIC...</div>;

  return (
    <form onSubmit={handleSubmit} class="max-w-2xl bg-white border border-stone-200 shadow-sm p-8 space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2 md:col-span-2">
          <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
            <User className="w-3 h-3" /> Full Name
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
            <Briefcase className="w-3 h-3" /> Role / Position
          </label>
          <input 
            type="text" 
            placeholder="e.g. Project Manager"
            class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 transition-colors"
            value={formData.role}
            onInput={(e: any) => setFormData({ ...formData, role: e.target.value })}
          />
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
            <Building className="w-3 h-3" /> Department
          </label>
          <input 
            type="text" 
            placeholder="e.g. Delivery"
            class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 transition-colors"
            value={formData.department}
            onInput={(e: any) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
            <Mail className="w-3 h-3" /> Email Address
          </label>
          <input 
            type="email" 
            placeholder="e.g. name@company.com"
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

        <div class="space-y-4 md:col-span-2 pt-4 border-t border-stone-100">
          <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
            <FileUp className="w-3 h-3" /> Digital Signature
          </label>
          
          <div class="flex items-start gap-6">
            <div class="flex-1">
              <div class="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div class="border-2 border-dashed border-stone-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 group-hover:border-stone-900 transition-colors bg-stone-50">
                  <FileUp className="w-6 h-6 text-stone-400 group-hover:text-stone-900" />
                  <span class="text-xs text-stone-500 font-medium">
                    {signatureFile ? signatureFile.name : 'Click or drag to upload signature image'}
                  </span>
                  <span class="text-[10px] text-stone-400 uppercase tracking-tight">PNG, JPG or SVG (Max 2MB)</span>
                </div>
              </div>
            </div>

            {formData.signature_path && !signatureFile && (
              <div class="w-32 h-32 border border-stone-200 rounded flex items-center justify-center p-2 bg-stone-50 relative group">
                <img 
                  src={`${api.BASE_URL}${formData.signature_path}`} 
                  alt="Current Signature" 
                  class="max-w-full max-h-full object-contain"
                />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                  <span class="text-[10px] text-white font-bold uppercase tracking-wider">Current</span>
                </div>
              </div>
            )}
            
            {signatureFile && (
              <div class="w-32 h-32 border border-stone-900 rounded flex items-center justify-center p-2 bg-stone-50 relative">
                <img 
                  src={URL.createObjectURL(signatureFile)} 
                  alt="New Signature Preview" 
                  class="max-w-full max-h-full object-contain"
                />
                <button 
                  type="button"
                  onClick={() => setSignatureFile(null)}
                  class="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <div class="absolute bottom-0 inset-x-0 bg-stone-900 text-white text-[8px] font-bold uppercase tracking-tighter py-1 text-center rounded-b">
                  Preview
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div class="pt-6 border-t border-stone-100 flex justify-end items-center gap-4">
        {(uploading || saving) && <span class="text-[10px] font-bold uppercase tracking-widest text-stone-400 animate-pulse">{uploading ? 'Uploading Signature...' : 'Saving...'}</span>}
        <button 
          type="submit"
          disabled={uploading || saving}
          class={`flex items-center justify-center gap-2 bg-stone-900 text-white py-3 px-8 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors ${uploading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Save className="w-4 h-4" />
          {picId ? 'Update PIC' : 'Save PIC'}
        </button>
      </div>
    </form>
  );
}
