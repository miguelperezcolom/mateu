package io.mateu.mdd.model.tests.view;

import io.mateu.ui.core.shared.UserData;
import io.mateu.ui.mdd.server.interfaces.Filtered;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotNull
    private String leadName;

    @Column(name = "_user")
    private String user;

    @Column(name = "_start")
    private LocalDate start;

    @Column(name = "_end")
    private LocalDate end;

    private int pax;

    private LocalDateTime formalized;

    private String confirmed;

    private boolean cancelled;

    private double sale;

    private double cost;

    private String currencyCode;


}
