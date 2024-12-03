const mqtt = require('mqtt');
const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
// MQTT broker thông tin
const mqttHost = 'mqtt://192.168.1.25';
const mqttUser = 'dai';
const mqttPassword = 'b21dccn025';
const topic = 'data';
const led1ControlTopic = 'led1/control';
const led2ControlTopic = 'led2/control';
const led3ControlTopic = 'led3/control';

// MySQL kết nối
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'iot'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// MQTT client setup
const mqttClient = mqtt.connect(mqttHost, {
    username: mqttUser,
    password: mqttPassword
});

// Express server setup
const app = express();
app.use(bodyParser.json());
app.use(cors());
const PORT = 3000;

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8080 });

// WebSocket client connections handling
wss.on('connection', ws => {
    console.log('New WebSocket client connected');

    mqttClient.on('message', (topic, message) => {
        console.log(`Received message on ${topic}: ${message.toString()}`);
        ws.send(message.toString());
    });   
});

// Xử lí WebSocket client messages gửi lệnh tới MQTT topics
wss.on('connection', ws => {
    ws.on('message', message => {
        const data = JSON.parse(message);
        console.log(`Sending MQTT message: ${data.message} to topic: ${data.topic}`);
        mqttClient.publish(data.topic, data.message);
    });
});


// Xử lí mqtt message và insert dữ liệu vào db
mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe(topic);
    mqttClient.subscribe(led1ControlTopic);
    mqttClient.subscribe(led2ControlTopic);
    mqttClient.subscribe(led3ControlTopic);
});

mqttClient.on('message', (topic, message) => {
    const msg = message.toString();
    console.log(`Received message from ${topic}: ${msg}`);

    const currentTime = new Date();
    currentTime.setHours(currentTime.getHours() + 7);
    const formattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' ');

    // sensor-data
    if (topic === 'data') {
        const dataParts = msg.split(', ');
        const temp = parseFloat(dataParts[0].split(': ')[1]);
        const hum = parseFloat(dataParts[1].split(': ')[1]);
        const light = parseFloat(dataParts[2].split(': ')[1]);
        const wind = parseFloat(dataParts[3].split(': ')[1]);
        const dust = parseFloat(dataParts[4].split(': ')[1]);
        const gas = parseFloat(dataParts[5].split(': ')[1]);


        const insertSensorData = `INSERT INTO datasensor (temperature, humidity, light, wind,dust,gas, time_data) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(insertSensorData, [temp, hum, light, wind, dust, gas,formattedTime], (err) => {
            if (err) {
                console.error('Error inserting sensor data:', err);
            } else {
                console.log('Sensor data inserted successfully');
            }
        });
    }

    // bật/tắt led
    const deviceMap = {
        [led1ControlTopic]: 'đèn',
        [led2ControlTopic]: 'quạt',
        [led3ControlTopic]: 'điều hòa'
    };

    if (deviceMap[topic]) {
        const deviceName = deviceMap[topic];
        const action = msg === 'ON' ? 'bật' : 'tắt';

        const insertActionData = `INSERT INTO actionhistory (device_name, action, time_action) VALUES (?, ?, ?)`;
        db.query(insertActionData, [deviceName, action, formattedTime], (err) => {
            if (err) {
                console.error('Error inserting action data:', err);
            } else {
                console.log(`${deviceName} ${action} action logged successfully`);
            }
        });
    }
});
app.use(express.static('public'));
const path = require('path');

// Route cho file index.html khi truy cập vào /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API lấy dữ liệu bảng action history
app.get('/api/action-history', (req, res) => {
    const { page = 1, pageSize = 10 } = req.query; // Lấy page và pageSize từ query
    const offset = (page - 1) * pageSize; // Tính toán offset cho phân trang
    
    const query = `
        SELECT id, device_name AS deviceName, action AS action, time_action AS time 
        FROM actionhistory
        LIMIT ? OFFSET ?
    `;

    db.query(query, [parseInt(pageSize), offset], (err, results) => {
        if (err) {
            console.error('Error retrieving data:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

//Api sắp xếp & tìm kiếm device-history
app.get('/api/device-history', (req, res) => {
    const { search, sortBy, sortOrder, page = 1, pageSize = 10 } = req.query; 
    // Lấy page và pageSize từ query, mặc định page = 1 và pageSize = 10
    const offset = (page - 1) * pageSize;
    
    let query = 'SELECT * FROM actionhistory';
    let conditions = [];
  
    // Điều kiện search
    if (search) {
        conditions.push(`time_action LIKE '%${search}%'`);
    }
  
    // Thêm query điều kiện
    if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
  
    // Sort
    if (sortBy && sortOrder) {
        query += ` ORDER BY ${sortBy} ${sortOrder}`;
    }

    // Phân trang
    query += ` LIMIT ? OFFSET ?`;

    // Thực hiện query 
    db.query(query, [parseInt(pageSize), offset], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});


// Tạo API để lấy dữ liệu từ bảng datasenser, bao gồm tìm kiếm, sắp xếp và phân trang
app.get('/api/sensor-data', (req, res) => {
    const { temperature, humidity, light, wind, dust,gas, time, sort_by, order, page = 1, pageSize = 10 } = req.query;

    let query = 'SELECT id, temperature AS temperature, humidity AS humidity, light AS light, wind AS wind, dust AS dust, gas AS gas, time_data AS time FROM datasensor WHERE 1=1';

    // Điều kiện tìm kiếm
    if (temperature) query += ` AND temperature LIKE ${db.escape(temperature)}`;
    if (humidity) query += ` AND humidity LIKE ${db.escape(humidity)}`;
    if (light) query += ` AND light LIKE ${db.escape(light)}`;
    if (wind) query += ` AND wind LIKE ${db.escape(wind)}`;
    if (dust) query += ` AND dust LIKE ${db.escape(dust)}`;
    if (gas) query += ` AND gas LIKE ${db.escape(gas)}`;
    if (time) query += ` AND time_data LIKE ${db.escape('%' + time + '%')}`;

    // Điều kiện sắp xếp
    const validSortColumns = {
        id: 'id',
        temperature: 'temperature',
        humidity: 'humidity',
        light: 'light',
        wind:'wind',
        dust:'dust',
        gas:'gas',
        time: 'time_data'
    };

    if (validSortColumns[sort_by]) {
        const column = validSortColumns[sort_by];
        const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${column} ${sortOrder}`;
    }

    // tính toán phân trang
    const offset = (page - 1) * pageSize;
    query += ` LIMIT ? OFFSET ?`;

    // Thực hiện query
    db.query(query, [parseInt(pageSize), offset], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'Database query error' });
        } else {
            res.json(results);
        }
    });
});

  
// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

mqttClient.on('error', (err) => {
    console.error('MQTT connection error:', err);
});
