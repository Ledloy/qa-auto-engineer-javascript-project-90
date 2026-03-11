export class TestDataFactory {
  static generateUnique(prefix = 'Test') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
  
  static createTask(overrides = {}) {
    const defaults = {
      title: this.generateUnique('Task'),
      content: 'Auto-generated test task',
      assignee: 'emily@example.com',
      status: 'Draft',
      label: null
    };
    return { ...defaults, ...overrides };
  }
  
  static createUser(overrides = {}) {
    const defaults = {
      username: 'admin',
      password: 'admin',
      email: 'emily@example.com'
    };
    return { ...defaults, ...overrides };
  }
  
  static getTaskStatuses() {
    return [
      { name: 'Draft', expected: 'Draft' },
      { name: 'To Review', expected: 'To Review' },
      { name: 'To Be Fixed', expected: 'To Be Fixed' },
      { name: 'To Publish', expected: 'To Publish' },
      { name: 'Published', expected: 'Published' }
    ];
  }
}