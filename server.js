const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Создаем папку uploads, если её нет
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Обслуживание статических файлов (картинок)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Статические файлы (например, стикеры и index.html)
app.use(express.static('public'));

// Настройка хранения изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Обработка POST запросов на загрузку изображений
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Слушаем сообщения через WebSocket
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);  // Передаем сообщение всем пользователям
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
