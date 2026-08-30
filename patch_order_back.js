const fs = require('fs');
const file = '/Users/bhuvan/Documents/Bhuvan/Products/sewvee-customer-web/src/app/(app)/orders/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Import useRouter
code = code.replace(
  "import { useParams } from 'next/navigation';",
  "import { useParams, useRouter } from 'next/navigation';"
);

// Add router hook
code = code.replace(
  "const params = useParams();",
  "const params = useParams();\n  const router = useRouter();"
);

// Replace Link with button
code = code.replace(
  '<Link href="/home" className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full">',
  '<button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full">'
);
code = code.replace(
  '<ArrowLeft className="w-5 h-5 text-[#0F172A]" />\n            </Link>',
  '<ArrowLeft className="w-5 h-5 text-[#0F172A]" />\n            </button>'
);

fs.writeFileSync(file, code);
console.log("Patched back button");
