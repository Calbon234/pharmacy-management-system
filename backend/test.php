<?php
$hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
$password = 'password123';
if (password_verify($password, $hash)) {
    echo "PASSWORD MATCHES ✅";
} else {
    echo "PASSWORD DOES NOT MATCH ❌";
    echo "<br>Try new hash: " . password_hash($password, PASSWORD_BCRYPT);
}
?>