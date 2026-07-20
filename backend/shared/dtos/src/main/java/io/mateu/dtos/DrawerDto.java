package io.mateu.dtos;

import lombok.Builder;

/** Metadata for a side panel sliding in from an edge of the viewport */
@Builder
public record DrawerDto(
    String id,
    String headerTitle,
    String subtitle,
    ComponentDto header,
    ComponentDto content,
    ComponentDto footer,
    DrawerPositionDto position,
    String width,
    /** Standard drawer size ({@code "s"|"m"|"l"|"xl"}); {@code width} overrides it when set. */
    String size,
    /** When true, the drawer header shows a maximize button that bumps it to the next size up. */
    boolean maximizable,
    /**
     * Bottom drawer only: when true, a handle collapses the drawer to its header strip and expands
     * it back (the Redwood "expand/collapse" bottom-drawer behavior).
     */
    boolean collapsible,
    /** Previous/next peer-object arrows in the drawer header; null when none. */
    PeerNavDto peerNav,
    boolean noPadding,
    boolean modeless,
    Object initialData)
    implements ComponentMetadataDto {}
