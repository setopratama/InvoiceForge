export function calculateInvoice(invoice: any) {
  const items = invoice.items || [];
  const subtotal = items.reduce((acc: number, item: any) => acc + (item.quantity * item.unit_price || 0), 0);
  
  let discountAmount = 0;
  if (invoice.discount) {
    if (invoice.discount.type === 'percentage') {
      discountAmount = (subtotal * (invoice.discount.value || 0)) / 100;
    } else {
      discountAmount = invoice.discount.value || 0;
    }
  }

  const taxAmount = invoice.tax ? ((subtotal - discountAmount) * (invoice.tax.ppn || 0)) / 100 : 0;
  const total = subtotal - discountAmount + taxAmount;

  return {
    ...invoice,
    subtotal,
    discount: invoice.discount ? { ...invoice.discount, amount: discountAmount } : invoice.discount,
    tax: invoice.tax ? { ...invoice.tax, amount: taxAmount } : invoice.tax,
    total,
  };
}
