export class TasksPage {
  constructor(page) {
    this.page = page;
    this.tasksMenuLink = page.getByRole('menuitem', { name: 'Tasks' });
    this.createButton = page.getByRole('link', { name: 'Create' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.assigneeSelect = page.getByRole('combobox', { name: 'Assignee' });
    this.titleInput = page.getByRole('textbox', { name: 'Title' });
    this.contentInput = page.getByRole('textbox', { name: 'Content' });
    this.statusSelect = page.getByRole('combobox', { name: 'Status' });
    this.labelSelect = page.getByRole('combobox', { name: 'Label' });
    this.kanbanColumns = page.getByRole('heading');
    this.taskCards = page.getByRole('link', { name: 'Edit' });
    this.filterAssignee = page.getByRole('combobox', { name: 'Assignee' }).first();
    this.filterStatus = page.getByRole('combobox', { name: 'Status' }).first();
    this.successMessage = page.getByText('Element created').or(page.getByText('Element updated'));
    this.deleteMessage = page.getByText('Element deleted');
    this.kanbanBoard = page.getByRole('heading', { name: 'Draft' }).first();
    this.logoutButton = page.getByRole('button', { name: 'Profile' });
  }

  async goto() {
    await this.page.goto('/#/tasks');
  }

  async openTasksPage() {
    await this.tasksMenuLink.click();
    await this.page.waitForTimeout(1000);
  }

  async clickCreate() {
    await this.createButton.click();
    await this.titleInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async fillTaskForm({ title, content, assignee, status, label }) {
    if (assignee) {
      await this.assigneeSelect.click();
      await this.page.getByRole('option', { name: assignee }).click();
      await this.page.waitForTimeout(300);
    }
    
    if (title) await this.titleInput.fill(title);
    
    if (content) await this.contentInput.fill(content);
    
    if (status) {
      await this.statusSelect.click();
      await this.page.getByRole('option', { name: status }).click();
      await this.page.waitForTimeout(300);
    }
    
    if (label) {
      await this.labelSelect.click();
      await this.page.getByRole('option', { name: label }).click();
      await this.page.waitForTimeout(300);
    }
  }

  async save() {
    await this.saveButton.click();
  }

  async editTask(taskIndex = 0) {
    const editLinks = this.page.getByRole('link', { name: 'Edit' });
    await editLinks.nth(taskIndex).click();
    
    await this.titleInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async deleteTask(taskIndex = 0) {
    await this.editTask(taskIndex);
    await this.deleteButton.click();
    await this.deleteMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async moveTaskToColumn(_taskTitle, targetColumn) {
    await this.editTask(0);
    
    await this.statusSelect.click();
    await this.page.getByRole('option', { name: targetColumn }).click();
    await this.page.waitForTimeout(300);
    
    await this.save();
    await this.page.waitForTimeout(1000);
  }
  
  async filterByStatus(status) {
    await this.filterStatus.click();
    await this.page.getByRole('option', { name: status }).click();
    await this.page.waitForTimeout(300);
  }

  async filterByAssignee(assignee) {
    await this.filterAssignee.click();
    await this.page.getByRole('option', { name: assignee }).click();
    await this.page.waitForTimeout(300);
  }

  async clearFilters() {
    await this.page.reload();
    await this.page.waitForTimeout(1000);
  }

  async getTasksCount() {
    const editLinks = this.page.getByRole('link', { name: 'Edit' });
    return await editLinks.count();
  }

  async isTaskInColumn(taskTitle, columnName) {
    const column = this.page.getByRole('heading', { name: columnName }).first();
    const taskCard = column.locator('button').filter({ hasText: taskTitle });
    return await taskCard.isVisible();
  }

  async waitForSuccessMessage() {
    await this.successMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async waitForDeleteMessage() {
    await this.deleteMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }
}