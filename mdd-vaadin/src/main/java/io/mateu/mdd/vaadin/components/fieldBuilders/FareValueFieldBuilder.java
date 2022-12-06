package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.*;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.shared.ui.ValueChangeMode;
import com.vaadin.ui.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.data.FareValue;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

public class FareValueFieldBuilder extends AbstractFieldBuilder {
    @Override
    public boolean isSupported(FieldInterfaced field) {
        return FareValue.class.equals(field.getType());
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        TextField tf;
        container.addComponent(tf = new TextField());
        tf.setValueChangeMode(ValueChangeMode.BLUR);


        tf.setCaption(ReflectionHelper.getCaption(field));

        if (field.isAnnotationPresent(NotNull.class)) tf.setRequiredIndicatorVisible(true);


        addErrorHandler(field, tf);


        Binder.BindingBuilder bindingBuilder = binder.forField(tf);

        bindingBuilder.withConverter(new Converter() {
            @Override
            public Result convertToModel(Object o, ValueContext valueContext) {
                return Result.ok((o != null)?new FareValue((String) o):null);
            }

            @Override
            public Object convertToPresentation(Object o, ValueContext valueContext) {
                return (o != null)?o.toString():"";
            }
        });

        if (!forSearchFilter && field.getDeclaringClass() != null) bindingBuilder.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));

        completeBinding(bindingBuilder, binder, field);

        return tf;
    }
}
