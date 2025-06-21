package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Avatar(String name, String abbreviation, String image) implements Component {}
