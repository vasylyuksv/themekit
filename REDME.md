Shopify + Theme Kit + Git

Работа на уровне конкретной темы (необходим ее ID)


1. ThemeKit - install
- скачать с ресурса https://shopify.github.io/themekit/
- положить например C:\Program Files\themekit
- добавить в переменные среды PATH - https://i.imgur.com/Z3RngwN.png

2. Shopify:
- Создать свою "Private apps" с правами для "Themes" на чтение и запись


3. Локальная папка
- создать файл config.yml ([your-api-password] + "[your-theme-id]" + [your-store].myshopify.com)
- в локальной папке  - "theme download" (качаем всю тему на свой компьютер) или через "theme get" с параметрами
- во время работы можно использовать - "theme watch" - отслеживает изменные файлы и деплоит на сервер

4. GIT
- в локальной папке "git init" создаем файл .git
- комитим/пушим файлы в проект GitHub



Сценарий работы:
https://www.youtube.com/watch?v=-PHhY9aqB8g
1. theme download обновить локальные файлы
2. git diff сравнить файлы с прода и с репозитория. Комит/пуш изменения с прода в репу
3. theme deploy - загрузить файлы на прод