<?php
require_once __DIR__ . '/../includes/functions.php';

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header('Location: index.php');
    exit;
}

$error = '';
$lockoutMsg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrfToken($_POST['_csrf_token'] ?? '')) $error = 'Invalid session.';

    $ipKey = 'login:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $rate = checkRateLimit($ipKey, 5, 15);
    if (!$rate['allowed']) {
        $mins = ceil(($rate['reset'] - time()) / 60);
        $lockoutMsg = "Too many attempts. Try again in $mins minute" . ($mins > 1 ? 's' : '') . '.';
    }

    if (!$error && !$lockoutMsg) {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';
        $users = getUsers();
        $found = false;
        foreach ($users as $u) {
            if ($u['username'] === $username && password_verify($password, $u['password_hash'])) {
                $_SESSION['logged_in'] = true;
                $_SESSION['username'] = $username;
                header('Location: index.php');
                exit;
            }
        }
        $error = 'Invalid username or password.';
    }
}
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login — Buddy License Manager</title>
<link rel="stylesheet" href="../assets/admin.css?v=2">
</head>
<body class="login-page">
<div class="login-box">
    <div class="login-logo"><img src="../img/logo.png" alt="Buddy Planner"></div>
    <h1>Buddy License Manager</h1>
    <p class="login-sub">Sign in to manage licenses</p>
    <?php if ($lockoutMsg): ?>
        <div class="alert alert-error"><?= htmlspecialchars($lockoutMsg) ?></div>
    <?php elseif ($error): ?>
        <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
    <form method="post" <?= $lockoutMsg ? 'style="opacity:0.5;pointer-events:none"' : '' ?>>
        <input type="hidden" name="_csrf_token" value="<?= getCsrfToken() ?>">
        <label for="username">Username</label>
        <input type="text" name="username" id="username" required autocomplete="username">
        <label for="password">Password</label>
        <input type="password" name="password" id="password" required autocomplete="current-password">
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center">Sign In</button>
    </form>
    <p style="margin-top:16px;font-size:13px;color:#606080">No account? <a href="signup.php">Create one</a></p>
</div>
</body>
</html>
