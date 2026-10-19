const fs = require('fs');
const path = require('path');

// Locate .env in current Angular directory or workspace root
const candidatePaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env')
];

const envPath = candidatePaths.find(p => fs.existsSync(p));

const envVars = {
  API_BASE_URL: 'http://localhost:8080/api',
  EMAILJS_SERVICE_ID: 'service_5mov3ze',
  EMAILJS_TEMPLATE_ID: 'template_cmoxd9v',
  EMAILJS_PUBLIC_KEY: 't8s7uaX2GACiuxqfk'
};

if (envPath) {
  console.log(`[set-env] Loading Angular environment from: ${envPath}`);
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const sep = trimmed.indexOf('=');
    if (sep > 0) {
      const key = trimmed.substring(0, sep).trim();
      let val = trimmed.substring(sep + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      envVars[key] = val;
    }
  }
} else {
  console.warn('[set-env] Warning: No .env found. Using fallback environment defaults.');
}

const environmentsDir = path.resolve(__dirname, '../src/environments');
if (!fs.existsSync(environmentsDir)) {
  fs.mkdirSync(environmentsDir, { recursive: true });
}

const envFileContent = `// Auto-generated from .env via scripts/set-env.js - DO NOT EDIT MANUALLY
export const environment = {
  production: false,
  apiBaseUrl: '${envVars.API_BASE_URL}',
  emailJs: {
    serviceId: '${envVars.EMAILJS_SERVICE_ID}',
    templateId: '${envVars.EMAILJS_TEMPLATE_ID}',
    publicKey: '${envVars.EMAILJS_PUBLIC_KEY}'
  }
};
`;

const prodEnvFileContent = `// Auto-generated production configuration from .env via scripts/set-env.js
export const environment = {
  production: true,
  apiBaseUrl: '${envVars.API_BASE_URL}',
  emailJs: {
    serviceId: '${envVars.EMAILJS_SERVICE_ID}',
    templateId: '${envVars.EMAILJS_TEMPLATE_ID}',
    publicKey: '${envVars.EMAILJS_PUBLIC_KEY}'
  }
};
`;

fs.writeFileSync(path.join(environmentsDir, 'environment.ts'), envFileContent, 'utf8');
fs.writeFileSync(path.join(environmentsDir, 'environment.development.ts'), envFileContent, 'utf8');
fs.writeFileSync(path.join(environmentsDir, 'environment.prod.ts'), prodEnvFileContent, 'utf8');

console.log('[set-env] Successfully generated environment files in src/environments/');
