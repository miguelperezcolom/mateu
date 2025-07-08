package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record TabLayout(String id, List<Tab> tabs, String style, String cssClasses)
    implements Component {}
