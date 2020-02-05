package io.mateu.mdd.tester.app.erp;

import lombok.MateuMDDEntity;

import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

@MateuMDDEntity
public class Mundo {

    @Id@NotEmpty
    private String id;

    @NotEmpty
    private String nombre;

    @ManyToMany
    private List<Pais> paises = new ArrayList<>();

}
