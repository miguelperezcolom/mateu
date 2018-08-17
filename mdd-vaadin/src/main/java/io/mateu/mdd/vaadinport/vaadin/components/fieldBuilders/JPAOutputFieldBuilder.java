package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.vaadin.data.*;
import com.vaadin.server.Setter;
import com.vaadin.ui.Component;
import com.vaadin.ui.Layout;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.data.MDDBinder;

import java.util.List;
import java.util.Map;

public class JPAOutputFieldBuilder extends AbstractFieldBuilder {


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
        binder.forField(tf).withConverter(new Converter() {
            @Override
            public Result convertToModel(Object o, ValueContext valueContext) {
                return Result.ok(o);
            }

            @Override
            public Object convertToPresentation(Object o, ValueContext valueContext) {
                return (o != null)?"" + o:"";
            }
        }).bind(new ValueProvider() {
            @Override
            public Object apply(Object o) {
                try {
                    return ReflectionHelper.getValue(field, o);
                } catch (Exception e) {
                    MDD.alert(e);
                    return null;
                }
            }
        }, new Setter() {
            @Override
            public void accept(Object o, Object o2) {
                // it's just output. do nothing
            }
        });
    }
}
