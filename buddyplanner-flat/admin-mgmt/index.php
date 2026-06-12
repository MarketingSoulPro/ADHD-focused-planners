<?php
require_once __DIR__ . '/../includes/functions.php';
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) { header('Location: login.php'); exit; }

$keys = getKeys();
$total = count($keys);
$active = count(array_filter($keys, fn($k) => $k['status'] === 'active'));
$available = count(array_filter($keys, fn($k) => $k['status'] === 'available'));
$disabled = count(array_filter($keys, fn($k) => $k['status'] === 'disabled'));
$deviceCount = array_sum(array_map(fn($k) => count($k['devices']), $keys));
$logs = jsonRead(LOGS_FILE);
$recentLogs = array_slice(array_reverse($logs), 0, 10);

?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard — Buddy License Manager</title>
<link rel="stylesheet" href="../assets/admin.css?v=2">
</head>
<body>
<nav class="topnav">
    <div class="nav-brand"><img src="../img/logo.png" alt=""> Buddy Licenses</div>
    <div class="nav-links">
        <a href="index.php" class="active">Dashboard</a>
        <a href="licenses.php">Licenses</a>
        <a href="logout.php">Logout (<?= htmlspecialchars($_SESSION['username'] ?? '') ?>)</a>
    </div>
</nav>
<main class="container">
    <h1>Dashboard</h1>
    <div class="stats">
        <div class="stat-card"><span class="stat-num"><?= $total ?></span>Total Keys</div>
        <div class="stat-card"><span class="stat-num"><?= $active ?></span>Active</div>
        <div class="stat-card"><span class="stat-num"><?= $available ?></span>Available</div>
        <div class="stat-card"><span class="stat-num"><?= $disabled ?></span>Disabled</div>
        <div class="stat-card"><span class="stat-num"><?= $deviceCount ?></span>Registered Devices</div>
    </div>
    <h2>Recent Activity</h2>
    <table class="table">
        <thead><tr><th>Time</th><th>Action</th><th>License Key</th><th>IP</th></tr></thead>
        <tbody>
        <?php foreach ($recentLogs as $log): ?>
            <tr>
                <td><?= htmlspecialchars($log['created_at']) ?></td>
                <td><?= htmlspecialchars($log['action']) ?></td>
                <td><code><?= htmlspecialchars($log['license_key'] ?? '') ?></code></td>
                <td><?= htmlspecialchars($log['ip_address']) ?></td>
            </tr>
        <?php endforeach; ?>
        <?php if (empty($recentLogs)): ?>
            <tr><td colspan="4" style="text-align:center;color:#888">No activity yet.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
</main>
</body>
</html>
