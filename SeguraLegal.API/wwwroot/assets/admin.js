const tokenKey = "segura_admin_token";
let state = null;

document.addEventListener("DOMContentLoaded", () => {
    bindAuth();
    bindEditing();
    bindActions();
    bindBotTester();

    const token = localStorage.getItem(tokenKey);
    if (token) {
        openDashboard();
    } else {
        document.getElementById("dashboard").classList.remove("visible");
        document.getElementById("loginPanel").style.display = "block";
    }
});

function bindAuth() {
    document.getElementById("loginForm").addEventListener("submit", async event => {
        event.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        setLoginMessage("Entrando...", "");

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) throw new Error("Credenciales invalidas");
            const data = await response.json();
            localStorage.setItem(tokenKey, data.token);
            await openDashboard();
        } catch (error) {
            setLoginMessage(error.message || "No se pudo iniciar sesion", "error");
        }
    });

    document.getElementById("logoutButton").addEventListener("click", () => {
        localStorage.removeItem(tokenKey);
        state = null;
        document.getElementById("dashboard").classList.remove("visible");
        document.getElementById("loginPanel").style.display = "block";
        document.getElementById("password").value = "";
        setLoginMessage("", "");
    });
}

async function openDashboard() {
    try {
        const content = await apiFetch("/api/admin/site");
        state = normalizeContent(content);

        document.getElementById("loginPanel").style.display = "none";
        document.getElementById("dashboard").classList.add("visible");

        hydrateForm();
        renderEditors();
        setStatus("Contenido cargado. Edita y guarda cuando este listo.", "ok");
    } catch {
        localStorage.removeItem(tokenKey);
        document.getElementById("dashboard").classList.remove("visible");
        document.getElementById("loginPanel").style.display = "block";
        setLoginMessage("Sesion vencida o credenciales invalidas.", "error");
    }
}

function bindEditing() {
    document.addEventListener("input", event => {
        const target = event.target;
        if (!state || !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;

        if (target.dataset.path) {
            setByPath(state, target.dataset.path, target.value);
        }

        if (target.dataset.pathList) {
            setByPath(state, target.dataset.pathList, splitList(target.value));
        }

        if (target.dataset.array) {
            const array = getByPath(state, target.dataset.array);
            const index = Number(target.dataset.index);
            if (!Array.isArray(array) || Number.isNaN(index) || !array[index]) return;

            array[index][target.dataset.field] = target.dataset.kind === "list" ? splitList(target.value) : target.value;

            if (target.dataset.field === "name" && target.dataset.array === "team") {
                renderUploadTargets(false);
            }
        }
    });
}

function bindActions() {
    document.getElementById("saveButton").addEventListener("click", saveContent);
    document.getElementById("uploadButton").addEventListener("click", uploadImage);

    // Listener para borrar imagen
    const clearBtn = document.getElementById("clearImageBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", clearCurrentImage);
    }

    const selectTarget = document.getElementById("uploadTarget");
    if (selectTarget) {
        selectTarget.addEventListener("change", updateCurrentImageUrl);
    }

    document.addEventListener("click", event => {
        const button = event.target.closest("[data-action]");
        if (!button || !state) return;

        const action = button.dataset.action;
        const index = Number(button.dataset.index);

        if (action === "add-stat") state.stats.push({ value: "Nuevo dato", label: "Descripcion breve" });
        if (action === "remove-stat") state.stats.splice(index, 1);

        if (action === "add-team") {
            state.team.push({ name: "Nuevo integrante", role: "Cargo", badge: "Especialidad", summary: "Resumen profesional.", bio: "Biografia y experiencia.", imageUrl: "", accent: "gold", tags: [] });
            renderUploadTargets(false);
        }
        if (action === "remove-team") {
            state.team.splice(index, 1);
            renderUploadTargets(false);
        }

        if (action === "add-service") state.services.push({ title: "Nuevo servicio", description: "Descripcion del servicio legal.", coverage: "Cobertura local.", icon: "shield" });
        if (action === "remove-service") state.services.splice(index, 1);

        if (action === "add-authority") state.authorityPoints.push({ title: "Nuevo punto", description: "Descripcion clara." });
        if (action === "remove-authority") state.authorityPoints.splice(index, 1);

        if (action === "add-social") state.contact.socialLinks.push({ label: "Nueva red", url: "#" });
        if (action === "remove-social") state.contact.socialLinks.splice(index, 1);

        renderEditors();
        hydrateForm();
        setStatus("Cambio local listo. Recuerda guardar.", "");
    });
}

