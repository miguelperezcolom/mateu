package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.vaadin.data.converter.StringToDoubleConverter;
import com.vaadin.data.converter.StringToLongConverter;
import io.mateu.mdd.core.reflection.FieldInterfaced;

public class JPADoubleFieldBuilder extends JPAStringFieldBuilder {

    public boolean isSupported(FieldInterfaced field) {
        return Double.class.equals(field.getType()) || double.class.equals(field.getType());
    }


    @Override
    protected void bind() {
        binder.forField(tf).withConverter(new StringToDoubleConverter("Must be an number")).bind(field.getName());
    }
}
