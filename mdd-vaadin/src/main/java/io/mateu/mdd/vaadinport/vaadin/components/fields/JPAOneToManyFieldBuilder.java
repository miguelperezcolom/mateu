package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.vaadin.data.HasValue;
import com.vaadin.data.ValidationResult;
import com.vaadin.data.Validator;
import com.vaadin.data.ValueContext;
import com.vaadin.data.provider.DataProvider;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.server.UserError;
import com.vaadin.shared.ui.ErrorLevel;
import com.vaadin.ui.Component;
import com.vaadin.ui.Grid;
import com.vaadin.ui.Layout;
import com.vaadin.ui.TwinColSelect;
import io.mateu.mdd.core.annotations.UseTwinCols;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.components.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ListViewComponent;
import io.mateu.mdd.vaadinport.vaadin.data.MDDBinder;

import javax.persistence.CascadeType;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class JPAOneToManyFieldBuilder extends JPAFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(OneToMany.class);
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers) {




        OneToMany aa = field.getAnnotation(OneToMany.class);

        boolean owned = false;
        if (aa.cascade() != null) for (CascadeType ct : aa.cascade()) {
            if (CascadeType.ALL.equals(ct) || CascadeType.REMOVE.equals(ct)) {
                owned = true;
                break;
            }
        }


        if (owned) {


            Grid g = new Grid();

            g.setCaption(Helper.capitalize(field.getName()));

            container.addComponent(g);


        } else if (field.isAnnotationPresent(UseTwinCols.class)) {

            TwinColSelect<Object> tf = new TwinColSelect(Helper.capitalize(field.getName()));
            tf.setRows(10);
            tf.setLeftColumnCaption("Available options");
            tf.setRightColumnCaption("Selected options");

            //tf.addValueChangeListener(event -> Notification.show("Value changed:", String.valueOf(event.getValue()), Type.TRAY_NOTIFICATION));

            container.addComponent(tf);

            try {
                Helper.notransact((em) -> tf.setDataProvider(new JPQLListDataProvider(em, field.getGenericClass())));
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }


            FieldInterfaced fName = ReflectionHelper.getNameField(field.getGenericClass());
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

            allFieldContainers.put(field, tf);

            tf.setCaption(Helper.capitalize(field.getName()));

            validators.put(tf, new ArrayList<>());

            tf.addValueChangeListener(new HasValue.ValueChangeListener<Set<Object>>() {
                @Override
                public void valueChange(HasValue.ValueChangeEvent<Set<Object>> valueChangeEvent) {

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


            tf.setRequiredIndicatorVisible(field.isAnnotationPresent(Size.class));

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


            // todo: esto es necesario?
            if (field.isAnnotationPresent(Size.class)) validators.get(tf).add(new Validator() {
                @Override
                public ValidationResult apply(Object o, ValueContext valueContext) {
                    ValidationResult r = null;
                    if (o == null || ((List)o).size() < field.getAnnotation(Size.class).min() ) r = ValidationResult.create("Required field", ErrorLevel.ERROR);
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

        /*
        tf.setDescription();
        tf.setPlaceholder();
        */

            bind(binder, tf, field);

        } else {

            Grid g = new Grid();

            ListViewComponent.buildColumns(g, ListViewComponent.getColumnFields(field.getGenericClass()), false);

            // añadimos columna para que no haga feo
            g.addColumn((d) -> null).setWidthUndefined().setCaption("");

            g.setCaption(Helper.capitalize(field.getName()));

            container.addComponent(g);

            bind(binder, g, field);

            //todo: añadir botones  y -
            //todo: añadir y editar registros
            //todo:

        }

    }

    public Object convert(String s) {
        return s;
    }

    public void addValidators(List<Validator> validators) {
    }

    protected void bind(MDDBinder binder, Grid g, FieldInterfaced field) {
        binder.bindOneToMany(g, field.getName());
    }

    protected void bind(MDDBinder binder, TwinColSelect<Object> tf, FieldInterfaced field) {
        binder.bindOneToMany(tf, field.getName());
    }
}
