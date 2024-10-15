const socket = new WebSocket('ws://localhost:8080');

// Xử lý khi WebSocket kết nối thành công
socket.addEventListener('open', function (event) {
    console.log('WebSocket is connected.');
});

function toggleImage() {
  var checkBox = document.getElementById("led");
  var img = document.getElementById("led-image");

  if (checkBox.checked) {
    // Bật LED 1
    img.src = "https://img.icons8.com/?size=100&id=WWRW41cpXB4o&format=png&color=000000"; // Hình ảnh trạng thái ON
    socket.send(JSON.stringify({ topic: "led1/control", message: "ON" })); // Gửi lệnh bật qua WebSocket
  } else {
    // Tắt LED 1
    img.src = "https://img.icons8.com/?size=100&id=tlXZO3hU3TSG&format=png&color=000000"; // Hình ảnh trạng thái OFF
    socket.send(JSON.stringify({ topic: "led1/control", message: "OFF" })); // Gửi lệnh tắt qua WebSocket
  }
}

function toggleImage2() {
  var checkBox = document.getElementById("fan");
  var img = document.getElementById("fan-image");

  if (checkBox.checked) {
    // Bật quạt
    img.src = "https://img.icons8.com/?size=100&id=104278&format=png&color=000000"; // Hình ảnh trạng thái ON
    socket.send(JSON.stringify({ topic: "led2/control", message: "ON" })); // Gửi lệnh bật quạt
  } else {
    // Tắt quạt
    img.src = "https://img.icons8.com/?size=100&id=551&format=png&color=000000"; // Hình ảnh trạng thái OFF
    socket.send(JSON.stringify({ topic: "led2/control", message: "OFF" })); // Gửi lệnh tắt quạt
  }
}

function toggleImage3() {
  var checkBox = document.getElementById("air-conditioner");
  var img = document.getElementById("air-conditioner-image");

  if (checkBox.checked) {
    // Bật điều hòa
    img.src = "https://img.icons8.com/?size=100&id=30044&format=png&color=000000"; // Hình ảnh trạng thái ON
    socket.send(JSON.stringify({ topic: "led3/control", message: "ON" })); // Gửi lệnh bật điều hòa
  } else {
    // Tắt điều hòa
    img.src = "https://img.icons8.com/?size=100&id=Dj3a6QnUGYsr&format=png&color=000000"; // Hình ảnh trạng thái OFF
    socket.send(JSON.stringify({ topic: "led3/control", message: "OFF" })); // Gửi lệnh tắt điều hòa
  }
}