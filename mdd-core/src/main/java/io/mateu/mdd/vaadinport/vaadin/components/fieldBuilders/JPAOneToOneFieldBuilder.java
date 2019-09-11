package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.vaadin.data.*;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.UserError;
import com.vaadin.shared.ui.ErrorLevel;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.DataProvider;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import javax.persistence.Entity;
import javax.persistence.OneToOne;
import javax.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class JPAOneToOneFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(OneToOne.class);
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        if (forSearchFilter) {

            // todo: añadir este campo?

        } else {

            ComboBox tf;
            HorizontalLayout hl = new HorizontalLayout(tf = new ComboBox());
            hl.addStyleName(CSS.NOPADDING);
            container.addComponent(hl);


            if (allFieldContainers != null && allFieldContainers.size() == 0) tf.focus();

            if (field.isAnnotationPresent(DataProvider.class)) {

                try {

                    DataProvider a = field.getAnnotation(DataProvider.class);

                    ((HasDataProvider)tf).setDataProvider(a.dataProvider().newInstance());

                    tf.setItemCaptionGenerator(a.itemCaptionGenerator().newInstance());

                } catch (InstantiationException e) {
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                }

            } else {
                try {
                    Helper.notransact((em) -> tf.setDataProvider(new JPQLListDataProvider(em, field)));
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
            }


            FieldInterfaced fName = ReflectionHelper.getNameField(field.getType());
            if (fName != null) tf.setItemCaptionGenerator((i) -> {
                try {
                    return "" + ReflectionHelper.getValue(fName, i);
                } catch (NoSuchMethodException e) {
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                }
                return "Error";
            });

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            hl.setCaption(ReflectionHelper.getCaption(field));

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

            if (field.isAnnotationPresent(NotNull.class)) validators.get(tf).add(new Validator() {
                @Override
                public ValidationResult apply(Object o, ValueContext valueContext) {
                    ValidationResult r = null;
                    if (o == null) r = ValidationResult.create("Required field", ErrorLevel.ERROR);
                    else r = ValidationResult.ok();
                    return r;
                }

                @Override
                public Object apply(Object o, Object o2) {
                    return null;
                }
            });

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



            if (field.getType().isAnnotationPresent(Entity.class)) {

                Button b = null;

                com.vaadin.data.provider.DataProvider dpx = tf.getDataProvider();

                if (dpx != null && dpx instanceof JPQLListDataProvider) {
                    b = new Button(null, VaadinIcons.REFRESH);
                    b.addStyleName(ValoTheme.BUTTON_QUIET);
                    b.addStyleName(CSS.NOPADDING);
                    b.addClickListener(e -> ((JPQLListDataProvider)dpx).refresh());
                    hl.addComponent(b);
                }

                b = new Button(null, VaadinIcons.EDIT);
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                b.addStyleName(CSS.NOPADDING);
                b.addClickListener(e -> MDDUI.get().getNavegador().go(field.getName()));
                hl.addComponent(b);

                b = new Button(null, VaadinIcons.PLUS);
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                b.addStyleName(CSS.NOPADDING);
                b.addClickListener(e -> {

                        /*
                        Object bean = binder.getBean();
                        try {
                            ReflectionHelper.setValue(field, bean, null);
                            binder.setBean(bean, false);

                            MDDUI.get().getNavegador().go(field.getName());


                        } catch (Exception e1) {
                            MDD.alert(e1);
                        }
                        */
                    MDDUI.get().getNavegador().go(field.getName() + "_new");

                });
                hl.addComponent(b);

            }



            bind(binder, tf, field, forSearchFilter, tf.getDataProvider());


        }

    }

    public Object convert(String s) {
        return s;
    }

    public void addValidators(List<Validator> validators) {
    }

    protected void bind(MDDBinder binder, ComboBox tf, FieldInterfaced field, boolean forSearchFilter, com.vaadin.data.provider.DataProvider dp) {
        binder.bind(tf, field.getName());

        Binder.BindingBuilder aux = binder.forField(tf);
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        Binder.Binding binding = aux.bind(field.getName());

        if (dp != null && dp instanceof JPQLListDataProvider) {
            JPQLListDataProvider ldp = (JPQLListDataProvider) dp;
            binding.getField().addValueChangeListener(e -> {
                ldp.refresh();
            });
        }

        if (!forSearchFilter && field.getDeclaringClass() != null && field.getType().isAnnotationPresent(Entity.class)) {
            binding.getField().addValueChangeListener(e -> {
                Object bean = binder.getBean();
                try {
                    if (e.getOldValue() != null) ReflectionHelper.unReverseMap(binder, field, bean, e.getOldValue());
                    if (e.getValue() != null) ReflectionHelper.reverseMap(binder, field, bean, e.getValue());
                } catch (Exception e1) {
                    MDD.alert(e1);
                }
            });
        }
    }
}
