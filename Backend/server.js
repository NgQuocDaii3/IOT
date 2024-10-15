const mqtt = require('mqtt');
const WebSocket = require('ws');

const mqttClient = mqtt.connect('mqtt://192.168.1.145', {
  username: 'dai',
  password: 'b21dccn025'
});

const wss = new WebSocket.Server({ port: 8080 });

// Xử lý kết nối của các client WebSocket
wss.on('connection', ws => {
  console.log('New WebSocket client connected');

  mqttClient.on('message', (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);
    ws.send(message.toString());
  });
});
wss.on('connection', ws => {
  console.log('New WebSocket client connected');

  ws.on('message', message => {
    const data = JSON.parse(message);
    console.log(`Sending MQTT message: ${data.message} to topic: ${data.topic}`);
    
    // Gửi lệnh bật/tắt đến ESP32 qua MQTT
    mqttClient.publish(data.topic, data.message);
  });
});

// Kết nối với MQTT broker và đăng ký nhận các topic
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('data');  // Đăng ký nhận dữ liệu từ ESP32
  mqttClient.subscribe(led1ControlTopic);
  mqttClient.subscribe(led2ControlTopic);
  mqttClient.subscribe(led3ControlTopic);
});

const mysql = require('mysql2');

// MQTT broker information
const mqttHost = 'mqtt://192.168.1.145';
const mqttUser = 'dai';
const mqttPassword = 'b21dccn025';
const topic = 'data';
const led1ControlTopic = 'led1/control';
const led2ControlTopic = 'led2/control';
const led3ControlTopic = 'led3/control';

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: '123456', // Your MySQL password
    database: 'iot'
});

// Connect to the MySQL database
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});


mqttClient.on('message', (topic, message) => {
    const msg = message.toString();
    console.log(`Received message from ${topic}: ${msg}`);

    // Handle sensor data
    if (topic === 'data') {
        const dataParts = msg.split(', ');
        const temp = parseFloat(dataParts[0].split(': ')[1]);
        const hum = parseFloat(dataParts[1].split(': ')[1]);
        const light = parseFloat(dataParts[2].split(': ')[1]);
        const currentTime = new Date();
// Cộng thêm 7 giờ vào giờ UTC
currentTime.setHours(currentTime.getHours() + 7);
const formattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' ');
        
        // Insert sensor data into the datasenser table
        const insertSensorData = `INSERT INTO datasenser (nhiệt_độ, độ_ẩm, ánh_sáng, thời_gian_đo) VALUES (?, ?, ?, ?)`;
        db.query(insertSensorData, [temp, hum, light, formattedTime], (err) => {
            if (err) {
                console.error('Error inserting sensor data:', err);
            } else {
                console.log('Sensor data inserted successfully');
            }
        });
    }

    // Handle LED control commands and log actions in actionhistory table
    const deviceMap = {
        [led1ControlTopic]: 'đèn',
        [led2ControlTopic]: 'quạt',
        [led3ControlTopic]: 'điều hòa'
    };

    if (deviceMap[topic]) {
        const deviceName = deviceMap[topic];
        const action = msg === 'ON' ? 'bật' : 'tắt';
        const currentTime = new Date();
// Cộng thêm 7 giờ vào giờ UTC
currentTime.setHours(currentTime.getHours() + 7);
const formattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' ');

        // Insert action data into the actionhistory table
        const insertActionData = `INSERT INTO actionhistory (tên_thiết_bị, hành_động, thời_gian_bật_tắt) VALUES (?, ?, ?)`;
        db.query(insertActionData, [deviceName, action, formattedTime], (err) => {
            if (err) {
                console.error('Error inserting action data:', err);
            } else {
                console.log(`${deviceName} ${action} action logged successfully`);
            }
        });
    }
});

mqttClient.on('error', (err) => {
    console.error('MQTT connection error:', err);
});




