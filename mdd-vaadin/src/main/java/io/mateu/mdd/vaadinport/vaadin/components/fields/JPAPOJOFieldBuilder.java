package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.shared.Registration;
import com.vaadin.ui.*;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.FormLayoutBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JPAPOJOFieldBuilder extends JPAFieldBuilder {

    MDDBinder subbinder;

    public boolean isSupported(FieldInterfaced field) {
        return true;
    }

    @Override
    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        /*
        Label tl;
        container.addComponent(tl = new Label(Helper.capitalize(field.getName())));
        tl.addStyleName(ValoTheme.LABEL_H3);
*/

        FormLayout l;
        container.addComponent(l = new FormLayout());
        l.addStyleName("embedded");
        l.setCaption(Helper.capitalize(field.getName()));

        subbinder = new MDDBinder(field.getType());

        Map<HasValue, List<Validator>> subvalidators = new HashMap<>();

        FormLayoutBuilder.get().build(l, subbinder, field.getType(), subbinder.getBean(), subvalidators, ReflectionHelper.getAllEditableFields(field.getType()));


        bind(binder, field, subbinder);
    }

    private void bind(MDDBinder binder, FieldInterfaced field, MDDBinder subbinder) {

        binder.bind(new HasValue() {
            @Override
            public void setValue(Object o) {
                subbinder.setBean(o);
            }

            @Override
            public Object getValue() {
                return subbinder.getBean();
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
        }, field.getName());
    }

    public Object convert(String s) {
        return s;
    }

    public void addValidators(List<Validator> validators) {
    }

}
