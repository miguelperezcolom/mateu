package io.mateu.uidl.fluent;

import lombok.Builder;

@Builder
public record AutoSaveTrigger(String actionId, int debounceMillis)
        implements Trigger {
}
