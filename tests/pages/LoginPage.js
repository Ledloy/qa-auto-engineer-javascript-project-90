export class LoginPage {
  constructor(page) {
    this.page = page;
    
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.logoutButton = page.getByRole('button', { name: 'Profile' }).or(page.getByText('Выйти')).or(page.getByText('Logout'));
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/');
    await this.usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginAsDefault() {
    await this.login('admin', 'admin');
  }

  async isVisible() {
    return await this.usernameInput.isVisible();
  }
}