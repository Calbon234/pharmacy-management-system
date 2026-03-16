<?php
require_once '../../config/database.php';
require_once '../../config/helpers.php';
setCORS();
requireAuth();

$db   = getDB();
$from = $_GET['from'] ?? date('Y-m-01');
$to   = $_GET['to']   ?? date('Y-m-d');

// Revenue in range
$revenue = $db->query("SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS cnt FROM sales WHERE DATE(created_at) BETWEEN '$from' AND '$to'")->fetch_assoc();

// Top selling medicines
$top_medicines = $db->query("SELECT si.medicine_name, SUM(si.quantity) AS units, SUM(si.total_price) AS revenue FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE DATE(s.created_at) BETWEEN '$from' AND '$to' GROUP BY si.medicine_name ORDER BY units DESC LIMIT 6")->fetch_all(MYSQLI_ASSOC);

// Monthly sales (last 8 months)
$monthly = $db->query("SELECT DATE_FORMAT(created_at,'%b') AS month, ROUND(SUM(total)/1000,1) AS revenue, COUNT(*) AS transactions FROM sales WHERE created_at >= DATE_SUB(NOW(), INTERVAL 8 MONTH) GROUP BY YEAR(created_at), MONTH(created_at) ORDER BY YEAR(created_at), MONTH(created_at)")->fetch_all(MYSQLI_ASSOC);

// Sales by payment method
$by_payment = $db->query("SELECT payment_method, COUNT(*) AS cnt, SUM(total) AS total FROM sales WHERE DATE(created_at) BETWEEN '$from' AND '$to' GROUP BY payment_method")->fetch_all(MYSQLI_ASSOC);

// New patients in range
$new_patients = $db->query("SELECT COUNT(*) AS cnt FROM patients WHERE DATE(created_at) BETWEEN '$from' AND '$to'")->fetch_assoc()['cnt'];

// Prescriptions fulfilled in range
$rx_fulfilled = $db->query("SELECT COUNT(*) AS cnt FROM prescriptions WHERE status='Fulfilled' AND DATE(created_at) BETWEEN '$from' AND '$to'")->fetch_assoc()['cnt'];
$rx_total     = $db->query("SELECT COUNT(*) AS cnt FROM prescriptions WHERE DATE(created_at) BETWEEN '$from' AND '$to'")->fetch_assoc()['cnt'];

success([
    'revenue'        => (float)$revenue['total'],
    'transactions'   => (int)$revenue['cnt'],
    'new_patients'   => (int)$new_patients,
    'rx_fulfilled'   => (int)$rx_fulfilled,
    'rx_total'       => (int)$rx_total,
    'top_medicines'  => $top_medicines,
    'monthly'        => $monthly,
    'by_payment'     => $by_payment,
]);
