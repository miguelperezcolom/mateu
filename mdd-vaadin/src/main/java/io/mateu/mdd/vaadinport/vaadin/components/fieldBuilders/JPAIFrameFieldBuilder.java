package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.Binder;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.server.ExternalResource;
import com.vaadin.shared.Registration;
import com.vaadin.ui.BrowserFrame;
import com.vaadin.ui.Component;
import com.vaadin.ui.Layout;
import io.mateu.mdd.core.annotations.Help;
import io.mateu.mdd.core.annotations.IFrame;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.annotations.Help;
import io.mateu.mdd.core.annotations.IFrame;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;

import java.util.List;
import java.util.Map;

public class JPAIFrameFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(IFrame.class);
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        if (!forSearchFilter) {

            BrowserFrame tf;
            container.addComponent(tf = new BrowserFrame());
            tf.setWidth("600px");
            tf.setHeight("400px");

            container.addComponent(tf);


            allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));

            if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());


            bind(binder, tf, field, forSearchFilter);

        }

    }


    protected void bind(MDDBinder binder, BrowserFrame b, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(new HasValue() {
            @Override
            public void setValue(Object o) {
                b.setSource((o != null)?new ExternalResource("" + o):null);
            }

            @Override
            public Object getValue() {
                return null;
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
        });
        aux.bind(field.getName());
    }
}
