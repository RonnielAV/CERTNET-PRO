const chartInstances = [];
const wrapLabel = (label, maxLength = 16) => {
    if (typeof label !== "string" || label.length <= maxLength) {
        return label;
    }
    const words = label.split(" ");
    const lines = [];
    let current = "";
    words.forEach((word) => {
        const next = current ? current + " " + word : word;
        if (next.length > maxLength && current) {
            lines.push(current);
            current = word;
        } else {
            current = next;
        }
    });
    if (current) {
        lines.push(current);
    }
    return lines;
};
const wrapLabels = (labels) => labels.map((label) => wrapLabel(label));
const getValue = (id) => document.getElementById(id).value.trim();
const getNumber = (id) => {
    const value = parseFloat(document.getElementById(id).value);
    return Number.isFinite(value) ? value : null;
};
const statusStyles = {
    "PASA": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "REVISAR": "bg-amber-50 text-amber-800 border-amber-200",
    "FALLA": "bg-red-50 text-red-700 border-red-200"
};
const reportStatusClass = {
    "PASA": "pasa",
    "REVISAR": "revisar",
    "FALLA": "falla"
};
const wireSchemeT568B = [
    { pin: "1", name: "Blanco/Naranja", style: "repeating-linear-gradient(90deg, #ffffff 0 10px, #f97316 10px 14px, #ffffff 14px 24px)" },
    { pin: "2", name: "Naranja", style: "#f97316" },
    { pin: "3", name: "Blanco/Verde", style: "repeating-linear-gradient(90deg, #ffffff 0 10px, #22c55e 10px 14px, #ffffff 14px 24px)" },
    { pin: "4", name: "Azul", style: "#2563eb" },
    { pin: "5", name: "Blanco/Azul", style: "repeating-linear-gradient(90deg, #ffffff 0 10px, #2563eb 10px 14px, #ffffff 14px 24px)" },
    { pin: "6", name: "Verde", style: "#22c55e" },
    { pin: "7", name: "Blanco/Marrón", style: "repeating-linear-gradient(90deg, #ffffff 0 10px, #92400e 10px 14px, #ffffff 14px 24px)" },
    { pin: "8", name: "Marrón", style: "#92400e" }
];
const metricProfiles = [
    { key: "il", title: "Pérdida de inserción", short: "IL", unit: "dB", limit: 35.9, pair: "36", frequency: 250.0, higherIsBetter: false },
    { key: "next", title: "NEXT", short: "NEXT", unit: "dB", limit: 30.7, pair: "36", frequency: 232.0, higherIsBetter: true },
    { key: "rl", title: "Return Loss", short: "RL", unit: "dB", limit: 16.0, pair: "78", frequency: 39.5, higherIsBetter: true },
    { key: "acr", title: "ACR-F", short: "ACR-F", unit: "dB", limit: 12.9, pair: "36", frequency: 236.0, higherIsBetter: true },
    { key: "alien", title: "Alien Crosstalk", short: "AXT", unit: "dB", limit: 0.0, pair: "N/A", frequency: 250.0, higherIsBetter: true }
];
const autosaveKey = "certnet-project-state-v1";
const projectControlIds = [
    "project-name",
    "client-name",
    "site-name",
    "site-address",
    "technician-name",
    "tester-name",
    "test-standard",
    "test-date",
    "tester-model",
    "tester-serial",
    "software-version",
    "calibration-date",
    "main-adapter",
    "remote-adapter"
];
const practiceControlIds = [
    "lan-core",
    "cabling-points",
    "cabling-tr",
    "utp-pinout",
    "utp-untwist",
    "utp-connector",
    "fiber-type",
    "fiber-clean",
    "fiber-loss",
    "fiber-polarity"
];
const portDraftControlIds = [
    "port-id",
    "port-location",
    "port-floor",
    "port-rack",
    "port-category",
    "port-test-type",
    "port-length",
    "port-wiremap",
    "port-nvp",
    "prop-delay",
    "delay-skew",
    "dc-resistance",
    "margin-il",
    "margin-next",
    "margin-rl",
    "margin-acr",
    "alien-margin",
    "port-ip",
    "port-ping",
    "port-speed",
    "port-notes"
];
let ports = [];
let activeManualTab = "mod1";
let manualPdfState = null;
let manualPdfLoading = false;
let autosaveReady = false;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("test-date").valueAsDate = new Date();
    setupTheme();
    setupSidebar();
    setupPageNavigation();
    setupTabs();
    setupDetailTriggers();
    setupTiaModel();
    setupChecklist();
    setupCertification();
    setupFieldHelp();
    setupListFields();
    setupProjectPersistence();
    createCharts();
    renderPorts();
});

function setupPageNavigation() {
    const pageButtons = document.querySelectorAll("[data-page-target]");
    const manualTabs = document.getElementById("manual-tabs");
    const detailBox = document.getElementById("detail-box");
    const panels = document.querySelectorAll(".tab-panel");
    const title = document.getElementById("section-title");
    const kicker = document.getElementById("section-kicker");
    const showPage = (page) => {
        pageButtons.forEach((button) => {
            const active = button.dataset.pageTarget === page;
            button.classList.toggle("active", active);
            button.setAttribute("aria-current", active ? "page" : "false");
        });
        manualTabs.classList.toggle("hidden", page !== "manual");
        detailBox.classList.toggle("hidden", page !== "manual");
        panels.forEach((panel) => panel.classList.remove("active"));
        const target = page === "manual" ? activeManualTab : "mod8";
        document.getElementById(target).classList.add("active");
        title.textContent = page === "manual" ? "Manual técnico interactivo" : "Generación de certificados";
        kicker.textContent = page === "manual" ? "Base de conocimiento" : "Espacio de trabajo";
        setTimeout(() => chartInstances.forEach((chart) => chart.resize()), 80);
        if (page === "certification") {
            renderReport();
            setupManualPdfViewer();
        }
        closeSidebar();
    };
    pageButtons.forEach((button) => {
        button.addEventListener("click", () => showPage(button.dataset.pageTarget));
    });
    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = urlParams.get('page') || 'manual';
    showPage(initialPage);
}

function setupSidebar() {
    const toggle = document.getElementById("sidebar-toggle");
    const overlay = document.getElementById("sidebar-overlay");
    toggle.addEventListener("click", () => {
        const open = document.body.classList.toggle("sidebar-open");
        toggle.setAttribute("aria-expanded", String(open));
    });
    overlay.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });
}

function closeSidebar() {
    document.body.classList.remove("sidebar-open");
    document.getElementById("sidebar-toggle")?.setAttribute("aria-expanded", "false");
}

function setupTheme() {
    const toggle = document.getElementById("theme-toggle");
    const stored = localStorage.getItem("certnet-theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const startDark = stored ? stored === "dark" : prefersDark;
    applyTheme(startDark);
    toggle.addEventListener("click", () => {
        const dark = !document.body.classList.contains("dark-mode");
        applyTheme(dark);
        localStorage.setItem("certnet-theme", dark ? "dark" : "light");
    });
}

async function setupManualPdfViewer() {
    if (manualPdfLoading || manualPdfState?.pdf) {
        if (manualPdfState?.pdf) {
            renderManualPdfPage();
        }
        return;
    }
    const canvas = document.getElementById("manual-pdf-canvas");
    const fallback = document.getElementById("manual-pdf-fallback");
    const pageLabel = document.getElementById("manual-pdf-page");
    if (!canvas || !pageLabel) {
        return;
    }
    if (!window.pdfjsLib) {
        fallbackManualPdf();
        return;
    }
    manualPdfLoading = true;
    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const pdf = await pdfjsLib.getDocument("assets/docs/manual-sistema-certnet.pdf").promise;
        manualPdfState = {
            pdf,
            page: 1,
            zoom: 1
        };
        document.getElementById("manual-pdf-prev").addEventListener("click", () => {
            if (manualPdfState.page > 1) {
                manualPdfState.page -= 1;
                renderManualPdfPage();
            }
        });
        document.getElementById("manual-pdf-next").addEventListener("click", () => {
            if (manualPdfState.page < manualPdfState.pdf.numPages) {
                manualPdfState.page += 1;
                renderManualPdfPage();
            }
        });
        document.getElementById("manual-pdf-zoom-out").addEventListener("click", () => {
            manualPdfState.zoom = Math.max(0.7, manualPdfState.zoom - 0.15);
            renderManualPdfPage();
        });
        document.getElementById("manual-pdf-zoom-in").addEventListener("click", () => {
            manualPdfState.zoom = Math.min(1.8, manualPdfState.zoom + 0.15);
            renderManualPdfPage();
        });
        window.addEventListener("resize", () => {
            if (manualPdfState?.pdf) {
                renderManualPdfPage();
            }
        });
        await renderManualPdfPage();
        fallback?.classList.add("hidden");
    } catch {
        fallbackManualPdf();
    } finally {
        manualPdfLoading = false;
    }
}

