# Task Manager - Playwright Test Automation

[![Playwright](https://img.shields.io/badge/Playwright-1.40.0-2eada8.svg)](https://playwright.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933.svg)](https://nodejs.org)
[![GitHub Actions](https://github.com/Ledloy/qa-auto-engineer-javascript-project-90/actions/workflows/playwright.yml/badge.svg)](https://github.com/Ledloy/qa-auto-engineer-javascript-project-90/actions)

## 🎯 Цель проекта

Автоматизированное тестирование приложения управления задачами, разработанного с использованием **react-admin**, с помощью инструмента **Playwright**.

## 📋 Описание

**Task Manager** — система управления задачами (аналог Redmine). Приложение позволяет:
- 📝 Создавать, редактировать, удалять и перемещать задачи
- 👥 Управлять пользователями (для администраторов)
- 🏷️ Создавать и редактировать метки задач
- 📊 Настраивать статусы задач для Kanban-доски

## 🛠️ Технологический стек

| Технология | Назначение |
|-----------|-----------|
| Playwright | Фреймворк для автоматизации тестирования |
| JavaScript (ES6+) | Язык написания тестов |
| Page Object Model | Паттерн организации кода |
| GitHub Actions | CI/CD для запуска тестов |

# 🚀 Установка и запуск

## Требования
Node.js 20.x или выше
npm 10.x или выше

## Клонировать проект
git clone <URL-вашего-репозитория>

cd <имя-проекта>

## Установить зависимости

```bash
npm ci
```

## Установить браузеры Playwright
```bash
npx playwright install --with-deps
```

## Запустить все тесты
```bash
npx playwright test
```

## Запустить с браузером (для отладки)
```bash
npx playwright test --headed
```

## Сгенерировать отчёт
```bash
npx playwright test && npx playwright show-report
```

