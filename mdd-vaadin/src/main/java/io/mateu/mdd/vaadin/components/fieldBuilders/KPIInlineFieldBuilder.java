package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import com.vaadin.ui.Layout;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.KPI;
import io.mateu.mdd.shared.annotations.KPIInline;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;

import java.util.List;
import java.util.Map;

public class KPIInlineFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(KPIInline.class);
    }

    @Override
    public Component build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        VerticalLayout vl = new VerticalLayout();
        container.addComponent(vl);
        vl.addStyleName(field.getAnnotation(KPIInline.class).style());
        vl.setWidth("100%");


        Label t = new Label(ReflectionHelper.getCaption(field));

        Label l = new Label();
        l.addStyleName("valor");
        l.setContentMode(ContentMode.HTML);

        if (CSS.SUPERKPI.equals(field.getAnnotation(KPIInline.class).style())) vl.addComponents(l, t);
        else vl.addComponents(t, l);


        allFieldContainers.put(field, vl);

        //if (container.getComponentCount() > 0) vl.setCaption(ReflectionHelper.getCaption(field));

        //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) vl.setDescription(field.getAnnotation(Help.class).value());

        bind(binder, vl, l, field);

        return null;

    }

    protected void bind(MDDBinder binder, VerticalLayout tf, Label l, FieldInterfaced field) {
        binder.forField(new HasValue() {

            Object v = null;

            @Override
            public void setValue(Object o) {
                v = o;
                String s = "";
                if (v == null) s = "";
                else {
                    if (v instanceof Boolean) {
                        if ((Boolean) v && !field.getAnnotation(KPI.class).reversed()) {
                            s = VaadinIcons.CHECK.getHtml();
                            l.addStyleName(ValoTheme.BUTTON_FRIENDLY);
                        } else {
                            s = VaadinIcons.CLOSE.getHtml();
                            l.addStyleName(ValoTheme.BUTTON_DANGER);
                        }
                        l.addStyleName("centered");
                    } else {
                        s = "" + v;
                    }
                }
                l.setValue(s);
            }

            @Override
            public Object getValue() {
                return v;
            }


            @Override
            public Registration addValueChangeListener(ValueChangeListener valueChangeListener) {
                return null;
            }

            @Override
            public void setRequiredIndicatorVisible(boolean b) {

            }

            @Override
            public boolean isRequiredIndicatorVisible() {
                return false;
            }

            @Override
            public void setReadOnly(boolean b) {

            }

            @Override
            public boolean isReadOnly() {
                return false;
            }
        }).bind(field.getName());
    }
}
