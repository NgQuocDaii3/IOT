document.addEventListener("DOMContentLoaded", function() {
    // Cập nhật giá trị nhiệt độ, độ ẩm, ánh sáng và thay đổi màu nền
    function updateTempCard(temp) {
        const tempCard = $('#card-temp');
        if (temp <= 20) {
            tempCard.removeClass().addClass('card text-black card-stateful bg-cold');
        } else if (temp > 20 && temp <= 30) {
            tempCard.removeClass().addClass('card text-black card-stateful bg-warm');
        } else {
            tempCard.removeClass().addClass('card text-black card-stateful bg-hot');
        }
    }

    function updateHumidCard(humid) {
        const humidCard = $('#card-humid');
        if (humid <= 40) {
            humidCard.removeClass().addClass('card text-black card-stateful bg-low-humid');
        } else if (humid > 40 && humid <= 70) {
            humidCard.removeClass().addClass('card text-black card-stateful bg-normal-humid');
        } else {
            humidCard.removeClass().addClass('card text-black card-stateful bg-high-humid');
        }
    }

    function updateLightCard(light) {
        const lightCard = $('#card-light');
        if (light <= 100) {
            lightCard.removeClass().addClass('card text-black card-stateful bg-low-light');
        } else if (light > 200 && light <= 800) {
            lightCard.removeClass().addClass('card text-black card-stateful bg-normal-light');
        } else {
            lightCard.removeClass().addClass('card text-black card-stateful bg-high-light');
        }
    }

    function updateSensorData(temp, humid, light) {
        $('#text-temp').text(temp + ' °C');
        $('#text-humid').text(humid + ' %');
        $('#text-light').text(light + ' lux');
        updateTempCard(temp);
        updateHumidCard(humid);
        updateLightCard(light);
    }

    const data = {
        temperature: [],
        humidity: [],
        light: [],
        labels: []
    };

    const ws = new WebSocket('ws://localhost:8080'); // Thay bằng địa chỉ của WebSocket server
    
    ws.onmessage = (event) => {
        try {
            const msg = event.data.trim();
            const [tempData, humData, lightData] = msg.split(", ").map(item => item.split(": ")[1]);
            const temp = parseFloat(tempData.split(" ")[0]);
            const humid = parseFloat(humData.split("%")[0]);
            const light = parseFloat(lightData.split(" ")[0]);
            const currentTime = new Date().toLocaleTimeString();

            // Cập nhật dữ liệu mới vào mảng và giới hạn số lượng điểm dữ liệu (7 điểm)
            if (data.temperature.length >= 15) {
                data.temperature.shift();
                data.humidity.shift();
                data.light.shift();
                data.labels.shift();
            }

            data.temperature.push(temp);
            data.humidity.push(humid);
            data.light.push(light);
            data.labels.push(currentTime);

            updateSensorData(temp, humid, light);

            // Cập nhật lại biểu đồ với dữ liệu mới
            lineChart.update();
        } catch (e) {
            console.error("Error parsing data:", e);
        }
    };

    ws.onopen = () => {
        console.log('WebSocket đã kết nối');
    };

    ws.onclose = () => {
        console.log('WebSocket đã đóng');
    };

    const ctx = document.getElementById('myChart').getContext('2d');
    const lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Nhiệt độ (°C)',
                    data: data.temperature,
                    borderColor: 'green',
                    backgroundColor: 'green',
                    fill: false,
                },
                {
                    label: 'Độ ẩm (%)',
                    data: data.humidity,
                    borderColor: 'blue',
                    backgroundColor: 'blue',
                    fill: false,
                },
                {
                    label: 'Ánh sáng (lux)',
                    data: data.light,
                    borderColor: 'orange',
                    backgroundColor: 'orange',
                    fill: false,
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Thời gian',                       
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Giá trị'
                    }
                }
            }
        }
    });
});
