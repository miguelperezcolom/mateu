package io.mateu.mdd.tester.model.useCases.showcase;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Entity@Getter@Setter
public class UnoAMuchosMapped {

    @Id@GeneratedValue
    private long id;

    @ManyToOne@NotNull
    private Showcase showcase;

    @NotEmpty
    private String nombre;

}
