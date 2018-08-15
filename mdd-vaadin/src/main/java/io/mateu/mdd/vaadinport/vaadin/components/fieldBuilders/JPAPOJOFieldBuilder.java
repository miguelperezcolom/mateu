package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.shared.Registration;
import com.vaadin.ui.*;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.vaadinport.vaadin.components.ClassOption;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.FormLayoutBuilder;

import java.util.*;

public class JPAPOJOFieldBuilder extends JPAFieldBuilder {

    MDDBinder subbinder;
    private FieldInterfaced field;
    private FormLayout formLayout;
    private MDDBinder binder;
    private Set<Class> subClasses;
    private ComboBox<ClassOption> cb;

    public boolean isSupported(FieldInterfaced field) {
        return true;
    }

    @Override
    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {

        /*
        Label tl;
        container.addComponent(tl = new Label(Helper.capitalize(field.getName())));
        tl.addStyleName(ValoTheme.LABEL_H3);
*/
        this.field = field;
        this.binder = binder;

        binder.addValueChangeListener(e -> subBuild());

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

                           subBuild((i != null)?i.getClass():field.getType(), i);
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


        container.addComponent(formLayout = new FormLayout());
        formLayout.addStyleName("embedded");
        formLayout.setCaption(Helper.capitalize(field.getName()));

        subBuild();
    }


    private void subBuild() {
        Object i = null;
        try {
            i = ReflectionHelper.getValue(field, binder.getBean());

            if (i != null) {
                subBuild(i.getClass(), i);
            } else if (subClasses.size() > 1) {
                try {

                    if (i != null) subBuild(i.getClass());

                } catch (Exception e) {
                    MDD.alert(e);
                }
            } else if (subClasses.size() == 1) {
                subBuild(subClasses.iterator().next());
            } else {
                subBuild(field.getType());
            }

        } catch (Exception e) {
            MDD.alert(e);
        }
    }

    private void subBuild(Class subType) {
        subBuild(subType, null);
    }

    private void subBuild(Class subType, Object o) {

        formLayout.removeAllComponents();

        subbinder = new MDDBinder(subType);
        subbinder.setBean(o);

        Map<HasValue, List<Validator>> subvalidators = new HashMap<>();

        FormLayoutBuilder.get().build(formLayout, subbinder, subType, o, subvalidators, ReflectionHelper.getAllEditableFields(subType));


        bind(binder, field, subbinder);
    }

    private void bind(MDDBinder binder, FieldInterfaced field, MDDBinder subbinder) {

        binder.bind(new HasValue() {
            @Override
            public void setValue(Object o) {
                try {
                    cb.setValue((o != null)?new ClassOption(o.getClass()):null);
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
        }, field.getName());
    }

    public Object convert(String s) {
        return s;
    }

    public void addValidators(List<Validator> validators) {
    }

}
