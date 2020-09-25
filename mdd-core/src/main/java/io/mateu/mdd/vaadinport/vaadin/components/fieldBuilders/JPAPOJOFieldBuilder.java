package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.vaadin.data.Binder;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.ClassOption;
import io.mateu.mdd.vaadinport.vaadin.components.views.FormLayoutBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.views.FormLayoutBuilderParameters;
import io.mateu.mdd.vaadinport.vaadin.util.VaadinHelper;

import javax.validation.constraints.NotNull;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;

public class JPAPOJOFieldBuilder extends AbstractFieldBuilder {

    MDDBinder subbinder;
    private FieldInterfaced field;
    private Layout formLayout;
    private MDDBinder binder;
    private Set<Class> subClasses;
    private ComboBox<ClassOption> cb;

    public boolean isSupported(FieldInterfaced field) {
        return true;
    }

    @Override
    public Component build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        this.field = field;
        this.binder = binder;

        Component r = null;


        {

            HorizontalLayout hl;
            Component tf = null;
            HasValue hv = null;


            if (true) {

                tf = hl = new HorizontalLayout();
                container.addComponent(hl);

                addErrorHandler(field, hl);

                r = hl;

                Label l;
                hl.addComponent(l = new Label());
                l.setContentMode(ContentMode.HTML);

                Button reset;
                hl.addComponent(reset = new Button(VaadinIcons.CLOSE, (e) -> {
                    Object bean = binder.getBean();
                    try {
                        ReflectionHelper.setValue(field, bean, null);
                        binder.setBean(bean, false);
                    } catch (Exception ex) {
                        MDD.alert(ex);
                    }
                }));
                reset.addStyleName(ValoTheme.BUTTON_TINY);
                reset.setVisible(false);

                List<HasValue.ValueChangeListener> listeners = new ArrayList<>();

                hv = new HasValue() {
                    private Object value;

                    @Override
                    public void setValue(Object o) {
                        Object oldValue = value;
                        value = o;
                        if (true || oldValue != value || (value != null && !value.equals(oldValue))) {
                            String v = (o != null) ? "" + toHtml(o) : "No value";
                            l.setValue(v);
                            HasValue finalHv = this;
                            listeners.forEach(l -> l.valueChange(new ValueChangeEvent(hl, finalHv, oldValue, false)));
                        }
                        reset.setVisible(o != null);
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
                };

            }


            if (!forSearchFilter) {
                hv.setRequiredIndicatorVisible(field.isAnnotationPresent(NotNull.class));
                hl.addStyleName(CSS.CLICKABLE);
                hl.addLayoutClickListener(e -> {
                    //if (e.isDoubleClick())

                    Object bean = binder.getBean();
                    try {

                        Object value = ReflectionHelper.getValue(field, bean);
                        if (value == null) {

                            Class<?> modelType = field.getType();


                            Set<Class> subClasses = ReflectionHelper.getSubclasses(modelType);

                            if (subClasses.size() > 1) {

                                Set<ClassOption> subClassesOptions = new LinkedHashSet<>();
                                subClasses.forEach(c -> subClassesOptions.add(new ClassOption(c)));

                                VaadinHelper.choose("Please choose type", subClassesOptions, c -> {
                                    if (c == null) MDDUI.get().getNavegador().goBack();
                                    else {
                                        try {
                                            create(binder, ((ClassOption)c).get_class(), bean);
                                        } catch (Throwable th) {
                                            MDD.alert(th);
                                        }
                                    }
                                }, () -> {
                                    MDDUI.get().getNavegador().goBack();
                                });
                            } else if (subClasses.size() == 1) {
                                create(binder, subClasses.iterator().next(), bean);
                            } else {
                                create(binder, modelType, bean);
                            }

                        } else {
                            MDDUI.get().getNavegador().go(field.getName());
                        }

                    } catch (Throwable ex) {
                        MDD.alert(ex);
                    }

                });
            }


            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            tf.setCaption(ReflectionHelper.getCaption(field));


            bind(binder, hv, field, forSearchFilter);


        }

        return r;

    }

