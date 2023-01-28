package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.shared.Registration;
import com.vaadin.ui.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.annotations.Unmodifiable;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;
import org.javamoney.moneta.FastMoney;

import javax.money.MonetaryAmount;
import javax.persistence.Id;
import java.util.List;
import java.util.Map;

public class JPAUnmodifiableFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return (field.isAnnotationPresent(Unmodifiable.class)
                || field.isAnnotationPresent(Id.class)
                || field.isAnnotationPresent(org.springframework.data.annotation.Id.class))
                && (MateuUI.get().getCurrentEditor() != null
                && !MateuUI.get().isEditingNewRecord());
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        if (!forSearchFilter) {

            Label tf;
            container.addComponent(tf = new Label());

            if (Integer.class.equals(field.getType()) || int.class.equals(field.getType())
                    || Long.class.equals(field.getType()) || long.class.equals(field.getType())
                    || Double.class.equals(field.getType()) || double.class.equals(field.getType())
                    || FastMoney.class.equals(field.getType()) || MonetaryAmount.class.equals(field.getType())) {
                tf.addStyleName("alinearderecha");
            }

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));

            //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());

            bind(binder, tf, field);

        }

        return null;
    }

    protected void bind(MDDBinder binder, Label tf, FieldInterfaced field) {
        binder.forField(new HasValue() {

            Object v;

            @Override
            public void setValue(Object o) {
                v = o;
                tf.setValue((o != null)?o.toString():"");
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
