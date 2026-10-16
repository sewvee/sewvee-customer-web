const fs = require('fs');

let content = fs.readFileSync('src/app/login/page.tsx', 'utf8');

const oldLabel = `          <div className="mb-6 text-left">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
              4-Digit PIN
            </label>`;

const newLabel = `          <div className="mb-6 text-left">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
                4-Digit PIN
              </label>
              <button type="button" onClick={() => router.push('/forgot-pin')} className="text-[12px] text-[#5B43EE] font-semibold hover:underline focus:outline-none">
                Forgot PIN?
              </button>
            </div>`;

const oldButtonBlock = `          <div className="flex justify-end mb-5 -mt-2">
            <button type="button" onClick={() => router.push('/forgot-pin')} className="text-[13px] text-[#5B43EE] font-medium hover:underline focus:outline-none">
              Forgot PIN?
            </button>
          </div>

          <Button type="submit" fullWidth size="lg"`;

const newButtonBlock = `          <Button type="submit" fullWidth size="lg"`;

if (content.includes(oldLabel) && content.includes(oldButtonBlock)) {
    content = content.replace(oldLabel, newLabel);
    content = content.replace(oldButtonBlock, newButtonBlock);
    fs.writeFileSync('src/app/login/page.tsx', content);
    console.log('Successfully moved Forgot PIN link');
} else {
    console.log('Failed to find strings to replace');
}
