package io.mateu.dtos;

import java.util.List;

public record Items(List<Value> content, long totalElements) {}
