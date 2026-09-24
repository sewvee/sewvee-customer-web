const fs = require('fs');

let content = fs.readFileSync('src/app/login/page.tsx', 'utf8');

const regex = /<Phone className="w-5 h-5 text-slate-400 mr-3 shrink-0" \/>\s*<input[\s\S]*?disabled=\{loading\}\s*\/>/m;

const newUI = `<Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0 hidden sm:block" />
                <select 
                  value={countryCode} 
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-transparent text-[14px] font-medium text-slate-900 outline-none mr-2 pr-1 cursor-pointer"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <div className="w-[1px] h-5 bg-slate-200 mr-2"></div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/[^0-9]/g, ''));
                    setValidationError('');
                    clearError();
                  }}
                  maxLength={15}
                  placeholder="Mobile number"
                  className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                  disabled={loading}
                />`;

if (content.match(regex)) {
  content = content.replace(regex, newUI);
  fs.writeFileSync('src/app/login/page.tsx', content);
  console.log('Fixed login page');
} else {
  console.log('Could not match login page UI');
}
