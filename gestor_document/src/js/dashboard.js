// Gestor de Documentos - Funcionalidad JavaScript

// Estado de la aplicación
let currentView = 'grid';
let currentSection = 'documents';
let documents = [];
let sharedDocuments = [];
let trashDocuments = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    loadDocuments();
    setupEventListeners();
    setupSearch();
});

// Cargar datos del usuario
function loadUserData() {
    const userData = localStorage.getItem('user');
    if (userData) {
        const user = JSON.parse(userData);
        const userName = user.name || 'Usuario';
        const userEmail = user.email || 'usuario@litoral.edu.co';
        
        // Actualizar sidebar
        document.getElementById('userName').textContent = userName;
        document.getElementById('userEmail').textContent = userEmail;
        document.getElementById('userInitials').textContent = userName.charAt(0).toUpperCase();
        
        // Actualizar mensaje de bienvenida
        const welcomeUserName = document.getElementById('welcomeUserName');
        if (welcomeUserName) {
            welcomeUserName.textContent = userName;
        }
        
        // Actualizar perfil
        document.getElementById('profileName').value = userName;
        document.getElementById('profileEmail').value = userEmail;
    } else {
        // Si no hay usuario, redirigir al login
        window.location.href = 'login.html';
    }
}

// Cargar documentos desde localStorage
function loadDocuments() {
    const stored = localStorage.getItem('documents');
    if (stored) {
        documents = JSON.parse(stored);
    }
    
    const storedShared = localStorage.getItem('sharedDocuments');
    if (storedShared) {
        sharedDocuments = JSON.parse(storedShared);
    }
    
    const storedTrash = localStorage.getItem('trashDocuments');
    if (storedTrash) {
        trashDocuments = JSON.parse(storedTrash);
    }
    
    renderDocuments();
    renderSharedDocuments();
    renderTrashDocuments();
}

// Guardar documentos en localStorage
function saveDocuments() {
    localStorage.setItem('documents', JSON.stringify(documents));
    localStorage.setItem('sharedDocuments', JSON.stringify(sharedDocuments));
    localStorage.setItem('trashDocuments', JSON.stringify(trashDocuments));
}

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
    document.getElementById('closeSidebar').addEventListener('click', toggleSidebar);
    
    // Drag and drop para subir archivos
    const uploadArea = document.querySelector('#uploadForm label');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.closest('div').classList.add('border-primary', 'bg-primary', 'bg-opacity-5');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.closest('div').classList.remove('border-primary', 'bg-primary', 'bg-opacity-5');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.closest('div').classList.remove('border-primary', 'bg-primary', 'bg-opacity-5');
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
    }
}

// Configurar búsqueda
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterDocuments(e.target.value);
        });
    }
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

// Mostrar sección
function showSection(section) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section-content').forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Remover activo de todos los items del menú
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active', 'bg-primary', 'text-white');
        item.classList.add('text-gray-700', 'dark:text-gray-300');
    });
    
    // Mostrar sección seleccionada
    const sectionElement = document.getElementById(section + 'Section');
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
        sectionElement.classList.add('fade-in');
    }
    
    // Activar item del menú correspondiente
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item, index) => {
        const sections = ['documents', 'shared', 'trash', 'settings'];
        if (sections.indexOf(section) === index) {
            item.classList.add('active', 'bg-primary', 'text-white');
            item.classList.remove('text-gray-700', 'dark:text-gray-300');
        }
    });
    
    // Actualizar título
    const titles = {
        'documents': 'Mis Documentos',
        'shared': 'Documentos Compartidos',
        'trash': 'Papelera',
        'settings': 'Configuración'
    };
    document.getElementById('pageTitle').textContent = titles[section] || 'Gestor de Documentos';
    
    // Actualizar mensaje de bienvenida con contexto
    const welcomeMessages = {
        'documents': 'Gestiona todos tus documentos',
        'shared': 'Documentos compartidos contigo',
        'trash': 'Documentos eliminados',
        'settings': 'Configuración de tu cuenta'
    };
    const welcomeMessage = document.getElementById('welcomeMessage');
    const welcomeUserName = document.getElementById('welcomeUserName');
    
    if (welcomeMessage && section !== 'documents') {
        welcomeMessage.innerHTML = `<span class="text-gray-600 dark:text-gray-400">${welcomeMessages[section] || ''}</span>`;
    } else if (welcomeMessage && section === 'documents') {
        const userName = welcomeUserName ? welcomeUserName.textContent : 'Usuario';
        welcomeMessage.innerHTML = `<span class="font-semibold text-primary">¡Bienvenido, </span><span class="font-bold text-primary text-lg">${userName}</span><span class="font-semibold text-primary">!</span>`;
    }
    
    currentSection = section;
    
    // Cerrar sidebar en móvil después de seleccionar
    if (window.innerWidth < 1024) {
        toggleSidebar();
    }
}

