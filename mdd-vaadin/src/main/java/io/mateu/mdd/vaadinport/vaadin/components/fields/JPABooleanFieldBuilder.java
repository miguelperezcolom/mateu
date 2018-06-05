package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.CheckBox;
import com.vaadin.ui.Component;
import com.vaadin.ui.Layout;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.data.MDDBinder;

import java.util.List;
import java.util.Map;

public class JPABooleanFieldBuilder extends JPAFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return Boolean.class.equals(field.getType()) || boolean.class.equals(field.getType());
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers) {


        CheckBox cb;
        container.addComponent(cb = new CheckBox());

        cb.setCaption(Helper.capitalize(field.getName()));
        
        bind(binder, cb, field);
    }

    protected void bind(MDDBinder binder, CheckBox cb, FieldInterfaced field) {
        binder.bindBoolean(cb, field.getName());
    }
}
