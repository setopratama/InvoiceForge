import { useState, useEffect, useRef } from 'preact/hooks';
import { Download, Printer, FileText, Share2 } from 'lucide-preact';
import { formatCurrency, formatDate } from '../../lib/format';
import { api } from '../../lib/api';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface Props {
  invoice: any;
  client?: any;
  pic?: any;
  settings?: any;
  company?: any;
}

export default function InvoicePreview({ invoice, client, pic, settings, company }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = async () => {
    if (typeof window === 'undefined' || isExporting) return;
    setIsExporting(true);
    try {
      const element = previewRef.current;
      if (!element) return;
      const opt = {
        margin: 0,
        filename: `${(invoice.invoice_number || 'invoice').replace(/\//g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await (html2pdf as any)().set(opt).from(element).save();
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      api.logError({
        message: 'Failed to generate PDF',
        details: error?.stack || error?.message || String(error)
      });
      alert('Gagal mengekspor PDF. Silakan periksa console browser untuk detail.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!invoice) return null;

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between mb-2 no-print">
        <h2 class="text-sm font-bold uppercase tracking-widest text-[#a8a29e] flex items-center gap-2">
          <FileText className="w-4 h-4" /> Live Preview
        </h2>
        <div class="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => window.print()}
            class="p-2 text-[#a8a29e] hover:text-[#1c1917] transition-colors"
            title="Print"
            disabled={isExporting}
          >
            <Printer className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            class="flex items-center gap-2 bg-[#1c1917] text-[#ffffff] py-1.5 px-3 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            <Download className={`w-3 h-3 ${isExporting ? 'animate-bounce' : ''}`} /> 
            {isExporting ? 'Memproses...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div 
        ref={previewRef}
        style="background-color: #ffffff; width: 100%; min-height: 297mm; padding: 10%; color: #1c1917; display: flex; flex-direction: column; border: 1px solid #f5f5f4; box-sizing: border-box;"
        id="invoice-print-area"
      >
        {/* Header */}
        <div class="flex justify-between items-start mb-16">
          <div>
            <div class="w-12 h-12 bg-[#1c1917] flex items-center justify-center mb-4">
              <span class="text-[#ffffff] font-bold text-xl">{(company?.name || settings?.company_name || 'CO').substring(0, 2).toUpperCase()}</span>
            </div>
            <div style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: #1c1917;">{company?.name || settings?.company_name || 'Company Name'}</div>
            <p class="text-[10px] text-[#78716c] mt-1 max-w-[200px] leading-relaxed">
              {company?.address || settings?.company_address || 'Company Address'}
            </p>
            <p class="text-[10px] text-[#78716c] mt-1 italic">{company?.email || settings?.company_email}</p>
            {(company?.phone || settings?.company_phone) && <p class="text-[10px] text-[#78716c]">{company?.phone || settings?.company_phone}</p>}
          </div>
          <div class="text-right">
            <div style="font-size: 30px; font-weight: 800; text-transform: uppercase; color: #1c1917; margin-bottom: 8px; line-height: 1;">Invoice</div>
            <div class="space-y-1">
              <div class="text-[10px] text-[#a8a29e] uppercase tracking-widest">Number</div>
              <div class="text-sm font-bold font-mono-industrial text-[#1c1917]">{invoice.invoice_number || 'INV/DRAFT'}</div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div class="grid grid-cols-2 gap-12 mb-16">
          <div class="space-y-4">
            <div>
              <div class="text-[9px] font-bold uppercase tracking-widest text-[#a8a29e] mb-2">Bill To</div>
              <div class="text-sm font-bold text-[#1c1917]">{client?.name || 'Client Name'}</div>
              <div class="text-[11px] text-[#78716c] mt-1 max-w-[200px] leading-relaxed">
                {client?.address || 'Client Address'}
              </div>
              <div class="text-[11px] text-[#78716c] mt-1 italic">{client?.email}</div>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-6">
            <div class="flex justify-between border-b border-[#f5f5f4] pb-2">
              <span class="text-[9px] font-bold uppercase tracking-widest text-[#a8a29e]">Issue Date</span>
              <span class="text-xs font-medium">{formatDate(invoice.issue_date)}</span>
            </div>
            <div class="flex justify-between border-b border-[#f5f5f4] pb-2">
              <span class="text-[9px] font-bold uppercase tracking-widest text-[#a8a29e]">Due Date</span>
              <span class="text-xs font-bold">{formatDate(invoice.due_date)}</span>
            </div>

          </div>
        </div>

        {/* Table */}
        <div class="flex-1">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b-2 border-[#1c1917]">
                <th class="py-3 text-[9px] font-bold uppercase tracking-widest text-[#a8a29e]">Description</th>
                <th class="py-3 text-[9px] font-bold uppercase tracking-widest text-[#a8a29e] text-center">Qty</th>
                <th class="py-3 text-[9px] font-bold uppercase tracking-widest text-[#a8a29e] text-right">Price</th>
                <th class="py-3 text-[9px] font-bold uppercase tracking-widest text-[#a8a29e] text-right">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#f5f5f4]">
              {invoice.items.map((item: any, i: number) => (
                <tr key={i}>
                  <td class="py-4">
                    <div class="text-xs font-bold text-[#1c1917]">{item.description}</div>
                    {item.detail && <div class="text-[10px] text-[#78716c] mt-1 max-w-[250px]">{item.detail}</div>}
                  </td>
                  <td class="py-4 text-xs font-mono-industrial text-center">
                    {item.quantity} <span class="text-[9px] uppercase text-[#a8a29e] ml-1">{item.unit}</span>
                  </td>
                  <td class="py-4 text-xs font-mono-industrial text-right">
                    {formatCurrency(item.unit_price, invoice.currency).replace('Rp', '').trim()}
                  </td>
                  <td class="py-4 text-xs font-bold font-mono-industrial text-right">
                    {formatCurrency(item.quantity * item.unit_price, invoice.currency).replace('Rp', '').trim()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div class="mt-12 flex justify-end">
          <div class="w-64 space-y-3">
            <div class="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#a8a29e]">
              <span>Subtotal</span>
              <span class="font-mono-industrial font-bold text-[#1c1917]">
                {formatCurrency(invoice.subtotal || 0, invoice.currency)}
              </span>
            </div>
            {invoice.discount?.value > 0 && (
              <div class="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#a8a29e]">
                <span>Discount ({invoice.discount.value}%)</span>
                <span class="font-mono-industrial text-[#1c1917]">
                  ({formatCurrency(invoice.discount.amount || 0, invoice.currency)})
                </span>
              </div>
            )}
            {(invoice.tax?.ppn || 0) > 0 && (
              <div class="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#a8a29e]">
                <span>Tax (PPN {invoice.tax.ppn}%)</span>
                <span class="font-mono-industrial text-[#1c1917]">
                  {formatCurrency(invoice.tax?.amount || 0, invoice.currency)}
                </span>
              </div>
            )}
            <div class="pt-3 border-t-2 border-[#1c1917] flex justify-between items-center">
              <span class="text-xs font-bold uppercase tracking-widest text-[#1c1917]">Total Amount</span>
              <span class="text-lg font-bold font-mono-industrial tracking-tighter">
                {formatCurrency(invoice.total || 0, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div class="mt-20 grid grid-cols-2 gap-12">
          <div>
            <div class="text-[9px] font-bold uppercase tracking-widest text-[#a8a29e] mb-2">Payment Info</div>
            <div class="text-xs font-bold">{invoice.bank_info?.bank_name || (company?.bank_info?.bank_name || settings?.bank_info?.bank_name)}</div>
            <div class="text-sm font-bold font-mono-industrial mt-1 tracking-wider">{invoice.bank_info?.account_number || (company?.bank_info?.account_number || settings?.bank_info?.account_number)}</div>
            <div class="text-[10px] text-[#78716c] mt-1 uppercase tracking-wider">{invoice.bank_info?.account_name || (company?.bank_info?.account_name || settings?.bank_info?.account_name)}</div>
            
            <div class="mt-6 text-[10px] text-[#a8a29e] leading-relaxed italic">
              {invoice.notes}
            </div>
          </div>
          <div class="flex flex-col items-center">
            <div class="text-[9px] font-bold uppercase tracking-widest text-[#a8a29e] mb-4">Authorized Signature</div>
            
            <div class="h-16 flex items-center justify-center mb-4">
              {pic?.signature_path ? (
                <img 
                  src={`${api.BASE_URL}${pic.signature_path}`} 
                  alt="Signature" 
                  class="max-h-full object-contain mix-blend-multiply"
                />
              ) : (
                <div class="w-32 h-16 border border-stone-50 border-dashed"></div>
              )}
            </div>

            <div class="w-48 h-px bg-[#1c1917] mb-3"></div>
            <div class="text-xs font-bold uppercase tracking-tight">{pic?.name || 'Authorized Signatory'}</div>
            <div class="text-[10px] text-[#a8a29e] uppercase tracking-widest mt-1">{pic?.role || 'Position'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
