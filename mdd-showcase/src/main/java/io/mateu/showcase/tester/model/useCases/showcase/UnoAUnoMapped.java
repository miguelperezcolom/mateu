package io.mateu.showcase.tester.model.useCases.showcase;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
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
