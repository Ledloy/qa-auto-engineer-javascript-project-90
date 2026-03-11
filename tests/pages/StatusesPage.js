export class StatusesPage {
  constructor(page) {
    this.page = page;
    
  
    this.statusesMenuLink = page.getByRole('menuitem', { name: 'Task statuses' });

    this.createButton = page.getByRole('link', { name: 'Create' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });

    this.statusesTable = page.getByRole('table');
    this.statusesRows = page.locator('tbody tr');

    this.nameInput = page.getByRole('textbox', { name: 'Name' });
    this.slugInput = page.getByRole('textbox', { name: 'Slug' });
    

    this.successMessage = page.getByText('Element created').or(page.getByText('Element updated'));
    this.deleteMessage = page.getByText('Element deleted');
    this.errorMessage = page.getByText('Required').or(page.locator('[class*="error"]'));
    
    this.selectAllCheckbox = page.getByRole('checkbox', { name: 'Select all' });
  }

  async goto() {
    await this.page.goto('/#/task_statuses');
  }

  async openStatusesPage() {
    await this.statusesMenuLink.click();
    await this.statusesMenuLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(500);
  }

  async clickCreate() {
    await this.createButton.click();
    await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async fillStatusForm({ name, slug }) {
    if (name) await this.nameInput.fill(name);
    if (slug) await this.slugInput.fill(slug);
  }

  async save() {
    await this.saveButton.click();
  }

  async delete() {
    await this.deleteButton.click();
  }

  async editStatus(rowIndex = 0) {
    const row = this.statusesRows.nth(rowIndex);
    
    const nameCell = row.locator('td').nth(2);
    await nameCell.click();
    
    await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async deleteStatus(rowIndex = 0) {
    const row = this.statusesRows.nth(rowIndex);
    
    const checkbox = row.getByRole('checkbox');
    await checkbox.click();
    
    await this.deleteButton.click();
    
    await this.deleteMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async selectStatus(rowIndex = 0) {
    const checkbox = this.statusesRows.nth(rowIndex).getByRole('checkbox');
    await checkbox.click();
  }

  async selectAllStatuses() {
    await this.selectAllCheckbox.click();
    await this.page.waitForTimeout(300);
  }

  async getStatusesCount() {
    if (!await this.statusesTable.isVisible().catch(() => false)) {
      return 0;
    }
    return await this.statusesRows.count();
  }

  async waitForSuccessMessage() {
    await this.successMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async waitForDeleteMessage() {
    await this.deleteMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }
}