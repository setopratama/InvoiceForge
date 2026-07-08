import { useState, useEffect } from 'preact/hooks';
import { api } from '../../lib/api';
import { calculateInvoice } from '../../lib/calculate';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';
import { Layout, Eye, PenTool } from 'lucide-preact';

interface Props {
  invoiceId?: string;
}

export default function InvoiceEditor({ invoiceId }: Props) {
  const [invoice, setInvoice] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [pic, setPic] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [pics, setPics] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  // Auto-save states
  const [currentId, setCurrentId] = useState<string | undefined>(invoiceId);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [invoiceId]);

  const fetchInitialData = async () => {
    try {
      const [cData, pData, sData, compData] = await Promise.all([
        api.getClients(),
        api.getPICs(),
        api.getSettings(),
        api.getCompanies()
      ]);
      setClients(cData);
      setPics(pData);
      setSettings(sData);
      setCompanies(compData);

      if (invoiceId) {
        const data = await api.getInvoice(invoiceId);
        setInvoice(data);
        setCurrentId(invoiceId);
      } else {
        const defaultCompany = compData.length > 0 ? compData[0] : null;
        const initialInvoice = {
          items: [{ description: '', detail: '', quantity: 1, unit: 'paket', unit_price: 0 }],
          discount: { type: 'percentage', value: 0 },
          tax: { ppn: sData.enable_tax ? sData.ppn : 0 },
          bank_info: defaultCompany?.bank_info || sData.bank_info,
          company_id: defaultCompany?.id || '',
          currency: sData.currency,
          client_id: cData.length > 0 ? cData[0].id : '',
          pic_id: pData.length > 0 ? pData[0].id : '',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };
        setInvoice(calculateInvoice(initialInvoice));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFormChange = (newData: any) => {
    setInvoice(calculateInvoice(newData));
    setIsDirty(true);
  };

  // Auto-save effect
  useEffect(() => {
    if (!isDirty || !invoice) return;
    
    const timer = setTimeout(() => {
      autoSaveDraft();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [invoice, isDirty]);

  const autoSaveDraft = async () => {
    if (invoice?.status === 'paid' || invoice?.status === 'cancelled' || invoice?.status === 'sent') return;
    
    setIsSaving(true);
    try {
      const dataToSave = { ...invoice, status: 'draft' };
      if (currentId) {
        await api.updateInvoice(currentId, dataToSave);
        setLastSaved(new Date());
        setIsDirty(false);
      } else {
        const created = await api.createInvoice(dataToSave);
        setCurrentId(created.id);
        setLastSaved(new Date());
        setIsDirty(false);
        window.history.replaceState(null, '', `/invoice/${created.id}`);
      }
    } catch (e) {
      console.error('Auto-save failed:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (status: string) => {
    try {
      if (invoice?.status === 'paid' || invoice?.status === 'cancelled') {
        alert('Invoice that is already paid or cancelled cannot be edited.');
        return;
      }
      const dataToSave = { ...invoice, status };
      if (currentId) {
        await api.updateInvoice(currentId, dataToSave);
        alert('Invoice updated successfully');
      } else {
        const created = await api.createInvoice(dataToSave);
        window.location.href = `/invoice/${created.id}`;
      }
    } catch (e: any) {
      console.error('Submit failed:', e);
      api.logError({ 
        message: 'Finalization failed', 
        details: `Status: ${status}, Error: ${e.message}, Data: ${JSON.stringify(invoice)}` 
      });
      alert(e.message);
    }
  };

  if (!invoice) return <div class="p-10 text-center text-stone-400 italic">Loading editor...</div>;

  // Compute selected company
  const selectedCompany = invoice?.company_id
    ? companies.find(c => c.id === invoice.company_id)
    : null;

  // Sync preview data
  useEffect(() => {
    if (invoice?.client_id) {
      setClient(clients.find(c => c.id === invoice.client_id));
    }
    if (invoice?.pic_id) {
      setPic(pics.find(p => p.id === invoice.pic_id));
    }
  }, [invoice, clients, pics]);

  return (
    <div class="flex flex-col gap-10">
      {/* Form Section */}
      <div class="max-w-5xl mx-auto w-full no-print">
        <InvoiceForm 
          data={invoice} 
          onChange={handleFormChange} 
          onSubmit={handleSubmit}
          clients={clients}
          pics={pics}
          companies={companies}
          isSaving={isSaving}
          lastSaved={lastSaved}
        />
      </div>

      {/* Divider */}
      <div class="border-t border-stone-200 pt-10 flex flex-col items-center print:border-none print:pt-0 print:block">
        <div class="max-w-4xl w-full print:max-w-none print:w-full">
          <InvoicePreview invoice={invoice} client={client} pic={pic} settings={settings} company={selectedCompany} />
        </div>
      </div>
    </div>
  );
}
