package io.mateu.showcase.domain.boundedContexts.educational.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import io.mateu.mdd.core.eventBus.EventBus;
import io.mateu.showcase.domain.events.QuarterEndedEvent;
import io.mateu.showcase.domain.events.QuarterStartedEvent;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.List;

@MateuMDDEntity
@JsonIdentityInfo(generator = ObjectIdGenerators.StringIdGenerator.class, property = "@id")
public class Quarter {

    private transient boolean statusChanged = false;

    @ManyToOne@NotNull
    private final AcademicCourse course;

    private String name;

    @OneToMany
    private List<Grade> grades;

    @NotNull@Enumerated(EnumType.STRING)
    private QuarterStatus status = QuarterStatus.Pending;

    public void setStatus(QuarterStatus status) {
        if (!this.status.equals(status)) statusChanged = true;
        this.status = status;
    }

    @PostPersist@PostUpdate
    public void post() {
        if (statusChanged) {
            if (QuarterStatus.Working.equals(status)) EventBus.publish(new QuarterStartedEvent(id));
            if (QuarterStatus.Completed.equals(status)) EventBus.publish(new QuarterEndedEvent(id));
        }
    }

}
