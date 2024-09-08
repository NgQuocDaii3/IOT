
// Sample data generation
let data = [];
const devices = ['Đèn', 'Quạt', 'Điều hòa'];
const actions = ['Bật', 'Tắt'];

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

for (let i = 1; i <= 100; i++) {
  const randomDevice = devices[Math.floor(Math.random() * devices.length)];
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  const randomTime = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().slice(0, 10);

  data.push({
    id: i,
    deviceName: randomDevice,
    action: randomAction,
    time: generateRandomDate()
  });
}

// Variables for pagination
let currentPage = 1;
let pageSize = 20;
let sortedColumn = null;
let sortDirection = 1; // 1 for ascending, -1 for descending

// Function to display table data
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
        <td>${item.time}</td>
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

// Initial display
displayData(data);

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

// Sorting handler
$('.sortable').click(function() {
  const column = $(this).data('sort');
  if (sortedColumn === column) {
    sortDirection *= -1; // Toggle sort direction
  } else {
    sortedColumn = column;
    sortDirection = 1; // Default to ascending
  }

  sortData(data, column);
  displayData(data);
});

// Search handler
$('#search-btn').click(function() {
  const query = $('#search-input').val().toLowerCase();
  const filteredData = data.filter(item => item.time.toLowerCase().includes(query));
  displayData(filteredData);
});
