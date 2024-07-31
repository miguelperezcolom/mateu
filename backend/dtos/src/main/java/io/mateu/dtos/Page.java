package io.mateu.dtos;

import java.util.List;

public record Page(List<Object> content, long totalElements) {}
