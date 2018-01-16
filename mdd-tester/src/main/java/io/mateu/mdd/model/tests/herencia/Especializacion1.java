package io.mateu.mdd.model.tests.herencia;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;

@Entity
@Getter@Setter
public class Especializacion1 extends Abstracta {

    private String texto1;

}
