<?php
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['success' => false, 'error' => 'POST required.'], 405);

$licenseKey = $_POST['license_key'] ?? '';
if (empty($licenseKey)) jsonResponse(['success' => false, 'error' => 'Missing license_key.'], 400);

$keys = getKeys();
$idx = findKeyIndex($keys, $licenseKey);
if ($idx === false) jsonResponse(['success' => false, 'error' => 'Not found.'], 404);

array_splice($keys, $idx, 1);
putKeys($keys);
addLog('delete', $licenseKey);
jsonResponse(['success' => true]);
