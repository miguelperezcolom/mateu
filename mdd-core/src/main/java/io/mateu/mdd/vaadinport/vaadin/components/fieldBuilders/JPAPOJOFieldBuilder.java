package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.vaadin.data.Binder;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.layout.MiFormLayout;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.ClassOption;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.FormLayoutBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.FormLayoutBuilderParameters;

import javax.persistence.Embedded;
import javax.validation.constraints.NotNull;
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


        if (false && field.isAnnotationPresent(Embedded.class)) {

            binder.addValueChangeListener(e -> subBuild(attachedActions));

            subClasses = ReflectionHelper.getSubclasses(field.getType());
            if (subClasses.size() > 1) {


                Set<ClassOption> subClassesOptions = new LinkedHashSet<>();
                subClasses.forEach(c -> subClassesOptions.add(new ClassOption(c)));

                container.addComponent(cb = new ComboBox<>("Type", subClassesOptions));

                cb.addValueChangeListener(e -> {

                    if (e.getValue() != null && !e.getValue().equals(e.getOldValue())) {
                        Object bean = binder.getBean();

                        Object i = null;
                        try {
                            i = ReflectionHelper.getValue(field, binder.getBean());

                            if (i == null || !i.getClass().equals(e.getValue().get_class())) {

                                i = e.getValue().get_class().newInstance();

                                try {
                                    ReflectionHelper.setValue(field, bean, i);
                                } catch (Exception e1) {
                                    MDD.alert(e1);
                                }

                                subBuild((i != null)?i.getClass():field.getType(), i, attachedActions);
                                binder.setBean(bean);

                            }

                        } catch (Exception e1) {
                            MDD.alert(e1);
                        }

                    } else if (e.getValue() == null && e.getOldValue() != null) {
                        Object bean = binder.getBean();
                        try {
                            ReflectionHelper.setValue(field, bean, null);
                        } catch (Exception e1) {
                            MDD.alert(e1);
                        }
                        binder.setBean(bean);
                        formLayout.removeAllComponents();
                    }

                });

            }


            MiFormLayout mfl;
            container.addComponent(formLayout = mfl = new MiFormLayout());
            formLayout.addStyleName("embedded");
            if (container.getComponentCount() > 0) formLayout.setCaption(ReflectionHelper.getCaption(field));

            subBuild(attachedActions);

            addErrorHandler(mfl);

            r = mfl;

        } else {

            HorizontalLayout hl;
            Component tf = null;
            HasValue hv = null;


            if (true) {

                tf = hl = new HorizontalLayout();
                container.addComponent(hl);

                addErrorHandler(hl);

                r = hl;

                Label l;
                hl.addComponent(l = new Label());
                l.setContentMode(ContentMode.HTML);

                List<HasValue.ValueChangeListener> listeners = new ArrayList<>();

                hv = new HasValue() {
                    private Object value;

                    @Override
                    public void setValue(Object o) {
                        Object oldValue = value;
                        value = o;
                        if (oldValue != value || (value != null && !value.equals(oldValue))) {
                            String v = (o != null) ? "" + o : "No value";
                            if (o != null) {
                                Method m = ReflectionHelper.getMethod(o.getClass(), "toHtml");
                                if (m != null) {
                                    try {
                                        v = (String) m.invoke(o);
                                    } catch (IllegalAccessException e) {
                                        e.printStackTrace();
                                    } catch (InvocationTargetException e) {
                                        e.printStackTrace();
                                    }
                                }
                            }
                            l.setValue(v);
                            HasValue finalHv = this;
                            listeners.forEach(l -> l.valueChange(new ValueChangeEvent(hl, finalHv, oldValue, false)));
                        }
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
                    if (e.isDoubleClick()) MDDUI.get().getNavegador().go(field.getName());
                });
            }


            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            tf.setCaption(ReflectionHelper.getCaption(field));


            bind(binder, hv, field, forSearchFilter);


        }

        return r;

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
