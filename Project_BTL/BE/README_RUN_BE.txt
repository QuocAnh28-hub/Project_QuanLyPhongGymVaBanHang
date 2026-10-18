QA-GYM BACKEND - RUN ON WINDOWS POWERSHELL

1) Open PowerShell in project root:
   cd "C:\Users\Hoang\Documents\mobie da nen tang\BTL\Project_QuanLyPhongGymVaBanHang\BE"

2) Install dependencies:
   npm install

3) Check .env and adjust MySQL credentials if needed:
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=123456
   DB_NAME=gym_management
   PORT=3000

4) Start backend:
   npm run dev
   or:
   npm start

5) Test in browser/Postman:
   http://localhost:3000/
   http://localhost:3000/health
   http://localhost:3000/taikhoan

If /health returns database:error, check MySQL is running, credentials in .env, and database gym_management exists.
