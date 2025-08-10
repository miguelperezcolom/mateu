package io.mateu.uidl.data;

import java.util.List;

public record Page<T>(int pageSize, int pageNumber, long totalElements, List<T> content) {}
