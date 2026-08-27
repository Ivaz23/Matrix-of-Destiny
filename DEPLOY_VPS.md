# 🚀 Руководство по развертыванию Chubuk Matrix на VPS

Портал построен на стеке **Node.js 22 (Express API Proxy)** + **React 19 (Vite SPA)**.  
Все секретные ключи (`GEMINI_API_KEY`) защищены на стороне сервера.

---

## ⚡ Способ 1: Самый быстрый и легкий (PM2 — рекомендуется для 1 GB RAM)

### 1. Подключитесь к вашему VPS по SSH:
```bash
ssh root@YOUR_SERVER_IP
```

### 2. Загрузите проект или скопируйте файлы:
```bash
git clone YOUR_REPO_URL /opt/chubuk-matrix
cd /opt/chubuk-matrix
```
*(или загрузите архив проекта и распакуйте в папку)*

### 3. Настройте файл `.env`:
```bash
nano .env
```
Вставьте:
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=ваш_ключ_gemini
```
*(Сохранить: `Ctrl+O`, `Enter`, выход: `Ctrl+X`)*

### 4. Запустите автоматический скрипт:
```bash
chmod +x deploy.sh
./deploy.sh
```

Готово! Приложение запустится на порту `3000` и автоматически перезагрузится при рестарте сервера.

**Полезные команды PM2:**
```bash
pm2 status                  # Статус работы
pm2 logs chubuk-matrix      # Просмотр логов в реальном времени
pm2 restart chubuk-matrix   # Перезапуск
```

---

## 🐳 Способ 2: Запуск через Docker Compose

Если вы предпочитаете Docker:

```bash
cd /opt/chubuk-matrix

# 1. Создайте .env с ключом
echo "GEMINI_API_KEY=ваш_ключ" > .env

# 2. Соберите и запустите контейнер
docker compose up -d --build

# 3. Проверка статуса
docker compose ps
docker compose logs -f
```

---

## 🔒 Способ 3: Настройка Nginx + бесплатный SSL (HTTPS / Домен)

Чтобы приложение открывалось по вашему домену `https://your-domain.com`:

### 1. Установите Nginx и Certbot:
```bash
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 2. Создайте конфигурацию Nginx:
```bash
sudo nano /etc/nginx/sites-available/chubuk.conf
```

Вставьте:
```nginx
server {
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Активируйте сайт и выпустите SSL сертификат:
```bash
sudo ln -s /etc/nginx/sites-available/chubuk.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Выпуск бесплатного SSL сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Теперь ваш портал работает на `https://your-domain.com` с защищенным шифрованием SSL!
