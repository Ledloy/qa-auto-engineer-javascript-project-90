export class UsersPage {
  constructor(page) {
    this.page = page;
    

    this.usersMenuLink = page.getByRole('menuitem', { name: 'Users' });
    

    this.createButton = page.getByRole('link', { name: 'Create' });
    this.saveButton = page.getByRole('button', { name: 'Save' });

    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    

    this.userTable = page.getByRole('table');
    this.userRows = page.locator('tbody tr');
    

    this.firstNameInput = page.getByRole('textbox', { name: 'First name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last name' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });

    this.successMessage = page.getByText('Element created').or(page.getByText('Element updated'));
    this.deleteMessage = page.getByText('Element deleted');
    this.errorMessage = page.getByText('Incorrect email format').or(page.getByText('Required'));
    
  
    this.selectAllCheckbox = page.getByRole('checkbox', { name: 'Select all' });
  }

  async goto() {
    await this.page.goto('/#/users');
  }

  async openUsersPage() {
    await this.usersMenuLink.click();

    await this.usersMenuLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(500);
  }

  async clickCreate() {
    await this.createButton.click();
    await this.firstNameInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async fillUserForm({ firstName, lastName, email }) {
    if (firstName) await this.firstNameInput.fill(firstName);
    if (lastName) await this.lastNameInput.fill(lastName);
    if (email) await this.emailInput.fill(email);
  }

  async save() {
    await this.saveButton.click();
  }

  async delete() {
    await this.deleteButton.click();
  }

  async editUser(rowIndex = 0) {
    const row = this.userRows.nth(rowIndex);
    
    const emailCell = row.locator('td').nth(2);
    await emailCell.click();
    
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
  }


  async deleteUser(rowIndex = 0) {
    const row = this.userRows.nth(rowIndex);
    
    const checkbox = row.getByRole('checkbox');
    await checkbox.click();
    
    await this.deleteButton.click();
    
    await this.deleteMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async selectUser(rowIndex = 0) {
    const checkbox = this.userRows.nth(rowIndex).getByRole('checkbox');
    await checkbox.click();
  }

  async selectAllUsers() {
    await this.selectAllCheckbox.click();
    await this.page.waitForTimeout(300);
  }

  async getUserCount() {
    if (!await this.userTable.isVisible().catch(() => false)) {
      return 0;
    }
    return await this.userRows.count();
  }

  async waitForSuccessMessage() {
    await this.successMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async waitForDeleteMessage() {
    await this.deleteMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }
}