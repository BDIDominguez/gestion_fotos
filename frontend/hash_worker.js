self.onmessage = async (event) => {
    const archivos = event.data;
    let resultados = [];

    for (const file of archivos) {
        try {
            const hash = await calcularHash(file);
            resultados.push({ fileName: file.name, hash });
        } catch (error) {
            resultados.push({ fileName: file.name, hash: null, error: error.message });
        }
    }

    // Enviar todos los resultados juntos como un array
    self.postMessage(resultados);
};

function calcularHash(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const buffer = e.target.result;
            sha256(buffer).then((hash) => resolve(hash));
        };
        reader.readAsArrayBuffer(file);
    });
}

function sha256(buffer) {
    return crypto.subtle.digest("SHA-256", buffer).then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
        return hashHex;
    });
}