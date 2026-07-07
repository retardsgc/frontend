import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5177';
const API_BASE_URL = process.env.E2E_API_URL || 'http://localhost:5001/api';
const EMAIL = process.env.E2E_USER_EMAIL || 'srik27600@gmail.com';
const PASSWORD = process.env.E2E_USER_PASSWORD || 'srikrishna';

const authDir = path.resolve(__dirname, '..', '.auth');
const storageStatePath = path.join(authDir, 'user.json');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  fs.mkdirSync(authDir, { recursive: true });

  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!loginResponse.ok) {
    throw new Error(`Login failed with status ${loginResponse.status}`);
  }

  const loginData = await loginResponse.json();
  const token = loginData?.token;
  const user = loginData?.data;

  if (!token || !user) {
    throw new Error('Login response missing token or user payload');
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Logging in to ${BASE_URL} as ${EMAIL}...`);
  await page.goto(`${BASE_URL}/`);

  await page.evaluate(([tokenValue, userValue]) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userValue));
    window.dispatchEvent(new Event('auth:changed'));
  }, [token, user]);

  // Give the app a moment to apply auth state
  await wait(500);

  await page.context().storageState({ path: storageStatePath });
  console.log(`Saved storage state to ${storageStatePath}`);

  await browser.close();
  process.exit(0);
} catch (error) {
  console.error('Failed to create storage state:', error);
  process.exit(1);
}
