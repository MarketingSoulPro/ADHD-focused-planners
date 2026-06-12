<?php
require_once __DIR__ . '/../includes/functions.php';
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) { header('Location: login.php'); exit; }

$licenseKey = $_GET['license_key'] ?? '';
if (empty($licenseKey)) { header('Location: licenses.php'); exit; }

$keys = getKeys();
$idx = findKeyIndex($keys, $licenseKey);
if ($idx === false) { header('Location: licenses.php'); exit; }
$license = &$keys[$idx];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && verifyCsrfToken($_POST['_csrf_token'] ?? '')) {
    $action = $_POST['action'] ?? '';
    if ($action === 'remove_device') {
        $dn = $_POST['device_name'] ?? '';
        foreach ($license['devices'] as $di => $d) {
            if ($d['device_name'] === $dn) { array_splice($license['devices'], $di, 1); break; }
        }
        addLog('remove_device', $licenseKey);
    } elseif ($action === 'reset_devices') {
        $license['devices'] = [];
        addLog('reset_devices', $licenseKey);
    }
    putKeys($keys);
    header('Location: devices.php?license_key=' . urlencode($licenseKey));
    exit;
}
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Devices — Buddy License Manager</title>
<link rel="stylesheet" href="../assets/admin.css?v=2">
</head>
<body>
<nav class="topnav">
    <div class="nav-brand"><img src="../img/logo.png" alt=""> Buddy Licenses</div>
    <div class="nav-links">
        <a href="index.php">Dashboard</a>
        <a href="licenses.php">Licenses</a>
        <a href="logout.php">Logout (<?= htmlspecialchars($_SESSION['username'] ?? '') ?>)</a>
    </div>
</nav>
<main class="container">
    <h1>Devices for <code><?= htmlspecialchars($license['license_key']) ?></code></h1>
    <p>Customer: <?= htmlspecialchars($license['customer_name'] ?: '-') ?> | <?= count($license['devices']) ?> / <?= $license['max_devices'] ?> devices used</p>

    <?php if (!empty($license['devices'])): ?>
        <form method="post" style="margin-bottom:1rem" onsubmit="return confirm('Reset all devices for this license?')">
            <input type="hidden" name="_csrf_token" value="<?= getCsrfToken() ?>">
            <input type="hidden" name="action" value="reset_devices">
            <button type="submit" class="btn btn-danger">Reset All Devices</button>
        </form>
    <?php endif; ?>

    <table class="table">
        <thead><tr><th>Device Name</th><th>Last Seen</th><th>Action</th></tr></thead>
        <tbody>
        <?php foreach ($license['devices'] as $d): ?>
            <tr>
                <td><?= htmlspecialchars($d['device_name']) ?></td>
                <td><?= htmlspecialchars($d['last_seen']) ?></td>
                <td>
                    <form method="post" onsubmit="return confirm('Remove this device?')">
                        <input type="hidden" name="_csrf_token" value="<?= getCsrfToken() ?>">
                        <input type="hidden" name="action" value="remove_device">
                        <input type="hidden" name="device_name" value="<?= htmlspecialchars($d['device_name']) ?>">
                        <button type="submit" class="btn btn-sm btn-danger">Remove</button>
                    </form>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if (empty($license['devices'])): ?>
            <tr><td colspan="3" style="text-align:center;color:#888">No devices registered.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
    <a href="licenses.php" class="btn">&larr; Back to Licenses</a>
</main>
</body>
</html>
