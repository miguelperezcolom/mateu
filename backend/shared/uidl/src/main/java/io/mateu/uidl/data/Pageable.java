package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

@Builder
public record Pageable(int page, int size, List<Sort> sort) {}
