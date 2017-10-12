package io.mateu.mdd.model.finnancials;


import io.mateu.ui.mdd.server.annotations.OwnedList;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    private Actor actor;

    private LocalDate date;

    private double total;

    @OneToMany
    @OwnedList
    private List<InvoiceLine> lines = new ArrayList<>();

}
