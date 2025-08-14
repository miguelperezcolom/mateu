package io.mateu.uidl.data;

import java.util.List;

public record Pageable(int page, int size, List<Sort> sort) {}
