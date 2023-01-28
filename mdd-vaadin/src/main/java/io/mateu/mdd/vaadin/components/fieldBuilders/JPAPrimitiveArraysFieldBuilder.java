package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.*;
import com.vaadin.shared.ui.ValueChangeMode;
import com.vaadin.ui.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.annotations.RequestFocus;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;

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

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        Component r = null;

        if (!forSearchFilter) {

            AbstractTextField tf = (field.isAnnotationPresent(io.mateu.mdd.shared.annotations.TextArea.class))?new TextArea():new TextField();
            container.addComponent(tf);
            tf.setId(field.getId());
            tf.setStyleName("test-" + field.getId());
            tf.setValueChangeMode(ValueChangeMode.BLUR);

            addErrorHandler(field, tf);

            r = tf;

            if (field.isAnnotationPresent(RequestFocus.class)) tf.focus();

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));
        /*
        tf.setDescription();
        tf.setPlaceholder();
        */

            //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());


            bind(binder, tf, field);

        }

        return r;
    }


    protected void bind(MDDBinder binder, AbstractTextField tf, FieldInterfaced field) {
        Binder.BindingBuilder aux = binder.forField(tf).withConverter(new Converter() {
            @Override
            public Result convertToModel(Object o, ValueContext valueContext) {
                Object r = null;

                String s = (String) o;

                if (!Strings.isNullOrEmpty(s)) {
                    String[] tokens = s.split((tf instanceof TextArea) ? "\\\n" : "[, ]");

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
                        if (tokens.length == 1 && (tokens[0].contains("0") || tokens[0].contains("1"))) {
                            String t = tokens[0];
                            Boolean[] x = new Boolean[t.length()];
                            for (int i = 0; i < t.length(); i++) x[i] = new Boolean("1".equals(t.substring(i, i + 1))?"true":"false");
                            r = x;
                        } else {
                            Boolean[] x = new Boolean[tokens.length];
                            for (int i = 0; i < tokens.length; i++) x[i] = new Boolean(tokens[i]);
                            r = x;
                        }
                    } else if (boolean[].class.equals(field.getType())) {
                        if (tokens.length == 1 && (tokens[0].contains("0") || tokens[0].contains("1"))) {
                            String t = tokens[0];
                            boolean[] x = new boolean[t.length()];
                            for (int i = 0; i < t.length(); i++) x[i] = new Boolean("1".equals(t.substring(i, i + 1))?"true":"false");
                            r = x;
                        } else {
                            boolean[] x = new boolean[tokens.length];
                            for (int i = 0; i < tokens.length; i++) x[i] = new Boolean(tokens[i]);
                            r = x;
                        }
                    } else if (String[].class.equals(field.getType())) {
                        r = tokens;
                    }
                }

                return Result.ok(r);
            }

            @Override
            public Object convertToPresentation(Object o, ValueContext valueContext) {
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
                            if (!"".equals(s)) s += (tf instanceof TextArea) ? "\n" : ",";
                            s += v;
                        }
                    } else if (o instanceof float[]) {
                        float[] col = (float[]) o;
                        for (Object v : col) {
                            if (!"".equals(s)) s += (tf instanceof TextArea) ? "\n" : ",";
                            s += v;
                        }
                    } else if (o instanceof double[]) {
                        double[] col = (double[]) o;
                        for (Object v : col) {
                            if (!"".equals(s)) s += (tf instanceof TextArea) ? "\n" : ",";
                            s += v;
                        }
                    } else if (o instanceof boolean[]) {
                        boolean[] col = (boolean[]) o;
                        for (Object v : col) {
                            if (!"".equals(s)) s += (tf instanceof TextArea) ? "\n" : "";
                            s += ((boolean)v)?"1":"0";
                        }
                    } else {
                        Object[] col = (Object[]) o;
                        for (Object v : col) {
                            if (!"".equals(s)) s += (tf instanceof TextArea) ? "\n" : ",";
                            s += v;
                        }
                    }
                }
                return s;
            }
        });

        completeBinding(aux, binder, field);
    }
}
