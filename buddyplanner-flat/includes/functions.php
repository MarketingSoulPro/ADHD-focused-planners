<?php
if (session_status() === PHP_SESSION_NONE) session_start();
define('DATA_DIR', __DIR__ . '/../data');
define('KEYS_FILE', DATA_DIR . '/keys.json');
define('USERS_FILE', DATA_DIR . '/users.json');
define('LOGS_FILE', DATA_DIR . '/logs.json');

function jsonRead($file) {
    if (!file_exists($file)) return [];
    $fh = fopen($file, 'r');
    if (!$fh) return [];
    flock($fh, LOCK_SH);
    $content = stream_get_contents($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    $decoded = json_decode($content, true);
    return is_array($decoded) ? $decoded : [];
}

function jsonWrite($file, $data) {
    $dir = dirname($file);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $fh = fopen($file, 'c+');
    if (!$fh) return false;
    flock($fh, LOCK_EX);
    ftruncate($fh, 0);
    fwrite($fh, json_encode($data, JSON_PRETTY_PRINT));
    flock($fh, LOCK_UN);
    fclose($fh);
    return true;
}

function generateKey() {
    $hex = function($len) {
        $s = '';
        for ($i = 0; $i < $len; $i++) $s .= dechex(random_int(0, 15));
        return strtoupper($s);
    };
    return 'BUDDY-' . $hex(4) . '-' . $hex(4) . '-' . $hex(4) . '-' . $hex(4);
}

function seedKeys() {
    if (!file_exists(KEYS_FILE)) {
        $keys = [];
        $existing = [];
        for ($i = 0; $i < 1000; $i++) {
            do { $key = generateKey(); } while (isset($existing[$key]));
            $existing[$key] = true;
            $keys[] = [
                'license_key' => $key,
                'status' => 'available',
                'customer_name' => '',
                'email' => '',
                'max_devices' => 3,
                'devices' => [],
                'created_at' => date('c'),
                'expiry_date' => null,
            ];
        }
        jsonWrite(KEYS_FILE, $keys);
    }
}

function seedUsers() {
    if (!file_exists(USERS_FILE)) {
        $users = [[
            'username' => 'admin',
            'password_hash' => password_hash('buddy2026', PASSWORD_DEFAULT),
            'created_at' => date('c'),
        ]];
        jsonWrite(USERS_FILE, $users);
    }
}

function getKeys() {
    seedKeys();
    return jsonRead(KEYS_FILE);
}

function putKeys($keys) {
    return jsonWrite(KEYS_FILE, $keys);
}

function getUsers() {
    seedUsers();
    return jsonRead(USERS_FILE);
}

function adminExists($username) {
    $users = getUsers();
    foreach ($users as $u) {
        if (strcasecmp($u['username'], $username) === 0) return true;
    }
    return false;
}

function createAdminUser($username, $password) {
    $users = getUsers();
    $users[] = [
        'username' => $username,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'created_at' => date('c'),
    ];
    return jsonWrite(USERS_FILE, $users);
}

function addLog($action, $licenseKey = null) {
    $logs = jsonRead(LOGS_FILE);
    $logs[] = [
        'id' => count($logs) + 1,
        'license_key' => $licenseKey,
        'action' => $action,
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'created_at' => date('Y-m-d H:i:s'),
    ];
    if (count($logs) > 1000) array_shift($logs);
    jsonWrite(LOGS_FILE, $logs);
}

function findKeyIndex($keys, $licenseKey) {
    foreach ($keys as $i => $k) {
        if ($k['license_key'] === $licenseKey) return $i;
    }
    return false;
}

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function getCsrfToken() {
    if (empty($_SESSION['_csrf_token'])) {
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf_token'];
}

function verifyCsrfToken($token) {
    return !empty($_SESSION['_csrf_token']) && hash_equals($_SESSION['_csrf_token'], $token);
}

function checkRateLimit($key, $maxAttempts, $windowMinutes) {
    $dir = DATA_DIR . '/rate_limit';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $file = $dir . '/' . md5($key) . '.lock';
    $fh = fopen($file, 'c+');
    if (!$fh) return ['allowed' => true];
    flock($fh, LOCK_EX);
    $now = time();
    $data = json_decode(stream_get_contents($fh), true) ?: ['attempts' => [], 'reset' => $now + $windowMinutes * 60];
    if ($now > $data['reset']) {
        $data = ['attempts' => [], 'reset' => $now + $windowMinutes * 60];
    }
    $data['attempts'][] = $now;
    $data['attempts'] = array_values(array_filter($data['attempts'], fn($t) => $t > $now - $windowMinutes * 60));
    $allowed = count($data['attempts']) <= $maxAttempts;
    ftruncate($fh, 0);
    fwrite($fh, json_encode($data));
    flock($fh, LOCK_UN);
    fclose($fh);
    return ['allowed' => $allowed, 'reset' => $data['reset']];
}
