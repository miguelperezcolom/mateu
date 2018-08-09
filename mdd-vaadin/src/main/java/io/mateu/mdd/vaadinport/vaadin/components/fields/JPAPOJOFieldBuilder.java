package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.*;
import io.mateu.mdd.core.data.FormLayoutBuilder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.data.MDDBinder;

import java.util.List;
import java.util.Map;

public class JPAPOJOFieldBuilder extends JPAFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return true;
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers) {


        /*
        Label tl;
        container.addComponent(tl = new Label(Helper.capitalize(field.getName())));
        tl.addStyleName(ValoTheme.LABEL_H3);
*/

        FormLayout l;
        container.addComponent(l = new FormLayout());
        l.addStyleName("embedded");
        l.setCaption(Helper.capitalize(field.getName()));

        bind(binder, l, field, validators, ReflectionHelper.getAllFields(object.getClass()));
    }

    public Object convert(String s) {
        return s;
    }

    public void addValidators(List<Validator> validators) {
    }

    protected void bind(MDDBinder binder, FormLayout tf, FieldInterfaced field, Map<HasValue, List<Validator>> validators, List<FieldInterfaced> allFields) {
        binder.bindEmbedded(tf, field, validators, allFields, io.mateu.mdd.vaadinport.vaadin.components.oldviews.FormLayoutBuilder.get());
    }
}
