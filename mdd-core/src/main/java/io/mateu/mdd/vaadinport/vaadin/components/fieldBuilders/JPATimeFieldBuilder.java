package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.Binder;
import com.vaadin.data.Converter;
import com.vaadin.data.Result;
import com.vaadin.data.ValueContext;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.ui.TextField;
import io.mateu.mdd.shared.data.MDDBinder;
import io.mateu.reflection.FieldInterfaced;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class JPATimeFieldBuilder extends JPAStringFieldBuilder {

    public boolean isSupported(FieldInterfaced field) {
        return LocalTime.class.equals(field.getType());
    }

    @Override
    protected void bind(MDDBinder binder, TextField tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf).withConverter(new Converter<String, LocalTime>() {
            @Override
            public Result<LocalTime> convertToModel(String s, ValueContext valueContext) {
                LocalTime localTime = null;

                if (!Strings.isNullOrEmpty(s)) {
                    try {

                        try {
                            localTime = LocalTime.parse(s, DateTimeFormatter.ofPattern("HHmm"));
                        } catch (Exception e) {
                            localTime = LocalTime.parse(s, DateTimeFormatter.ofPattern("HH:mm"));
                        }

                    } catch (Exception e) {
                        return Result.error("Invalid format. Must be HHmm or HH:mm");
                    }
                }

                return Result.ok(localTime);
            }

            @Override
            public String convertToPresentation(LocalTime localTime, ValueContext valueContext) {
                return localTime != null?localTime.format(DateTimeFormatter.ofPattern("HH:mm")):"";
            }
        });
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        completeBinding(aux, binder, field);
    }


}
