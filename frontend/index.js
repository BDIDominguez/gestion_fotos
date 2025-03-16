//const API_URL = "http://localhost:8080"
const API_URL = "http://192.168.1.72:8080";

// Cargar álbumes al inicio
document.addEventListener("DOMContentLoaded", cargarAlbumes);

async function cargarAlbumes() {
    const response = await fetch(`${API_URL}/api/albumes`);
    const albumes = await response.json();
    const albumesList = document.getElementById("albumesList");

    albumesList.innerHTML = ""; // Limpiar lista
    albumes.forEach(album => {
        let option = document.createElement("option");
        option.value = album.id;
        option.textContent = album.nombre;
        albumesList.appendChild(option);
    });
}

async function cargarFotos() {
    let albumId = document.getElementById("albumesList").value;
    if (!albumId) {
        alert("Selecciona un álbum.");
        return;
    }

    let response = await fetch(`${API_URL}/api/media/album/${albumId}`);
    let archivos = await response.json();
    currentAlbum = archivos.slice();

    let gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    archivos.forEach((archivo, index) => {
        let contenedor = document.createElement("div");
        contenedor.classList.add("media-item");

        if (archivo.tipo === "imagen") {
            let img = document.createElement("img");
            img.src = API_URL + archivo.thumbnailUrl;
            img.alt = archivo.nombreArchivo;
            img.onclick = () => mostrarLightbox(index);
            contenedor.appendChild(img);
        } else if (archivo.tipo === "video") {
            let video = document.createElement("video");
            video.src = API_URL + archivo.url;
            video.controls = true;
            video.width = 200;
            video.onclick = () => mostrarLightbox(index);
            contenedor.appendChild(video);
        }
        gallery.appendChild(contenedor);
    });
}

async function crearAlbum() {
    let nombreAlbum = document.getElementById("nuevoAlbum").value;
    if (!nombreAlbum) return;

    const response = await fetch(`${API_URL}/api/albumes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreAlbum })
    });

    if (response.ok) {
        alert("Álbum creado con éxito");
        cargarAlbumes();
        document.getElementById("nuevoAlbum").value = "";
    } else {
        alert("Error al crear el álbum");
    }
}

async function subirFotos() {
    let albumId = document.getElementById("albumesList").value;
    let inputFotos = document.getElementById("inputFotos");
    let uploadButton = document.getElementById("uploadButton");
    let spinner = document.getElementById("spinner");

    if (!albumId || inputFotos.files.length === 0) {
        alert("Selecciona un álbum y al menos una foto.");
        return;
    }

    uploadButton.style.display = "none";
    spinner.style.display = "block";

    let formData = new FormData();
    for (let i = 0; i < inputFotos.files.length; i++) {
        formData.append("files", inputFotos.files[i]);
    }

    try {
        const response = await fetch(`${API_URL}/api/media/upload/${albumId}`, {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            alert("Fotos subidas con éxito");
            cargarFotos();
            inputFotos.value = "";
        } else {
            alert("Error al subir las fotos");
        }
    } catch (error) {
        console.error("Error al subir las fotos:", error);
        alert("Hubo un problema con la subida");
    } finally {
        uploadButton.style.display = "block";
        spinner.style.display = "none";
    }
}

/** Funciones para el visor de imágenes */
let currentImageIndex = 0;
let currentAlbum = [];
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");

function mostrarLightbox(index) {
    currentImageIndex = index;
    cargarLightbox();
    lightbox.style.display = "flex";
}

function cerrarLightbox(event) {
    if (event.target === lightbox || event.target.classList.contains("close")) {
        lightbox.style.display = "none";
    }
}

function navegar(direction, event) {
    event.stopPropagation(); // Evita que el evento se propague al lightbox
    currentImageIndex += direction;

    // Ajustar el índice para navegar de forma circular
    if (currentImageIndex < 0) currentImageIndex = currentAlbum.length - 1;
    if (currentImageIndex >= currentAlbum.length) currentImageIndex = 0;

    cargarLightbox();
}

function cargarLightbox() {
    const archivo = currentAlbum[currentImageIndex];
    const url = API_URL + archivo.url;

    lightboxImage.innerHTML = "";

    if (archivo.tipo === "imagen") {
        let img = document.createElement("img");
        img.src = url;
        img.alt = archivo.nombreArchivo;
        img.style.maxWidth = "90%";
        img.style.maxHeight = "80%";
        img.style.objectFit = "contain";
        lightboxImage.appendChild(img);
    } else if (archivo.tipo === "video") {
        let video = document.createElement("video");
        video.src = url;
        video.controls = true;
        video.autoplay = true;
        video.style.maxWidth = "90%";
        video.style.maxHeight = "80%";
        video.style.objectFit = "contain";
        lightboxImage.appendChild(video);
    }
}