package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.*;
import com.vaadin.data.converter.StringToDoubleConverter;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.ui.Component;
import com.vaadin.ui.Layout;
import com.vaadin.ui.Slider;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.shared.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;

import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class JPADoubleFieldBuilder extends JPAStringFieldBuilder {

    public boolean isSupported(FieldInterfaced field) {
        return Double.class.equals(field.getType()) || double.class.equals(field.getType());
    }

    @Override
    public Component build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {
        Component r = null;
        if (field.isAnnotationPresent(DecimalMin.class) && field.isAnnotationPresent(DecimalMax.class)) {
            Slider tf;
            container.addComponent(tf = new Slider(new Double(field.getAnnotation(DecimalMin.class).value()), new Double(field.getAnnotation(DecimalMax.class).value()), 1));

            if (allFieldContainers != null && allFieldContainers.size() == 0) tf.focus();

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));

            if (!forSearchFilter) {

                tf.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class) || field.isAnnotationPresent(NotEmpty.class));

            }

            //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());

            bind(binder, tf, field, forSearchFilter);

            addErrorHandler(field, tf);

            r = tf;

        } else r = super.build(field, object, container, binder, validators, stylist, allFieldContainers, forSearchFilter, attachedActions);

        return r;
    }

    protected void bind(MDDBinder binder, Slider tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf);
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        completeBinding(aux, binder, field);
    }

    @Override
    protected void bind(MDDBinder binder, TextField tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf).withConverter(new StringToDoubleConverter((double.class.equals(field.getType()))?0d:null,"Must be a number") {
            @Override
            public String convertToPresentation(Double value, ValueContext context) {
                if (value == null) return "";
                else {
                    //String s = super.convertToPresentation(value, context);
                    String s = "" + value;
                    if (s.endsWith(".0")) s = s.replaceAll("\\.0", "");
                    return s;
                }
            }

            @Override
            public Result<Double> convertToModel(String value, ValueContext context) {
                if (value != null) {
                    if (value.contains(".") && value.contains(",")) value = value.replaceAll("\\.", "");
                    value = value.replaceAll("\\.", ",");
                }
                Result<Double> r = null;
                if (!Strings.isNullOrEmpty(value)) {
                    NumberFormat format = NumberFormat.getInstance(Locale.FRANCE);
                    Number number = null;
                    try {
                        number = format.parse(value.trim());
                        double d = number.doubleValue();
                        r = Result.ok(d);
                    } catch (ParseException e) {
                        r = Result.error(e.getMessage() != null?e.getMessage():e.getClass().getSimpleName());
                    }
                } else {
                    r = Result.ok(double.class.equals(field.getType())?0d:null);
                }
                return r;
            }
        });
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        completeBinding(aux, binder, field);
    }

}
