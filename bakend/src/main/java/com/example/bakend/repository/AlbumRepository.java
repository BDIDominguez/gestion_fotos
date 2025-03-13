package com.example.bakend.repository;

import com.example.bakend.model.Album;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlbumRepository extends JpaRepository<Album, Long> {
    boolean existsByNombre(String nombre);

}
