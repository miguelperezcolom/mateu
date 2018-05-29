package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.vaadin.data.Binder;
import com.vaadin.data.converter.StringToIntegerConverter;
import com.vaadin.ui.Layout;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;

public class JPAIntegerFieldBuilder extends JPAStringFieldBuilder {

    public boolean isSupported(FieldInterfaced field) {
        return Integer.class.equals(field.getType()) || int.class.equals(field.getType());
    }


    @Override
    protected void bind() {
        binder.forField(tf).withConverter(new StringToIntegerConverter("Must be an integer")).bind(field.getName());
    }
}
