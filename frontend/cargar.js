const API_URL = "http://192.168.1.72:8080";
let listaArchivos = [];
let hashesExistentes = [];

// Obtener todos los hashes existentes desde el backend
async function cargarHashesExistentes() {
    try {
        const response = await fetch(`${API_URL}/api/media/hashes`);
        if (response.ok){
            hashesExistentes = await response.json();
            console.log("Hashes cargados: ", hashesExistentes);
        }else{
            console.error("Error al cargar hashes");
        }
    } catch (error) {
        console.error("Error de conexion al cargar hashes: ", error)
    }
}

async function verificarDuplicados() {
    const spinner = document.getElementById("spinner");
    spinner.style.display = "block";

    const fileInput = document.getElementById("fileInput");
    const archivos = Array.from(fileInput.files);
    if (archivos.length === 0) return alert("Seleccione archivos primeros")
    if (hashesExistentes.length === 0) {
        await cargarHashesExistentes();
    }
    const gallery = document.getElementById("duplicadosGallery");
    gallery.innerHTML = ""; // Limpiar la galería

    for (const archivo of archivos){
        let hash = await calcularHash(archivo);
        let encontrado = hashesExistentes.includes(hash);
        let objetoArchivo = {file:archivo, hash: hash, repetido: encontrado} 
        listaArchivos.push(objetoArchivo);
        if (encontrado){
            // mostrar imagen en el navegador
            mostrarDuplicado(objetoArchivo);
        }
    }
    spinner.style.display = "none";
    // document.getElementById("uploadButton").style.display = "block";
    // mostrarDuplicados()

}   
     

async function mostrarDuplicado(archivo){
    try {
        console.log("URL ", `${API_URL}/api/media/existe/${archivo.hash}`)
        const response = await fetch(`${API_URL}/api/media/existe/${archivo.hash}`);
        if (!response.ok) throw new Error("No se pudo obtener la informacion del duplicado");
        const gallery = document.getElementById("duplicadosGallery");
        const data = await response.json();
        const servidorUrl = API_URL + data.url;
        console.log("Ruta del archivo ", API_URL + data.url)
        
        // Crear el contenedor de la comparacion
        const contenedor = document.createElement("div");
        contenedor.classList.add("duplicado-item");

        const titulo = document.createElement("p");
        titulo.textContent = `Archivo Duplicado: ${archivo.file.name} - Nombre en el Servidor: ${data.nombreArchivo}`;
        contenedor.appendChild(titulo);

        // contenedor de las vistas lado a lado
        const comparacion = document.createElement("div");
        comparacion.classList.add("comparacion");

        // Vista Local
        if (archivo.file.type.startsWith("image")){
            const imagenLocal = document.createElement("img");
            imagenLocal.src = URL.createObjectURL(archivo.file);
            imagenLocal.alt = "imagen Local" 
            imagenLocal.classList.add("imagen-duplicada");
            comparacion.appendChild(imagenLocal);
        }else if(archivo.file.type.startsWith("video")){
            const videoLocal = document.createElement("video");
            videoLocal.src = URL.createObjectURL(archivo.file);
            videoLocal.alt = "Video Local";
            videoLocal.controls = true;
            videoLocal.classList.add("imagen-duplicada");
            comparacion.appendChild(videoLocal);
        }
        // Vista Servidor
        if (data.tipo === "imagen") {
            const imagenServidor = document.createElement("img");
            imagenServidor.src = servidorUrl;
            imagenServidor.alt = "Imagen Servidor";
            imagenServidor.classList.add("imagen-duplicada");
            comparacion.appendChild(imagenServidor);
        } else if (data.tipo === "video") {
            const videoServidor = document.createElement("video");
            videoServidor.src = servidorUrl;
            videoServidor.alt = "Video Servidor";
            videoServidor.controls = true;
            videoServidor.classList.add("imagen-duplicada");
            comparacion.appendChild(videoServidor);
        }
        // Añadir comparación al contenedor
        contenedor.appendChild(comparacion);
        gallery.appendChild(contenedor);
    } catch (error) {
        console.error("Error al obtener la imagen o video del servidor: ",error);
    }

}

function calcularHash(archivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            const buffer = e.target.result;
            crypto.subtle.digest("SHA-256", buffer).then((hashBuffer) => {
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
                resolve(hashHex);
            }).catch(err => reject(err));
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(archivo);
    });
}
