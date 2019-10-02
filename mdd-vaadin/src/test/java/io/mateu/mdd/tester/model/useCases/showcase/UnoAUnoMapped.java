package io.mateu.mdd.tester.model.useCases.showcase;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Entity@Getter@Setter
public class UnoAUnoMapped {

    @Id
    @GeneratedValue
    private long id;

    @OneToOne
    @NotNull
    private Showcase showcase;

    @NotEmpty
    private String nombre;

}
