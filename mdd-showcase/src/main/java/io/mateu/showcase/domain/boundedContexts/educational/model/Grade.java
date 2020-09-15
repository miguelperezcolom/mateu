package io.mateu.showcase.domain.boundedContexts.educational.model;

import io.mateu.mdd.core.eventBus.EventBus;
import io.mateu.showcase.domain.events.StudentGradedEvent;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@MateuMDDEntity
public class Grade {

    @ManyToOne
    private final Quarter quarter;

    @ManyToOne
    private final Teacher teacher;

    @NotNull
    private final LocalDate date = LocalDate.now();

    @ManyToOne
    private final Student student;

    @Enumerated(EnumType.STRING)
    @NotNull
    private GradeValue value;

    @PostPersist
    @PostUpdate@PostRemove
    public void post() {
        EventBus.publish(new StudentGradedEvent(id));
    }

}
