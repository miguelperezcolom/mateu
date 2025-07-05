package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.HasContent;
import java.util.List;
import lombok.Builder;

@Builder
public record BoardLayoutRow(List<Component> content) implements Component, HasContent {}
