// === 1. VARIABLES Y EVENTOS GLOBALES PWA ===
let deferredPrompt;
let isInstallReady = false;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    isInstallReady = true;
    checkAndShowInstallButton();
});

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    isInstallReady = false;
    checkAndShowInstallButton();
});

function checkAndShowInstallButton() {
    const installBtn = document.getElementById('installAppBtn');
    if (!installBtn) return;
    if (isInstallReady) {
        installBtn.style.display = 'inline-flex';
        installBtn.onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') { installBtn.style.display = 'none'; }
                deferredPrompt = null;
            }
        };
    } else {
        installBtn.style.display = 'none';
    }
}

// === 2. DICCIONARIOS Y CONTENIDO POR DEFECTO ===
const fallbackContent = {
    meta: { title: "Segura & Manzano | Abogados Asociados en Los Rios", description: "Estudio juridico moderno en Montalvo, Babahoyo y Los Rios." },
    brand: { name: "Segura & Manzano", legalName: "Segura & Manzano | Abogados Asociados", shortName: "SM", tagline: "Experiencia judicial y estrategia legal moderna" },
    hero: { eyebrow: "Estudio juridico en Montalvo y Los Rios", title: "La experiencia que impone respeto.", highlight: "La estrategia que mueve el caso.", subtitle: "Servicios legales claros, firmes y modernos.", primaryCta: "Consultar por WhatsApp", secondaryCta: "Ver servicios" },
    teamSection: { eyebrow: "Nuestro poder", title: "Dos perfiles. Una firma con criterio.", highlight: "Autoridad + velocidad", description: "La trayectoria judicial de una ex jueza se combina con una forma nueva de trabajar." },
    servicesSection: { eyebrow: "Areas de practica", title: "Defensa y asesoria para causas reales.", highlight: "Sin vueltas", description: "Trabajamos asuntos civiles, familiares, penales, transito, laborales, contractuales e inmobiliarios." },
    authoritySection: { eyebrow: "Por que elegirnos", title: "Un estudio nuevo, con experiencia de sala.", highlight: "Y mentalidad actual", description: "Seriedad tecnica, comunicacion clara y ejecucion moderna." },
    stats: [{ value: "Ex Jueza", label: "liderazgo juridico civil" }, { value: "Los Rios", label: "cobertura provincial" }, { value: "Directo", label: "atencion por WhatsApp" }],
    team: [
        { name: "Abg. Zoila Maria Segura Egas", role: "Socia principal", badge: "Ex Jueza de lo Civil", summary: "Autoridad juridica y criterio probado para leer el fondo de cada conflicto.", bio: "Su experiencia como Ex Jueza de lo Civil del canton Montalvo aporta una mirada seria, tecnica y practica.", imageUrl: "", accent: "gold", tags: ["Civil", "Familia", "Contratos"] },
        { name: "Abg. Julio Anthony Manzano Coronel", role: "Abogado asociado", badge: "Innovacion y estrategia legal", summary: "Sangre nueva para impulsar comunicacion rapida.", bio: "Aporta velocidad, tecnologia, organizacion y trato directo para que el cliente sepa donde esta parado.", imageUrl: "", accent: "blue", tags: ["Estrategia", "Tecnologia", "Seguimiento"] }
    ],
    services: [{ title: "Derecho civil", description: "Demandas, obligaciones y contratos.", coverage: "Montalvo y Los Rios.", icon: "scale" }],
    authorityPoints: [{ title: "Lectura judicial", description: "Anticipamos riesgos y ordenamos pruebas." }],
    contact: { phone: "+593 XX XXX XXXX", whatsApp: "593XXXXXXXXX", email: "contacto@seguramanzano.com", address: "Montalvo, Los Rios, Ecuador", officeHours: "Lunes a viernes", mapUrl: "", coverageCities: ["Montalvo", "Babahoyo"], socialLinks: [] },
    visuals: { logoUrl: "", heroImageUrl: "/assets/segura-office.png" }
};

