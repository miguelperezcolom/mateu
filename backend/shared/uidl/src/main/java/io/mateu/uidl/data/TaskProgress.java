package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A subtask completion banner (e.g. "pax 1/4 registered"): a {@code label}, {@code done}/{@code
 * total} pills (filled up to {@code done}) and a right-aligned button ({@code actionLabel} + {@code
 * actionId}, dispatched with no parameters; hidden when absent). When {@code done == total} the
 * banner tints success and hides the button. Design-system neutral, dark-mode aware.
 */
@Builder
public record TaskProgress(
    String id,
    String label,
    int total,
    int done,
    String actionLabel,
    String actionId,
    String style,
    String cssClasses)
    implements Component {}
