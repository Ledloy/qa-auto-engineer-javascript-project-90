export class LabelsPage {
  constructor(page) {
    this.page = page;
    
 
    this.labelsMenuLink = page.getByRole('menuitem', { name: 'Labels' });
    
 
    this.createButton = page.getByRole('link', { name: 'Create' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    
    this.labelsTable = page.getByRole('table');
    this.labelsRows = page.locator('tbody tr');

    this.nameInput = page.getByRole('textbox', { name: 'Name' });
  
    this.successMessage = page.getByText('Element created').or(page.getByText('Element updated'));
    this.deleteMessage = page.getByText('Element deleted');
    this.errorMessage = page.getByText('Required').or(page.locator('[class*="error"]'));

    this.selectAllCheckbox = page.getByRole('checkbox', { name: 'Select all' });
  }

  async goto() {
    await this.page.goto('/#/labels');
  }

  async openLabelsPage() {
    await this.labelsMenuLink.click();
    await this.labelsMenuLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(500);
  }

  async clickCreate() {
    await this.createButton.click();
    await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async fillLabelForm({ name }) {
    if (name) await this.nameInput.fill(name);
  }

  async save() {
    await this.saveButton.click();
  }

  async delete() {
    await this.deleteButton.click();
  }

  async editLabel(rowIndex = 0) {
    const row = this.labelsRows.nth(rowIndex);
  
    const nameCell = row.locator('td').nth(2);
    await nameCell.click();
    
    await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async deleteLabel(rowIndex = 0) {
    const row = this.labelsRows.nth(rowIndex);
    
    const checkbox = row.getByRole('checkbox');
    await checkbox.click();
    
    await this.deleteButton.click();
    
    await this.deleteMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async selectLabel(rowIndex = 0) {
    const checkbox = this.labelsRows.nth(rowIndex).getByRole('checkbox');
    await checkbox.click();
  }

  async selectAllLabels() {
    await this.selectAllCheckbox.click();
    await this.page.waitForTimeout(300);
  }

  async getLabelsCount() {
    if (!await this.labelsTable.isVisible().catch(() => false)) {
      return 0;
    }
    return await this.labelsRows.count();
  }

  async waitForSuccessMessage() {
    await this.successMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async waitForDeleteMessage() {
    await this.deleteMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }
}