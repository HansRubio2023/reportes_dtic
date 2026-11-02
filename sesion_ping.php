<?php
// Renueva la sesión mientras la persona sigue usando el sistema (lo llama assets/sesion.js).

require_once __DIR__ . '/includes/auth.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}

// Sin sesión o ya vencida: el navegador debe volver al login.
if (!usuario_actual() || sesion_expirada()) {
    http_response_code(401);
    echo json_encode(['ok' => false]);
    exit;
}

$_SESSION['ultima_actividad'] = time();
echo json_encode(['ok' => true]);
