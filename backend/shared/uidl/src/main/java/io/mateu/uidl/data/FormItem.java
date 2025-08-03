package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record FormItem(String id, List<Component> content, String style, String cssClasses)
    implements Component {}