// Cambiar vista (grid/list)
function changeView(view) {
    currentView = view;
    const gridBtn = document.getElementById('gridView');
    const listBtn = document.getElementById('listView');
    const documentsGrid = document.getElementById('documentsGrid');
    
    if (view === 'grid') {
        gridBtn.classList.add('bg-primary', 'text-white');
        gridBtn.classList.remove('text-gray-600', 'dark:text-gray-300');
        listBtn.classList.remove('bg-primary', 'text-white');
        listBtn.classList.add('text-gray-600', 'dark:text-gray-300');
        documentsGrid.classList.remove('flex', 'flex-col');
        documentsGrid.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
    } else {
        listBtn.classList.add('bg-primary', 'text-white');
        listBtn.classList.remove('text-gray-600', 'dark:text-gray-300');
        gridBtn.classList.remove('bg-primary', 'text-white');
        gridBtn.classList.add('text-gray-600', 'dark:text-gray-300');
        documentsGrid.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
        documentsGrid.classList.add('flex', 'flex-col');
    }
    
    renderDocuments();
}

// Ordenar documentos
function sortDocuments() {
    const sortBy = document.getElementById('sortSelect').value;
    
    documents.sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'date') {
            return new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'size') {
            return b.size - a.size;
        }
        return 0;
    });
    
    renderDocuments();
}

// Filtrar documentos
function filterDocuments(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        renderDocuments(documents);
        return;
    }
    
    const filtered = documents.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    renderDocuments(filtered);
}

// Renderizar documentos
function renderDocuments(docsToRender = documents) {
    const container = document.getElementById('documentsGrid');
    const emptyState = document.getElementById('emptyState');
    const documentCount = document.getElementById('documentCount');
    
    // Actualizar contador
    if (documentCount) {
        const count = docsToRender.length;
        documentCount.textContent = `${count} ${count === 1 ? 'documento' : 'documentos'}`;
    }
    
    if (docsToRender.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    if (currentView === 'grid') {
        container.innerHTML = docsToRender.map((doc, index) => createDocumentCard(doc, index)).join('');
    } else {
        container.innerHTML = docsToRender.map((doc, index) => createDocumentListItem(doc, index)).join('');
    }
    
    // Agregar animación stagger a los documentos
    const cards = container.querySelectorAll('.document-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;
        card.classList.add('stagger-animation');
    });
}

// Crear tarjeta de documento
function createDocumentCard(doc, index = 0) {
    const icon = getFileIcon(doc.type);
    const size = formatFileSize(doc.size);
    const date = formatDate(doc.date);
    
    return `
        <div class="document-card cursor-pointer group" onclick="openDocument('${doc.id}')" style="animation-delay: ${index * 0.05}s">
            <div class="flex flex-col h-full">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-4 flex-1 min-w-0">
                        <div class="text-5xl text-primary opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            ${icon}
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-gray-800 dark:text-white truncate mb-1 text-lg" title="${doc.name}">${doc.name}</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${size}</p>
                        </div>
                    </div>
                    <div class="relative flex-shrink-0">
                        <button onclick="event.stopPropagation(); showDocumentMenu('${doc.id}', event)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <i class="fas fa-ellipsis-v text-gray-500 dark:text-gray-400"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span class="flex items-center space-x-1">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${date}</span>
                        </span>
                        ${doc.shared ? '<span class="text-primary flex items-center space-x-1"><i class="fas fa-share-alt"></i><span>Compartido</span></span>' : '<span class="text-gray-400">Privado</span>'}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Crear item de lista de documento
function createDocumentListItem(doc, index = 0) {
    const icon = getFileIcon(doc.type);
    const size = formatFileSize(doc.size);
    const date = formatDate(doc.date);
    
    return `
        <div class="document-card cursor-pointer group" onclick="openDocument('${doc.id}')" style="animation-delay: ${index * 0.03}s">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 flex-1 min-w-0">
                    <div class="text-4xl text-primary opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        ${icon}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-semibold text-gray-800 dark:text-white truncate mb-1 text-base">${doc.name}</h3>
                        <div class="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                            <span class="flex items-center space-x-1">
                                <i class="fas fa-hdd"></i>
                                <span>${size}</span>
                            </span>
                            <span>•</span>
                            <span class="flex items-center space-x-1">
                                <i class="fas fa-calendar-alt"></i>
                                <span>${date}</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-3 flex-shrink-0">
                    ${doc.shared ? '<span class="text-primary"><i class="fas fa-share-alt"></i></span>' : ''}
                    <button onclick="event.stopPropagation(); showDocumentMenu('${doc.id}', event)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <i class="fas fa-ellipsis-v text-gray-500 dark:text-gray-400"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Mostrar menú de documento
function showDocumentMenu(docId, event) {
    event.stopPropagation();
    
    // Crear menú contextual
    const menu = document.createElement('div');
    menu.className = 'fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 min-w-[150px]';
    menu.style.top = event.pageY + 'px';
    menu.style.left = event.pageX + 'px';
    
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    
    menu.innerHTML = `
        <button onclick="editDocument('${docId}'); document.body.removeChild(this.closest('div'))" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <i class="fas fa-edit mr-2"></i>Editar
        </button>
        <button onclick="shareDocumentModal('${docId}'); document.body.removeChild(this.closest('div'))" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <i class="fas fa-share mr-2"></i>Compartir
        </button>
        <button onclick="deleteDocument('${docId}'); document.body.removeChild(this.closest('div'))" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400">
            <i class="fas fa-trash mr-2"></i>Eliminar
        </button>
    `;
    
    document.body.appendChild(menu);
    
    // Cerrar menú al hacer clic fuera
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
            document.removeEventListener('click', closeMenu);
        });
    }, 0);
}

