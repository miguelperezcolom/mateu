package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.shared.Registration;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import com.vaadin.ui.Layout;
import io.mateu.mdd.core.annotations.Unmodifiable;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.core.annotations.Help;
import io.mateu.mdd.core.annotations.Unmodifiable;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import org.javamoney.moneta.FastMoney;

import javax.money.MonetaryAmount;
import javax.persistence.Id;
import java.util.List;
import java.util.Map;

public class JPAUnmodifiableFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return (field.isAnnotationPresent(Unmodifiable.class) || field.isAnnotationPresent(Id.class)) && (MDDUI.get().getNavegador().getViewProvider().getCurrentEditor() != null && !MDDUI.get().isEditingNewRecord());
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        if (!forSearchFilter) {

            Label tf;
            container.addComponent(tf = new Label());

            if (Integer.class.equals(field.getType()) || int.class.equals(field.getType())
                    || Long.class.equals(field.getType()) || long.class.equals(field.getType())
                    || Double.class.equals(field.getType()) || double.class.equals(field.getType())
                    || FastMoney.class.equals(field.getType()) || MonetaryAmount.class.equals(field.getType())) {
                tf.addStyleName("alinearderecha");
            }

            allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));

            if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());

            bind(binder, tf, field);

        }

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
