const socket = new WebSocket('ws://localhost:8080');

// Xử lý khi WebSocket kết nối thành công
socket.addEventListener('open', function (event) {
    console.log('WebSocket is connected.');
});

// Lắng nghe phản hồi từ server
socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data);

    // Kiểm tra topic và cập nhật giao diện
    if (data.topic === "led1/control") {
        setTimeout(() => {
            const img = document.getElementById("led-image");
            img.src = data.message === "ON"
                ? "https://img.icons8.com/?size=100&id=WWRW41cpXB4o&format=png&color=000000" // Hình ảnh trạng thái ON
                : "https://img.icons8.com/?size=100&id=tlXZO3hU3TSG&format=png&color=000000"; // Hình ảnh trạng thái OFF
        }, 2000);
    } else if (data.topic === "led2/control") {
        setTimeout(() => {
            const img = document.getElementById("fan-image");
            img.src = data.message === "ON"
                ? "https://img.icons8.com/?size=100&id=104278&format=png&color=000000" // Hình ảnh trạng thái ON
                : "https://img.icons8.com/?size=100&id=551&format=png&color=000000"; // Hình ảnh trạng thái OFF
        }, 2000); 
    } else if (data.topic === "led3/control") {
        setTimeout(() => {
            const img = document.getElementById("air-conditioner-image");
            img.src = data.message === "ON"
                ? "https://img.icons8.com/?size=100&id=30044&format=png&color=000000" // Hình ảnh trạng thái ON
                : "https://img.icons8.com/?size=100&id=Dj3a6QnUGYsr&format=png&color=000000"; // Hình ảnh trạng thái OFF
        }, 2000); 
    }
});

// Gửi lệnh điều khiển
function toggleDevice(device, topic) {
    const checkBox = document.getElementById(device);
    const state = checkBox.checked ? "ON" : "OFF";

    // Gửi lệnh điều khiển qua WebSocket
    socket.send(JSON.stringify({ topic: topic, message: state }));
}

// Các hàm điều khiển
function toggleImage() {
    toggleDevice("led", "led1/control");
}

function toggleImage2() {
    toggleDevice("fan", "led2/control");
}

function toggleImage3() {
    toggleDevice("air-conditioner", "led3/control");
}
