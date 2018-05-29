package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.vaadin.data.Binder;
import com.vaadin.ui.Layout;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;

public class JPAStringFieldBuilder extends JPAFieldBuilder {

    protected TextField tf;
    protected FieldInterfaced field;
    protected Binder binder;

    public boolean isSupported(FieldInterfaced field) {
        return String.class.equals(field.getType());
    }

    public void build(FieldInterfaced field, Object object, Layout container, Binder binder) {
        
        this.field = field;
        this.binder = binder;
        
        container.addComponent(tf = new TextField());

        tf.setCaption(Helper.capitalize(field.getName()));

        
        bind();
    }

    protected void bind() {
        binder.bind(tf, field.getName());
    }
}
