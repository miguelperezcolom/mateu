package io.mateu.dtos;

import java.util.Map;

public record ServerSideObjectDto(String className, Map<String, Object> data) {}
