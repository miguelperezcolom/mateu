package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.google.common.collect.Sets;
import com.vaadin.data.*;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.shared.ui.grid.HeightMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.data.FareValue;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.model.common.Resource;
import io.mateu.mdd.core.reflection.*;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ListViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.OwnedCollectionComponent;

import javax.persistence.ElementCollection;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

public class JPAOneToManyFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        boolean ok = field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ElementCollection.class) || field.isAnnotationPresent(ManyToMany.class);
        if (!ok) {
            ok = Collection.class.isAssignableFrom(field.getType());
            if (ok) {
                Class gc = ReflectionHelper.getGenericClass(field, Collection.class, "E");
                ok &= !(String.class.equals(gc) || Integer.class.equals(gc) || Long.class.equals(gc) || Float.class.equals(gc) || Double.class.equals(gc) || Boolean.class.equals(gc));
            }
            if (!ok) ok = Map.class.isAssignableFrom(field.getType());
        }
        return ok;
    }

    public void build(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter) {


        if (forSearchFilter) {

            // todo: añadir para contains

        } else {

           boolean owned = ReflectionHelper.isOwnedCollection(field);


            if (Map.class.isAssignableFrom(field.getType())) {


                buildMap(field, object, container, binder, validators, stylist, allFieldContainers, forSearchFilter, owned);

            } else {

                buildList(field, object, container, binder, validators, stylist, allFieldContainers, forSearchFilter, owned);


            }

        }

    }

    private void buildList(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue,List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced,Component> allFieldContainers, boolean forSearchFilter, boolean owned) {

        Method mh;
        if (field.isAnnotationPresent(UseChips.class)) {

            HorizontalLayout hl = new HorizontalLayout();
            hl.addStyleName(CSS.NOPADDING);

            CssLayout l = new CssLayout();
            l.addStyleName(CSS.NOPADDING);
            hl.addComponent(l);

            Button b;
            l.addComponent(b = new Button("Add"));
            b.addStyleName(ValoTheme.BUTTON_LINK);
            b.addClickListener(e -> MDDUI.get().getNavegador().go(field.getName()));

            hl.setCaption(ReflectionHelper.getCaption(field));

            container.addComponent(hl);

            bind(binder, l, field);


        } else if (field.isAnnotationPresent(UseTwinCols.class)) {

            TwinColSelect<Object> tf = new TwinColSelect((container.getComponentCount() > 0)?ReflectionHelper.getCaption(field):null);
            tf.setRows(10);
            tf.setLeftColumnCaption("Available options");
            tf.setRightColumnCaption("Selected options");

            if (field.isAnnotationPresent(FullWidth.class)) tf.setWidth("100%");

            //tf.addValueChangeListener(event -> Notification.show("Value changed:", String.valueOf(event.getValue()), Type.TRAY_NOTIFICATION));

            container.addComponent(tf);

            JPAManyToOneFieldBuilder.setDataProvider(tf, field, binder);

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

            if (allFieldContainers != null) allFieldContainers.put(field, tf);

            tf.setCaption(ReflectionHelper.getCaption(field));

            bind(binder, tf, field);

        } else if (field.isAnnotationPresent(UseLinkToListView.class)) {

            HorizontalLayout hl = new HorizontalLayout();

            Label l;
            hl.addComponent(l = new Label(""));
            l.addStyleName("collectionlinklabel");

            Button b;
            hl.addComponent(b = new Button("Open"));
            b.addStyleName(ValoTheme.BUTTON_LINK);
            b.addClickListener(e -> MDDUI.get().getNavegador().go(field.getName()));

            hl.setCaption(ReflectionHelper.getCaption(field));

            container.addComponent(hl);

            bind(binder, l, field, null);

        } else if (field.isAnnotationPresent(UseCheckboxes.class)) {

            CheckBoxGroup cbg = new CheckBoxGroup();

            JPAManyToOneFieldBuilder.setDataProvider(cbg, field, binder);

            cbg.addValueChangeListener(e -> updateReferences(binder, field, e));

            cbg.setCaption(ReflectionHelper.getCaption(field));

            container.addComponent(cbg);

            bind(binder, cbg, field);

        } else if ((mh = ReflectionHelper.getMethod(field.getDeclaringClass(), ReflectionHelper.getGetter(field.getName()) + "Html")) != null) {

            VerticalLayout hl = new VerticalLayout();

            Label l;
            hl.addComponent(l = new Label("", ContentMode.HTML));
            l.addStyleName("collectionlinklabel");
            hl.addStyleName(CSS.NOPADDING);

            Button b;
            hl.addComponent(b = new Button("Edit"));
            b.addStyleName(ValoTheme.BUTTON_LINK);
            b.addClickListener(e -> MDDUI.get().getNavegador().go(field.getName()));

            hl.setCaption(ReflectionHelper.getCaption(field));

            container.addComponent(hl);

            bind(binder, l, field, mh);

        } else {

            Grid g = new Grid();

            List<FieldInterfaced> colFields = getColumnFields(field);
            List<FieldInterfaced> editableFields = ReflectionHelper.getAllEditableFields(ReflectionHelper.getGenericClass(field.getGenericType()), field.getDeclaringClass(), false, field);
            List<FieldInterfaced> originalEditableFields = editableFields;

            Class targetClass = field.getGenericClass();

            Set<Class> subclasses = ReflectionHelper.getSubclasses(targetClass);


            boolean inline = false;

            if (owned) {

                inline = editableFields.size() <= colFields.size() && subclasses.size() == 0 && !field.isAnnotationPresent(NotInlineEditable.class);

                if (inline) for (FieldInterfaced f : editableFields) {
                    if (!isEditableInline(f)) {
                        inline = false;
                        break;
                    }
                }

                if (inline) {

                    boolean needsProxy = false;
                    for (FieldInterfaced f : editableFields) if (f.isAnnotationPresent(UseCheckboxes.class) && f.getAnnotation(UseCheckboxes.class).editableInline()) {
                        needsProxy = true;
                        break;
                    }

                    if (false && needsProxy) {

                        targetClass = ReflectionHelper.getProxy(field.isAnnotationPresent(FieldsFilter.class)?field.getAnnotation(FieldsFilter.class).value():null, targetClass, field, object, editableFields);
                        //si hemos creado una clase proxy, entonces cambian las columnas y los campos editables
                        if (ProxyClass.class.isAssignableFrom(targetClass)) {
                            colFields = getColumnFields(field, targetClass);
                            editableFields = ReflectionHelper.getAllEditableFields(targetClass);
                        }

                        inline = editableFields.size() <= colFields.size() && subclasses.size() == 0;

                        if (inline) for (FieldInterfaced f : colFields) {
                            if (!isEditableInline(f)) {
                                inline = false;
                                break;
                            }
                        }

                    }
                }

            }


            ListViewComponent.buildColumns(g, colFields, false, inline, binder, field);

            g.setSelectionMode(Grid.SelectionMode.MULTI);

            g.setCaption(ReflectionHelper.getCaption(field));


            int ancho = 0;
            for (Grid.Column col : (List<Grid.Column>)g.getColumns()) ancho += col.getWidth();
            if (ancho <= 0) ancho = 500;


            boolean anchoCompleto = field.isAnnotationPresent(FullWidth.class) || ancho > 900;
            anchoCompleto = false;

            if (anchoCompleto) g.setWidth("100%");
            else {
                g.setWidth("" + (ancho + 50) + "px");
            }

            // añadimos columna para que no haga feo
            if (anchoCompleto) {
                if (g.getColumns().size() == 1) ((Grid.Column)g.getColumns().get(0)).setExpandRatio(1);
                else g.addColumn((d) -> null).setWidthUndefined().setCaption("");
            }

            g.setHeightMode(HeightMode.UNDEFINED);



            HorizontalLayout hl = new HorizontalLayout();

            Button b;

            if (owned) {

                //g.setHeightByRows(5);

                bind(binder, g, field, targetClass, originalEditableFields, object);

                if (inline) {

                    g.getEditor().setEnabled(true);
                    g.getEditor().setBuffered(false);



                    hl.addComponent(b = new Button("Add", VaadinIcons.PLUS));
                    b.addClickListener(e -> {
                        try {
                            Object bean = binder.getBean();

                            ReflectionHelper.addToCollection(binder, field, bean);

                            binder.setBean(bean, false);
                        } catch (Exception e1) {
                            MDD.alert(e1);
                        }
                    });

                } else {

                    g.addItemClickListener(e -> {
                        if (MDD.isMobile() || e.getMouseEventDetails().isDoubleClick()) {
                            Object i = e.getItem();
                            if (i != null) {

                                String state = MDDUI.get().getNavegador().getViewProvider().getCurrentPath();
                                if (!state.endsWith("/")) state += "/";
                                state += field.getName();

                                try {
                                    OwnedCollectionComponent occ;
                                    MDDUI.get().getNavegador().getStack().push(state, occ = new OwnedCollectionComponent(binder, field, e.getRowIndex()));
                                    MDDUI.get().getNavegador().goTo(state);
                                } catch (Exception e1) {
                                    e1.printStackTrace();
                                }

                            }
                        }
                    });


                    hl.addComponent(b = new Button("Add", VaadinIcons.PLUS));
                    b.addClickListener(e -> MDDUI.get().getNavegador().go(field.getName()));

                }

                hl.addComponent(b = new Button("Duplicate", VaadinIcons.COPY));
                b.addClickListener(e -> {
                    try {

                        Object bean = binder.getBean();

                        for (Object o : g.getSelectedItems()) {

                            if (o instanceof ProxyClass) o = ((ProxyClass)o).toObject();

                            ReflectionHelper.addToCollection(binder, field, bean, ReflectionHelper.clone(o));

                        }

                        binder.setBean(bean, false);
                    } catch (Exception e1) {
                        MDD.alert(e1);
                    }
                });

                hl.addComponent(b = new Button("Remove", VaadinIcons.MINUS));
                b.addClickListener(e -> {
                    try {
                        Object bean = binder.getBean();
                        Set l = (Set) g.getSelectedItems().stream().map(o -> o != null && o instanceof ProxyClass?((ProxyClass)o).toObject():o).collect(Collectors.toSet());

                        if (field.isAnnotationPresent(OneToMany.class) && field.getAnnotation(OneToMany.class).orphanRemoval()) {
                        } else {
                            binder.getRemovables().addAll(l);
                        }
                        ReflectionHelper.removeFromCollection(binder, field, bean, l, false);


                        binder.setBean(bean, false);
                    } catch (Exception e1) {
                        MDD.alert(e1);
                    }
                });

                //todo: faltan botones para ordenar la lista



            } else {


                DataProvider dpa = (field.isAnnotationPresent(DataProvider.class)) ? field.getAnnotation(DataProvider.class) : null;

                boolean seleccion = false;

                if (dpa == null) {

                    Method mdp = ReflectionHelper.getMethod(field.getDeclaringClass(), ReflectionHelper.getGetter(field.getName()) + "DataProvider");

                    seleccion = mdp != null;

                } else seleccion = true;


                if (seleccion) { // queremos seleccionar valores de entre una lista


                    JPAManyToOneFieldBuilder.setDataProvider(g, field, binder);


                    bindSelection(binder, g, field);


                } else {

                    bind(binder, g, field, targetClass, null);


                    g.addItemClickListener(e -> {
                        if (MDD.isMobile() || e.getMouseEventDetails().isDoubleClick()) {
                            Object i = e.getItem();
                            if (i != null) {
                                MDDUI.get().getNavegador().go(field.getName());
                            }
                        }
                    });

                    hl.addComponent(b = new Button("Add items", VaadinIcons.PLUS));
                    b.addClickListener(e -> MDDUI.get().getNavegador().go(field.getName()));

                    hl.addComponent(b = new Button("Remove selection", VaadinIcons.MINUS));
                    b.addClickListener(e -> {
                        try {
                            Object bean = binder.getBean();
                            Set l = g.getSelectedItems();

                            ReflectionHelper.removeFromCollection(binder, field, bean, l);


                            binder.setBean(bean, false);
                        } catch (Exception e1) {
                            MDD.alert(e1);
                        }
                    });

                }

            }

            if (hl.getComponentCount() > 0) {

                VerticalLayout vl;
                container.addComponent(vl = new VerticalLayout(g, hl));
                vl.addStyleName(CSS.NOPADDING);

            } else {

                container.addComponent(g);

            }

        }

    }


    private boolean isEditableInline(FieldInterfaced f) {

        boolean editable = false;

        if (true || !f.isAnnotationPresent(NotNull.class) && !f.isAnnotationPresent(NotEmpty.class)) {

            if (Boolean.class.equals(f.getType()) || boolean.class.equals(f.getType())) {
                editable = true;
            } else if (String.class.equals(f.getType())) {
                editable = true;
            } else if (Integer.class.equals(f.getType()) || int.class.equals(f.getType())) {
                editable = true;
            } else if (Long.class.equals(f.getType()) || long.class.equals(f.getType())) {
                editable = true;
            } else if (Double.class.equals(f.getType()) || double.class.equals(f.getType())) {
                editable = true;
            } else if (LocalDate.class.equals(f.getType()) || LocalDateTime.class.equals(f.getType())) {
                editable = true;
            } else if (f.getType().isEnum()) {
                editable = true;
            } else if (f.isAnnotationPresent(ManyToOne.class)) {
                editable = !Resource.class.equals(f.getType());
            } else if (f.isAnnotationPresent(UseCheckboxes.class)) {
                editable = f.getAnnotation(UseCheckboxes.class).editableInline();
            } else if (f.isAnnotationPresent(WeekDays.class)) {
                editable = true;
            } else if (FareValue.class.equals(f.getType())) {
                editable = true;
            }

        }


        return editable;

    }

    private void buildMap(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, boolean owned) {
        Class keyType = ReflectionHelper.getGenericClass(field, Map.class, "K");
        Class valueType = ReflectionHelper.getGenericClass(field, Map.class, "V");

        Grid g = new Grid();

        ListViewComponent.buildColumns(g, getColumnFields(field), false, true);

        int ancho = 0;
        for (Grid.Column col : (List<Grid.Column>)g.getColumns()) ancho += col.getWidth();
        if (ancho <= 0) ancho = 500;


        boolean anchoCompleto = field.isAnnotationPresent(FullWidth.class) || ancho > 900;
        anchoCompleto = false;

        if (anchoCompleto) g.setWidth("100%");
        else {
            g.setWidth("" + (ancho + 50) + "px");
        }

        // añadimos columna para que no haga feo
        if (anchoCompleto) {
            if (g.getColumns().size() == 1) ((Grid.Column)g.getColumns().get(0)).setExpandRatio(1);
            else g.addColumn((d) -> null).setWidthUndefined().setCaption("");
        }

        g.setHeightMode(HeightMode.UNDEFINED);

        g.setSelectionMode(Grid.SelectionMode.MULTI);

        g.setCaption(ReflectionHelper.getCaption(field));

        VerticalLayout vl = new VerticalLayout();
        vl.addStyleName(CSS.NOPADDING);

        vl.addComponent(g);

        bindMap(binder, g, field);


        Layout lx = new VerticalLayout();
        lx.addStyleName(CSS.NOPADDING);


        List<FieldInterfaced> auxFields = new ArrayList<>();
        auxFields.add(new FieldInterfacedFromType(ReflectionHelper.getGenericClass((ParameterizedType) field.getGenericType(), Map.class, "K"), "key"));
        auxFields.add(new FieldInterfacedFromType(ReflectionHelper.getGenericClass((ParameterizedType) field.getGenericType(), Map.class, "V"), "value"));
        MDDBinder auxbinder = new MDDBinder(auxFields);
        Map<String, Object> m = new HashMap<>();
        auxbinder.setBean(m);
        Layout finalHl = lx;
        auxFields.forEach(f -> {
            AbstractFieldBuilder b = MDD.getApp().getFieldBuilder(f);
            if (b != null) b.build(f, m, finalHl, auxbinder, null, null, null, false);
        });

        vl.addComponent(lx);

        HorizontalLayout hl = new HorizontalLayout();
        Button b;

        g.getEditor().setEnabled(true);
        ((Grid.Column)g.getColumns().get(0)).setEditable(false);
        g.getEditor().setBuffered(false);
        g.setHeightMode(HeightMode.UNDEFINED);

        hl.addComponent(b = new Button("Put", VaadinIcons.PLUS));
        b.addClickListener(e -> {

            Object bean = binder.getBean();

            Map<String, Object> aux = (Map<String, Object>) auxbinder.getBean();
            Object k = aux.get("key");
            Object v = aux.get("value");

            try {

                if (k != null) {
                    ReflectionHelper.addToMap(binder, field, bean, k, v);

                    binder.setBean(bean, false);
                }

            } catch (Exception e1) {
                MDD.alert(e1);
            }


        });

        hl.addComponent(b = new Button("Remove selected lines", VaadinIcons.MINUS));
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

        vl.addComponent(hl);

        container.addComponent(vl);

    }

    private void bindMap(MDDBinder binder, Grid g, FieldInterfaced field) {
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

    private void updateReferences(MDDBinder binder, FieldInterfaced field, HasValue.ValueChangeEvent<Set<Object>> e) {
        Object bean = binder.getBean();
        e.getOldValue().stream().filter(i -> !e.getValue().contains(i)).forEach(i -> {
            try {
                ReflectionHelper.unReverseMap(binder, field, bean, i);
            } catch (Exception e1) {
                MDD.alert(e1);
            }
        });
        e.getValue().stream().filter(i -> !e.getOldValue().contains(i)).forEach(i -> {
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


    public static List<FieldInterfaced> getColumnFields(FieldInterfaced field) {

        List<FieldInterfaced> l = null;

        if (Map.class.isAssignableFrom(field.getType())) {

            l = new ArrayList<>();

            l.add(new FieldInterfacedFromType(ReflectionHelper.getGenericClass(field,  Map.class, "K"), "key"));
            l.add(new FieldInterfacedFromType(ReflectionHelper.getGenericClass(field,  Map.class, "V"), "value"));

        } else {

            l = getColumnFields(field, field.getGenericClass());

        }

        return l;
    }

    public static List<FieldInterfaced> getColumnFields(FieldInterfaced field, Class rowType) {

        List<FieldInterfaced> l = null;

        l = ListViewComponent.getColumnFields(rowType, true);

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

        if (field.isAnnotationPresent(FieldsFilter.class)) {

            List<String> fns = Arrays.asList(field.getAnnotation(FieldsFilter.class).value().split(","));

            List<FieldInterfaced> borrar = new ArrayList<>();
            for (FieldInterfaced f : l) {
                if (!fns.contains(f.getName())) {
                    borrar.add(f);
                }
            }
            l.removeAll(borrar);

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

    private void bindSelection(MDDBinder binder, Grid g, FieldInterfaced field) {
        Binder.BindingBuilder aux = binder.forField(new HasValue() {

            List<ValueChangeListener> valueChangeListeners = new ArrayList<>();

            {
                g.getSelectionModel().addSelectionListener(e -> {
                    ValueChangeEvent vce = new ValueChangeEvent(g,  this, null, e.isUserOriginated());
                    valueChangeListeners.forEach(l -> l.valueChange(vce));
                });
            }


            @Override
            public void setValue(Object o) {
                g.deselectAll();
                if (o != null) {
                    if (o instanceof Collection) ((Collection)o).forEach(i -> g.select(i));
                    else g.select(o);
                }
            }

            @Override
            public Object getValue() {
                return g.getSelectedItems();
            }

            @Override
            public Registration addValueChangeListener(ValueChangeListener valueChangeListener) {
                valueChangeListeners.add(valueChangeListener);
                return new Registration() {
                    @Override
                    public void remove() {
                        valueChangeListeners.remove(valueChangeListener);
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
        });

        aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
    }



    private void bind(MDDBinder binder, CssLayout l, FieldInterfaced field) {
        Binder.BindingBuilder aux = binder.forField(new HasValue() {

            Object value;

            @Override
            public void setValue(Object o) {
                value = o;

                Button b = (Button) l.getComponent(l.getComponentCount() - 1);

                l.removeAllComponents();
                if (o == null || ((Collection)o).size() == 0) l.addComponent(new Label("Empty list"));
                else {
                    for (Object x : (Collection)o) l.addComponent(createChip(binder, field, x));
                }

                l.addComponent(b);
            }

            @Override
            public Object getValue() {
                return value;
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

    private Component createChip(MDDBinder binder, FieldInterfaced field, Object x) {
        HorizontalLayout hl = new HorizontalLayout();
        hl.addStyleName("chip");

        Label l;
        hl.addComponent(l = new Label(x.toString()));

        Button b;
        hl.addComponent(b = new Button(null, VaadinIcons.CLOSE_SMALL));

        b.addClickListener(e -> {
            try {
                ReflectionHelper.removeFromCollection(binder, field, binder.getBean(), Sets.newHashSet(x));
            } catch (Exception e1) {
                MDD.alert(e1);
            }
        });

        return hl;
    }

    private void bind(MDDBinder binder, Label l, FieldInterfaced field, Method htmlGetter) {
        Binder.BindingBuilder aux = binder.forField(new HasValue() {
            @Override
            public void setValue(Object o) {
                if (o == null || ((Collection)o).size() == 0) l.setValue("Empty list");
                else {
                    try {
                        l.setValue(htmlGetter != null? (String) htmlGetter.invoke(binder.getBean()) :"" + ((Collection)o).size() + " items");
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                }
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

    public static void bind(MDDBinder binder, Grid g, FieldInterfaced field, Class targetClass, List<FieldInterfaced> originalEditableFields) {
        bind(binder, g, field, targetClass, originalEditableFields, null);
    }

    public static void bind(MDDBinder binder, Grid g, FieldInterfaced field, Class targetClass, List<FieldInterfaced> originalEditableFields, Object owner) {

        if (ProxyClass.class.isAssignableFrom(targetClass)) {

            Binder.BindingBuilder aux = binder.forField(new HasValue() {
                @Override
                public void setValue(Object o) {
                    Collection items = null;
                    if (o == null) {
                        items = new ArrayList();
                    } else {

                        if (o instanceof Map) {
                            items = new ArrayList();
                            Class keyType = ReflectionHelper.getGenericClass(field, Map.class, "K");

                            if (keyType != null && keyType.isEnum()) {
                                //todo: prefill
                                //todo: añadir anotación @Prefill
                            }

                            items = ((Map) o).entrySet();
                        } else {
                            items = new ArrayList();

                            Map<String, Map> valoresPosiblesPorCampo = new HashMap<>();

                            for (FieldInterfaced f : originalEditableFields) {
                                if (f.isAnnotationPresent(UseCheckboxes.class) && f.getAnnotation(UseCheckboxes.class).editableInline()) {

                                    Collection possibleValues = null;

                                    String vmn = ReflectionHelper.getGetter(field.getName() + ReflectionHelper.getFirstUpper(f.getName())) + "Values";

                                    Method mdp = ReflectionHelper.getMethod(field.getDeclaringClass(), vmn);

                                    if (mdp != null) {
                                        try {
                                            possibleValues = (Collection) mdp.invoke(owner);
                                        } catch (Exception e) {
                                            MDD.alert(e);
                                        }
                                    } else {
                                        MDD.alert("Missing " + vmn + " method at " + field.getDeclaringClass().getName());
                                    }


                                    int pos = 0;
                                    if (possibleValues != null) {
                                        Map l = valoresPosiblesPorCampo.get(f.getName());
                                        if (l == null) valoresPosiblesPorCampo.put(f.getName(), l = new HashMap());
                                        for (Object v : possibleValues) if (v != null) {
                                            l.put(pos, v);
                                            pos++;
                                        }
                                    }

                                }
                            }

                            for (Object x : (Collection) o) {
                                //binder.getMergeables().add(x);
                                try {
                                    items.add(targetClass.getConstructor(x.getClass(), Map.class, MDDBinder.class).newInstance(x, valoresPosiblesPorCampo, binder));
                                } catch (InstantiationException e) {
                                    e.printStackTrace();
                                } catch (IllegalAccessException e) {
                                    e.printStackTrace();
                                } catch (NoSuchMethodException e) {
                                    e.printStackTrace();
                                } catch (InvocationTargetException e) {
                                    e.printStackTrace();
                                }
                            }
                        }
                    }
                    g.setDataProvider(new ListDataProvider(items));
                }

                @Override
                public Object getValue() {
                    Collection items = new ArrayList();
                    for (Object o : ((ListDataProvider) g.getDataProvider()).getItems()) {
                        ((ArrayList) items).add(((ProxyClass)o).toObject());
                    }
                    return items;
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


        } else {

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

            aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
            aux.bind(field.getName());

        }

    }

    private static List<MapEntry> toList(Map m) {
        List<MapEntry> l = new ArrayList<>();
        if (m != null) m.entrySet().forEach(e -> l.add(new MapEntry(((Map.Entry)e).getKey(), ((Map.Entry)e).getValue())));
        return (m != null)?l:null;
    }

    protected void bind(MDDBinder binder, TwinColSelect<Object> tf, FieldInterfaced field) {
        binder.forField(tf).withValidator(new BeanValidator(field.getDeclaringClass(), field.getName())).bind(field.getName());
    }


}
