/* ==========================================================================
   SITE SURVEY CONTROLLER - CERTNET PRO
   ========================================================================== */

// 1. DICCIONARIO DE DEFINICIONES NORTMATIVAS (HELP_DATA)
const HELP_DATA = {
    "building-name": {
        title: "Nombre del Edificio / Sede",
        std: "ANSI/TIA-606-D",
        def: "Identificador del sitio físico de levantamiento. Permite asociar las rutas y espacios de telecomunicaciones a una demarcación geográfica específica.",
        tip: "Utilice nombres comerciales o nomenclaturas oficiales de la empresa para la carátula formal del proyecto."
    },
    "building-address": {
        title: "Dirección Física",
        std: "ANSI/TIA-606-D",
        def: "Dirección postal o coordenadas geográficas del sitio donde reside el cableado estructurado bajo auditoría.",
        tip: "Especifique calle, número, sector o zona para auditorías complejas o sedes distribuidas en campus."
    },
    "building-use": {
        title: "Uso Predominante",
        std: "ANSI/TIA-568.0-E",
        def: "Tipo de actividad del edificio. Determina la densidad mínima de tomas de red por área y los niveles de redundancia mecánica y eléctrica.",
        tip: "Oficinas corporativas requieren al menos 2 tomas de red por estación de trabajo de 10 metros cuadrados."
    },
    "hvac": {
        title: "Climatización HVAC",
        std: "ASHRAE Clase A1/A2",
        def: "Control ambiental (aire acondicionado) de temperatura (18°C a 27°C) y humedad (8% a 60%) constante las 24 horas para equipos activos.",
        tip: "Asegure que el flujo de aire frío esté dirigido al frente del rack y que existan filtros de aire contra el polvo."
    },
    "grounding": {
        title: "Puesta a Tierra TMGB",
        std: "ANSI/TIA-607-E",
        def: "Conexión eléctrica de baja resistencia entre la estructura metálica del rack y la Barra Principal de Tierra de Telecomunicaciones.",
        tip: "Cada rack metálico debe contar con un conductor de cobre calibre AWG #6 de color verde exclusivo, con pintura removida en los puntos de contacto."
    },
    "conduit-fill": {
        title: "Llenado de Canalizaciones",
        std: "ANSI/TIA-569-E",
        def: "La norma limita la saturación de cables a un máximo del 40% del área transversal interna de la tubería o bandeja para permitir curvas y expansiones.",
        tip: "El 60% restante es holgura obligatoria para proteger el radio de curvatura durante el tendido físico."
    },
    "cca-wire": {
        title: "Conductores CCA (Aluminio-Cobre)",
        std: "ANSI/TIA-568.2-D",
        def: "Cables falsificados fabricados con núcleo de aluminio y una delgada capa exterior de cobre. Incumplen estrictamente los estándares internacionales.",
        tip: "El cable CCA tiene alta resistencia eléctrica, se quiebra fácilmente y presenta un altísimo peligro de incendio si se alimenta con PoE++ (802.3bt)."
    },
    "next-loss": {
        title: "NEXT (Parámetro NEXT)",
        std: "ANSI/TIA-568.2-E",
        def: "Near-End Crosstalk o diafonía del extremo cercano. Ruido electromagnético que se acopla entre pares debido al trenzado deshecho en conectores.",
        tip: "Mantenga el destrenzado del cable UTP menor a 13 mm en los keystones y patch panels para evitar este fallo físico."
    },
    "tr-vs-er": {
        title: "Diferencia: Cuarto TR vs. Sala ER",
        std: "ANSI/TIA-569-E",
        isHtml: true,
        def: `<p class="mb-2"><strong>1. Cuarto de Telecomunicaciones (TR):</strong> Espacio de distribución intermedia o local por piso/ala. Conecta cableado horizontal (nodos de usuarios) con el backbone vertical.</p>
              <p class="mb-3"><strong>2. Sala de Equipamiento (ER):</strong> Centro de datos centralizado del edificio/campus. Concentra los TRs y aloja servidores, conmutadores troncales (Core) y equipos de telecomunicaciones críticos.</p>
              <table class="w-full text-[10px] border border-slate-700/50 mt-2 text-left rounded overflow-hidden">
                  <thead>
                      <tr class="bg-slate-800 text-slate-250 font-bold border-b border-slate-700">
                          <th class="p-1.5">Característica</th>
                          <th class="p-1.5">Cuarto TR</th>
                          <th class="p-1.5">Sala ER</th>
                      </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/50 text-slate-350">
                      <tr>
                          <td class="p-1.5 font-bold text-slate-200">Jerarquía</td>
                          <td class="p-1.5">Intermedia / Local</td>
                          <td class="p-1.5">Principal / Central</td>
                      </tr>
                      <tr>
                          <td class="p-1.5 font-bold text-slate-200">Ubicación</td>
                          <td class="p-1.5">Pisos o áreas</td>
                          <td class="p-1.5">Exclusiva (1 por edificio)</td>
                      </tr>
                      <tr>
                          <td class="p-1.5 font-bold text-slate-200">Equipos</td>
                          <td class="p-1.5">Switches de acceso, patch panels</td>
                          <td class="p-1.5">Servidores, Switches Core, PBX</td>
                      </tr>
                      <tr>
                          <td class="p-1.5 font-bold text-slate-200">Conexión</td>
                          <td class="p-1.5">Cableado horizontal (usuarios)</td>
                          <td class="p-1.5">Concentra todos los TRs del sitio</td>
                      </tr>
                  </tbody>
              </table>`,
        tip: "Según la norma ANSI/TIA-569-E, la Sala ER posee requerimientos ambientales, de seguridad física y de redundancia de energía significativamente mayores que un TR de distribución local."
    },
    "rack-units": {
        title: "Unidades de Rack (RU / U)",
        std: "EIA/ECA-310-E",
        isHtml: true,
        def: `<p class="mb-2"><strong>¿Qué es una RU?</strong> Rack Unit (en español, Unidad de Rack o 'U') es la unidad estándar de altura vertical para equipar gabinetes y bastidores de 19 pulgadas de ancho.</p>
              <p class="mb-2"><strong>Medida exacta:</strong> 1 RU equivale a exactamente <strong>1.75 pulgadas (44.45 mm)</strong> de altura y abarca tres orificios para tornillos en el perfil vertical de montaje.</p>
              <ul class="list-disc list-inside space-y-1 mt-2 text-slate-350">
                  <li><strong>1 RU:</strong> Switches de acceso, paneles de parcheo (patch panels) o bandejas deslizantes.</li>
                  <li><strong>2 RU, 4 RU o más:</strong> Servidores de almacenamiento, sistemas UPS o bancos de baterías robustos.</li>
              </ul>`,
        tip: "En este campo debe colocar la altura total del bastidor que va a instalar. Los tamaños comerciales más comunes son: Racks de piso estándar (42 RU o 45 RU) y gabinetes de pared medianos/pequeños (12 RU o 24 RU)."
    }
};

// 2. ESTADO GLOBAL DE DATOS (SURVEYDATA)
let surveyData = {
    mode: '', // 'greenfield' o 'brownfield'
    buildingName: '',
    buildingAddress: '',
    buildingUse: '',
    reportPurpose: '',
    reportScope: '',
    reportBackground: '',
    reportFindings: '',
    reportWifi: '',
    reportSecurity: '',
    floors: []
};

const autosaveKey = "certnet-site-survey-state-v1";
let installPromptEvent = null;

// 3. INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
    setupTheme();
    setupSidebar();
    setupModeSelection();
    setupWorkspaceEvents();
    setupHelpTriggers();
    setupInstallPrompt();

    // Intentar auto-recuperar avance al inicio
    const hasAutosave = localStorage.getItem(autosaveKey);
    if (hasAutosave) {
        document.getElementById("btn-restore-last").classList.remove("hidden");
    } else {
        document.getElementById("btn-restore-last").classList.add("hidden");
    }
});

// 4. SELECCIÓN DE MODALIDAD
function setupInstallPrompt() {
    const installButton = document.getElementById("btn-install-app");
    if (!installButton) {
        return;
    }

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (isStandalone) {
        document.body.classList.add("pwa-standalone");
        installButton.classList.add("hidden");
        return;
    }

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        installPromptEvent = event;
        installButton.classList.remove("hidden");
    });

    installButton.addEventListener("click", async () => {
        if (!installPromptEvent) {
            showToast("Instalación", "En Android abre el menú de Chrome y toca Instalar aplicación.", "info");
            return;
        }

        installPromptEvent.prompt();
        await installPromptEvent.userChoice;
        installPromptEvent = null;
        installButton.classList.add("hidden");
    });

    window.addEventListener("appinstalled", () => {
        installPromptEvent = null;
        installButton.classList.add("hidden");
        showToast("App instalada", "CertNet Pro quedó instalada en el dispositivo.", "success");
    });
}

function setupModeSelection() {
    const screenSelection = document.getElementById("mode-selection");
    const screenWorkspace = document.getElementById("survey-workspace");

    document.getElementById("btn-select-greenfield").addEventListener("click", () => {
        initSurvey('greenfield');
    });

    document.getElementById("btn-select-brownfield").addEventListener("click", () => {
        initSurvey('brownfield');
    });

    document.getElementById("btn-restore-last").addEventListener("click", () => {
        restoreLastSave();
    });

    document.getElementById("btn-load-json-trigger").addEventListener("click", () => {
        document.getElementById("survey-json-file").click();
    });

    document.getElementById("survey-json-file").addEventListener("change", importProjectJson);

    document.getElementById("btn-change-mode").addEventListener("click", () => {
        const confirmChange = confirm("¿Está seguro de que desea cambiar de modalidad? Se borrarán todos los pisos y nodos capturados en esta sesión.");
        if (confirmChange) {
            resetSurvey();
        }
    });
}

function initSurvey(mode) {
    surveyData.mode = mode;
    localStorage.setItem("certnet-survey-mode", mode);

    // Ajustar Banner de Modalidad
    const bannerEmoji = document.getElementById("active-mode-emoji");
    const bannerTitle = document.getElementById("active-mode-title");
    const bannerContainer = document.getElementById("active-mode-banner");

    if (mode === 'greenfield') {
        bannerEmoji.textContent = "🌱";
        bannerTitle.textContent = "Proyecto Desde Cero (Greenfield)";
        bannerContainer.className = "mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3";
    } else {
        bannerEmoji.textContent = "🏢";
        bannerTitle.textContent = "Mejora o Modificación de Red (Brownfield)";
        bannerContainer.className = "mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3";
    }

    document.getElementById("mode-selection").classList.add("hidden");
    document.getElementById("survey-workspace").classList.remove("hidden");

    // Limpiar o Inicializar jerarquía si está vacía
    if (surveyData.floors.length === 0) {
        // Por defecto añadir un Piso inicial
        addFloor();
    } else {
        renderHierarchy();
    }
    
    runNormativeAnalysis();
    showToast("📋 Site Survey", `Levantamiento ${mode === 'greenfield' ? 'Greenfield' : 'Brownfield'} listo.`, "success");
}

function resetSurvey() {
    surveyData = {
        mode: '',
        buildingName: '',
        buildingAddress: '',
        buildingUse: '',
        floors: []
    };
    
    document.getElementById("building-name").value = "";
    document.getElementById("building-address").value = "";
    document.getElementById("building-use").value = "";

    localStorage.removeItem(autosaveKey);

    document.getElementById("survey-workspace").classList.add("hidden");
    document.getElementById("mode-selection").classList.remove("hidden");

    // Reiniciar métricas
    updateMetrics();

    // Ocultar botón de restaurar
    document.getElementById("btn-restore-last").classList.add("hidden");
}

// 5. GESTIÓN DE LA INFRAESTRUCTURA JERÁRQUICA (DOM BUILDER)
function addFloor() {
    const floorId = "floor_" + Date.now();
    const newFloor = {
        id: floorId,
        name: `Piso ${surveyData.floors.length + 1}`,
        trs: []
    };
    surveyData.floors.push(newFloor);
    renderHierarchy();
    saveSurveyToLocalStorage();
    runNormativeAnalysis();
}

function addTR(floorId) {
    const floor = surveyData.floors.find(f => f.id === floorId);
    if (!floor) return;

    const trId = "tr_" + Date.now();
    const newTR = {
        id: trId,
        name: `Cuarto TR ${floor.trs.length + 1}`,
        type: 'TR', // 'TR' o 'ER'
        hvac: 'none', // 'dedicated', 'shared', 'none'
        racks: []
    };
    floor.trs.push(newTR);
    renderHierarchy();
    saveSurveyToLocalStorage();
    runNormativeAnalysis();
}

function addRack(floorId, trId) {
    const floor = surveyData.floors.find(f => f.id === floorId);
    if (!floor) return;
    const tr = floor.trs.find(t => t.id === trId);
    if (!tr) return;

    const rackId = "rack_" + Date.now();
    const newRack = {
        id: rackId,
        name: `Rack ${tr.racks.length + 1}`,
        type: 'closed', // 'open' o 'closed'
        units: 42,
        grounding: false,
        equipments: [],
        points: []
    };
    tr.racks.push(newRack);
    renderHierarchy();
    saveSurveyToLocalStorage();
    runNormativeAnalysis();
}

