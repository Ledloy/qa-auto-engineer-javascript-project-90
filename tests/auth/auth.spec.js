import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';

test.describe('Authentication', () => {
  let loginPage, dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should login with any credentials', async ({ page }) => {
    await loginPage.goto();
    await loginPage.loginAsDefault();
    
    await expect(dashboardPage.profileButton).toBeVisible({ timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    await loginPage.goto();
    await loginPage.loginAsDefault();

    await expect(dashboardPage.profileButton).toBeVisible({ timeout: 10000 });
  
    await dashboardPage.logout();
 
    await expect(loginPage.usernameInput).toBeVisible({ timeout: 10000 });
    await expect(loginPage.passwordInput).toBeVisible({ timeout: 10000 });
  });

  test('should show login form on root', async ({ page }) => {
    await loginPage.goto();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });
});