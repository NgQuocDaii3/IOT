
// Search function
function searchTable() {
    let input = document.getElementById('searchInput');
    let filter = input.value.toLowerCase();
    let table = document.getElementById('dataTable');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let tdArray = tr[i].getElementsByTagName('td');
        let showRow = false;
        for (let j = 0; j < tdArray.length; j++) {
            if (tdArray[j] && tdArray[j].innerText.toLowerCase().indexOf(filter) > -1) {
                showRow = true;
                break;
            }
        }
        tr[i].style.display = showRow ? '' : 'none';
    }
}

// Sort function
function sortTable(columnIndex) {
    let table = document.getElementById('dataTable');
    let rows = Array.from(table.rows).slice(1); // Skip the header row
    let isAscending = table.getAttribute('data-sort-direction') === 'asc';
    let direction = isAscending ? 1 : -1;

    rows.sort((a, b) => {
        let cellA = a.cells[columnIndex].innerText.toLowerCase();
        let cellB = b.cells[columnIndex].innerText.toLowerCase();

        if (cellA < cellB) {
            return -1 * direction;
        } else if (cellA > cellB) {
            return 1 * direction;
        } else {
            return 0;
        }
    });

    rows.forEach(row => table.appendChild(row));

    table.setAttribute('data-sort-direction', isAscending ? 'desc' : 'asc');
}

        // Hàm để tạo thời gian ngẫu nhiên (ngày tháng năm giờ phút giây)
        function generateRandomDate() {
          const year = 2023;
          const month = Math.floor(Math.random() * 12);
          const day = Math.floor(Math.random() * 28) + 1;
          const hour = Math.floor(Math.random() * 24);
          const minute = Math.floor(Math.random() * 60);
          const second = Math.floor(Math.random() * 60);
    
          const date = new Date(year, month, day, hour, minute, second);
          return date.toISOString().replace('T', ' ').substring(0, 19); // Định dạng YYYY-MM-DD HH:MM:SS
        }
    
        // Tạo dữ liệu mẫu
        let data = [];
        const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
        for (let i = 1; i <= 100; i++) {
          const temperature = randomNumber(15, 35); // Nhiệt độ ngẫu nhiên từ 15°C đến 35°C
          const humidity = randomNumber(30, 90); // Độ ẩm ngẫu nhiên từ 30% đến 90%
          const light = randomNumber(100, 1000); // Ánh sáng ngẫu nhiên từ 100 đến 1000 lux
          const time = generateRandomDate();
    
          data.push({
            id: i,
            temperature: temperature,
            humidity: humidity,
            light: light,
            time: time,
          });
        }
    
        // Các biến cho phân trang
        let currentPage = 1;
        let pageSize = 20;
        let sortedColumn = null;
        let sortDirection = 1; // 1 cho tăng dần, -1 cho giảm dần
    
        // Hàm hiển thị dữ liệu
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
                <td>${item.time}</td>
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
        displayData(data);
    
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
    
        // Xử lý sắp xếp
        $('.sortable').click(function() {
          const column = $(this).data('sort');
          if (sortedColumn === column) {
            sortDirection *= -1; // Đổi hướng sắp xếp
          } else {
            sortedColumn = column;
            sortDirection = 1; // Mặc định là tăng dần
          }
    
          sortData(data, column);
          displayData(data);
        });
    
        // Xử lý tìm kiếm
        $('#search-btn').click(function() {
          const tempQuery = $('#temp-search').val();
          const humidityQuery = $('#humidity-search').val();
          const lightQuery = $('#light-search').val();
          const timeQuery = $('#time-search').val().toLowerCase();
    
          const filteredData = data.filter(item => {
            const tempMatch = tempQuery ? item.temperature == tempQuery : true;
            const humidityMatch = humidityQuery ? item.humidity == humidityQuery : true;
            const lightMatch = lightQuery ? item.light == lightQuery : true;
            const timeMatch = timeQuery ? item.time.toLowerCase().includes(timeQuery) : true;
    
            return tempMatch && humidityMatch && lightMatch && timeMatch;
          });
    
          displayData(filteredData);
        });