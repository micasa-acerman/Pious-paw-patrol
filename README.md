# Телеграм бот для организации молитвенных пар

Этот проект представляет собой пример простого телеграм-бота, который помогает организовать молитвенные пары между пользователями. Бот позволяет пользователям объединяться в пары и молиться друг за друга и за нужды ближних.

## Начало работы

Для начала работы с этим ботом, выполните следующие шаги:

1. Установите необходимые зависимости с помощью npm:

   ```bash
   npm install
   ```

2. Создайте файл `.env` в корневой директории вашего проекта и определите в нем переменные окружения:

   ```
   BOT_TOKEN=ваш_токен
   CHAT_DATA_FILENAME=chat_data.json
   CHAT_USERS_FILENAME=chat_users.json
   SHEDULE_INTERVAL=60000
   ```

   Замените `ваш_токен` на токен вашего бота. Вы также можете настроить названия файлов и интервал опроса в зависимости от ваших потребностей.

3. Запустите бот:

   ```bash
   node bot.js
   ```

   Замените `bot.js` на имя вашего файла с кодом.

4. Бот будет доступен в вашем чате. Вы можете использовать команду `/start`, чтобы начать взаимодействие с ботом.

## Команды бота

- `/start`: Начало взаимодействия с ботом. Выберите действие.

- `Добавить помощника!`: Добавляет чат пользователя в список чатов, где бот будет организовывать молитвенные партнерства.

## Расписание опросов

Бот автоматически создает опросы для организации молитвенных партнерств в соответствии с заданным расписанием. Вы можете настроить расписание в переменной `shedule` в вашем коде.

## Переменные окружения

В проекте используются переменные окружения для безопасного хранения конфиденциальных данных, таких как токен бота. Убедитесь, что вы настроили файл `.env` с необходимыми переменными окружения.

## Зависимости

- `node-telegram-bot-api`: библиотека для взаимодействия с API Telegram Bot.

## Автор

Мрикаев Константин
