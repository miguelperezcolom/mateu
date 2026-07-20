package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A panel that slides in from a side of the viewport, overlaying the current page. Return one from
 * any action to open its {@code content} (typically a form) without leaving the page underneath.
 *
 * <p>Closes on the header button, on Esc, on a backdrop click (unless {@code modeless}), or when
 * the action run from inside it returns {@link UICommand#closeModal()}. Use {@link
 * UICommand#closeModal(String, Object)} to also emit a custom event on close so the host page can
 * refresh or receive a result via {@code @SubscribeTo}.
 */
@Builder
public record Drawer(
    String id,
    String headerTitle,
    String subtitle,
    Component header,
    Component content,
    Component footer,
    DrawerPosition position,
    String width,
    DrawerSize size,
    boolean maximizable,
    boolean collapsible,
    PeerNav peerNav,
    boolean noPadding,
    boolean modeless,
    String style,
    String cssClasses,
    Object initialData)
    implements Component {}
