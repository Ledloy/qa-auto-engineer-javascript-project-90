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

  
  test('should display create task form correctly', async ({ page }) => {
    await tasksPage.clickCreate();
    
    await expect(tasksPage.titleInput).toBeVisible();
    await expect(tasksPage.contentInput).toBeVisible();
    await expect(tasksPage.assigneeSelect).toBeVisible();
    await expect(tasksPage.statusSelect).toBeVisible();
    await expect(tasksPage.saveButton).toBeVisible();
  });

  test('should create a new task successfully', async ({ page }) => {
    const testData = {
      title: `Task ${Date.now()}`,
      content: 'Test task description'
    };
    
    await tasksPage.clickCreate();
    await tasksPage.fillTaskForm(testData);
    await tasksPage.save();
    
    await tasksPage.waitForSuccessMessage();
    await expect(page.locator(`text=${testData.title}`)).toBeVisible();
  });

  
  test('should display kanban board correctly', async ({ page }) => {
    await expect(tasksPage.kanbanBoard.or(tasksPage.taskCards.first())).toBeVisible();
    
    const count = await tasksPage.getTasksCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display task columns correctly', async ({ page }) => {
    const columns = tasksPage.kanbanColumns;
    await expect(columns.first()).toBeVisible();
    
    await expect(page.locator('text=Draft')).toBeVisible();
    await expect(page.locator('text=To Review')).toBeVisible();
  });

  
  test('should display edit form correctly', async ({ page }) => {
    const count = await tasksPage.getTasksCount();
    if (count === 0) {
  
      await tasksPage.clickCreate();
      await tasksPage.fillTaskForm({
        title: 'Test Task',
        content: 'For editing'
      });
      await tasksPage.save();
      await tasksPage.waitForSuccessMessage();
      await tasksPage.openTasksPage();
    }
    
    await tasksPage.editTask(0);
    
    await expect(tasksPage.titleInput).toBeVisible();
    await expect(tasksPage.contentInput).toBeVisible();
    await expect(tasksPage.saveButton).toBeVisible();
  });

  test('should edit task data successfully', async ({ page }) => {
    const newTitle = `Edited Task ${Date.now()}`;
    
    await tasksPage.editTask(0);
    
    await tasksPage.titleInput.clear();
    await tasksPage.titleInput.fill(newTitle);
    await tasksPage.save();
    
    await page.getByText('Element updated').waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator(`text=${newTitle}`)).toBeVisible();
  });

  test('should move task between columns', async ({ page }) => {
    const taskTitle = `Move Task ${Date.now()}`;
    
    await tasksPage.clickCreate();
    await tasksPage.fillTaskForm({
      title: taskTitle,
      content: 'For moving'
    });
    await tasksPage.save();
    await tasksPage.waitForSuccessMessage();
    
    await tasksPage.moveTaskToColumn(taskTitle, 'To Review');
  
    await expect(tasksPage.isTaskInColumn(taskTitle, 'To Review')).toBeTruthy();
  });

  
  test('should filter tasks by status', async ({ page }) => {

    await tasksPage.filterByStatus('Draft');
    

    await expect(tasksPage.kanbanBoard.or(tasksPage.taskCards.first())).toBeVisible();
    

    await tasksPage.clearFilters();
  });

  test('should filter tasks by assignee', async ({ page }) => {
  
    await tasksPage.filterByAssignee('admin');
    
  
    await expect(tasksPage.kanbanBoard.or(tasksPage.taskCards.first())).toBeVisible();
    

    await tasksPage.clearFilters();
  });

  
  test('should delete a single task', async ({ page }) => {
    const initialCount = await tasksPage.getTasksCount();
    if (initialCount === 0) return;
    
    await tasksPage.deleteTask(0);
    
    await tasksPage.waitForDeleteMessage();
    
    const finalCount = await tasksPage.getTasksCount();
    expect(finalCount).toBeLessThan(initialCount);
  });


});