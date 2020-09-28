package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.*;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ValueChangeMode;
import com.vaadin.ui.*;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.shared.annotations.DataProvider;
import io.mateu.mdd.shared.annotations.ValueClass;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.shared.data.MDDBinder;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.persistence.JPAHelper;

import javax.persistence.Entity;
import javax.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;

public class JPAPrimitiveCollectionsFieldBuilder extends JPAStringFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        boolean ok = Collection.class.isAssignableFrom(field.getType());
        if (ok) {
            Class gc = ReflectionHelper.getGenericClass(field, Collection.class, "E");
            ok &= String.class.equals(gc) || Integer.class.equals(gc) || Long.class.equals(gc) || Float.class.equals(gc) || Double.class.equals(gc) || Boolean.class.equals(gc);
        }
        return ok;
    }

    @Override
    public Component build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        Component r = null;

        if (!forSearchFilter) {


            Method mdp = ReflectionHelper.getMethod(field.getDeclaringClass(), ReflectionHelper.getGetter(field.getName()) + "DataProvider");

            if (field.isAnnotationPresent(ValueClass.class) || field.isAnnotationPresent(DataProvider.class) || mdp != null) {

                Component tf = null;
                HasValue hv = null;

                CheckBoxGroup rbg;
                container.addComponent(tf = rbg = new CheckBoxGroup());

                addErrorHandler(field, rbg);

                r = rbg;

                hv = rbg;

                //AbstractBackendDataProvider
                //FetchItemsCallback
                //newItemProvider


                if (mdp != null) {

                    try {
                        ((HasDataProvider) tf).setDataProvider((com.vaadin.data.provider.DataProvider) mdp.invoke(object));
                    } catch (Exception e) {
                        MDD.alert(e);
                    }

                } else if (field.isAnnotationPresent(ValueClass.class)) {

                    ValueClass a = field.getAnnotation(ValueClass.class);

                    ((HasDataProvider) tf).setDataProvider(new JPQLListDataProvider(a.value()));

                } else if (field.isAnnotationPresent(DataProvider.class)) {

                    try {

                        DataProvider a = field.getAnnotation(DataProvider.class);

                        ((HasDataProvider) tf).setDataProvider(a.dataProvider().newInstance());

                        rbg.setItemCaptionGenerator(a.itemCaptionGenerator().newInstance());

                    } catch (InstantiationException e) {
                        e.printStackTrace();
                    } catch (IllegalAccessException e) {
                        e.printStackTrace();
                    }

                } else {

                    try {
                        JPAHelper.notransact((em) -> rbg.setDataProvider(new JPQLListDataProvider(em, field)));
                    } catch (Throwable throwable) {
                        throwable.printStackTrace();
                    }

                    FieldInterfaced fName = ReflectionHelper.getNameField(field.getType());
                    if (fName != null) rbg.setItemCaptionGenerator((i) -> {
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

                }

                if (!forSearchFilter) rbg.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));


                if (allFieldContainers != null) allFieldContainers.put(field, tf);

                if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));


                bind(binder, hv, field, forSearchFilter);

            } else {


                AbstractTextField tf = (field.isAnnotationPresent(io.mateu.mdd.shared.annotations.TextArea.class))?new TextArea():new TextField();
                container.addComponent(tf);
                tf.setValueChangeMode(ValueChangeMode.BLUR);

                addErrorHandler(field, tf);

                r = tf;

                if (allFieldContainers != null && allFieldContainers.size() == 0) tf.focus();

                if (allFieldContainers != null) allFieldContainers.put(field, tf);

                if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));
        /*
        tf.setDescription();
        tf.setPlaceholder();
        */

                //if (field.isAnnotationPresent(Help.class) && !Strings.isNullOrEmpty(field.getAnnotation(Help.class).value())) tf.setDescription(field.getAnnotation(Help.class).value());

                bind(binder, tf, field);

            }



        }

        return r;
    }


    protected void bind(MDDBinder binder, AbstractTextField tf, FieldInterfaced field) {
        HasValue hv = new HasValue() {
            @Override
            public void setValue(Object o) {
                String s = "";
                if (o != null) {
                    Collection col = (Collection) o;
                    for (Object v : col) {
                        if (!"".equals(s)) s += (tf instanceof TextArea) ? "\n" : ",";
                        s += v;
                    }
                }
                tf.setValue(s);
            }

            @Override
            public Object getValue() {

                Collection col = (Set.class.isAssignableFrom(field.getType())) ? new HashSet() : new ArrayList();

                Class gc = ReflectionHelper.getGenericClass(field, Collection.class, "E");

                if (!Strings.isNullOrEmpty(tf.getValue())) {
                    for (String s : tf.getValue().split((tf instanceof TextArea) ? "\\\n" : ",")) {
                        s = s.trim();
                        if (Integer.class.equals(gc)) col.add(new Integer(s));
                        else if (Long.class.equals(gc)) col.add(new Long(s));
                        else if (Double.class.equals(gc)) col.add(new Double(s));
                        else if (Float.class.equals(gc)) col.add(new Float(s));
                        else if (Boolean.class.equals(gc)) col.add(new Boolean(s));
                        else if (String.class.equals(gc)) col.add(s);
                    }
                }

                return col;
            }

            @Override
            public Registration addValueChangeListener(ValueChangeListener valueChangeListener) {
                return tf.addValueChangeListener(valueChangeListener);
            }

            @Override
            public void setRequiredIndicatorVisible(boolean b) {
                tf.setRequiredIndicatorVisible(b);
            }

            @Override
            public boolean isRequiredIndicatorVisible() {
                return tf.isRequiredIndicatorVisible();
            }

            @Override
            public void setReadOnly(boolean b) {
                tf.setReadOnly(b);
            }

            @Override
            public boolean isReadOnly() {
                return tf.isReadOnly();
            }
        };
        completeBinding(hv, binder, field);
    }


    public void bind(MDDBinder binder, HasValue tf, FieldInterfaced field, boolean forSearchFilter) {

        Binder.BindingBuilder aux = binder.forField(tf);

        aux.withConverter(new Converter() {
            @Override
            public Result convertToModel(Object o, ValueContext valueContext) {
                if (o != null) {
                    List s = new ArrayList<>();
                    for (Object x : ((Collection)o)) {
                        s.add((x.getClass().isAnnotationPresent(Entity.class))?ReflectionHelper.getId(x):x);
                    }
                    return Result.ok(s);
                } else return Result.ok(null);
            }

            @Override
            public Object convertToPresentation(Object o, ValueContext valueContext) {
                if (o == null) return new HashSet<>();

                com.vaadin.data.provider.DataProvider dp = null;
                if (tf instanceof HasDataProvider) {
                    dp = ((HasDataProvider)tf).getDataProvider();
                } else if (tf instanceof ComboBox) {
                    dp = ((ComboBox)tf).getDataProvider();
                }
                if (dp != null) {
                    Collection col = (Collection) o;
                    Set s = new HashSet();
                    for (Object z : col) {
                        Optional optional = dp.fetch(new com.vaadin.data.provider.Query()).filter(x -> (x.getClass().equals(z.getClass()))?x.equals(z):ReflectionHelper.getId(x).equals(z)).findFirst();
                        if (optional.isPresent()) s.add(optional.get());
                    }
                    return s;
                } else return o;
            }
        });

        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        completeBinding(aux, binder, field);
    }
}
