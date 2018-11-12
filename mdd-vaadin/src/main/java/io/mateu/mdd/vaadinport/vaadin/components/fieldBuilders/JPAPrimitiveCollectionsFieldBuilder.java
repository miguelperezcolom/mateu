package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ValueChangeMode;
import com.vaadin.ui.*;
import io.mateu.mdd.core.annotations.Help;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.annotations.Help;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;

import java.util.*;

public class JPAPrimitiveCollectionsFieldBuilder extends JPAStringFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        boolean ok = Collection.class.isAssignableFrom(field.getType());
        if (ok) {
            Class gc = ReflectionHelper.getGenericClass(field, Collection.class, "E");
            ok &= String.class.equals(gc) || Integer.class.equals(gc) || Long.class.equals(gc) || Float.class.equals(gc) || Double.class.equals(gc) || Boolean.class.equals(gc);
        }
        return ok;
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        if (!forSearchFilter) {

            AbstractTextField tf = (field.isAnnotationPresent(io.mateu.mdd.core.annotations.TextArea.class))?new TextArea():new TextField();
            container.addComponent(tf);
            tf.setValueChangeMode(ValueChangeMode.BLUR);

            if (allFieldContainers.size() == 0) tf.focus();

            allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));
        /*
        tf.setDescription();
        tf.setPlaceholder();
        */

            if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());

            bind(binder, tf, field);

        }

    }


    protected void bind(MDDBinder binder, AbstractTextField tf, FieldInterfaced field) {
        binder.bind(new HasValue() {
            @Override
            public void setValue(Object o) {
                String s = "";
                if (o != null) {
                    Collection col = (Collection) o;
                    for (Object v : col) {
                        if (!"".equals(s)) s += (tf instanceof TextArea)?"\n":",";
                        s += v;
                    }
                }
                tf.setValue(s);
            }

            @Override
            public Object getValue() {

                Collection col = (Set.class.isAssignableFrom(field.getType()))?new HashSet():new ArrayList();

                Class gc = ReflectionHelper.getGenericClass(field, Collection.class, "E");

                if (!Strings.isNullOrEmpty(tf.getValue())) {
                    for (String s : tf.getValue().split((tf instanceof TextArea)?"\\\n":",")) {
                        s = s.trim();
                        if (Integer.class.equals(gc)) col.add(new Integer(s));
                        else if (Long.class.equals(gc)) col.add(new Long(s));
                        else if (Double.class.equals(gc)) col.add(new Double(s));
                        else if (Float.class.equals(gc)) col.add(new Float(s));
                        else if (Boolean.class.equals(gc)) col.add(new Boolean(s));
                        else if (String.class.equals(gc)) col.add(s);
                    }
                }

                return col;
            }

            @Override
            public Registration addValueChangeListener(ValueChangeListener valueChangeListener) {
                return tf.addValueChangeListener(valueChangeListener);
            }

            @Override
            public void setRequiredIndicatorVisible(boolean b) {
                tf.setRequiredIndicatorVisible(b);
            }

            @Override
            public boolean isRequiredIndicatorVisible() {
                return tf.isRequiredIndicatorVisible();
            }

            @Override
            public void setReadOnly(boolean b) {
                tf.setReadOnly(b);
            }

            @Override
            public boolean isReadOnly() {
                return tf.isReadOnly();
            }
        }, field.getName());
    }
}
