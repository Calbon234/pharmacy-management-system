<?php
require_once '../../config/database.php';
require_once '../../config/helpers.php';
setCORS();
requireAuth();

$db = getDB();

$total_medicines  = $db->query('SELECT COUNT(*) AS cnt FROM medicines')->fetch_assoc()['cnt'];
$low_stock        = $db->query('SELECT COUNT(*) AS cnt FROM medicines WHERE stock <= min_stock AND stock > 0')->fetch_assoc()['cnt'];
$out_of_stock     = $db->query('SELECT COUNT(*) AS cnt FROM medicines WHERE stock = 0')->fetch_assoc()['cnt'];
$total_suppliers  = $db->query('SELECT COUNT(*) AS cnt FROM suppliers WHERE status="Active"')->fetch_assoc()['cnt'];
$total_patients   = $db->query('SELECT COUNT(*) AS cnt FROM patients')->fetch_assoc()['cnt'];
$today_sales      = $db->query('SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS cnt FROM sales WHERE DATE(created_at) = CURDATE()')->fetch_assoc();
$pending_rx       = $db->query('SELECT COUNT(*) AS cnt FROM prescriptions WHERE status="Pending"')->fetch_assoc()['cnt'];
$expiring_soon    = $db->query('SELECT COUNT(*) AS cnt FROM medicines WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)')->fetch_assoc()['cnt'];
$expired          = $db->query('SELECT COUNT(*) AS cnt FROM medicines WHERE expiry_date < CURDATE()')->fetch_assoc()['cnt'];
$recent_sales     = $db->query('SELECT sale_number, customer_name, total, payment_method, created_at FROM sales ORDER BY created_at DESC LIMIT 5')->fetch_all(MYSQLI_ASSOC);
$low_stock_list   = $db->query('SELECT name, stock, min_stock, category FROM medicines WHERE stock <= min_stock ORDER BY stock ASC LIMIT 8')->fetch_all(MYSQLI_ASSOC);

success([
    'total_medicines'    => (int)$total_medicines,
    'low_stock'          => (int)$low_stock,
    'out_of_stock'       => (int)$out_of_stock,
    'total_suppliers'    => (int)$total_suppliers,
    'total_patients'     => (int)$total_patients,
    'today_sales'        => (float)$today_sales['total'],
    'today_transactions' => (int)$today_sales['cnt'],
    'pending_rx'         => (int)$pending_rx,
    'expiring_soon'      => (int)$expiring_soon,
    'expired'            => (int)$expired,
    'recent_sales'       => $recent_sales,
    'low_stock_list'     => $low_stock_list,
]);
