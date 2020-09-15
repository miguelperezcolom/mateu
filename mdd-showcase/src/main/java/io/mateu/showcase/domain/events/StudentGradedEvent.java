package io.mateu.showcase.domain.events;

import io.mateu.mdd.core.eventBus.Event;
import lombok.Getter;

@Getter
public class StudentGradedEvent implements Event {

    private final long gradeId;

    public StudentGradedEvent(long gradeId) {
        this.gradeId = gradeId;
    }
}
