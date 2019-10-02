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
public class UnoAMuchos {

    @Id@GeneratedValue
    private long id;

    @NotEmpty
    private String nombre;

}