async function saveContent() {
    setStatus("Guardando cambios...", "");
    try {
        const saved = await apiFetch("/api/admin/site", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(state)
        });
        state = normalizeContent(saved);
        hydrateForm();
        renderEditors();
        setStatus("Guardado. El inicio ya refleja estos cambios.", "ok");
    } catch (error) {
        setStatus(error.message || "No se pudo guardar.", "error");
    }
}

async function uploadImage() {
    const fileInput = document.getElementById("uploadFile");
    const target = document.getElementById("uploadTarget").value;

    if (!fileInput.files.length) {
        setStatus("Selecciona una imagen primero desde tu computadora.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    setStatus("Subiendo imagen al servidor...", "");

    try {
        const result = await apiFetch("/api/admin/uploads", {
            method: "POST",
            body: formData
        });

        setByPath(state, target, result.url);

        fileInput.value = "";
        updateCurrentImageUrl();

        setStatus(`Imagen subida y asignada con éxito al ítem. Recuerda Guardar Cambios para aplicar a la web.`, "ok");
    } catch (error) {
        setStatus(error.message || "No se pudo subir la imagen.", "error");
    }
}

// Nueva función para borrar la imagen actual
function clearCurrentImage() {
    const select = document.getElementById("uploadTarget");
    if (!select) return;

    const targetPath = select.value;

    // Setear a cadena vacía
    setByPath(state, targetPath, "");

    // Refrescar UI
    updateCurrentImageUrl();
    setStatus("Imagen borrada localmente. Recuerda Guardar Cambios.", "ok");
}

function renderUploadTargets(resetSelection = true) {
    const select = document.getElementById("uploadTarget");
    if (!select) return;

    const previousSelection = select.value;

    const options = [
        ["visuals.logoUrl", "Logo del estudio"],
        ["visuals.heroImageUrl", "Imagen principal (Fondo Hero)"],
        ...state.team.map((member, index) => [`team.${index}.imageUrl`, `Foto de Abogado: ${member.name || `Integrante ${index + 1}`}`])
    ];

    select.innerHTML = options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");

    if (!resetSelection && previousSelection) {
        const exists = Array.from(select.options).some(opt => opt.value === previousSelection);
        if (exists) select.value = previousSelection;
    }

    updateCurrentImageUrl();
}

function updateCurrentImageUrl() {
    const select = document.getElementById("uploadTarget");
    const urlDisplay = document.getElementById("currentImageUrl");
    const clearBtn = document.getElementById("clearImageBtn");

    if (!select || !urlDisplay) return;

    const targetPath = select.value;
    const currentUrl = getByPath(state, targetPath);

    if (currentUrl && currentUrl.trim() !== "") {
        urlDisplay.value = currentUrl;
        if (clearBtn) clearBtn.style.display = "block";
    } else {
        urlDisplay.value = "";
        if (clearBtn) clearBtn.style.display = "none";
    }
}

function hydrateForm() {
    document.querySelectorAll("[data-path]").forEach(input => {
        input.value = getByPath(state, input.dataset.path) ?? "";
    });

    document.querySelectorAll("[data-path-list]").forEach(input => {
        const value = getByPath(state, input.dataset.pathList);
        input.value = Array.isArray(value) ? value.join(", ") : "";
    });
}

function renderEditors() {
    renderStats();
    renderTeam();
    renderServices();
    renderAuthority();
    renderSocials();
    renderUploadTargets();
}

function renderStats() {
    document.getElementById("statsEditor").innerHTML = state.stats.map((item, index) => `
    <div class="editor-item">
      <div class="editor-title">
        <strong>Dato ${index + 1}</strong>
        <button class="mini-button danger" data-action="remove-stat" data-index="${index}" type="button">Eliminar</button>
      </div>
      <div class="editor-grid">
        ${field("Valor", "stats", index, "value", item.value)}
        ${field("Etiqueta", "stats", index, "label", item.label)}
      </div>
    </div>
  `).join("");
}

function renderTeam() {
    document.getElementById("teamEditor").innerHTML = state.team.map((member, index) => `
    <div class="editor-item">
      <div class="editor-title">
        <strong>${escapeHtml(member.name || `Integrante ${index + 1}`)}</strong>
        <button class="mini-button danger" data-action="remove-team" data-index="${index}" type="button">Eliminar</button>
      </div>
      <div class="editor-grid">
        ${field("Nombre", "team", index, "name", member.name)}
        ${field("Cargo", "team", index, "role", member.role)}
        ${field("Insignia", "team", index, "badge", member.badge)}
        ${selectField("Acento", "team", index, "accent", member.accent, [["gold", "Dorado"], ["blue", "Azul"]])}
        
        <input type="hidden" data-array="team" data-index="${index}" data-field="imageUrl" value="${safeAttr(member.imageUrl)}">
        
        ${field("Etiquetas por coma", "team", index, "tags", (member.tags || []).join(", "), "list")}
        ${textareaField("Resumen", "team", index, "summary", member.summary)}
        ${textareaField("Biografia", "team", index, "bio", member.bio)}
      </div>
    </div>
  `).join("");
}

function renderServices() {
    const iconOptions = [["scale", "Balanza"], ["family", "Familia"], ["shield", "Escudo"], ["route", "Transito"], ["briefcase", "Laboral"], ["building", "Inmobiliario"]];
    document.getElementById("servicesEditor").innerHTML = state.services.map((service, index) => `
    <div class="editor-item">
      <div class="editor-title">
        <strong>${escapeHtml(service.title || `Servicio ${index + 1}`)}</strong>
        <button class="mini-button danger" data-action="remove-service" data-index="${index}" type="button">Eliminar</button>
      </div>
      <div class="editor-grid">
        ${field("Titulo", "services", index, "title", service.title)}
        ${selectField("Icono", "services", index, "icon", service.icon, iconOptions)}
        ${textareaField("Descripcion", "services", index, "description", service.description)}
        ${textareaField("Cobertura", "services", index, "coverage", service.coverage)}
      </div>
    </div>
  `).join("");
}

function renderAuthority() {
    document.getElementById("authorityEditor").innerHTML = state.authorityPoints.map((point, index) => `
    <div class="editor-item">
      <div class="editor-title">
        <strong>Punto ${index + 1}</strong>
        <button class="mini-button danger" data-action="remove-authority" data-index="${index}" type="button">Eliminar</button>
      </div>
      <div class="editor-grid">
        ${field("Titulo", "authorityPoints", index, "title", point.title)}
        ${textareaField("Descripcion", "authorityPoints", index, "description", point.description)}
      </div>
    </div>
  `).join("");
}

function renderSocials() {
    document.getElementById("socialEditor").innerHTML = state.contact.socialLinks.map((link, index) => `
    <div class="editor-item">
      <div class="editor-title">
        <strong>${escapeHtml(link.label || `Red ${index + 1}`)}</strong>
        <button class="mini-button danger" data-action="remove-social" data-index="${index}" type="button">Eliminar</button>
      </div>
      <div class="editor-grid">
        ${field("Nombre", "contact.socialLinks", index, "label", link.label)}
        ${field("URL", "contact.socialLinks", index, "url", link.url)}
      </div>
    </div>
  `).join("");
}

function field(label, arrayName, index, fieldName, value, kind = "") {
    return `
    <label>${escapeHtml(label)}
      <input data-array="${escapeHtml(arrayName)}" data-index="${index}" data-field="${escapeHtml(fieldName)}" data-kind="${escapeHtml(kind)}" value="${safeAttr(value)}">
    </label>
  `;
}

function textareaField(label, arrayName, index, fieldName, value) {
    return `
    <label class="wide">${escapeHtml(label)}
      <textarea rows="3" data-array="${escapeHtml(arrayName)}" data-index="${index}" data-field="${escapeHtml(fieldName)}">${escapeHtml(value)}</textarea>
    </label>
  `;
}

function selectField(label, arrayName, index, fieldName, value, options) {
    const body = options.map(([optionValue, optionLabel]) => {
        const selected = optionValue === value ? "selected" : "";
        return `<option value="${escapeHtml(optionValue)}" ${selected}>${escapeHtml(optionLabel)}</option>`;
    }).join("");

    return `
    <label>${escapeHtml(label)}
      <select data-array="${escapeHtml(arrayName)}" data-index="${index}" data-field="${escapeHtml(fieldName)}">${body}</select>
    </label>
  `;
}

// === BOT TESTER ===
function bindBotTester() {
    const sendBtn = document.getElementById('adminBotSend');
    const input = document.getElementById('adminBotInput');
    const chat = document.getElementById('adminBotChat');

    if (!sendBtn || !input || !chat) return;

    function addMessage(text, type) {
        const div = document.createElement('div');
        div.className = type === 'bot' ? 'admin-bot-msg' : 'admin-user-msg';
        div.textContent = text;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    function generateBotResponse(rawQuery) {
        const c = state;
        if (!c) return "El panel aún no ha cargado los datos.";

        const q = rawQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        if (/\b(hola|buenos dias|buenas tardes|buenas noches|saludos|que tal)\b/.test(q)) { return `¡Hola! Bienvenido al asistente virtual de ${c.brand.name}. ¿En qué área legal puedo ayudarte hoy?`; }
        if (/\b(hora|horario|atienden|abierto|abiertos|cierran|fines de semana|sabados)\b/.test(q)) { return `Nuestro horario de atención oficial es: ${c.contact.officeHours}. ¿Deseas agendar una cita?`; }
        if (/\b(donde|direccion|ubicacion|ubicados|llegar|oficina|estudio|babahoyo|montalvo)\b/.test(q)) { return `Nuestra oficina principal se encuentra en: ${c.contact.address}. Además, brindamos cobertura experta en ${(c.contact.coverageCities || []).join(', ')}.`; }
        if (/\b(telefono|numero|llamar|contacto|contactar|whatsapp|correo|email)\b/.test(q)) { return `Puedes llamarnos o escribirnos por WhatsApp al ${c.contact.whatsApp}. Nuestro correo oficial es ${c.contact.email}.`; }
        if (/\b(abogado|abogada|quienes|equipo|experiencia|perfil|zoila|julio|manzano|segura)\b/.test(q)) {
            const teamNames = (c.team || []).map(t => `${t.name} (${t.role})`).join(' y ');
            return `Nuestro equipo de expertos está liderado por ${teamNames}. Combinamos sólida experiencia judicial y estrategia legal moderna para tu defensa.`;
        }
        if (/\b(cita|agendar|reunion|consulta|consultar|precio|costo|pagar|honorarios|cuanto cobran)\b/.test(q)) { return `Para consultas específicas, evaluación de tu caso y honorarios, te sugiero hablar directamente con nuestros abogados. Haz clic en el botón de WhatsApp de esta página para asistencia inmediata.`; }

        const matchedService = (c.services || []).find(s => {
            const keywords = s.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(' ');
            return keywords.some(kw => q.includes(kw) && kw.length > 3);
        });
        if (matchedService) { return `Sobre ${matchedService.title}: ${matchedService.description} Atendemos estos casos en ${matchedService.coverage}.`; }

        if (/\b(servicio|hacen|casos|ayudar|trabajan|especialidad|derecho|civil|penal|familia|laboral|transito|tierras|divorcio|alimentos)\b/.test(q)) {
            const servicesList = (c.services || []).map(s => s.title).join(', ');
            return `Nos especializamos en diversas ramas del derecho, incluyendo: ${servicesList}. Cuéntame brevemente tu caso.`;
        }
        return `Comprendo. Cada caso legal es único y requiere un análisis cuidadoso. Para darte la estrategia correcta, por favor envíanos un mensaje por WhatsApp al ${c.contact.whatsApp}.`;
    }

    function handleSend() {
        const text = input.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        input.value = '';
        setTimeout(() => {
            addMessage(generateBotResponse(text), 'bot');
        }, 300);
    }

    sendBtn.onclick = handleSend;
    input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
}

async function apiFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = localStorage.getItem(tokenKey);
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        let message = "Error de API";
        try {
            const data = await response.json();
            message = data.message || message;
        } catch {
            message = response.statusText || message;
        }
        throw new Error(message);
    }

    return response.json();
}

function normalizeContent(content) {
    content.meta ||= {};
    content.brand ||= {};
    content.hero ||= {};
    content.teamSection ||= {};
    content.servicesSection ||= {};
    content.authoritySection ||= {};
    content.stats ||= [];
    content.team ||= [];
    content.services ||= [];
    content.authorityPoints ||= [];
    content.contact ||= {};
    content.contact.coverageCities ||= [];
    content.contact.socialLinks ||= [];
    content.visuals ||= {};
    return content;
}

function getByPath(root, path) {
    return path.split(".").reduce((current, key) => current?.[key], root);
}

function setByPath(root, path, value) {
    const keys = path.split(".");
    let current = root;
    keys.slice(0, -1).forEach(key => {
        if (Array.isArray(current)) {
            current = current[Number(key)];
            return;
        }

        if (!(key in current) || current[key] == null) {
            const nextKey = keys[keys.indexOf(key) + 1];
            current[key] = Number.isInteger(Number(nextKey)) ? [] : {};
        }
        current = current[key];
    });

    const last = keys.at(-1);
    if (Array.isArray(current)) current[Number(last)] = value;
    else current[last] = value;
}

function splitList(value) {
    return String(value || "")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
}

function setStatus(message, type) {
    const line = document.getElementById("statusLine");
    line.textContent = message;
    line.className = `status-line ${type || ""}`.trim();
}

function setLoginMessage(message, type) {
    const line = document.getElementById("loginMessage");
    line.textContent = message;
    line.className = `form-message ${type || ""}`.trim();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "\x26amp;")
        .replace(/</g, "\x26lt;")
        .replace(/>/g, "\x26gt;")
        .replace(/"/g, "\x26quot;")
        .replace(/'/g, "\x26#039;");
}

function safeAttr(value) {
    return escapeHtml(value).replace(/`/g, "\x26#096;");
}