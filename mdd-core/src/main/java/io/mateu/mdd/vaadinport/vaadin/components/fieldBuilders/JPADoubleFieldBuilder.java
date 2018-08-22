package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.vaadin.data.Binder;
import com.vaadin.data.converter.StringToDoubleConverter;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.data.MDDBinder;

public class JPADoubleFieldBuilder extends JPAStringFieldBuilder {

    public boolean isSupported(FieldInterfaced field) {
        return Double.class.equals(field.getType()) || double.class.equals(field.getType());
    }

    @Override
    protected void bind(MDDBinder binder, TextField tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf).withConverter(new StringToDoubleConverter("Must be an number"));
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
    }

}
