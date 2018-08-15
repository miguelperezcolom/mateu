package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.vaadin.data.*;
import com.vaadin.data.converter.StringToIntegerConverter;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.data.MDDBinder;

public class JPAIntegerFieldBuilder extends JPAStringFieldBuilder {

    public boolean isSupported(FieldInterfaced field) {
        return Integer.class.equals(field.getType()) || int.class.equals(field.getType());
    }


    @Override
    protected void bind(MDDBinder binder, TextField tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf).withConverter(new StringToIntegerConverter(0, "Must be an integer")).withConverter(new Converter() {
            @Override
            public Result convertToModel(Object o, ValueContext valueContext) {
                return Result.ok(o);
            }

            @Override
            public Object convertToPresentation(Object o, ValueContext valueContext) {
                return (o != null) ? o : 0;
            }
        });
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
    }


}
