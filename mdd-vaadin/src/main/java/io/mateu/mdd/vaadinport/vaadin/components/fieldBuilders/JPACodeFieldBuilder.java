package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
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
import io.mateu.mdd.core.annotations.Code;
import io.mateu.mdd.core.annotations.Help;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import org.vaadin.aceeditor.AceEditor;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class JPACodeFieldBuilder extends JPAStringFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(Code.class);
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        if (!forSearchFilter) {

            HorizontalLayout l = new HorizontalLayout();

            AceEditor tf;
            l.addComponent(tf = new AceEditor());

            tf.setMode(field.getAnnotation(Code.class).mode());
            tf.setTheme(field.getAnnotation(Code.class).theme());

// Use worker (if available for the current mode)
            tf.setUseWorker(true);


            if (allFieldContainers.size() == 0) tf.focus();

            Button b;
            l.addComponent(b = new Button(VaadinIcons.EXPAND_SQUARE));
            b.addStyleName(ValoTheme.BUTTON_QUIET);
            b.addClickListener(e -> MDDUI.get().getNavegador().go(field.getName()));

            container.addComponent(l);

            allFieldContainers.put(field, tf);

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

            //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());


            if (field.isAnnotationPresent(NotNull.class)) validators.get(tf).add(new StringLengthValidator("Required field", 1, Integer.MAX_VALUE));

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

            bind(binder, tf, field);

        }

    }

    public void addValidators(List<Validator> validators) {
    }

    protected void bind(MDDBinder binder, AceEditor tf, FieldInterfaced field) {
        binder.bind(tf, field.getName());
    }
}
