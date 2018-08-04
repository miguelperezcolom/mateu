package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.google.common.base.Strings;
import com.vaadin.data.HasValue;
import com.vaadin.data.ValidationResult;
import com.vaadin.data.Validator;
import com.vaadin.data.ValueContext;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.UserError;
import com.vaadin.shared.ui.ErrorLevel;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.UseCheckboxes;
import io.mateu.mdd.core.annotations.UseLinkToListView;
import io.mateu.mdd.core.annotations.UseTwinCols;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ListViewComponent;
import io.mateu.mdd.vaadinport.vaadin.data.MDDBinder;

import javax.persistence.CascadeType;
import javax.persistence.ElementCollection;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.lang.reflect.InvocationTargetException;
import java.util.*;

public class JPAOneToManyFieldBuilder extends JPAFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ElementCollection.class);
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers) {




        OneToMany aa = field.getAnnotation(OneToMany.class);

        boolean owned = false;
        if (aa != null && aa.cascade() != null) for (CascadeType ct : aa.cascade()) {
            if (CascadeType.ALL.equals(ct) || CascadeType.REMOVE.equals(ct)) {
                owned = true;
                break;
            }
        } else if (field.isAnnotationPresent(ElementCollection.class)) owned = true;



        if (field.isAnnotationPresent(UseTwinCols.class)) {

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
                    if (o == null || ((List) o).size() < field.getAnnotation(Size.class).min())
                        r = ValidationResult.create("Required field", ErrorLevel.ERROR);
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

            bind(binder, tf, field);

        } else if (field.isAnnotationPresent(UseLinkToListView.class)) {

            HorizontalLayout hl = new HorizontalLayout();

            Label l;
            hl.addComponent(l = new Label(""));
            l.addStyleName("collectionlinklabel");

            Button b;
            hl.addComponent(b = new Button("Open"));
            b.addStyleName(ValoTheme.BUTTON_LINK);
            b.addClickListener(e -> MyUI.get().getNavegador().go(field.getName()));

            hl.setCaption(Helper.capitalize(field.getName()));

            container.addComponent(hl);

            bind(binder, l, field);

        } else if (field.isAnnotationPresent(UseCheckboxes.class)) {

            CheckBoxGroup cbg = new CheckBoxGroup();


            try {
                Helper.notransact(em -> cbg.setDataProvider((new JPQLListDataProvider(em, field.getGenericClass()))));
            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }

            cbg.setCaption(Helper.capitalize(field.getName()));

            container.addComponent(cbg);

            bind(binder, cbg, field);

        } else {

            Grid g = new Grid();

            ListViewComponent.buildColumns(g, getColumnFields(field), false, owned);

            g.setSelectionMode(Grid.SelectionMode.MULTI);

            // añadimos columna para que no haga feo
            if (g.getColumns().size() == 1) ((Grid.Column)g.getColumns().get(0)).setExpandRatio(1);
            else g.addColumn((d) -> null).setWidthUndefined().setCaption("");

            g.setCaption(Helper.capitalize(field.getName()));

            container.addComponent(g);

            bind(binder, g, field);

            HorizontalLayout hl = new HorizontalLayout();

            Button b;

            if (owned) {

                g.getEditor().setEnabled(true);
                g.getEditor().setBuffered(false);
                g.setHeightByRows(5);

                hl.addComponent(b = new Button("Add", VaadinIcons.PLUS));
                b.addClickListener(e -> {
                    try {
                        Object bean = binder.getBean();

                        Object i = field.getGenericClass().newInstance();
                        ((Collection)ReflectionHelper.getValue(field, bean)).add(i);


                        String mb = null;
                        FieldInterfaced mbf = null;
                        if (field.isAnnotationPresent(OneToMany.class)) {
                            mb = field.getAnnotation(OneToMany.class).mappedBy();
                            if (!Strings.isNullOrEmpty(mb)) {
                                mbf = ReflectionHelper.getFieldByName(field.getGenericClass(), mb);
                            }
                        }
                        if (mbf != null) {
                            FieldInterfaced finalMbf = mbf;
                            ReflectionHelper.setValue(finalMbf, i, bean);
                        }
                        binder.setBean(bean);
                    } catch (Exception e1) {
                        MDD.alert(e1);
                    }
                });


            } else {

                g.addItemClickListener(e -> {
                   if (e.getMouseEventDetails().isDoubleClick()) {
                       Object i = e.getItem();
                       if (i != null) {
                           //edit(listViewComponent.toId(i));
                           MyUI.get().getNavegador().go(field.getName() + "/" + toId(i));
                       }
                   }
                });

                hl.addComponent(b = new Button("Add", VaadinIcons.PLUS));
                b.addClickListener(e -> MyUI.get().getNavegador().go(field.getName()));

                //todo: fata abrir el editor cuando se hace doble click
            }


            hl.addComponent(b = new Button("Remove", VaadinIcons.MINUS));
            b.addClickListener(e -> {
                try {
                    Object bean = binder.getBean();
                    Set l = g.getSelectedItems();
                    ((Collection)ReflectionHelper.getValue(field, bean)).removeAll(l);
                    String mb = null;
                    FieldInterfaced mbf = null;
                    if (field.isAnnotationPresent(OneToMany.class)) {
                        mb = field.getAnnotation(OneToMany.class).mappedBy();
                        if (!Strings.isNullOrEmpty(mb)) {
                            mbf = ReflectionHelper.getFieldByName(field.getGenericClass(), mb);
                        }
                    }
                    if (mbf != null) {
                        FieldInterfaced finalMbf = mbf;
                        l.forEach(o -> {
                            try {
                                ReflectionHelper.setValue(finalMbf, o, null);
                                binder.getMergeables().add(o);
                            } catch (Throwable e1) {
                                MDD.alert(e1);
                            }
                        });
                    }
                    binder.setBean(bean);
                } catch (Exception e1) {
                    MDD.alert(e1);
                }
            });

            container.addComponent(hl);

            //todo: añadir botones  y -
            //todo: añadir y editar registros
            //todo:

        }

    }

    private Object toId(Object row) {
        return ReflectionHelper.getId(row);
    }


    private List<FieldInterfaced> getColumnFields(FieldInterfaced field) {
        List<FieldInterfaced> l = ListViewComponent.getColumnFields(field.getGenericClass());

        OneToMany aa;
        if ((aa = field.getAnnotation(OneToMany.class)) != null) {

            String mb = field.getAnnotation(OneToMany.class).mappedBy();

            if (!Strings.isNullOrEmpty(mb)) {
                FieldInterfaced mbf = null;
                for (FieldInterfaced f : l) {
                    if (f.getName().equals(mb)) {
                        mbf = f;
                        break;
                    }
                }
                if (mbf != null) l.remove(mbf);
            }

        }

        return l;
    }

    public Object convert(String s) {
        return s;
    }

    public void addValidators(List<Validator> validators) {
    }


    private void bind(MDDBinder binder, CheckBoxGroup cbg, FieldInterfaced field) {
        binder.bindOneToMany(cbg, field);
    }

    private void bind(MDDBinder binder, Label l, FieldInterfaced field) {
        binder.bindOneToMany(l, field.getName());
    }

    protected void bind(MDDBinder binder, Grid g, FieldInterfaced field) {
        binder.bindOneToMany(g, field.getName());
    }

    protected void bind(MDDBinder binder, TwinColSelect<Object> tf, FieldInterfaced field) {
        binder.bindOneToMany(tf, field);
    }
}
