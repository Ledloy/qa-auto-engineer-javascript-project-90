export const Config = {
  baseUrl: 'http://localhost:5173',
  urls: {
    login: '/#/login',
    tasks: '/#/tasks',
    users: '/#/users',
    statuses: '/#/task_statuses',
    labels: '/#/labels',
    dashboard: '/#/'
  },
  timeouts: {
    default: 10000,
    pageLoad: 3000,
    dragDrop: 2000,
    formFill: 500,
    navigation: 5000
  },
  messages: {
    created: 'Element created',
    updated: 'Element updated', 
    deleted: 'Element deleted'
  },
  users: {
    default: {
      username: 'admin',
      password: 'admin'
    }
  },
  defaultAssignee: 'emily@example.com'
};