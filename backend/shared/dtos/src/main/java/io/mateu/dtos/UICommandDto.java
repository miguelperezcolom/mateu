package io.mateu.dtos;

public record UICommandDto(String targetComponentId, UICommandTypeDto type, Object data) {}
