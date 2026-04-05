import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { StatusesPage } from '../pages/StatusesPage.js';
import { TestDataFactory } from '../helpers/test-data.js';

test.describe('Statuses Management', () => {
  let loginPage, statusesPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    statusesPage = new StatusesPage(page);
    
    await loginPage.goto();
    await loginPage.loginAsDefault();
    await expect(loginPage.page.getByRole('button', { name: 'Profile' })).toBeVisible({ timeout: 10000 });
    
    await statusesPage.openStatusesPage();
  });

  test('should display statuses page correctly', async ({ page }) => {
    await expect(page).toHaveURL(/task_statuses/);
    
    await expect(statusesPage.statusesTable).toBeVisible();
    
    const count = await statusesPage.getStatusesCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should display create status form correctly', async ({ page }) => {
    await expect(page).toHaveURL(/task_statuses/);
    
    await statusesPage.clickCreate();
    
    await expect(statusesPage.nameInput).toBeVisible();
    await expect(statusesPage.slugInput).toBeVisible();
    await expect(statusesPage.saveButton).toBeVisible();
  });

  test('should create a new status successfully', async ({ page }) => {
    const testStatus = TestDataFactory.createStatus();
    const { name: statusName, slug: statusSlug } = testStatus;
    
    await statusesPage.clickCreate();
    await statusesPage.fillStatusForm({
      name: statusName,
      slug: statusSlug
    });
    await statusesPage.save();
    
    await statusesPage.waitForSuccessMessage();
    await expect(page.locator(`text=${statusName}`)).toBeVisible();
  });

  test('should display status information correctly', async ({ page }) => {
    await expect(page).toHaveURL(/task_statuses/);
    
    await expect(page.locator('text=Name')).toBeVisible();
    await expect(page.locator('text=Slug')).toBeVisible();
    await expect(page.locator('text=Created at')).toBeVisible();
  });

  test('should display edit form correctly', async ({ page }) => {
    await expect(page).toHaveURL(/task_statuses/);
    
    const count = await statusesPage.getStatusesCount();
    if (count === 0) {
      const setupStatus = TestDataFactory.createStatus({ name: 'Test Status', slug: 'test_status' });
      await statusesPage.clickCreate();
      await statusesPage.fillStatusForm(setupStatus);
      await statusesPage.save();
      await statusesPage.waitForSuccessMessage();
      await statusesPage.openStatusesPage();
    }
    
    await statusesPage.editStatus(0);
    
    await expect(statusesPage.nameInput).toBeVisible();
    await expect(statusesPage.saveButton).toBeVisible();
  });

  test('should edit status data successfully', async ({ page }) => {
    await expect(page).toHaveURL(/task_statuses/);
    
    const count = await statusesPage.getStatusesCount();
    if (count === 0) {
      const editSetupStatus = TestDataFactory.createStatus({ name: 'Test Status', slug: 'test_status' });
      await statusesPage.clickCreate();
      await statusesPage.fillStatusForm(editSetupStatus);
      await statusesPage.save();
      await statusesPage.waitForSuccessMessage();
      await statusesPage.openStatusesPage();
    }
    
    const newName = `Edited Status ${Date.now()}`;
    
    await statusesPage.editStatus(0);
    
    await statusesPage.nameInput.clear();
    await statusesPage.nameInput.fill(newName);
    await statusesPage.save();
    
    await statusesPage.waitForSuccessMessage();
    await expect(page.locator(`text=${newName}`)).toBeVisible();
  });

  test('should delete a single status', async ({ page }) => {
    await expect(page).toHaveURL(/task_statuses/);
    
    const initialCount = await statusesPage.getStatusesCount();
    if (initialCount <= 1) return;
    
    await statusesPage.deleteStatus(initialCount - 1);
    
    await statusesPage.waitForDeleteMessage();
    
    const finalCount = await statusesPage.getStatusesCount();
    expect(finalCount).toBeLessThan(initialCount);
  });

  test('should select all statuses', async ({ page }) => {
    await expect(page).toHaveURL(/task_statuses/);
    
    const initialCount = await statusesPage.getStatusesCount();
    if (initialCount === 0) return;
    
    await statusesPage.selectAllStatuses();
    
    const selectedCount = await page.locator('tbody input[type="checkbox"]:checked').count();
    expect(selectedCount).toBe(initialCount);
  });

  test('should bulk delete all statuses', async ({ page }) => {
  await expect(page).toHaveURL(/task_statuses/);
  
  const initialCount = await statusesPage.getStatusesCount();
  if (initialCount === 0) return;
  
  await statusesPage.selectAllStatuses();
  await statusesPage.delete();
  
  await Promise.race([
    page.getByText('Element deleted').waitFor({ state: 'visible', timeout: 3000 }),
    page.getByText(/No.*yet/i).waitFor({ state: 'visible', timeout: 3000 })
  ]).catch(error => {
    console.warn('Neither deletion message nor empty state appeared:', error.message);
  });
  
  await Promise.race([
    page.getByRole('table').waitFor({ state: 'visible', timeout: 5000 }),
    page.getByText(/No.*yet/i).waitFor({ state: 'visible', timeout: 5000 })
  ]);
  
  const finalCount = await statusesPage.getStatusesCount();
  expect(finalCount).toBeLessThan(initialCount);
});
});