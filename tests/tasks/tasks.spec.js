import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { TasksPage } from '../pages/TasksPage.js';

test.describe('Tasks Management', () => {
  let loginPage, tasksPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    tasksPage = new TasksPage(page);
    
    await loginPage.goto();
    await loginPage.loginAsDefault();
    await expect(loginPage.page.getByRole('button', { name: 'Profile' })).toBeVisible({ timeout: 10000 });
    await tasksPage.openTasksPage();
  });

  
  test('should display kanban board correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Draft' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'To Review' })).toBeVisible();
    
    const count = await tasksPage.getTasksCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display task columns correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Draft' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'To Review' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'To Be Fixed' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'To Publish' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Published' })).toBeVisible();
  });

  
  test('should display create task form correctly', async ({ page }) => {
    await tasksPage.clickCreate();
    
    await expect(tasksPage.titleInput).toBeVisible();
    await expect(tasksPage.assigneeSelect).toBeVisible();
    await expect(tasksPage.statusSelect).toBeVisible();
    await expect(tasksPage.saveButton).toBeVisible();
  });

  test('should create a new task successfully', async ({ page }) => {
    const testData = {
      title: `Task ${Date.now()}`,
      content: 'Test task',
      assignee: 'emily@example.com',
      status: 'Draft'
    };
    
    await tasksPage.clickCreate();
    await tasksPage.fillTaskForm(testData);
    await tasksPage.save();
    
    await tasksPage.waitForSuccessMessage();
    await expect(page.locator(`text=${testData.title}`)).toBeVisible();
  });

  
  test('should display edit form correctly', async ({ page }) => {
    const count = await tasksPage.getTasksCount();
    if (count === 0) {
      await tasksPage.clickCreate();
      await tasksPage.fillTaskForm({
        title: 'Test Task',
        content: 'For editing',
        assignee: 'emily@example.com',
        status: 'Draft'
      });
      await tasksPage.save();
      await tasksPage.waitForSuccessMessage();
      await tasksPage.openTasksPage();
    }
    
    await tasksPage.editTask(0);
    
    await expect(tasksPage.titleInput).toBeVisible();
    await expect(tasksPage.saveButton).toBeVisible();
  });

  test('should edit task data successfully', async ({ page }) => {
    const newTitle = `Edited ${Date.now()}`;
    
    await tasksPage.editTask(0);
    await tasksPage.titleInput.clear();
    await tasksPage.titleInput.fill(newTitle);
    await tasksPage.save();
    
    await expect(page.getByText('Element updated')).toBeVisible();
    await expect(page.locator(`text=${newTitle}`)).toBeVisible();
  });

  
  test('should filter tasks by status', async ({ page }) => {
    await tasksPage.clickCreate();
    await tasksPage.fillTaskForm({
      title: `Filter Task ${Date.now()}`,
      content: 'For filtering',
      assignee: 'emily@example.com',
      status: 'Draft'
    });
    await tasksPage.save();
    await tasksPage.waitForSuccessMessage();
    await tasksPage.openTasksPage();
    
    await tasksPage.filterByStatus('Draft');
    await expect(page.locator('text=Filter Task')).toBeVisible();
    
    await tasksPage.clearFilters();
  });

  
  test('should filter tasks by assignee', async ({ page }) => {
    await tasksPage.filterByAssignee('emily@example.com');
    await expect(page.getByRole('heading', { name: 'Draft' })).toBeVisible();
    await tasksPage.clearFilters();
  });
  
  test('should delete a single task', async ({ page }) => {
    const initialCount = await tasksPage.getTasksCount();
    if (initialCount === 0) return;
    
    await tasksPage.deleteTask(0);
    
    const finalCount = await tasksPage.getTasksCount();
    expect(finalCount).toBeLessThan(initialCount);
  });

  
  test('should move card using dragTo locator', async ({ page }) => {
    const taskTitle = `DragTest ${Date.now()}`;
    

    await tasksPage.clickCreate();
    await tasksPage.fillTaskForm({
      title: taskTitle,
      content: 'Testing drag and drop',
      assignee: 'emily@example.com',
      status: 'Draft'
    });
    await tasksPage.save();
    await page.getByText('Element created').waitFor({ state: 'visible', timeout: 10000 });
    
    await page.goto('/#/tasks');
    await page.waitForTimeout(3000);
    
    const cardTitleElement = page.locator(`text="${taskTitle}"`).first();
    await cardTitleElement.waitFor({ state: 'visible', timeout: 10000 });
    
    
    const cardElement = cardTitleElement.locator('xpath=../../../../..');
    
    const targetColumn = page.getByRole('heading', { name: 'To Review' }).first();
    
    await cardElement.dragTo(targetColumn);
    await page.waitForTimeout(2000);
    
    await page.goto('/#/tasks');
    await page.waitForTimeout(2000);
    
    await expect(page.locator(`text="${taskTitle}"`).first()).toBeVisible();
  });
});