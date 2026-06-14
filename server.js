const WebSocket = require('ws');
const http = require('http');

const port = process.env.PORT || 10000;
const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log("Игрок подключился к my-game-server!");
    
    ws.on('message', (message) => {
        const msg = message.toString();
        // Рассылаем сообщение всем подключенным
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    });
});

server.listen(port, () => console.log('my-game-server запущен на порту ' + port));
