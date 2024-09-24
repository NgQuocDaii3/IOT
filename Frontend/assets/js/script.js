document.addEventListener("DOMContentLoaded", function() {
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
        if (light <= 200) {
            lightCard.removeClass().addClass('card text-black card-stateful bg-low-light');
        } else if (light > 200 && light <= 800) {
            lightCard.removeClass().addClass('card text-black card-stateful bg-normal-light');
        } else {
            lightCard.removeClass().addClass('card text-black card-stateful bg-high-light');
        }
    }

    // Cập nhật giá trị nhiệt độ, độ ẩm, ánh sáng và thay đổi màu nền
    function updateSensorData(temp, humid, light) {
        $('#text-temp').text(temp + ' °C');
        $('#text-humid').text(humid + ' %');
        $('#text-light').text(light + ' lux');
        updateTempCard(temp);
        updateHumidCard(humid);
        updateLightCard(light);
    }

    // Ví dụ với dữ liệu ngẫu nhiên cập nhật mỗi 5 giây
    function getRandomValue(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    setInterval(function() {
        const temp = getRandomValue(10, 40); // Nhiệt độ từ 10°C đến 40°C
        const humid = getRandomValue(30, 90); // Độ ẩm từ 30% đến 90%
        const light = getRandomValue(100, 1000); // Ánh sáng từ 100 đến 1000 lux
        updateSensorData(temp, humid, light);
    }, 3000); // Cập nhật mỗi 3 giây
    const data = {
        temperature: [22, 30, 26, 28, 30, 27, 28],
        humidity: [70, 62, 61, 69, 64, 65, 66],
        light: [400, 450, 420, 430, 440, 460, 470],
        labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
    };

    document.getElementById("text-temp").textContent = data.temperature[data.temperature.length - 1] + " °C";
    document.getElementById("text-humid").textContent = data.humidity[data.humidity.length - 1] + " %";
    document.getElementById("text-light").textContent = data.light[data.light.length - 1] + " lux";

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
                    backgroundColor:'blue',
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