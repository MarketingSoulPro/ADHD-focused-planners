<?php
require_once __DIR__ . '/../includes/functions.php';

$rate = checkRateLimit('create:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 20, 1);
if (!$rate['allowed']) jsonResponse(['success' => false, 'error' => 'Rate limit exceeded.'], 429);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['success' => false, 'error' => 'POST required.'], 405);

$keys = getKeys();
$newKey = generateKey();
$keys[] = [
    'license_key' => $newKey,
    'status' => 'active',
    'customer_name' => trim($_POST['customer_name'] ?? ''),
    'email' => trim($_POST['email'] ?? ''),
    'max_devices' => max(1, min(99, (int)($_POST['max_devices'] ?? 3))),
    'devices' => [],
    'created_at' => date('c'),
    'expiry_date' => $_POST['expiry_date'] ?: null,
];
putKeys($keys);
addLog('create', $newKey);
jsonResponse(['success' => true, 'license_key' => $newKey]);
