package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.vaadin.data.HasValue;
import com.vaadin.data.ValidationResult;
import com.vaadin.data.Validator;
import com.vaadin.data.ValueContext;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.data.validator.StringLengthValidator;
import com.vaadin.server.UserError;
import com.vaadin.ui.Component;
import com.vaadin.ui.Layout;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.data.MDDBinder;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class JPAStringFieldBuilder extends JPAFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return String.class.equals(field.getType());
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers) {

        TextField tf;
        container.addComponent(tf = new TextField());

        if (allFieldContainers.size() == 0) tf.focus();

        allFieldContainers.put(field, tf);

        tf.setCaption(Helper.capitalize(field.getName()));

        validators.put(tf, new ArrayList<>());

        tf.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<String> valueChangeEvent) {
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

        if (field.isAnnotationPresent(NotNull.class)) validators.get(tf).add(new StringLengthValidator("Required field", 1, Integer.MAX_VALUE));

        BeanValidator bv = new BeanValidator(field.getDeclaringClass(), field.getName());

        validators.get(tf).add(new Validator() {

            @Override
            public ValidationResult apply(Object o, ValueContext valueContext) {
                return bv.apply(convert((String) o), valueContext);
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

    public Object convert(String s) {
        return s;
    }

    public void addValidators(List<Validator> validators) {
    }

    protected void bind(MDDBinder binder, TextField tf, FieldInterfaced field) {
        binder.bindString(tf, field.getName());
    }
}
