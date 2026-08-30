const fs = require('fs');
const path = './src/lib/api.ts';
let code = fs.readFileSync(path, 'utf8');

const oldInterceptor = `api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sewvee_customer_token');
        localStorage.removeItem('sewvee_customer_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);`;

const newInterceptor = `api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Do not force redirect if the 401 came from the login endpoint itself
      const isLoginRequest = error.config?.url?.includes('login');
      if (!isLoginRequest && typeof window !== 'undefined') {
        localStorage.removeItem('sewvee_customer_token');
        localStorage.removeItem('sewvee_customer_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);`;

code = code.replace(oldInterceptor, newInterceptor);
fs.writeFileSync(path, code);
console.log("Patched API interceptor");
