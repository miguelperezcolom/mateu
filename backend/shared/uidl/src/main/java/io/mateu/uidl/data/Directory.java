package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import java.util.List;
import lombok.Builder;

@Builder
public record Directory(List<Actionable> menu, String style, String cssClasses)
    implements Component {}
