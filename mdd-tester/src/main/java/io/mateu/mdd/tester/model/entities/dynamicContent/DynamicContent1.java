package io.mateu.mdd.tester.model.entities.dynamicContent;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;

@Getter@Setter
public class DynamicContent1 extends DynamicContent {

    private String subclass1OnlyField;

    private String extraSubclass1OnlyField;


}
