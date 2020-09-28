package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.shared.Registration;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.shared.annotations.Wizard;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.mdd.vaadin.MDDUI;

import java.util.List;
import java.util.Map;

public class JPAWizardFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(Wizard.class);
    }

    @Override
    public Component build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        Component r = null;

        if (!forSearchFilter) {

            Label tf;
            Button b;
            HorizontalLayout hl;
            container.addComponent(hl = new HorizontalLayout(tf = new Label(), b = new Button("Edit")));
            tf.addStyleName("labelconlink");
            b.addStyleName(ValoTheme.BUTTON_LINK);
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo(field));

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) hl.setCaption(ReflectionHelper.getCaption(field));

            addErrorHandler(field, tf);

            r = tf;

            //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) hl.setDescription(field.getAnnotation(Help.class).value());


            bind(binder, tf, field);

        }

        return r;
    }

    protected void bind(MDDBinder binder, Label l, FieldInterfaced field) {
        HasValue hv = new HasValue() {
            @Override
            public void setValue(Object o) {
                l.setValue((o != null) ? "" + o : "");
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
        };
        completeBinding(hv, binder, field);
    }
}
