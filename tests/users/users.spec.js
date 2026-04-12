import { test, expect } from '@playwright/test';
import { UsersPage } from '../pages/UsersPage.js';
import { Config } from '../helpers/config.js';
import { TestDataFactory } from '../helpers/test-data.js';
import { loginAsDefault } from '../helpers/auth.helper.js';

test.describe('Users Management', () => {
  let usersPage;

  test.beforeEach(async ({ page }) => {
    usersPage = new UsersPage(page);
    
    await loginAsDefault(page);
    
    await usersPage.openUsersPage();
    
    const count = await usersPage.getUserCount();
    if (count === 0) {
      const setupUser = TestDataFactory.createUser();
      await usersPage.clickCreate();
      await usersPage.fillUserForm(setupUser);
      await usersPage.save();
      await usersPage.waitForSuccessMessage();
      await usersPage.openUsersPage();
    }
  });

  test('should display create user form correctly', async ({ page }) => {
    await expect(page).toHaveURL(/users/);
    
    await usersPage.clickCreate();
    
    await expect(usersPage.firstNameInput).toBeVisible();
    await expect(usersPage.lastNameInput).toBeVisible();
    await expect(usersPage.emailInput).toBeVisible();
    await expect(usersPage.saveButton).toBeVisible();
  });

  test('should create a new user successfully', async ({ page }) => {
    await expect(page).toHaveURL(/users/);
    
    const testData = TestDataFactory.createUser();
    
    await usersPage.clickCreate();
    await usersPage.fillUserForm(testData);
    await usersPage.save();
    
    await usersPage.waitForSuccessMessage();
    await expect(page.locator(`text=${testData.email}`)).toBeVisible();
  });

  test('should display users list correctly', async ({ page }) => {
    await expect(page).toHaveURL(/users/);
    
    await expect(usersPage.userTable).toBeVisible();
    
    const count = await usersPage.getUserCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should display user information correctly', async ({ page }) => {
    await expect(page).toHaveURL(/users/);
    
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=First name')).toBeVisible();
  });

  test('should display edit form correctly', async ({ page }) => {
    await expect(page).toHaveURL(/users/);
    
    await usersPage.editUser(0);
    
    await expect(usersPage.emailInput).toBeVisible();
    await expect(usersPage.firstNameInput).toBeVisible();
    await expect(usersPage.saveButton).toBeVisible();
  });

  test('should edit user data successfully', async ({ page }) => {
    await expect(page).toHaveURL(/users/);
    
    const count = await usersPage.getUserCount();
    if (count === 0) {
      const userForEdit = TestDataFactory.createUser();
      await usersPage.clickCreate();
      await usersPage.fillUserForm(userForEdit);
      await usersPage.save();
      await usersPage.waitForSuccessMessage();
      await usersPage.openUsersPage();
    }
    
    const newEmail = `edited${Date.now()}@google.com`;
    
    await usersPage.editUser(0);
    
    await usersPage.emailInput.clear();
    await usersPage.emailInput.fill(newEmail);
    await usersPage.save();
    
    await page.getByText(Config.messages.updated).waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator(`text=${newEmail}`)).toBeVisible();
  });

  test('should validate email on edit', async ({ page }) => {
    await expect(page).toHaveURL(/users/);
    
    await usersPage.editUser(0);
    
    await usersPage.emailInput.clear();
    await usersPage.emailInput.fill('invalid-email');
    await usersPage.save();
    
    await expect(page.getByText('Incorrect email format')).toBeVisible({ timeout: 5000 });
  });

  test('should delete a single user', async ({ page }) => {
    await expect(page).toHaveURL(/users/);
    
    const initialCount = await usersPage.getUserCount();
    
    await usersPage.deleteUser(0);
    
    await usersPage.waitForDeleteMessage();
    
    const finalCount = await usersPage.getUserCount();
    expect(finalCount).toBeLessThan(initialCount);
  });

  test('should select all users', async ({ page }) => {
    await expect(page).toHaveURL(/users/);
    
    const initialCount = await usersPage.getUserCount();
    
    await usersPage.selectAllUsers();
    
    const selectedCount = await page.locator('tbody input[type="checkbox"]:checked').count();
    expect(selectedCount).toBe(initialCount);
  });

  test('should bulk delete all users', async ({ page }) => {
    await expect(page).toHaveURL(/users/);
    
    const initialCount = await usersPage.getUserCount();
    if (initialCount === 0) return;
    
    await usersPage.selectAllUsers();
    await usersPage.delete();
    
    await Promise.race([
      page.getByRole('table').waitFor({ state: 'hidden', timeout: 10000 }),
      page.locator('tbody tr').first().waitFor({ state: 'hidden', timeout: 10000 }),
      page.getByText('No Users yet').waitFor({ state: 'visible', timeout: 10000 })
    ]);
    
    const finalCount = await usersPage.getUserCount();
    expect(finalCount).toBeLessThan(initialCount);
  });
});