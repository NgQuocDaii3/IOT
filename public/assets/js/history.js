let data = [];
let currentPage = 1;
let pageSize = 20;
let sortedColumn = null;
let sortDirection = 1; // 1 for ascending, -1 for descending

// Lấy dữ liệu từ api
async function fetchData() {
    try {
        const response = await fetch('http://localhost:3000/api/action-history');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        data = await response.json();
        displayData(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
//chuyển múi giờ
function convertToUTC7(timeString) {
    const utcDate = new Date(timeString);
    // Thêm 7 giờ vào thời gian
    utcDate.setHours(utcDate.getHours() + 7);
    return utcDate.toISOString().replace('T', ' ').substring(0, 19); // Chuyển sang định dạng YYYY-MM-DD HH:MM:SS
}
// Hiển thị dữ liệu ra web
function displayData(filteredData) {
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    const tableBody = $('#device-history');
    tableBody.empty();

    paginatedData.forEach(item => {
        tableBody.append(`
            <tr>
                <td>${item.id}</td>
                <td>${item.deviceName}</td>
                <td>${item.action}</td>
                <td>${item.time = convertToUTC7(item.time)}</td>
            </tr>
        `);
    });
}

// Function to sort data
function sortData(data, column) {
    data.sort((a, b) => {
        if (a[column] < b[column]) return -1 * sortDirection;
        if (a[column] > b[column]) return 1 * sortDirection;
        return 0;
    });
}

// Pagination handlers
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
//sort & search devicehistory
document.getElementById('search-btn').addEventListener('click', function() {
    const searchValue = document.getElementById('search-input').value;
    fetchDeviceHistory(searchValue);
  });
  
  function sortTable(columnIndex) {
    const sortFields = ['id', 'tên_thiết_bị', 'hành_động', 'thời_gian_bật_tắt'];
    const sortBy = sortFields[columnIndex];
    let sortOrder = 'ASC';
  
    // Toggle sort order
    if (this.sortOrder === 'ASC') {
      sortOrder = 'DESC';
    }
    this.sortOrder = sortOrder;
  
    fetchDeviceHistory(document.getElementById('search-input').value, sortBy, sortOrder);
  }
  
  function fetchDeviceHistory(search = '', sortBy = 'id', sortOrder = 'ASC') {
    fetch(`http://localhost:3000/api/device-history?search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`)
      .then(response => response.json())
      .then(data => {
        const tableBody = document.getElementById('device-history');
        tableBody.innerHTML = '';
  
        data.forEach(item => {
          const row = `
            <tr>
              <td>${item.id}</td>
              <td>${item['tên_thiết_bị']}</td>
              <td>${item['hành_động']}</td>
              <td>${item['thời_gian_bật_tắt']=convertToUTC7(item['thời_gian_bật_tắt'])}</td>
            </tr>
          `;
          tableBody.innerHTML += row;
        });
      })
      .catch(error => console.error('Error fetching data:', error));
  }
  

// Fetch and display data on page load
fetchData();
