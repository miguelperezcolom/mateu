package io.mateu.mdd.model.rpc;

import io.mateu.ui.mdd.server.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class StopSalesLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @SearchFilter
    @ManyToOne
    private Hotel hotel;

    @SearchFilter
    private LocalDate start;

    @SearchFilter
    @Column(name = "_end")
    private LocalDate end;

    private boolean onNormalInventory = true;
    private boolean onSecurityInventory;


    @SearchFilter
    @OneToMany
    private List<Room> rooms = new ArrayList<>();

}
