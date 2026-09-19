package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/**
 * One responsive grid — THE general layout foundation (coherence-plan #9). Children travel as the
 * component's children; this metadata carries the resolved CSS {@code grid-template-columns} (from
 * the tracks' hug/fixed/fill intent), the gap, and an optional per-child column span ({@code
 * colSpans}, aligned with the children). The renderer paints a {@code display:grid} and wraps a
 * spanning child with {@code grid-column: span N}.
 */
@Builder
public record ResponsiveGridDto(String gridTemplateColumns, String gap, List<Integer> colSpans)
    implements ComponentMetadataDto {}
