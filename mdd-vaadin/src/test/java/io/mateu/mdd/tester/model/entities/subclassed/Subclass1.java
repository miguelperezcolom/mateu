package io.mateu.mdd.tester.model.entities.subclassed;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;

@Entity
@Getter@Setter
public class Subclass1 extends Superclass {

    private String subclass1OnlyField;

}
