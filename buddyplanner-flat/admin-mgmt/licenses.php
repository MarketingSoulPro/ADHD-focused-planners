<?php
require_once __DIR__ . '/../includes/functions.php';
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) { header('Location: login.php'); exit; }

$keys = getKeys();
$successMsg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && verifyCsrfToken($_POST['_csrf_token'] ?? '')) {
    $action = $_POST['action'] ?? '';
    $lk = $_POST['license_key'] ?? '';

    if ($action === 'create') {
        $keys[] = [
            'license_key' => generateKey(),
            'status' => 'active',
            'customer_name' => trim($_POST['customer_name'] ?? ''),
            'email' => trim($_POST['email'] ?? ''),
            'max_devices' => max(1, min(99, (int)($_POST['max_devices'] ?? 3))),
            'devices' => [],
            'created_at' => date('c'),
            'expiry_date' => $_POST['expiry_date'] ?: null,
        ];
        addLog('create', end($keys)['license_key']);
        $successMsg = 'License created.';
    } elseif ($action === 'toggle' && $lk) {
        $idx = findKeyIndex($keys, $lk);
        if ($idx !== false) {
            $keys[$idx]['status'] = ($keys[$idx]['status'] === 'disabled') ? 'active' : 'disabled';
            addLog('toggle_status', $lk);
            $successMsg = 'Status toggled.';
        }
    } elseif ($action === 'delete' && $lk) {
        $idx = findKeyIndex($keys, $lk);
        if ($idx !== false) { array_splice($keys, $idx, 1); addLog('delete', $lk); $successMsg = 'Deleted.'; }
    } elseif ($action === 'edit' && $lk) {
        $idx = findKeyIndex($keys, $lk);
        if ($idx !== false) {
            $keys[$idx]['customer_name'] = trim($_POST['customer_name'] ?? '');
            $keys[$idx]['email'] = trim($_POST['email'] ?? '');
            $keys[$idx]['max_devices'] = max(1, min(99, (int)($_POST['max_devices'] ?? 3)));
            $keys[$idx]['expiry_date'] = $_POST['expiry_date'] ?: null;
            addLog('edit', $lk);
            $successMsg = 'Updated.';
        }
    }
    putKeys($keys);
    $keys = getKeys();
}

$search = trim($_GET['q'] ?? '');
if ($search) {
    $keys = array_filter($keys, fn($k) =>
        stripos($k['license_key'], $search) !== false
        || stripos($k['customer_name'], $search) !== false
        || stripos($k['email'], $search) !== false
    );
}

$statusFilter = $_GET['status'] ?? '';
if ($statusFilter) $keys = array_filter($keys, fn($k) => $k['status'] === $statusFilter);
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Licenses — Buddy License Manager</title>
<link rel="stylesheet" href="../assets/admin.css?v=2">
</head>
<body>
<nav class="topnav">
    <div class="nav-brand"><img src="../img/logo.png" alt=""> Buddy Licenses</div>
    <div class="nav-links">
        <a href="index.php">Dashboard</a>
        <a href="licenses.php" class="active">Licenses</a>
        <a href="logout.php">Logout (<?= htmlspecialchars($_SESSION['username'] ?? '') ?>)</a>
    </div>
