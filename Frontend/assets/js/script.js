document.addEventListener("DOMContentLoaded", function() {
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
