const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });
let rooms = {};

wss.on('connection', (ws) => {
    let currentRoom = null;
    let playerId = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'create_room') {
                currentRoom = data.roomCode;
                playerId = "host";
                rooms[currentRoom] = { hostWs: ws, clientWs: null, players: { host: { x: 50, y: 250, hp: 100, dir: 1 }, client: { x: 550, y: 250, hp: 100, dir: -1 } }, bullets: [] };
                ws.send(JSON.stringify({ type: 'room_created', id: 'host' }));
            }
            if (data.type === 'join_room') {
                currentRoom = data.roomCode;
                if (rooms[currentRoom] && !rooms[currentRoom].clientWs) {
                    playerId = "client";
                    rooms[currentRoom].clientWs = ws;
                    ws.send(JSON.stringify({ type: 'room_joined', id: 'client' }));
                    rooms[currentRoom].hostWs.send(JSON.stringify({ type: 'start_game' }));
                    ws.send(JSON.stringify({ type: 'start_game' }));
                }
            }
            if (data.type === 'move' && rooms[currentRoom]) {
                const p = rooms[currentRoom].players[playerId];
                if (p && p.hp > 0) { p.x = data.x; p.dir = data.dir; }
            }
            if (data.type === 'shoot' && rooms[currentRoom]) {
                const p = rooms[currentRoom].players[playerId];
                if (p && p.hp > 0) {
                    rooms[currentRoom].bullets.push({ owner: playerId, x: p.x + 15, y: p.y + 10, dir: p.dir, speed: 10 });
                }
            }
            if (data.type === 'restart' && rooms[currentRoom]) {
                const room = rooms[currentRoom];
                room.bullets = [];
                room.players.host = { x: 50, y: 250, hp: 100, dir: 1 };
                room.players.client = { x: 550, y: 250, hp: 100, dir: -1 };
                const msg = JSON.stringify({ type: 'restart_game' });
                room.hostWs.send(msg); room.clientWs.send(msg);
            }
        } catch (e) {}
    });
});

setInterval(() => {
    for (let r in rooms) {
        let room = rooms[r];
        if (!room.clientWs) continue;
        room.bullets.forEach((b, i) => {
            b.x += b.dir * b.speed;
            if (b.x < 0 || b.x > 800) room.bullets.splice(i, 1);
            for (let pid in room.players) {
                let p = room.players[pid];
                if (pid !== b.owner && b.x > p.x && b.x < p.x + 30 && b.y > p.y && b.y < p.y + 30) {
                    p.hp -= 20; room.bullets.splice(i, 1);
                }
            }
        });
        const state = JSON.stringify({ type: 'state', players: room.players, bullets: room.bullets });
        room.hostWs.send(state); room.clientWs.send(state);
    }
}, 16);
