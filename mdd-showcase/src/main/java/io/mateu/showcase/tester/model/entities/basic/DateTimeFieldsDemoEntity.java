package io.mateu.showcase.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.SearchFilter;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@MateuMDDEntity
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

    private Date javaUtilDate = new Date();

}
