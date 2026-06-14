let socket;
const serverAddress = "my-game-server-u118.onrender.com";

function connect() {
    // Используем wss:// для безопасного соединения в облаке
    socket = new WebSocket("wss://" + serverAddress);

    socket.onopen = () => {
        console.log("Подключено к облаку!");
        alert("Подключено!");
    };

    socket.onmessage = (event) => {
        console.log("Данные:", event.data);
    };

    socket.onerror = (error) => {
        console.error("Ошибка:", error);
    };
}

connect();
