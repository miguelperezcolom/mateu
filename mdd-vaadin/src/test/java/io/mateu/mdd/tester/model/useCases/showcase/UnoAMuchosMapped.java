package io.mateu.mdd.tester.model.useCases.showcase;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class UnoAMuchosMapped {

    @Id@GeneratedValue
    private long id;

    @ManyToOne@NotNull
    private Showcase showcase;

    @NotEmpty
    private String nombre;

}
