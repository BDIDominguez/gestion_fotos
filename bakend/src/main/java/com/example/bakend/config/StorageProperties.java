package com.example.bakend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StorageProperties {
    @Value("${app.storage.location}")
    private String storageLocation;

    public String getStorageLocation() {
        return storageLocation;
    }
}
