<?php
require_once __DIR__ . '/../includes/functions.php';

$rate = checkRateLimit('verify:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 30, 1);
if (!$rate['allowed']) jsonResponse(['valid' => false, 'error' => 'Rate limit exceeded.'], 429);

$licenseKey = $_GET['license_key'] ?? '';
if (empty($licenseKey)) jsonResponse(['valid' => false, 'error' => 'Missing license_key.'], 400);

$keys = getKeys();
$idx = findKeyIndex($keys, $licenseKey);
if ($idx === false) jsonResponse(['valid' => false, 'error' => 'Invalid license key.'], 404);

$license = $keys[$idx];
if ($license['status'] === 'disabled') jsonResponse(['valid' => false, 'error' => 'License disabled.'], 403);
if ($license['status'] === 'available') jsonResponse(['valid' => true, 'devices' => [], 'max_devices' => $license['max_devices']]);

jsonResponse([
    'valid' => true,
    'customer_name' => $license['customer_name'],
    'email' => $license['email'],
    'devices' => $license['devices'],
    'max_devices' => $license['max_devices'],
    'status' => $license['status'],
]);