    private String toHtml(Object o) {
        String h = "";
        if (o != null) {
            Method m = ReflectionHelper.getMethod(o.getClass(), "toHtml");
            if (m != null) {
                try {
                    h = (String) m.invoke(o);
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                }
            } else {

                m = ReflectionHelper.getMethod(o.getClass(), "toString");
                if (m != null && !Object.class.equals(m.getDeclaringClass())) {
                    try {
                        h = (String) m.invoke(o);
                    } catch (IllegalAccessException e) {
                        e.printStackTrace();
                    } catch (InvocationTargetException e) {
                        e.printStackTrace();
                    }
                } else {

                    h = ReflectionHelper.toHtml(o);

                }

            }
        }
        return h;
    }

    private void create(MDDBinder binder, Class type, Object parent) throws Throwable {
        Constructor con = parent != null?ReflectionHelper.getConstructor(type, parent.getClass()):ReflectionHelper.getConstructor(type);
        if (con != null && con.getParameterCount() > 0) {
            VaadinHelper.fill("I need some data", con, i -> {
                try {
                    ReflectionHelper.setValue(field, parent, i);
                    binder.setBean(parent, false);
                } catch (Throwable e) {
                    MDD.alert(e);
                }
                MDDUI.closeWindow(false);
                MDDUI.get().getNavegador().go(field.getName());
            }, () -> MDDUI.get().getNavegador().goBack());
        } else {
            Object i = ReflectionHelper.newInstance(type, parent);
            ReflectionHelper.setValue(field, parent, i);
            binder.setBean(parent, false);
            MDDUI.get().getNavegador().go(field.getName());
        }
    }

    protected void bind(MDDBinder binder, HasValue tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf);
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
    }


    private void subBuild(Map<String, List<AbstractAction>> attachedActions) {
        Object i = null;
        try {
            i = ReflectionHelper.getValue(field, binder.getBean());

            if (i != null) {
                subBuild(i.getClass(), i, attachedActions);
            } else if (subClasses.size() > 1) {
                try {

                    if (i != null) subBuild(i.getClass(), attachedActions);

                } catch (Exception e) {
                    MDD.alert(e);
                }
            } else if (subClasses.size() == 1) {
                subBuild(subClasses.iterator().next(), attachedActions);
            } else {
                subBuild(field.getType(), attachedActions);
            }

        } catch (Exception e) {
            MDD.alert(e);
        }
    }

    private void subBuild(Class subType, Map<String, List<AbstractAction>> attachedActions) {
        subBuild(subType, null, attachedActions);
    }

    private void subBuild(Class subType, Object o, Map<String, List<AbstractAction>> attachedActions) {

        formLayout.removeAllComponents();


        if (o == null) {
            try {
                o = subType.newInstance();
                Object bean = binder.getBean();
                ReflectionHelper.setValue(field, bean, o);
                binder.setBean(bean, false);
            } catch (Exception e) {
                MDD.alert(e);
            }
        }

        subbinder = new MDDBinder(subType);
        subbinder.setBean(o);

        Map<HasValue, List<Validator>> subvalidators = new HashMap<>();

        FormLayoutBuilder.get().build(formLayout, subbinder, subType, o, new ArrayList<>(), FormLayoutBuilderParameters.builder().validators(subvalidators).allFields(ReflectionHelper.getAllEditableFields(subType, field.getType())).build(), attachedActions);


        bind(binder, field, subbinder);
    }

    private void bind(MDDBinder binder, FieldInterfaced field, MDDBinder subbinder) {
        HasValue hv = new HasValue() {
            @Override
            public void setValue(Object o) {
                try {
                    cb.setValue((o != null) ? new ClassOption(o.getClass()) : null);
                    subbinder.setBean(o);
                } catch (Exception e) {

                }
            }

            @Override
            public Object getValue() {
                return subbinder.getBean();
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
        };
        completeBinding(hv, binder, field);
    }

    public Object convert(String s) {
        return s;
    }

    public void addValidators(List<Validator> validators) {
    }

}
