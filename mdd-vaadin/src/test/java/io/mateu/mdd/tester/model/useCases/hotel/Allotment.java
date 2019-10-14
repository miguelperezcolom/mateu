package io.mateu.mdd.tester.model.useCases.hotel;

import io.mateu.mdd.core.annotations.WeekDays;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@MateuMDDEntity
public class Allotment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @ManyToOne
    private Hotel hotel;

    @ManyToOne@NotNull
    private Room room;

    @Column(name = "_start")
    private LocalDate start;

    @Column(name = "_end")
    private LocalDate end;

    private int available;

    @WeekDays
    private boolean[] weekDays = {true, true, true, true, true, true, true};



}
