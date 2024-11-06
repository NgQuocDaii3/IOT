let data = [];
let currentPage = 1;
let pageSize = 20;
let sortedColumn = null;
let sortDirection = 1; // 1 for ascending, -1 for descending

// Lấy dữ liệu từ API với phân trang
async function fetchData() {
    try {
        const response = await fetch(`http://localhost:3000/api/action-history?page=${currentPage}&pageSize=${pageSize}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        data = await response.json();
        displayData(data);
        updatePaginationControls(); // Cập nhật điều khiển phân trang
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Chuyển múi giờ
function convertToUTC7(timeString) {
    const utcDate = new Date(timeString);
    // Thêm 7 giờ vào thời gian
    utcDate.setHours(utcDate.getHours() + 7);
    return utcDate.toISOString().replace('T', ' ').substring(0, 19); // Chuyển sang định dạng YYYY-MM-DD HH:MM:SS
}

// Hiển thị dữ liệu ra web
function displayData(filteredData) {
    const tableBody = $('#device-history');
    tableBody.empty();

    filteredData.forEach(item => {
        tableBody.append(`
            <tr>
                <td>${item.id}</td>
                <td>${item.deviceName}</td>
                <td>${item.action}</td>
                <td>${convertToUTC7(item.time)}</td>
            </tr>
        `);
    });
}

// Cập nhật các nút điều hướng trang
function updatePaginationControls() {
    const paginationControls = $('#pagination-controls');
    paginationControls.empty();

    // Tạo nút Previous
    if (currentPage > 1) {
        paginationControls.append(`<button onclick="changePage(currentPage - 1)">Previous</button>`);
    }

    // Tạo nút Next (cần điều chỉnh nếu có tổng số bản ghi từ server)
    paginationControls.append(`<button onclick="changePage(currentPage + 1)">Next</button>`);
}

// Chuyển trang
function changePage(newPage) {
    currentPage = newPage;
    
    fetchData();
}

// Thay đổi kích thước trang
$('#page-size').change(function() {
    pageSize = parseInt($(this).val());
    currentPage = 1; // Đặt lại trang hiện tại về trang đầu khi thay đổi kích thước trang
    fetchDeviceHistory(searchQuery, sortColumn, sortOrder, currentPage, pageSize); // Duy trì các giá trị tìm kiếm và sắp xếp
});


// Sort & Search device history
// Cập nhật sự kiện tìm kiếm
document.getElementById('search-btn').addEventListener('click', function() {
    searchQuery = document.getElementById('search-input').value; // Lưu giá trị tìm kiếm vào searchQuery
    currentPage = 1; // Khi tìm kiếm, đặt lại trang hiện tại về trang đầu
    fetchDeviceHistory(searchQuery, sortColumn, sortOrder, currentPage, pageSize);
});

// Cập nhật sự kiện sắp xếp
function sortTable(columnIndex) {
    const sortFields = ['id', 'tên_thiết_bị', 'hành_động', 'thời_gian_bật_tắt'];
    const sortBy = sortFields[columnIndex];

    // Toggle sort order
    if (sortBy === sortColumn) {
        sortOrder = (sortOrder === 'ASC') ? 'DESC' : 'ASC'; // Đảo ngược thứ tự sắp xếp nếu cùng cột
    } else {
        sortColumn = sortBy; // Cập nhật cột mới
        sortOrder = 'ASC'; // Đặt lại thứ tự sắp xếp mặc định là ASC
    }

    currentPage = 1; // Khi sắp xếp, đặt lại trang hiện tại về trang đầu
    fetchDeviceHistory(searchQuery, sortColumn, sortOrder, currentPage, pageSize);
}


let searchQuery = ''; // Biến để lưu giá trị tìm kiếm
let sortColumn = 'id'; // Cột sắp xếp mặc định
let sortOrder = 'ASC'; // Thứ tự sắp xếp mặc định

// Cập nhật hàm fetchDeviceHistory với page và pageSize
function fetchDeviceHistory(search = '', sortBy = sortColumn, sortOrder = sortOrder, page = currentPage, pageSize = pageSize) {
    fetch(`http://localhost:3000/api/device-history?search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&pageSize=${pageSize}`)
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
                      <td>${convertToUTC7(item['thời_gian_bật_tắt'])}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });

            updatePaginationControls(); // Cập nhật điều khiển phân trang sau khi tải dữ liệu
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Pagination handlers
$('#prev-page').click(() => {
    if (currentPage > 1) {
        currentPage--;
        $('#page-number').val(currentPage);
        fetchDeviceHistory(searchQuery, sortColumn, sortOrder, currentPage, pageSize); // Duy trì các giá trị tìm kiếm và sắp xếp
    }
});

$('#next-page').click(() => {
    currentPage++;
    $('#page-number').val(currentPage);
    fetchDeviceHistory(searchQuery, sortColumn, sortOrder, currentPage, pageSize); // Duy trì các giá trị tìm kiếm và sắp xếp
});

$('#page-number').change(function() {
    const newPage = parseInt($(this).val());
    if (newPage >= 1) { // Đảm bảo trang hợp lệ
        currentPage = newPage;
        fetchDeviceHistory(searchQuery, sortColumn, sortOrder, currentPage, pageSize); // Duy trì các giá trị tìm kiếm và sắp xếp
    }
});

// Fetch and display data on page load
fetchData();