async function renderManualPdfPage() {
    if (!manualPdfState?.pdf) {
        return;
    }
    const canvas = document.getElementById("manual-pdf-canvas");
    const shell = document.querySelector(".manual-canvas-wrap");
    const pageLabel = document.getElementById("manual-pdf-page");
    const previous = document.getElementById("manual-pdf-prev");
    const next = document.getElementById("manual-pdf-next");
    const page = await manualPdfState.pdf.getPage(manualPdfState.page);
    const baseViewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(260, (shell?.clientWidth || 620) - 32);
    const fitScale = availableWidth / baseViewport.width;
    const scale = Math.max(0.55, fitScale * manualPdfState.zoom);
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext("2d");
    const outputScale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
    await page.render({
        canvasContext: context,
        viewport
    }).promise;
    pageLabel.textContent = `Página ${manualPdfState.page} de ${manualPdfState.pdf.numPages}`;
    previous.disabled = manualPdfState.page <= 1;
    next.disabled = manualPdfState.page >= manualPdfState.pdf.numPages;
}

function fallbackManualPdf() {
    document.getElementById("manual-pdf-page").textContent = "Vista nativa del manual";
    document.getElementById("manual-pdf-canvas").classList.add("hidden");
    document.getElementById("manual-pdf-fallback").classList.remove("hidden");
}

function applyTheme(dark) {
    document.body.classList.toggle("dark-mode", dark);
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
        toggle.setAttribute("aria-pressed", String(dark));
        toggle.querySelector("span:last-child").textContent = dark ? "Modo claro" : "Modo oscuro";
    }
}

function setupTabs() {
    const buttons = document.querySelectorAll("[data-tab-target]");
    const panels = document.querySelectorAll(".tab-panel");
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const target = button.dataset.tabTarget;
            activeManualTab = target;
            buttons.forEach((item) => {
                item.classList.remove("active");
                item.setAttribute("aria-current", "false");
            });
            panels.forEach((panel) => panel.classList.remove("active"));
            button.classList.add("active");
            button.setAttribute("aria-current", "page");
            document.getElementById(target).classList.add("active");
            document.querySelectorAll("[data-page-target]").forEach((pageButton) => pageButton.classList.toggle("active", pageButton.dataset.pageTarget === "manual"));
            document.getElementById("manual-tabs").classList.remove("hidden");
            document.getElementById("detail-box").classList.remove("hidden");
            document.getElementById("section-title").textContent = "Manual técnico interactivo";
            document.getElementById("section-kicker").textContent = "Base de conocimiento";
            setTimeout(() => chartInstances.forEach((chart) => chart.resize()), 80);
            closeSidebar();
        });
    });
}

function setupDetailTriggers() {
    const title = document.getElementById("detail-title");
    const text = document.getElementById("detail-text");
    const badge = document.getElementById("detail-badge");
    const box = document.getElementById("detail-box");
    document.querySelectorAll(".detail-trigger").forEach((trigger) => {
        trigger.addEventListener("click", () => {
            document.querySelectorAll(".detail-trigger").forEach((item) => item.classList.remove("active"));
            trigger.classList.add("active");
            title.textContent = trigger.dataset.title;
            text.textContent = trigger.dataset.detail;
            badge.textContent = trigger.dataset.badge || "Detalle técnico";
            box.classList.remove("detail-flash");
            void box.offsetWidth;
            box.classList.add("detail-flash");
        });
    });
}

function setupTiaModel() {
    const descriptions = {
        ef: {
            title: "Entrance Facilities",
            text: "Punto de entrada de servicios del proveedor. Debe coordinar rutas, protección, demarcación, puesta a tierra y transición hacia el main crossconnect. TIA-569A ordena espacios y vías; TIA-607A exige continuidad de tierra cuando corresponde."
        },
        mc: {
            title: "Main Crossconnect",
            text: "Distribuidor principal de la planta. Centraliza backbone, equipos y enlaces externos. TIA-606A exige rotulado consistente, registros y código de colores para evitar cambios no trazables."
        },
        er: {
            title: "Equipment Room",
            text: "Sala de equipos de telecomunicaciones. Requiere control de espacio, energía, ventilación, seguridad, rutas de cable y tierra. Se relaciona con backbone y crossconnect principal."
        },
        tr: {
            title: "Cuarto de Telecomunicaciones",
            text: "Espacio por piso o zona donde terminan enlaces horizontales y backbone. Debe permitir mantenimiento, crecimiento, patching documentado y separación de fuentes de interferencia."
        },
        hc: {
            title: "Horizontal Crossconnect",
            text: "Patch panel, organizadores y cordones de administración entre equipo activo y cableado horizontal. Su código de color y registro pertenecen a TIA-606A."
        },
        hr: {
            title: "Cableado Horizontal",
            text: "Enlace permanente desde cuarto de telecomunicaciones hasta área de trabajo. La longitud del tramo horizontal debe respetar el límite estricto de 90 metros y certificarse por categoría."
        },
        wa: {
            title: "Work Area",
            text: "Área de usuario con faceplate, toma, patch cord y equipo terminal. Debe quedar rotulada, asociada al patch panel y validada con mapa de cableado y prueba de transmisión."
        }
    };
    const info = document.getElementById("tia-info");
    const nodes = document.querySelectorAll(".tia-node");
    const paths = document.querySelectorAll(".tia-path");
    nodes.forEach((node) => {
        node.addEventListener("click", () => {
            nodes.forEach((item) => item.classList.remove("active", "linked"));
            paths.forEach((path) => path.classList.remove("active"));
            node.classList.add("active");
            const links = (node.dataset.links || "").split(",").filter(Boolean);
            links.forEach((link) => {
                document.querySelectorAll(`[data-tia="${link}"]`).forEach((item) => item.classList.add("linked"));
                document.querySelectorAll(`[data-path="${link}"]`).forEach((item) => item.classList.add("active"));
            });
            const selected = descriptions[node.dataset.tia];
            info.innerHTML = `<h3 class="text-xl font-black">${selected.title}</h3><p class="mt-2 text-sm leading-6 text-slate-600">${selected.text}</p><div class="mt-4 rounded-xl bg-white p-3 text-xs font-bold text-[#2563eb]">Conexiones resaltadas: ${links.join(", ").toUpperCase()}</div>`;
        });
    });
}

function setupChecklist() {
    const warning = document.getElementById("ethic-warning");
    const steps = document.querySelectorAll(".practice-step");
    const update = () => {
        const pending = Array.from(steps).filter((step) => !step.querySelector("input[type='checkbox']").checked);
        steps.forEach((step) => {
            step.classList.toggle("step-done", step.querySelector("input[type='checkbox']").checked);
        });
        if (!pending.length) {
            warning.className = "mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900";
            warning.textContent = "Checklist completo. El reporte puede emitirse con mayor trazabilidad, siempre que las mediciones capturadas coincidan con la evidencia del instrumento físico.";
            return;
        }
        warning.className = "mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900";
        warning.textContent = pending[0].dataset.risk;
    };
    steps.forEach((step) => step.querySelector("input[type='checkbox']").addEventListener("change", update));
    update();
}

