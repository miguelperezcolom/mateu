package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.google.common.base.Strings;
import com.vaadin.data.*;
import com.vaadin.data.converter.StringToIntegerConverter;
import com.vaadin.shared.ui.ErrorLevel;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.data.MDDBinder;

import java.util.List;

public class JPAIntegerFieldBuilder extends JPAStringFieldBuilder {

    public boolean isSupported(FieldInterfaced field) {
        return Integer.class.equals(field.getType()) || int.class.equals(field.getType());
    }


    @Override
    public void addValidators(List<Validator> validators) {
        validators.add(new Validator() {
            @Override
            public ValidationResult apply(Object o, ValueContext valueContext) {
                try {

                    String s = (String) o;

                    if (!Strings.isNullOrEmpty(s)) Integer.parseInt(s);

                    return ValidationResult.ok();
                } catch (Exception e) {
                    return ValidationResult.create("Not a number", ErrorLevel.ERROR);
                }
            }

            @Override
            public Object apply(Object o, Object o2) {
                return null;
            }
        });
    }

    @Override
    protected void bind(MDDBinder binder, TextField tf, FieldInterfaced field) {
        binder.forField(tf).withConverter(new StringToIntegerConverter(0, "Must be an integer")).withConverter(new Converter() {
            @Override
            public Result convertToModel(Object o, ValueContext valueContext) {
                return Result.ok(o);
            }

            @Override
            public Object convertToPresentation(Object o, ValueContext valueContext) {
                return (o != null)?o:0;
            }
        }).bind(field.getName());
    }


    @Override
    public Object convert(String s) {
        return (!Strings.isNullOrEmpty(s))?Integer.parseInt(s):null;
    }

}
