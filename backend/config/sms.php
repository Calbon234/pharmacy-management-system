<?php
// ─────────────────────────────────────────────
// SMS Helper — Africa's Talking
// Place this file at: backend/config/sms.php
// ─────────────────────────────────────────────

// Load .env file — try multiple possible locations
$envPaths = [
    __DIR__ . '/../../.env',          // backend/config -> root
    __DIR__ . '/../../../.env',       // one level deeper
    'C:/xampp/htdocs/pharmasys-backend/.env',
];
foreach ($envPaths as $envFile) {
    if (file_exists($envFile)) {
        foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (str_starts_with(trim($line), '#')) continue;
            if (!str_contains($line, '=')) continue;
            [$key, $value] = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));
        }
        break;
    }
}

define('AT_USERNAME', 'sandbox');
define('AT_API_KEY',  getenv('AT_API_KEY') ?: '');
define('AT_SENDER',   'PharmaSys');

// Log helper — writes to XAMPP htdocs so it's always writable
function smsLog(array $data): void {
    file_put_contents(
        __DIR__ . '/sms_log.txt',
        date('Y-m-d H:i:s') . ' ' . json_encode($data) . "\n",
        FILE_APPEND
    );
}

function sendSMS(string $phone, string $message): array {
    // Normalise phone
    $phone = preg_replace('/\s+/', '', $phone);
    if (!str_starts_with($phone, '+')) {
        $phone = '+254' . ltrim($phone, '0');
    }

    $apiKey = AT_API_KEY;

    // Log before sending
    smsLog(['step' => 'sending', 'phone' => $phone, 'apiKey' => $apiKey ? 'SET(' . substr($apiKey,0,8) . '...)' : 'MISSING']);

    if (!$apiKey) {
        smsLog(['step' => 'error', 'reason' => 'API key is empty — check .env']);
        return ['success' => false, 'message' => 'API key missing.'];
    }

    $url  = 'https://api.sandbox.africastalking.com/version1/messaging';
    $data = http_build_query([
        'username' => AT_USERNAME,
        'to'       => $phone,
        'message'  => $message,
        'from'     => AT_SENDER,
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $data,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Accept: application/json',
            'apiKey: ' . $apiKey,
            'Content-Type: application/x-www-form-urlencoded',
        ],
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);

    smsLog([
        'step'      => 'response',
        'httpCode'  => $httpCode,
        'response'  => $response,
        'curlError' => $curlError ?: 'none',
    ]);

    if ($httpCode === 200 || $httpCode === 201) {
        $result = json_decode($response, true);
        $status = $result['SMSMessageData']['Recipients'][0]['status'] ?? 'Unknown';
        if ($status === 'Success') {
            return ['success' => true, 'message' => 'SMS sent successfully.'];
        }
        return ['success' => false, 'message' => 'SMS failed: ' . $status];
    }

    return ['success' => false, 'message' => 'HTTP error: ' . $httpCode];
}

function getPatientPhone($db, int $patient_id): ?string {
    $stmt = $db->prepare('SELECT phone FROM patients WHERE id = ? LIMIT 1');
    $stmt->bind_param('i', $patient_id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    return $row['phone'] ?? null;
}