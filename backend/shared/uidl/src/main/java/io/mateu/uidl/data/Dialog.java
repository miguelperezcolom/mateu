package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** A modal dialog with optional header, content and footer, opened over the current page. */
@Builder
public record Dialog(
    String id,
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
    String cssClasses,
    Object initialData)
    implements Component {}
