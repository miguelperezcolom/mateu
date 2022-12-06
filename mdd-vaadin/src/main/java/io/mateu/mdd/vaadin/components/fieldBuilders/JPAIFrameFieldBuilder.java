package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.Binder;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.server.ExternalResource;
import com.vaadin.shared.Registration;
import com.vaadin.ui.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.annotations.FullWidth;
import io.mateu.mdd.shared.annotations.Height;
import io.mateu.mdd.shared.annotations.IFrame;
import io.mateu.mdd.shared.annotations.Width;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;

import java.util.List;
import java.util.Map;

public class JPAIFrameFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(IFrame.class);
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        Component r = null;

        if (!forSearchFilter) {

            BrowserFrame tf;
            container.addComponent(tf = new BrowserFrame());
            if (field.isAnnotationPresent(FullWidth.class)) {
                tf.setSizeFull();
                container.setSizeFull();
            } else {
                tf.setWidth(field.isAnnotationPresent(Width.class)?field.getAnnotation(Width.class).value():"600px");
                tf.setHeight(field.isAnnotationPresent(Height.class)?field.getAnnotation(Height.class).value():"400px");
            }

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));

            //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());


            bind(binder, tf, field, forSearchFilter);

            addErrorHandler(field, tf);

            r = tf;
        }

        return r;
    }


    protected void bind(MDDBinder binder, BrowserFrame b, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(new HasValue() {
            @Override
            public void setValue(Object o) {
                if (o != null) {
                    b.setSource((o != null)?new ExternalResource("" + o):null);
                }
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
