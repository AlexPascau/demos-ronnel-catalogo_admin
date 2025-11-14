// Gestión completa de productos
class ProductManager {
    constructor() {
        this.productos = [];
    }

    agregarProducto(productoData) {
        const nuevoProducto = {
            id: Date.now(),
            ...productoData,
            fechaCreacion: new Date().toISOString(),
            fechaModificacion: new Date().toISOString()
        };
        
        this.productos.push(nuevoProducto);
        this.guardar();
        return nuevoProducto;
    }

    editarProducto(id, productoData) {
        const index = this.productos.findIndex(p => p.id === id);
        if (index !== -1) {
            this.productos[index] = {
                ...this.productos[index],
                ...productoData,
                fechaModificacion: new Date().toISOString()
            };
            this.guardar();
            return this.productos[index];
        }
        return null;
    }

    eliminarProducto(id) {
        const index = this.productos.findIndex(p => p.id === id);
        if (index !== -1) {
            this.productos.splice(index, 1);
            this.guardar();
            return true;
        }
        return false;
    }

    cambiarPrecio(id, nuevoPrecio, precioAnterior = null) {
        const producto = this.obtenerProducto(id);
        if (producto) {
            return this.editarProducto(id, {
                precio: nuevoPrecio,
                precioAnterior: precioAnterior || producto.precio
            });
        }
        return null;
    }

    agregarImagen(id, imagenUrl) {
        const producto = this.obtenerProducto(id);
        if (producto) {
            if (!producto.imagenes) producto.imagenes = [];
            producto.imagenes.push(imagenUrl);
            return this.editarProducto(id, { imagenes: producto.imagenes });
        }
        return null;
    }

    eliminarImagen(id, imagenIndex) {
        const producto = this.obtenerProducto(id);
        if (producto && producto.imagenes[imagenIndex]) {
            producto.imagenes.splice(imagenIndex, 1);
            return this.editarProducto(id, { imagenes: producto.imagenes });
        }
        return null;
    }

    obtenerProducto(id) {
        return this.productos.find(p => p.id === id);
    }

    obtenerProductosFiltrados(filtros = {}) {
        let productosFiltrados = [...this.productos];

        // Aplicar filtros
        if (filtros.busqueda) {
            const busqueda = filtros.busqueda.toLowerCase();
            productosFiltrados = productosFiltrados.filter(p => 
                p.nombre.toLowerCase().includes(busqueda) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(busqueda))
            );
        }

        if (filtros.categoria && filtros.categoria !== 'all') {
            productosFiltrados = productosFiltrados.filter(p => 
                p.categoria === filtros.categoria
            );
        }

        // Aplicar ordenamiento
        if (filtros.orden) {
            switch (filtros.orden) {
                case 'name':
                    productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
                    break;
                case 'price':
                    productosFiltrados.sort((a, b) => a.precio - b.precio);
                    break;
                case 'recent':
                    productosFiltrados.sort((a, b) => 
                        new Date(b.fechaModificacion) - new Date(a.fechaModificacion)
                    );
                    break;
            }
        }

        return productosFiltrados;
    }

    guardar() {
        localStorage.setItem('catalogoProductos', JSON.stringify(this.productos));
        this.actualizarCatalogoPublico();
    }

    actualizarCatalogoPublico() {
        // Crear estructura para el catálogo público
        const catalogoPublico = this.productos.map(producto => ({
            id: producto.id,
            nombre: producto.nombre,
            categoria: producto.categoria,
            precio: producto.precio,
            precioAnterior: producto.precioAnterior,
            imagenes: producto.imagenes || [],
            descripcion: producto.descripcion,
            especificaciones: producto.especificaciones || []
        }));

        // Guardar en localStorage para que el catálogo público lo lea
        localStorage.setItem('catalogoPublico', JSON.stringify(catalogoPublico));
        
        console.log('✅ Catálogo público actualizado:', catalogoPublico);
    }

    getEstadisticas() {
        const total = this.productos.length;
        const preciosModificados = this.productos.filter(p => p.precioAnterior).length;
        const multiImagen = this.productos.filter(p => p.imagenes && p.imagenes.length > 1).length;

        return { total, preciosModificados, multiImagen };
    }
}

// Instancia global del gestor de productos
const productManager = new ProductManager();