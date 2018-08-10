package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.Component;
import com.vaadin.ui.Layout;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.data.MDDBinder;

import java.util.List;
import java.util.Map;

public class JPAOutputFieldBuilder extends JPAFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return String.class.equals(field.getType());
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        if (!forSearchFilter) {

            TextField tf;
            container.addComponent(tf = new TextField());

            tf.setReadOnly(true);

            allFieldContainers.put(field, tf);

            tf.setCaption(Helper.capitalize(field.getName()));


        /*
        tf.setDescription();
        tf.setPlaceholder();
        */

            bind(binder, tf, field);

        }

    }

    protected void bind(MDDBinder binder, TextField tf, FieldInterfaced field) {
        binder.bind(tf, field.getName());
    }
}
