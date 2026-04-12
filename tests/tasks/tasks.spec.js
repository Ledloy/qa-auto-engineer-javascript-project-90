import { test, expect } from '@playwright/test';
import { TasksPage } from '../pages/TasksPage.js';
import { Config } from '../helpers/config.js';
import { TestDataFactory } from '../helpers/test-data.js';
import { loginAsDefault } from '../helpers/auth.helper.js';

test.describe('Tasks Management', () => {
  let tasksPage;

  test.beforeEach(async ({ page }) => {
    tasksPage = new TasksPage(page);

    await loginAsDefault(page);
 
    await tasksPage.openTasksPage();
  });

  test('should display kanban board correctly', async ({ page }) => {
    await expect(page).toHaveURL(/tasks/);
    
    await expect(page.getByRole('heading', { name: 'Draft' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'To Review' })).toBeVisible();
    
    const count = await tasksPage.getTasksCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display task columns correctly', async ({ page }) => {
    await expect(page).toHaveURL(/tasks/);
    
    await expect(page.getByRole('heading', { name: 'Draft' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'To Review' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'To Be Fixed' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'To Publish' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Published' })).toBeVisible();
  });

  test('should display create task form correctly', async ({ page }) => {
    await expect(page).toHaveURL(/tasks/);
    
    await tasksPage.clickCreate();
    
    await expect(tasksPage.titleInput).toBeVisible();
    await expect(tasksPage.assigneeSelectInForm).toBeVisible();
    await expect(tasksPage.statusSelectInForm).toBeVisible();
    await expect(tasksPage.saveButton).toBeVisible();
  });

  test('should create a new task successfully', async ({ page }) => {
    await expect(page).toHaveURL(/tasks/);
    
    const testData = TestDataFactory.createTask();
    
    await tasksPage.clickCreate();
    await tasksPage.fillTaskForm(testData);
    await tasksPage.save();
    
    await tasksPage.waitForSuccessMessage();
    await expect(page.locator(`text=${testData.title}`)).toBeVisible();
  });

  test('should display edit form correctly', async ({ page }) => {
    await expect(page).toHaveURL(/tasks/);
    
    const count = await tasksPage.getTasksCount();
    if (count === 0) {
      const taskForEdit = TestDataFactory.createTask();
      await tasksPage.clickCreate();
      await tasksPage.fillTaskForm(taskForEdit);
      await tasksPage.save();
      await tasksPage.waitForSuccessMessage();
      await tasksPage.openTasksPage();
    }
    
    await tasksPage.editTask(0);
    
    await expect(tasksPage.titleInput).toBeVisible();
    await expect(tasksPage.saveButton).toBeVisible();
  });

  test('should edit task data successfully', async ({ page }) => {
    await expect(page).toHaveURL(/tasks/);
    
    const count = await tasksPage.getTasksCount();
    if (count === 0) {
      const taskForEdit2 = TestDataFactory.createTask();
      await tasksPage.clickCreate();
      await tasksPage.fillTaskForm(taskForEdit2);
      await tasksPage.save();
      await tasksPage.waitForSuccessMessage();
      await tasksPage.openTasksPage();
    }
    
    const newTitle = `Edited ${Date.now()}`;
    
    await tasksPage.editTask(0);
    await tasksPage.titleInput.clear();
    await tasksPage.titleInput.fill(newTitle);
    await tasksPage.save();
    
    await expect(page.getByText(Config.messages.updated)).toBeVisible();
    await expect(page.locator(`text=${newTitle}`)).toBeVisible();
  });

  test('should filter tasks by status', async ({ page }) => {
    await expect(page).toHaveURL(/tasks/);
    
    const filterTask = TestDataFactory.createTask();
    await tasksPage.clickCreate();
    await tasksPage.fillTaskForm(filterTask);
    await tasksPage.save();
    await tasksPage.waitForSuccessMessage();
    await tasksPage.openTasksPage();
    
    const countBeforeFilter = await tasksPage.getTasksCount();
    await tasksPage.filterByStatus('Draft');
  
    const isInDraft = await tasksPage.isTaskInColumn(filterTask.title, 'Draft');
    expect(isInDraft).toBe(true);
    
    await expect(
      page.locator(`.MuiTypography-h5`, { hasText: filterTask.title })
    ).toBeVisible();
    
    const countAfterFilter = await tasksPage.getTasksCount();
    expect(countAfterFilter).toBeLessThanOrEqual(countBeforeFilter);
    await tasksPage.clearFilters();
    
    await expect(page.getByRole('heading', { name: 'Draft' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'To Review' })).toBeVisible();
  });

  test('should filter tasks by assignee', async ({ page }) => {
    await expect(page).toHaveURL(/tasks/);
    
    await tasksPage.filterByAssignee(Config.defaultAssignee);
    await expect(page.getByRole('heading', { name: 'Draft' })).toBeVisible();
    await tasksPage.clearFilters();
  });
  
  test('should delete a single task', async ({ page }) => {
    await expect(page).toHaveURL(/tasks/);
    
    const initialCount = await tasksPage.getTasksCount();
    if (initialCount === 0) return;
    
    await tasksPage.deleteTask(0);
    
    const finalCount = await tasksPage.getTasksCount();
    expect(finalCount).toBeLessThan(initialCount);
  });

  test('should update task status and move it to another column', async ({ page }) => {
    await expect(page).toHaveURL(/tasks/);
    
    const taskTitle = `StatusTest ${Date.now()}`;
  
    const taskData = TestDataFactory.createTask({ title: taskTitle, status: 'Draft' });
    await tasksPage.clickCreate();
    await tasksPage.fillTaskForm(taskData);
    await tasksPage.save();
    await page.getByText(Config.messages.created).waitFor({ state: 'visible', timeout: 10000 });
  
    await page.goto(Config.urls.tasks);
    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.getByRole('heading', { name: 'Draft' }).waitFor({ state: 'visible', timeout: 10000 })
    ]);
  
    let isInDraft = await tasksPage.isTaskInColumn(taskTitle, 'Draft');
    expect(isInDraft).toBe(true);
 
    const taskButton = page.getByRole('button').filter({ hasText: taskTitle }).first();
    await taskButton.click();
 
    await taskButton.getByLabel('Edit').click();
    await tasksPage.titleInput.waitFor({ state: 'visible', timeout: 10000 });
 
    await page.getByRole('combobox', { name: /Status/ }).click();
   
    await page.getByRole('option', { name: 'To Review' }).waitFor({ 
      state: 'visible', 
      timeout: 5000 
    });
  
    await page.getByRole('option', { name: 'To Review' }).click();
 
    await page.getByRole('combobox', { name: /Status/ }).waitFor({ 
      state: 'visible', 
      timeout: 5000 
    });
    
    await page.getByRole('button', { name: 'Save' }).click();
   
    await page.getByText(Config.messages.updated).waitFor({ 
      state: 'visible', 
      timeout: 10000 
    });
    
    await page.goto(Config.urls.tasks);
    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.getByRole('heading', { name: 'Draft' }).waitFor({ state: 'visible', timeout: 10000 })
    ]);

    const isInToReview = await tasksPage.isTaskInColumn(taskTitle, 'To Review');
    expect(isInToReview).toBe(true);
    
    isInDraft = await tasksPage.isTaskInColumn(taskTitle, 'Draft');
    expect(isInDraft).toBe(false);
  });
});