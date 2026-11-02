// Aviso de cierre de sesión por inactividad: cuenta regresiva y botones para seguir conectado o cerrar la sesión.
(function () {
    const cfg = window.DTIC_SESION;
    if (!cfg) return;

    const LIMITE = cfg.minutos * 60 * 1000;
    const AVISO = cfg.aviso * 60 * 1000;
    const ESPERA_PING = 30 * 1000;
    const CLAVE = 'dtic_ultima_actividad';

    let ultima = Date.now();
    let ultimoPing = Date.now();
    let avisoVisible = false;
    let caja = null;
    let tiempo = null;

    // Lee la hora de la última actividad compartida entre pestañas.
    function leerCompartida() {
        try {
            const v = parseInt(localStorage.getItem(CLAVE), 10);
            return isNaN(v) ? 0 : v;
        } catch (e) {
            return 0;
        }
    }

    // Guarda la hora de la última actividad para las demás pestañas.
    function guardarCompartida(v) {
        try {
            localStorage.setItem(CLAVE, String(v));
        } catch (e) {}
    }

    // Vuelve al login avisando que la sesión se cerró.
    function irAlLogin() {
        window.location.href = 'login.php?expirada=1';
    }

    // Avisa al servidor que la persona sigue activa.
    function ping() {
        ultimoPing = Date.now();
        return fetch('sesion_ping.php', { method: 'POST', credentials: 'same-origin' })
            .then(function (r) {
                if (r.status === 401) irAlLogin();
            })
            .catch(function () {});
    }

    // Convierte milisegundos en minutos:segundos.
    function formato(ms) {
        const total = Math.max(0, Math.ceil(ms / 1000));
        const m = Math.floor(total / 60);
        const s = total % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    // Crea el recuadro de aviso (oculto).
    function crearAviso() {
        caja = document.createElement('div');
        caja.className = 'sesion-aviso';
        caja.setAttribute('role', 'alertdialog');
        caja.setAttribute('aria-live', 'assertive');
        caja.style.display = 'none';
        caja.innerHTML =
            '<div class="sesion-aviso-caja">' +
            '<h2>Tu sesión está por cerrarse</h2>' +
            '<p>Por inactividad, se cerrará en <strong class="sesion-aviso-tiempo"></strong>.</p>' +
            '<div class="sesion-aviso-botones">' +
            '<button type="button" class="sesion-seguir">Seguir conectado</button>' +
            '<a href="logout.php" class="sesion-cerrar">Cerrar sesión</a>' +
            '</div></div>';
        document.body.appendChild(caja);
        tiempo = caja.querySelector('.sesion-aviso-tiempo');
        caja.querySelector('.sesion-seguir').addEventListener('click', seguir);
    }

    // Muestra el aviso.
    function mostrar() {
        avisoVisible = true;
        caja.style.display = 'flex';
        caja.querySelector('.sesion-seguir').focus();
    }

    // Oculta el aviso.
    function ocultar() {
        avisoVisible = false;
        caja.style.display = 'none';
    }

    // La persona eligió seguir conectada: se renueva la sesión.
    function seguir() {
        ultima = Date.now();
        guardarCompartida(ultima);
        ocultar();
        ping();
    }

    // Registra que la persona está usando la pantalla (se ignora mientras se muestra el aviso).
    function actividad() {
        if (avisoVisible) return;
        const ahora = Date.now();
        if (ahora - ultima < 1000) return;
        ultima = ahora;
        guardarCompartida(ultima);
        if (ahora - ultimoPing > ESPERA_PING) ping();
    }

    // Cada segundo calcula cuánto falta y decide si avisar o cerrar.
    function revisar() {
        const compartida = leerCompartida();
        if (compartida > ultima) {
            ultima = compartida;
            if (avisoVisible) ocultar();
        }
        const restante = LIMITE - (Date.now() - ultima);
        if (restante <= 0) {
            irAlLogin();
            return;
        }
        if (restante <= AVISO) {
            if (!avisoVisible) mostrar();
            tiempo.textContent = formato(restante);
        }
    }

    crearAviso();
    guardarCompartida(ultima);
    ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(function (ev) {
        document.addEventListener(ev, actividad, { passive: true });
    });
    setInterval(revisar, 1000);
})();
