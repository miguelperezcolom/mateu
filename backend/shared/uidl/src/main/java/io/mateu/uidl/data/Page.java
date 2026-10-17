package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;
import lombok.With;

/**
 * One page of rows, as a {@code CrudStore} search returns it: the rows ({@code content}), the page
 * asked for ({@code pageNumber}, {@code pageSize}) and the total number of matching rows ({@code
 * totalElements}), which drives the pager — a database implementation runs the count and the page
 * queries and returns both here.
 */
@Builder
@With
public record Page<T>(
    String searchSignature, int pageSize, int pageNumber, long totalElements, List<T> content) {}
