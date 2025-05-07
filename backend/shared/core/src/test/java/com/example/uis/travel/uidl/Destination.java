package com.example.uis.travel.uidl;

import java.util.Map;

public record Destination(String path, Map<String, Object> parameters) {


    public Destination(String path) {
        this(path, Map.of());
    }

}
