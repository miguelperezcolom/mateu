package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.shared.Registration;
import com.vaadin.ui.Component;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Layout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.Button;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;

import java.util.List;
import java.util.Map;

public class ButtonFieldBuilder extends AbstractFieldBuilder {
    @Override
    public boolean isSupported(FieldInterfaced field) {
        return Button.class.isAssignableFrom(field.getType());
    }

    @Override
    public Component build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {
        HorizontalLayout hl;
        container.addComponent(hl = new HorizontalLayout());
        hl.addStyleName(CSS.NOPADDING);
        hl.setCaption("");
        bind(binder, hl, field);
        return hl;
    }

    private void bind(MDDBinder binder, HorizontalLayout hl, FieldInterfaced field) {
        binder.forField(new HasValue() {

            Button v = null;

            @Override
            public void setValue(Object o) {
                hl.removeAllComponents();
                v = (Button) o;
                if (v != null) {
                    com.vaadin.ui.Button b = new com.vaadin.ui.Button();
                    hl.addComponent(b);
                    b.setCaption(v.getCaption());
                    b.setIcon(v.getIcon());
                    b.setPrimaryStyleName("");
                    b.setStyleName("");
                    b.addStyleName(ValoTheme.BUTTON_QUIET);
                    b.addStyleName("mddbutton");
                    v.getStyles().forEach(s -> b.addStyleName(s));
                    b.addClickListener(e -> {
                        try {
                            v.getRunnable().run();
                        } catch (Throwable throwable) {
                            MDD.alert(throwable);
                        }
                        if (binder.getViewComponent() instanceof EditorViewComponent) binder.update(binder.getBean());
                    });
                }
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
