package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.google.common.collect.Lists;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.ui.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.RequestFocus;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;

import java.util.List;
import java.util.Map;

public class JPABooleanFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return Boolean.class.equals(field.getType()) || boolean.class.equals(field.getType());
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        Component r = null;

        if (forSearchFilter && object != null && object.getClass().getName().endsWith("000Filters")) {

            ComboBox<Object> cb;
            container.addComponent(cb = new ComboBox<>());
            cb.setDataProvider(new ListDataProvider<>(Lists.newArrayList(true, false)));
            cb.addStyleName("test-" + field.getId());

            if (field.isAnnotationPresent(RequestFocus.class)) cb.focus();

            if (container.getComponentCount() > 0) cb.setCaption(ReflectionHelper.getCaption(field));

            //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) cb.setDescription(field.getAnnotation(Help.class).value());

            if (allFieldContainers != null) allFieldContainers.put(field, cb);

            completeBinding(cb, binder, field);

            addErrorHandler(field, cb);

            r = cb;

        } else {

            HorizontalLayout hl;
            container.addComponent(hl = new HorizontalLayout());
            hl.addStyleName(CSS.NOPADDING);
            hl.addStyleName("checkboxcontainer");

            CheckBox cb;
            hl.addComponent(cb = new CheckBox());
            hl.setDefaultComponentAlignment(Alignment.TOP_LEFT);
            cb.getInputElement().addStyleName("test-" + field.getId());

            if (field.isAnnotationPresent(RequestFocus.class)) cb.focus();

            hl.setCaption(ReflectionHelper.getCaption(field));

            //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) cb.setDescription(field.getAnnotation(Help.class).value());

            if (allFieldContainers != null) allFieldContainers.put(field, hl);

            completeBinding(cb, binder, field);

            addErrorHandler(field, cb);

            r = cb;

        }

        return r;
    }
}