function addPoints(floorId, trId, rackId) {
    const floor = surveyData.floors.find(f => f.id === floorId);
    if (!floor) return;
    const tr = floor.trs.find(t => t.id === trId);
    if (!tr) return;
    const rack = tr.racks.find(r => r.id === rackId);
    if (!rack) return;

    const pointsId = "points_" + Date.now();
    const newPoints = {
        id: pointsId,
        qty: 24,
        category: 'Cat 6A U/UTP',
        use: 'Datos', // 'Datos', 'Voz', 'CCTV', 'PoE++'
        proposedBackbone: 'OM4', // Solo Greenfield
        currentStatus: 'Bueno', // Solo Brownfield ('Bueno', 'Degradado', 'Obsoleto')
        labelingAudit: 'no', // Solo Brownfield ('si', 'no')
        ccaSuspicion: false, // Solo Brownfield (bool)
        failedNEXT: false // Solo Brownfield (bool)
    };
    rack.points.push(newPoints);
    renderHierarchy();
    saveSurveyToLocalStorage();
    runNormativeAnalysis();
}

// 6. ELIMINACIÓN DE NODOS DE LA JERARQUÍA
function deleteNode(level, floorId, trId, rackId, pointsId) {
    if (!confirm("¿Está seguro de que desea eliminar este elemento y toda su jerarquía de cableado?")) {
        return;
    }

    if (level === 'floor') {
        surveyData.floors = surveyData.floors.filter(f => f.id !== floorId);
    } else if (level === 'tr') {
        const floor = surveyData.floors.find(f => f.id === floorId);
        if (floor) {
            floor.trs = floor.trs.filter(t => t.id !== trId);
        }
    } else if (level === 'rack') {
        const floor = surveyData.floors.find(f => f.id === floorId);
        if (floor) {
            const tr = floor.trs.find(t => t.id === trId);
            if (tr) {
                tr.racks = tr.racks.filter(r => r.id !== rackId);
            }
        }
    } else if (level === 'points') {
        const floor = surveyData.floors.find(f => f.id === floorId);
        if (floor) {
            const tr = floor.trs.find(t => t.id === trId);
            if (tr) {
                const rack = tr.racks.find(r => r.id === rackId);
                if (rack) {
                    rack.points = rack.points.filter(p => p.id !== pointsId);
                }
            }
        }
    } else if (level === 'equipment') {
        const floor = surveyData.floors.find(f => f.id === floorId);
        if (floor) {
            const tr = floor.trs.find(t => t.id === trId);
            if (tr) {
                const rack = tr.racks.find(r => r.id === rackId);
                if (rack && rack.equipments) {
                    rack.equipments = rack.equipments.filter(e => e.id !== pointsId);
                }
            }
        }
    }

    renderHierarchy();
    saveSurveyToLocalStorage();
    runNormativeAnalysis();
}

function addEquipment(floorId, trId, rackId, type) {
    const floor = surveyData.floors.find(f => f.id === floorId);
    if (!floor) return;
    const tr = floor.trs.find(t => t.id === trId);
    if (!tr) return;
    const rack = tr.racks.find(r => r.id === rackId);
    if (!rack) return;

    if (!rack.equipments) {
        rack.equipments = [];
    }

    const eqId = "eq_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    let newEq = {
        id: eqId,
        type: type, // 'router', 'switch', 'patch_panel'
        brand: '',
        model: '',
        ru: 1,
        currentStatus: 'Bueno'
    };

    if (type === 'router') {
        newEq.brand = 'Cisco';
        newEq.model = 'ISR 4331';
        newEq.ports = 8;
    } else if (type === 'switch') {
        newEq.brand = 'Ubiquiti';
        newEq.model = 'UniFi Pro 24 PoE';
        newEq.ports = 24;
        newEq.poeType = 'poe+';
    } else if (type === 'patch_panel') {
        newEq.brand = 'Panduit';
        newEq.model = 'DP24688TGY';
        newEq.ports = 24;
        newEq.category = 'Cat 6A';
        newEq.shielded = false;
    }

    rack.equipments.push(newEq);
    renderHierarchy();
    saveSurveyToLocalStorage();
    runNormativeAnalysis();
}

