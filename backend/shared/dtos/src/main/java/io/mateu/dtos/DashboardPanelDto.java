package io.mateu.dtos;

import lombok.Builder;

/** Titled dashboard tile. The wrapped component travels as the component's single child */
@Builder
public record DashboardPanelDto(String title, String subtitle, int colSpan, int rowSpan)
    implements ComponentMetadataDto {}
