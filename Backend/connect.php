<?php
// Kết nối tới MySQL
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "SensorData"; // Tên cơ sở dữ liệu

$conn = new mysqli($servername, $username, $password, $dbname);

// Kiểm tra kết nối
if ($conn->connect_error) {
    die("Kết nối thất bại: " . $conn->connect_error);
}

// Định nghĩa số dòng trên mỗi trang
$rows_per_page = 20;

// Xác định trang hiện tại
$current_page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($current_page - 1) * $rows_per_page;

// Truy vấn dữ liệu từ bảng ThietBiHanhDong với phân trang
$sql = "SELECT * FROM ThietBiHanhDong LIMIT $offset, $rows_per_page";
$result = $conn->query($sql);

// Truy vấn tổng số dòng
$total_rows_sql = "SELECT COUNT(*) FROM ThietBiHanhDong";
$total_rows_result = $conn->query($total_rows_sql);
$total_rows = $total_rows_result->fetch_row()[0];
$total_pages = ceil($total_rows / $rows_per_page);
