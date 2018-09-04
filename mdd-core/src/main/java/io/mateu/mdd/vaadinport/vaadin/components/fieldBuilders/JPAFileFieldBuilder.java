package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.Binder;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.Component;
import com.vaadin.ui.Layout;
import io.mateu.mdd.core.annotations.Help;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.model.common.Resource;
import io.mateu.mdd.core.model.multilanguage.Literal;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.components.FileComponent;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

public class JPAFileFieldBuilder extends AbstractFieldBuilder {


    private Literal literal;

    public boolean isSupported(FieldInterfaced field) {
        return Resource.class.equals(field.getType());
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        FileComponent c;
        container.addComponent(c = new FileComponent(field, binder));

        if (allFieldContainers.size() == 0) c.focus();

        allFieldContainers.put(field, c);

        if (container.getComponentCount() > 0) c.setCaption(ReflectionHelper.getCaption(field));

        if (!forSearchFilter) {

            c.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class) || field.isAnnotationPresent(NotEmpty.class));

        }

        if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) c.setDescription(field.getAnnotation(Help.class).value());


        bind(binder, c, field, forSearchFilter);
    }


    protected void bind(MDDBinder binder, FileComponent c, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(c);
        //if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
    }
}
