package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.google.common.base.Strings;
import com.vaadin.data.Binder;
import com.vaadin.data.ValidationResult;
import com.vaadin.data.Validator;
import com.vaadin.data.ValueContext;
import com.vaadin.data.converter.StringToLongConverter;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.shared.ui.ErrorLevel;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.data.MDDBinder;

import java.util.List;

public class JPALongFieldBuilder extends JPAStringFieldBuilder {

    public boolean isSupported(FieldInterfaced field) {
        return Long.class.equals(field.getType()) || long.class.equals(field.getType());
    }


    @Override
    protected void bind(MDDBinder binder, TextField tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf).withConverter(new StringToLongConverter("Must be an long"));
        if (!forSearchFilter) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
    }


    @Override
    public Object convert(String s) {
        return (!Strings.isNullOrEmpty(s))?Long.parseLong(s):null;
    }

}
