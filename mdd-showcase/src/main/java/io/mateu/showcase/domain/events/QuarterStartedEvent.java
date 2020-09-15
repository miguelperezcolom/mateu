package io.mateu.showcase.domain.events;

import io.mateu.mdd.core.eventBus.Event;
import lombok.Getter;

@Getter
public class QuarterStartedEvent implements Event {

    private final long quarterId;

    public QuarterStartedEvent(long quarterId) {
        this.quarterId = quarterId;
    }
}
