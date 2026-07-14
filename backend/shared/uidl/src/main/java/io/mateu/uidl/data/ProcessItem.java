package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

/**
 * One monitored process of a {@link ProcessMonitor}: a health dot ({@code status}: {@code ok},
 * {@code warning} or {@code error}), the process {@code name} with the involved {@code systems}
 * joined below, the {@code ok}/{@code warnings}/{@code errors} counters (warnings/errors only shown
 * when &gt; 0) and an optional fix button ({@code actionLabel} + {@code actionId}, no parameters).
 */
@Builder
public record ProcessItem(
    String id,
    String name,
    List<String> systems,
    int ok,
    int warnings,
    int errors,
    String status,
    String actionLabel,
    String actionId) {}
