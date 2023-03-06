package io.mateu.remote.application;

import io.mateu.remote.dtos.SortCriteria;

import java.util.List;

public class OrderingDeserializer {

    private final String raw;

    public OrderingDeserializer(String raw) {
        this.raw = raw;
    }

    public List<SortCriteria> deserialize() {
        return List.of();
    }
}
