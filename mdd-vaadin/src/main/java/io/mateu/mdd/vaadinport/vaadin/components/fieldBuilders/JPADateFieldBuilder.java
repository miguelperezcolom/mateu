package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.data.converter.LocalDateTimeToDateConverter;
import com.vaadin.ui.Component;
import com.vaadin.ui.DateTimeField;
import com.vaadin.ui.Layout;
import io.mateu.mdd.core.annotations.Help;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.annotations.Help;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;

import javax.validation.constraints.NotNull;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class JPADateFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return Date.class.equals(field.getType());
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        DateTimeField tf;
        container.addComponent(tf = new DateTimeField());

        if (allFieldContainers.size() == 0) tf.focus();

        allFieldContainers.put(field, tf);

        if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));

        tf.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));


        //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());


        bind(binder, tf, field);

    }


    protected void bind(MDDBinder binder, DateTimeField tf, FieldInterfaced field) {
        binder.forField(tf).withConverter(new LocalDateTimeToDateConverter(ZoneId.systemDefault())).bind(field.getName());
    }
}
