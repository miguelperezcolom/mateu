package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.Registration;
import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Layout;
import com.vaadin.ui.themes.ValoTheme;
import eu.maxschuster.vaadin.signaturefield.SignatureField;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.Signature;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;

import java.util.List;
import java.util.Map;

public class JPASignatureFieldBuilder extends JPAStringFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(Signature.class);
    }

    @Override
    public Component build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        Component r = null;

        if (!forSearchFilter) {

            HorizontalLayout l = new HorizontalLayout();

            SignatureField tf;
            l.addComponent(tf = new SignatureField());


            addErrorHandler(field, tf);

            r = tf;

            if (allFieldContainers != null && allFieldContainers.size() == 0) tf.focus();

            Button b;
            l.addComponent(b = new Button(VaadinIcons.EXPAND_SQUARE));
            b.addStyleName(ValoTheme.BUTTON_QUIET);
            b.addClickListener(e -> MDDUIAccessor.go(field.getName()));

            container.addComponent(l);

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) l.setCaption(ReflectionHelper.getCaption(field));
        /*
        tf.setDescription();
        tf.setPlaceholder();
        */

            bind(binder, tf, field);

        }

        return r;

    }


    protected void bind(MDDBinder binder, SignatureField tf, FieldInterfaced field) {
        HasValue hv = new HasValue() {
            @Override
            public void setValue(Object o) {
                tf.setValue((String) o);
            }

            @Override
            public Object getValue() {
                return tf.getValue();
            }

            @Override
            public Registration addValueChangeListener(ValueChangeListener valueChangeListener) {
                return null;
            }

            @Override
            public void setRequiredIndicatorVisible(boolean b) {
                tf.setRequired(b);
            }

            @Override
            public boolean isRequiredIndicatorVisible() {
                return tf.isRequired();
            }

            @Override
            public void setReadOnly(boolean b) {
                tf.setReadOnly(b);
            }

            @Override
            public boolean isReadOnly() {
                return tf.isReadOnly();
            }
        };
        completeBinding(hv, binder, field);
    }
}
