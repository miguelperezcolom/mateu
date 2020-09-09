package io.mateu.showcase.tester.app.club.model;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.validation.constraints.NotEmpty;

@MateuMDDEntity
public class TPV {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotEmpty
    private String nombre;
}
