package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.*;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.data.validator.StringLengthValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.UserError;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.Height;
import io.mateu.mdd.shared.annotations.RequestFocus;
import io.mateu.mdd.shared.annotations.TextArea;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class JPATextAreaFieldBuilder extends JPAStringFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(TextArea.class);
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        Component r = null;

        if (forSearchFilter) {

            r = super.build(fieldGroup, fieldGroupHeader, field, object, container, binder, validators, stylist, allFieldContainers, forSearchFilter, attachedActions);

        } else {

            HorizontalLayout l = new HorizontalLayout();
            l.setWidthFull();
            com.vaadin.ui.TextArea tf;
            l.addComponent(tf = new com.vaadin.ui.TextArea());
            tf.setId(field.getId());
            tf.addStyleName("test-" + field.getId());
            //tf.setWidth("370px");
            tf.setWidthFull();
            if (field.isAnnotationPresent(Height.class)) tf.setHeight(field.getAnnotation(Height.class).value());
            l.setExpandRatio(tf, 1);

            addErrorHandler(field, tf);

            r = tf;

            if (field.isAnnotationPresent(RequestFocus.class)) tf.focus();

            Button b;
            l.addComponent(b = new Button(VaadinIcons.EXPAND_SQUARE));
            b.addStyleName(ValoTheme.BUTTON_QUIET);
            b.addClickListener(e -> MDDUIAccessor.go(field.getName()));

            container.addComponent(l);

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            if (container.getComponentCount() > 0) l.setCaption(ReflectionHelper.getCaption(field));

            validators.put(tf, new ArrayList<>());

            if (validateOnChange()) tf.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
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

            tf.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class) || field.isAnnotationPresent(NotEmpty.class));

            if (field.isAnnotationPresent(NotNull.class) || field.isAnnotationPresent(NotEmpty.class)) validators.get(tf).add(new StringLengthValidator("Required field", 1, Integer.MAX_VALUE));

            addErrorHandler(field, tf);

            bind(binder, tf, field, forSearchFilter);
        }

        return r;
    }

    protected boolean validateOnChange() {
        return true;
    }

    protected void bind(MDDBinder binder, com.vaadin.ui.TextArea tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf);
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getId());
    }

}
