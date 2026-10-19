package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/** A set of tabs where selecting a tab shows its content. */
@Builder
public record TabLayout(
    String id,
    List<Tab> tabs,
    String style,
    String cssClasses,
    Orientation orientation,
    TabLayoutVariant variant,
    GroupRelationship groupRelationship,
    boolean adaptable)
    implements Component {}
