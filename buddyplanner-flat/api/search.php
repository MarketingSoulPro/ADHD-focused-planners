<?php
require_once __DIR__ . '/../includes/functions.php';

$q = trim($_GET['q'] ?? '');
if (empty($q)) jsonResponse([]);

$keys = getKeys();
$results = array_filter($keys, function($k) use ($q) {
    return stripos($k['license_key'], $q) !== false
        || stripos($k['customer_name'], $q) !== false
        || stripos($k['email'], $q) !== false;
});
jsonResponse(array_values($results));
