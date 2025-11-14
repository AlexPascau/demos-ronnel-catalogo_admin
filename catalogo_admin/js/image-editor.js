// Gestión de imágenes para productos
class ImageEditor {
    constructor() {
        this.imagenesTemporales = [];
        this.configurarEventos();
    }

    configurarEventos() {
        const addImageBtn = document.getElementById('addImageBtn');
        const imageUpload = document.getElementById('imageUpload');

        addImageBtn.addEventListener('click', () => {
            imageUpload.click();
        });

        imageUpload.addEventListener('change', (e) => {
            this.procesarImagenesSeleccionadas(e.target.files);
        });
    }

    procesarImagenesSeleccionadas(archivos) {
        Array.from(archivos).forEach(archivo => {
            if (archivo.type.startsWith('image/')) {
                this.agregarImagenTemporal(archivo);
            }
        });
    }

    agregarImagenTemporal(archivo) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imagenData = {
                id: Date.now() + Math.random(),
                url: e.target.result,
                archivo: archivo,
                esNueva: true
            };

            this.imagenesTemporales.push(imagenData);
            this.actualizarGaleria();
        };

        reader.readAsDataURL(archivo);
    }

    actualizarGaleria() {
        const gallery = document.getElementById('imageGallery');
        gallery.innerHTML = '';

        this.imagenesTemporales.forEach((imagen, index) => {
            const imageItem = this.crearElementoImagen(imagen, index);
            gallery.appendChild(imageItem);
        });
    }

    crearElementoImagen(imagen, index) {
        const div = document.createElement('div');
        div.className = 'image-item';
        
        div.innerHTML = `
            <img src="${imagen.url}" alt="Preview" class="image-preview">
            <div class="image-actions">
                <button type="button" onclick="imageEditor.eliminarImagenTemporal(${index})" title="Eliminar">
                    ×
                </button>
            </div>
        `;

        return div;
    }

    eliminarImagenTemporal(index) {
        this.imagenesTemporales.splice(index, 1);
        this.actualizarGaleria();
    }

    cargarImagenesProducto(producto) {
        this.imagenesTemporales = [];
        
        if (producto.imagenes) {
            producto.imagenes.forEach(imagenUrl => {
                this.imagenesTemporales.push({
                    id: Date.now() + Math.random(),
                    url: imagenUrl,
                    archivo: null,
                    esNueva: false
                });
            });
        }
        
        this.actualizarGaleria();
    }

    obtenerImagenesParaGuardar() {
        return this.imagenesTemporales.map(img => img.url);
    }

    limpiarTemporales() {
        this.imagenesTemporales = [];
        this.actualizarGaleria();
    }
}

// Instancia global del editor de imágenes
const imageEditor = new ImageEditor();