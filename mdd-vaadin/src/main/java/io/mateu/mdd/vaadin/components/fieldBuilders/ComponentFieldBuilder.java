package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.shared.Registration;
import com.vaadin.ui.Component;
import com.vaadin.ui.Composite;
import com.vaadin.ui.Layout;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;

import java.util.List;
import java.util.Map;

public class ComponentFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return Component.class.isAssignableFrom(field.getType()) || Composite.class.isAssignableFrom(field.getType());
    }

    @Override
    public Component build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        VerticalLayout tf;
        container.addComponent(tf = new VerticalLayout());
        tf.addStyleName(CSS.NOPADDING);

        if (allFieldContainers != null) allFieldContainers.put(field, tf);

        if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));

        //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());

        addErrorHandler(field, tf);

        bind(binder, tf, field);

        return tf;
    }

    protected void bind(MDDBinder binder, VerticalLayout tf, FieldInterfaced field) {
        binder.forField(new HasValue() {

            Object v;

            @Override
            public void setValue(Object o) {
                v = o;
                tf.removeAllComponents();
                if (o != null) tf.addComponent((Component) o);
            }

            @Override
            public Object getValue() {
                return v;
            }

            @Override
            public Registration addValueChangeListener(ValueChangeListener valueChangeListener) {
                return null;
            }

            @Override
            public void setRequiredIndicatorVisible(boolean b) {

            }

            @Override
            public boolean isRequiredIndicatorVisible() {
                return false;
            }

            @Override
            public void setReadOnly(boolean b) {

            }

            @Override
            public boolean isReadOnly() {
                return false;
            }
        }).bind(field.getName());
    }
}
