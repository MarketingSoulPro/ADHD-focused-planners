<?php
require_once __DIR__ . '/../includes/functions.php';

$rate = checkRateLimit('activate:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 10, 1);
if (!$rate['allowed']) jsonResponse(['success' => false, 'error' => 'Rate limit exceeded.'], 429);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['success' => false, 'error' => 'POST required.'], 405);

$input = json_decode(file_get_contents('php://input'), true);
$licenseKey = $input['license_key'] ?? '';
$customerName = trim($input['customer_name'] ?? '');
$email = trim($input['email'] ?? '');
$deviceName = trim($input['device_name'] ?? '');

if (empty($licenseKey) || empty($deviceName)) jsonResponse(['success' => false, 'error' => 'license_key and device_name required.'], 400);

$keys = getKeys();
$idx = findKeyIndex($keys, $licenseKey);
if ($idx === false) jsonResponse(['success' => false, 'error' => 'Invalid license key.'], 404);

$license = &$keys[$idx];
if ($license['status'] === 'disabled') jsonResponse(['success' => false, 'error' => 'License disabled.'], 403);

$deviceExists = false;
foreach ($license['devices'] as $d) {
    if (strcasecmp($d['device_name'], $deviceName) === 0) { $deviceExists = true; break; }
}

if (!$deviceExists) {
    if (count($license['devices']) >= $license['max_devices']) jsonResponse(['success' => false, 'error' => 'Max devices reached.'], 403);
    $license['devices'][] = ['device_name' => $deviceName, 'last_seen' => date('Y-m-d H:i:s')];
}

if (!empty($customerName)) $license['customer_name'] = $customerName;
if (!empty($email)) $license['email'] = $email;
if ($license['status'] === 'available') $license['status'] = 'active';

putKeys($keys);
addLog('activate', $licenseKey);
jsonResponse(['success' => true]);
