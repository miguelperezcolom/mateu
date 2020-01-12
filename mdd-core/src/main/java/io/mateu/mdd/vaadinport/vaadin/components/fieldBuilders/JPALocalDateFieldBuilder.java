package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.Component;
import com.vaadin.ui.DateField;
import com.vaadin.ui.Layout;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class JPALocalDateFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return LocalDate.class.equals(field.getType());
    }

    @Override
    public Component build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearhFilter, Map<String, List<AbstractAction>> attachedActions) {


        DateField tf;
        container.addComponent(tf = new DateField());

        if (allFieldContainers != null && allFieldContainers.size() == 0) tf.focus();

        if (allFieldContainers != null) allFieldContainers.put(field, tf);

        if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));

        tf.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));

        //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());


        completeBinding(tf, binder, field);


        addErrorHandler(tf);

        return tf;
    }

}