function setupFieldHelp() {
    const helpMap = {
        "project-name": ["Proyecto", "Nombre con el que se identificará el documento de certificación."],
        "client-name": ["Cliente", "Empresa, institución o persona responsable del proyecto."],
        "site-name": ["Lugar / sede", "Nombre de la sede, edificio, sucursal, piso o campus donde se realizó la medición."],
        "site-address": ["Dirección", "Ubicación física del trabajo. Ayuda a identificar el sitio certificado."],
        "technician-name": ["Técnico responsable", "Nombre del instalador, certificador o responsable que ejecutó o validó la prueba."],
        "tester-name": ["Equipo de medición", "Nombre general del instrumento usado: certificador, probador TDR, rastreador, escáner IP o tonificador."],
        "tester-model": ["Modelo del certificador", "Opcional. Sirve para trazabilidad profesional. Ejemplo: Fluke DTX-1200, DSX, LanTEK o modelo del probador."],
        "tester-serial": ["Número de serie", "Opcional. Es el serial físico del equipo principal. Si tu probador no lo muestra, déjalo vacío."],
        "software-version": ["Versión de software", "Opcional. Firmware, software interno o aplicación usada para generar la prueba. Ayuda a reproducir límites y cálculos."],
        "calibration-date": ["Fecha de calibración", "Opcional pero recomendado en certificación formal. Indica cuándo fue calibrado el instrumento."],
        "main-adapter": ["Adaptador local MAIN", "Opcional. Es el módulo, latiguillo o adaptador de prueba conectado en el extremo principal/local del enlace."],
        "remote-adapter": ["Unidad remota SR", "Opcional. Es el módulo remoto conectado al otro extremo del cable para cerrar la medición."],
        "test-standard": ["Norma de referencia", "Límite usado para decidir PASA/FALLA: TIA-568B, ISO/IEC, IEEE o criterio del proyecto."],
        "test-date": ["Fecha", "Día en que se realizó o documentó la medición."],
        "lan-vlans": ["VLAN / subredes", "Registra segmentos previstos: datos, voz, cámaras, invitados, administración u otros."],
        "lan-critical": ["Equipos críticos", "Lista servicios que no deben fallar: servidores, cámaras IP, AP, telefonía, control de acceso."],
        "lan-core": ["Core / gateway", "Equipo que concentra o enruta la red: switch capa 3, router, firewall o gateway principal."],
        "lan-capacity": ["Capacidad esperada", "Velocidad objetivo por usuarios, backbone o servidores. Ejemplo: 1 Gbps a usuario, 10 Gbps troncal."],
        "cabling-points": ["Cantidad de puntos", "Número total de tomas, puertos o enlaces previstos en el diseño."],
        "cabling-tr": ["Cuarto de telecomunicaciones", "Identifica rack, gabinete, TR o sala donde terminan los enlaces."],
        "cabling-route": ["Ruta / canalización", "Describe por dónde viaja el cable: bandeja, ducto, canaleta, piso técnico o tubería."],
        "cabling-admin": ["Rotulado y tierra", "Estado de administración TIA-606A y puesta a tierra TIA-607A."],
        "utp-pinout": ["Pinout aplicado", "Selecciona T568B o T568A. Ambos extremos deben usar el mismo esquema salvo un cruce intencional."],
        "utp-untwist": ["Destrenzado máximo", "Longitud de par destrenzado en el conector. Debe mantenerse menor a 13 mm para proteger NEXT."],
        "utp-connector": ["Tipo de conector", "Ejemplo: RJ45 Cat 6A, keystone, patch panel, módulo blindado o no blindado."],
        "utp-visual": ["Resultado visual", "Describe si el corte, inserción, alivio de tensión y orden de pares quedaron correctos."],
        "fiber-type": ["Tipo de fibra / conector", "Ejemplo: OM4 LC, OS2 SC/APC, patch cord dúplex o enlace troncal."],
        "fiber-clean": ["Inspección y limpieza", "Estado de limpieza antes de medir. En fibra, medir sin limpiar puede falsear la pérdida."],
        "fiber-loss": ["Pérdida medida", "Valor de pérdida óptica en dB obtenido con fuente/medidor o certificador."],
        "fiber-polarity": ["Polaridad", "Confirma que transmisión y recepción estén cruzadas correctamente en enlaces dúplex."],
        "port-id": ["ID punto / puerto", "Código único de la toma. Ejemplo: WA-01, PP-A-01, CAM-03 o Rack/Puerto."],
        "port-location": ["Área o ambiente", "Lugar donde está el punto: oficina, aula, pasillo, rack, cámara o puesto de trabajo."],
        "port-floor": ["Piso / zona", "Nivel, ala, sector o zona que ayuda a ubicar físicamente el punto."],
        "port-rack": ["Rack / patch panel", "Rack, patch panel y puerto donde termina el cable en el cuarto de telecomunicaciones."],
        "port-category": ["Categoría", "Categoría del cable o tipo de fibra usado en el enlace."],
        "port-test-type": ["Tipo de prueba", "Enlace permanente mide el cable instalado. Canal completo incluye patch cords. Fibra usa pérdida óptica."],
        "port-length": ["Longitud medida", "Longitud reportada por el instrumento. Para cableado horizontal cobre se controla el límite de 90 m."],
        "port-wiremap": ["Mapa de cableado", "Resultado del orden de pines: correcto, abierto, corto, invertido o cruce no planificado."],
        "port-nvp": ["NVP", "Velocidad nominal de propagación del cable. Muchos cables UTP usan valores cercanos a 69-72%."],
        "prop-delay": ["Retardo de propagación", "Tiempo en ns que tarda la señal en recorrer el enlace. Lo entrega el probador/certificador."],
        "delay-skew": ["Diferencia de retardo", "Diferencia entre pares. Valores altos pueden afectar Gigabit Ethernet."],
        "dc-resistance": ["Resistencia DC", "Resistencia eléctrica del enlace en ohm. Útil para detectar longitud excesiva o problemas de conductor."],
        "margin-il": ["Margen pérdida inserción", "Margen positivo entre límite y pérdida medida. Si es negativo, el punto falla."],
        "margin-next": ["Margen NEXT", "Margen de diafonía cercana. Protege la comunicación contra interferencia entre pares."],
        "margin-rl": ["Margen Return Loss", "Margen de pérdida de retorno. Valores bajos sugieren mala impedancia o conectorización."],
        "margin-acr": ["Margen ACR", "Relación entre señal útil y diafonía. Margen positivo indica reserva de desempeño."],
        "alien-margin": ["Alien Crosstalk", "Opcional. Ruido inducido por cables vecinos, importante en 10GBaseT y mazos densos."],
        "port-ip": ["IP detectada", "Dirección IP encontrada por escáner o prueba de red. No sustituye la certificación física."],
        "port-ping": ["PING promedio", "Latencia promedio en ms hacia el equipo o gateway. Sirve como prueba funcional adicional."],
        "port-speed": ["Velocidad medida", "Velocidad negociada o medida en Mbps. Ejemplo: 100, 1000 o 10000."],
        "port-notes": ["Observaciones técnicas", "Registra evidencias, anomalías, reparación, ruta, terminal, foto o decisión de campo."]
    };
    const popover = document.createElement("div");
    popover.id = "help-popover";
    popover.className = "help-popover hidden";
    document.body.appendChild(popover);
    Object.entries(helpMap).forEach(([id, help]) => {
        const control = document.getElementById(id);
        const label = control?.closest("label");
        if (!control || !label) {
            return;
        }
        label.classList.add("field-help-wrap");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "field-help-button";
        button.textContent = "?";
        button.setAttribute("aria-label", `Ayuda: ${help[0]}`);
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            showHelpPopover(button, help[0], help[1]);
        });
        control.before(button);
    });
    document.addEventListener("click", () => popover.classList.add("hidden"));
    window.addEventListener("scroll", () => popover.classList.add("hidden"), { passive: true });
}

function setupListFields() {
    document.querySelectorAll("[data-list-field]").forEach((input) => {
        const label = input.closest("label");
        if (!label || input.dataset.listReady === "true") {
            return;
        }
        input.dataset.listReady = "true";
        input.dataset.items = "[]";
        const control = document.createElement("div");
        control.className = "list-field-control mt-1";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "list-add-button";
        button.textContent = "Agregar";
        const list = document.createElement("ul");
        list.className = "list-field-items";
        list.setAttribute("aria-live", "polite");
        input.classList.remove("mt-1");
        input.after(control);
        control.appendChild(input);
        control.appendChild(button);
        control.after(list);
        const addItem = () => {
            const value = input.value.trim();
            if (!value) {
                input.focus();
                return;
            }
            const items = getListItems(input);
            items.push(value);
            setListItems(input, items);
            input.value = "";
            input.focus();
        };
        button.addEventListener("click", addItem);
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                addItem();
            }
        });
        renderListItems(input);
    });
}

function getListItems(input) {
    try {
        return JSON.parse(input.dataset.items || "[]");
    } catch {
        return [];
    }
}

function setListItems(input, items) {
    input.dataset.items = JSON.stringify(items);
    renderListItems(input);
}

