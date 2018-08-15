package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.ValidationResult;
import com.vaadin.data.Validator;
import com.vaadin.data.ValueContext;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.server.UserError;
import com.vaadin.shared.ui.ErrorLevel;
import com.vaadin.ui.ComboBox;
import com.vaadin.ui.Component;
import com.vaadin.ui.Layout;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.components.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.data.MDDBinder;

import javax.persistence.OneToOne;
import javax.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class JPAOneToOneFieldBuilder extends JPAFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(OneToOne.class);
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        if (forSearchFilter) {

            // todo: añadir este campo?

        } else {

            ComboBox tf;
            container.addComponent(tf = new ComboBox());

            if (allFieldContainers.size() == 0) tf.focus();

            try {
                Helper.notransact((em) -> tf.setDataProvider(new JPQLListDataProvider(em, field.getType())));
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }


            FieldInterfaced fName = ReflectionHelper.getNameField(field.getType());
            if (fName != null) tf.setItemCaptionGenerator((i) -> {
                try {
                    return "" + ReflectionHelper.getValue(fName, i);
                } catch (NoSuchMethodException e) {
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                }
                return "Error";
            });

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

            if (field.isAnnotationPresent(NotNull.class)) validators.get(tf).add(new Validator() {
                @Override
                public ValidationResult apply(Object o, ValueContext valueContext) {
                    ValidationResult r = null;
                    if (o == null) r = ValidationResult.create("Required field", ErrorLevel.ERROR);
                    else r = ValidationResult.ok();
                    return r;
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

    }

    public Object convert(String s) {
        return s;
    }

    public void addValidators(List<Validator> validators) {
    }

    protected void bind(MDDBinder binder, ComboBox tf, FieldInterfaced field) {
        binder.bind(tf, field.getName());
    }
}
