export const Config = {
  baseUrl: 'http://localhost:5173',
  urls: {
    login: '/#/login',
    tasks: '/#/tasks',
    dashboard: '/#/'
  },
  timeouts: {
    default: 10000,
    pageLoad: 3000,
    dragDrop: 2000,
    formFill: 300,
    successMessage: 10000
  },
  selectors: {
    columns: ['Draft', 'To Review', 'To Be Fixed', 'To Publish', 'Published'],
    defaultAssignee: 'emily@example.com',
    successMessages: ['Element created', 'Element updated', 'Element deleted']
  },
  users: {
    default: {
      username: 'admin',
      password: 'admin'
    }
  }
};