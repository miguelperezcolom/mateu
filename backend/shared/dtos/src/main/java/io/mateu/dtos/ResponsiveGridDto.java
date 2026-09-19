package io.mateu.dtos;

import lombok.Builder;

/**
 * One responsive grid — THE general layout foundation (coherence-plan #9). Children travel as the
 * component's children; this metadata carries the resolved CSS {@code grid-template-columns} (from
 * the tracks' hug/fixed/fill intent) and the gap. The renderer paints a {@code display:grid}.
 */
@Builder
public record ResponsiveGridDto(String gridTemplateColumns, String gap)
    implements ComponentMetadataDto {}