const iconMap = {
    scale: '<svg viewBox="0 0 24 24"><path d="M12 3v18M5 7h14M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7Z"/></svg>',
    family: '<svg viewBox="0 0 24 24"><path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 21a6 6 0 0 1 12 0M12 21a5 5 0 0 1 9 0"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"/></svg>',
    route: '<svg viewBox="0 0 24 24"><path d="M5 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM7.5 16H14a5 5 0 0 0 0-10H8"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24"><path d="M9 7V5h6v2M4 8h16v11H4V8Zm0 5h16"/></svg>',
    building: '<svg viewBox="0 0 24 24"><path d="M5 21V4h10v17M15 9h4v12M8 8h4M8 12h4M8 16h4"/></svg>',
    default: '<svg viewBox="0 0 24 24"><path d="M12 3 4 7v6c0 4 3 7 8 9 5-2 8-5 8-9V7l-8-4Z"/></svg>'
};

// === 3. INICIALIZACION PRINCIPAL ===
document.addEventListener("DOMContentLoaded", async () => {
    bindMenu();
    registerPWA();
    checkAndShowInstallButton();

    const content = await loadContent();
    window.currentSiteContent = content;

    setupPWA(content);
    renderSite(content);
    bindReveal();
    bindModal();
    bindFooterObserver(); // Ocultador de botones
    initShadowBot();

    setTimeout(() => {
        const preloader = document.getElementById("preloader");
        if (preloader) preloader.classList.add("loaded");
    }, 800);
});

// === FUNCIONES NUCLEO PWA ===
function registerPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW error', err));
    }
}

