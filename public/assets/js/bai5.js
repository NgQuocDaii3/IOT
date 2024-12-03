document.addEventListener("DOMContentLoaded", function() {
    // Cập nhật giá trị của thẻ và thay đổi màu nền dựa trên dữ liệu gió, bụi, khí gas
    function updatewindCard(wind) {
        const windCard = $('#card-wind');
        if (wind <= 20) {
            windCard.removeClass().addClass('card text-black card-stateful bg-low-wind');
        } else if (wind > 20 && wind <= 60) {
            windCard.removeClass().addClass('card text-black card-stateful bg-normal-wind');
        } else {
            windCard.removeClass().addClass('card text-black card-stateful bg-high-wind');
        }
    }

    function updatedustCard(dust) {
        const dustCard = $('#card-dust');
        if (dust <= 20) {
            dustCard.removeClass().addClass('card text-black card-stateful bg-low-dust');
        } else if (dust > 20 && dust <= 60) {
            dustCard.removeClass().addClass('card text-black card-stateful bg-normal-dust');
        } else {
            dustCard.removeClass().addClass('card text-black card-stateful bg-high-dust');
        }
    }

    function updategasCard(gas) {
        const gasCard = $('#card-gas');
        if (gas <= 20) {
            gasCard.removeClass().addClass('card text-black card-stateful bg-low-gas');
        } else if (gas > 20 && gas <= 60) {
            gasCard.removeClass().addClass('card text-black card-stateful bg-normal-gas');
        } else {
            gasCard.removeClass().addClass('card text-black card-stateful bg-high-gas');
        }
    }

    function updateSensorData(wind, dust, gas) {
        $('#text-wind').text(wind + ' m/s');
        $('#text-dust').text(dust + ' µg/m³');
        $('#text-gas').text(gas + ' ppm');
        updatewindCard(wind);
        updatedustCard(dust);
        updategasCard(gas);
    }

    const data = {
        wind: [],
        dust: [],
        gas: [],
        labels: []
    };

    // WebSocket để nhận dữ liệu từ máy chủ
    const ws = new WebSocket('ws://localhost:8080'); 
    
    ws.onmessage = (event) => {
        try {
            // Phân tách dữ liệu nhận từ WebSocket
            const msg = event.data.trim();
            const dataParts = msg.split(", ").slice(-3); // Lấy 3 phần tử cuối
            const [windData, dustData, gasData] = dataParts.map(item => item.split(": ")[1]);
            const wind = parseFloat(windData.split(" ")[0]);
            const dust = parseFloat(dustData.split(" ")[0]);
            const gas = parseFloat(gasData.split(" ")[0]);
            const currentTime = new Date().toLocaleTimeString();

            // Giới hạn số lượng điểm dữ liệu (15 điểm)
            if (data.wind.length >= 15) {
                data.wind.shift();
                data.dust.shift();
                data.gas.shift();
                data.labels.shift();
            }

            data.wind.push(wind);
            data.dust.push(dust);
            data.gas.push(gas);
            data.labels.push(currentTime);

            // Cập nhật giá trị cảm biến và biểu đồ
            updateSensorData(wind, dust, gas);

            // Cập nhật biểu đồ với dữ liệu mới
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

    // Biểu đồ sử dụng Chart.js
    const ctx = document.getElementById('b5Chart').getContext('2d');
    const lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Gió(m/s)',
                    data: data.wind,
                    borderColor: 'blue',
                    backgroundColor: 'blue',
                    fill: false,
                },
                {
                    label: 'Độ bụi (µg/m³)',
                    data: data.dust,
                    borderColor: 'brown',
                    backgroundColor: 'brown',
                    fill: false,
                },
                {
                    label: 'Khí gas (ppm)',
                    data: data.gas,
                    borderColor: 'purple',
                    backgroundColor: 'purple',
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
