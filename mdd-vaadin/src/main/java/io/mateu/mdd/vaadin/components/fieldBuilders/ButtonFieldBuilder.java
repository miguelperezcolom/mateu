package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.server.Resource;
import com.vaadin.shared.Registration;
import com.vaadin.ui.Component;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Layout;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.Button;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;
import io.mateu.util.runnable.RunnableThrowsThrowable;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;

public class ButtonFieldBuilder extends AbstractFieldBuilder {
    @Override
    public boolean isSupported(FieldInterfaced field) {
        return Button.class.isAssignableFrom(field.getType())
                || Runnable.class.isAssignableFrom(field.getType())
                || Callable.class.isAssignableFrom(field.getType());
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {
        HorizontalLayout hl;
        container.addComponent(hl = new HorizontalLayout());
        hl.addStyleName(CSS.NOPADDING);
        hl.setCaption("");
        bind(binder, hl, field);
        return hl;
    }

    private void bind(MDDBinder binder, HorizontalLayout hl, FieldInterfaced field) {
        binder.forField(new HasValue() {

            Object v = null;

            @Override
            public void setValue(Object o) {
                hl.removeAllComponents();
                v = o;
                if (v != null) {
                    com.vaadin.ui.Button b = new com.vaadin.ui.Button();
                    hl.addComponent(b);
                    b.setCaption(getCaption(field, v));
                    b.setIcon(getIcon(v));
                    b.setPrimaryStyleName("");
                    b.setStyleName("");
                    b.setId(field.getId());
                    b.addStyleName("mddbutton");
                    b.addStyleName("test-" + field.getId());
                    getStyles(v).forEach(s -> b.addStyleName(s));
                    b.addClickListener(e -> {
                        try {
                            getRunnable(v).run();
                        } catch (Throwable throwable) {
                            Notifier.alert(throwable);
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

    private RunnableThrowsThrowable getRunnable(Object v) {
        if (v instanceof Button) return ((Button) v).getRunnable();
        if (v instanceof Runnable) return () -> ((Runnable) v).run();
        if (v instanceof RunnableThrowsThrowable) return (RunnableThrowsThrowable) v;
        if (v instanceof Callable) return () -> Notifier.info("" + ((Callable<?>) v).call());
        return () -> Notifier.alert("" + v + " is not runnable");
    }

    private List<String> getStyles(Object v) {
        if (v instanceof Button) return ((Button) v).getStyles();
        return new ArrayList<>();
    }

    private Resource getIcon(Object v) {
        if (v instanceof Button) return ((Button) v).getIcon();
        return null;
    }

    private String getCaption(FieldInterfaced field, Object v) {
        if (v instanceof Button) return ((Button) v).getCaption();
        return ReflectionHelper.getCaption(field);
    }
}
