package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.UserTrigger;
import java.util.List;
import lombok.Builder;

/** A group of buttons shown together, usually collapsed into a single dropdown trigger. */
@Builder
public record ButtonGroup(
    String id,
    String label,
    String iconOnLeft,
    String iconOnRight,
    boolean separatorBefore,
    List<Button> buttons)
    implements Component, UserTrigger {}