</nav>
<main class="container">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
        <h1>Licenses</h1>
        <button class="btn btn-primary" onclick="openModal('createModal')">+ New License</button>
    </div>

    <?php if ($successMsg): ?><div class="alert alert-success"><?= htmlspecialchars($successMsg) ?></div><?php endif; ?>

    <form method="get" class="search-bar">
        <input type="text" name="q" placeholder="Search by key, name, or email..." value="<?= htmlspecialchars($search) ?>">
        <select name="status">
            <option value="">All Status</option>
            <option value="available" <?= $statusFilter === 'available' ? 'selected' : '' ?>>Available</option>
            <option value="active" <?= $statusFilter === 'active' ? 'selected' : '' ?>>Active</option>
            <option value="disabled" <?= $statusFilter === 'disabled' ? 'selected' : '' ?>>Disabled</option>
        </select>
        <button type="submit" class="btn">Filter</button>
    </form>

    <table class="table">
        <thead><tr><th>License Key</th><th>Customer</th><th>Email</th><th>Devices</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
        <?php foreach ($keys as $k): ?>
            <tr>
                <td><code><?= htmlspecialchars($k['license_key']) ?></code></td>
                <td><?= htmlspecialchars($k['customer_name'] ?: '-') ?></td>
                <td><?= htmlspecialchars($k['email'] ?: '-') ?></td>
                <td><?= count($k['devices']) ?> / <?= $k['max_devices'] ?></td>
                <td><span class="badge badge-<?= $k['status'] ?>"><?= $k['status'] ?></span></td>
                <td class="actions">
                    <?php if ($k['status'] !== 'available'): ?>
                        <button class="btn btn-sm" onclick="editKey(<?= htmlspecialchars(json_encode($k)) ?>)">Edit</button>
                        <button class="btn btn-sm" onclick="toggleKey(<?= htmlspecialchars(json_encode($k['license_key'])) ?>)"><?= $k['status'] === 'disabled' ? 'Enable' : 'Disable' ?></button>
                        <a href="devices.php?license_key=<?= urlencode($k['license_key']) ?>" class="btn btn-sm">Devices</a>
                    <?php endif; ?>
                    <button class="btn btn-sm btn-danger" onclick="deleteKey(<?= htmlspecialchars(json_encode($k['license_key'])) ?>)">Delete</button>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if (empty($keys)): ?>
            <tr><td colspan="6" style="text-align:center;color:#888">No licenses found.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
</main>

<!-- Create Modal -->
<div id="createModal" class="modal"><div class="modal-content">
    <span class="close" onclick="closeModal('createModal')">&times;</span>
    <h2>Create License</h2>
    <form method="post">
        <input type="hidden" name="_csrf_token" value="<?= getCsrfToken() ?>">
        <input type="hidden" name="action" value="create">
        <label>Customer Name <input type="text" name="customer_name"></label>
        <label>Email <input type="email" name="email"></label>
        <label>Max Devices <input type="number" name="max_devices" value="3" min="1" max="99"></label>
        <label>Expiry Date <input type="date" name="expiry_date"></label>
        <button type="submit" class="btn btn-primary">Generate & Save</button>
    </form>
</div></div>

<!-- Edit Modal -->
<div id="editModal" class="modal"><div class="modal-content">
    <span class="close" onclick="closeModal('editModal')">&times;</span>
    <h2>Edit License</h2>
    <form method="post">
        <input type="hidden" name="_csrf_token" value="<?= getCsrfToken() ?>">
        <input type="hidden" name="action" value="edit">
        <input type="hidden" name="license_key" id="edit_key">
        <label>License Key <code id="edit_key_display"></code></label>
        <label>Customer Name <input type="text" name="customer_name" id="edit_name"></label>
        <label>Email <input type="email" name="email" id="edit_email"></label>
        <label>Max Devices <input type="number" name="max_devices" id="edit_devices" min="1" max="99"></label>
        <label>Expiry Date <input type="date" name="expiry_date" id="edit_expiry"></label>
        <button type="submit" class="btn btn-primary">Save Changes</button>
    </form>
</div></div>

<script>
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function editKey(k) {
    document.getElementById('edit_key').value = k.license_key;
    document.getElementById('edit_key_display').textContent = k.license_key;
    document.getElementById('edit_name').value = k.customer_name || '';
    document.getElementById('edit_email').value = k.email || '';
    document.getElementById('edit_devices').value = k.max_devices || 3;
    document.getElementById('edit_expiry').value = k.expiry_date || '';
    openModal('editModal');
}
function toggleKey(key) {
    var f = document.createElement('form'); f.method = 'post'; f.style.display = 'none';
    f.innerHTML = '<input name="_csrf_token" value="<?= getCsrfToken() ?>"><input name="action" value="toggle"><input name="license_key" value="' + key + '">';
    document.body.appendChild(f); f.submit();
}
function deleteKey(key) {
    if (!confirm('Delete license ' + key + '?')) return;
    var f = document.createElement('form'); f.method = 'post'; f.style.display = 'none';
    f.innerHTML = '<input name="_csrf_token" value="<?= getCsrfToken() ?>"><input name="action" value="delete"><input name="license_key" value="' + key + '">';
    document.body.appendChild(f); f.submit();
}
window.onclick = function(e) { document.querySelectorAll('.modal').forEach(m => { if (e.target === m) m.style.display = 'none'; }); };
</script>
</body>
</html>
