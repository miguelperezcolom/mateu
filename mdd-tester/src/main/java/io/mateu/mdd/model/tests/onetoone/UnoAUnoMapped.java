package io.mateu.mdd.model.tests.onetoone;

import io.mateu.ui.mdd.server.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Getter
@Setter
public class UnoAUnoMapped {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotNull
    @SearchFilter
    private String name;

    @OneToOne
    private UnoAUnoMapper mapper;
}
