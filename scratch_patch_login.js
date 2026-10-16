const fs = require('fs');

let content = fs.readFileSync('src/app/login/page.tsx', 'utf8');

const anchor = `          <Button type="submit" fullWidth size="lg" loading={loading} className="mb-6 bg-[#5B43EE] hover:bg-[#4935bf] h-12 rounded-xl text-[15px] font-semibold relative overflow-hidden">
            Continue →
          </Button>`;

const patch = `          <div className="flex justify-end mb-5 -mt-2">
            <button type="button" onClick={() => router.push('/forgot-pin')} className="text-[13px] text-[#5B43EE] font-medium hover:underline focus:outline-none">
              Forgot PIN?
            </button>
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading} className="mb-6 bg-[#5B43EE] hover:bg-[#4935bf] h-12 rounded-xl text-[15px] font-semibold relative overflow-hidden">
            Continue →
          </Button>`;

if (content.includes(anchor)) {
    content = content.replace(anchor, patch);
    fs.writeFileSync('src/app/login/page.tsx', content);
    console.log('Login page patched');
} else {
    console.log('Could not find anchor');
}
