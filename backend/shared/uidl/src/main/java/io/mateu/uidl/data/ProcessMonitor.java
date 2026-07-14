package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A monitored-automations health board: a bordered list of {@link ProcessItem} rows, each with a
 * colored status dot, the process name and involved systems, OK/warning/error counters and an
 * optional fix button dispatching the item's {@code actionId} with no parameters. Design-system
 * neutral, dark-mode aware.
 */
@Builder
public record ProcessMonitor(String id, List<ProcessItem> items, String style, String cssClasses)
    implements Component {}
