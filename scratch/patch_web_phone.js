const fs = require('fs');

function patchFile(filePath, isSignup) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add countryCode state
  if (!content.includes('const [countryCode')) {
    content = content.replace(
      /const \[phone, setPhone\] = useState\(''\);/,
      "const [phone, setPhone] = useState('');\n  const [countryCode, setCountryCode] = useState('+91');"
    );
  }

  // Update logic to send cleanedPhone
  if (isSignup) {
    content = content.replace(
      /mobile: cleanedPhone,/g,
      "mobile: countryCode === '+91' ? cleanedPhone : countryCode + cleanedPhone,"
    );
    content = content.replace(
      /await login\(cleanedPhone, pin\);/g,
      "await login(countryCode === '+91' ? cleanedPhone : countryCode + cleanedPhone, pin);"
    );
  } else {
    // In login, the API call is in authStore.js! Wait, let's check authStore.js or login page.
    // In login page, it calls login(phone, pin)
    content = content.replace(
      /await login\(cleanedPhone, pin\);/g,
      "await login(countryCode === '+91' ? cleanedPhone : countryCode + cleanedPhone, pin);"
    );
    // There is a clearError() usually
    content = content.replace(
      /await login\(phone, pin\);/g,
      "await login(countryCode === '+91' ? phone : countryCode + phone, pin);"
    );
  }

  // Replace phone input UI
  const phoneUI = `<Phone className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input`;
  const newPhoneUI = `<Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0 hidden sm:block" />
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
                <input`;

  content = content.replace(phoneUI, newPhoneUI);

  // Change placeholder and maxLength
  content = content.replace(/placeholder="10-digit number"/g, 'placeholder="Mobile number"');
  content = content.replace(/maxLength=\{10\}/g, 'maxLength={15}');

  fs.writeFileSync(filePath, content);
  console.log('Patched', filePath);
}

patchFile('src/app/signup/page.tsx', true);
patchFile('src/app/login/page.tsx', false);
