package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.*;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.SerializablePredicate;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.*;
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
import java.util.Set;

public class JPAManyToOneFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(ManyToOne.class) || field.getType().isAnnotationPresent(Entity.class);
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

            if (MDD.isReadWrite(field.getType())) {
                Button b = new Button("Select");
                b.addStyleName(ValoTheme.BUTTON_LINK);
                b.addClickListener(e -> MDDUIAccessor.go(field.getName()));
                wrap.addComponent(b);
            }
            container.addComponent(wrap);


            addErrorHandler(field, (AbstractField) tf);

            r = tf;

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

                addErrorHandler(field, stf);

                r = stf;

                captionOwner = stf;

                hv = stf;

                converter = new Converter<String, Object>() {
                    @Override
                    public Result<Object> convertToModel(String s, ValueContext valueContext) {
                        stf.setComponentError(null);
                        Result[] r = new Result[1];
                        if (Strings.isNullOrEmpty(s)) {
                            r[0] = Result.ok(null);
                            l.setValue("No value");
                        }
                        else try {
                            JPAHelper.notransact(em -> {

                                FieldInterfaced fid = ReflectionHelper.getIdField(field.getType());

                                String sql = "select x from " + field.getType().getName() + " x where x." + fid.getName() + " = :i";

                                Object id = null;
                                if (int.class.equals(fid.getType()) || Integer.class.equals(fid.getType())) {
                                    id = Integer.parseInt(s);
                                } else if (long.class.equals(fid.getType()) || Long.class.equals(fid.getType())) {
                                    id = Long.parseLong(s);
                                } else if (String.class.equals(fid.getType())) {
                                    id = s;
                                } else id = s;

                                Query q = em.createQuery(sql).setParameter("i", id);

                                List list = q.getResultList();

                                if (list.size() == 1) {
                                    Object v;
                                    r[0] = Result.ok(v = list.get(0));
                                    l.setValue((v != null)?"" + v:"No value");
                                } else {
                                    r[0] = Result.error("Not found");
                                    l.setValue("Not found");
                                }

                            });
                        } catch (Throwable throwable) {
                            if (throwable instanceof InvocationTargetException) {
                                throwable = throwable.getCause();
                            }
                            String msg = (throwable.getMessage() != null) ? throwable.getMessage() : throwable.getClass().getName();
                            r[0] = Result.error(msg);
                            l.setValue(msg);
                        }
                        return r[0];
                    }

                    @Override
                    public String convertToPresentation(Object o, ValueContext valueContext) {
                        String s = null;
                        l.setValue((o != null)?"" + o:"No value");
                        if (o != null) {
                            Object id = ReflectionHelper.getId(o);
                            s = (id != null)?"" + id:"";
                        }
                        return s != null?s:"";
                    }
                };

            } else {

                tf = hl = new HorizontalLayout();
                hl.setDefaultComponentAlignment(Alignment.BOTTOM_LEFT);
                container.addComponent(hl);



                if (!forSearchFilter && field.isAnnotationPresent(UseRadioButtons.class)) {

                    RadioButtonGroup rbg;
                    hl.addComponent(rbg = new RadioButtonGroup());

                    hv = rbg;

                    addErrorHandler(field, rbg);

                    r = rbg;

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

                    addErrorHandler(field, cb);

                    r = cb;

                    cb.addStyleName("combo");

                    if (field.isAnnotationPresent(Width.class)) cb.setWidth(field.getAnnotation(Width.class).value());


                    if (field.isAnnotationPresent(RequestFocus.class)) cb.focus();

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

                    b = new Button(null, VaadinIcons.SEARCH);
                    b.addStyleName(ValoTheme.BUTTON_QUIET);
                    b.addStyleName(CSS.NOPADDING);
                    b.addClickListener(e -> {

                        MDDUIAccessor.go(field.getName() + "_search");

                    });
                    hl.addComponent(b);

                    if (MDD.isReadWrite(field.getType())) {
                        botonLink = new Button(null, VaadinIcons.EXTERNAL_LINK);
                        botonLink.addStyleName(ValoTheme.BUTTON_QUIET);
                        botonLink.addStyleName(CSS.NOPADDING);
                        botonLink.addClickListener(e -> MDDUIAccessor.go(field.getName()));
                        //botonLink.setVisible(false);
                        hl.addComponent(botonLink);
                    }

                }

            }

        }


        if (allFieldContainers != null) allFieldContainers.put(field, tf);

        captionOwner.setCaption(ReflectionHelper.getCaption(field));

        Binder.Binding binding = bind(binder, hv, field, forSearchFilter, dp, captionOwner, converter, botonLink);

        return r;
    }

    public static void setDataProvider(HasItems hdp, FieldInterfaced field, MDDBinder binder) {

        try {
            JPAHelper.notransact((em) -> {

                com.vaadin.data.provider.DataProvider dp = null;
                ItemCaptionGenerator icg = null;

                DataProvider dpa = (field.isAnnotationPresent(DataProvider.class))?field.getAnnotation(DataProvider.class):null;

                Method mdp = ReflectionHelper.getMethod(field.getDeclaringClass(), ReflectionHelper.getGetter(field.getName()) + "DataProvider");

                if (mdp != null) {

                    dp = (com.vaadin.data.provider.DataProvider) ((mdp.getParameterCount() == 0)?mdp.invoke(binder.getBean()):mdp.invoke(binder.getBean(), binder));

                    if (mdp.isAnnotationPresent(DependsOn.class)) {
                        for (String fn : mdp.getAnnotation(DependsOn.class).value().split(",")) {
                            fn = fn.trim();
                            binder.addValueChangeListener((e) -> {

                                if (e.isUserOriginated()) {

                                    if (binder.getBean() != null) { // puede pasar que llamemos a este método cuando todavía no hayamos bindeado nada

                                        com.vaadin.data.provider.DataProvider dpx = null;
                                        try {
                                            dpx = (com.vaadin.data.provider.DataProvider) ((mdp.getParameterCount() == 0) ? mdp.invoke(binder.getBean()) : mdp.invoke(binder.getBean(), binder));

                                            if (hdp instanceof RadioButtonGroup) {
                                                ((RadioButtonGroup)hdp).setDataProvider(dpx);
                                            } else if (hdp instanceof CheckBoxGroup) {
                                                ((CheckBoxGroup)hdp).setDataProvider(dpx);
                                                Object bean = binder.getBean();
                                                if (bean != null && ReflectionHelper.getValue(field, bean) != null) {
                                                    Object v = ReflectionHelper.getValue(field, bean);
                                                    if (v != null && v instanceof Set) {
                                                        ((CheckBoxGroup)hdp).setValue((Set) v);
                                                    }
                                                }
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
                                                binder.update(bean);
                                            }

                                        } catch (Exception e1) {
                                            Notifier.alert(e1);
                                        }


                                    }

                                }
                            });

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
            Notifier.alert(t);
        }

    }

    public Object convert(String s) {
        return s;
    }

    public void addValidators(List<Validator> validators) {
    }

    protected Binder.Binding bind(MDDBinder binder, HasValue tf, FieldInterfaced field, boolean forSearchFilter, com.vaadin.data.provider.DataProvider dp, AbstractComponent captionOwner, Converter converter, Button botonLink) {
        Binder.BindingBuilder aux = binder.forField(tf);
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        if (converter != null) aux.withConverter(converter);
        Binder.Binding binding = completeBinding(aux, binder, field, captionOwner);


        if (dp != null && dp instanceof JPQLListDataProvider) {
            JPQLListDataProvider ldp = (JPQLListDataProvider) dp;
            binding.getField().addValueChangeListener(e -> {
                ldp.refresh();
            });
        }

        if (!forSearchFilter && field.getDeclaringClass() != null && field.getType().isAnnotationPresent(Entity.class)) {
            binding.getField().addValueChangeListener(e -> {
                if (botonLink != null) botonLink.setVisible(e.getValue() != null);
            });
        }

        if (botonLink != null) botonLink.setVisible(tf.getValue() != null);

        return binding;
    }

    private Object getInstance(FieldInterfaced field, Object rawValue) {
        if (rawValue == null || "".equals(rawValue)) return null;
        if (field.getType().isAssignableFrom(rawValue.getClass())) return rawValue;
        try {
            Object id = rawValue;
            if (rawValue instanceof String) {
                FieldInterfaced idField = ReflectionHelper.getIdField(field.getType());
                if (Long.class.equals(idField.getType()) || long.class.equals(idField.getType())) id = Long.parseLong((String) rawValue);
                if (Integer.class.equals(idField.getType()) || int.class.equals(idField.getType())) id = Integer.parseInt((String) rawValue);
            }
            return JPAHelper.find(field.getType(), id);
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return null;
    }

}
