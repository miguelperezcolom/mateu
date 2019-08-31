package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ValueChangeMode;
import com.vaadin.ui.*;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;

import java.util.List;
import java.util.Map;

public class JPAPrimitiveArraysFieldBuilder extends JPAStringFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        boolean ok = field.getType().isArray();
        if (ok) {
            ok &= String[].class.equals(field.getType())

                    || Integer[].class.equals(field.getType())
                    || Long[].class.equals(field.getType())
                    || Float[].class.equals(field.getType())
                    || Double[].class.equals(field.getType())
                    || Boolean[].class.equals(field.getType())

                    || int[].class.equals(field.getType())
                    || long[].class.equals(field.getType())
                    || float[].class.equals(field.getType())
                    || double[].class.equals(field.getType())
                    || boolean[].class.equals(field.getType())

            ;
        }
        return ok;
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        if (!forSearchFilter) {

            AbstractTextField tf = (field.isAnnotationPresent(io.mateu.mdd.core.annotations.TextArea.class))?new TextArea():new TextField();
            container.addComponent(tf);
            tf.setValueChangeMode(ValueChangeMode.BLUR);

            if (allFieldContainers != null && allFieldContainers.size() == 0) tf.focus();

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));
        /*
        tf.setDescription();
        tf.setPlaceholder();
        */

            //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());


            bind(binder, tf, field);

        }

    }


    protected void bind(MDDBinder binder, AbstractTextField tf, FieldInterfaced field) {
        binder.bind(new HasValue() {
            @Override
            public void setValue(Object o) {
                String s = "";
                if (o != null) {
                    if (o instanceof int[]) {
                        int[] col = (int[]) o;
                        for (Object v : col) {
                            if (!"".equals(s)) s += (tf instanceof TextArea) ? "\n" : ",";
                            s += v;
                        }
                    } else if (o instanceof long[]) {
                        long[] col = (long[]) o;
                        for (Object v : col) {
                            if (!"".equals(s)) s += (tf instanceof TextArea)?"\n":",";
                            s += v;
                        }
                    } else if (o instanceof float[]) {
                        float[] col = (float[]) o;
                        for (Object v : col) {
                            if (!"".equals(s)) s += (tf instanceof TextArea)?"\n":",";
                            s += v;
                        }
                    } else if (o instanceof double[]) {
                        double[] col = (double[]) o;
                        for (Object v : col) {
                            if (!"".equals(s)) s += (tf instanceof TextArea)?"\n":",";
                            s += v;
                        }
                    } else if (o instanceof boolean[]) {
                        boolean[] col = (boolean[]) o;
                        for (Object v : col) {
                            if (!"".equals(s)) s += (tf instanceof TextArea)?"\n":",";
                            s += v;
                        }
                    } else {
                        Object[] col = (Object[]) o;
                        for (Object v : col) {
                            if (!"".equals(s)) s += (tf instanceof TextArea)?"\n":",";
                            s += v;
                        }
                    }
                }
                tf.setValue(s);
            }

            @Override
            public Object getValue() {

                Object r = null;


                if (!Strings.isNullOrEmpty(tf.getValue())) {
                    String[] tokens = tf.getValue().split((tf instanceof TextArea) ? "\\\n" : "[, ]");

                    if (Integer[].class.equals(field.getType())) {
                        Integer[] x = new Integer[tokens.length];
                        for (int i = 0; i < tokens.length; i++) x[i] = new Integer(tokens[i]);
                        r = x;
                    } else if (int[].class.equals(field.getType())) {
                        int[] x = new int[tokens.length];
                        for (int i = 0; i < tokens.length; i++) x[i] = new Integer(tokens[i]);
                        r = x;
                    } else if (Long[].class.equals(field.getType())) {
                        Long[] x = new Long[tokens.length];
                        for (int i = 0; i < tokens.length; i++) x[i] = new Long(tokens[i]);
                        r = x;
                    } else if (long[].class.equals(field.getType())) {
                        long[] x = new long[tokens.length];
                        for (int i = 0; i < tokens.length; i++) x[i] = new Long(tokens[i]);
                        r = x;
                    } else if (Float[].class.equals(field.getType())) {
                        Float[] x = new Float[tokens.length];
                        for (int i = 0; i < tokens.length; i++) x[i] = new Float(tokens[i]);
                        r = x;
                    } else if (float[].class.equals(field.getType())) {
                        float[] x = new float[tokens.length];
                        for (int i = 0; i < tokens.length; i++) x[i] = new Float(tokens[i]);
                        r = x;
                    } else if (Double[].class.equals(field.getType())) {
                        Double[] x = new Double[tokens.length];
                        for (int i = 0; i < tokens.length; i++) x[i] = new Double(tokens[i]);
                        r = x;
                    } else if (double[].class.equals(field.getType())) {
                        double[] x = new double[tokens.length];
                        for (int i = 0; i < tokens.length; i++) x[i] = new Double(tokens[i]);
                        r = x;
                    } else if (Boolean[].class.equals(field.getType())) {
                        Boolean[] x = new Boolean[tokens.length];
                        for (int i = 0; i < tokens.length; i++) x[i] = new Boolean(tokens[i]);
                        r = x;
                    } else if (boolean[].class.equals(field.getType())) {
                        boolean[] x = new boolean[tokens.length];
                        for (int i = 0; i < tokens.length; i++) x[i] = new Boolean(tokens[i]);
                        r = x;
                    } else if (String[].class.equals(field.getType())) {
                        r = tokens;
                    }
                }

                return r;
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
