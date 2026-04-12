import { Config } from './config.js';

export async function loginAsDefault(page) {
  const profileButton = page.getByRole('button', { name: 'Profile' });
  
  const isAlreadyLoggedIn = await profileButton
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  
  if (isAlreadyLoggedIn) {
    console.log('✓ Already logged in');
    return;
  }
  
  console.log('🔐 Starting login...');
  
  const loginUrl = `http://localhost:5173${Config.urls.login}`;
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
  
  console.log('Waiting for login form...');
  await page.getByRole('textbox', { name: 'Username' }).waitFor({ 
    state: 'visible', 
    timeout: 10000 
  });
  
  console.log('📝 Entering credentials...');
  await page.getByRole('textbox', { name: 'Username' }).fill(Config.users.default.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(Config.users.default.password);
  
  console.log('🔓 Clicking Sign in...');
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  console.log('⏳ Waiting for dashboard...');
  await page.getByRole('button', { name: 'Profile' }).waitFor({ 
    state: 'visible', 
    timeout: 10000 
  });
  
  console.log('✓ Logged in successfully!\n');
}