package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Bpmn(
        String xml,
    String style,
    String cssClasses)
    implements Component {

}
