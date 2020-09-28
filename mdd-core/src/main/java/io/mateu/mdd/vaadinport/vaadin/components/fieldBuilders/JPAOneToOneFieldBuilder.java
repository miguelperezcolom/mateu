package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import io.mateu.reflection.FieldInterfaced;

import javax.persistence.OneToOne;

public class JPAOneToOneFieldBuilder extends JPAManyToOneFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(OneToOne.class);
    }

}
