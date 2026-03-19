import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { UsersPage } from '../pages/UsersPage.js';

test.describe('Users Management', () => {
  let loginPage, usersPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    usersPage = new UsersPage(page);
    

    await loginPage.goto();
    await loginPage.loginAsDefault();
    await expect(loginPage.page.getByRole('button', { name: 'Profile' })).toBeVisible({ timeout: 10000 });
    
 
    await usersPage.openUsersPage();
    
   
    const count = await usersPage.getUserCount();
    if (count === 0) {
      await usersPage.clickCreate();
      await usersPage.fillUserForm({
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@google.com`
      });
      await usersPage.save();
      await usersPage.waitForSuccessMessage();
      await usersPage.openUsersPage();
    }
  });


  
  test('should display create user form correctly', async () => {
    await usersPage.clickCreate();
    
    await expect(usersPage.firstNameInput).toBeVisible();
    await expect(usersPage.lastNameInput).toBeVisible();
    await expect(usersPage.emailInput).toBeVisible();
    await expect(usersPage.saveButton).toBeVisible();
  });

  test('should create a new user successfully', async () => {
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: `testuser${Date.now()}@google.com`
    };
    
    await usersPage.clickCreate();
    await usersPage.fillUserForm(testData);
    await usersPage.save();
    
    await usersPage.waitForSuccessMessage();
    await expect(page.locator(`text=${testData.email}`)).toBeVisible();
  });

  
  test('should display users list correctly', async () => {
    await expect(usersPage.userTable).toBeVisible();
    
    const count = await usersPage.getUserCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should display user information correctly', async () => {
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=First name')).toBeVisible();
  });


  test('should display edit form correctly', async () => {
    await usersPage.editUser(0);
    
    await expect(usersPage.emailInput).toBeVisible();
    await expect(usersPage.firstNameInput).toBeVisible();
    await expect(usersPage.saveButton).toBeVisible();
  });

  test('should edit user data successfully', async () => {
    const newEmail = `edited${Date.now()}@google.com`;
    
    await usersPage.editUser(0);
    
    await usersPage.emailInput.clear();
    await usersPage.emailInput.fill(newEmail);
    await usersPage.save();
    
    await page.getByText('Element updated').waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator(`text=${newEmail}`)).toBeVisible();
  });


  test('should validate email on edit', async () => {
    await usersPage.editUser(0);
    
    await usersPage.emailInput.clear();
    await usersPage.emailInput.fill('invalid-email');
    await usersPage.save();
    
    await expect(page.getByText('Incorrect email format')).toBeVisible({ timeout: 5000 });
  });

  
  test('should delete a single user', async () => {
    const initialCount = await usersPage.getUserCount();
    
    await usersPage.deleteUser(0);
    
    await usersPage.waitForDeleteMessage();
    
    const finalCount = await usersPage.getUserCount();
    expect(finalCount).toBeLessThan(initialCount);
  });

  
  test('should select all users', async () => {
    const initialCount = await usersPage.getUserCount();
    
    await usersPage.selectAllUsers();
    
    const selectedCount = await page.locator('tbody input[type="checkbox"]:checked').count();
    expect(selectedCount).toBe(initialCount);
  });


  test('should bulk delete all users', async () => {
    const initialCount = await usersPage.getUserCount();
    if (initialCount === 0) return;
    
    await usersPage.selectAllUsers();
    await usersPage.delete();
    
    try {
      await page.getByText(/deleted|No Users yet/i)
        .or(page.getByRole('alert'))
        .first()
        .waitFor({ state: 'visible', timeout: 3000 });
    } catch (error) {
      void error;
    }
    
  
    await page.waitForTimeout(500);
    const finalCount = await usersPage.getUserCount();
    expect(finalCount).toBeLessThan(initialCount);
  });
});