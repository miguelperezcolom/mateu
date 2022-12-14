package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.Binder;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.Component;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Layout;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.annotations.RequestFocus;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.components.fieldBuilders.components.LiteralComponent;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.interfaces.Translated;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

public class JPALiteralFieldBuilder extends AbstractFieldBuilder {


    private Translated literal;

    public boolean isSupported(FieldInterfaced field) {
        return Translated.class.isAssignableFrom(field.getType());
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        LiteralComponent c;
        container.addComponent(c = new LiteralComponent(field, binder));

        if (field.isAnnotationPresent(RequestFocus.class)) c.focus();

        allFieldContainers.put(field, c);

        if (container.getComponentCount() > 0) c.setCaption(ReflectionHelper.getCaption(field));

        if (!forSearchFilter) {

            c.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class) || field.isAnnotationPresent(NotEmpty.class));

        }

        //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) c.setDescription(field.getAnnotation(Help.class).value());


        bind(binder, c, field, forSearchFilter);

        addErrorHandler(field, c);

        return c;
    }


    protected void bind(MDDBinder binder, LiteralComponent c, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(c);
        //if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        completeBinding(aux, binder, field);
    }
}
