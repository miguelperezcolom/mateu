package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.Binder;
import com.vaadin.data.HasItems;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.SerializablePredicate;
import com.vaadin.shared.Registration;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Query;
import javax.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class JPAManyToOneFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(ManyToOne.class) || field.getType().isAnnotationPresent(Entity.class);
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        Component tf = null;
        HasValue hv = null;
        com.vaadin.data.provider.DataProvider dp = null;

        Component captionOwner = null;


        if (field.isAnnotationPresent(UseLinkToListView.class)) {

            HorizontalLayout wrap = new HorizontalLayout();
            wrap.setSpacing(true);
            wrap.setDefaultComponentAlignment(Alignment.MIDDLE_LEFT);

            TextField l = new TextField();
            l.setEnabled(false);
            l.addStyleName(ValoTheme.TEXTFIELD_BORDERLESS);
            wrap.addComponent(l);

            captionOwner = l;


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

        } else {


            HorizontalLayout hl;


            if (field.getType().isAnnotationPresent(UseIdToSelect.class)) {

                VerticalLayout fl;
                tf = fl = new VerticalLayout();
                hl = new HorizontalLayout();
                fl.addComponent(hl);
                hl.setDefaultComponentAlignment(Alignment.BOTTOM_LEFT);
                container.addComponent(fl);

                fl.addStyleName(CSS.NOPADDING);

                TextField stf;
                hl.addComponent(stf = new TextField());
                Label l;
                fl.addComponent(l = new Label());

                captionOwner = stf;


                List<HasValue.ValueChangeListener> listeners = new ArrayList<>();

                hv = new HasValue() {
                    private Object value;

                    @Override
                    public void setValue(Object o) {
                        value = o;
                        if (o != null) {
                            Object id = ReflectionHelper.getId(o);
                            stf.setValue((id != null)?"" + id:"");
                        } else stf.setValue("");
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
                    if (Strings.isNullOrEmpty(s.getValue())) {
                        Object oldValue = finalHv.getValue();
                        finalHv.setValue(null);
                        HasValue.ValueChangeEvent vce = new HasValue.ValueChangeEvent(stf, finalHv, oldValue, true);
                        listeners.forEach(listener -> listener.valueChange(vce));
                    }
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
                                } else if (String.class.equals(fid.getType())) {
                                    id = s.getValue();
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

                tf = hl = new HorizontalLayout();
                hl.setDefaultComponentAlignment(Alignment.BOTTOM_LEFT);
                container.addComponent(hl);



                if (field.isAnnotationPresent(UseRadioButtons.class)) {

                    RadioButtonGroup rbg;
                    hl.addComponent(rbg = new RadioButtonGroup());

                    hv = rbg;

                    captionOwner = rbg;

                    //AbstractBackendDataProvider
                    //FetchItemsCallback
                    //newItemProvider

                    setDataProvider(rbg, field, binder);


                    if (!forSearchFilter) rbg.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));


                } else {

                    ComboBox cb;
                    hl.addComponent(cb = new ComboBox());

                    captionOwner = cb;

                    cb.addStyleName("combo");


                    if (allFieldContainers != null && allFieldContainers.size() == 0) cb.focus();

                    hv = cb;


                    setDataProvider(cb, field, binder);


                }


            }


            if (!forSearchFilter && !field.isAnnotationPresent(UseRadioButtons.class)) {
                hv.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));

                if (field.getType().isAnnotationPresent(Entity.class)) {

                    Button b = null;

                    com.vaadin.data.provider.DataProvider dpx = (hv instanceof ComboBox)?((ComboBox)hv).getDataProvider():((hv instanceof RadioButtonGroup)?((RadioButtonGroup)hv).getDataProvider():null);

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

            }

        }


        if (allFieldContainers != null) if (allFieldContainers != null) allFieldContainers.put(field, tf);

        captionOwner.setCaption(ReflectionHelper.getCaption(field));


        bind(binder, hv, field, forSearchFilter, dp);
    }

    public static void setDataProvider(HasItems hdp, FieldInterfaced field, MDDBinder binder) {

        try {
            Helper.notransact((em) -> {

                com.vaadin.data.provider.DataProvider dp = null;
                ItemCaptionGenerator icg = null;

                DataProvider dpa = (field.isAnnotationPresent(DataProvider.class))?field.getAnnotation(DataProvider.class):null;

                Method mdp = ReflectionHelper.getMethod(field.getDeclaringClass(), ReflectionHelper.getGetter(field.getName()) + "DataProvider");

                if (mdp != null) {

                    dp = (com.vaadin.data.provider.DataProvider) ((mdp.getParameterCount() == 0)?mdp.invoke(binder.getBean()):mdp.invoke(binder.getBean(), binder));

                    if (mdp.isAnnotationPresent(DependsOn.class)) {
                        for (String fn : mdp.getAnnotation(DependsOn.class).value().split(",")) {
                            fn = fn.trim();
                            binder.getBinding(fn).ifPresent(b -> ((Binder.Binding)b).getField().addValueChangeListener(e -> {

                                if (binder.getBean() != null) { // puede pasar que llamemos a este método cuando todavía no hayamos bindeado nada

                                    com.vaadin.data.provider.DataProvider dpx = null;
                                    try {
                                        dpx = (com.vaadin.data.provider.DataProvider) ((mdp.getParameterCount() == 0) ? mdp.invoke(binder.getBean()) : mdp.invoke(binder.getBean(), binder));

                                        if (hdp instanceof RadioButtonGroup) {
                                            ((RadioButtonGroup)hdp).setDataProvider(dpx);
                                        } else if (hdp instanceof CheckBoxGroup) {
                                            ((CheckBoxGroup)hdp).setDataProvider(dpx);
                                        } else if (hdp instanceof ComboBox) {
                                            ((ComboBox)hdp).setDataProvider(dpx, f -> new SerializablePredicate() {
                                                @Override
                                                public boolean test(Object o) {
                                                    String s = (String) f;
                                                    return  o != null && (Strings.isNullOrEmpty(s) || ((ComboBox)hdp).getItemCaptionGenerator().apply(o).toLowerCase().contains(((String) s).toLowerCase()));
                                                }
                                            });
                                        } else if (hdp instanceof TwinColSelect) {
                                            ((TwinColSelect)hdp).setDataProvider(dpx);
                                        } else if (hdp instanceof Grid) {
                                            ((Grid)hdp).setDataProvider(dpx);
                                        }

                                        Object v = null;
                                        if (hdp instanceof ComboBox && field.isAnnotationPresent(NotNull.class)) {
                                            if (((ComboBox)hdp).getDataProvider().size(new com.vaadin.data.provider.Query()) == 1) {
                                                v = ((ComboBox)hdp).getDataProvider().fetch(new com.vaadin.data.provider.Query()).findFirst().get();
                                            }
                                        }

                                        Object bean = binder.getBean();
                                        if (bean != null && ReflectionHelper.getValue(field, bean) == null) {
                                            ReflectionHelper.setValue(field, bean, v);
                                            binder.setBean(bean, false);
                                        }

                                    } catch (Exception e1) {
                                        MDD.alert(e1);
                                    }


                                }


                            }));
                        }
                    }


                } else if (dpa != null) {

                    try {

                        dp = dpa.dataProvider().newInstance();

                    } catch (InstantiationException e) {
                        e.printStackTrace();
                    } catch (IllegalAccessException e) {
                        e.printStackTrace();
                    }

                } else {

                    dp = new JPQLListDataProvider(em, field);

                }


                Method micg = ReflectionHelper.getMethod(field.getDeclaringClass(), ReflectionHelper.getGetter(field.getName()) + "ItemCaptionGenerator");

                if (micg != null) {

                    icg = (ItemCaptionGenerator) micg.invoke(binder.getBean());

                } else if (dpa != null) {

                    try {

                        icg = dpa.itemCaptionGenerator().newInstance();

                    } catch (InstantiationException e) {
                        e.printStackTrace();
                    } catch (IllegalAccessException e) {
                        e.printStackTrace();
                    }

                } else {

                    FieldInterfaced fName = ReflectionHelper.getNameField(field.getType());
                    if (fName != null) icg = (i) -> {
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


            });
        } catch (Throwable t) {
            MDD.alert(t);
        }

    }

    public Object convert(String s) {
        return s;
    }

    public void addValidators(List<Validator> validators) {
    }

    protected void bind(MDDBinder binder, HasValue tf, FieldInterfaced field, boolean forSearchFilter, com.vaadin.data.provider.DataProvider dp) {
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
