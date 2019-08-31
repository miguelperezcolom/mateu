package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.collect.Lists;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.ui.*;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;

import java.util.List;
import java.util.Map;

public class JPABooleanFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return Boolean.class.equals(field.getType()) || boolean.class.equals(field.getType());
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {


        if (forSearchFilter && object != null && object.getClass().getName().endsWith("000Filters")) {

            ComboBox<Object> cb;
            container.addComponent(cb = new ComboBox<>());
            cb.setDataProvider(new ListDataProvider<>(Lists.newArrayList(true, false)));

            if (allFieldContainers.size() == 0) cb.focus();

            if (container.getComponentCount() > 0) cb.setCaption(ReflectionHelper.getCaption(field));

            //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) cb.setDescription(field.getAnnotation(Help.class).value());


            bind(binder, cb, field);

        } else {

            HorizontalLayout hl;
            container.addComponent(hl = new HorizontalLayout());
            hl.addStyleName(CSS.NOPADDING);
            hl.addStyleName("checkboxcontainer");

            CheckBox cb;
            hl.addComponent(cb = new CheckBox());
            hl.setDefaultComponentAlignment(Alignment.TOP_LEFT);

            if (allFieldContainers.size() == 0) cb.focus();

            hl.setCaption(ReflectionHelper.getCaption(field));

            //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) cb.setDescription(field.getAnnotation(Help.class).value());


            bind(binder, cb, field);

        }

    }

    protected void bind(MDDBinder binder, HasValue cb, FieldInterfaced field) {
        binder.bind(cb, field.getName());
    }
}
