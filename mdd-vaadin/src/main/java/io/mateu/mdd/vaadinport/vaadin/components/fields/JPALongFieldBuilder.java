package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.vaadin.data.converter.StringToIntegerConverter;
import com.vaadin.data.converter.StringToLongConverter;
import io.mateu.mdd.core.reflection.FieldInterfaced;

public class JPALongFieldBuilder extends JPAStringFieldBuilder {

    public boolean isSupported(FieldInterfaced field) {
        return Long.class.equals(field.getType()) || long.class.equals(field.getType());
    }


    @Override
    protected void bind() {
        binder.forField(tf).withConverter(new StringToLongConverter("Must be an long")).bind(field.getName());
    }
}
