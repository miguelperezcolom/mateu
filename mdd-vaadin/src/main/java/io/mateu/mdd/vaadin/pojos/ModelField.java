package io.mateu.mdd.vaadin.pojos;

import io.mateu.mdd.shared.reflection.FieldInterfaced;

public class ModelField {

    private final Object instance;
    private final FieldInterfaced field;


    public ModelField(Object instance, FieldInterfaced field) {
        this.instance = instance;
        this.field = field;
    }

    public Object getInstance() {
        return instance;
    }

    public FieldInterfaced getField() {
        return field;
    }
}
