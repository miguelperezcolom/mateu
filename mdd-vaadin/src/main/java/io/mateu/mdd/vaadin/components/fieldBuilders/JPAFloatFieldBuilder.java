package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.*;
import com.vaadin.data.converter.StringToFloatConverter;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.ui.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.annotations.RequestFocus;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
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

public class JPAFloatFieldBuilder extends JPAStringFieldBuilder {

    public boolean isSupported(FieldInterfaced field) {
        return Float.class.equals(field.getType()) || float.class.equals(field.getType());
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {
        Component r = null;
        if (field.isAnnotationPresent(DecimalMin.class) && field.isAnnotationPresent(DecimalMax.class)) {
            Slider tf;
            container.addComponent(tf = new Slider(new Float(field.getAnnotation(DecimalMin.class).value()), new Float(field.getAnnotation(DecimalMax.class).value()), 1));

            if (field.isAnnotationPresent(RequestFocus.class)) tf.focus();

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));

            if (!forSearchFilter) {

                tf.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class) || field.isAnnotationPresent(NotEmpty.class));

            }

            //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());

            bind(binder, tf, field, forSearchFilter);

            addErrorHandler(field, tf);

            r = tf;

        } else r = super.build(fieldGroup, fieldGroupHeader, field, object, container, binder, validators, stylist, allFieldContainers, forSearchFilter, attachedActions);

        return r;
    }

    protected void bind(MDDBinder binder, Slider tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf);
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        completeBinding(aux, binder, field);
    }

    @Override
    protected void bind(MDDBinder binder, TextField tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf).withConverter(new StringToFloatConverter((float.class.equals(field.getType()))?0f:null,"Must be a number") {
            @Override
            public String convertToPresentation(Float value, ValueContext context) {
                if (value == null) return "";
                else {
                    //String s = super.convertToPresentation(value, context);
                    String s = "" + value;
                    if (s.endsWith(".0")) s = s.replaceAll("\\.0", "");
                    return s;
                }
            }

            @Override
            public Result<Float> convertToModel(String value, ValueContext context) {
                if (value != null) {
                    if (value.contains(".") && value.contains(",")) value = value.replaceAll("\\.", "");
                    value = value.replaceAll("\\.", ",");
                }
                Result<Float> r = null;
                if (!Strings.isNullOrEmpty(value)) {
                    NumberFormat format = NumberFormat.getInstance(Locale.FRANCE);
                    Number number = null;
                    try {
                        number = format.parse(value.trim());
                        float d = number.floatValue();
                        r = Result.ok(d);
                    } catch (ParseException e) {
                        r = Result.error(e.getMessage() != null?e.getMessage():e.getClass().getSimpleName());
                    }
                } else {
                    r = Result.ok(float.class.equals(field.getType())?0f:null);
                }
                return r;
            }
        });
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        completeBinding(aux, binder, field);
    }

}
