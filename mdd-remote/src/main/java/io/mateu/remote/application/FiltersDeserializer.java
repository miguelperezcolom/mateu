package io.mateu.remote.application;

import java.util.Map;

public class FiltersDeserializer {

    private final String raw;

    public FiltersDeserializer(String raw) {
        this.raw = raw;
    }

    public Map<String, Object> deserialize() {
        return Map.of();
    }
}