function renderListItems(input) {
    const list = input.closest(".list-field-control")?.nextElementSibling;
    if (!list || !list.classList.contains("list-field-items")) {
        return;
    }
    const items = getListItems(input);
    list.innerHTML = items.map((item, index) => `<li class="list-field-item">
        <span>${escapeHtml(item)}</span>
        <button class="list-field-remove" type="button" aria-label="Quitar ${escapeHtml(item)}" data-remove-index="${index}">×</button>
    </li>`).join("");
        list.querySelectorAll("[data-remove-index]").forEach((button) => {
        button.addEventListener("click", () => {
            const next = getListItems(input);
            next.splice(parseInt(button.dataset.removeIndex, 10), 1);
            setListItems(input, next);
        });
    });
    autosaveProject();
}

function showHelpPopover(button, title, text) {
    const popover = document.getElementById("help-popover");
    const rect = button.getBoundingClientRect();
    popover.innerHTML = `<strong>${escapeHtml(title)}</strong>${escapeHtml(text)}`;
    popover.classList.remove("hidden");
    const width = Math.min(320, window.innerWidth - 32);
    const left = Math.min(window.innerWidth - width - 16, Math.max(16, rect.right - width));
    const top = Math.min(window.innerHeight - 150, rect.bottom + 10);
    popover.style.width = `${width}px`;
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
}

function setupCertification() {
    document.getElementById("port-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const port = collectPort();
        if (!port) {
            return;
        }
        ports.push(port);
        renderPorts();
        event.target.reset();
        document.getElementById("port-category").value = "Cat 6A";
        document.getElementById("port-wiremap").value = "correcto";
    });
    document.getElementById("load-demo").addEventListener("click", () => {
        ports = [
            evaluatePort({
                id: "WA-01",
                location: "Oficina Administración",
                floor: "Piso 1",
                rack: "R1 / PP-A-01",
                category: "Cat 6A",
                testType: "Enlace permanente",
                length: 72.4,
                wiremap: "correcto",
                nvp: 70.0,
                propDelay: 368,
                delaySkew: 18,
                dcResistance: 8.7,
                il: 5.4,
                next: 8.1,
                rl: 6.7,
                acr: 9.6,
                alien: 4.2,
                ip: "192.168.10.21",
                ping: 1.2,
                speed: 1000,
                notes: "T568B, TDR sin discontinuidad, margen estable."
            }),
            evaluatePort({
                id: "WA-02",
                location: "Sala de reuniones",
                floor: "Piso 1",
                rack: "R1 / PP-A-02",
                category: "Cat 6",
                testType: "Enlace permanente",
                length: 91.8,
                wiremap: "correcto",
                nvp: 70.0,
                propDelay: 466,
                delaySkew: 37,
                dcResistance: 11.8,
                il: 1.1,
                next: 2.4,
                rl: 1.9,
                acr: 2.2,
                alien: null,
                ip: "192.168.10.22",
                ping: 2.8,
                speed: 1000,
                notes: "Longitud supera el límite horizontal de 90 m; requiere rediseño o reubicación."
            }),
            evaluatePort({
                id: "CAM-03",
                location: "Pasillo norte",
                floor: "Piso 2",
                rack: "R2 / PP-B-11",
                category: "Cat 6A",
                testType: "Canal completo",
                length: 64.3,
                wiremap: "correcto",
                nvp: 69.5,
                propDelay: 331,
                delaySkew: 21,
                dcResistance: 7.9,
                il: 4.0,
                next: 5.5,
                rl: 3.8,
                acr: 5.2,
                alien: 3.1,
                ip: "192.168.20.35",
                ping: 12.4,
                speed: 100,
                notes: "Físico pasa; revisar negociación, PoE o configuración de cámara."
            })
        ];
        renderPorts();
    });
    document.getElementById("clear-ports").addEventListener("click", () => {
        ports = [];
        renderPorts();
    });
    document.getElementById("print-report").addEventListener("click", () => {
        renderReport();
        window.print();
    });
    document.getElementById("export-report").addEventListener("click", exportReport);
    document.getElementById("export-project-json").addEventListener("click", exportProjectJson);
    document.getElementById("import-project-json").addEventListener("click", () => document.getElementById("project-json-file").click());
    document.getElementById("project-json-file").addEventListener("change", importProjectJson);
    document.querySelectorAll("#project-form input, #project-form select").forEach((input) => {
        input.addEventListener("input", () => {
            renderReport();
            autosaveProject();
        });
        input.addEventListener("change", () => {
            renderReport();
            autosaveProject();
        });
    });
}

function setupProjectPersistence() {
    restoreAutosavedProject();
    [...projectControlIds, ...practiceControlIds, ...portDraftControlIds].forEach((id) => {
        const control = document.getElementById(id);
        if (!control) {
            return;
        }
        control.addEventListener("input", autosaveProject);
        control.addEventListener("change", autosaveProject);
    });
    document.querySelectorAll("#practice-checklist input[type='checkbox']").forEach((checkbox) => {
        checkbox.addEventListener("change", autosaveProject);
    });
    autosaveReady = true;
    autosaveProject();
}