// Abrir documento
function openDocument(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        // Crear un enlace temporal y simular clic para abrir/descargar el archivo
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.name;
        link.target = '_blank';
        
        // Intentar abrir en nueva pestaña (como administrador de archivos)
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification(`Abriendo: ${doc.name}`, 'success');
    }
}

// Modal: Subir documento
function showUploadModal() {
    document.getElementById('uploadModal').classList.remove('hidden');
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.add('hidden');
    document.getElementById('uploadForm').reset();
    document.getElementById('selectedFiles').innerHTML = '';
}

// Manejar selección de archivo
function handleFileSelect(event) {
    const files = event.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    const container = document.getElementById('selectedFiles');
    container.innerHTML = '';
    
    Array.from(files).forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg';
        fileDiv.innerHTML = `
            <div class="flex items-center space-x-2 flex-1 min-w-0">
                <i class="fas ${getFileIconClass(file.type)} text-primary"></i>
                <span class="text-sm text-gray-700 dark:text-gray-300 truncate">${file.name}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">${formatFileSize(file.size)}</span>
            </div>
        `;
        container.appendChild(fileDiv);
    });
}

// Subir documento
function uploadDocument(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Por favor selecciona al menos un archivo');
        return;
    }
    
    Array.from(files).forEach(file => {
        const newDoc = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            date: new Date().toISOString(),
            description: '',
            shared: false,
            url: URL.createObjectURL(file) // En una app real, esto sería la URL del servidor
        };
        
        documents.push(newDoc);
    });
    
    saveDocuments();
    renderDocuments();
    closeUploadModal();
    showNotification('Documento(s) subido(s) exitosamente', 'success');
}

// Editar documento
function editDocument(docId) {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    
    document.getElementById('editDocumentId').value = docId;
    document.getElementById('editDocumentName').value = doc.name;
    document.getElementById('editDocumentDescription').value = doc.description || '';
    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    document.getElementById('editForm').reset();
}

function saveDocument(event) {
    event.preventDefault();
    
    const docId = document.getElementById('editDocumentId').value;
    const name = document.getElementById('editDocumentName').value;
    const description = document.getElementById('editDocumentDescription').value;
    
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        doc.name = name;
        doc.description = description;
        saveDocuments();
        renderDocuments();
        closeEditModal();
        showNotification('Documento actualizado exitosamente', 'success');
    }
}

