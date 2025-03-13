package com.example.bakend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/files")
public class FileController {

    @Value("${app.storage.location}")
    private String storageLocation;  // ✅ Se carga desde application.properties

    private String getContentType(Path filePath) throws Exception {
        return Files.probeContentType(filePath);
    }

    // ✅ Obtener archivo normal
    @GetMapping("/{album}/{filename}")
    public ResponseEntity<Resource> getFile(@PathVariable String album, @PathVariable String filename) {
        return serveFile(Paths.get(storageLocation, album, filename));
    }

    // ✅ Obtener miniatura (que ahora está dentro del álbum)
    @GetMapping("/{album}/thumbnails/{filename}")
    public ResponseEntity<Resource> getThumbnail(@PathVariable String album, @PathVariable String filename) {
        return serveFile(Paths.get(storageLocation, album, "thumbnails", filename));
    }

    // 🔹 Método reutilizable para servir archivos
    private ResponseEntity<Resource> serveFile(Path filePath) {
        try {
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = getContentType(filePath);
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath.getFileName().toString() + "\"")
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
