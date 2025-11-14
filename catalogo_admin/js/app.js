// Configuración y estado global
const AppState = {
    productos: [],
    productoEditando: null,
    categorias: new Set(),
    filtros: {
        busqueda: '',
        categoria: 'all',
        orden: 'name'
    }
};

// Elementos DOM
const DOM = {
    productsList: document.getElementById('productsList'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    categoryFilter: document.getElementById('categoryFilter'),
    sortSelect: document.getElementById('sortSelect'),
    addProductBtn: document.getElementById('addProductBtn'),
    productModal: document.getElementById('productModal'),
    confirmModal: document.getElementById('confirmModal'),
    productForm: document.getElementById('productForm'),
    modalTitle: document.getElementById('modalTitle'),
    productId: document.getElementById('productId'),
    productName: document.getElementById('productName'),
    productCategory: document.getElementById('productCategory'),
    productPrice: document.getElementById('productPrice'),
    oldPrice: document.getElementById('oldPrice'),
    productDescription: document.getElementById('productDescription'),
    productSpecs: document.getElementById('productSpecs'),
    deleteProductBtn: document.getElementById('deleteProductBtn'),
    cancelBtn: document.getElementById('cancelBtn')
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
});

function inicializarApp() {
    cargarProductos();
    configurarEventListeners();
    actualizarEstadisticas();
}

function cargarProductos() {
    // Cargar desde localStorage o usar datos de ejemplo
    const productosGuardados = localStorage.getItem('catalogoProductos');
    
    if (productosGuardados) {
        AppState.productos = JSON.parse(productosGuardados);
    } else {
        // Datos de ejemplo
        AppState.productos = [
            {
                id: 1,
                nombre: "Laptop Empresarial Dell XPS",
                categoria: "Electrónicos",
                precio: 1299.99,
                precioAnterior: null,
                imagenes: ["./images/productos/laptop-empresarial.jpg"],
                descripcion: "Laptop de alto rendimiento para profesionales.",
                especificaciones: ["Procesador i7", "16GB RAM", "SSD 512GB"],
                fechaCreacion: new Date().toISOString(),
                fechaModificacion: new Date().toISOString()
            },
            {
                id: 2,
                nombre: "Silla Ejecutiva Ergonomica",
                categoria: "Oficina",
                precio: 349.50,
                precioAnterior: 399.99,
                imagenes: ["./images/productos/silla-ejecutiva.jpg"],
                descripcion: "Silla ergonómica para largas jornadas de trabajo.",
                especificaciones: ["Material de cuero", "Ajuste lumbar", "Reposabrazos"],
                fechaCreacion: new Date().toISOString(),
                fechaModificacion: new Date().toISOString()
            }
        ];
        guardarProductos();
    }
    
    actualizarCategorias();
    renderizarProductos(); // ¡ESTA ES LA FUNCIÓN QUE FALTABA!
}

function renderizarProductos() {
    const productosFiltrados = productManager.obtenerProductosFiltrados(AppState.filtros);
    const productsList = DOM.productsList;
    
    if (productosFiltrados.length === 0) {
        productsList.innerHTML = `
            <div class="no-products">
                <p>No se encontraron productos.</p>
                <button class="btn btn-primary" onclick="abrirModalNuevoProducto()">
                    ➕ Agregar primer producto
                </button>
            </div>
        `;
        return;
    }
    
    productsList.innerHTML = productosFiltrados.map(producto => `
        <div class="product-admin-card" data-product-id="${producto.id}">
            <div class="product-header">
                <div class="product-basic-info">
                    <div class="product-title">${producto.nombre}</div>
                    <span class="product-category">${producto.categoria}</span>
                </div>
                <div class="product-pricing">
                    <div class="current-price">$${producto.precio.toFixed(2)}</div>
                    ${producto.precioAnterior ? 
                        `<div class="old-price">$${producto.precioAnterior.toFixed(2)}</div>` : 
                        ''
                    }
                </div>
            </div>
            
            <div class="product-details">
                <div class="product-images-preview">
                    ${producto.imagenes && producto.imagenes.length > 0 ? 
                        producto.imagenes.slice(0, 3).map(img => `
                            <img src="${img}" alt="${producto.nombre}" class="product-image-thumb"
                                 onerror="this.src='./images/placeholder.jpg'">
                        `).join('') : 
                        '<div class="product-image-thumb" style="background: #f0f0f0; display: flex; align-items: center; justify-content: center;">📷</div>'
                    }
                    ${producto.imagenes && producto.imagenes.length > 3 ? 
                        `<div class="more-images">+${producto.imagenes.length - 3}</div>` : 
                        ''
                    }
                </div>
                
                <div class="product-info-text">
                    <div class="product-description">
                        ${producto.descripcion || 'Sin descripción'}
                    </div>
                    ${producto.especificaciones && producto.especificaciones.length > 0 ? `
                        <div class="product-specs">
                            <strong>Especificaciones:</strong> ${producto.especificaciones.join(', ')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="product-actions">
                    <button class="btn btn-secondary" onclick="editarProducto(${producto.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger" onclick="solicitarEliminarProducto(${producto.id})">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
            
            <div class="product-meta">
                <small>Modificado: ${new Date(producto.fechaModificacion).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
}

function actualizarCategorias() {
    AppState.categorias.clear();
    AppState.productos.forEach(producto => {
        AppState.categorias.add(producto.categoria);
    });
    
    DOM.categoryFilter.innerHTML = '<option value="all">Todas las categorías</option>';
    AppState.categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        DOM.categoryFilter.appendChild(option);
    });
}

function configurarEventListeners() {
    // Búsqueda y filtros
    DOM.searchInput.addEventListener('input', aplicarFiltros);
    DOM.searchBtn.addEventListener('click', aplicarFiltros);
    DOM.categoryFilter.addEventListener('change', aplicarFiltros);
    DOM.sortSelect.addEventListener('change', aplicarFiltros);
    
    // Modal de producto
    DOM.addProductBtn.addEventListener('click', abrirModalNuevoProducto);
    
    // Cerrar modales
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', cerrarModales);
    });
    
    // Confirmación de eliminación
    document.getElementById('confirmCancel').addEventListener('click', cerrarModales);
    document.getElementById('confirmDelete').addEventListener('click', confirmarEliminarProducto);
    
    // Formulario
    DOM.productForm.addEventListener('submit', guardarProducto);
    DOM.cancelBtn.addEventListener('click', cerrarModales);
    DOM.deleteProductBtn.addEventListener('click', solicitarEliminarProductoActual);
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            cerrarModales();
        }
    });
}

