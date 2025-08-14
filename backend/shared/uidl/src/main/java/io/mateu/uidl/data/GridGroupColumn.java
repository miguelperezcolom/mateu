package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

@Builder
public record GridGroupColumn(
    String id, String label, String style, String cssClasses, List<GridColumn> columns)
    implements GridContent {}
