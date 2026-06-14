const WebSocket = require('ws');
const http = require('http');

// Render сам назначает порт через переменную окружения
const port = process.env.PORT || 10000;
const server = http.createServer();
const wss = new WebSocket.Server({ server });

console.log("Сервер запускается...");

wss.on('connection', (ws) => {
    console.log("Новый игрок подключился!");
    
    ws.on('message', (message) => {
        // Логика игры
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

// Слушаем порт
server.listen(port, () => {
    console.log('Сервер запущен на порту ' + port);
});

// "Будильник", чтобы Render не засыпал
setInterval(() => {
    console.log("Сервер активен: " + new Date().toLocaleTimeString());
}, 300000); // каждые 5 минут
