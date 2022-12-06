package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.Binder;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.ui.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;

import javax.validation.constraints.NotNull;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class JPAEnumerationFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.getType().isEnum();
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        ComboBox tf;
        container.addComponent(tf = new ComboBox());

        if (allFieldContainers != null && allFieldContainers.size() == 0) tf.focus();

        tf.setDataProvider(new ListDataProvider(Arrays.asList(field.getType().getEnumConstants())));

        if (allFieldContainers != null) allFieldContainers.put(field, tf);

        tf.setCaption(ReflectionHelper.getCaption(field));

        tf.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));

        //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());


        bind(binder, tf, field, forSearchFilter);

        addErrorHandler(field, tf);

        return tf;
    }

    protected void bind(MDDBinder binder, ComboBox tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf);
        if (!forSearchFilter && field.getDeclaringClass() != null) {
            aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        }
        completeBinding(aux, binder, field);
    }
}