function exportProjectJson() {
    const data = serializeProjectState();
    const projectName = data.projectControls["project-name"] || "proyecto-certnet";
    const fileName = `${slugify(projectName)}-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJson(data, fileName);
    setSaveStatus("Proyecto descargado en JSON.");
}

function importProjectJson(event) {
    const file = event.target.files?.[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(String(reader.result || "{}"));
            const result = restoreProjectState(data, {
                fillOnly: true,
                merge: true
            });
            renderPorts();
            autosaveProject();
            setSaveStatus(`JSON cargado: ${result.added} puntos nuevos agregados, ${result.skipped} duplicados omitidos. Los registros existentes se conservaron.`);
        } catch {
            setSaveStatus("No se pudo cargar el JSON. Verifica que sea un archivo exportado por CertNet Pro.", true);
        } finally {
            event.target.value = "";
        }
    };
    reader.readAsText(file, "utf-8");
}

function serializeProjectState() {
    return {
        schema: "certnet-project",
        version: 1,
        exportedAt: new Date().toISOString(),
        projectControls: readControls(projectControlIds),
        practiceControls: readControls(practiceControlIds),
        portDraft: readControls(portDraftControlIds),
        checklist: Array.from(document.querySelectorAll("#practice-checklist input[type='checkbox']")).map((checkbox) => checkbox.checked),
        listFields: readListFields(),
        ports
    };
}

function restoreAutosavedProject() {
    const raw = localStorage.getItem(autosaveKey);
    if (!raw) {
        setSaveStatus("El avance se guarda automáticamente en este navegador.");
        return;
    }
    try {
        const data = JSON.parse(raw);
        const result = restoreProjectState(data, {
            fillOnly: false,
            merge: false
        });
        setSaveStatus(`Avance recuperado automáticamente. ${result.added} puntos restaurados.`);
    } catch {
        setSaveStatus("Había un autosave previo, pero no se pudo leer.", true);
    }
}

function restoreProjectState(data, options = {}) {
    const fillOnly = Boolean(options.fillOnly);
    const merge = Boolean(options.merge);
    const projectControls = data.projectControls || data.project || {};
    const practiceControls = data.practiceControls || {};
    const portDraft = data.portDraft || {};
    writeControls(projectControls, { fillOnly });
    writeControls(practiceControls, { fillOnly });
    writeControls(portDraft, { fillOnly });
    writeChecklist(data.checklist || [], { merge });
    writeListFields(data.listFields || {}, { merge });
    const incoming = Array.isArray(data.ports) ? data.ports : Array.isArray(data.records) ? data.records : [];
    let added = 0;
    let skipped = 0;
    if (!merge) {
        ports = [];
    }
    const existing = new Set(ports.map(portKey));
    incoming.forEach((rawPort) => {
        const normalized = normalizeImportedPort(rawPort);
        if (!normalized) {
            skipped += 1;
            return;
        }
        const key = portKey(normalized);
        if (existing.has(key)) {
            skipped += 1;
            return;
        }
        ports.push(evaluatePort(normalized));
        existing.add(key);
        added += 1;
    });
    return {
        added,
        skipped
    };
}

function autosaveProject() {
    if (!autosaveReady) {
        return;
    }
    try {
        localStorage.setItem(autosaveKey, JSON.stringify(serializeProjectState()));
        setSaveStatus(`Guardado automático: ${new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}.`);
    } catch {
        setSaveStatus("No se pudo guardar automáticamente. Descarga un JSON como respaldo.", true);
    }
}

function readControls(ids) {
    return Object.fromEntries(ids.map((id) => [id, getControlValue(id)]));
}

function writeControls(values, options = {}) {
    Object.entries(values).forEach(([id, value]) => {
        const control = document.getElementById(id);
        if (!control || value === undefined || value === null) {
            return;
        }
        const current = getControlValue(id);
        const currentIsDefault = id === "project-name" && current === "Proyecto de Certificación LAN";
        if (options.fillOnly && current && !currentIsDefault) {
            return;
        }
        control.value = value;
    });
}

function getControlValue(id) {
    const control = document.getElementById(id);
    return control ? control.value : "";
}

function readListFields() {
    return Object.fromEntries(Array.from(document.querySelectorAll("[data-list-field]")).map((input) => [input.id, getListItems(input)]));
}

function writeListFields(values, options = {}) {
    Object.entries(values).forEach(([id, items]) => {
        const input = document.getElementById(id);
        if (!input || !Array.isArray(items)) {
            return;
        }
        const next = options.merge ? uniqueStrings([...getListItems(input), ...items]) : uniqueStrings(items);
        setListItems(input, next);
    });
}

function writeChecklist(values, options = {}) {
    const checkboxes = Array.from(document.querySelectorAll("#practice-checklist input[type='checkbox']"));
    checkboxes.forEach((checkbox, index) => {
        if (values[index] === undefined) {
            return;
        }
        checkbox.checked = options.merge ? checkbox.checked || Boolean(values[index]) : Boolean(values[index]);
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    });
}

function normalizeImportedPort(raw) {
    if (!raw || typeof raw !== "object") {
        return null;
    }
    const normalized = {
        id: String(raw.id || "").trim(),
        location: String(raw.location || "").trim(),
        floor: String(raw.floor || ""),
        rack: String(raw.rack || ""),
        category: String(raw.category || "Cat 6A"),
        testType: String(raw.testType || "Enlace permanente"),
        length: numberOrNull(raw.length),
        wiremap: String(raw.wiremap || "correcto"),
        nvp: numberOrNull(raw.nvp),
        propDelay: numberOrNull(raw.propDelay),
        delaySkew: numberOrNull(raw.delaySkew),
        dcResistance: numberOrNull(raw.dcResistance),
        il: numberOrNull(raw.il),
        next: numberOrNull(raw.next),
        rl: numberOrNull(raw.rl),
        acr: numberOrNull(raw.acr),
        alien: numberOrNull(raw.alien),
        ip: String(raw.ip || ""),
        ping: numberOrNull(raw.ping),
        speed: numberOrNull(raw.speed),
        notes: String(raw.notes || "")
    };
    if (!normalized.id || !normalized.location || normalized.length === null || normalized.il === null || normalized.next === null || normalized.rl === null || normalized.acr === null) {
        return null;
    }
    return normalized;
}

function portKey(port) {
    return String(port.id || "").trim().toLowerCase();
}

function numberOrNull(value) {
    if (value === "" || value === null || value === undefined) {
        return null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function uniqueStrings(items) {
    const seen = new Set();
    return items.map((item) => String(item || "").trim()).filter((item) => {
        if (!item) {
            return false;
        }
        const key = item.toLowerCase();
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function downloadJson(data, fileName) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
}

function slugify(value) {
    return String(value || "proyecto-certnet").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "proyecto-certnet";
}

function setSaveStatus(message, isError = false) {
    const status = document.getElementById("project-save-status");
    if (!status) {
        return;
    }
    status.textContent = message;
    status.className = `mt-1 text-sm leading-6 ${isError ? "text-red-700" : "text-slate-600"}`;
}

function collectPort() {
    const raw = {
        id: getValue("port-id"),
        location: getValue("port-location"),
        floor: getValue("port-floor"),
        rack: getValue("port-rack"),
        category: getValue("port-category"),
        testType: getValue("port-test-type"),
        length: getNumber("port-length"),
        wiremap: getValue("port-wiremap"),
        nvp: getNumber("port-nvp"),
        propDelay: getNumber("prop-delay"),
        delaySkew: getNumber("delay-skew"),
        dcResistance: getNumber("dc-resistance"),
        il: getNumber("margin-il"),
        next: getNumber("margin-next"),
        rl: getNumber("margin-rl"),
        acr: getNumber("margin-acr"),
        alien: getNumber("alien-margin"),
        ip: getValue("port-ip"),
        ping: getNumber("port-ping"),
        speed: getNumber("port-speed"),
        notes: getValue("port-notes")
    };
    const required = [raw.id, raw.location, raw.length, raw.il, raw.next, raw.rl, raw.acr];
    if (required.some((value) => value === "" || value === null)) {
        alert("Completa ID, lugar, longitud y márgenes críticos antes de agregar el punto.");
        return null;
    }
    return evaluatePort(raw);
}

function evaluatePort(raw) {
    const margins = [raw.il, raw.next, raw.rl, raw.acr].filter((value) => Number.isFinite(value));
    if (Number.isFinite(raw.alien)) {
        margins.push(raw.alien);
    }
    const minMargin = Math.min(...margins);
    const isFiber = raw.testType === "Fibra óptica" || raw.category.includes("Fibra");
    const lengthLimit = isFiber ? 2000 : 90;
    const lengthOk = raw.length <= lengthLimit;
    const wireOk = raw.wiremap === "correcto" || raw.wiremap === "no-aplica";
    const marginsOk = margins.every((value) => value >= 0);
    const physicalWarning = Number.isFinite(raw.delaySkew) && raw.delaySkew > 45 || Number.isFinite(raw.dcResistance) && raw.dcResistance > 12;
    const networkWarning = Number.isFinite(raw.ping) && raw.ping > 10 || Number.isFinite(raw.speed) && raw.speed > 0 && raw.speed < 1000 && raw.category.includes("6");
    let status = "PASA";
    if (!lengthOk || !wireOk || !marginsOk) {
        status = "FALLA";
    } else if (physicalWarning || networkWarning || minMargin < 3) {
        status = "REVISAR";
    }
    const reasons = [];
    if (!lengthOk) {
        reasons.push(isFiber ? "Longitud de fibra fuera del alcance definido para este modelo documental." : "Longitud horizontal mayor a 90 m.");
    }
    if (!wireOk) {
        reasons.push("Mapa de cableado no conforme.");
    }
    if (!marginsOk) {
        reasons.push("Uno o más márgenes críticos están por debajo del límite.");
    }
    if (physicalWarning) {
        reasons.push("Retardo, diferencia de retardo o resistencia sugieren revisar geometría, longitud o terminación.");
    }
    if (networkWarning) {
        reasons.push("La prueba IP o velocidad sugiere revisar equipo activo, PoE, negociación o configuración.");
    }
    if (status === "PASA" && minMargin < 3) {
        reasons.push("Pasa con reserva baja; conviene registrar punto como sensible a cambios.");
    }
    if (!reasons.length) {
        reasons.push("Parámetros críticos dentro de margen ingresado.");
    }
    return {
        ...raw,
        minMargin,
        status,
        reasons
    };
}

function renderPorts() {
    const table = document.getElementById("ports-table");
    const summary = document.getElementById("capture-summary");
    if (!ports.length) {
        table.innerHTML = `<tr><td class="px-4 py-4 text-slate-500" colspan="7">Sin puntos registrados.</td></tr>`;
        summary.textContent = "0 puntos";
        renderReport();
        autosaveProject();
        return;
    }
    table.innerHTML = ports.map((port, index) => {
        const style = statusStyles[port.status];
        return `<tr>
            <td class="px-4 py-3 font-bold">${escapeHtml(port.id)}</td>
            <td class="px-4 py-3">${escapeHtml(port.location)}</td>
            <td class="px-4 py-3">${escapeHtml(port.category)}</td>
            <td class="px-4 py-3">${port.length.toFixed(1)} m</td>
            <td class="px-4 py-3">${port.minMargin.toFixed(1)} dB</td>
            <td class="px-4 py-3"><span class="inline-flex rounded-full border px-3 py-1 text-xs font-black ${style}">${port.status}</span></td>
            <td class="px-4 py-3 no-print"><button class="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600" type="button" data-delete-port="${index}">Eliminar</button></td>
        </tr>`;
    }).join("");
    table.querySelectorAll("[data-delete-port]").forEach((button) => {
        button.addEventListener("click", () => {
            ports.splice(parseInt(button.dataset.deletePort, 10), 1);
            renderPorts();
        });
    });
    const pass = ports.filter((port) => port.status === "PASA").length;
    const review = ports.filter((port) => port.status === "REVISAR").length;
    const fail = ports.filter((port) => port.status === "FALLA").length;
    summary.textContent = `${ports.length} puntos · ${pass} pasa · ${review} revisar · ${fail} falla`;
    renderReport();
    autosaveProject();
}

function renderReport() {
    const project = getProjectData();
    const pass = ports.filter((port) => port.status === "PASA").length;
    const review = ports.filter((port) => port.status === "REVISAR").length;
    const fail = ports.filter((port) => port.status === "FALLA").length;
    const overallStatus = fail ? "FALLA" : review ? "REVISAR" : ports.length ? "PASA" : "REVISAR";
    const conclusion = fail ? "NO CONFORME HASTA CORRECCIÓN" : review ? "CONFORME CON OBSERVACIONES" : ports.length ? "CONFORME SEGÚN DATOS INGRESADOS" : "SIN PUNTOS CAPTURADOS";
    const rows = ports.length ? ports.map((port) => renderSummaryRow(port)).join("") : `<tr><td class="border border-slate-200 px-3 py-4 text-slate-500" colspan="8">No se han capturado puntos de red.</td></tr>`;
    const sheets = ports.length ? ports.map((port, index) => renderPortSheet(port, index, project)).join("") : renderEmptySheet(project);
    document.getElementById("report-content").innerHTML = `
        <div class="cert-report">
            <section class="cert-cover rounded-2xl p-5 shadow-sm md:p-6">
                <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p class="text-xs font-black uppercase tracking-[0.22em] text-[#2563eb]">CertNet Pro · Cable Test Management</p>
                        <h2 class="mt-2 text-3xl font-black">${escapeHtml(project.name)}</h2>
                        <p class="mt-2 text-sm text-slate-600">${escapeHtml(project.client)} · ${escapeHtml(project.site)} · ${escapeHtml(project.address)}</p>
                    </div>
                    <div class="cert-status ${reportStatusClass[overallStatus]} rounded-xl bg-white px-5 py-4 text-center">
                        <div class="text-xs uppercase">Sumario de Proyecto</div>
                        <div class="text-2xl">${overallStatus}</div>
                    </div>
                </div>
                <div class="mt-5 grid gap-3 md:grid-cols-4">
                    <div class="rounded-xl border border-slate-200 bg-white p-4"><div class="text-2xl font-black">${ports.length}</div><div class="text-xs font-bold uppercase text-slate-500">Puntos evaluados</div></div>
                    <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div class="text-2xl font-black text-emerald-700">${pass}</div><div class="text-xs font-bold uppercase text-emerald-700">Pasa</div></div>
                    <div class="rounded-xl border border-amber-200 bg-amber-50 p-4"><div class="text-2xl font-black text-amber-800">${review}</div><div class="text-xs font-bold uppercase text-amber-800">Revisar</div></div>
                    <div class="rounded-xl border border-red-200 bg-red-50 p-4"><div class="text-2xl font-black text-red-700">${fail}</div><div class="text-xs font-bold uppercase text-red-700">Falla</div></div>
                </div>
                <div class="mt-5 grid gap-4 text-sm md:grid-cols-3">
                    <div class="rounded-xl border border-slate-200 bg-white p-4 leading-6">
                        <strong>Operador:</strong> ${escapeHtml(project.tech || "No registrado")}<br>
                        <strong>Equipo:</strong> ${escapeHtml(project.tester || "No registrado")}<br>
                        <strong>Modelo:</strong> ${escapeHtml(project.testerModel || "No registrado")}
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-white p-4 leading-6">
                        <strong>Serial:</strong> ${escapeHtml(project.testerSerial || "No registrado")}<br>
                        <strong>Software:</strong> ${escapeHtml(project.softwareVersion || "No registrado")}<br>
                        <strong>Calibración:</strong> ${escapeHtml(project.calibrationDate || "No registrada")}
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-white p-4 leading-6">
                        <strong>Límite de prueba:</strong> ${escapeHtml(project.standard)}<br>
                        <strong>Fecha:</strong> ${escapeHtml(project.date)}<br>
                        <strong>Adaptadores:</strong> ${escapeHtml(project.mainAdapter || "Principal N/R")} / ${escapeHtml(project.remoteAdapter || "Remoto N/R")}
                    </div>
                </div>
                <div class="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6">
                    <strong>Conclusión general:</strong> ${conclusion}. La certificación final debe anexar archivos originales del instrumento, vigencia de calibración, adaptadores usados y límites de prueba cuando el contrato lo exija.
                </div>
            </section>
            <section class="mt-6 overflow-x-auto">
                <table class="min-w-full border-collapse text-left text-xs">
                    <thead class="bg-slate-100 uppercase tracking-wide text-slate-600">
                        <tr>
                            <th class="border border-slate-200 px-3 py-2">Punto</th>
                            <th class="border border-slate-200 px-3 py-2">Ubicación</th>
                            <th class="border border-slate-200 px-3 py-2">Medio</th>
                            <th class="border border-slate-200 px-3 py-2">Longitud</th>
                            <th class="border border-slate-200 px-3 py-2">NVP / Retardo</th>
                            <th class="border border-slate-200 px-3 py-2">Margen mínimo</th>
                            <th class="border border-slate-200 px-3 py-2">Estado</th>
                            <th class="border border-slate-200 px-3 py-2">Conclusión técnica</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </section>
            <section class="mt-6 space-y-6">${sheets}</section>
        </div>`;
    drawReportCanvases();
}

function renderSummaryRow(port) {
    const style = reportStatusClass[port.status];
    return `<tr>
        <td class="border border-slate-200 px-3 py-2 font-bold">${escapeHtml(port.id)}</td>
        <td class="border border-slate-200 px-3 py-2">${escapeHtml(port.location)}<br><span class="text-xs text-slate-500">${escapeHtml(port.floor)} ${escapeHtml(port.rack)}</span></td>
        <td class="border border-slate-200 px-3 py-2">${escapeHtml(port.category)}<br><span class="text-xs text-slate-500">${escapeHtml(port.testType)}</span></td>
        <td class="border border-slate-200 px-3 py-2">${formatValue(port.length, " m")}</td>
        <td class="border border-slate-200 px-3 py-2">NVP ${formatValue(port.nvp, "%")}<br>Prop ${formatValue(port.propDelay, " ns")} · Skew ${formatValue(port.delaySkew, " ns")}</td>
        <td class="border border-slate-200 px-3 py-2">${formatValue(port.minMargin, " dB")}</td>
        <td class="border border-slate-200 px-3 py-2"><span class="cert-status ${style} inline-flex rounded-lg px-2 py-1 text-[10px]">${port.status}</span></td>
        <td class="border border-slate-200 px-3 py-2">${escapeHtml(port.reasons.join(" "))}</td>
    </tr>`;
}

function renderEmptySheet(project) {
    return `<article class="cert-sheet rounded-2xl p-6 text-sm leading-6 text-slate-600">
        <h3 class="text-xl font-black text-slate-900">Sin puntos capturados</h3>
        <p class="mt-2">Registra los datos del instrumento físico para generar hojas individuales de certificación tipo laboratorio para ${escapeHtml(project.name)}.</p>
    </article>`;
}

function renderPortSheet(port, index, project) {
    const statusClass = reportStatusClass[port.status];
    const metricRows = metricProfiles.filter((profile) => profile.key !== "alien" || Number.isFinite(port.alien)).map((profile) => renderMetricRow(port, profile)).join("");
    return `<article class="cert-sheet overflow-hidden rounded-2xl">
        <div class="cert-sheet-header p-4">
            <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <p class="text-xs font-black uppercase tracking-[0.2em] text-[#2563eb]">ID Cable</p>
                    <h3 class="mt-1 text-2xl font-black">${escapeHtml(port.id)}</h3>
                    <p class="text-sm text-slate-600">${escapeHtml(port.location)} · ${escapeHtml(port.floor || "Zona no registrada")} · ${escapeHtml(port.rack || "Rack no registrado")}</p>
                </div>
                <div class="cert-status ${statusClass} rounded-xl bg-white px-5 py-3 text-center">
                    <div class="text-xs uppercase">Sumario de Pruebas</div>
                    <div class="text-2xl">${port.status}</div>
                </div>
            </div>
        </div>
        <div class="grid gap-4 p-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div class="space-y-4">
                <div class="grid gap-3 text-xs md:grid-cols-2">
                    <div class="rounded-xl border border-slate-200 p-3 leading-5">
                        <div class="cert-kv"><strong>Fecha / hora</strong><span>${escapeHtml(project.date)}</span></div>
                        <div class="cert-kv"><strong>Paso libre</strong><span>${formatValue(port.minMargin, " dB")}</span></div>
                        <div class="cert-kv"><strong>Límite de prueba</strong><span>${escapeHtml(project.standard)}</span></div>
                        <div class="cert-kv"><strong>Tipo de cable</strong><span>${escapeHtml(port.category)}</span></div>
                        <div class="cert-kv"><strong>NVP</strong><span>${formatValue(port.nvp, "%")}</span></div>
                    </div>
                    <div class="rounded-xl border border-slate-200 p-3 leading-5">
                        <div class="cert-kv"><strong>Operador</strong><span>${escapeHtml(project.tech || "N/R")}</span></div>
                        <div class="cert-kv"><strong>Modelo</strong><span>${escapeHtml(project.testerModel || project.tester || "N/R")}</span></div>
                        <div class="cert-kv"><strong>Serial</strong><span>${escapeHtml(project.testerSerial || "N/R")}</span></div>
                        <div class="cert-kv"><strong>Calibración</strong><span>${escapeHtml(project.calibrationDate || "N/R")}</span></div>
                        <div class="cert-kv"><strong>Adaptadores</strong><span>${escapeHtml(project.mainAdapter || "MAIN")} / ${escapeHtml(project.remoteAdapter || "SR")}</span></div>
                    </div>
                </div>
                <div class="rounded-xl border border-slate-200 p-3 text-xs leading-5">
                    <div class="grid gap-2 md:grid-cols-2">
                        <div><strong>Longitud:</strong> ${formatValue(port.length, " m")}</div>
                        <div><strong>Retardo propagación:</strong> ${formatValue(port.propDelay, " ns")}</div>
                        <div><strong>Diferencia retardo:</strong> ${formatValue(port.delaySkew, " ns")}</div>
                        <div><strong>Resistencia DC:</strong> ${formatValue(port.dcResistance, " ohm")}</div>
                        <div><strong>IP detectada:</strong> ${escapeHtml(port.ip || "N/R")}</div>
                        <div><strong>Ping / velocidad:</strong> ${formatValue(port.ping, " ms")} / ${formatValue(port.speed, " Mbps", 0)}</div>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="cert-metric-table min-w-full border-collapse text-left text-xs">
                        <thead>
                            <tr>
                                <th>Resultado</th>
                                <th>Prueba</th>
                                <th>Peor par MAIN</th>
                                <th>Valor MAIN</th>
                                <th>Peor par SR</th>
                                <th>Valor SR</th>
                                <th>Frec.</th>
                                <th>Límite</th>
                                <th>Margen</th>
                            </tr>
                        </thead>
                        <tbody>${metricRows}</tbody>
                    </table>
                </div>
                <div class="rounded-xl border border-slate-200 p-3 text-xs leading-5">
                    <strong>Estándares de red compatibles:</strong>
                    <div class="mt-2 grid gap-1 sm:grid-cols-3">
                        <span>10BASE-T</span><span>100BASE-TX</span><span>1000BASE-T</span><span>1000BASE-T4</span><span>10GBase-T</span><span>TR-16 Passive</span>
                    </div>
                </div>
            </div>
            <div class="space-y-4">
                <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div class="rounded-xl border-2 border-orange-300 bg-slate-50 p-3 text-center text-xs font-black text-slate-700">MAIN<br>${escapeHtml(project.mainAdapter || "Probador")}</div>
                    <div class="text-center text-xs font-black text-slate-500">${formatValue(port.length, " m")}</div>
                    <div class="rounded-xl border-2 border-orange-300 bg-slate-50 p-3 text-center text-xs font-black text-slate-700">SR<br>${escapeHtml(project.remoteAdapter || "Remoto")}</div>
                </div>
                <div class="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
                    <div class="rounded-xl border border-slate-200 p-3">
                        <div class="text-xs font-black">Mapa de Cableado (T568B)</div>
                        <div class="mt-2 text-xs font-black ${port.wiremap === "correcto" ? "text-emerald-700" : "text-red-700"}">${port.wiremap === "correcto" ? "PASA" : "REVISAR / FALLA"}</div>
                        <div class="mt-3">${renderWireMap(port)}</div>
                    </div>
                    <div class="grid gap-3 sm:grid-cols-2">
                        ${renderReportCanvas(index, "il", "Pérdida inserción", port.il)}
                        ${renderReportCanvas(index, "next", "NEXT", port.next)}
                        ${renderReportCanvas(index, "nextRemote", "NEXT @ Remoto", port.next - 0.8)}
                        ${renderReportCanvas(index, "acr", "ACR-F", port.acr)}
                        ${renderReportCanvas(index, "acrRemote", "ACR-F @ Remoto", port.acr - 0.6)}
                        ${renderReportCanvas(index, "acrN", "ACR-N", port.acr - 1.1)}
                        ${renderReportCanvas(index, "acrNRemote", "ACR-N @ Remoto", port.acr - 1.4)}
                        ${renderReportCanvas(index, "rl", "RL", port.rl)}
                    </div>
                </div>
                <div class="rounded-xl border border-slate-200 p-3 text-xs leading-5">
                    <strong>Conclusión por punto:</strong> ${escapeHtml(port.reasons.join(" "))}<br>
                    <strong>Observaciones:</strong> ${escapeHtml(port.notes || "Sin observaciones adicionales.")}
                </div>
            </div>
        </div>
        <div class="border-t border-cyan-100 px-4 py-3 text-center text-xs text-slate-500">Lugar: ${escapeHtml(project.site)} · ${escapeHtml(project.address)} · CertNet Pro</div>
    </article>`;
}

function renderMetricRow(port, profile) {
    const margin = Number.isFinite(port[profile.key]) ? port[profile.key] : null;
    const mainValue = calculateMetricValue(profile, margin, 0);
    const remoteValue = calculateMetricValue(profile, margin, profile.higherIsBetter ? -0.5 : 0.5);
    const result = margin === null ? "N/A" : margin >= 0 ? "PASA" : "FALLA";
    const resultClass = result === "PASA" ? "text-emerald-700" : result === "FALLA" ? "text-red-700" : "text-slate-500";
    return `<tr>
        <td class="font-black ${resultClass}">${result}</td>
        <td class="font-bold">${escapeHtml(profile.title)}</td>
        <td>${escapeHtml(profile.pair)}</td>
        <td>${formatValue(mainValue, " " + profile.unit)}</td>
        <td>${escapeHtml(profile.pair === "N/A" ? "N/A" : profile.pair.split("").reverse().join(""))}</td>
        <td>${formatValue(remoteValue, " " + profile.unit)}</td>
        <td>${formatValue(profile.frequency, " MHz")}</td>
        <td>${formatValue(profile.limit, " " + profile.unit)}</td>
        <td class="font-black">${formatValue(margin, " dB")}</td>
    </tr>`;
}

function calculateMetricValue(profile, margin, offset) {
    if (!Number.isFinite(margin)) {
        return null;
    }
    const value = profile.higherIsBetter ? profile.limit + margin + offset : profile.limit - margin + offset;
    return Math.max(0, value);
}

function renderWireMap(port) {
    return `<div class="wire-map">${wireSchemeT568B.map((wire) => {
        const failClass = port.wiremap === "correcto" || port.wiremap === "no-aplica" ? "" : " wire-fault";
        return `<div class="wire-line${failClass}">
            <span>${wire.pin}</span>
            <span class="wire-color-name">${escapeHtml(wire.name)}</span>
            <span class="wire-conductor" style="background:${wire.style}"></span>
        </div>`;
    }).join("")}</div>`;
}

function renderReportCanvas(index, kind, title, margin) {
    const safeMargin = Number.isFinite(margin) ? margin : 0;
    return `<div>
        <div class="mb-1 text-center text-[10px] font-black uppercase text-slate-600">${escapeHtml(title)}</div>
        <canvas class="report-mini-chart" width="280" height="112" data-port-index="${index}" data-chart-kind="${kind}" data-margin="${safeMargin.toFixed(2)}" data-title="${escapeHtml(title)}"></canvas>
    </div>`;
}

function drawReportCanvases(root = document) {
    root.querySelectorAll(".report-mini-chart").forEach((canvas) => drawMiniSpectrum(canvas));
}

function drawMiniSpectrum(canvas) {
    const margin = parseFloat(canvas.dataset.margin || "0");
    const kind = canvas.dataset.chartKind || "metric";
    const width = canvas.clientWidth || 280;
    const height = canvas.clientHeight || 112;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 4; x++) {
        const gx = 30 + x * ((width - 42) / 4);
        ctx.beginPath();
        ctx.moveTo(gx, 12);
        ctx.lineTo(gx, height - 20);
        ctx.stroke();
    }
    for (let y = 0; y <= 3; y++) {
        const gy = 12 + y * ((height - 32) / 3);
        ctx.beginPath();
        ctx.moveTo(30, gy);
        ctx.lineTo(width - 12, gy);
        ctx.stroke();
    }
    ctx.fillStyle = "#64748b";
    ctx.font = "9px system-ui, sans-serif";
    ctx.fillText("0", 12, height - 20);
    ctx.fillText("MHz", width - 34, height - 6);
    ctx.strokeStyle = margin < 0 ? "#ef4444" : "#f59e0b";
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
        const t = i / 80;
        const x = 30 + t * (width - 42);
        const y = kind === "il" ? 22 + t * 58 : 72 - t * 24;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ["#2563eb", "#10b981", "#f59e0b", "#7c3aed"].forEach((color, pairIndex) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        for (let i = 0; i <= 80; i++) {
            const t = i / 80;
            const x = 30 + t * (width - 42);
            const seed = pairIndex * 17 + kind.length * 9;
            const wave = Math.sin((t * 16 + seed) * 1.7) * 4 + Math.sin((t * 45 + seed) * 0.75) * 2;
            const base = kind === "il" ? 16 + t * (42 - Math.min(margin, 12)) : 34 + t * 18 - Math.min(margin, 12);
            const y = clamp(base + wave + pairIndex * 2, 12, height - 22);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    });
    ctx.fillStyle = margin < 0 ? "#dc2626" : margin < 3 ? "#b45309" : "#059669";
    ctx.fillRect(width - 48, 8, 36, 14);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px system-ui, sans-serif";
    ctx.fillText(margin.toFixed(1), width - 42, 18);
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function formatValue(value, suffix = "", decimals = 1) {
    if (!Number.isFinite(value)) {
        return "N/A";
    }
    return `${value.toFixed(decimals)}${suffix}`;
}

function getProjectData() {
    return {
        name: getValue("project-name") || "Proyecto de Certificación LAN",
        client: getValue("client-name") || "Cliente no registrado",
        site: getValue("site-name") || "Sede no registrada",
        address: getValue("site-address") || "Dirección no registrada",
        tech: getValue("technician-name"),
        tester: getValue("tester-name"),
        testerModel: getValue("tester-model"),
        testerSerial: getValue("tester-serial"),
        softwareVersion: getValue("software-version"),
        calibrationDate: getValue("calibration-date"),
        mainAdapter: getValue("main-adapter"),
        remoteAdapter: getValue("remote-adapter"),
        standard: getValue("test-standard"),
        date: getValue("test-date") || new Date().toISOString().slice(0, 10)
    };
}

function exportReport() {
    renderReport();
    const project = getProjectData();
    const drawScript = `${clamp.toString()}\n${drawMiniSpectrum.toString()}\n${drawReportCanvases.toString()}\nwindow.addEventListener("load", function() { drawReportCanvases(document); });`;
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(project.name)}</title><script src="https://cdn.tailwindcss.com"><\/script><style>${getReportExportCss()}</style></head><body class="bg-white p-6">${document.getElementById("report-section").innerHTML}<script>${drawScript}<\/script></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "certificacion-lan"}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
}

function getReportExportCss() {
    return `
body{background:#fff;color:#0f172a;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.cert-report{max-width:1180px;margin:0 auto}.cert-cover{border:1px solid #b7f4ef;border-top:8px solid #67e8f9;background:linear-gradient(180deg,#ecfeff 0%,#fff 54%)}.cert-status{border:3px solid currentColor;font-weight:900;letter-spacing:.06em}.cert-status.pasa{color:#059669}.cert-status.revisar{color:#b45309}.cert-status.falla{color:#dc2626}.cert-sheet{page-break-inside:avoid;border:1px solid #99f6e4;background:#fff}.cert-sheet+.cert-sheet{margin-top:1.5rem}.cert-sheet-header{background:#cffafe;border-bottom:1px solid #99f6e4}.wire-map{display:grid;gap:.28rem}.wire-line{display:grid;grid-template-columns:1.4rem minmax(5.2rem,.9fr) minmax(4rem,1fr);align-items:center;gap:.4rem;font-size:.72rem;font-weight:700}.wire-color-name{color:#334155;font-weight:800}.wire-conductor{height:3px;border-radius:999px;border:1px solid #cbd5e1}.wire-fault .wire-conductor{outline:2px solid #ef4444;outline-offset:2px}.report-mini-chart{width:100%;height:112px;border:1px solid #cbd5e1;background:#fff}.cert-metric-table td,.cert-metric-table th{border:1px solid #cbd5e1;padding:.32rem .42rem;vertical-align:top}.cert-metric-table th{background:#f8fafc;font-size:.67rem;text-transform:uppercase;color:#475569}.cert-kv{display:grid;grid-template-columns:minmax(8rem,.9fr) minmax(0,1fr);gap:.4rem}@media print{body{padding:0!important}.cert-report{max-width:none;margin:0;font-size:10px}.cert-sheet{break-inside:avoid;page-break-inside:avoid}.report-mini-chart{height:92px}}`;
}

function createCharts() {
    const trafficChart = new Chart(document.getElementById("trafficChart"), {
        type: "doughnut",
        data: {
            labels: wrapLabels(["Unicast", "Broadcast", "Multicast"]),
            datasets: [{
                data: [82, 8, 10],
                backgroundColor: ["#2563eb", "#f59e0b", "#10b981"],
                borderColor: "#ffffff",
                borderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom"
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const item = tooltipItems[0];
                            let label = item.chart.data.labels[item.dataIndex];
                            if (Array.isArray(label)) {
                                return label.join(' ');
                            } else {
                                return label;
                            }
                        }
                    }
                }
            }
        }
    });
    const categoryChart = new Chart(document.getElementById("categoryChart"), {
        type: "bar",
        data: {
            labels: wrapLabels(["Categoría 5e", "Categoría 6", "Categoría 6A", "Categoría 7", "Categoría 7A", "Categoría 8"]),
            datasets: [{
                label: "Frecuencia regulada típica (MHz)",
                data: [100, 250, 500, 600, 1000, 2000],
                backgroundColor: ["#93c5fd", "#60a5fa", "#3b82f6", "#10b981", "#f59e0b", "#fb923c"],
                borderRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "MHz"
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const item = tooltipItems[0];
                            let label = item.chart.data.labels[item.dataIndex];
                            if (Array.isArray(label)) {
                                return label.join(' ');
                            } else {
                                return label;
                            }
                        }
                    }
                }
            }
        }
    });
    const opticalLossChart = new Chart(document.getElementById("opticalLossChart"), {
        type: "polarArea",
        data: {
            labels: wrapLabels(["850 nm multimodo", "1300 nm multimodo", "1310 nm monomodo", "1550 nm monomodo"]),
            datasets: [{
                label: "Atenuación típica dB/km",
                data: [3.0, 1.0, 0.35, 0.22],
                backgroundColor: ["rgba(245, 158, 11, 0.62)", "rgba(59, 130, 246, 0.62)", "rgba(16, 185, 129, 0.62)", "rgba(37, 99, 235, 0.62)"],
                borderColor: ["#f59e0b", "#3b82f6", "#10b981", "#2563eb"],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom"
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const item = tooltipItems[0];
                            let label = item.chart.data.labels[item.dataIndex];
                            if (Array.isArray(label)) {
                                return label.join(' ');
                            } else {
                                return label;
                            }
                        }
                    }
                }
            }
        }
    });
    const ethernetChart = new Chart(document.getElementById("ethernetChart"), {
        type: "line",
        data: {
            labels: wrapLabels(["10 Mbps Ethernet", "100 Mbps Fast Ethernet", "1000 Mbps Gigabit Ethernet", "10000 Mbps 10 Gigabit Ethernet"]),
            datasets: [{
                label: "Tasa nominal Mbps",
                data: [10, 100, 1000, 10000],
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.12)",
                pointBackgroundColor: ["#f59e0b", "#3b82f6", "#10b981", "#2563eb"],
                pointRadius: 5,
                tension: 0.32,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: "logarithmic",
                    min: 10,
                    max: 10000,
                    title: {
                        display: true,
                        text: "Mbps"
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const item = tooltipItems[0];
                            let label = item.chart.data.labels[item.dataIndex];
                            if (Array.isArray(label)) {
                                return label.join(' ');
                            } else {
                                return label;
                            }
                        }
                    }
                }
            }
        }
    });
    chartInstances.push(trafficChart, categoryChart, opticalLossChart, ethernetChart);
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}
