package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.*;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.ErrorMessage;
import com.vaadin.server.ExternalResource;
import com.vaadin.server.SerializablePredicate;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ErrorLevel;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.interfaces.Choice;
import io.mateu.mdd.shared.interfaces.Option;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;
import io.mateu.util.persistence.JPAHelper;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Query;
import javax.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

public class ChoiceFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return Choice.class.isAssignableFrom(field.getType());
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        Component r = null;

        Component tf = null;
        HasValue hv = null;
        com.vaadin.data.provider.DataProvider dp = null;

        AbstractComponent captionOwner = null;

        Converter converter = null;

        Button botonLink = null;

        {


            HorizontalLayout hl;


            if (field.getType().isAnnotationPresent(UseIdToSelect.class)) {

            } else {

                tf = hl = new HorizontalLayout();
                hl.setDefaultComponentAlignment(Alignment.BOTTOM_LEFT);
                hl.setWidthFull();
                container.addComponent(hl);


                if (!forSearchFilter && field.isAnnotationPresent(UseRadioButtons.class)) {

                    RadioButtonGroup rbg;
                    hl.addComponent(rbg = new RadioButtonGroup());

                    hv = rbg;

                    addErrorHandler(field, rbg);

                    r = rbg;

                    captionOwner = rbg;

                    setDataProvider(rbg, field, binder);


                    if (!forSearchFilter) rbg.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));


                } else {

                    ComboBox cb;
                    hl.addComponent(cb = new ComboBox());
                    cb.setId(field.getId());
                    cb.setWidth("100%");

                    captionOwner = cb;

                    addErrorHandler(field, cb);

                    r = cb;

                    cb.addStyleName("combo");

                    if (field.isAnnotationPresent(Width.class)) cb.setWidth(field.getAnnotation(Width.class).value());


                    if (field.isAnnotationPresent(RequestFocus.class)) cb.focus();

                    hv = cb;

                    setDataProvider(cb, field, binder);

                    cb.addValueChangeListener(e -> {
                        try {
                            ((Choice)ReflectionHelper.getValue(field, binder.getBean())).setValue((Option) e.getValue());
                            cb.setComponentError(null);
                        } catch (Exception ex) {
                            Notifier.alert(ex);
                        }
                    });

                }


            }


            if (!forSearchFilter && !field.isAnnotationPresent(UseRadioButtons.class)) {
                hv.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));
            }

        }


        if (allFieldContainers != null) allFieldContainers.put(field, tf);

        captionOwner.setCaption(ReflectionHelper.getCaption(field));

        bind(binder, hv, field, forSearchFilter, captionOwner, converter);

        return r;
    }

    public static void setDataProvider(HasItems hdp, FieldInterfaced field, MDDBinder binder) {

        try {

            Choice choice = (Choice) ReflectionHelper.getValue(field, binder.getBean());

            com.vaadin.data.provider.DataProvider dp = new ListDataProvider(choice.getOptions());

            ItemCaptionGenerator icg = null;

            Method micg = ReflectionHelper.getMethod(field.getDeclaringClass(), ReflectionHelper.getGetter(field.getName()) + "ItemCaptionGenerator");

            if (micg != null) {

                icg = (ItemCaptionGenerator) micg.invoke(binder.getBean());

            } else {

                icg = (i) -> {
                    if (i instanceof Option) return ((Option) i).getCaption();
                    else return "" + i;
                };

            }

            if (hdp instanceof RadioButtonGroup) {
                if (dp != null) ((RadioButtonGroup)hdp).setDataProvider(dp);
                if (icg != null) ((RadioButtonGroup)hdp).setItemCaptionGenerator(icg);
            } else if (hdp instanceof CheckBoxGroup) {
                if (dp != null) ((CheckBoxGroup)hdp).setDataProvider(dp);
                if (icg != null) ((CheckBoxGroup)hdp).setItemCaptionGenerator(icg);
            } else if (hdp instanceof ComboBox) {
                if (dp != null) ((ComboBox)hdp).setDataProvider(dp, f -> new SerializablePredicate() {
                    @Override
                    public boolean test(Object o) {
                        String s = (String) f;
                        return  o != null && (Strings.isNullOrEmpty(s) || ((ComboBox)hdp).getItemCaptionGenerator().apply(o).toLowerCase().contains(((String) s).toLowerCase()));
                    }
                });
                if (icg != null) ((ComboBox)hdp).setItemCaptionGenerator(icg);
            } else if (hdp instanceof TwinColSelect) {
                if (dp != null) ((TwinColSelect)hdp).setDataProvider(dp);
                if (icg != null) ((TwinColSelect)hdp).setItemCaptionGenerator(icg);
            } else if (hdp instanceof Grid) {
                if (dp != null) ((Grid)hdp).setDataProvider(dp);
            }


            if (hdp instanceof ComboBox && field.isAnnotationPresent(NotNull.class)) {
                com.vaadin.data.provider.Query q = new com.vaadin.data.provider.Query();
                if (((ComboBox)hdp).getDataProvider().size(q) == 1) {
                    Object v = null;
                    v = ((ComboBox)hdp).getDataProvider().fetch(q).findFirst().get();

                    Object bean = binder.getBean();
                    if (bean != null && ReflectionHelper.getValue(field, bean) == null) {
                        ReflectionHelper.setValue(field, bean, v);
                        binder.setBean(bean, false);
                    }
                }
            }


        } catch (Throwable t) {
            Notifier.alert(t);
        }

    }

    public Object convert(String s) {
        return s;
    }

    protected void bind(MDDBinder binder, HasValue tf, FieldInterfaced field, boolean forSearchFilter, AbstractComponent captionOwner, Converter converter) {
        Binder.BindingBuilder aux = binder.forField(new HasValue() {
            @Override
            public void setValue(Object o) {
                if (o != null) {
                    try {
                        Choice choice = (Choice) ReflectionHelper.getValue(field, binder.getBean());
                        if (o instanceof Option) {
                            choice.setValue((Option) o);
                        }
                        tf.setValue(choice.getValue());
                    } catch (Exception e) {
                        Notifier.alert(e);
                    }
                }
            }

            @Override
            public Object getValue() {
                try {
                    Choice choice = (Choice) ReflectionHelper.getValue(field, binder.getBean());
                    return choice;
                } catch (Exception e) {
                    Notifier.alert(e);
                    return null;
                }
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
                return tf.isRequiredIndicatorVisible();
            }

            @Override
            public void setReadOnly(boolean b) {

            }

            @Override
            public boolean isReadOnly() {
                return false;
            }
        });
        //aux.bind(field.getName());
        completeBinding(aux, binder, field, captionOwner);
    }

}