// Compartir documento
function shareDocumentModal(docId) {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    
    // Crear modal personalizado con opciones de compartir
    const modal = document.createElement('div');
    modal.id = 'customShareModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 fade-in">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">Compartir: ${doc.name}</h3>
                    <button onclick="closeCustomShareModal()" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
            </div>
            <div class="p-6">
                <!-- Compartir por Email -->
                <div class="mb-6">
                    <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        <i class="fas fa-envelope text-primary mr-2"></i>
                        Compartir por Email
                    </h4>
                    <form onsubmit="shareViaEmail('${docId}', event)" class="space-y-3">
                        <input type="email" id="shareEmailInput" placeholder="usuario@litoral.edu.co" 
                               class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" required>
                        <select id="sharePermissionInput" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="view">Solo lectura</option>
                            <option value="edit">Editar</option>
                        </select>
                        <button type="submit" class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition duration-200">
                            <i class="fas fa-paper-plane mr-2"></i>Enviar por Email
                        </button>
                    </form>
                </div>
                
                <!-- Compartir en Redes Sociales -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        <i class="fas fa-share-alt text-primary mr-2"></i>
                        Compartir en Redes Sociales
                    </h4>
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="shareToWhatsApp('${docId}')" class="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200">
                            <i class="fab fa-whatsapp text-xl"></i>
                            <span>WhatsApp</span>
                        </button>
                        <button onclick="shareToFacebook('${docId}')" class="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                            <i class="fab fa-facebook text-xl"></i>
                            <span>Facebook</span>
                        </button>
                        <button onclick="shareToTwitter('${docId}')" class="flex items-center justify-center space-x-2 px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition duration-200">
                            <i class="fab fa-twitter text-xl"></i>
                            <span>Twitter</span>
                        </button>
                        <button onclick="shareToLinkedIn('${docId}')" class="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition duration-200">
                            <i class="fab fa-linkedin text-xl"></i>
                            <span>LinkedIn</span>
                        </button>
                    </div>
                </div>
                
                <!-- Copiar enlace -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                    <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        <i class="fas fa-link text-primary mr-2"></i>
                        Copiar Enlace
                    </h4>
                    <div class="flex space-x-2">
                        <input type="text" id="shareLink" value="${window.location.origin}/document/${docId}" readonly
                               class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
                        <button onclick="copyShareLink()" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeCustomShareModal() {
    const modal = document.getElementById('customShareModal');
    if (modal) {
        modal.remove();
    }
}

function closeShareModal() {
    document.getElementById('shareModal').classList.add('hidden');
    document.getElementById('shareForm').reset();
}

function shareViaEmail(docId, event) {
    event.preventDefault();
    
    const email = document.getElementById('shareEmailInput').value;
    const permission = document.getElementById('sharePermissionInput').value;
    
    // Validar email
    if (!email.match(/@litoral\.edu\.co$/)) {
        showNotification('Solo se pueden compartir documentos con usuarios de @litoral.edu.co', 'error');
        return;
    }
    
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        doc.shared = true;
        
        // Agregar a documentos compartidos
        const sharedDoc = {
            ...doc,
            sharedWith: email,
            permission: permission,
            sharedDate: new Date().toISOString()
        };
        
        sharedDocuments.push(sharedDoc);
        saveDocuments();
        renderDocuments();
        renderSharedDocuments();
        
        // Simular envío de email
        const subject = `Documento compartido: ${doc.name}`;
        const body = `Se ha compartido contigo el documento "${doc.name}". Puedes accederlo en: ${window.location.origin}/document/${docId}`;
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
        
        closeCustomShareModal();
        showNotification(`Documento compartido con ${email}`, 'success');
    }
}

function shareToWhatsApp(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        const text = `Mira este documento: ${doc.name}\n${window.location.origin}/document/${docId}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        showNotification('Compartiendo en WhatsApp', 'success');
    }
}

function shareToFacebook(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/document/' + docId)}`;
        window.open(url, '_blank', 'width=600,height=400');
        showNotification('Compartiendo en Facebook', 'success');
    }
}

function shareToTwitter(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        const text = `Mira este documento: ${doc.name}`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin + '/document/' + docId)}`;
        window.open(url, '_blank', 'width=600,height=400');
        showNotification('Compartiendo en Twitter', 'success');
    }
}

function shareToLinkedIn(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/document/' + docId)}`;
        window.open(url, '_blank', 'width=600,height=400');
        showNotification('Compartiendo en LinkedIn', 'success');
    }
}

function copyShareLink() {
    const linkInput = document.getElementById('shareLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999); // Para móviles
    
    navigator.clipboard.writeText(linkInput.value).then(() => {
        showNotification('Enlace copiado al portapapeles', 'success');
    }).catch(() => {
        // Fallback para navegadores antiguos
        document.execCommand('copy');
        showNotification('Enlace copiado al portapapeles', 'success');
    });
}

// Eliminar documento
function deleteDocument(docId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) {
        return;
    }
    
    const docIndex = documents.findIndex(d => d.id === docId);
    if (docIndex !== -1) {
        const doc = documents[docIndex];
        documents.splice(docIndex, 1);
        
        // Mover a papelera
        trashDocuments.push({
            ...doc,
            deletedDate: new Date().toISOString()
        });
        
        saveDocuments();
        renderDocuments();
        renderTrashDocuments();
        showNotification('Documento eliminado', 'success');
    }
}

