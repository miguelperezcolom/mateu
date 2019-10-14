package io.mateu.mdd.core.model.config;

import lombok.MateuMDDEntity;

import javax.persistence.Id;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Created by miguel on 18/4/17.
 */
@MateuMDDEntity
public class DummyDate {

    @Id
    private LocalDate value;

    private LocalDateTime pickupTimeInformed;

    public DummyDate() {

    }

    public DummyDate(LocalDate date) {
        value = date;
    }
}