function setupPWA(content) {
    const faviconUrl = content.visuals.logoUrl || '/favicon.ico';
    const dynamicFavicon = document.getElementById("dynamicFavicon");
    if (dynamicFavicon) dynamicFavicon.href = faviconUrl;

    const absoluteIconUrl = new URL(faviconUrl, window.location.href).href;
    const manifest = {
        name: content.brand.legalName || "Estudio Jurídico",
        short_name: content.brand.shortName || "Estudio",
        display: "standalone",
        start_url: "/",
        background_color: "#08090d",
        theme_color: "#08090d",
        icons: [
            { src: absoluteIconUrl, sizes: "192x192", type: "image/png", purpose: "any maskable" },
            { src: absoluteIconUrl, sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
    };

    const manifestString = JSON.stringify(manifest);
    const manifestUrl = 'data:application/manifest+json;charset=utf-8,' + encodeURIComponent(manifestString);
    const dynamicManifest = document.getElementById("dynamicManifest");
    if (dynamicManifest) dynamicManifest.href = manifestUrl;
}

async function loadContent() {
    try {
        const response = await fetch("/api/site", { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("No API");
        return mergeContent(fallbackContent, await response.json());
    } catch { return fallbackContent; }
}

function mergeContent(base, incoming) {
    return { ...base, ...incoming, meta: { ...base.meta, ...incoming.meta }, brand: { ...base.brand, ...incoming.brand }, hero: { ...base.hero, ...incoming.hero }, teamSection: { ...base.teamSection, ...incoming.teamSection }, servicesSection: { ...base.servicesSection, ...incoming.servicesSection }, authoritySection: { ...base.authoritySection, ...incoming.authoritySection }, contact: { ...base.contact, ...incoming.contact }, visuals: { ...base.visuals, ...incoming.visuals } };
}

// === LÓGICA DE MANEJO DE ERRORES DE IMÁGENES (NUEVA MEJORA) ===
// Si una imagen se borra del servidor o falla, la reemplaza por las iniciales para que no se vea rota.
window.handleImageError = function (imgElement, fallbackName) {
    const parent = imgElement.parentElement;
    if (parent) {
        parent.innerHTML = `<div class="team-initials">${escapeHtml(initials(fallbackName))}</div>`;
    }
};

window.handleLogoError = function (imgElement, shortName) {
    const parent = imgElement.parentElement;
    if (parent) {
        parent.textContent = shortName;
    }
};

// === LOGICA DE RENDERIZADO ===
function renderSite(content) {
    const metaDescription = document.querySelector('meta[name="description"]');
    document.title = content.meta.title || content.brand.legalName || fallbackContent.meta.title;
    if (metaDescription) metaDescription.content = content.meta.description || fallbackContent.meta.description;

    setText("brandName", content.brand.name);
    setText("brandTagline", content.brand.tagline);
    setText("footerBrand", content.brand.legalName || content.brand.name);
    setText("footerText", content.brand.tagline);

    const brandMark = document.getElementById("brandMark");
    const preloaderLogo = document.getElementById("preloaderLogo");
    const propLogo = document.getElementById("propagandaLogo");

    if (content.visuals.logoUrl) {
        const safeName = safeAttr(content.brand.name);
        const safeShort = safeAttr(content.brand.shortName || initials(content.brand.name));
        // Agregamos onerror a los logos
        const imgHtml = `<img src="${safeAttr(content.visuals.logoUrl)}" alt="${safeName}" onerror="window.handleLogoError(this, '${safeShort}')">`;
        if (brandMark) brandMark.innerHTML = imgHtml;
        if (preloaderLogo) preloaderLogo.innerHTML = imgHtml;
        if (propLogo) propLogo.innerHTML = imgHtml;
    } else {
        const defaultText = content.brand.shortName || initials(content.brand.name);
        if (brandMark) brandMark.textContent = defaultText;
        if (preloaderLogo) preloaderLogo.textContent = defaultText;
        if (propLogo) propLogo.textContent = defaultText;
    }

    setText("propagandaTitle", content.brand.name);
    setText("propagandaTagline", content.brand.tagline);

    const heroImage = document.getElementById("heroImage");
    if (content.visuals.heroImageUrl && heroImage) heroImage.src = content.visuals.heroImageUrl;

    setText("heroEyebrow", content.hero.eyebrow); setText("heroTitle", content.hero.title); setText("heroHighlight", content.hero.highlight); setText("heroSubtitle", content.hero.subtitle); setText("heroPrimary", content.hero.primaryCta, "span"); setText("heroSecondary", content.hero.secondaryCta, "span");

    const whatsAppUrl = buildWhatsAppUrl(content.contact.whatsApp, `Hola, soy visitante de ${content.brand.name}. Quiero consultar un caso legal.`);
    ["navWhatsapp", "heroPrimary", "contactWhatsapp", "floatWhatsapp"].forEach(id => setHref(id, whatsAppUrl));
    setHref("contactEmail", `mailto:${content.contact.email || ""}`);

    setText("teamEyebrow", content.teamSection.eyebrow); setText("teamTitle", content.teamSection.title); setText("teamHighlight", content.teamSection.highlight); setText("teamDescription", content.teamSection.description);
    setText("servicesEyebrow", content.servicesSection.eyebrow); setText("servicesTitle", content.servicesSection.title); setText("servicesHighlight", content.servicesSection.highlight); setText("servicesDescription", content.servicesSection.description);
    setText("authorityEyebrow", content.authoritySection.eyebrow); setText("authorityTitle", content.authoritySection.title); setText("authorityHighlight", content.authoritySection.highlight); setText("authorityDescription", content.authoritySection.description);

    renderStats(content.stats || []);
    renderTeam(content.team || []);
    renderServices(content.services || []);
    renderAuthority(content.authorityPoints || []);
    renderContact(content.contact || fallbackContent.contact);
}

function renderStats(stats) {
    const target = document.getElementById("statsList");
    if (!target) return;
    target.innerHTML = stats.map(item => `<div class="stat reveal"><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></div>`).join("");
}

function renderTeam(team) {
    const target = document.getElementById("teamGrid");
    if (!target) return;
    target.innerHTML = team.map((member, index) => {
        // Agregamos onerror a la imagen del equipo
        const image = member.imageUrl
            ? `<img src="${safeAttr(member.imageUrl)}" alt="${safeAttr(member.name)}" onerror="window.handleImageError(this, '${safeAttr(member.name)}')">`
            : `<div class="team-initials">${escapeHtml(initials(member.name))}</div>`;
        const tags = (member.tags || []).map(tag => `<span class="pill">${escapeHtml(tag)}</span>`).join("");
        return `<article class="team-card reveal" onclick="openProfileModal(${index})"><div class="team-photo">${image}</div><div class="team-body"><span class="badge ${escapeHtml(member.accent || "gold")}">${escapeHtml(member.badge)}</span><h3 class="editorial-title">${escapeHtml(member.name)}</h3><h4 class="role-text">${escapeHtml(member.role)}</h4><p class="bio-text">${escapeHtml(member.summary)}</p><div class="team-tags">${tags}</div></div></article>`;
    }).join("");
}

function renderServices(services) {
    const target = document.getElementById("servicesGrid");
    if (!target) return;
    target.innerHTML = services.map(service => `<article class="service-card reveal"><div class="service-icon">${iconMap[service.icon] || iconMap.default}</div><h3>${escapeHtml(service.title)}</h3><p>${escapeHtml(service.description)}</p><small>${escapeHtml(service.coverage)}</small></article>`).join("");
}

function renderAuthority(points) {
    const target = document.getElementById("authorityPoints");
    if (!target) return;
    target.innerHTML = points.map((point, index) => `<article class="authority-card reveal"><span>${index + 1}</span><h3>${escapeHtml(point.title)}</h3><p>${escapeHtml(point.description)}</p></article>`).join("");
}

function renderContact(contact) {
    const target = document.getElementById("contactPanel");
    if (!target) return;
    const coverage = (contact.coverageCities || []).map(city => `<span class="pill">${escapeHtml(city)}</span>`).join("");
    const socials = (contact.socialLinks || []).filter(link => link.label).map(link => `<a class="pill" href="${safeAttr(link.url || "#")}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>`).join("");

    const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(contact.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    target.innerHTML = `<div class="contact-row"><strong>Telefono</strong><span>${escapeHtml(contact.phone)}</span></div><div class="contact-row"><strong>WhatsApp</strong><a href="${safeAttr(buildWhatsAppUrl(contact.whatsApp, "Hola."))}" target="_blank" rel="noopener">${escapeHtml(contact.whatsApp)}</a></div><div class="contact-row"><strong>Correo</strong><a href="mailto:${safeAttr(contact.email)}">${escapeHtml(contact.email)}</a></div><div class="contact-row"><strong>Direccion</strong><span>${escapeHtml(contact.address)}</span></div><div class="contact-row"><strong>Horario</strong><span>${escapeHtml(contact.officeHours)}</span></div><div class="contact-row"><strong>Cobertura</strong><div class="coverage-tags">${coverage}</div></div><div class="contact-row"><strong>Redes</strong><div class="social-links">${socials}</div></div><div class="map-container"><iframe src="${safeAttr(mapEmbedUrl)}" loading="lazy" title="Mapa del Estudio" style="border:0;" allowfullscreen></iframe></div>`;
}

// === LOGICA DEL MODAL DE PERFIL ===
function bindModal() {
    const dialog = document.getElementById("profileDialog");
    if (!dialog) return;
    const closeBtn = document.getElementById("closeProfileBtn");
    if (closeBtn) closeBtn.addEventListener("click", () => { dialog.close(); document.body.classList.remove("modal-open"); });
    dialog.addEventListener("click", (e) => { if (e.target === dialog) { dialog.close(); document.body.classList.remove("modal-open"); } });
}

window.openProfileModal = function (index) {
    const member = window.currentSiteContent.team[index];
    if (!member) return;
    const photoDiv = document.getElementById("modalPhoto");
    if (photoDiv) {
        // Agregamos onerror también a la foto dentro del Modal
        photoDiv.innerHTML = member.imageUrl
            ? `<img src="${safeAttr(member.imageUrl)}" alt="${safeAttr(member.name)}" onerror="window.handleImageError(this, '${safeAttr(member.name)}')">`
            : `<div class="team-initials">${escapeHtml(initials(member.name))}</div>`;
    }

    setText("modalBadge", member.badge);
    const badgeEl = document.getElementById("modalBadge");
    if (badgeEl) badgeEl.className = `badge ${member.accent}`;
    setText("modalName", member.name); setText("modalRole", member.role);

    const bioHtml = escapeHtml(member.bio || member.summary).replace(/\n/g, '<br>');
    const modalBio = document.getElementById("modalBio");
    if (modalBio) modalBio.innerHTML = bioHtml;

    const modalTags = document.getElementById("modalTags");
    if (modalTags) modalTags.innerHTML = (member.tags || []).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join("");

    const modalLogo = document.getElementById("modalLogo");
    if (modalLogo) {
        const safeShort = safeAttr(window.currentSiteContent.brand.shortName || initials(window.currentSiteContent.brand.name));
        modalLogo.innerHTML = window.currentSiteContent.visuals.logoUrl
            ? `<img src="${safeAttr(window.currentSiteContent.visuals.logoUrl)}" alt="Logo" onerror="window.handleLogoError(this, '${safeShort}')">`
            : safeShort;
    }

    const contactBtn = document.getElementById("modalContactBtn");
    if (contactBtn) contactBtn.href = buildWhatsAppUrl(window.currentSiteContent.contact.whatsApp, `Hola, quisiera agendar una consulta con ${member.name}.`);

    const dialog = document.getElementById("profileDialog");
    if (dialog) { dialog.showModal(); document.body.classList.add("modal-open"); }
};

// === CEREBRO AVANZADO DEL ASISTENTE VIRTUAL (SHADOW BOT) ===
function initShadowBot() {
    const botToggle = document.getElementById('aiBotToggle');
    const botPanel = document.getElementById('aiBotPanel');
    const botClose = document.getElementById('aiBotClose');
    const sendBtn = document.getElementById('aiBotSendBtn');
    const micBtn = document.getElementById('aiBotMicBtn');
    const textInput = document.getElementById('aiBotTextInput');
    const chatWindow = document.getElementById('aiBotChat');

    if (!botToggle || !botPanel) return;

    let isRecording = false;
    let recognition = null;

    // Soporte para micrófono
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'es-EC';
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            textInput.value = transcript;
            handleUserMessage();
        };
        recognition.onerror = () => stopRecording();
        recognition.onend = () => stopRecording();
    } else {
        if (micBtn) micBtn.style.display = 'none';
    }

    botToggle.onclick = () => botPanel.classList.add('open');
    botClose.onclick = () => { botPanel.classList.remove('open'); window.speechSynthesis.cancel(); };
    sendBtn.onclick = handleUserMessage;
    textInput.onkeypress = (e) => { if (e.key === 'Enter') handleUserMessage(); };

    micBtn.onclick = () => {
        if (!recognition) return;
        if (isRecording) { stopRecording(); }
        else {
            isRecording = true;
            micBtn.classList.add('recording');
            recognition.start();
        }
    };

    function stopRecording() {
        if (recognition) recognition.stop();
        isRecording = false;
        micBtn.classList.remove('recording');
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = sender === 'bot' ? 'bot-msg' : 'user-msg';
        div.textContent = text;
        chatWindow.appendChild(div);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function handleUserMessage() {
        const msg = textInput.value.trim();
        if (!msg) return;

        addMessage(msg, 'user');
        textInput.value = '';

        setTimeout(() => {
            const response = generateIntelligentResponse(msg);
            addMessage(response, 'bot');
            speakText(response);
        }, 500);
    }

    function generateIntelligentResponse(rawQuery) {
        const c = window.currentSiteContent || fallbackContent;
        const q = rawQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        if (/\b(hola|buenos dias|buenas tardes|buenas noches|saludos|que tal)\b/.test(q)) {
            return `¡Hola! Bienvenido al asistente virtual de ${c.brand.name}. ¿En qué área legal puedo ayudarte hoy?`;
        }

        if (/\b(hora|horario|atienden|abierto|abiertos|cierran|fines de semana|sabados)\b/.test(q)) {
            return `Nuestro horario de atención oficial es: ${c.contact.officeHours}. ¿Deseas agendar una cita?`;
        }

        if (/\b(donde|direccion|ubicacion|ubicados|llegar|oficina|estudio|babahoyo|montalvo)\b/.test(q)) {
            return `Nuestra oficina principal se encuentra en: ${c.contact.address}. Además, brindamos cobertura experta en ${(c.contact.coverageCities || []).join(', ')}.`;
        }

        if (/\b(telefono|numero|llamar|contacto|contactar|whatsapp|correo|email)\b/.test(q)) {
            return `Será un gusto atenderte directamente. Puedes llamarnos o escribirnos por WhatsApp al ${c.contact.whatsApp}. Nuestro correo oficial es ${c.contact.email}.`;
        }

        if (/\b(abogado|abogada|quienes|equipo|experiencia|perfil|zoila|julio|manzano|segura)\b/.test(q)) {
            const teamNames = (c.team || []).map(t => `${t.name} (${t.role})`).join(' y ');
            return `Nuestro equipo de expertos está liderado por ${teamNames}. Combinamos sólida experiencia judicial y estrategia legal moderna para tu defensa.`;
        }

        if (/\b(cita|agendar|reunion|consulta|consultar|precio|costo|pagar|honorarios|cuanto cobran)\b/.test(q)) {
            return `Para consultas específicas, evaluación de tu caso y honorarios, te sugiero hablar directamente con nuestros abogados. Haz clic en el botón de WhatsApp de esta página para asistencia inmediata.`;
        }

        const matchedService = (c.services || []).find(s => {
            const keywords = s.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(' ');
            return keywords.some(kw => q.includes(kw) && kw.length > 3);
        });

        if (matchedService) {
            return `Sobre ${matchedService.title}: ${matchedService.description} Atendemos estos casos en ${matchedService.coverage}. Para darte una solución rápida, escríbenos por WhatsApp.`;
        }

        if (/\b(servicio|hacen|casos|ayudar|trabajan|especialidad|derecho|civil|penal|familia|laboral|transito|tierras|divorcio|alimentos)\b/.test(q)) {
            const servicesList = (c.services || []).map(s => s.title).join(', ');
            return `Nos especializamos en diversas ramas del derecho, incluyendo: ${servicesList}. Cuéntame brevemente tu caso o escríbenos al WhatsApp para ayudarte ahora mismo.`;
        }

        return `Comprendo. Cada caso legal es único y requiere un análisis cuidadoso. Para darte la estrategia correcta, por favor envíanos un mensaje por WhatsApp al ${c.contact.whatsApp} o visítanos en nuestras oficinas.`;
    }

    function speakText(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-EC';
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
    }
}

// === OCULTAR BOTONES FLOTANTES AL LLEGAR AL FOOTER ===
function bindFooterObserver() {
    if (typeof IntersectionObserver === 'undefined') return;
    const footer = document.querySelector('.footer');
    const botBtn = document.getElementById('aiBotToggle');
    const waBtn = document.getElementById('floatWhatsapp');
    const botPanel = document.getElementById('aiBotPanel');

    if (!footer) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Se ve el footer -> Ocultar botones flotantes
                if (botBtn) botBtn.classList.add('hide-footer');
                if (waBtn) waBtn.classList.add('hide-footer');
                if (botPanel) botPanel.classList.remove('open');
            } else {
                // No se ve el footer -> Mostrar botones de nuevo
                if (botBtn) botBtn.classList.remove('hide-footer');
                if (waBtn) waBtn.classList.remove('hide-footer');
            }
        });
    }, { threshold: 0.05 });

    observer.observe(footer);
}

// === EVENTOS COMUNES ===
function bindMenu() {
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if (!toggle || !links) return;
    toggle.addEventListener("click", () => { const open = links.classList.toggle("open"); toggle.setAttribute("aria-expanded", String(open)); document.body.classList.toggle("menu-open", open); });
    links.querySelectorAll("a").forEach(link => { link.addEventListener("click", () => { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); document.body.classList.remove("menu-open"); }); });
}

function bindReveal() {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("in-view"); observer.unobserve(entry.target); } }); }, { threshold: 0.14 });
    document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
}

function buildWhatsAppUrl(phone, message) { return `https://wa.me/${String(phone || "").replace(/\D/g, "") || "593"}?text=${encodeURIComponent(message)}`; }
function initials(value) { return String(value || "SM").split(/\s|&/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase(); }
function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value || ""; }
function setHref(id, value) { const el = document.getElementById(id); if (el) el.href = value || "#"; }
function escapeHtml(value) { return String(value || "").replace(/&/g, "\x26amp;").replace(/</g, "\x26lt;").replace(/>/g, "\x26gt;").replace(/"/g, "\x26quot;").replace(/'/g, "\x26#039;"); }
function safeAttr(value) { return escapeHtml(value).replace(/`/g, "\x26#096;"); }