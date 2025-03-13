//const API_URL = "http://localhost:8080"
const API_URL = "http://192.168.1.72:8080"

// Cargar albumes al inicio
document.addEventListener("DOMContentLoaded", cargarAlbumes);

async function cargarAlbumes() {
    const response = await fetch(`${API_URL}/api/albumes`);
    const albumes = await response.json();
    const albumesList = document.getElementById("albumesList")

    albumesList.innerHTML = ""; // Limpiar lista
    albumes.forEach(album => {
        let option = document.createElement("option");
        option.value = album.id;
        option.textContent = album.nombre;
        albumesList.appendChild(option);
        
    });
} 

async function cargarFotos() {
    console.log("Se preciono el Boton")
    let albumId = document.getElementById("albumesList").value;
    if (!albumId) {
        alert("Selecciona un álbum.");
        return;
    }

    console.log("llamando al API  ", `${API_URL}/api/media/album/${albumId}`)
    let response = await fetch(`${API_URL}/api/media/album/${albumId}`);
    let archivos = await response.json();
    console.log("Respuesta del API  ", archivos)

    let gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    console.log("Inicia el FOR")
    archivos.forEach(archivo => {
        console.log("Inicio del Siclo")
        let contenedor = document.createElement("div");
        contenedor.classList.add("media-item");
        console.log("Condicion")

        if (archivo.tipo === "imagen") {
            console.log("TRUE")
            let img = document.createElement("img");
            img.src = API_URL + archivo.thumbnailUrl;
            img.alt = archivo.nombreArchivo;
            console.log("MEDIO TRUE")
            img.onclick = () => window.open(API_URL + archivo.url, "_blank");
            //img.onclick = () => mostrarLightbox(index); // Muestra el lightbox
            contenedor.appendChild(img);
        } else if (archivo.tipo === "video") {
            console.log("FALSE")
            let video = document.createElement("video");
            video.src = API_URL + archivo.url;
            video.controls = true;
            console.log("Medio FALSE")
            video.width = 200; // Ajusta el tamaño como prefieras
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
        cargarAlbumes(); // Actualizar lista de álbumes
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

    // 🔹 Ocultar botón y mostrar spinner
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
            cargarFotos(); // 🔹 Actualizar la galería
            inputFotos.value = "";
        } else {
            alert("Error al subir las fotos");
        }
    } catch (error) {
        console.error("Error al subir las fotos:", error);
        alert("Hubo un problema con la subida");
    } finally {
        // 🔹 Mostrar botón y ocultar spinner cuando termine
        uploadButton.style.display = "block";
        spinner.style.display = "none";
    }
}

