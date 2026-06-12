<?php
require_once __DIR__ . '/../includes/functions.php';

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header('Location: index.php');
    exit;
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrfToken($_POST['_csrf_token'] ?? '')) $error = 'Invalid session.';

    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm'] ?? '';

    if ($username && $password && $confirm) {
        if (strlen($username) < 3) $error = 'Username must be at least 3 characters.';
        elseif (strlen($password) < 6) $error = 'Password must be at least 6 characters.';
        elseif ($password !== $confirm) $error = 'Passwords do not match.';
        elseif (adminExists($username)) $error = 'Username already taken.';
        else {
            createAdminUser($username, $password);
            $success = 'Account created. You can now sign in.';
        }
    } else $error = 'All fields are required.';
}
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign Up — Buddy License Manager</title>
<link rel="stylesheet" href="../assets/admin.css?v=2">
</head>
<body class="login-page">
<div class="login-box">
    <div class="login-logo"><img src="../img/logo.png" alt="Buddy Planner"></div>
    <h1>Create Account</h1>
    <p class="login-sub">Register a new admin user</p>
    <?php if ($success): ?>
        <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
        <a href="login.php" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:8px">Sign In</a>
    <?php else: ?>
        <?php if ($error): ?><div class="alert alert-error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
        <form method="post">
            <input type="hidden" name="_csrf_token" value="<?= getCsrfToken() ?>">
            <label for="username">Username</label>
            <input type="text" name="username" id="username" required autocomplete="username">
            <label for="password">Password</label>
            <input type="password" name="password" id="password" required autocomplete="new-password">
            <label for="confirm">Confirm Password</label>
            <input type="password" name="confirm" id="confirm" required autocomplete="new-password">
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center">Create Account</button>
        </form>
        <p style="margin-top:16px;font-size:13px;color:#606080">Already have an account? <a href="login.php">Sign in</a></p>
    <?php endif; ?>
</div>
</body>
</html>
