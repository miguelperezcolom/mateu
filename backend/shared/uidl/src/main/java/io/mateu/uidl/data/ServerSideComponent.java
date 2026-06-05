package io.mateu.uidl.data;

import io.mateu.dtos.*;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Trigger;
import java.util.List;
import lombok.Builder;

@Builder
public record ServerSideComponent(
    String id,
    String serverSideType,
    String route,
    List<Component> children,
    Object initialData,
    String style,
    String cssClasses,
    List<Action> actions,
    List<Trigger> triggers,
    List<Rule> rules,
    List<Validation> validations,
    String slot,
    String containerId,
    boolean confirmOnNavigationIfDirty)
    implements Component {}
