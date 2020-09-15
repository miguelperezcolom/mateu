package io.mateu.showcase.domain.events;

import io.mateu.mdd.core.eventBus.Event;
import lombok.Getter;

@Getter
public class QuarterEndedEvent implements Event {

    private final long quarterId;

    public QuarterEndedEvent(long quarterId) {
        this.quarterId = quarterId;
    }
}
