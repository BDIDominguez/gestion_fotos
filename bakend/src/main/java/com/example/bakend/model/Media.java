package com.example.bakend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "media")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Media {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombreArchivo;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private String ruta;

    @Column(nullable = false, unique = true)
    private String hash; // para evitar subir 2 veces la misma foto

    @ManyToOne
    @JoinColumn(name = "album_id", nullable = false)
    @JsonBackReference
    private Album album;

    public String getUrl(){
        return "/files/" + album.getNombre().replace(" ", "%20") + "/" + nombreArchivo.replace(" ", "%20");
    }

    public String getThumbnailUrl(){
        return "/files/"
                + album.getNombre().replace(" ", "%20") + "/thumbnails/"
                + nombreArchivo.replace(" ","%20").replace(".", "_thumb.");
    }

}
