export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.profileButton = page.getByRole('button', { name: 'Profile' });
   
    this.logoutButton = page.getByTestId('PowerSettingsNewIcon');
    this.header = page.getByRole('heading', { name: 'Welcome to the administration' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async logout() {
   
    await this.profileButton.click();
    await this.logoutButton.click();
  }

  async isLoggedIn() {
    return await this.profileButton.isVisible();
  }

  async isVisible() {
    return await this.header.isVisible().catch(() => true);
  }
}