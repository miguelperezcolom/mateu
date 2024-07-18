package io.mateu.core.application;

import java.util.List;

public record Page(List<Object> content, long totalElements) {}
