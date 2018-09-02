package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.*;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.server.ExternalResource;
import com.vaadin.shared.Registration;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.DataProvider;
import io.mateu.mdd.core.annotations.UseIdToSelect;
import io.mateu.mdd.core.annotations.UseLinkToListView;
import io.mateu.mdd.core.annotations.UseRadioButtons;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.core.data.MDDBinder;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Query;
import javax.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class JPAManyToOneFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(ManyToOne.class);
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        Component tf = null;
        HasValue hv = null;


        if (field.isAnnotationPresent(UseLinkToListView.class)) {

            HorizontalLayout wrap = new HorizontalLayout();
            wrap.setSpacing(true);
            wrap.setDefaultComponentAlignment(Alignment.MIDDLE_LEFT);

            TextField l = new TextField();
            l.setEnabled(false);
            l.addStyleName(ValoTheme.TEXTFIELD_BORDERLESS);
            wrap.addComponent(l);


            hv = new AbstractField() {

                Object v = null;

                @Override
                protected void doSetValue(Object o) {
                    v = o;
                    if (o != null) l.setValue(o.toString());
                    else l.setValue("");
                }

                @Override
                public Object getValue() {
                    return v;
                }
            };

            Button b = new Button("Select");
            b.addStyleName(ValoTheme.BUTTON_LINK);
            b.addClickListener(e -> MDDUI.get().getNavegador().go(field.getName()));
            wrap.addComponent(b);
            container.addComponent(wrap);

            tf = wrap;

            if (!forSearchFilter) l.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));

        } else if (field.isAnnotationPresent(UseRadioButtons.class)) {

            RadioButtonGroup rbg;
            container.addComponent(tf = rbg = new RadioButtonGroup());

            hv = rbg;

            //AbstractBackendDataProvider
            //FetchItemsCallback
            //newItemProvider

            if (field.isAnnotationPresent(DataProvider.class)) {

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
                    Helper.notransact((em) -> rbg.setDataProvider(new JPQLListDataProvider(em, field)));
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


        } else {


            HorizontalLayout hl;


            if (field.getType().isAnnotationPresent(UseIdToSelect.class)) {

                tf = hl = new HorizontalLayout();
                container.addComponent(hl);


                TextField stf;
                hl.addComponent(stf = new TextField());
                Label l;
                hl.addComponent(l = new Label());


                List<HasValue.ValueChangeListener> listeners = new ArrayList<>();

                hv = new HasValue() {
                    private Object value;

                    @Override
                    public void setValue(Object o) {
                        value = o;
                        if (o != null) {
                            Object id = ReflectionHelper.getId(o);
                            stf.setValue((id != null)?"" + id:"");
                        }
                        l.setValue((o != null)?"" + o:"No value");
                    }

                    @Override
                    public Object getValue() {
                        return value;
                    }

                    @Override
                    public Registration addValueChangeListener(ValueChangeListener valueChangeListener) {
                        listeners.add(valueChangeListener);
                        return new Registration() {
                            @Override
                            public void remove() {
                                listeners.remove(valueChangeListener);
                            }
                        };
                    }

                    @Override
                    public void setRequiredIndicatorVisible(boolean b) {
                        stf.setRequiredIndicatorVisible(b);
                    }

                    @Override
                    public boolean isRequiredIndicatorVisible() {
                        return stf.isRequiredIndicatorVisible();
                    }

                    @Override
                    public void setReadOnly(boolean b) {
                        stf.setReadOnly(b);
                    }

                    @Override
                    public boolean isReadOnly() {
                        return stf.isReadOnly();
                    }
                };


                HasValue finalHv = hv;
                stf.addValueChangeListener(s -> {
                    if (Strings.isNullOrEmpty(s.getValue())) finalHv.setValue(null);
                    else {
                        try {
                            Helper.notransact(em -> {

                                FieldInterfaced fid = ReflectionHelper.getIdField(field.getType());

                                String sql = "select x from " + field.getType().getName() + " x where x." + fid.getName() + " = :i";

                                Object id = null;
                                if (int.class.equals(fid.getType()) || Integer.class.equals(fid.getType())) {
                                    id = Integer.parseInt(s.getValue());
                                } else if (long.class.equals(fid.getType()) || Long.class.equals(fid.getType())) {
                                    id = Long.parseLong(s.getValue());
                                } else id = s;

                                Query q = em.createQuery(sql).setParameter("i", id);

                                List r = q.getResultList();

                                Object oldValue = finalHv.getValue();

                                if (r.size() == 1) {
                                    finalHv.setValue(r.get(0));
                                } else {
                                    finalHv.setValue(null);
                                }


                                HasValue.ValueChangeEvent vce = new HasValue.ValueChangeEvent(stf, finalHv, oldValue, true);
                                listeners.forEach(listener -> listener.valueChange(vce));

                            });
                        } catch (Throwable throwable) {
                            MDD.alert(throwable);
                        }
                    }
                });



            } else {

                ComboBox cb;
                container.addComponent(tf = hl = new HorizontalLayout(cb = new ComboBox()));

                if (allFieldContainers.size() == 0) cb.focus();

                hv = cb;



                if (field.isAnnotationPresent(DataProvider.class)) {

                    try {

                        DataProvider a = field.getAnnotation(DataProvider.class);

                        cb.setDataProvider(a.dataProvider().newInstance());

                        cb.setItemCaptionGenerator(a.itemCaptionGenerator().newInstance());

                    } catch (InstantiationException e) {
                        e.printStackTrace();
                    } catch (IllegalAccessException e) {
                        e.printStackTrace();
                    }

                } else {

                    try {
                        Helper.notransact((em) -> cb.setDataProvider(new JPQLListDataProvider(em, field)));
                    } catch (Throwable throwable) {
                        throwable.printStackTrace();
                    }

                    FieldInterfaced fName = ReflectionHelper.getNameField(field.getType());
                    if (fName != null) cb.setItemCaptionGenerator((i) -> {
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

            }


            if (!forSearchFilter) {
                hv.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));

                if (field.getType().isAnnotationPresent(Entity.class)) {

                    Button b = new Button("Edit");
                    b.addStyleName(ValoTheme.BUTTON_LINK);
                    b.addClickListener(e -> MDDUI.get().getNavegador().go(field.getName()));

                    hl.addComponent(b);

                    b = new Button("Add");
                    b.addStyleName(ValoTheme.BUTTON_LINK);
                    b.addClickListener(e -> {

                        Object bean = binder.getBean();
                        try {
                            ReflectionHelper.setValue(field, bean, null);
                            binder.setBean(bean, false);

                            MDDUI.get().getNavegador().go(field.getName());


                        } catch (Exception e1) {
                            MDD.alert(e1);
                        }

                    });

                    hl.addComponent(b);

                }

            }

        }





        allFieldContainers.put(field, tf);

        tf.setCaption(ReflectionHelper.getCaption(field));


        bind(binder, hv, field, forSearchFilter);
    }

    public Object convert(String s) {
        return s;
    }

    public void addValidators(List<Validator> validators) {
    }

    protected void bind(MDDBinder binder, HasValue tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf);
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
    }

}
