package com.example.bakend.service;

import com.example.bakend.model.Album;
import com.example.bakend.model.Media;
import com.example.bakend.repository.MediaRepository;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

@Service
public class FileStorageService {

    @Value("${app.storage.location}")  // 🔹 Se obtiene del application.properties
    private String storageLocation;

    @Autowired
    private MediaRepository mediaRepository;

    // ✅ Guardar varios archivos en un álbum
    /*
    public List<Media> saveFiles(Album album, List<MultipartFile> files) throws IOException {
        List<Media> savedFiles = new ArrayList<>();
        Path albumPath = Paths.get(storageLocation, album.getNombre());

        if (!Files.exists(albumPath)) {
            Files.createDirectories(albumPath);
        }

        for (MultipartFile file : files) {
            String newFileName = generateFileName(album, file);
            Path filePath = albumPath.resolve(newFileName);
            file.transferTo(filePath.toFile());

            // Generar miniatura si es una imagen
            if (file.getContentType().startsWith("image")) {
                createThumbnail(albumPath, newFileName);
            }

            // Crear objeto Media y agregarlo a la lista
            Media media = new Media();
            media.setNombreArchivo(newFileName);
            media.setTipo(file.getContentType().startsWith("image") ? "imagen" : "video");
            media.setRuta(filePath.toString());
            media.setAlbum(album);

            Media savedMedia = mediaRepository.save(media);
            savedFiles.add(savedMedia);
        }

        return savedFiles;
    } */
    public List<Media> saveFiles(Album album, List<MultipartFile> files) throws IOException {
        List<Media> savedFiles = new ArrayList<>();
        Path albumPath = Paths.get(storageLocation, album.getNombre());

        // Crear la carpeta del álbum si no existe
        if (!Files.exists(albumPath)) {
            Files.createDirectories(albumPath);
        }

        // 🚀 Paralelismo con Stream y Futures
        files.parallelStream().forEach(file -> {
            try {
                String hash = calculateFileHash(file);
                if (mediaRepository.findByHash(hash).isPresent()){
                    System.out.println("❗ Archivo duplicado, se omite: " + file.getOriginalFilename());
                    return;
                }

                String newFileName = generateFileName(album, file);
                Path filePath = albumPath.resolve(newFileName);

                // Usar el método con buffer
                saveFile(file, filePath);

                // Generar miniatura si es una imagen
                if (file.getContentType().startsWith("image")) {
                    createThumbnail(albumPath, newFileName);
                }

                // Crear objeto Media y guardar en la base de datos
                Media media = new Media();
                media.setNombreArchivo(newFileName);
                media.setTipo(file.getContentType().startsWith("image") ? "imagen" : "video");
                media.setRuta(filePath.toString());
                media.setHash(hash);
                media.setAlbum(album);

                // Sincronizado para garantizar la escritura segura en la lista
                synchronized (savedFiles) {
                    Media savedMedia = mediaRepository.save(media);
                    savedFiles.add(savedMedia);
                }
            } catch (IOException e) {
                System.err.println("❌ Error al guardar archivo: " + e.getMessage());
            }
        });

        return savedFiles;
    }

    // ✅ Eliminar archivo y miniatura
    public void deleteFile(Media media) throws IOException {
        Path filePath = Paths.get(storageLocation, media.getAlbum().getNombre(), media.getNombreArchivo());
        Path thumbnailPath = Paths.get(storageLocation, media.getAlbum().getNombre(), "thumbnails", getThumbnailName(media.getNombreArchivo()));

        Files.deleteIfExists(filePath);
        Files.deleteIfExists(thumbnailPath);
    }

    // 🔹 Generar nombre único para archivos
    /*
    private String generateFileName(Album album, MultipartFile file) {
        String fileExtension = getFileExtension(file.getOriginalFilename());
        int fileCount = new File(Paths.get(storageLocation, album.getNombre()).toString()).list().length + 1;
        return album.getNombre() + "_" + String.format("%03d", fileCount) + "." + fileExtension;
    } */
    private String generateFileName(Album album, MultipartFile file) {
        String fileExtension = getFileExtension(file.getOriginalFilename());
        String uniqueID = java.util.UUID.randomUUID().toString().substring(0, 8);  // Usar UUID
        return album.getNombre() + "_" + uniqueID + "." + fileExtension;
    }

    // 🔹 Obtener la extensión del archivo
    private String getFileExtension(String filename) {
        return filename.contains(".") ? filename.substring(filename.lastIndexOf(".") + 1) : "jpg";
    }

    // 🔹 Generar nombre de miniatura
    private String getThumbnailName(String fileName) {
        return fileName.replace(".", "_thumb.");
    }

    // ✅ Crear miniatura de imagen
    private void createThumbnail(Path albumPath, String fileName) throws IOException {
        Path thumbnailsPath = albumPath.resolve("thumbnails");
        if (!Files.exists(thumbnailsPath)) {
            Files.createDirectories(thumbnailsPath);
        }

        String thumbnailName = getThumbnailName(fileName);
        Path thumbnailPath = thumbnailsPath.resolve(thumbnailName);

        Thumbnails.of(albumPath.resolve(fileName).toFile())
                .size(200, 200)
                .toFile(thumbnailPath.toFile());
    }

    private void saveFile(MultipartFile file, Path destination) throws IOException {
        try (InputStream inputStream = file.getInputStream();
             OutputStream outputStream = Files.newOutputStream(destination)) {
            byte[] buffer = new byte[8192];  // 🔥 Tamaño de bloque de 8 KB
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
        }
    }

    // 🔑 Calcular el hash del archivo (SHA-256)
    private String calculateFileHash(MultipartFile file) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }
            byte[] hashBytes = digest.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IOException("Error al calcular el hash", e);
        }
    }

}
