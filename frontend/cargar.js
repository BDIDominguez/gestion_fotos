const API_URL = "http://192.168.1.72:8080";
let archivosNoDuplicados = [];
let archivosDuplicados = [];
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

// verificar archivos duplicados
async function verificarDuplicados() {
    const fileImput = document.getElementById("fileInput");
    const archivos = Array.from(fileInput.files);
    if (archivos.length === 0) return alert("Selecciona archivos primero");

    const spinner = document.getElementById("spinner");
    spinner.style.display = "block";

    // Calcular los hashes usando un web worker
    const worker = new Worker("hash_worker.js");
    worker.postMessage(archivos);

    worker.onmessage = async function (event) {
        const resultados = event.data;
        archivosNoDuplicados = resultados.filter(r => !hashesExistentes.includes(r.hash));
        archivosDuplicados = resultados.filter(r => hashesExistentes.includes(r.hash));
        mostrarDuplicados();
        spinner.style.display = "none";
        document.getElementById("uploadButton").style.display = "block";
        worker.terminate();
    };
    
}



// Mostrar archivos duplicados
/*
function mostrarDuplicados(){
    const gallery = document.getElementById("duplicadosGallery");
    gallery.innerHTML = "";

    archivosDuplicados.forEach(archivo => {
        let contenedor = document.createElement("div");
        contenedor.classList.add("media-item");

        let img = document.createElement("img");
        img.src = URL.createObjectURL(archivo.file);
        img.alt = archivo.file.name;
        contenedor.appendChild(img);

        let info = document.createElement("p");
        info.textContent = `Duplicado en album: ${archivo.album}`;
        contenedor.appendChild(info);

        gallery.appendChild(contenedor);
    })
} */

function mostrarDuplicados() {
    const duplicadosContainer = document.getElementById("duplicados");
    duplicadosContainer.innerHTML = "";

    if (archivosDuplicados.length === 0) {
        duplicadosContainer.innerHTML = "<p>No hay archivos duplicados.</p>";
        return;
    }

    archivosDuplicados.forEach((archivo) => {
        const div = document.createElement("div");
        div.classList.add("duplicado-item");

        // Encontrar el archivo original usando su nombre
        const file = Array.from(document.getElementById("fileInput").files).find(f => f.name === archivo.fileName);

        if (file) {
            const url = URL.createObjectURL(file);
            const img = document.createElement("img");
            img.src = url;
            img.alt = archivo.fileName;
            img.style.width = "100px";
            img.style.height = "100px";
            div.appendChild(img);
        }

        const nombre = document.createElement("p");
        nombre.textContent = archivo.fileName;
        div.appendChild(nombre);

        duplicadosContainer.appendChild(div);
    });
}


cargarHashesExistentes();