function aplicarFiltros() {
    AppState.filtros.busqueda = DOM.searchInput.value;
    AppState.filtros.categoria = DOM.categoryFilter.value;
    AppState.filtros.orden = DOM.sortSelect.value;
    
    renderizarProductos();
}

function abrirModalNuevoProducto() {
    DOM.modalTitle.textContent = 'Nuevo Producto';
    DOM.productForm.reset();
    DOM.productId.value = '';
    DOM.deleteProductBtn.style.display = 'none';
    
    imageEditor.limpiarTemporales();
    AppState.productoEditando = null;
    
    DOM.productModal.style.display = 'block';
}

function editarProducto(id) {
    const producto = productManager.obtenerProducto(id);
    if (!producto) return;
    
    AppState.productoEditando = producto;
    
    DOM.modalTitle.textContent = 'Editar Producto';
    DOM.productId.value = producto.id;
    DOM.productName.value = producto.nombre;
    DOM.productCategory.value = producto.categoria;
    DOM.productPrice.value = producto.precio;
    DOM.oldPrice.value = producto.precioAnterior || '';
    DOM.productDescription.value = producto.descripcion || '';
    DOM.productSpecs.value = producto.especificaciones ? producto.especificaciones.join(', ') : '';
    
    DOM.deleteProductBtn.style.display = 'block';
    
    imageEditor.cargarImagenesProducto(producto);
    DOM.productModal.style.display = 'block';
}

function guardarProducto(e) {
    e.preventDefault();
    
    const productoData = {
        nombre: DOM.productName.value,
        categoria: DOM.productCategory.value,
        precio: parseFloat(DOM.productPrice.value),
        precioAnterior: DOM.oldPrice.value ? parseFloat(DOM.oldPrice.value) : null,
        descripcion: DOM.productDescription.value,
        especificaciones: DOM.productSpecs.value.split(',').map(s => s.trim()).filter(s => s),
        imagenes: imageEditor.obtenerImagenesParaGuardar()
    };
    
    let productoGuardado;
    
    if (DOM.productId.value) {
        // Editar producto existente
        productoGuardado = productManager.editarProducto(parseInt(DOM.productId.value), productoData);
    } else {
        // Nuevo producto
        productoGuardado = productManager.agregarProducto(productoData);
    }
    
    if (productoGuardado) {
        cerrarModales();
        cargarProductos();
        actualizarEstadisticas();
        mostrarMensaje('Producto guardado correctamente', 'success');
    }
}

function solicitarEliminarProducto(id) {
    AppState.productoEditando = productManager.obtenerProducto(id);
    DOM.confirmModal.style.display = 'block';
}

function solicitarEliminarProductoActual() {
    if (AppState.productoEditando) {
        DOM.confirmModal.style.display = 'block';
    }
}

function confirmarEliminarProducto() {
    if (AppState.productoEditando) {
        const eliminado = productManager.eliminarProducto(AppState.productoEditando.id);
        if (eliminado) {
            cerrarModales();
            cargarProductos();
            actualizarEstadisticas();
            mostrarMensaje('Producto eliminado correctamente', 'success');
        }
    }
}

function cerrarModales() {
    DOM.productModal.style.display = 'none';
    DOM.confirmModal.style.display = 'none';
    AppState.productoEditando = null;
}

function actualizarEstadisticas() {
    const stats = productManager.getEstadisticas();
    document.getElementById('totalProducts').textContent = stats.total;
    document.getElementById('modifiedPrices').textContent = stats.preciosModificados;
    document.getElementById('multiImageProducts').textContent = stats.multiImagen;
}

function mostrarMensaje(mensaje, tipo = 'info') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensaje;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${tipo === 'success' ? '#27ae60' : '#3498db'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function guardarProductos() {
    localStorage.setItem('catalogoProductos', JSON.stringify(AppState.productos));
    productManager.actualizarCatalogoPublico();
}