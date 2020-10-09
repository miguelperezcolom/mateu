package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.ValidationResult;
import com.vaadin.data.Validator;
import com.vaadin.data.ValueContext;
import com.vaadin.server.UserError;
import com.vaadin.ui.ComboBox;
import com.vaadin.ui.Component;
import com.vaadin.ui.Layout;
import com.vaadin.ui.RadioButtonGroup;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.annotations.UseRadioButtons;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class FromDataProviderFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.getDataProvider() != null;
    }

    @Override
    public Component build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        Component r = null;

        if (field.isAnnotationPresent(UseRadioButtons.class)) {

            RadioButtonGroup tf;
            container.addComponent(tf = new RadioButtonGroup());

            if (allFieldContainers != null && allFieldContainers.size() == 0) tf.focus();

            tf.setDataProvider(field.getDataProvider());

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));

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

            if (!forSearchFilter) {

                tf.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));

            }

            completeBinding(tf, binder, field);

            addErrorHandler(field, tf);

            r = tf;

        } else {

            ComboBox tf;
            container.addComponent(tf = new ComboBox());

            if (allFieldContainers != null && allFieldContainers.size() == 0) tf.focus();

            tf.setDataProvider(field.getDataProvider());

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));

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

            if (!forSearchFilter) {

                tf.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));

            }

            completeBinding(tf, binder, field);

            addErrorHandler(field, tf);

            r = tf;
        }

        return r;
    }

}
