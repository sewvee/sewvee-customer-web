const fs = require('fs');

let content = fs.readFileSync('src/app/login/page.tsx', 'utf8');

const regex = /<span className="text-slate-400 mr-2 font-medium text-lg">\+91<\/span>/;

const newUI = `<select 
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
                <div className="w-[1px] h-5 bg-slate-200 mr-2"></div>`;

content = content.replace(regex, newUI);
fs.writeFileSync('src/app/login/page.tsx', content);
console.log('Fixed login UI');
