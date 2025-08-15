package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Dialog(
    String headerTitle,
    Component header,
    Component content,
    Component footer,
    boolean noPadding,
    boolean modeless,
    String top,
    String left,
    boolean draggable,
    String width,
    String height,
    boolean resizable,
    boolean closeButtonOnHeader,
    String style,
    String cssClasses)
    implements Component {}
