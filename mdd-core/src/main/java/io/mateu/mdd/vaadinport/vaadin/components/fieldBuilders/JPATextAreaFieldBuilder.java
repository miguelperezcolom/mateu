package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.ValidationResult;
import com.vaadin.data.Validator;
import com.vaadin.data.ValueContext;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.data.validator.StringLengthValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.UserError;
import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Layout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.annotations.TextArea;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class JPATextAreaFieldBuilder extends JPAStringFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(TextArea.class);
    }

    public Component build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        Component r = null;

        if (forSearchFilter) {

            r = super.build(field, object, container, binder, validators, stylist, allFieldContainers, forSearchFilter, attachedActions);

        } else {

            HorizontalLayout l = new HorizontalLayout();

            com.vaadin.ui.TextArea tf;
            l.addComponent(tf = new com.vaadin.ui.TextArea());
            tf.setWidth("370px");

            addErrorHandler(tf);

            r = tf;

            if (allFieldContainers != null && allFieldContainers.size() == 0) tf.focus();

            Button b;
            l.addComponent(b = new Button(VaadinIcons.EXPAND_SQUARE));
            b.addStyleName(ValoTheme.BUTTON_QUIET);
            b.addClickListener(e -> MDDUI.get().getNavegador().go(field.getName()));

            container.addComponent(l);

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) l.setCaption(ReflectionHelper.getCaption(field));

            validators.put(tf, new ArrayList<>());

            tf.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
                @Override
                public void valueChange(HasValue.ValueChangeEvent<String> valueChangeEvent) {
                    ValidationResult result = null;
                    for (Validator v : validators.get(tf)) {
                        result = v.apply(valueChangeEvent.getValue(), new ValueContext(tf));
                        if (result.isError()) break;
                    }
                    if (result != null && result.isError()) {
                        tf.setComponentError(new UserError(result.getErrorMessage()));
                    } else {
                        tf.setComponentError(null);
                    }
                }
            });

            tf.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));

            if (field.isAnnotationPresent(NotNull.class) || field.isAnnotationPresent(NotEmpty.class)) validators.get(tf).add(new StringLengthValidator("Required field", 1, Integer.MAX_VALUE));

            BeanValidator bv = new BeanValidator(field.getDeclaringClass(), field.getName());

            validators.get(tf).add(new Validator() {

                @Override
                public ValidationResult apply(Object o, ValueContext valueContext) {
                    return bv.apply(o, valueContext);
                }

                @Override
                public Object apply(Object o, Object o2) {
                    return null;
                }
            });

            addValidators(validators.get(tf));

        /*
        tf.setDescription();
        tf.setPlaceholder();
        */

            //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());


            bind(binder, tf, field);

        }

        return r;
    }

    public void addValidators(List<Validator> validators) {
    }

    protected void bind(MDDBinder binder, com.vaadin.ui.TextArea tf, FieldInterfaced field) {
        completeBinding(tf, binder, field);
    }
}
