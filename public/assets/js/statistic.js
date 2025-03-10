let data = [];
let currentPage = 1;
let pageSize = 20;
let sortedColumn = null;
let sortDirection = 1; // 1 for ascending, -1 for descending
let searchParams = {}; // Lưu các tham số tìm kiếm
let sortParams = {}; // Lưu các tham số sắp xếp

// Hàm lấy dữ liệu từ API với phân trang
async function fetchData() {
    try {
        // Tạo URL từ các tham số tìm kiếm và sắp xếp
        let query = `http://localhost:3000/api/sensor-data?page=${currentPage}&pageSize=${pageSize}`;

        // Thêm các tham số tìm kiếm vào URL nếu có
        for (const key in searchParams) {
            if (searchParams[key]) {
                query += `&${key}=${encodeURIComponent(searchParams[key])}`;
            }
        }

        // Thêm các tham số sắp xếp vào URL nếu có
        if (sortParams.sort_by) {
            query += `&sort_by=${sortParams.sort_by}&order=${sortParams.order}`;
        }

        const response = await fetch(query);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        data = await response.json();
        displayData(data); // Hiển thị dữ liệu trên giao diện
        updatePaginationControls();
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
    }
}

// Convert time to UTC+7
function convertToUTC7(timeString) {
    const utcDate = new Date(timeString);
    // Add 7 hours to the time
    utcDate.setHours(utcDate.getHours() + 7);
    return utcDate.toISOString().replace('T', ' ').substring(0, 19); // Format as YYYY-MM-DD HH:MM:SS
}

// Display data in the table
function displayData(filteredData) {
    

    const tableBody = $('#device-data');
    tableBody.empty();

    filteredData.forEach(item => {
        tableBody.append(`
            <tr>
                <td>${item.id}</td>
                <td>${item.temperature}</td>
                <td>${item.humidity}</td>
                <td>${item.light}</td>
                <td>${item.wind}</td>
                <td>${item.dust}</td>
                <td>${item.gas}</td>
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
// Pagination handling

$('#page-size').change(function() {
    pageSize = parseInt($(this).val());
    currentPage = 1;
    fetchData();
});

// Sort data
function sortData(data, column) {
    data.sort((a, b) => {
        if (a[column] < b[column]) return -1 * sortDirection;
        if (a[column] > b[column]) return 1 * sortDirection;
        return 0;
    });
}

// Search by specific fields
document.getElementById('search-btn').addEventListener('click', () => {
    const temp = document.getElementById('temp-search').value;
    const humidity = document.getElementById('humidity-search').value;
    const light = document.getElementById('light-search').value;
    const wind = document.getElementById('wind-search').value;
    const dust = document.getElementById('dust-search').value;
    const gas = document.getElementById('gas-search').value;
    const time = document.getElementById('time-search').value;

    // Lưu các tham số tìm kiếm
    searchParams = {
        temperature: temp,
        humidity: humidity,
        light: light,
        wind: wind,
        dust:dust,
        gas:gas,
        time: time
    };

    currentPage = 1;
    fetchData(); // Gọi lại hàm fetchData với các tham số tìm kiếm
});


// Sort functionality
document.querySelectorAll('.sortable').forEach(column => {
    column.addEventListener('click', () => {
        const sortBy = column.getAttribute('data-sort');
        sortDirection = column.classList.contains('asc') ? -1 : 1; // Toggle sort direction
        column.classList.toggle('asc', sortDirection === 1);
        column.classList.toggle('desc', sortDirection === -1);

        // Lưu các tham số sắp xếp
        sortParams = {
            sort_by: sortBy,
            order: sortDirection === 1 ? 'asc' : 'desc'
        };

        currentPage = 1;
        fetchData(); // Gọi lại hàm fetchData với các tham số sắp xếp
    });
});

// Xử lý chuyển sang trang trước
$('#prev-page').click(() => {
    if (currentPage > 1) {
        currentPage--;
        $('#page-number').val(currentPage);
        fetchData(); // Gọi lại API để lấy dữ liệu trang mới
    }
});

// Xử lý chuyển sang trang sau
$('#next-page').click(() => {
     // Hoặc có thể tính toán số trang dựa trên tổng số hàng từ API
    currentPage++;
    $('#page-number').val(currentPage);
        fetchData(); // Gọi lại API để lấy dữ liệu trang mới
    
});

// Thay đổi trang khi nhập vào số trang cụ thể
$('#page-number').change(function() {

    const newPage = parseInt($(this).val());
    if (newPage >= 1) { // Đảm bảo trang hợp lệ
        currentPage = newPage;
        fetchData(); // Gọi lại API để lấy dữ liệu trang mới
    }
});
// Initial data load
fetchData();