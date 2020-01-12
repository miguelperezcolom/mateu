package io.mateu.mdd.tester.model.wizards;

import io.mateu.mdd.core.annotations.Wizard;
import lombok.MateuMDDEntity;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
public class WizardEntity {

    @Id@GeneratedValue
    private long id;

    private String name;

    @Wizard(Wizard2Page1.class)
    private int value;

}
