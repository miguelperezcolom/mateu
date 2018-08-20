package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.*;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.Registration;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.DataProvider;
import io.mateu.mdd.core.annotations.UseCheckboxes;
import io.mateu.mdd.core.annotations.UseLinkToListView;
import io.mateu.mdd.core.annotations.UseTwinCols;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.*;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ListViewComponent;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.vaadinport.vaadin.util.VaadinHelper;

import javax.persistence.CascadeType;
import javax.persistence.ElementCollection;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import java.lang.reflect.InvocationTargetException;
import java.util.*;

public class JPAOneToManyFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ElementCollection.class) || field.isAnnotationPresent(ManyToMany.class);
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {


        if (forSearchFilter) {

            // todo: añadir para contains

        } else {

            OneToMany aa = field.getAnnotation(OneToMany.class);
            ManyToMany mm = field.getAnnotation(ManyToMany.class);

            boolean owned = false;
            if (aa != null && aa.cascade() != null) for (CascadeType ct : aa.cascade()) {
                if (CascadeType.ALL.equals(ct) || CascadeType.REMOVE.equals(ct)) {
                    owned = true;
                    break;
                }
            } else if (mm != null && mm.cascade() != null) for (CascadeType ct : mm.cascade()) {
                if (CascadeType.ALL.equals(ct) || CascadeType.REMOVE.equals(ct)) {
                    owned = true;
                    break;
                }
            } else if (field.isAnnotationPresent(ElementCollection.class)) owned = true;


            if (Map.class.isAssignableFrom(field.getType())) {


                buildMap(field, object, container, binder, validators, stylist, allFieldContainers, forSearchFilter, owned);

            } else {

                buildList(field, object, container, binder, validators, stylist, allFieldContainers, forSearchFilter, owned);


            }

        }

    }

    private void buildList(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue,List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced,Component> allFieldContainers, boolean forSearchFilter, boolean owned) {
        if (field.isAnnotationPresent(UseTwinCols.class)) {

            TwinColSelect<Object> tf = new TwinColSelect(Helper.capitalize(field.getName()));
            tf.setRows(10);
            tf.setLeftColumnCaption("Available options");
            tf.setRightColumnCaption("Selected options");

            //tf.addValueChangeListener(event -> Notification.show("Value changed:", String.valueOf(event.getValue()), Type.TRAY_NOTIFICATION));

            container.addComponent(tf);

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

            tf.addValueChangeListener(e -> updateReferences(binder, field, e));


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


            if (field.isAnnotationPresent(DataProvider.class)) {

                try {

                    DataProvider a = field.getAnnotation(DataProvider.class);

                    ((HasDataProvider)cbg).setDataProvider(a.dataProvider().newInstance());

                    cbg.setItemCaptionGenerator(a.itemCaptionGenerator().newInstance());

                } catch (InstantiationException e) {
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                }

            } else {
                try {
                    Helper.notransact(em -> cbg.setDataProvider((new JPQLListDataProvider(em, field))));
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
            }

            cbg.addValueChangeListener(e -> updateReferences(binder, field, e));

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

                        ReflectionHelper.addToCollection(binder, field, bean, field.getGenericClass().newInstance());

                        binder.setBean(bean);
                    } catch (Exception e1) {
                        MDD.alert(e1);
                    }
                });

                hl.addComponent(b = new Button("Remove", VaadinIcons.MINUS));
                b.addClickListener(e -> {
                    try {
                        Object bean = binder.getBean();
                        Set l = g.getSelectedItems();

                        ReflectionHelper.removeFromCollection(binder, field, bean, l);


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
                            MyUI.get().getNavegador().go(field.getName());
                        }
                    }
                });

                hl.addComponent(b = new Button("Edit list", VaadinIcons.EDIT));
                b.addClickListener(e -> MyUI.get().getNavegador().go(field.getName()));
            }

            container.addComponent(hl);

        }

    }

    private void buildMap(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, boolean owned) {
        Class keyType = ReflectionHelper.getGenericClass(field, Map.class, "K");
        Class valueType = ReflectionHelper.getGenericClass(field, Map.class, "V");

        Grid g = new Grid();

        ListViewComponent.buildColumns(g, getColumnFields(field), false, true);

        g.setSelectionMode(Grid.SelectionMode.MULTI);

        // añadimos columna para que no haga feo
        if (g.getColumns().size() == 1) ((Grid.Column)g.getColumns().get(0)).setExpandRatio(1);
        else g.addColumn((d) -> null).setWidthUndefined().setCaption("");

        g.setCaption(Helper.capitalize(field.getName()));

        container.addComponent(g);

        bind(binder, g, field);

        HorizontalLayout hl = new HorizontalLayout();


        Button b;

        g.getEditor().setEnabled(true);
        ((Grid.Column)g.getColumns().get(0)).setEditable(false);
        g.getEditor().setBuffered(false);
        g.setHeightByRows(5);

        hl.addComponent(b = new Button("Add", VaadinIcons.PLUS));
        b.addClickListener(e -> {


            VaadinHelper.getPair("Please provide key and value", keyType, valueType, (k, v) -> {

                try {
                    Object bean = binder.getBean();

                    ReflectionHelper.addToMap(binder, field, bean, k, v);

                    binder.setBean(bean, false);
                } catch (Exception e1) {
                    MDD.alert(e1);
                }


            });

        });

        hl.addComponent(b = new Button("Remove", VaadinIcons.MINUS));
        b.addClickListener(e -> {


            try {
                Object bean = binder.getBean();
                Set l = g.getSelectedItems();

                ReflectionHelper.removeFromMap(binder, field, bean, l);

                binder.setBean(bean, false);
            } catch (Exception e1) {
                MDD.alert(e1);
            }

        });

        container.addComponent(hl);

    }

    private void updateReferences(MDDBinder binder, FieldInterfaced field, HasValue.ValueChangeEvent<Set<Object>> e) {
        Object bean = binder.getBean();
        e.getOldValue().stream().filter(i -> !e.getValue().contains(i)).forEach(i -> {
            try {
                ReflectionHelper.unReverseMap(binder, field, bean, i);
            } catch (Exception e1) {
                MDD.alert(e1);
            }
        });
        e.getValue().stream().filter(i -> !e.getValue().contains(i)).forEach(i -> {
            try {
                ReflectionHelper.reverseMap(binder, field, bean, i);
            } catch (Exception e1) {
                MDD.alert(e1);
            }
        });
    }

    private Object toId(Object row) {
        return ReflectionHelper.getId(row);
    }


    private List<FieldInterfaced> getColumnFields(FieldInterfaced field) {

        List<FieldInterfaced> l = null;

        if (Map.class.isAssignableFrom(field.getType())) {

            l = new ArrayList<>();

            l.add(new FieldInterfacedFromType(ReflectionHelper.getGenericClass(field,  Map.class, "K"), "key"));
            l.add(new FieldInterfacedFromType(ReflectionHelper.getGenericClass(field,  Map.class, "V"), "value"));

        } else {

            l = ListViewComponent.getColumnFields(field.getGenericClass());

            // quitamos el campo mappedBy de las columnas, ya que se supone que siempre seremos nosotros
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

        }

        return l;
    }

    public Object convert(String s) {
        return s;
    }

    public void addValidators(List<Validator> validators) {
    }


    private void bind(MDDBinder binder, CheckBoxGroup cbg, FieldInterfaced field) {
        Binder.BindingBuilder aux = binder.forField(cbg);
        aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
    }

    private void bind(MDDBinder binder, Label l, FieldInterfaced field) {
        Binder.BindingBuilder aux = binder.forField(new HasValue() {
            @Override
            public void setValue(Object o) {
                if (o == null || ((Collection)o).size() == 0) l.setValue("Empty list");
                else l.setValue("" + ((Collection)o).size() + " items");
            }

            @Override
            public Object getValue() {
                return null;
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
        });
        aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
    }

    protected void bind(MDDBinder binder, Grid g, FieldInterfaced field) {
        Binder.BindingBuilder aux = binder.forField(new HasValue() {
            @Override
            public void setValue(Object o) {
                Collection items = null;
                if (o == null) {
                    items = new ArrayList();
                } else {

                    if (o instanceof Map) {

                        Class keyType = ReflectionHelper.getGenericClass(field, Map.class, "K");

                        if (keyType != null && keyType.isEnum()) {
                            //todo: prefill
                            //todo: añadir anotación @Prefill
                        }

                        items = ((Map) o).entrySet();
                    } else {
                        items = (Collection) o;
                    }
                }
                g.setDataProvider(new ListDataProvider(items));
            }

            @Override
            public Object getValue() {
                return ((ListDataProvider) g.getDataProvider()).getItems();
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
        });

        if (Map.class.isAssignableFrom(field.getType())) aux.withConverter(new Converter() {
            @Override
            public Result convertToModel(Object o, ValueContext valueContext) {
                Map m = new HashMap();
                if (o != null) {
                    ((Collection)o).forEach(e -> m.put(((MapEntry)e).getKey(), ((MapEntry)e).getValue()));
                }

                Object bean = binder.getBean();
                try {

                    Map old = (Map) ReflectionHelper.getValue(field, bean);

                    old.values().forEach(e -> {
                        Object target = e;
                        if (!m.containsValue(target)) {
                            try {
                                ReflectionHelper.unReverseMap(binder, field, bean, target);
                            } catch (Exception e1) {
                                MDD.alert(e1);
                            }
                        }
                    });
                    m.values().forEach(e -> {
                        Object target = e;
                        if (!old.containsValue(target)) {
                            try {
                                ReflectionHelper.reverseMap(binder, field, bean, target);
                            } catch (Exception e1) {
                                MDD.alert(e1);
                            }
                        }
                    });
                    ReflectionHelper.setValue(field, bean, (o != null)?m:null);
                } catch (Exception e) {
                    MDD.alert(e);
                }
                binder.setBean(bean, false);

                return Result.ok((o != null)?m:null);
            }

            @Override
            public Object convertToPresentation(Object o, ValueContext valueContext) {
                return (o != null)?toList((Map) o):null;
            }
        });

        aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
    }

    private List<MapEntry> toList(Map m) {
        List<MapEntry> l = new ArrayList<>();
        if (m != null) m.entrySet().forEach(e -> l.add(new MapEntry(((Map.Entry)e).getKey(), ((Map.Entry)e).getValue())));
        return (m != null)?l:null;
    }

    protected void bind(MDDBinder binder, TwinColSelect<Object> tf, FieldInterfaced field) {
        binder.forField(tf).withValidator(new BeanValidator(field.getDeclaringClass(), field.getName())).bind(field.getName());
    }


}
