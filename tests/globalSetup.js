import { chromium } from '@playwright/test';
import { Config } from './helpers/config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function globalSetup() {
  const authFile = path.join(__dirname, 'auth.json');
  
  console.log('🔐 Starting global authentication setup...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📍 Navigating to login page...');
    await page.goto(Config.urls.login);
    
    await page.getByRole('textbox', { name: 'Username' }).waitFor({ 
      state: 'visible', 
      timeout: 10000 
    });
    console.log('✓ Login form loaded');
    
    console.log('📝 Entering credentials...');
    await page.getByRole('textbox', { name: 'Username' }).fill(Config.users.default.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(Config.users.default.password);
    
    console.log('🔓 Clicking Sign in button...');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    console.log('⏳ Waiting for dashboard...');
    await page.getByRole('button', { name: 'Profile' }).waitFor({ 
      state: 'visible', 
      timeout: 10000 
    });
    console.log('✓ Successfully logged in!');
    
    console.log(`💾 Saving auth state to ${authFile}...`);
    await context.storageState({ path: authFile });
    console.log('✓ Auth state saved successfully!');
    
    console.log('✅ Global setup completed!\n');
  } catch (error) {
    console.error('❌ Global setup failed:', error.message);
    throw error;
  } finally {
 
    await browser.close();
  }
}

export default globalSetup;