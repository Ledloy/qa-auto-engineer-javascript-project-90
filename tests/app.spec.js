import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';

test.describe('Authentication', () => {
  let loginPage, dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should login with any credentials', async ({ page }) => {
    await loginPage.goto();
    await loginPage.loginAsDefault();
    
    await expect(dashboardPage.logoutButton).toBeVisible({ timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    await loginPage.goto();
    await loginPage.loginAsDefault();
 
    await expect(dashboardPage.logoutButton).toBeVisible({ timeout: 10000 });
    
  
    await dashboardPage.logoutButton.click();

    const logoutBtn = page.getByText('Выйти').or(page.getByText('Logout'));
    await logoutBtn.click();

    await expect(loginPage.usernameInput).toBeVisible();
  });

  test('should show login form on root', async ({ page }) => {
    await loginPage.goto();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });
});