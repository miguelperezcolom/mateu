package io.mateu.mdd.vaadin.components.fieldBuilders;

import io.mateu.mdd.shared.reflection.FieldInterfaced;

import javax.persistence.OneToOne;

public class JPAOneToOneFieldBuilder extends JPAManyToOneFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(OneToOne.class);
    }

}
