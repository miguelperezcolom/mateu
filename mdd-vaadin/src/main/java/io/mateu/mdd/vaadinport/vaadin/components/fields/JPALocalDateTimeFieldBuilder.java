package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.vaadin.data.HasValue;
import com.vaadin.data.ValidationResult;
import com.vaadin.data.Validator;
import com.vaadin.data.ValueContext;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.server.UserError;
import com.vaadin.shared.ui.ErrorLevel;
import com.vaadin.ui.Component;
import com.vaadin.ui.DateTimeField;
import com.vaadin.ui.Layout;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.data.MDDBinder;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class JPALocalDateTimeFieldBuilder extends JPAFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return LocalDateTime.class.equals(field.getType());
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers) {

        DateTimeField tf;
        container.addComponent(tf = new DateTimeField());

        if (allFieldContainers.size() == 0) tf.focus();

        allFieldContainers.put(field, tf);

        tf.setCaption(Helper.capitalize(field.getName()));

        validators.put(tf, new ArrayList<>());

        tf.addValueChangeListener(new HasValue.ValueChangeListener<LocalDateTime>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<LocalDateTime> valueChangeEvent) {
                    ValidationResult result = null;
                for (Validator v : validators.get(tf)) {
                    result = v.apply(valueChangeEvent.getValue(), new ValueContext(tf));
                    if (result.isError()) break;
                }
                if (result != null && result.isError()) {
                    tf.setComponentError(new UserError(result.getErrorMessage()));
                } else {
                    tf.setComponentError(null);
                }
            }
        });

        tf.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));

        if (field.isAnnotationPresent(NotNull.class)) validators.get(tf).add(new Validator() {
            @Override
            public ValidationResult apply(Object o, ValueContext valueContext) {
                if (o == null) return ValidationResult.create("Required field", ErrorLevel.ERROR);
                else return ValidationResult.ok();
            }

            @Override
            public Object apply(Object o, Object o2) {
                return null;
            }
        });

        BeanValidator bv = new BeanValidator(field.getDeclaringClass(), field.getName());

        validators.get(tf).add(new Validator() {

            @Override
            public ValidationResult apply(Object o, ValueContext valueContext) {
                return bv.apply(o, valueContext);
            }

            @Override
            public Object apply(Object o, Object o2) {
                return null;
            }
        });

        addValidators(validators.get(tf));

        /*
        tf.setDescription();
        tf.setPlaceholder();
        */

        bind(binder, tf, field);
    }


    public void addValidators(List<Validator> validators) {
    }

    protected void bind(MDDBinder binder, DateTimeField tf, FieldInterfaced field) {
        binder.bindLocalDateTime(tf, field.getName());
    }
}
