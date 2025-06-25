package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record Grid(List<GridColumn> columns, Page<?> page, boolean tree) implements Component {}
