import { useState, useEffect } from 'preact/hooks';
import { 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  ChevronLeft,
  Calendar,
  CreditCard,
  Building,
  User,
  Info,
  TrendingUp,
  Receipt
} from 'lucide-preact';
import { api } from '../../lib/api';

interface Props {
  data: any;
  onChange: (data: any) => void;
  onSubmit: (status: string) => void;
  clients: any[];
  pics: any[];
  companies?: any[];
  loading?: boolean;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

const defaultCompany = { id: '', name: 'Pilih Perusahaan', bank_info: { bank_name: '', account_number: '', account_name: '' } };

export default function InvoiceForm({ data, onChange, onSubmit, clients, pics, companies = [], loading, isSaving, lastSaved }: Props) {

  const handleAddItem = () => {
    onChange({
      ...data,
      items: [...data.items, { description: '', detail: '', quantity: 1, unit: 'paket', unit_price: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    if (data.items.length === 1) return;
    onChange({
      ...data,
      items: data.items.filter((_: any, i: number) => i !== index)
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...data.items];
    let processedValue = value;
    if (field === 'quantity' || field === 'unit_price') {
      processedValue = isNaN(value) ? 0 : value;
    }
    newItems[index] = { ...newItems[index], [field]: processedValue };
    onChange({ ...data, items: newItems });
  };

  const subtotal = data.items.reduce((acc: number, item: any) => acc + (item.quantity * item.unit_price || 0), 0);
  const discountAmount = data.discount.type === 'percentage' 
    ? (subtotal * data.discount.value) / 100 
    : data.discount.value;
  const taxAmount = ((subtotal - discountAmount) * (data.tax?.ppn || 0)) / 100;
  const total = subtotal - discountAmount + taxAmount;

  if (loading) return <div class="p-10 text-center text-stone-400 italic">Loading form...</div>;

  return (
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-10">
      {/* Form Section */}
      <div class="xl:col-span-12 space-y-8">
        <div class="bg-white border border-stone-200 shadow-sm p-8">
          <div class="flex items-center gap-2 mb-8 text-stone-400">
            <Info className="w-4 h-4" />
            <span class="text-[10px] font-bold uppercase tracking-widest">Header Information</span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                <Building className="w-3 h-3" /> Nama Client
              </label>
              <select 
                class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors"
                value={data.client_id}
                onChange={(e: any) => onChange({ ...data, client_id: e.target.value })}
              >
                {clients.map(c => <option value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                <User className="w-3 h-3" /> PIC Internal
              </label>
              <select 
                class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors"
                value={data.pic_id}
                onChange={(e: any) => onChange({ ...data, pic_id: e.target.value })}
              >
                {pics.map(p => <option value={p.id}>{p.name} - {p.role}</option>)}
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                <Building className="w-3 h-3" /> Perusahaan
              </label>
              <select 
                class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors"
                value={data.company_id || ''}
                onChange={(e: any) => {
                  const company = companies.find(c => c.id === e.target.value);
                  onChange({
                    ...data,
                    company_id: e.target.value,
                    bank_info: company?.bank_info || { bank_name: '', account_number: '', account_name: '' },
                  });
                }}
              >
                <option value="">Pilih Perusahaan</option>
                {companies.map(c => <option value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Tanggal Terbit
              </label>
              <input 
                type="date"
                class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors"
                value={data.issue_date}
                onInput={(e: any) => onChange({ ...data, issue_date: e.target.value })}
              />
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Jatuh Tempo
              </label>
              <input 
                type="date"
                class="w-full border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-900 bg-transparent transition-colors"
                value={data.due_date}
                onInput={(e: any) => onChange({ ...data, due_date: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div class="bg-white border border-stone-200 shadow-sm p-8">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-2 text-stone-400">
              <Receipt className="w-4 h-4" />
              <span class="text-[10px] font-bold uppercase tracking-widest">Detail Item Layanan</span>
            </div>
            <button 
              onClick={handleAddItem}
              class="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Tambah Item
            </button>
          </div>

          <div class="space-y-6">
            {data.items.map((item: any, index: number) => (
              <div key={index} class="relative group border-b border-stone-100 pb-6 last:border-0 last:pb-0">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div class="md:col-span-5 space-y-2">
                    <label class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Deskripsi Layanan</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Frontend Development"
                      class="w-full text-sm font-bold focus:outline-none placeholder:font-normal placeholder:text-stone-300"
                      value={item.description}
                      onInput={(e: any) => handleItemChange(index, 'description', e.target.value)}
                    />
                    <textarea 
                      placeholder="Detail tambahan..."
                      class="w-full text-xs text-stone-500 bg-transparent focus:outline-none resize-none"
                      rows={1}
                      value={item.detail}
                      onInput={(e: any) => handleItemChange(index, 'detail', e.target.value)}
                    ></textarea>
                  </div>
                  <div class="md:col-span-2 space-y-2">
                    <label class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Jml</label>
                    <input 
                      type="number"
                      class="w-full text-sm font-mono-industrial focus:outline-none"
                      value={item.quantity}
                      onInput={(e: any) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                    />
                  </div>
                  <div class="md:col-span-2 space-y-2">
                    <label class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Satuan</label>
                    <select 
                      class="w-full text-sm focus:outline-none bg-transparent"
                      value={item.unit}
                      onChange={(e: any) => handleItemChange(index, 'unit', e.target.value)}
                    >
                      <option value="paket">Paket</option>
                      <option value="jam">Jam</option>
                      <option value="hari">Hari</option>
                      <option value="bulan">Bulan</option>
                      <option value="unit">Unit</option>
                    </select>
                  </div>
                  <div class="md:col-span-2 space-y-2">
                    <label class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Harga Satuan</label>
                    <input 
                      type="number"
                      class="w-full text-sm font-mono-industrial focus:outline-none"
                      value={item.unit_price}
                      onInput={(e: any) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                    />
                  </div>
                  <div class="md:col-span-1 flex items-end justify-end">
                    <button 
                      onClick={() => handleRemoveItem(index)}
                      class="p-2 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div class="bg-white border border-stone-200 shadow-sm p-8 space-y-6">
            <div class="flex items-center gap-2 text-stone-400 mb-2">
              <CreditCard className="w-4 h-4" />
              <span class="text-[10px] font-bold uppercase tracking-widest">Pembayaran & Catatan</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <label class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Nama Bank</label>
                <input 
                  type="text"
                  class="w-full text-sm border-b border-stone-100 py-1 focus:outline-none bg-stone-50 text-stone-500"
                  value={data.bank_info?.bank_name || ''}
                  readOnly
                />
              </div>
              <div class="space-y-2">
                <label class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Nomor Rekening</label>
                <input 
                  type="text"
                  class="w-full text-sm border-b border-stone-100 py-1 focus:outline-none font-mono-industrial bg-stone-50 text-stone-500"
                  value={data.bank_info?.account_number || ''}
                  readOnly
                />
              </div>
              <div class="space-y-2">
                <label class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Nama Pemilik Rekening</label>
                <input 
                  type="text"
                  class="w-full text-sm border-b border-stone-100 py-1 focus:outline-none bg-stone-50 text-stone-500"
                  value={data.bank_info?.account_name || ''}
                  readOnly
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Catatan / Instruksi</label>
              <textarea 
                class="w-full text-xs text-stone-600 bg-stone-50 p-3 border border-stone-100 focus:outline-none focus:border-stone-900 transition-colors resize-none"
                rows={4}
                value={data.notes}
                onInput={(e: any) => onChange({ ...data, notes: e.target.value })}
              ></textarea>
            </div>
          </div>

          <div class="bg-stone-900 text-white p-8 space-y-8">
            <div class="flex items-center gap-2 text-stone-500 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span class="text-[10px] font-bold uppercase tracking-widest">Ringkasan & Aksi</span>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between items-center text-xs text-stone-400 font-bold uppercase tracking-widest">
                <span>Subtotal</span>
                <span class="font-mono-industrial">IDR {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-stone-400 font-bold uppercase tracking-widest">Diskon (%)</span>
                <input 
                  type="number"
                  class="bg-transparent border-b border-stone-700 text-right w-16 text-sm font-mono-industrial focus:outline-none"
                  value={data.discount?.value || 0}
                  onInput={(e: any) => onChange({ ...data, discount: { ...data.discount, value: isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value) } })}
                />
              </div>
              {(data.tax?.ppn || 0) > 0 ? (
                <div class="flex justify-between items-center text-xs text-stone-400 font-bold uppercase tracking-widest">
                  <span>Pajak (PPN {data.tax.ppn}%)</span>
                  <span class="font-mono-industrial">Included</span>
                </div>
              ) : (
                <div class="flex justify-between items-center text-xs text-stone-400 font-bold uppercase tracking-widest">
                  <span>Pajak (0%)</span>
                  <span class="font-mono-industrial">-</span>
                </div>
              )}
              <div class="pt-4 border-t border-stone-800 flex justify-between items-center">
                <span class="text-sm font-bold uppercase tracking-widest">Estimasi Total</span>
                <span class="text-2xl font-bold font-mono-industrial tracking-tighter">IDR {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-4">
              <div class="flex items-center justify-center gap-2 border border-stone-700 py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                {isSaving ? (
                  <><Save className="w-3.5 h-3.5 animate-pulse" /> Menyimpan draft...</>
                ) : lastSaved ? (
                  <><Save className="w-3.5 h-3.5 text-stone-500" /> Draft tersimpan {lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</>
                ) : (
                  <><Save className="w-3.5 h-3.5" /> Draft otomatis tersimpan</>
                )}
              </div>
              <button 
                onClick={() => onSubmit('sent')}
                class="flex items-center justify-center gap-2 bg-white text-stone-900 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Simpan & Finalisasi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
