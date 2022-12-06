package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.*;
import com.vaadin.data.converter.StringToIntegerConverter;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.ui.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

public class JPAIntegerFieldBuilder extends JPAStringFieldBuilder {

    public boolean isSupported(FieldInterfaced field) {
        return Integer.class.equals(field.getType()) || int.class.equals(field.getType());
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {
        Component r = null;
        if (field.isAnnotationPresent(Min.class) && field.isAnnotationPresent(Max.class)) {
            Slider tf;
            container.addComponent(tf = new Slider(new Long(field.getAnnotation(Min.class).value()).intValue(), new Long(field.getAnnotation(Max.class).value()).intValue()));

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

        } else r = super.build(fieldGroup, fieldGroupHeader, field, object, container, binder, validators, stylist, allFieldContainers, forSearchFilter, attachedActions);
        return r;
    }

    protected void bind(MDDBinder binder, Slider tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf).withConverter(new Converter() {
            @Override
            public Result convertToModel(Object o, ValueContext valueContext) {
                return Result.ok((o != null)?new Double(o.toString()).intValue():null);
            }

            @Override
            public Object convertToPresentation(Object o, ValueContext valueContext) {
                return (o != null)?new Double("" + o):null;
            }
        });
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        completeBinding(aux, binder, field);
    }

    @Override
    protected void bind(MDDBinder binder, TextField tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf).withConverter(new StringToIntegerConverter((int.class.equals(field.getType()))?0:null, "Must be an integer") {
            @Override
            public String convertToPresentation(Integer value, ValueContext context) {
                if (value == null) return "";
                else return "" + value;
                //else return super.convertToPresentation(value, context);
            }
        });
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        completeBinding(aux, binder, field);
    }


}
