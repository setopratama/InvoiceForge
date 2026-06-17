import { useState, useEffect } from 'preact/hooks';
import { 
  Search, 
  Filter, 
  Copy, 
  Download, 
  Edit2, 
  Trash2, 
  MoreHorizontal,
  ChevronRight
} from 'lucide-preact';
import { api } from '../../lib/api';
import { formatCurrency, formatDate, getStatusColor } from '../../lib/format';

export default function InvoiceTable() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invData, clientData] = await Promise.all([
        api.getInvoices({ status: statusFilter }),
        api.getClients()
      ]);
      setInvoices(invData);
      setClients(clientData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (id: string) => {
    try {
      const cloned = await api.cloneInvoice(id);
      window.location.href = `/invoice/${cloned.id}`;
    } catch (e: any) {
      console.error('Invoice Clone failed:', e);
      api.logError({ 
        message: 'Invoice Clone failed', 
        details: `ID: ${id}, Error: ${e.message}` 
      });
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await api.deleteInvoice(id);
      setInvoices(invoices.filter(inv => inv.id !== id));
    } catch (e: any) {
      console.error('Invoice Delete failed:', e);
      api.logError({ 
        message: 'Invoice Delete failed', 
        details: `ID: ${id}, Error: ${e.message}` 
      });
      alert(e.message);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clients.find(c => c.id === inv.client_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  };

  return (
    <div class="bg-white border border-stone-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-1 items-center gap-4">
          <div class="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search by number or client..." 
              class="w-full pl-10 pr-4 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 transition-colors"
              value={searchTerm}
              onInput={(e: any) => setSearchTerm(e.target.value)}
            />
          </div>
          <div class="flex items-center gap-2 border border-stone-200 px-3 py-2 bg-stone-50">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select 
              class="bg-transparent text-xs font-bold uppercase tracking-widest focus:outline-none"
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-stone-50 border-b border-stone-200">
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Invoice Number</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Client</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Date</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Amount</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Status</th>
              <th class="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td colSpan={6} class="px-6 py-12 text-center text-stone-400 text-sm italic">Loading invoices...</td>
              </tr>
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} class="px-6 py-12 text-center text-stone-400 text-sm italic">No invoices found.</td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} class="hover:bg-stone-50 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="text-sm font-bold font-mono-industrial text-stone-900">{inv.invoice_number}</div>
                    {inv.is_clone && <div class="text-[9px] text-stone-400 uppercase tracking-tighter mt-1">Cloned</div>}
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-stone-900">{getClientName(inv.client_id)}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-[11px] text-stone-600 font-medium">{formatDate(inv.issue_date)}</div>
                    <div class="text-[9px] text-stone-400 uppercase tracking-widest mt-1">Due: {formatDate(inv.due_date)}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-bold font-mono-industrial text-stone-900">{formatCurrency(inv.total, inv.currency)}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => window.location.href = `/invoice/${inv.id}`}
                        class="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                        title="Edit/View"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleClone(inv.id)}
                        class="p-2 text-stone-400 hover:text-blue-600 transition-colors"
                        title="Clone"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(inv.id)}
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
