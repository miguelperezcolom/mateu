package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.ValidationResult;
import com.vaadin.data.Validator;
import com.vaadin.data.ValueContext;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.data.validator.StringLengthValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.UserError;
import com.vaadin.shared.Registration;
import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Layout;
import com.vaadin.ui.themes.ValoTheme;
import com.vaadin.v7.data.Property;
import eu.maxschuster.vaadin.signaturefield.SignatureField;
import io.mateu.mdd.core.annotations.Code;
import io.mateu.mdd.core.annotations.Signature;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import org.vaadin.aceeditor.AceEditor;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class JPASignatureFieldBuilder extends JPAStringFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(Signature.class);
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        if (!forSearchFilter) {

            HorizontalLayout l = new HorizontalLayout();

            SignatureField tf;
            l.addComponent(tf = new SignatureField());




            if (allFieldContainers.size() == 0) tf.focus();

            Button b;
            l.addComponent(b = new Button(VaadinIcons.EXPAND_SQUARE));
            b.addStyleName(ValoTheme.BUTTON_QUIET);
            b.addClickListener(e -> MyUI.get().getNavegador().go(field.getName()));

            container.addComponent(l);

            allFieldContainers.put(field, tf);

            l.setCaption(Helper.capitalize(field.getName()));
        /*
        tf.setDescription();
        tf.setPlaceholder();
        */

            bind(binder, tf, field);

        }

    }


    protected void bind(MDDBinder binder, SignatureField tf, FieldInterfaced field) {
        binder.bind(new HasValue() {
            @Override
            public void setValue(Object o) {
                tf.setValue((String) o);
            }

            @Override
            public Object getValue() {
                return tf.getValue();
            }

            @Override
            public Registration addValueChangeListener(ValueChangeListener valueChangeListener) {
                return null;
            }

            @Override
            public void setRequiredIndicatorVisible(boolean b) {
                tf.setRequired(b);
            }

            @Override
            public boolean isRequiredIndicatorVisible() {
                return tf.isRequired();
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
