package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.IconKey;
import lombok.Builder;

@Builder
public record Icon(IconKey icon) implements Component {}
