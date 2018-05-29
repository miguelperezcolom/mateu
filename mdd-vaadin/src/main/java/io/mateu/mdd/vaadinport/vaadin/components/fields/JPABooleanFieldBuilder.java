package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.vaadin.data.Binder;
import com.vaadin.ui.CheckBox;
import com.vaadin.ui.Layout;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;

public class JPABooleanFieldBuilder extends JPAFieldBuilder {

    protected CheckBox cb;
    protected FieldInterfaced field;
    protected Binder binder;

    public boolean isSupported(FieldInterfaced field) {
        return Boolean.class.equals(field.getType()) || boolean.class.equals(field.getType());
    }

    public void build(FieldInterfaced field, Object object, Layout container, Binder binder) {
        
        this.field = field;
        this.binder = binder;
        
        container.addComponent(cb = new CheckBox());

        cb.setCaption(Helper.capitalize(field.getName()));

        
        bind();
    }

    protected void bind() {
        binder.bind(cb, field.getName());
    }
}