// Renderizar documentos compartidos
function renderSharedDocuments() {
    const container = document.getElementById('sharedDocuments');
    const emptyState = document.getElementById('emptySharedState');
    
    if (sharedDocuments.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    container.innerHTML = sharedDocuments.map((doc, index) => createDocumentCard(doc, index)).join('');
    
    // Agregar animación stagger
    const cards = container.querySelectorAll('.document-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;
        card.classList.add('stagger-animation');
    });
}

// Renderizar papelera
function renderTrashDocuments() {
    const container = document.getElementById('trashDocuments');
    const emptyState = document.getElementById('emptyTrashState');
    
    if (trashDocuments.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    container.innerHTML = trashDocuments.map((doc, index) => {
        const card = createDocumentCard(doc, index);
        return card.replace('showDocumentMenu', 'showTrashMenu');
    }).join('');
    
    // Agregar animación stagger
    const cards = container.querySelectorAll('.document-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;
        card.classList.add('stagger-animation');
    });
}

// Menú de papelera
function showTrashMenu(docId, event) {
    event.stopPropagation();
    
    const menu = document.createElement('div');
    menu.className = 'fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 min-w-[150px]';
    menu.style.top = event.pageY + 'px';
    menu.style.left = event.pageX + 'px';
    
    menu.innerHTML = `
        <button onclick="restoreDocument('${docId}'); document.body.removeChild(this.closest('div'))" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <i class="fas fa-undo mr-2"></i>Restaurar
        </button>
        <button onclick="permanentlyDeleteDocument('${docId}'); document.body.removeChild(this.closest('div'))" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400">
            <i class="fas fa-trash-alt mr-2"></i>Eliminar permanentemente
        </button>
    `;
    
    document.body.appendChild(menu);
    
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
            document.removeEventListener('click', closeMenu);
        });
    }, 0);
}

// Restaurar documento
function restoreDocument(docId) {
    const docIndex = trashDocuments.findIndex(d => d.id === docId);
    if (docIndex !== -1) {
        const doc = trashDocuments[docIndex];
        trashDocuments.splice(docIndex, 1);
        
        // Remover propiedades de eliminación
        delete doc.deletedDate;
        
        documents.push(doc);
        saveDocuments();
        renderDocuments();
        renderTrashDocuments();
        showNotification('Documento restaurado', 'success');
    }
}

// Eliminar permanentemente
function permanentlyDeleteDocument(docId) {
    if (!confirm('¿Estás seguro de que quieres eliminar permanentemente este documento? Esta acción no se puede deshacer.')) {
        return;
    }
    
    const docIndex = trashDocuments.findIndex(d => d.id === docId);
    if (docIndex !== -1) {
        trashDocuments.splice(docIndex, 1);
        saveDocuments();
        renderTrashDocuments();
        showNotification('Documento eliminado permanentemente', 'success');
    }
}

// Vaciar papelera
function emptyTrash() {
    if (!confirm('¿Estás seguro de que quieres vaciar la papelera? Esta acción no se puede deshacer.')) {
        return;
    }
    
    trashDocuments = [];
    saveDocuments();
    renderTrashDocuments();
    showNotification('Papelera vaciada', 'success');
}

// Cerrar sesión
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// Utilidades
function getFileIcon(type) {
    const icons = {
        'application/pdf': '<i class="fas fa-file-pdf"></i>',
        'image/jpeg': '<i class="fas fa-file-image"></i>',
        'image/png': '<i class="fas fa-file-image"></i>',
        'image/gif': '<i class="fas fa-file-image"></i>',
        'application/msword': '<i class="fas fa-file-word"></i>',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '<i class="fas fa-file-word"></i>',
        'application/vnd.ms-excel': '<i class="fas fa-file-excel"></i>',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '<i class="fas fa-file-excel"></i>',
        'text/plain': '<i class="fas fa-file-alt"></i>',
        'application/zip': '<i class="fas fa-file-archive"></i>'
    };
    return icons[type] || '<i class="fas fa-file"></i>';
}

function getFileIconClass(type) {
    const classes = {
        'application/pdf': 'fa-file-pdf',
        'image/jpeg': 'fa-file-image',
        'image/png': 'fa-file-image',
        'image/gif': 'fa-file-image',
        'application/msword': 'fa-file-word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-file-word',
        'application/vnd.ms-excel': 'fa-file-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fa-file-excel',
        'text/plain': 'fa-file-alt',
        'application/zip': 'fa-file-archive'
    };
    return classes[type] || 'fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
    } fade-in`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

