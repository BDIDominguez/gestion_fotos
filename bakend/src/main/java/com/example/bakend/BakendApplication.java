package com.example.bakend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync // Habilitar ejecución asincrónica
public class BakendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BakendApplication.class, args);
	}

}
