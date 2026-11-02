<?php
// Muestra o descarga el manual de usuario en PDF (solo con sesión iniciada).
require_once __DIR__ . '/includes/auth.php';

require_login();

$ruta = __DIR__ . '/docs/manual_usuario.pdf';
if (!is_file($ruta)) {
    http_response_code(404);
    die('El manual aún no está disponible.');
}

// Con ?descargar=1 se baja el archivo; sin eso se abre en el navegador.
$modo = isset($_GET['descargar']) ? 'attachment' : 'inline';

header('Content-Type: application/pdf');
header('Content-Disposition: ' . $modo . '; filename="Manual_de_usuario_DTIC.pdf"');
header('Content-Length: ' . filesize($ruta));
header('X-Content-Type-Options: nosniff');
header('Cache-Control: private, no-store');
readfile($ruta);
exit;
