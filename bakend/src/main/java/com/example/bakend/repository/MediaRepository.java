package com.example.bakend.repository;

import com.example.bakend.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MediaRepository extends JpaRepository<Media, Long> {
    List<Media> findByAlbumId(long albumId);
    Optional<Media> findByHash(String hash);
    @Query("SELECT m.hash FROM Media m")
    List<String> findAllHash();
}
