import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { LabelsPage } from '../pages/LabelsPage.js';

test.describe('Labels Management', () => {
  let loginPage, labelsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    labelsPage = new LabelsPage(page);
    
    await loginPage.goto();
    await loginPage.loginAsDefault();
    await expect(loginPage.page.getByRole('button', { name: 'Profile' })).toBeVisible({ timeout: 10000 });
  
    await labelsPage.openLabelsPage();
  
    const count = await labelsPage.getLabelsCount();
    if (count === 0) {
      await labelsPage.clickCreate();
      await labelsPage.fillLabelForm({
        name: `Test Label ${Date.now()}`
      });
      await labelsPage.save();
      await labelsPage.waitForSuccessMessage();
      await labelsPage.openLabelsPage();
    }
  });
  
  test('should display create label form correctly', async ({ page }) => {
    await labelsPage.clickCreate();
    
    await expect(labelsPage.nameInput).toBeVisible();
    await expect(labelsPage.saveButton).toBeVisible();
  });

  test('should create a new label successfully', async ({ page }) => {
    const testData = {
      name: `Label ${Date.now()}`
    };
    
    await labelsPage.clickCreate();
    await labelsPage.fillLabelForm(testData);
    await labelsPage.save();
    
    await labelsPage.waitForSuccessMessage();
    await expect(page.locator(`text=${testData.name}`)).toBeVisible();
  });

  
  test('should display labels list correctly', async ({ page }) => {
    await expect(labelsPage.labelsTable).toBeVisible();
    
    const count = await labelsPage.getLabelsCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should display label information correctly', async ({ page }) => {
    await expect(page.locator('text=Name')).toBeVisible();
  });

  
  test('should display edit form correctly', async ({ page }) => {
    await labelsPage.editLabel(0);
    
    await expect(labelsPage.nameInput).toBeVisible();
    await expect(labelsPage.saveButton).toBeVisible();
  });

  test('should edit label data successfully', async ({ page }) => {
    const newName = `Edited Label ${Date.now()}`;
    
    await labelsPage.editLabel(0);
    
    await labelsPage.nameInput.clear();
    await labelsPage.nameInput.fill(newName);
    await labelsPage.save();
    
    await page.getByText('Element updated').waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator(`text=${newName}`)).toBeVisible();
  });

  
  test('should delete a single label', async ({ page }) => {
    const initialCount = await labelsPage.getLabelsCount();
    
    await labelsPage.deleteLabel(0);
    
    await labelsPage.waitForDeleteMessage();
    
    const finalCount = await labelsPage.getLabelsCount();
    expect(finalCount).toBeLessThan(initialCount);
  });

  test('should select all labels', async ({ page }) => {
    const initialCount = await labelsPage.getLabelsCount();
    
    await labelsPage.selectAllLabels();
    
    const selectedCount = await page.locator('tbody input[type="checkbox"]:checked').count();
    expect(selectedCount).toBe(initialCount);
  });

  test('should bulk delete all labels', async ({ page }) => {
    const initialCount = await labelsPage.getLabelsCount();
    if (initialCount === 0) return;
    
    await labelsPage.selectAllLabels();
    await labelsPage.delete();
    
    try {
      await page.getByText(/deleted|No.*yet/i)
        .or(page.getByRole('alert'))
        .first()
        .waitFor({ state: 'visible', timeout: 3000 });
    } catch (error) {
      void error;
    }

    await page.waitForTimeout(500);
    const finalCount = await labelsPage.getLabelsCount();
    expect(finalCount).toBeLessThan(initialCount);
  });
});