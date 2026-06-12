<?php
require_once __DIR__ . '/includes/functions.php';

$checks = [];
$checks['PHP Version'] = phpversion();
$checks['data/ writable'] = is_writable(__DIR__ . '/data') ? '✅' : '❌';
$checks['JSON extension'] = extension_loaded('json') ? '✅' : '❌';

seedKeys();
seedUsers();
$keys = getKeys();
$checks['keys.json'] = '✅ ' . count($keys) . ' keys';
$users = getUsers();
$checks['users.json'] = '✅ ' . count($users) . ' user(s)';

file_put_contents(DATA_DIR . '/_test_write', 'ok');
$checks['File write test'] = file_exists(DATA_DIR . '/_test_write') ? '✅' : '❌';
@unlink(DATA_DIR . '/_test_write');

$logs = jsonRead(LOGS_FILE);
$checks['logs.json'] = '✅ ' . count($logs) . ' entries';
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Diagnostic — Buddy License Manager (Flat)</title>
<style>
body{font-family:sans-serif;max-width:700px;margin:2rem auto;padding:1rem;background:#f5f5f5}
h1{color:#333}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
td,th{padding:.75rem 1rem;text-align:left;border-bottom:1px solid #eee}
tr:last-child td{border:0}
th{background:#4a6cf7;color:#fff}
.status{font-weight:bold}
.pass{color:#22c55e}
</style>
</head>
<body>
<h1>🔍 Buddy License Manager — Diagnostic</h1>
<table>
<tr><th>Check</th><th>Result</th></tr>
<?php foreach ($checks as $label => $result): ?>
<tr><td><?= htmlspecialchars($label) ?></td><td class="status"><?= $result ?></td></tr>
<?php endforeach; ?>
</table>
<p style="margin-top:1rem;color:#888">If all checks show ✅, the system is ready. Upload and visit <code>admin-mgmt/</code> to login (admin / buddy2026).</p>
</body>
</html>
