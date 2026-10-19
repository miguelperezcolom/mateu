package io.mateu.uidl.fluent;

import lombok.Builder;

/** Runs an action automatically, after a debounce delay, whenever the user changes a field. */
@Builder
public record AutoSaveTrigger(String actionId, int debounceMillis) implements Trigger {}
