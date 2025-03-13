package com.example.bakend.controller;

import com.example.bakend.model.Album;
import com.example.bakend.repository.AlbumRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/albumes")
public class AlbumController {

    private final AlbumRepository albumRepository;

    public AlbumController(AlbumRepository albumRepository){
        this.albumRepository = albumRepository;
    }

    @GetMapping
    public List<Album> getAllAlbums(){
        return albumRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Album> createAlbum(@RequestBody Album album){
        if (albumRepository.existsByNombre(album.getNombre())){
            return ResponseEntity.badRequest().build();
        }
        Album nuevoAlbum = albumRepository.save(album);
        return ResponseEntity.ok(nuevoAlbum);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Album> getAlbumById(@PathVariable Long id){
        return albumRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(@PathVariable Long id){
        if (!albumRepository.existsById(id)){
            return ResponseEntity.notFound().build();
        }
        albumRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

} // Final de la Controlador
