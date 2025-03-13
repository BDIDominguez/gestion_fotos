package com.example.bakend.controller;

import com.example.bakend.model.Album;
import com.example.bakend.model.Media;
import com.example.bakend.repository.AlbumRepository;
import com.example.bakend.repository.MediaRepository;
import com.example.bakend.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaRepository mediaRepository;
    private final AlbumRepository albumRepository;
    private final FileStorageService fileStorageService;

    public MediaController(MediaRepository mediaRepository, AlbumRepository albumRepository, FileStorageService fileStorageService) {
        this.mediaRepository = mediaRepository;
        this.albumRepository = albumRepository;
        this.fileStorageService = fileStorageService;
    }

    // ✅ Obtener TODAS las fotos y videos de un álbum
    @GetMapping("/album/{albumId}")
    public ResponseEntity<List<Media>> getMediaByAlbum(@PathVariable Long albumId) {
        List<Media> mediaList = mediaRepository.findByAlbumId(albumId);
        return ResponseEntity.ok(mediaList);
    }

    // ✅ Subir fotos/videos a un álbum
    @PostMapping("/upload/{albumId}")
    public ResponseEntity<List<Media>> uploadFiles(@PathVariable Long albumId, @RequestParam("files") List<MultipartFile> files) {
        Optional<Album> albumOpt = albumRepository.findById(albumId);
        if (albumOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Album album = albumOpt.get();

        try {
            List<Media> savedMediaList = fileStorageService.saveFiles(album, files);
            return ResponseEntity.ok(savedMediaList);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ✅ Eliminar un archivo
    @DeleteMapping("/{mediaId}")
    public ResponseEntity<Void> deleteMedia(@PathVariable Long mediaId) {
        Optional<Media> mediaOpt = mediaRepository.findById(mediaId);
        if (mediaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Media media = mediaOpt.get();

        try {
            fileStorageService.deleteFile(media);
            mediaRepository.delete(media);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
