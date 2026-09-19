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
public record ResponsiveGridDto(
    String gridTemplateColumns,
    String gap,
    List<Integer> colSpans,
    String stackBelow,
    /**
     * A CSS grid-template-areas value (coherence-plan #7): children are placed into named areas by
     * their {@code slot}. Null = no named areas.
     */
    String gridTemplateAreas,
    /**
     * Named areas pinned with {@code position: sticky} while the rest of the grid scrolls
     * (coherence -plan #7). A child whose {@code slot} is listed here gets a sticky wrapper.
     * Null/empty = none.
     */
    List<String> stickyAreas)
    implements ComponentMetadataDto {}
