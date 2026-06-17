import fs from 'fs';

const file = 'src/components/invoice/InvoicePreview.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  'bg-white': 'bg-[#ffffff]',
  'text-white': 'text-[#ffffff]',
  'text-stone-900': 'text-[#1c1917]',
  'text-stone-500': 'text-[#78716c]',
  'text-stone-400': 'text-[#a8a29e]',
  'bg-stone-900': 'bg-[#1c1917]',
  'bg-stone-200': 'bg-[#e7e5e4]',
  'bg-stone-50': 'bg-[#fafaf9]',
  'border-stone-100': 'border-[#f5f5f4]',
  'border-stone-200': 'border-[#e7e5e4]',
  'border-stone-900': 'border-[#1c1917]',
  'divide-stone-100': 'divide-[#f5f5f4]',
  'text-stone-600': 'text-[#57534e]',
  'text-stone-700': 'text-[#44403c]',
};

for (const [key, value] of Object.entries(replacements)) {
  // Match the class itself or with a prefix (e.g. hover:bg-white)
  const regex = new RegExp(`(?<=[\\s"'\`])([a-z0-9:-]+)?` + key + `(?=[\\s"'\`])`, 'g');
  content = content.replace(regex, (match) => {
    if (match.includes(':')) {
      const parts = match.split(':');
      return parts[0] + ':' + value;
    }
    return value;
  });
}

fs.writeFileSync(file, content);
console.log('Done replacing tailwind color classes with hex classes.');
