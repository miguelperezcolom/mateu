package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

/** A column header that groups several grid columns under a shared label. */
@Builder
public record GridGroupColumn(
    String id, String label, String style, String cssClasses, List<GridColumn> columns)
    implements GridContent {}