// 7. RENDERIZADO EFICIENTE DEL ÁRBOL (DOM INJECTOR)
function renderHierarchy() {
    const container = document.getElementById("hierarchy-container");
    container.innerHTML = ""; // Limpiar

    if (surveyData.floors.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-200 p-5">
                <p class="text-sm">No hay pisos agregados al levantamiento físico.</p>
            </div>`;
        return;
    }

    surveyData.floors.forEach((floor, fIdx) => {
        const floorNode = document.createElement("div");
        floorNode.className = "piso-container";
        floorNode.innerHTML = `
            <!-- Encabezado de Piso -->
            <div class="piso-header-card p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-3 w-full sm:w-auto">
                    <span class="text-2xl text-blue-500">🏢</span>
                    <div class="w-full">
                        <span class="text-[10px] font-black uppercase tracking-widest text-blue-500">Nivel 2: Piso / Área</span>
                        <input type="text" value="${escapeHtml(floor.name)}" 
                               class="floor-input w-full font-black text-slate-800 text-lg border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-blue-500 focus:outline-none bg-transparent" 
                               data-floor-id="${floor.id}" data-field="name">
                    </div>
                </div>
                <div class="flex gap-2 w-full sm:w-auto justify-end no-print">
                    <button onclick="addTR('${floor.id}')" class="rounded-xl bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 hover:bg-blue-100 transition shadow-sm" type="button">
                        ➕ Añadir TR/ER
                    </button>
                    <button onclick="deleteNode('floor', '${floor.id}')" class="rounded-xl bg-red-50 p-2 text-xs text-red-600 hover:bg-red-100 transition" title="Eliminar Piso" type="button">
                        🗑️
                    </button>
                </div>
            </div>

            <!-- Listado de TRs dentro de este Piso -->
            <div class="trs-list" id="trs-list-${floor.id}"></div>
        `;
        container.appendChild(floorNode);

        const trsListContainer = document.getElementById(`trs-list-${floor.id}`);

        floor.trs.forEach((tr, tIdx) => {
            const trNode = document.createElement("div");
            trNode.className = "tr-card p-4 md:p-5 mb-4";
            trNode.innerHTML = `
                <!-- Encabezado del Cuarto de Telecomunicaciones -->
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <div class="flex items-center gap-3 w-full sm:w-auto">
                        <span class="text-2xl text-amber-500">⚡</span>
                        <div class="w-full">
                            <span class="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                                Nivel 3: Espacio TIA-569-E 
                                <span class="help-trigger-survey text-slate-400 cursor-pointer" data-help-id="hvac">?</span>
                            </span>
                            <input type="text" value="${escapeHtml(tr.name)}" 
                                   class="tr-input w-full font-black text-slate-800 text-base border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-amber-500 focus:outline-none bg-transparent" 
                                   data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-field="name">
                        </div>
                    </div>
                    <div class="flex gap-2 w-full sm:w-auto justify-end no-print">
                        <button onclick="addRack('${floor.id}', '${tr.id}')" class="rounded-xl bg-amber-50 px-4 py-2 text-xs font-black text-amber-700 hover:bg-amber-100 transition shadow-sm" type="button">
                            ➕ Añadir Rack
                        </button>
                        <button onclick="deleteNode('tr', '${floor.id}', '${tr.id}')" class="rounded-xl bg-red-50 p-2 text-xs text-red-600 hover:bg-red-100 transition" title="Eliminar TR" type="button">
                            🗑️
                        </button>
                    </div>
                </div>

                <!-- Campos de Configuración del TR -->
                <div class="mt-4 grid gap-3 sm:grid-cols-2 text-xs font-bold text-slate-700">
                    <label class="block">
                        <span class="flex items-center gap-1.5">
                            Función del Espacio *
                            <span class="help-trigger-survey text-slate-400 cursor-pointer" data-help-id="tr-vs-er">?</span>
                        </span>
                        <select class="tr-select mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-normal" 
                                data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-field="type">
                            <option value="TR" ${tr.type === 'TR' ? 'selected' : ''}>Cuarto de Telecomunicaciones (TR)</option>
                            <option value="ER" ${tr.type === 'ER' ? 'selected' : ''}>Cuarto de Equipos Principal (ER)</option>
                        </select>
                    </label>
                    <label class="block">
                        Climatización Mecánica HVAC *
                        <select class="tr-select mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-normal" 
                                data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-field="hvac">
                            <option value="dedicated" ${tr.hvac === 'dedicated' ? 'selected' : ''}>Dedicada y Operativa (Clase A1/A2 ASHRAE)</option>
                            <option value="shared" ${tr.hvac === 'shared' ? 'selected' : ''}>Compartida con Oficinas Generales</option>
                            <option value="none" ${tr.hvac === 'none' ? 'selected' : ''}>Sin Climatización / Ventilación Pasiva</option>
                        </select>
                    </label>
                </div>

                <!-- Listado de Racks dentro del TR -->
                <div class="racks-list" id="racks-list-${tr.id}"></div>
            `;
            trsListContainer.appendChild(trNode);

            const racksListContainer = document.getElementById(`racks-list-${tr.id}`);

            tr.racks.forEach((rack, rIdx) => {
                const totalRU = parseInt(rack.units, 10) || 42;
                if (!rack.equipments) rack.equipments = [];
                const occupiedRU = rack.equipments.reduce((acc, eq) => acc + (parseInt(eq.ru, 10) || 0), 0);
                const pctOcupado = (occupiedRU / totalRU) * 100;
                const pctLibre = Math.max(0, 100 - pctOcupado).toFixed(0);
                const pctOcupadoClamped = Math.min(100, pctOcupado);

                const rackNode = document.createElement("div");
                rackNode.className = "rack-card p-4 md:p-5 mb-4";
                rackNode.innerHTML = `
                    <!-- Encabezado del Rack -->
                    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3">
                        <div class="flex items-center gap-3 w-full sm:w-auto">
                            <span class="text-2xl text-emerald-500"> Rack </span>
                            <div class="w-full">
                                <span class="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                                    Nivel 4: Bastidores & Gabinetes
                                    <span class="help-trigger-survey text-slate-400 cursor-pointer" data-help-id="grounding">?</span>
                                </span>
                                <input type="text" value="${escapeHtml(rack.name)}" 
                                       class="rack-input w-full font-black text-slate-800 text-sm border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-emerald-500 focus:outline-none bg-transparent" 
                                       data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-field="name">
                            </div>
                        </div>
                        <div class="flex gap-2 w-full sm:w-auto justify-end no-print flex-wrap">
                            <button onclick="addPoints('${floor.id}', '${tr.id}', '${rack.id}')" class="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition shadow-sm" type="button">
                                ➕ Puntos
                            </button>
                            <button onclick="addEquipment('${floor.id}', '${tr.id}', '${rack.id}', 'router')" class="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-800 hover:bg-indigo-100 transition shadow-sm" type="button">
                                ➕ Router
                            </button>
                            <button onclick="addEquipment('${floor.id}', '${tr.id}', '${rack.id}', 'switch')" class="rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-800 hover:bg-violet-100 transition shadow-sm" type="button">
                                ➕ Switch
                            </button>
                            <button onclick="addEquipment('${floor.id}', '${tr.id}', '${rack.id}', 'patch_panel')" class="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-slate-100 transition shadow-sm" type="button">
                                ➕ Patch Panel
                            </button>
                            <button onclick="deleteNode('rack', '${floor.id}', '${tr.id}', '${rack.id}')" class="rounded-xl bg-red-50 p-1.5 text-xs text-red-600 hover:bg-red-100 transition" title="Eliminar Rack" type="button">
                                🗑️
                            </button>
                        </div>
                    </div>

                    <!-- Configuración del Rack -->
                    <div class="mt-4 grid gap-3 sm:grid-cols-3 text-xs font-bold text-slate-700">
                        <label class="block">
                            Estructura Física
                            <select class="rack-select mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-normal" 
                                    data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-field="type">
                                <option value="closed" ${rack.type === 'closed' ? 'selected' : ''}>Gabinete Cerrado</option>
                                <option value="open" ${rack.type === 'open' ? 'selected' : ''}>Bastidor Abierto (2/4 Postes)</option>
                            </select>
                        </label>
                        <label class="block">
                            <span class="flex items-center gap-1.5">
                                Capacidad Vertical (RU)
                                <span class="help-trigger-survey text-slate-400 cursor-pointer" data-help-id="rack-units">?</span>
                            </span>
                            <input type="number" value="${rack.units}" min="12" max="52" 
                                   class="rack-input mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-normal" 
                                   data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-field="units">
                        </label>
                        <div class="flex items-center gap-3 sm:mt-6 bg-slate-50 p-3 rounded-xl border border-slate-100 rack-info-banner">
                            <input type="checkbox" ${rack.grounding ? 'checked' : ''} 
                                   class="rack-checkbox h-4 w-4 rounded border-slate-350 text-emerald-600 focus:ring-emerald-500 accent-emerald-600" 
                                   data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-field="grounding">
                            <span class="block text-xs font-black text-slate-700">Aterrizado a TMGB/TGB</span>
                        </div>
                    </div>

                    <!-- Capacidad Vertical Ocupada (EIA/ECA-310-E) -->
                    <div class="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200 rack-info-banner">
                        <div class="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                            <span class="flex items-center gap-1.5">
                                Capacidad Vertical (EIA/ECA-310-E)
                                <span class="help-trigger-survey text-slate-400 cursor-pointer" data-help-id="rack-units">?</span>
                            </span>
                            <span class="${occupiedRU > totalRU ? 'text-red-600 dark:text-red-400 font-black' : 'text-slate-500 dark:text-slate-400'}">
                                ${occupiedRU} / ${totalRU} RU (${pctLibre}% Libre)
                            </span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                            <div class="${occupiedRU > totalRU ? 'bg-red-500' : pctOcupado >= 85 ? 'bg-amber-500' : 'bg-emerald-500'} h-2.5 transition-all duration-300" style="width: ${pctOcupadoClamped}%"></div>
                        </div>
                        ${occupiedRU > totalRU ? `
                        <p class="text-[10px] text-red-650 dark:text-red-400 font-bold mt-1.5 flex items-center gap-1">
                            ⚠️ ¡Sobrecarga Crítica! Se ha excedido la altura del rack en ${occupiedRU - totalRU} RU.
                        </p>` : ''}
                    </div>

                    <!-- Listado de Equipamiento Físico del Rack -->
                    <div class="equipments-list mt-4 space-y-3" id="equipments-list-${rack.id}"></div>

                    <!-- Listado de Puntos de Red del Rack -->
                    <div class="points-list mt-4" id="points-list-${rack.id}"></div>
                `;
                racksListContainer.appendChild(rackNode);

                // Render equipments
                const equipmentsListContainer = document.getElementById(`equipments-list-${rack.id}`);
                equipmentsListContainer.innerHTML = "";

                rack.equipments.forEach((eq, eqIdx) => {
                    const eqNode = document.createElement("div");
                    
                    let typeLabel = "";
                    let icon = "";
                    let borderClass = "";
                    let typeBadge = "";
                    let typeFields = "";

                    if (eq.type === 'router') {
                        typeLabel = "Router";
                        icon = "🌐";
                        borderClass = "border-l-4 border-indigo-500 equipment-wrapper-router";
                        typeBadge = "equipment-ru-badge badge-router";
                        typeFields = `
                            <label class="block">
                                Puertos LAN/WAN
                                <input type="number" value="${eq.ports || 8}" min="1" max="48"
                                       class="equipment-input mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-normal" 
                                       data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${eq.id}" data-equipment-id="${eq.id}" data-field="ports">
                            </label>
                        `;
                    } else if (eq.type === 'switch') {
                        typeLabel = "Switch";
                        icon = "🔌";
                        borderClass = "border-l-4 border-violet-500 equipment-wrapper-switch";
                        typeBadge = "equipment-ru-badge badge-switch";
                        typeFields = `
                            <label class="block">
                                Puertos Conmutación
                                <input type="number" value="${eq.ports || 24}" min="1" max="96"
                                       class="equipment-input mt-1 w-full rounded-xl border p-2.5 font-normal" 
                                       data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${eq.id}" data-equipment-id="${eq.id}" data-field="ports">
                            </label>
                            <label class="block">
                                Soporte PoE (Alimentación)
                                <select class="equipment-select mt-1 w-full rounded-xl border p-2.5 font-normal" 
                                        data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${eq.id}" data-equipment-id="${eq.id}" data-field="poeType">
                                    <option value="none" ${eq.poeType === 'none' ? 'selected' : ''}>Sin PoE / Solo Datos</option>
                                    <option value="poe" ${eq.poeType === 'poe' ? 'selected' : ''}>PoE Estándar (802.3af - 15.4W)</option>
                                    <option value="poe+" ${eq.poeType === 'poe+' ? 'selected' : ''}>PoE+ Gigabit (802.3at - 30W)</option>
                                    <option value="poe++" ${eq.poeType === 'poe++' ? 'selected' : ''}>PoE++ Industrial (802.3bt - 90W)</option>
                                </select>
                            </label>
                        `;
                    } else if (eq.type === 'patch_panel') {
                        typeLabel = "Patch Panel";
                        icon = "🎛️";
                        borderClass = "border-l-4 border-slate-500 equipment-wrapper-patch";
                        typeBadge = "equipment-ru-badge badge-patch";
                        typeFields = `
                            <label class="block">
                                Puertos Parcheo
                                <input type="number" value="${eq.ports || 24}" min="1" max="96"
                                       class="equipment-input mt-1 w-full rounded-xl border p-2.5 font-normal" 
                                       data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${eq.id}" data-equipment-id="${eq.id}" data-field="ports">
                            </label>
                            <label class="block">
                                Categoría Normativa
                                <select class="equipment-select mt-1 w-full rounded-xl border p-2.5 font-normal" 
                                        data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${eq.id}" data-equipment-id="${eq.id}" data-field="category">
                                    <option value="Cat 6A" ${eq.category === 'Cat 6A' ? 'selected' : ''}>Cat 6A (10G Cert.)</option>
                                    <option value="Cat 6" ${eq.category === 'Cat 6' ? 'selected' : ''}>Cat 6 (1G Cert.)</option>
                                    <option value="Cat 5e" ${eq.category === 'Cat 5e' ? 'selected' : ''}>Cat 5e (Obsoleto)</option>
                                </select>
                            </label>
                            <div class="flex items-center gap-2 mt-6 bg-white p-2.5 rounded-xl border border-slate-200 rack-info-banner">
                                <input type="checkbox" ${eq.shielded ? 'checked' : ''} 
                                       class="equipment-checkbox h-4 w-4 rounded border-slate-350 text-slate-600 focus:ring-slate-500 accent-slate-600" 
                                       data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${eq.id}" data-equipment-id="${eq.id}" data-field="shielded">
                                <span class="block text-xs font-black text-slate-700">Apantallado FTP</span>
                            </div>
                        `;
                    }

                    eqNode.className = `rounded-2xl border p-4 ${borderClass} mb-3 shadow-sm relative`;
                    eqNode.innerHTML = `
                        <div class="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                            <span class="text-xs font-black flex items-center gap-2 text-slate-900 equipment-type-header">
                                <span>${icon}</span>
                                <span>${typeLabel}</span>
                                <span class="${typeBadge}">${eq.ru} RU</span>
                            </span>
                            <button onclick="deleteNode('equipment', '${floor.id}', '${tr.id}', '${rack.id}', '${eq.id}')" class="text-red-500 hover:text-red-700 transition font-black text-xs no-print" type="button">
                                &times; Quitar Equipo
                            </button>
                        </div>

                        <div class="grid gap-3 sm:grid-cols-4 text-xs font-bold text-slate-700 mb-3">
                            <label class="block">
                                Marca / Fabricante
                                <input type="text" value="${escapeHtml(eq.brand)}" placeholder="Ej. Cisco"
                                       class="equipment-input mt-1 w-full rounded-xl border p-2.5 font-normal" 
                                       data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${eq.id}" data-equipment-id="${eq.id}" data-field="brand">
                            </label>
                            <label class="block">
                                Modelo Técnico
                                <input type="text" value="${escapeHtml(eq.model)}" placeholder="Ej. Catalyst 9300"
                                       class="equipment-input mt-1 w-full rounded-xl border p-2.5 font-normal" 
                                       data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${eq.id}" data-equipment-id="${eq.id}" data-field="model">
                            </label>
                            <label class="block">
                                Altura Física (RU)
                                <input type="number" value="${eq.ru}" min="1" max="10"
                                       class="equipment-input mt-1 w-full rounded-xl border p-2.5 font-normal" 
                                       data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${eq.id}" data-equipment-id="${eq.id}" data-field="ru">
                            </label>
                            <label class="block">
                                Estado Físico / Operativo
                                <select class="equipment-select mt-1 w-full rounded-xl border p-2.5 font-normal" 
                                        data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${eq.id}" data-equipment-id="${eq.id}" data-field="currentStatus">
                                    <option value="Bueno" ${eq.currentStatus === 'Bueno' ? 'selected' : ''}>Bueno / Operativo</option>
                                    <option value="Degradado" ${eq.currentStatus === 'Degradado' ? 'selected' : ''}>Degradado / Falla</option>
                                    <option value="Obsoleto" ${eq.currentStatus === 'Obsoleto' ? 'selected' : ''}>Obsoleto / Reemplazar</option>
                                </select>
                            </label>
                        </div>

                        <div class="grid gap-3 sm:grid-cols-3 text-xs font-bold text-slate-700">
                            ${typeFields}
                        </div>
                    `;
                    equipmentsListContainer.appendChild(eqNode);
                });

                const pointsListContainer = document.getElementById(`points-list-${rack.id}`);

                rack.points.forEach((point, pIdx) => {
                    const pointNode = document.createElement("div");
                    pointNode.className = "points-card p-4 mb-3";
                    
                    // Campos condicionales según Modalidad
                    let modeFields = "";
                    if (surveyData.mode === 'greenfield') {
                        modeFields = `
                            <label class="block text-xs font-bold text-slate-700">
                                Medio Propuesto Backbone
                                <select class="points-select mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-normal" 
                                        data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${point.id}" data-field="proposedBackbone">
                                    <option value="OM4" ${point.proposedBackbone === 'OM4' ? 'selected' : ''}>Fibra Óptica OM4 Multimodo</option>
                                    <option value="OS2" ${point.proposedBackbone === 'OS2' ? 'selected' : ''}>Fibra Óptica OS2 Monomodo</option>
                                    <option value="Cat6A" ${point.proposedBackbone === 'Cat6A' ? 'selected' : ''}>Cobre Cat 6A U/UTP</option>
                                </select>
                            </label>
                        `;
                    } else {
                        modeFields = `
                            <label class="block text-xs font-bold text-slate-700">
                                Diagnóstico del Enlace
                                <select class="points-select mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-normal" 
                                        data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${point.id}" data-field="currentStatus">
                                    <option value="Bueno" ${point.currentStatus === 'Bueno' ? 'selected' : ''}>Estado Óptimo / Conforme</option>
                                    <option value="Degradado" ${point.currentStatus === 'Degradado' ? 'selected' : ''}>Físicamente Degradado</option>
                                    <option value="Obsoleto" ${point.currentStatus === 'Obsoleto' ? 'selected' : ''}>Obsoleto / Desuso</option>
                                </select>
                            </label>
                            
                            <label class="block text-xs font-bold text-slate-700">
                                Rotulado (ANSI/TIA-606-D)
                                <select class="points-select mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-normal" 
                                        data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${point.id}" data-field="labelingAudit">
                                    <option value="si" ${point.labelingAudit === 'si' ? 'selected' : ''}>Con Código Consistente (Sí)</option>
                                    <option value="no" ${point.labelingAudit === 'no' ? 'selected' : ''}>Sin Nomenclatura Normativa (No)</option>
                                </select>
                            </label>

                            <div class="sm:col-span-3 grid grid-cols-2 gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
                                <label class="flex items-center gap-2 text-xs font-black text-slate-700 cursor-pointer">
                                    <input type="checkbox" ${point.ccaSuspicion ? 'checked' : ''} 
                                           class="points-checkbox h-4 w-4 rounded text-[#8b5cf6] focus:ring-violet-500 accent-[#8b5cf6]" 
                                           data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${point.id}" data-field="ccaSuspicion">
                                    <span class="flex items-center gap-1">Sospecha de Cable CCA (Falso) <span class="help-trigger-survey text-slate-400" data-help-id="cca-wire">?</span></span>
                                </label>
                                <label class="flex items-center gap-2 text-xs font-black text-slate-700 cursor-pointer">
                                    <input type="checkbox" ${point.failedNEXT ? 'checked' : ''} 
                                           class="points-checkbox h-4 w-4 rounded text-[#8b5cf6] focus:ring-violet-500 accent-[#8b5cf6]" 
                                           data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${point.id}" data-field="failedNEXT">
                                    <span class="flex items-center gap-1">Fallos Previos NEXT/RL <span class="help-trigger-survey text-slate-400" data-help-id="next-loss">?</span></span>
                                </label>
                            </div>
                        `;
                    }

                    pointNode.innerHTML = `
                        <!-- Cabecera de Nodos -->
                        <div class="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                            <span class="text-xs font-black text-violet-700 flex items-center gap-2">
                                🔌 Grupo de Nodos
                            </span>
                            <button onclick="deleteNode('points', '${floor.id}', '${tr.id}', '${rack.id}', '${point.id}')" class="text-red-500 hover:text-red-700 transition font-black text-sm no-print" type="button">
                                &times; Quitar Nodos
                            </button>
                        </div>

                        <!-- Campos Comunes de Nodos -->
                        <div class="grid gap-3 sm:grid-cols-3 text-xs font-bold text-slate-700 mb-3">
                            <label class="block">
                                Cantidad de Puertos
                                <input type="number" value="${point.qty}" min="1" max="144" 
                                       class="points-input mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-normal" 
                                       data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${point.id}" data-field="qty">
                            </label>
                            <label class="block">
                                Categoría / Medio
                                <select class="points-select mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-normal" 
                                        data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${point.id}" data-field="category">
                                    <option value="Cat 6A U/UTP" ${point.category === 'Cat 6A U/UTP' ? 'selected' : ''}>Cat 6A U/UTP Cobre</option>
                                    <option value="Cat 6A F/UTP" ${point.category === 'Cat 6A F/UTP' ? 'selected' : ''}>Cat 6A F/UTP Apantallado</option>
                                    <option value="Cat 6 U/UTP" ${point.category === 'Cat 6 U/UTP' ? 'selected' : ''}>Cat 6 U/UTP Cobre</option>
                                    <option value="Cat 5e U/UTP" ${point.category === 'Cat 5e U/UTP' ? 'selected' : ''}>Cat 5e U/UTP (Obsoleto)</option>
                                    <option value="Fibra OM4 Multimodo" ${point.category === 'Fibra OM4 Multimodo' ? 'selected' : ''}>Fibra OM4 10G/40G</option>
                                    <option value="Fibra OS2 Monomodo" ${point.category === 'Fibra OS2 Monomodo' ? 'selected' : ''}>Fibra OS2 Larga Distancia</option>
                                </select>
                            </label>
                            <label class="block">
                                Aplicación / Uso *
                                <select class="points-select mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-normal" 
                                        data-floor-id="${floor.id}" data-tr-id="${tr.id}" data-rack-id="${rack.id}" data-points-id="${point.id}" data-field="use">
                                    <option value="Datos" ${point.use === 'Datos' ? 'selected' : ''}>Datos Generales (PC, AP)</option>
                                    <option value="Voz IP" ${point.use === 'Voz IP' ? 'selected' : ''}>Telefonía / Voz IP</option>
                                    <option value="CCTV" ${point.use === 'CCTV' ? 'selected' : ''}>Seguridad / CCTV</option>
                                    <option value="PoE++" ${point.use === 'PoE++' ? 'selected' : ''}>Alimentación PoE++ (802.3bt)</option>
                                </select>
                            </label>
                        </div>

                        <!-- Campos Condicionales de Modalidad -->
                        <div class="grid gap-3 sm:grid-cols-3 text-xs font-bold text-slate-700">
                            ${modeFields}
                        </div>
                    `;
                    pointsListContainer.appendChild(pointNode);
                });
            });
        });
    });

    // Actualizar popovers de ayuda inyectados en la jerarquía
    setupHelpTriggers();
    // Actualizar métricas visuales
    updateMetrics();
}

// 8. MANEJADOR REACTIVO DE CAMBIOS EN FORMULARIOS (EVENT DELEGATION)
function setupWorkspaceEvents() {
    const container = document.getElementById("hierarchy-container");

    // Delegación para inputs de texto y numéricos
    container.addEventListener("input", (event) => {
        const target = event.target;
        if (!target.dataset.field) return;

        const level = target.classList.contains("floor-input") ? "floor" :
                      target.classList.contains("tr-input") || target.classList.contains("tr-select") ? "tr" :
                      target.classList.contains("rack-input") || target.classList.contains("rack-select") ? "rack" :
                      target.classList.contains("equipment-input") || target.classList.contains("equipment-select") ? "equipment" : "points";

        const floorId = target.dataset.floorId;
        const trId = target.dataset.trId;
        const rackId = target.dataset.rackId;
        const pointsId = target.dataset.pointsId;
        const field = target.dataset.field;
        let value = target.value;

        // Si es número, parsear
        if (target.type === "number") {
            value = parseInt(value, 10) || 0;
        }

        updateDataState(level, floorId, trId, rackId, pointsId, field, value);
    });

    // Delegación para cambios en select y checkboxes
    container.addEventListener("change", (event) => {
        const target = event.target;
        if (!target.dataset.field) return;

        const level = target.classList.contains("tr-select") ? "tr" :
                      target.classList.contains("rack-select") || target.classList.contains("rack-checkbox") ? "rack" :
                      target.classList.contains("equipment-select") || target.classList.contains("equipment-checkbox") ? "equipment" : "points";

        const floorId = target.dataset.floorId;
        const trId = target.dataset.trId;
        const rackId = target.dataset.rackId;
        const pointsId = target.dataset.pointsId;
        const field = target.dataset.field;
        let value = target.value;

        // Si es checkbox, leer checked
        if (target.type === "checkbox") {
            value = target.checked;
        }

        updateDataState(level, floorId, trId, rackId, pointsId, field, value);
    });

    // Listener para datos de sede general
    document.getElementById("building-name").addEventListener("input", (e) => {
        surveyData.buildingName = e.target.value.trim();
        saveSurveyToLocalStorage();
    });
    document.getElementById("building-address").addEventListener("input", (e) => {
        surveyData.buildingAddress = e.target.value.trim();
        saveSurveyToLocalStorage();
    });
    document.getElementById("building-use").addEventListener("change", (e) => {
        surveyData.buildingUse = e.target.value;
        saveSurveyToLocalStorage();
        runNormativeAnalysis();
    });

    document.getElementById("report-purpose").addEventListener("input", (e) => {
        surveyData.reportPurpose = e.target.value.trim();
        saveSurveyToLocalStorage();
    });
    document.getElementById("report-scope").addEventListener("input", (e) => {
        surveyData.reportScope = e.target.value.trim();
        saveSurveyToLocalStorage();
    });
    document.getElementById("report-background").addEventListener("input", (e) => {
        surveyData.reportBackground = e.target.value.trim();
        saveSurveyToLocalStorage();
    });
    document.getElementById("report-findings").addEventListener("input", (e) => {
        surveyData.reportFindings = e.target.value.trim();
        saveSurveyToLocalStorage();
    });
    document.getElementById("report-wifi").addEventListener("input", (e) => {
        surveyData.reportWifi = e.target.value.trim();
        saveSurveyToLocalStorage();
    });
    document.getElementById("report-security").addEventListener("input", (e) => {
        surveyData.reportSecurity = e.target.value.trim();
        saveSurveyToLocalStorage();
    });

    // Listener para botón añadir piso principal
    document.getElementById("btn-add-floor").addEventListener("click", addFloor);

    // Guardar JSON manual
    document.getElementById("btn-save-json").addEventListener("click", exportProjectJson);
    document.getElementById("btn-load-json").addEventListener("click", () => document.getElementById("survey-json-file").click());

    // Generar PDF
    document.getElementById("btn-generate-pdf").addEventListener("click", generateSurveyReport);
}

function updateDataState(level, floorId, trId, rackId, pointsId, field, value) {
    if (level === 'floor') {
        const floor = surveyData.floors.find(f => f.id === floorId);
        if (floor) floor[field] = value;
    } else if (level === 'tr') {
        const floor = surveyData.floors.find(f => f.id === floorId);
        if (floor) {
            const tr = floor.trs.find(t => t.id === trId);
            if (tr) tr[field] = value;
        }
    } else if (level === 'rack') {
        const floor = surveyData.floors.find(f => f.id === floorId);
        if (floor) {
            const tr = floor.trs.find(t => t.id === trId);
            if (tr) {
                const rack = tr.racks.find(r => r.id === rackId);
                if (rack) rack[field] = value;
            }
        }
    } else if (level === 'equipment') {
        const floor = surveyData.floors.find(f => f.id === floorId);
        if (floor) {
            const tr = floor.trs.find(t => t.id === trId);
            if (tr) {
                const rack = tr.racks.find(r => r.id === rackId);
                if (rack && rack.equipments) {
                    const eq = rack.equipments.find(e => e.id === pointsId);
                    if (eq) eq[field] = value;
                }
            }
        }
    } else if (level === 'points') {
        const floor = surveyData.floors.find(f => f.id === floorId);
        if (floor) {
            const tr = floor.trs.find(t => t.id === trId);
            if (tr) {
                const rack = tr.racks.find(r => r.id === rackId);
                if (rack) {
                    const point = rack.points.find(p => p.id === pointsId);
                    if (point) point[field] = value;
                }
            }
        }
    }

    saveSurveyToLocalStorage();
    runNormativeAnalysis();
}

// 9. MÉTRICAS Y ACTUALIZACIÓN EN TIEMPO REAL
function updateMetrics() {
    let trCount = 0;
    let rackCount = 0;
    let nodeCount = 0;

    surveyData.floors.forEach(floor => {
        trCount += floor.trs.length;
        floor.trs.forEach(tr => {
            rackCount += tr.racks.length;
            tr.racks.forEach(rack => {
                rack.points.forEach(point => {
                    nodeCount += parseInt(point.qty, 10) || 0;
                });
            });
        });
    });

    document.getElementById("metric-floors").textContent = surveyData.floors.length;
    document.getElementById("metric-trs").textContent = trCount;
    document.getElementById("metric-racks").textContent = rackCount;
    document.getElementById("metric-nodes").textContent = nodeCount;
}

// 10. MOTOR DE ANÁLISIS NORMATIVO TIA/ISO (REAL-TIME ENGINE)
function generateProjectSuggestions(data) {
    const mode = data.mode;
    if (mode !== 'brownfield') {
        return [];
    }

    let suggestions = [];

    // Gather all audit metrics from the data structure
    let hasCCA = false;
    let hasObsoleteCable = false;
    let hasUngroundedRack = false;
    let hasNoHvac = false;
    let hasFailedNext = false;
    let hasUnlabelled = false;
    let hasObsoleteActive = false; // Obsolete/degraded switches or routers
    let hasObsoletePatchPanel = false; // Obsolete/degraded patch panels or Cat 5e patch panels
    let hasPoeMismatch = false; // PoE++ points with no PoE++ switch in the rack

    data.floors.forEach(floor => {
        floor.trs.forEach(tr => {
            if (tr.hvac === 'none') {
                hasNoHvac = true;
            }
            tr.racks.forEach(rack => {
                if (!rack.grounding) {
                    hasUngroundedRack = true;
                }

                // Check for PoE++ switch in this rack
                let hasPoePlusPlusSwitch = false;
                if (rack.equipments) {
                    rack.equipments.forEach(eq => {
                        if (eq.type === 'switch' && eq.poeType === 'poe++' && eq.currentStatus === 'Bueno') {
                            hasPoePlusPlusSwitch = true;
                        }
                        if (eq.currentStatus === 'Degradado' || eq.currentStatus === 'Obsoleto') {
                            if (eq.type === 'router' || eq.type === 'switch') {
                                hasObsoleteActive = true;
                            }
                            if (eq.type === 'patch_panel') {
                                hasObsoletePatchPanel = true;
                            }
                        }
                        // If switch category or patch panel category is Cat 5e
                        if (eq.type === 'patch_panel' && eq.category === 'Cat 5e') {
                            hasObsoletePatchPanel = true;
                        }
                    });
                }

                rack.points.forEach(point => {
                    if (point.ccaSuspicion) {
                        hasCCA = true;
                    }
                    if (point.category.includes('Cat 5e') || point.currentStatus === 'Obsoleto') {
                        hasObsoleteCable = true;
                    }
                    if (point.labelingAudit === 'no') {
                        hasUnlabelled = true;
                    }
                    if (point.failedNEXT) {
                        hasFailedNext = true;
                    }
                    if (point.use === 'PoE++') {
                        // Check if there is a PoE++ switch in this rack
                        if (!hasPoePlusPlusSwitch) {
                            hasPoeMismatch = true;
                        }
                    }
                });
            });
        });
    });

    // 1. Cables CCA (Aluminio-Cobre)
    if (hasCCA) {
        suggestions.push({
            category: "Enlace e Integridad Física",
            title: "Reemplazo Urgente de Cableado CCA Falsificado",
            vuln: "Conductores CCA (Aluminio-Cobre) detectados. Presentan alta atenuación, fragilidad y riesgo grave de incendio al conducir energía PoE++.",
            solution: "Retirar los tramos CCA y reemplazar por cable Cat 6A U/UTP de Cobre Puro LSZH (baja emisión de humos y cero halógenos).",
            materials: [
                "Bobina de Cable UTP Cat 6A Cobre Puro 100% LSZH (Panduit o Nexans)",
                "Keystones Jacks RJ45 Cat 6A rápidos tipo Mini-Com"
            ],
            equipment: [
                "Patch Panels Modulares descargados de 24 o 48 puertos 1 RU"
            ]
        });
    }

    // 2. Cableado Cat 5e/Obsoleto/Degradado
    if (hasObsoleteCable) {
        suggestions.push({
            category: "Rendimiento y Ancho de Banda",
            title: "Migración de Cableado Obsoleto Cat 5e",
            vuln: "Cableado Cat 5e o enlaces degradados incapaces de soportar velocidades mayores a 1 Gbps a distancias normativas o con alta tasa de pérdida de paquetes.",
            solution: "Migrar el cableado horizontal a Cobre Puro Cat 6A y los troncales backbone entre TRs a Fibra Óptica OM4.",
            materials: [
                "Cable de Cobre Cat 6A LSZH y latiguillos (patch cords) certificados de 1 metro",
                "Módulos transceptores SFP+ 10G SR (Multimodo OM4)"
            ],
            equipment: [
                "Bandejas de Distribución de Fibra Óptica (LIU) para rack",
                "Switches de Acceso Administrables Gigabit con Uplinks 10G"
            ]
        });
    }

    // 3. Equipos Activos Degradados/Obsoletos
    if (hasObsoleteActive) {
        suggestions.push({
            category: "Core y Conmutación Activa",
            title: "Reemplazo de Hardware Activo Obsoleto o Degradado",
            vuln: "Routers o switches en estado obsoleto o degradado/falla que amenazan la disponibilidad del servicio y limitan el rendimiento de la red LAN.",
            solution: "Aprovisionar equipamiento activo administrable L2/L3 con fuentes redundantes y soporte de monitoreo SNMP/Cloud.",
            materials: [
                "Patch cords Cat 6A de cobre puro para interconexión",
                "Organizadores de cables horizontales de 1 RU con tapa frontal"
            ],
            equipment: [
                "Router/Firewall Empresarial con capacidad de VPN e inspección profunda (Cisco Meraki o Fortinet)",
                "Switches de Acceso L2/L3 Gigabit con uplinks SFP+ de 10 Gbps (Ubiquiti UniFi Pro o Cisco Catalyst 9300)"
            ]
        });
    }

    // 4. Patch Panels Degradados/Obsoletos
    if (hasObsoletePatchPanel) {
        suggestions.push({
            category: "Parcheo y Conectorización",
            title: "Renovación de Patch Panels Obsoletos o Degradados",
            vuln: "Paneles de parcheo degradados, con contactos sulfatados o de categoría inferior (Cat 5e) que degradan el rendimiento de los nuevos puntos.",
            solution: "Instalar patch panels modulares Cat 6A de alta densidad con blindaje o descargados para fácil mantenimiento.",
            materials: [
                "Keystones RJ45 Cat 6A certificados de cobre puro",
                "Patch cords Cat 6A certificados de fábrica"
            ],
            equipment: [
                "Patch Panels Modulares descargados de 24/48 puertos Cat 6A (Panduit/Siemon)"
            ]
        });
    }

    // 5. Incompatibilidad PoE++ (Alimentación)
    if (hasPoeMismatch) {
        suggestions.push({
            category: "Alimentación por Red (PoE)",
            title: "Provisión de Conmutación de Alta Potencia PoE++ (802.3bt)",
            vuln: "Se requieren puntos de red PoE++ (ej. para domos PTZ, pantallas inteligentes o APs Wi-Fi 6/7) pero el rack carece de un switch que soporte el estándar 802.3bt (hasta 90W).",
            solution: "Instalar switches de acceso con puertos PoE++ Gigabit dedicados para evitar el uso de inyectores individuales desordenados.",
            materials: [
                "Cables de parcheo de cobre Cat 6A calibre 24 AWG homologados para PoE++"
            ],
            equipment: [
                "Switch Administrable Gigabit con soporte PoE++ 802.3bt de alta potencia (Ubiquiti UniFi Enterprise o similar)"
            ]
        });
    }

    // 6. Rack sin Conexión a Tierra (ANSI/TIA-607-E)
    if (hasUngroundedRack) {
        suggestions.push({
            category: "Seguridad y Puesta a Tierra",
            title: "Aterrizaje del Sistema de Racks a TMGB/TGB",
            vuln: "Racks metálicos sin conexión física a tierra. Riesgo latente de descargas eléctricas para operarios y daños por electroestática en switches activos.",
            solution: "Instalar una barra de tierra en cada rack y conectarla mediante conductor de cobre de calibre grueso al sistema de puesta a tierra del edificio.",
            materials: [
                "Conductor de cobre puro trenzado calibre #6 AWG (verde)",
                "Terminales de compresión de doble orificio y tornillería de acero inoxidable",
                "Kit de puente de unión de puesta a tierra para puertas del gabinete"
            ],
            equipment: [
                "Barra de Conexión a Tierra para Rack (TGB) de cobre electrolítico de 19\""
            ]
        });
    }

    // 7. Falta de HVAC Activo
    if (hasNoHvac) {
        suggestions.push({
            category: "Climatización y Control Ambiental",
            title: "Climatización HVAC Dedicada para Cuarto de Equipos",
            vuln: "Ventilación pasiva o sin climatización en TR. Las temperaturas superiores a 27°C acortan drásticamente la vida útil de switches, UPS y ópticas.",
            solution: "Aprovisionar aire acondicionado tipo split redundante con ciclo continuo 24/7 y control inteligente de temperatura.",
            materials: [
                "Sensores de temperatura y humedad ambiental TCP/IP con alertas SNMP"
            ],
            equipment: [
                "Unidad de Aire Acondicionado Inverter industrial de 12,000 o 24,000 BTU de auto-arranque"
            ]
        });
    }

    // 8. Fallas de NEXT/Return Loss (ANSI/TIA-568.2-D)
    if (hasFailedNext) {
        suggestions.push({
            category: "Certificación y Calidad de Enlace",
            title: "Remediación de Fallas Físicas NEXT / Return Loss",
            vuln: "Puntos de red con reportes de certificación fallida debido a acoplamiento electromagnético (NEXT) o pérdidas de retorno (Return Loss).",
            solution: "Terminar nuevamente los keystones cuidando que el destrenzado de pares sea menor a 13 mm, y certificar con equipo calibrado.",
            materials: [
                "Keystones Cat 6A rápidos certificados",
                "Patch cords certificados Cat 6A con capuchón moldeado"
            ],
            equipment: [
                "Servicio de re-certificación de red con equipo Certificador de Redes LAN (ej. Fluke Networks DSX-8000)"
            ]
        });
    }

    // 9. Falta de Rotulado Normativo (ANSI/TIA-606-D)
    if (hasUnlabelled) {
        suggestions.push({
            category: "Administración y Etiquetado",
            title: "Esquema Estandarizado de Rotulado ANSI/TIA-606-D",
            vuln: "Enlaces sin rotular o con nombres arbitrarios manuscritos. Incrementa el tiempo de diagnóstico y resolución de fallas en más de un 70%.",
            solution: "Implementar etiquetado alfanumérico uniforme en placas de pared, cables y patch panels mediante etiquetas industriales auto-laminables.",
            materials: [
                "Cinta de etiquetas auto-laminables de poliéster para cables",
                "Etiquetas continuas de alta adherencia para paneles de parcheo y rosetas"
            ],
            equipment: [
                "Rotuladora por transferencia térmica industrial (Brother P-Touch Edge o similar)"
            ]
        });
    }

    return suggestions;
}

function runNormativeAnalysis() {
    const analysisContainer = document.getElementById("analysis-results-container");
    analysisContainer.innerHTML = ""; // Limpiar

    const mode = surveyData.mode;
    let alerts = [];

    // Calcular datos consolidados
    let trCount = 0;
    let rackCount = 0;
    let nodeCount = 0;
    let groundingAlerts = [];
    let hvacAlerts = [];
    let ccaAlerts = [];
    let obsoleteAlerts = [];
    let labelingAlerts = [];
    let nextAlerts = [];
    let trConduitCalcs = {}; // Estructura para canalizaciones por TR

    surveyData.floors.forEach(floor => {
        floor.trs.forEach(tr => {
            trCount++;
            
            // Analizar HVAC del TR
            if (tr.hvac === 'none') {
                hvacAlerts.push({ floor: floor.name, tr: tr.name });
            }

            if (!trConduitCalcs[tr.id]) {
                trConduitCalcs[tr.id] = { name: tr.name, floor: floor.name, copperNodes: 0 };
            }

            tr.racks.forEach(rack => {
                rackCount++;
                
                // Analizar Puesta a Tierra (ANSI/TIA-607-E)
                if (!rack.grounding) {
                    groundingAlerts.push({ floor: floor.name, tr: tr.name, rack: rack.name });
                }

                // 10.2.1 AUDITORÍA DE CAPACIDAD VERTICAL Y EQUIPAMIENTO DE RACKS
                const totalRU = parseInt(rack.units, 10) || 42;
                let occupiedRU = 0;
                let hasPoePlusPlusSwitch = false;
                let hasPatchPanel = false;
                let maxPatchPanelCategoryVal = 0; // 0 = ninguno, 1 = Cat 5e, 2 = Cat 6, 3 = Cat 6A
                
                const catVals = {
                    'Cat 5e': 1,
                    'Cat 6': 2,
                    'Cat 6A': 3
                };

                if (rack.equipments) {
                    rack.equipments.forEach(eq => {
                        occupiedRU += parseInt(eq.ru, 10) || 0;
                        if (eq.type === 'switch' && eq.poeType === 'poe++' && eq.currentStatus === 'Bueno') {
                            hasPoePlusPlusSwitch = true;
                        }
                        if (eq.type === 'patch_panel') {
                            hasPatchPanel = true;
                            const val = catVals[eq.category] || 0;
                            if (val > maxPatchPanelCategoryVal) {
                                maxPatchPanelCategoryVal = val;
                            }
                        }
                    });
                }

                // Alerta por sobrecarga vertical de rack
                if (occupiedRU > totalRU) {
                    alerts.push({
                        type: 'critical',
                        std: 'EIA/ECA-310-E',
                        title: `¡Sobrecarga de Rack! ${rack.name}`,
                        desc: `El bastidor ${rack.name} en ${floor.name} -> ${tr.name} excede su capacidad en ${occupiedRU - totalRU} RU (${occupiedRU}/${totalRU} RU instaladas). Aumente el tamaño del bastidor o redistribuya hardware.`,
                        priority: 'Crítica'
                    });
                }

                rack.points.forEach(point => {
                    const qty = parseInt(point.qty, 10) || 0;
                    nodeCount += qty;

                    // Si es cobre Cat, sumamos para canalización del TR
                    if (point.category.includes("Cat")) {
                        trConduitCalcs[tr.id].copperNodes += qty;
                    }

                    // Categoría del grupo de puntos
                    let pointCatVal = 0;
                    if (point.category.includes('Cat 6A')) pointCatVal = 3;
                    else if (point.category.includes('Cat 6')) pointCatVal = 2;
                    else if (point.category.includes('Cat 5e')) pointCatVal = 1;

                    // Validar falta de patch panel para puntos de cobre terminados en rack
                    if (pointCatVal > 0 && !hasPatchPanel) {
                        alerts.push({
                            type: 'warning',
                            std: 'ANSI/TIA-568.2-D',
                            title: `Falta Patch Panel en ${rack.name}`,
                            desc: `El ${rack.name} de ${floor.name} -> ${tr.name} tiene ${point.qty} puntos de cobre (${point.category}) terminados, pero no se ha registrado ningún Patch Panel para el ordenamiento de los enlaces horizontales.`,
                            priority: 'Alta'
                        });
                    }

                    // Validar inconsistencia de categoría entre puntos y patch panel
                    if (pointCatVal > 0 && hasPatchPanel && maxPatchPanelCategoryVal < pointCatVal) {
                        const panelCatStr = maxPatchPanelCategoryVal === 1 ? 'Cat 5e' : maxPatchPanelCategoryVal === 2 ? 'Cat 6' : 'Desconocido';
                        alerts.push({
                            type: 'critical',
                            std: 'ANSI/TIA-568.2-D',
                            title: `Inconsistencia de Categoría en ${rack.name}`,
                            desc: `Puntos de categoría superior (${point.category}) conectados a patch panels de categoría inferior (${panelCatStr}) en ${floor.name} -> ${tr.name} -> ${rack.name}. Esto degrada el canal de transmisión.`,
                            priority: 'Crítica'
                        });
                    }

                    // Validar PoE++ vs switch specs
                    if (point.use === 'PoE++' && !hasPoePlusPlusSwitch) {
                        alerts.push({
                            type: 'critical',
                            std: 'IEEE 802.3bt',
                            title: `Incompatibilidad de Alimentación PoE++`,
                            desc: `Se requieren puntos configurados para PoE++ (802.3bt) en ${floor.name} -> ${tr.name} -> ${rack.name}, pero no hay switches registrados con soporte PoE++ (hasta 90W) operativo en el rack.`,
                            priority: 'Alta'
                        });
                    }

                    // Banderas Brownfield
                    if (mode === 'brownfield') {
                        if (point.ccaSuspicion) {
                            ccaAlerts.push({ floor: floor.name, tr: tr.name, rack: rack.name, desc: point.category });
                        }
                        if (point.category.includes("Cat 5e") || point.currentStatus === 'Obsoleto') {
                            obsoleteAlerts.push({ floor: floor.name, tr: tr.name, rack: rack.name, desc: point.category });
                        }
                        if (point.labelingAudit === 'no') {
                            labelingAlerts.push({ floor: floor.name, tr: tr.name, rack: rack.name });
                        }
                        if (point.failedNEXT) {
                            nextAlerts.push({ floor: floor.name, tr: tr.name, rack: rack.name });
                        }
                    }
                });
            });
        });
    });

    // 10.1 CÁLCULO DE CANALIZACIONES (GREENFIELD)
    if (mode === 'greenfield') {
        Object.values(trConduitCalcs).forEach(calc => {
            if (calc.copperNodes > 0) {
                const diameter = calculateConduitDiameter(calc.copperNodes);
                alerts.push({
                    type: 'success',
                    std: 'ANSI/TIA-569-E',
                    title: `Canalización estimada para ${calc.name}`,
                    desc: `Para ${calc.copperNodes} cables de cobre Cat 6A, se proyecta un diámetro mínimo comercial de **${diameter}** para no superar el 40% de llenado normativo en el tramo de entrada del TR.`,
                    priority: 'Alta'
                });
            }
        });

        // Mapear el 20% de crecimiento
        if (nodeCount > 0) {
            const growthNodes = Math.ceil(nodeCount * 1.20);
            alerts.push({
                type: 'info',
                std: 'ANSI/TIA-568.0-E',
                title: 'Holgura de Crecimiento del 20%',
                desc: `Para las ${nodeCount} tomas capturadas, el estándar exige sobredimensionar tomas y patch panels en un 20%. Se recomienda aprovisionar al menos **${growthNodes}** tomas físicas en total.`,
                priority: 'Recomendada'
            });
        }
    }

    // 10.2 EXPOSICIÓN DE VULNERABILIDADES (BROWNFIELD)
    if (mode === 'brownfield') {
        ccaAlerts.forEach(cca => {
            alerts.push({
                type: 'critical',
                std: 'ANSI/TIA-568.2-D',
                title: `¡PELIGRO! Cable CCA detectado`,
                desc: `Sospecha de conductor CCA (Aluminio-Cobre) en ${cca.floor} -> ${cca.tr} -> ${cca.rack}. Prohibido internacionalmente: alto riesgo de sobrecalentamiento/incendio bajo PoE++ e inestabilidad de enlace.`,
                priority: 'Crítica'
            });
        });

        obsoleteAlerts.forEach(obs => {
            alerts.push({
                type: 'warning',
                std: 'ANSI/TIA-568.2-E',
                title: 'Cableado Obsoleto / Degradado',
                desc: `El cableado ${obs.desc} en ${obs.floor} -> ${obs.tr} -> ${obs.rack} es obsoleto (Cat 5e desaconsejada para nuevas tecnologías) o presenta fallos de desgaste físico. Se recomienda migrar a Cat 6A.`,
                priority: 'Media'
            });
        });

        labelingAlerts.forEach(lab => {
            alerts.push({
                type: 'warning',
                std: 'ANSI/TIA-606-D',
                title: 'Incumplimiento de Esquema de Etiquetado',
                desc: `El grupo de nodos en ${lab.floor} -> ${lab.tr} -> ${lab.rack} carece de rotulado normativo alfanumérico estandarizado, impidiendo una administración de red trazable.`,
                priority: 'Media'
            });
        });

        nextAlerts.forEach(nxt => {
            alerts.push({
                type: 'warning',
                std: 'ANSI/TIA-568.2-D',
                title: 'Fallo de Diafonía NEXT / Return Loss',
                desc: `Se reportan tomas con fallos NEXT/RL históricos en ${nxt.floor} -> ${nxt.tr} -> ${nxt.rack}. Sugiere mala destrenzación de pares (supera los 13 mm) o curvaturas excesivas en la canaleta.`,
                priority: 'Alta'
            });
        });
    }

    // 10.3 VALIDACIONES COMUNES (TIA-607-E Y TIA-569-E)
    groundingAlerts.forEach(ground => {
        alerts.push({
            type: 'warning',
            std: 'ANSI/TIA-607-E',
            title: 'Falta Conexión de Puesta a Tierra',
            desc: `El ${ground.rack} en el cuarto ${ground.tr} (${ground.floor}) no está aterrizado. Es obligatorio conectar el rack metálico a la barra TMGB para proteger a operadores y switches contra descargas.`,
            priority: 'Alta'
        });
    });

    hvacAlerts.forEach(hvac => {
        alerts.push({
            type: 'warning',
            std: 'ASHRAE Clase A1',
            title: 'Falta Climatización HVAC Activa',
            desc: `El cuarto ${hvac.tr} (${hvac.floor}) no dispone de climatización. La falta de control ambiental puede provocar fallos por choque térmico en switches de borde y APs PoE.`,
            priority: 'Alta'
        });
    });

    // Inyectar en el DOM de auditoría
    if (alerts.length === 0) {
        analysisContainer.innerHTML = `
            <div class="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-3.5">
                <span class="text-2xl">✓</span>
                <div>
                    <p class="font-black text-sm">Estructura Conforme</p>
                    <p class="mt-0.5 font-normal">No se han detectado brechas de diseño ni incumplimientos normativos primarios.</p>
                </div>
            </div>`;
    } else {
        alerts.forEach(alert => {
            const card = document.createElement("div");
            
            let borderClass = "border-blue-300 bg-white";
            let titleColor = "text-blue-900";
            let badgeColor = "bg-blue-100 text-blue-800 border-blue-200";

            if (alert.type === 'critical') {
                borderClass = "border-red-300 bg-red-50/20";
                titleColor = "text-red-950";
                badgeColor = "bg-red-100 text-red-800 border-red-200";
            } else if (alert.type === 'warning') {
                borderClass = "border-amber-300 bg-amber-50/20";
                titleColor = "text-amber-950";
                badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
            } else if (alert.type === 'success') {
                borderClass = "border-emerald-300 bg-emerald-50/20";
                titleColor = "text-emerald-950";
                badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
            }

            card.className = `normative-bulletin border-l-4 ${borderClass} p-3.5 text-xs text-slate-600 leading-relaxed shadow-sm`;
            card.innerHTML = `
                <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2">
                    <span class="normative-std rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${badgeColor}">${alert.std}</span>
                    <span class="normative-priority text-[9px] font-bold uppercase text-slate-400">Prioridad: ${alert.priority}</span>
                </div>
                <strong class="normative-title block ${titleColor} font-black text-sm leading-tight">${alert.title}</strong>
                <p class="normative-desc mt-1">${alert.desc}</p>
            `;
            analysisContainer.appendChild(card);
        });
    }

    // 10.5 SUGERENCIAS DE PROYECTO (BROWNFIELD)
    const suggestionsPanel = document.getElementById("suggestions-panel");
    const suggestionsContainer = document.getElementById("suggestions-container");
    
    if (mode === 'brownfield') {
        const suggestions = generateProjectSuggestions(surveyData);
        if (suggestions.length > 0) {
            suggestionsPanel.classList.remove("hidden");
            suggestionsContainer.innerHTML = "";
            suggestions.forEach(sug => {
                const card = document.createElement("div");
                card.className = "p-4 rounded-xl border border-emerald-200 bg-white dark:bg-slate-900/60 dark:border-slate-800/80 text-xs shadow-xs leading-relaxed mb-3";
                
                let materialsListHtml = sug.materials.map(m => `<li class="flex items-start gap-1.5 mt-1 font-normal"><span class="text-emerald-500">▪</span> ${m}</li>`).join("");
                let equipmentListHtml = sug.equipment.map(e => `<li class="flex items-start gap-1.5 mt-1 font-normal"><span class="text-teal-600">▪</span> ${e}</li>`).join("");

                card.innerHTML = `
                    <div class="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-950/40 pb-1.5 mb-2.5">
                        <span class="rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[9px] font-black text-emerald-800 dark:text-emerald-300 uppercase">${sug.category}</span>
                    </div>
                    <strong class="block text-emerald-950 dark:text-emerald-200 font-black text-sm leading-tight">${sug.title}</strong>
                    <p class="mt-1.5 text-slate-550 dark:text-slate-400 font-bold">${sug.vuln}</p>
                    <p class="mt-1 text-slate-650 dark:text-slate-350"><strong class="font-bold text-slate-850 dark:text-slate-200">Acción sugerida:</strong> ${sug.solution}</p>
                    
                    ${sug.materials.length > 0 ? `
                    <div class="mt-2.5">
                        <span class="block font-black text-slate-700 dark:text-slate-300 uppercase text-[9px] tracking-wider font-extrabold">Materiales de Canal/Conexión:</span>
                        <ul class="mt-0.5 text-slate-600 dark:text-slate-400 pl-1 list-none">
                            ${materialsListHtml}
                        </ul>
                    </div>` : ''}

                    ${sug.equipment.length > 0 ? `
                    <div class="mt-2.5">
                        <span class="block font-black text-slate-700 dark:text-slate-300 uppercase text-[9px] tracking-wider font-extrabold">Equipos y Herramientas:</span>
                        <ul class="mt-0.5 text-slate-600 dark:text-slate-400 pl-1 list-none">
                            ${equipmentListHtml}
                        </ul>
                    </div>` : ''}
                `;
                suggestionsContainer.appendChild(card);
            });
        } else {
            suggestionsPanel.classList.add("hidden");
        }
    } else {
        suggestionsPanel.classList.add("hidden");
    }
}

// 10.4 ECUACIONES DE INGENIERÍA DE CANALIZACIÓN
function calculateConduitDiameter(nodeCount) {
    // Estimación basada en Cat 6A U/UTP de 7.2 mm respetando el límite estricto de llenado del 40% (ANSI/TIA-569-E)
    if (nodeCount <= 3) return '3/4" (pulgada)';
    if (nodeCount <= 5) return '1" (pulgada)';
    if (nodeCount <= 9) return '1 1/4" (pulgadas)';
    if (nodeCount <= 12) return '1 1/2" (pulgadas)';
    if (nodeCount <= 21) return '2" (pulgadas)';
    if (nodeCount <= 30) return '2 1/2" (pulgadas)';
    if (nodeCount <= 46) return '3" (pulgadas)';
    if (nodeCount <= 80) return '4" (pulgadas)';
    return 'Bandeja Escalerilla / Rejilla recomendada (Ducto de 4" saturado)';
}

// 11. PERSISTENCIA EN LOCALSTORAGE (AUTOSAVE)
function saveSurveyToLocalStorage() {
    localStorage.setItem(autosaveKey, JSON.stringify(surveyData));
    const statusText = document.getElementById("autosave-status");
    if (statusText) {
        statusText.textContent = "Guardado hace un momento ✓";
        statusText.className = "font-semibold text-emerald-600";
    }
}

function restoreLastSave() {
    const raw = localStorage.getItem(autosaveKey);
    if (!raw) {
        showToast("⚠️ Recuperar", "No hay ningún avance guardado localmente.", "error");
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        if (parsed.mode) {
            surveyData = parsed;
            
            // Restaurar inputs generales
            document.getElementById("building-name").value = surveyData.buildingName || "";
            document.getElementById("building-address").value = surveyData.buildingAddress || "";
            document.getElementById("building-use").value = surveyData.buildingUse || "";
            document.getElementById("report-purpose").value = surveyData.reportPurpose || "";
            document.getElementById("report-scope").value = surveyData.reportScope || "";
            document.getElementById("report-background").value = surveyData.reportBackground || "";
            document.getElementById("report-findings").value = surveyData.reportFindings || "";
            document.getElementById("report-wifi").value = surveyData.reportWifi || "";
            document.getElementById("report-security").value = surveyData.reportSecurity || "";

            initSurvey(surveyData.mode);
            showToast("📂 Recuperado", "Avance de levantamiento restaurado correctamente.", "success");
        }
    } catch {
        showToast("⚠️ Error", "No se pudo descifrar el avance guardado.", "error");
    }
}

// 12. PORTABILIDAD DE PROYECTO (IMPORT / EXPORT JSON)
function exportProjectJson() {
    if (surveyData.floors.length === 0) {
        showToast("⚠️ Exportar", "Agregue al menos un piso o nodo antes de exportar.", "error");
        return;
    }

    const dataStr = JSON.stringify(surveyData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    const name = surveyData.buildingName ? surveyData.buildingName.replace(/\s+/g, '_') : "Proyecto";
    a.href = url;
    a.download = `CertNetPro_Survey_${name}_${surveyData.mode}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast("💾 Descargado", "Archivo de levantamiento JSON guardado exitosamente.", "success");
}

function importProjectJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(String(reader.result || "{}"));
            if (data.mode && Array.isArray(data.floors)) {
                surveyData = data;
                
                // Restaurar inputs generales en la UI
                document.getElementById("building-name").value = surveyData.buildingName || "";
                document.getElementById("building-address").value = surveyData.buildingAddress || "";
                document.getElementById("building-use").value = surveyData.buildingUse || "";
                document.getElementById("report-purpose").value = surveyData.reportPurpose || "";
                document.getElementById("report-scope").value = surveyData.reportScope || "";
                document.getElementById("report-background").value = surveyData.reportBackground || "";
                document.getElementById("report-findings").value = surveyData.reportFindings || "";
                document.getElementById("report-wifi").value = surveyData.reportWifi || "";
                document.getElementById("report-security").value = surveyData.reportSecurity || "";

                initSurvey(surveyData.mode);
                saveSurveyToLocalStorage();
                showToast("📂 Cargado", "Proyecto importado y renderizado con éxito.", "success");
            } else {
                throw new Error("Esquema inválido");
            }
        } catch {
            showToast("⚠️ Error de Carga", "El archivo cargado no es compatible con el Site Survey de CertNet Pro.", "error");
        } finally {
            event.target.value = "";
        }
    };
    reader.readAsText(file, "utf-8");
}

