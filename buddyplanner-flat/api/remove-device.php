<?php
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['success' => false, 'error' => 'POST required.'], 405);

$licenseKey = $_POST['license_key'] ?? '';
$deviceName = $_POST['device_name'] ?? '';
if (empty($licenseKey) || empty($deviceName)) jsonResponse(['success' => false, 'error' => 'Missing license_key or device_name.'], 400);

$keys = getKeys();
$idx = findKeyIndex($keys, $licenseKey);
if ($idx === false) jsonResponse(['success' => false, 'error' => 'Not found.'], 404);

$devices = &$keys[$idx]['devices'];
foreach ($devices as $di => $d) {
    if ($d['device_name'] === $deviceName) {
        array_splice($devices, $di, 1);
        putKeys($keys);
        addLog('remove_device', $licenseKey);
        jsonResponse(['success' => true]);
    }
}
jsonResponse(['success' => false, 'error' => 'Device not found.'], 404);
