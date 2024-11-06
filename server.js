const mqtt = require('mqtt');
const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

// MQTT broker information
const mqttHost = 'mqtt://192.168.93.34';
const mqttUser = 'dai';
const mqttPassword = 'b21dccn025';
const topic = 'data';
const led1ControlTopic = 'led1/control';
const led2ControlTopic = 'led2/control';
const led3ControlTopic = 'led3/control';

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
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

// Handle MQTT messages and insert data into MySQL
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

    // Handle sensor data
    if (topic === 'data') {
        const dataParts = msg.split(', ');
        const temp = parseFloat(dataParts[0].split(': ')[1]);
        const hum = parseFloat(dataParts[1].split(': ')[1]);
        const light = parseFloat(dataParts[2].split(': ')[1]);

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
app.use(express.static('public'));
const path = require('path');

// Route cho file index.html khi truy cập vào /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API lấy dữ liệu bảng action history
app.get('/api/action-history', (req, res) => {
    const { page = 1, pageSize = 10 } = req.query; // Lấy page và pageSize từ query, mặc định page = 1 và pageSize = 10
    const offset = (page - 1) * pageSize; // Tính toán offset cho phân trang
    
    const query = `
        SELECT id, tên_thiết_bị AS deviceName, hành_động AS action, thời_gian_bật_tắt AS time 
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

//api search&sort devicehistory
app.get('/api/device-history', (req, res) => {
    const { search, sortBy, sortOrder, page = 1, pageSize = 10 } = req.query; 
    // Lấy page và pageSize từ query, mặc định page = 1 và pageSize = 10
    const offset = (page - 1) * pageSize;
    
    let query = 'SELECT * FROM actionhistory';
    let conditions = [];
  
    // Điều kiện search
    if (search) {
        conditions.push(`thời_gian_bật_tắt LIKE '%${search}%'`);
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

    // Thực hiện query với phân trang
    db.query(query, [parseInt(pageSize), offset], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});


// Tạo API để lấy dữ liệu từ bảng datasenser, bao gồm tìm kiếm, sắp xếp và phân trang
app.get('/api/sensor-data', (req, res) => {
    const { temperature, humidity, light, time, sort_by, order, page = 1, pageSize = 10 } = req.query;

    let query = 'SELECT id, nhiệt_độ AS temperature, độ_ẩm AS humidity, ánh_sáng AS light, thời_gian_đo AS time FROM datasenser WHERE 1=1';

    // Search conditions
    if (temperature) query += ` AND nhiệt_độ LIKE ${db.escape(temperature)}`;
    if (humidity) query += ` AND độ_ẩm LIKE ${db.escape(humidity)}`;
    if (light) query += ` AND ánh_sáng LIKE ${db.escape(light)}`;
    if (time) query += ` AND thời_gian_đo LIKE ${db.escape('%' + time + '%')}`;

    // Sorting conditions
    const validSortColumns = {
        id: 'id',
        temperature: 'nhiệt_độ',
        humidity: 'độ_ẩm',
        light: 'ánh_sáng',
        time: 'thời_gian_đo'
    };

    if (validSortColumns[sort_by]) {
        const column = validSortColumns[sort_by];
        const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${column} ${sortOrder}`;
    }

    // Pagination logic
    const offset = (page - 1) * pageSize;
    query += ` LIMIT ? OFFSET ?`;

    // Execute the query
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
