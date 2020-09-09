package io.mateu.mdd.tester.model.entities.specialFields;

import io.mateu.mdd.core.annotations.WeekDays;
import lombok.MateuMDDEntity;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
public class WeekdaysFieldEntity {

    @Id@GeneratedValue
    private long id;

    private String name;

    @WeekDays
    private boolean[] weekDays;

}
