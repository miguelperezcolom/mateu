package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.*;
import com.vaadin.server.Setter;
import com.vaadin.shared.Registration;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Help;
import io.mateu.mdd.core.annotations.Wizard;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import java.util.List;
import java.util.Map;

public class JPAWizardFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(Wizard.class);
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        if (!forSearchFilter) {

            Label tf;
            Button b;
            HorizontalLayout hl;
            container.addComponent(hl = new HorizontalLayout(tf = new Label(), b = new Button("Edit")));
            tf.addStyleName("labelconlink");
            b.addStyleName(ValoTheme.BUTTON_LINK);
            b.addClickListener(e -> MDDUI.get().getNavegador().goTo(field));

            allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) hl.setCaption(ReflectionHelper.getCaption(field));

            if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) hl.setDescription(field.getAnnotation(Help.class).value());


            bind(binder, tf, field);

        }

    }

    protected void bind(MDDBinder binder, Label l, FieldInterfaced field) {
        binder.forField(new HasValue() {
            @Override
            public void setValue(Object o) {
                l.setValue((o != null)?"" + o:"");
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
        }).bind(field.getName());
    }
}
