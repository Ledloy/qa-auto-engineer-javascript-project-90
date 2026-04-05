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
    await this.kanbanBoard.waitFor({ state: 'visible', timeout: 5000 });
  }

  async clickCreate() {
    await this.createButton.click();
    await this.titleInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async fillTaskForm({ title, content, assignee, status, label }) {
    if (assignee) {
      await this.assigneeSelect.click();
      await this.page.getByRole('option', { name: assignee }).click();
      await this.page.getByRole('combobox', { name: 'Assignee' }).waitFor({ state: 'visible', timeout: 5000 });
    }
    
    if (title) await this.titleInput.fill(title);
    
    if (content) await this.contentInput.fill(content);
    
    if (status) {
      await this.statusSelect.click();
      await this.page.getByRole('option', { name: status }).click();
      await this.page.getByRole('combobox', { name: 'Status' }).waitFor({ state: 'visible', timeout: 5000 });
    }
    
    if (label) {
      await this.labelSelect.click();
      await this.page.getByRole('option', { name: label }).click();
      await this.page.getByRole('combobox', { name: 'Label' }).waitFor({ state: 'visible', timeout: 5000 });
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

  async moveTaskToNextColumn(taskTitle) {
const page = this.page;
    
    const columns = page.locator('div[data-rfd-droppable-id]');
const colCount = await columns.count();
if (colCount < 2) throw new Error('Недостаточно колонок для перемещения');

// Найти карточку глобально (последняя версия в DOM)
const cardTitleLocator = page.locator(`.MuiTypography-h5`, { hasText: taskTitle }).first();
await cardTitleLocator.waitFor({ state: 'visible', timeout: 10000 });

// Найти и обновить локатор draggable по тому же заголовку (актуальный элемент)
const cardDraggable = page.locator('[data-rfd-draggable-id]').filter({ has: cardTitleLocator }).first();
await cardDraggable.scrollIntoViewIfNeeded();

// Определить sourceIndex
let sourceIndex = -1;
for (let i = 0; i < colCount; i++) {
  if ((await columns.nth(i).locator(`.MuiTypography-h5`, { hasText: taskTitle }).count()) > 0) {
    sourceIndex = i;
    break;
  }
}
if (sourceIndex === -1) throw new Error('Исходная колонка не найдена');

const targetIndex = (sourceIndex + 1) % colCount;
const targetColumn = columns.nth(targetIndex);

// Найти контейнер колонки (верхний блок с h6)
const columnContainer = targetColumn.locator('xpath=ancestor::div[contains(@class,"MuiBox-root")][1]');
const headingLocator = columnContainer.locator('h6').first();
const raw = (await headingLocator.textContent().catch(() => '')) || '';
const targetName = raw.trim() || `column-${targetIndex}`;

await cardDraggable.waitFor({ state: 'visible', timeout: 10000 });
await targetColumn.waitFor({ state: 'visible', timeout: 10000 });
await page.waitForTimeout(150);

// Попробовать dragTo: сначала простой вызов, если не сработает — с координатами центра
try {
  await cardDraggable.dragTo(targetColumn);
} catch (err) {
  // fallback: вычислить центр и передать как объект координат
  try {
    const box = await targetColumn.boundingBox();
    if (box) {
      const center = { x: Math.floor(box.width / 2), y: Math.floor(box.height / 2) };
      await cardDraggable.dragTo(targetColumn, { targetPosition: center });
    } else {
      throw err;
    }
  } catch (innerErr) {
    console.log('dragTo fallback failed:', innerErr);
    // Попробовать mouse-based drag как запасной план
    try {
      const srcBox = await cardDraggable.boundingBox();
      const dstBox = await targetColumn.boundingBox();
      if (srcBox && dstBox) {
        await page.mouse.move(srcBox.x + srcBox.width / 2, srcBox.y + srcBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(dstBox.x + dstBox.width / 2, dstBox.y + dstBox.height / 2, { steps: 15 });
        await page.mouse.up();
      } else {
        throw innerErr;
      }
    } catch (mouseErr) {
      console.log('mouse drag fallback failed:', mouseErr);
      throw innerErr;
    }
  }
}

// Подождать коротко, дать UI применить изменения/анимацию
await page.waitForTimeout(400);

// Журнал и проверка: сколько найдено глобально и в целевой колонке
const globalCount = await page.locator('.MuiTypography-h5', { hasText: taskTitle }).count();
const inTarget = await targetColumn.locator('.MuiTypography-h5', { hasText: taskTitle }).count();
console.log('after drag - globalCount:', globalCount, 'inTarget:', inTarget, 'targetName:', targetName);

// Ждать successMessage как индикатор завершения перемещения (если есть)
await this.successMessage.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

// Если не найдено в target, собрать debug и бросить ошибку
if (inTarget === 0) {
  console.log('DEBUG: targetColumn.innerHTML:', await targetColumn.innerHTML().catch(() => 'failed to get innerHTML'));
  await page.screenshot({ path: `debug-drag-${Date.now()}.png` }).catch(() => {});
  throw new Error(`Task "${taskTitle}" did not appear in target column "${targetName}" after drag`);
}

return targetName;
}

  async filterByStatus(status) {
    await this.filterStatus.click();
    await this.page.getByRole('option', { name: status }).click();
    await this.page.getByRole('combobox', { name: 'Status' }).waitFor({ state: 'visible', timeout: 5000 });
  }

  async filterByAssignee(assignee) {
    await this.filterAssignee.click();
    await this.page.getByRole('option', { name: assignee }).click();
    await this.page.getByRole('combobox', { name: 'Assignee' }).waitFor({ state: 'visible', timeout: 5000 });
  }

  async clearFilters() {
    await this.page.reload();
    await this.kanbanBoard.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getTasksCount() {
    const editLinks = this.page.getByRole('link', { name: 'Edit' });
    return await editLinks.count();
  }

  async isTaskInColumn(taskTitle, columnName) {
  const columns = this.page.locator('div:has(> h6)'); // контейнеры с непосредственным h6
  const count = await columns.count();
  for (let i = 0; i < count; i++) {
    const col = columns.nth(i);
    const headingText = (await col.locator('h6').first().textContent())?.trim() || '';
    if (headingText === columnName) {
      return (await col.locator('.MuiTypography-h5', { hasText: taskTitle }).count()) > 0;
    }
  }
  return false;
}



  async waitForSuccessMessage() {
    await this.successMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async waitForDeleteMessage() {
    await this.deleteMessage.first().waitFor({ state: 'visible', timeout: 10000 });
  }
}