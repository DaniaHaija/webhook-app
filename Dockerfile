# 1. نختار النسخة التي يعمل عليها Node.js
FROM node:22-bookworm-slim

# 2. نحدد مكان العمل داخل الحاوية
WORKDIR /usr/src/app

# 3. ننسخ ملفات التعريف أولاً لسرعة التحميل
COPY package*.json ./
RUN npm install

# 4. ننسخ بقية ملفات المشروع
COPY . .

# 5. نقوم بتحويل الكود من TS إلى JS (Build)
RUN npm run build

# 6. نشغل التطبيق
CMD ["node", "dist/index.js"]