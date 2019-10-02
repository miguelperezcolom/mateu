package io.mateu.mdd.tester.model.useCases.showcase;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.validation.constraints.NotEmpty;

@Entity@Getter@Setter
public class MuchosAUno {

    @Id@GeneratedValue
    private long id;

    @NotEmpty
    private String nombre;

}
