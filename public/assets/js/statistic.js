let data = [];
let currentPage = 1;
let pageSize = 20;
let sortedColumn = null;
let sortDirection = 1; // 1 cho tăng dần, -1 cho giảm dần

// Hàm lấy dữ liệu từ API
async function fetchData() {
    try {
        const response = await fetch('http://localhost:3000/api/sensor-data');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        data = await response.json();
        displayData(data);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
    }
}
//chuyển múi giờ
function convertToUTC7(timeString) {
    const utcDate = new Date(timeString);
    // Thêm 7 giờ vào thời gian
    utcDate.setHours(utcDate.getHours() + 7);
    return utcDate.toISOString().replace('T', ' ').substring(0, 19); // Chuyển sang định dạng YYYY-MM-DD HH:MM:SS
}
// Hàm hiển thị dữ liệu trong bảng
function displayData(filteredData) {
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    const tableBody = $('#device-data');
    tableBody.empty();

    paginatedData.forEach(item => {
        tableBody.append(`
            <tr>
                <td>${item.id}</td>
                <td>${item.temperature}</td>
                <td>${item.humidity}</td>
                <td>${item.light}</td>
                <td>${item.time = convertToUTC7(item.time)}</td>
            </tr>
        `);
    });
}

// Hàm sắp xếp dữ liệu
function sortData(data, column) {
    data.sort((a, b) => {
        if (a[column] < b[column]) return -1 * sortDirection;
        if (a[column] > b[column]) return 1 * sortDirection;
        return 0;
    });
}

// Hiển thị dữ liệu ban đầu
fetchData();

// Xử lý phân trang
$('#prev-page').click(() => {
    if (currentPage > 1) {
        currentPage--;
        displayData(data);
    }
});

$('#next-page').click(() => {
    const totalPages = Math.ceil(data.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        displayData(data);
    }
});

$('#page-number').change(function() {
    const newPage = parseInt($(this).val());
    const totalPages = Math.ceil(data.length / pageSize);

    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayData(data);
    }
});

$('#page-size').change(function() {
    pageSize = parseInt($(this).val());
    displayData(data);
});
//search theo từng loại
document.getElementById('search-btn').addEventListener('click', () => {
    const temp = document.getElementById('temp-search').value;
    const humidity = document.getElementById('humidity-search').value;
    const light = document.getElementById('light-search').value;
    const time = document.getElementById('time-search').value;
  
    let query = `/api/data?`;
  
    if (temp) query += `temperature=${temp}&`;
    if (humidity) query += `humidity=${humidity}&`;
    if (light) query += `light=${light}&`;
    if (time) query += `time=${time}&`;
  
    fetch(query)
      .then(response => response.json())
      .then(data => {
        const tbody = document.getElementById('device-data');
        tbody.innerHTML = ''; 
  
        data.forEach(item => {
          const row = `<tr>
                        <td>${item.id}</td>
                        <td>${item['nhiệt_độ']}</td>
                        <td>${item['độ_ẩm']}</td>
                        <td>${item['ánh_sáng']}</td>
                        <td>${item['thời_gian_đo']=convertToUTC7(item['thời_gian_đo'])}</td>
                      </tr>`;
          tbody.innerHTML += row;
        });
      });
  });
  
  // Sort
  document.querySelectorAll('.sortable').forEach(column => {
    column.addEventListener('click', () => {
      const sortBy = column.getAttribute('data-sort');
      const order = column.classList.contains('asc') ? 'desc' : 'asc';
  
      fetch(`/api/data?sort_by=${sortBy}&order=${order}`)
        .then(response => response.json())
        .then(data => {
          const tbody = document.getElementById('device-data');
          tbody.innerHTML = ''; 
  
          data.forEach(item => {
            const row = `<tr>
                          <td>${item.id}</td>
                          <td>${item['nhiệt_độ']}</td>
                          <td>${item['độ_ẩm']}</td>
                          <td>${item['ánh_sáng']}</td>
                          <td>${item['thời_gian_đo']=convertToUTC7(item['thời_gian_đo'])}</td>
                        </tr>`;
            tbody.innerHTML += row;
          });
          
          
          document.querySelectorAll('.sortable').forEach(col => col.classList.remove('asc', 'desc'));
          column.classList.add(order);
        });
    });
  });
  
