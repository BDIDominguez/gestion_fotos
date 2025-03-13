package com.example.bakend.repository;

import com.example.bakend.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MediaRepository extends JpaRepository<Media, Long> {
    List<Media> findByAlbumId(long albumId);
    Optional<Media> findByHash(String hash);
}
