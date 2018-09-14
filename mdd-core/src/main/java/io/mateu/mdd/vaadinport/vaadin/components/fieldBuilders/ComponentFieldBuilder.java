package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.shared.Registration;
import com.vaadin.ui.*;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.annotations.Help;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.AuditRecord;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;

import java.util.List;
import java.util.Map;

public class ComponentFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return Component.class.isAssignableFrom(field.getType()) || Composite.class.isAssignableFrom(field.getType());
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        VerticalLayout tf;
        container.addComponent(tf = new VerticalLayout());
        tf.addStyleName(CSS.NOPADDING);

        allFieldContainers.put(field, tf);

        if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));

        if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());

        bind(binder, tf, field);

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