// 13. GENERACIÓN DE REPORTES PDF PROFESIONALES (html2pdf.js)
function generateSurveyReport() {
    // Validar requerimientos mínimos
    if (!surveyData.buildingName || !surveyData.buildingAddress) {
        alert("Por favor complete los campos obligatorios del Nivel 1 (Nombre de la Sede y Dirección) antes de emitir el reporte PDF.");
        document.getElementById("building-name").focus();
        return;
    }

    if (surveyData.floors.length === 0) {
        alert("Agregue al menos un piso e infraestructura LAN antes de generar el reporte PDF.");
        return;
    }

    showToast("⚙️ Procesando", "Compilando reporte técnico ejecutivo...", "info");

    // 13.1 Mapear datos estáticos al reporte PDF
    document.getElementById("pdf-building-name").textContent = surveyData.buildingName;
    document.getElementById("pdf-building-address").textContent = surveyData.buildingAddress;
    
    const useTranslations = {
        commercial: "Comercial / Oficinas",
        industrial: "Industrial / Manufactura",
        datacenter: "Centro de Datos",
        educational: "Educativo / Campus",
        healthcare: "Salud / Hospitalario",
        residential: "Residencial / Mixto"
    };
    document.getElementById("pdf-building-use").textContent = useTranslations[surveyData.buildingUse] || "No Definido";
    document.getElementById("pdf-survey-mode").textContent = surveyData.mode === 'greenfield' ? 'PROYECTO DESDE CERO (GREENFIELD)' : 'MEJORA O MODIFICACIÓN (BROWNFIELD)';
    document.getElementById("pdf-report-date").textContent = "Fecha del Levantamiento: " + new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Mapear campos ejecutivos
    document.getElementById("pdf-s1-purpose").textContent = surveyData.reportPurpose || "No se ha especificado el propósito de este levantamiento.";
    document.getElementById("pdf-s1-scope").textContent = surveyData.reportScope || "No se ha delimitado el alcance para este levantamiento.";
    document.getElementById("pdf-s2-background").textContent = surveyData.reportBackground || "Sin antecedentes registrados.";
    document.getElementById("pdf-s1-findings").textContent = surveyData.reportFindings || "No se han documentado hallazgos manuales.";
    document.getElementById("pdf-s6-wifi").textContent = surveyData.reportWifi || "Nota: No se capturaron métricas específicas de espectro de radiofrecuencia (mapas de calor) ni distribución detallada de Access Points durante este recorrido. Se recomienda una auditoría Wi-Fi separada.";
    document.getElementById("pdf-s7-security").textContent = surveyData.reportSecurity || "Nota: En cuanto a la seguridad física, las vulnerabilidades detectadas en los cuartos de telecomunicaciones (como falta de control de acceso) se documentan en la Sección 8.";

    // Copiar métricas generales
    let trCount = 0;
    let rackCount = 0;
    let nodeCount = 0;

    surveyData.floors.forEach(floor => {
        trCount += floor.trs.length;
        floor.trs.forEach(tr => {
            rackCount += tr.racks.length;
            tr.racks.forEach(rack => {
                rack.points.forEach(point => {
                    nodeCount += parseInt(point.qty, 10) || 0;
                });
            });
        });
    });

    document.getElementById("pdf-count-floors").textContent = surveyData.floors.length;
    document.getElementById("pdf-count-trs").textContent = trCount;
    document.getElementById("pdf-count-racks").textContent = rackCount;
    document.getElementById("pdf-count-nodes").textContent = nodeCount;

    // 13.2 Rellenar tabla aplanada para PDF
    const tbody = document.getElementById("pdf-table-body");
    tbody.innerHTML = ""; // Limpiar

    const getRackEquipmentsHtml = (rack) => {
        if (!rack.equipments || rack.equipments.length === 0) return "";
        
        const listItems = rack.equipments.map(eq => {
            let details = "";
            if (eq.type === 'switch') {
                details = `, ${eq.ports}p, PoE: ${eq.poeType.toUpperCase()}`;
            } else if (eq.type === 'router') {
                details = `, ${eq.ports}p`;
            } else if (eq.type === 'patch_panel') {
                details = `, ${eq.ports}p, ${eq.category}${eq.shielded ? ' (FTP)' : ''}`;
            }
            
            let statusBadge = "";
            if (eq.currentStatus === 'Degradado') {
                statusBadge = ` <span style="color: #d97706; font-weight: bold;">[DEGR]</span>`;
            } else if (eq.currentStatus === 'Obsoleto') {
                statusBadge = ` <span style="color: #dc2626; font-weight: bold;">[OBS]</span>`;
            } else {
                statusBadge = ` <span style="color: #059669; font-weight: bold;">[OK]</span>`;
            }

            const typeStr = eq.type === 'router' ? 'Router' : eq.type === 'switch' ? 'Switch' : 'Patch Panel';
            return `<li style="margin-top: 2px;">• <strong>${typeStr}</strong>: ${escapeHtml(eq.brand)} ${escapeHtml(eq.model)} (${eq.ru}U)${details}${statusBadge}</li>`;
        }).join("");

        return `
            <div style="margin-top: 6px; text-align: left; font-size: 9px; line-height: 1.3;">
                <ul style="list-style-type: none; padding-left: 0; margin: 2px 0 0 0; color: #475569;">
                    ${listItems}
                </ul>
            </div>
        `;
    };

    // Estilos inline de celdas para PDF (independientes de Tailwind/darkmode)
    const TD  = `style="padding:8px 10px;vertical-align:top;border-bottom:1px solid #e2e8f0;font-size:9px;color:#334155;"`;
    const TDB = `style="padding:8px 10px;vertical-align:top;border-bottom:1px solid #e2e8f0;font-size:9px;font-weight:800;color:#0f172a;"`;
    const TDS = `style="padding:8px 10px;vertical-align:top;border-bottom:1px solid #e2e8f0;font-size:9px;color:#94a3b8;" colspan="4"`;
    const TDS3= `style="padding:8px 10px;vertical-align:top;border-bottom:1px solid #e2e8f0;font-size:9px;color:#94a3b8;" colspan="3"`;
    const SUB = `style="display:block;font-size:8px;color:#94a3b8;font-weight:400;margin-top:2px;"`;
    const TR_EVEN = `style="background:#f8fafc;"`;
    const TR_ODD  = `style="background:#ffffff;"`;
    let rowIdx = 0;

    surveyData.floors.forEach(floor => {
        if (floor.trs.length === 0) {
            tbody.innerHTML += `
                <tr ${rowIdx++ % 2 === 0 ? TR_EVEN : TR_ODD}>
                    <td ${TDB}>${escapeHtml(floor.name)}</td>
                    <td ${TDS}>Sin infraestructura de telecomunicaciones capturada.</td>
                </tr>`;
        }

        floor.trs.forEach(tr => {
            const hvacTexts = {
                dedicated: "Aire Dedicado HVAC",
                shared: "Aire Compartido",
                none: "Sin Climatización"
            };

            if (tr.racks.length === 0) {
                tbody.innerHTML += `
                    <tr ${rowIdx++ % 2 === 0 ? TR_EVEN : TR_ODD}>
                        <td ${TDB}>${escapeHtml(floor.name)}</td>
                        <td ${TD}><strong>${escapeHtml(tr.name)}</strong><span ${SUB}>${hvacTexts[tr.hvac]}</span></td>
                        <td ${TDS3}>Sin racks agregados a este cuarto.</td>
                    </tr>`;
            }

            tr.racks.forEach(rack => {
                const eqHtml = getRackEquipmentsHtml(rack);
                if (rack.points.length === 0) {
                    tbody.innerHTML += `
                        <tr ${rowIdx++ % 2 === 0 ? TR_EVEN : TR_ODD}>
                            <td ${TDB}>${escapeHtml(floor.name)}</td>
                            <td ${TD}><strong>${escapeHtml(tr.name)}</strong><span ${SUB}>${hvacTexts[tr.hvac]}</span></td>
                            <td ${TD}>
                                <strong>${escapeHtml(rack.name)}</strong>
                                <span ${SUB}>${rack.units} RU | ${rack.grounding ? '✓ Aterrizado' : '⚠️ Sin Aterrizar'}</span>
                                ${eqHtml}
                            </td>
                            <td ${TD} colspan="2" style="color:#94a3b8;font-size:9px;padding:8px 10px;vertical-align:top;border-bottom:1px solid #e2e8f0;">Sin puntos de red.</td>
                        </tr>`;
                } else {
                    rack.points.forEach((point, pIdx) => {
                        let modeDesc = "";
                        if (surveyData.mode === 'greenfield') {
                            modeDesc = `<span style="color:#475569;">Propuesto Backbone:</span> <strong style="color:#2563eb;">${point.proposedBackbone}</strong>`;
                        } else {
                            const ccaColor = point.ccaSuspicion ? '#dc2626' : '#059669';
                            const nextColor = point.failedNEXT ? '#dc2626' : '#059669';
                            modeDesc = `<span style="display:block;color:#475569;">Enlace: <strong>${point.currentStatus}</strong></span>
                                        <span style="display:block;color:${ccaColor};font-weight:700;">CCA: ${point.ccaSuspicion ? 'SÍ ⚠️' : 'NO ✓'}</span>
                                        <span style="display:block;color:${nextColor};font-weight:700;">NEXT: ${point.failedNEXT ? 'FALLO ⚠️' : 'OK ✓'}</span>`;
                        }

                        const rackCellHtml = `
                            <strong>${escapeHtml(rack.name)}</strong>
                            <span ${SUB}>${rack.units} RU | ${rack.grounding ? '✓ Aterrizado' : '⚠️ Sin Aterrizar'}</span>
                            ${pIdx === 0 ? eqHtml : ""}
                        `;

                        tbody.innerHTML += `
                            <tr ${rowIdx++ % 2 === 0 ? TR_EVEN : TR_ODD}>
                                <td ${TDB}>${escapeHtml(floor.name)}</td>
                                <td ${TD}><strong>${escapeHtml(tr.name)}</strong><span ${SUB}>${hvacTexts[tr.hvac]}</span></td>
                                <td ${TD}>${rackCellHtml}</td>
                                <td ${TD}>
                                    <strong>${point.qty} nodos</strong> — ${point.category}
                                    <span ${SUB}>Uso: ${point.use}</span>
                                </td>
                                <td style="padding:8px 10px;vertical-align:top;border-bottom:1px solid #e2e8f0;font-size:8.5px;color:#475569;text-align:right;">
                                    ${modeDesc}
                                </td>
                            </tr>`;
                    });
                }
            });
        });
    });

    // 13.3 Copiar las alertas normativas al reporte PDF con estilos inline (sin dependencia de dark-mode)
    const pdfAnalysisContainer = document.getElementById("pdf-analysis-results");
    pdfAnalysisContainer.innerHTML = "";

    const screenBulletins = document.querySelectorAll("#analysis-results-container .normative-bulletin");
    if (screenBulletins.length === 0) {
        pdfAnalysisContainer.innerHTML = `
            <div style="border:1px solid #a7f3d0;background:#f0fdf4;color:#065f46;padding:12px 16px;border-radius:8px;font-weight:700;font-size:11px;">
                ✅ Estructura de Red Conforme — No se detectaron brechas normativas en este levantamiento.
            </div>`;
    } else {
        screenBulletins.forEach(bull => {
            // Extraer datos del boletín del DOM en vez de clonar con clases de dark-mode
            const stdBadge  = bull.querySelector('.normative-std')?.textContent?.trim() || '';
            const priority  = bull.querySelector('.normative-priority')?.textContent?.trim() || '';
            const title     = bull.querySelector('.normative-title')?.textContent?.trim() || '';
            const desc      = bull.querySelector('.normative-desc')?.textContent?.trim() || '';

            let alertClass = 'media';
            if (priority.toLowerCase().includes('alta') || priority.toLowerCase().includes('crítica')) {
                alertClass = 'alta';
            }

            const card = document.createElement('div');
            card.className = `alert-box ${alertClass}`;
            card.innerHTML = `
                <span class="priority-tag ${alertClass}">Prioridad: ${escapeHtml(priority)}</span>
                <strong>${escapeHtml(stdBadge)} — ${escapeHtml(title)}</strong>
                <p style="margin-top: 8px; margin-bottom: 0; font-size: 13px;">${escapeHtml(desc)}</p>
            `;
            pdfAnalysisContainer.appendChild(card);
        });
    }

    // 13.4 Copiar las sugerencias de proyecto al reporte PDF (Brownfield)
    const pdfSuggestionsBlock = document.getElementById("pdf-suggestions-block");
    const pdfSuggestionsResults = document.getElementById("pdf-suggestions-results");
    
    if (pdfSuggestionsResults) {
        pdfSuggestionsResults.innerHTML = "";
        if (surveyData.mode === 'brownfield') {
            const suggestions = generateProjectSuggestions(surveyData);
            if (suggestions.length > 0) {
                if (pdfSuggestionsBlock) pdfSuggestionsBlock.style.display = "block";
                suggestions.forEach(sug => {
                    const card = document.createElement("div");
                    card.innerHTML = `
                        <h3 style="margin-top:10px; font-size: 15px;">${escapeHtml(sug.category)}: ${escapeHtml(sug.title)}</h3>
                        <p style="margin-top: 4px; font-size: 13px;"><strong>Situación Hallada:</strong> ${escapeHtml(sug.vuln)}</p>
                        <p style="margin-top: 4px; font-size: 13px;"><strong>Acción Sugerida:</strong> ${escapeHtml(sug.solution)}</p>
                        <ul style="font-size: 13px;">
                            ${sug.materials.length > 0 ? `<li><strong>Materiales:</strong> ${escapeHtml(sug.materials.join(', '))}</li>` : ''}
                            ${sug.equipment.length > 0 ? `<li><strong>Equipos sugeridos:</strong> ${escapeHtml(sug.equipment.join(', '))}</li>` : ''}
                        </ul>
                    `;
                    pdfSuggestionsResults.appendChild(card);
                });
            } else {
                pdfSuggestionsResults.innerHTML = `<p style="font-size:10px;color:#64748b;font-style:italic;">No se han generado sugerencias automáticas para esta infraestructura.</p>`;
            }
        } else {
            pdfSuggestionsResults.innerHTML = `<p style="font-size:10px;color:#64748b;font-style:italic;">El análisis de sugerencias de proyecto aplica principalmente a intervenciones Brownfield. Para este proyecto Greenfield, remitirse al diseño maestro.</p>`;
        }
    }

    // 13.5 Copiar el Inventario de Equipamientos al reporte PDF
    const pdfEquipmentsResults = document.getElementById("pdf-equipments-results");
    
    if (pdfEquipmentsResults) {
        let hasEquipments = false;
        let equipmentsHtml = "";

        surveyData.floors.forEach(floor => {
            floor.trs.forEach(tr => {
                tr.racks.forEach(rack => {
                    if (rack.equipments && rack.equipments.length > 0) {
                        hasEquipments = true;
                        equipmentsHtml += `
                            <h4 style="color:#1a365d; margin-top:20px; font-size: 14px;">${escapeHtml(floor.name.toUpperCase())} - ${escapeHtml(tr.name.toUpperCase())} (Gabinete: ${escapeHtml(rack.name)} - ${rack.units} RU)</h4>
                            <ul style="font-size: 13px; color: #475569; line-height: 1.6;">
                        `;

                        rack.equipments.forEach(eq => {
                            let typeStr = eq.type === 'router' ? 'Router' : eq.type === 'switch' ? 'Switch' : 'Patch Panel';
                            let details = "";
                            if (eq.type === 'switch') {
                                details = `${eq.ports} Puertos Gigabit, PoE: ${eq.poeType.toUpperCase()}`;
                            } else if (eq.type === 'router') {
                                details = `${eq.ports} Puertos LAN/WAN`;
                            } else if (eq.type === 'patch_panel') {
                                details = `${eq.ports} Puertos ${eq.category}${eq.shielded ? ' (FTP)' : ''}`;
                            }

                            let statusBadge = "";
                            if (eq.currentStatus === 'Operativo' || eq.currentStatus === 'Óptimo' || eq.currentStatus === 'Aceptable') {
                                statusBadge = `<span style="color:var(--success-color);font-weight:bold;">OPERATIVO</span>`;
                            } else if (eq.currentStatus === 'Degradado') {
                                statusBadge = `<span style="color:var(--warning-color);font-weight:bold;">DEGRADADO</span>`;
                            } else {
                                statusBadge = `<span style="color:var(--danger-color);font-weight:bold;">${escapeHtml(eq.currentStatus.toUpperCase())}</span>`;
                            }

                            equipmentsHtml += `<li><strong>${typeStr}:</strong> ${escapeHtml(eq.brand)} ${escapeHtml(eq.model)} | ${details} | Altura: ${eq.ru} U | ${statusBadge}</li>`;
                        });

                        equipmentsHtml += `</ul>`;
                    }
                });
            });
        });

        if (hasEquipments) {
            pdfEquipmentsResults.innerHTML = equipmentsHtml;
        } else {
            pdfEquipmentsResults.innerHTML = `<p style="font-size:10px;color:#64748b;font-style:italic;">No se han registrado equipos activos en los gabinetes durante este levantamiento.</p>`;
        }
    }

    // 13.4 Disparar html2pdf.js
    const pdfRoot = document.getElementById("pdf-report-template");
    const pdfContent = pdfRoot.querySelector(".rpt-container");
    pdfRoot.classList.remove("hidden");
    pdfRoot.classList.add("pdf-rendering");

    // ─── FORZAR MODO CLARO durante el render del PDF ───────────────────────
    // Eliminar dark-mode temporalmente para que html2canvas capture fondo blanco
    const bodyWasDark = document.body.classList.contains("dark-mode");
    if (bodyWasDark) document.body.classList.remove("dark-mode");
    // ───────────────────────────────────────────────────────────────────────

    const previousScrollX = window.scrollX;
    const previousScrollY = window.scrollY;
    window.scrollTo(0, 0);

    const cleanupPdfRender = () => {
        pdfRoot.classList.add("hidden");
        pdfRoot.classList.remove("pdf-rendering");
        if (bodyWasDark) document.body.classList.add("dark-mode");
        window.scrollTo(previousScrollX, previousScrollY);
    };

    const opt = {
        margin:       [0.32, 0.32, 0.42, 0.32],
        filename:     `CertNetPro_Levantamiento_${surveyData.buildingName.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.96 },
        html2canvas:  {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: '#ffffff',
            logging: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: Math.ceil(pdfContent.scrollWidth || 760),
            windowHeight: Math.ceil(pdfContent.scrollHeight || 1100)
        },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait', compress: true },
        pagebreak:    { mode: ['css', 'legacy'], avoid: ['.alert-box', '.note', '.meta-grid', 'tr'] }
    };

    html2pdf().set(opt).from(pdfContent).save().then(() => {
        cleanupPdfRender();
        // Restaurar dark-mode si estaba activo
        if (bodyWasDark) document.body.classList.add("dark-mode");
        showToast("📄 PDF Emitido", "Reporte de Site Survey descargado con éxito.", "success");
    }).catch(err => {
        cleanupPdfRender();
        if (bodyWasDark) document.body.classList.add("dark-mode");
        showToast("⚠️ Error PDF", "No se pudo compilar el reporte PDF.", "error");
    });
}

// 14. INTERRUPTORES DE AYUDA / GLOSARIO (TOOLTIPS FLOTANTES)
function setupHelpTriggers() {
    // Eliminar popovers previos
    const oldPopover = document.getElementById("survey-help-bubble");
    if (oldPopover) oldPopover.remove();

    // Crear la burbuja única en el body
    const popover = document.createElement("div");
    popover.id = "survey-help-bubble";
    popover.className = "survey-help-popover hidden no-print";
    document.body.appendChild(popover);

    const triggers = document.querySelectorAll(".help-trigger-survey");

    triggers.forEach(trigger => {
        // Asegurar que luzcan estilizados
        trigger.className = "help-trigger-survey inline-flex items-center justify-center w-4 h-4 rounded-full border border-blue-200 bg-blue-50 text-blue-600 font-bold text-[9px] cursor-pointer align-middle ml-1.5 hover:bg-blue-100 transition";
        trigger.textContent = "?";

        const showPopover = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const helpId = trigger.dataset.helpId;
            const help = HELP_DATA[helpId];
            if (!help) return;

            const defContent = help.isHtml ? help.def : `<p class="mt-1 text-[11px] leading-relaxed text-slate-300">${escapeHtml(help.def)}</p>`;
            const tipContent = help.isHtml ? help.tip : escapeHtml(help.tip);

            popover.innerHTML = `
                <span class="std-badge">${escapeHtml(help.std)}</span>
                <strong>${escapeHtml(help.title)}</strong>
                ${defContent}
                <div class="tip-box text-[10px] mt-2 pt-2 border-t border-slate-700/50">
                    <strong>Consejo Práctico:</strong> ${tipContent}
                </div>
            `;

            popover.classList.remove("hidden");

            const rect = trigger.getBoundingClientRect();
            const width = Math.min(help.isHtml ? 420 : 300, window.innerWidth - 32);
            
            // Posicionar popover (position:fixed → coordenadas relativas al viewport, SIN scrollY)
            let left = rect.right + 8;
            if (left + width > window.innerWidth) {
                left = rect.left - width - 8;
            }
            if (left < 16) left = 16;

            const estimatedHeight = help.isHtml ? 380 : 200;
            // Por defecto: mostrar debajo/alineado al trigger
            let top = rect.bottom + 6;
            // Si se sale del viewport por abajo → mostrar ARRIBA del trigger
            if (top + estimatedHeight > window.innerHeight - 16) {
                top = rect.top - estimatedHeight - 6;
            }
            // Clamp para que no salga por arriba del viewport
            if (top < 10) top = 10;
            // Clamp final por si la pantalla es muy pequeña
            if (top + estimatedHeight > window.innerHeight - 10) {
                top = Math.max(10, window.innerHeight - estimatedHeight - 10);
            }

            popover.style.width = `${width}px`;
            popover.style.left = `${left}px`;
            popover.style.top = `${top}px`;
        };

        // Eventos táctiles y hover
        trigger.addEventListener("click", showPopover);
        trigger.addEventListener("mouseenter", showPopover);
    });

    // Cerrar popover al hacer click fuera
    document.addEventListener("click", () => {
        popover.classList.add("hidden");
    });
    window.addEventListener("scroll", () => {
        popover.classList.add("hidden");
    }, { passive: true });
}

// 15. SOPORTE DE TEMA OSCURO (HEREDADO)
function setupTheme() {
    const toggle = document.getElementById("theme-toggle");
    const themeText = document.getElementById("theme-text");

    const applyTheme = (dark) => {
        document.body.classList.toggle("dark-mode", dark);
        toggle.setAttribute("aria-pressed", String(dark));
        if (themeText) {
            themeText.textContent = dark ? "Modo claro" : "Modo oscuro";
        }
    };

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

// 16. MENÚ DE SIDEBAR MÓVIL
function setupSidebar() {
    const toggle = document.getElementById("sidebar-toggle");
    const overlay = document.getElementById("sidebar-overlay");
    if (!toggle || !overlay) return;

    toggle.addEventListener("click", () => {
        const open = document.body.classList.toggle("sidebar-open");
        toggle.setAttribute("aria-expanded", String(open));
    });
    
    overlay.addEventListener("click", () => {
        document.body.classList.remove("sidebar-open");
        toggle.setAttribute("aria-expanded", "false");
    });
}

// 17. UTILIDADES DE TOASTER Y HTML ESCAPING
function showToast(title, message, type = "success") {
    const toast = document.getElementById("survey-toast");
    const tIcon = document.getElementById("toast-icon");
    const tTitle = document.getElementById("toast-title");
    const tMessage = document.getElementById("toast-message");

    tTitle.textContent = title;
    tMessage.textContent = message;

    if (type === "success") {
        tIcon.textContent = "✅";
        toast.className = "fixed top-4 right-4 z-50 rounded-2xl border border-emerald-150 bg-emerald-50 p-4 shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-3";
        tTitle.className = "font-black text-sm text-emerald-950";
    } else if (type === "error") {
        tIcon.textContent = "⚠️";
        toast.className = "fixed top-4 right-4 z-50 rounded-2xl border border-red-150 bg-red-50 p-4 shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-3";
        tTitle.className = "font-black text-sm text-red-950";
    } else {
        tIcon.textContent = "ℹ️";
        toast.className = "fixed top-4 right-4 z-50 rounded-2xl border border-blue-150 bg-blue-50 p-4 shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-3";
        tTitle.className = "font-black text-sm text-blue-950";
    }

    toast.classList.remove("hidden");

    setTimeout(() => {
        toast.classList.add("opacity-0");
        toast.classList.add("translate-y-2");
        setTimeout(() => toast.classList.add("hidden"), 300);
    }, 4000);
}

function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
