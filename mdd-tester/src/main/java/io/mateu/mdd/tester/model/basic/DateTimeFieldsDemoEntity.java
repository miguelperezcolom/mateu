package io.mateu.mdd.tester.model.basic;

import io.mateu.mdd.core.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter@Setter
public class DateTimeFieldsDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String name;

    private LocalDate localDateField;

    @NotNull
    private LocalDateTime localDateTimeField;

    private LocalDate today = LocalDate.now();

    private LocalDateTime now = LocalDateTime.now();

}
