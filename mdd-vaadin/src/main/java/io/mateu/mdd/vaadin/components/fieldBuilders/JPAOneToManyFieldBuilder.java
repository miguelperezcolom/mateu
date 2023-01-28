package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.google.common.collect.Iterables;
import com.google.common.collect.Sets;
import com.vaadin.data.*;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.ClassResource;
import com.vaadin.server.ExternalResource;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.shared.ui.dnd.DropEffect;
import com.vaadin.shared.ui.dnd.EffectAllowed;
import com.vaadin.shared.ui.grid.HeightMode;
import com.vaadin.ui.*;
import com.vaadin.ui.dnd.DragSourceExtension;
import com.vaadin.ui.dnd.DropTargetExtension;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.Card;
import io.mateu.mdd.core.interfaces.GridDecorator;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.FareValue;
import io.mateu.mdd.shared.interfaces.IResource;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.util.VaadinHelper;
import io.mateu.reflection.*;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.*;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
public class JPAOneToManyFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        //boolean ok = field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ElementCollection.class) || field.isAnnotationPresent(ManyToMany.class);
        boolean ok = Collection.class.isAssignableFrom(field.getType());
        if (ok) {
            Class gc = ReflectionHelper.getGenericClass(field, Collection.class, "E");
            ok &= !(String.class.equals(gc) || Integer.class.equals(gc) || Long.class.equals(gc) || Float.class.equals(gc) || Double.class.equals(gc) || Boolean.class.equals(gc));
        }
        if (!ok) ok = Map.class.isAssignableFrom(field.getType());
        return ok;
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        Component r = null;

        if (forSearchFilter) {

            // todo: añadir para contains

        } else {

           boolean owned = ReflectionHelper.isOwnedCollection(field);


            if (Map.class.isAssignableFrom(field.getType())) {


                r = buildMap(fieldGroup, fieldGroupHeader, field, object, container, binder, validators, stylist, allFieldContainers, forSearchFilter, owned, attachedActions);

            } else {

                r = buildList(field, object, container, binder, validators, stylist, allFieldContainers, forSearchFilter, owned, attachedActions);


            }

        }

        if (r != null) r.addStyleName("test-" + field.getId());

        return r;
    }

    private Component buildList(FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, boolean owned, Map<String, List<AbstractAction>> attachedActions) {

        Component r = null;

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
            b.addClickListener(e -> MDDUIAccessor.go(field.getName()));

            if (allFieldContainers != null) allFieldContainers.put(field, hl);

            hl.setCaption(ReflectionHelper.getCaption(field));

            addComponent(container, hl, attachedActions.get(field.getName()));

            bind(binder, l, field);

            addErrorHandler(field, l);

            r = l;

        } else if (field.isAnnotationPresent(UseTwinCols.class)) {

            TwinColSelect<Object> tf = new TwinColSelect((container.getComponentCount() > 0)?ReflectionHelper.getCaption(field):null);
            tf.setRows(10);
            tf.setLeftColumnCaption("Available options");
            tf.setRightColumnCaption("Selected options");

            if (field.isAnnotationPresent(FullWidth.class)) tf.setWidth("100%");

            //tf.addValueChangeListener(event -> Notification.show("Value changed:", String.valueOf(event.getValue()), Type.TRAY_NOTIFICATION));

            addComponent(container, tf, attachedActions.get(field.getName()));

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

            addErrorHandler(field, tf);

            r = tf;

        } else if (field.isAnnotationPresent(UseLinkToListView.class)) {

            HorizontalLayout hl = new HorizontalLayout();

            Label l;
            hl.addComponent(l = new Label(""));
            l.addStyleName("collectionlinklabel");

            hl.addStyleName(CSS.CLICKABLE);
            hl.addLayoutClickListener(e -> {
                //if (e.isDoubleClick())
                    MDDUIAccessor.go(field.getName());
            });

            hl.setCaption(ReflectionHelper.getCaption(field));

            if (allFieldContainers != null) allFieldContainers.put(field, hl);

            addComponent(container, hl, attachedActions.get(field.getName()));

            bind(binder, l, field, null);

            addErrorHandler(field, l);

            r = l;

        } else if (field.isAnnotationPresent(UseCheckboxes.class)) {

            CheckBoxGroup cbg = new CheckBoxGroup();

            JPAManyToOneFieldBuilder.setDataProvider(cbg, field, binder);

            /*
            cbg.addValueChangeListener(e -> {
                updateReferences(binder, field, e);
            });
             */

            cbg.addValueChangeListener(e -> {
                if (e.isUserOriginated()) {
                    try {
                        ReflectionHelper.setValue(field, binder.getBean(), e.getValue());
                    } catch (Exception ex) {
                        Notifier.alert(ex);
                    }
                }
            });

            cbg.setCaption(ReflectionHelper.getCaption(field));

            if (allFieldContainers != null) allFieldContainers.put(field, cbg);

            addComponent(container, cbg, attachedActions.get(field.getName()));

            bind(binder, cbg, field);

            addErrorHandler(field, cbg);

            r = cbg;

        } else if ((mh = ReflectionHelper.getMethod(field.getDeclaringClass(), ReflectionHelper.getGetter(field.getName()) + "Html")) != null) {

            VerticalLayout hl = new VerticalLayout();
            hl.addStyleName("collectionlinklabel");

            Label l;
            hl.addComponent(l = new Label("", ContentMode.HTML));
            hl.addStyleName(CSS.NOPADDING);

            hl.addStyleName(CSS.CLICKABLE);
            hl.addLayoutClickListener(e -> {
                //if (e.isDoubleClick())
                    MDDUIAccessor.go(field.getName());
            });

            hl.setCaption(ReflectionHelper.getCaption(field));

            if (allFieldContainers != null) allFieldContainers.put(field, hl);

            addComponent(container, hl, attachedActions.get(field.getName()));

            bind(binder, l, field, mh);

            addErrorHandler(field, l);

            r = l;

        } else if (Card.class.isAssignableFrom(field.getGenericClass())) {

            CssLayout hl = new CssLayout();
            hl.addStyleName("collectionlinklabel");

            hl.setCaption(ReflectionHelper.getCaption(field));

            if (allFieldContainers != null) allFieldContainers.put(field, hl);

            addComponent(container, hl, attachedActions.get(field.getName()));

            bind(binder, hl, field, mh);

            addErrorHandler(field, hl);

            r = hl;

        } else if (IResource.class.isAssignableFrom(field.getGenericClass())) {

            CssLayout hl = new CssLayout();

            hl.addStyleName(CSS.NOPADDING);

            hl.setCaption(ReflectionHelper.getCaption(field));

            if (allFieldContainers != null) allFieldContainers.put(field, hl);

            hl.addStyleName(CSS.CLICKABLE);
            hl.addLayoutClickListener(e -> {
                //if (e.isDoubleClick())
                    MDDUIAccessor.go(field.getName());
            });

            addComponent(container, hl, attachedActions.get(field.getName()));

            bindResourcesList(binder, hl, field);

            addErrorHandler(field, hl);

            r = hl;

        } else if (false && field.isAnnotationPresent(UseTable.class)) {

            VerticalLayout hl = new VerticalLayout();
            hl.addStyleName("onetomanytable");
            hl.addStyleName(CSS.CLICKABLE);

            Label l;
            hl.addComponent(l = new Label("", ContentMode.HTML));
            hl.addStyleName(CSS.NOPADDING);

            hl.addLayoutClickListener(e -> {
                //if (e.isDoubleClick())
                    MDDUIAccessor.go(field.getName());
            });

            hl.setCaption(ReflectionHelper.getCaption(field));

            addComponent(container, hl, attachedActions.get(field.getName()));

            bind(binder, l, field);

            addErrorHandler(field, l);

            r = l;

        } else {

            Grid g = new Grid();

            g.addStyleName("gridonetomany");
            g.addStyleName("nooutput");
            g.addStyleName("test-" + field.getId() + "-grid");

            String colsFilter = "";
            if (field.isAnnotationPresent(UseTable.class)) colsFilter = field.getAnnotation(UseTable.class).fields();
            if (Strings.isNullOrEmpty(colsFilter) && field.isAnnotationPresent(FieldsFilter.class)) colsFilter = field.getAnnotation(FieldsFilter.class).value();

            List<FieldInterfaced> colFields = getColumnFields(field, colsFilter);
            List<FieldInterfaced> editableFields = ReflectionHelper.getAllEditableFields(ReflectionHelper.getGenericClass(field.getGenericType()), field.getDeclaringClass(), false, field);
            List<FieldInterfaced> originalEditableFields = editableFields;

            Class targetClass = field.getGenericClass();

            Set<Class> subclasses = ReflectionHelper.getSubclasses(targetClass);


            addErrorHandler(field, g);

            r = g;

            boolean inline = false;

            if (owned && !field.isAnnotationPresent(UseTable.class)) {

                inline = editableFields.size() <= colFields.size() && subclasses.size() == 0 && !field.isAnnotationPresent(NotInlineEditable.class);
                inline = false;

                if (inline) for (FieldInterfaced f : editableFields) {
                    if (!isEditableInline(f)) {
                        inline = false;
                        break;
                    }
                }

                if (inline ) {

                    g.addStyleName("inline");

                    boolean needsProxy = false;
                    for (FieldInterfaced f : editableFields) if (f.isAnnotationPresent(UseCheckboxes.class) && f.getAnnotation(UseCheckboxes.class).editableInline()) {
                        needsProxy = true;
                        break;
                    }

                    if (false && needsProxy) {

                        targetClass = ReflectionHelper.getProxy(MDD.getClassPool(), MDDBinder.class, MDD.getClassPool().getClassLoader(), field.isAnnotationPresent(FieldsFilter.class)?field.getAnnotation(FieldsFilter.class).value():null, targetClass, field, object, editableFields);
                        //si hemos creado una clase proxy, entonces cambian las columnas y los campos editables
                        if (ProxyClass.class.isAssignableFrom(targetClass)) {
                            colFields = getColumnFields(field, targetClass);
                            editableFields = ReflectionHelper.getAllEditableFields(targetClass);
                        }

                        inline = editableFields.size() <= colFields.size() && subclasses.size() == 0;
                        inline = false;

                        if (inline) for (FieldInterfaced f : colFields) {
                            if (!isEditableInline(f)) {
                                inline = false;
                                break;
                            }
                        }

                    }
                }

            }


            ListViewComponent.buildColumns(null, g, colFields, false, inline, binder, field, field.isAnnotationPresent(FieldsFilter.class)?field.getAnnotation(FieldsFilter.class).value():null);


            GridDecorator decorator = null;
            try {
                Method m = ReflectionHelper.getMethod(targetClass, "getGridDecorator");
                if (m != null) {
                    if (Modifier.isStatic(m.getModifiers())) {
                        decorator = (GridDecorator) m.invoke(null);
                    } else {
                        decorator = (GridDecorator) m.invoke(ReflectionHelper.newInstance(targetClass));
                    }
                } else {
                    if (GridDecorator.class.isAssignableFrom(targetClass)) {
                        decorator = (GridDecorator)ReflectionHelper.newInstance(targetClass);
                    }
                }
                if (decorator != null) {
                    decorator.decorateGrid(g);
                }
            } catch (Exception e) {
                Notifier.alert(e);
            }


            g.setSelectionMode(Grid.SelectionMode.MULTI);

            g.setCaption(ReflectionHelper.getCaption(field));

            if (inline) {
                g.getEditor().getBinder().addValueChangeListener(e -> {
                    Object bean = binder.getBean();
                    try {
                        ReflectionHelper.setValue(field, bean, ReflectionHelper.getValue(field, bean));
                        binder.setBean(bean);
                    } catch (Exception ex) {
                        Notifier.alert(ex);
                    }
                });
            }


            int ancho = 0;
            for (Grid.Column col : (List<Grid.Column>)g.getColumns()) ancho += col.getWidth();
            if (ancho <= 0) ancho = 500;


            boolean anchoCompleto = field.isAnnotationPresent(FullWidth.class) || ancho > 900;
            anchoCompleto = true;

            if (anchoCompleto) g.setWidth("100%");
            else {
                g.setWidth("" + (ancho + 55) + "px");
            }

            // añadimos columna para que no haga feo
            if (anchoCompleto) {
                if (g.getColumns().size() == 1) ((Grid.Column)g.getColumns().get(0)).setExpandRatio(1);
                else g.addColumn((d) -> null).setWidthUndefined().setCaption("");
            }

            g.setHeightMode(HeightMode.UNDEFINED);

            HorizontalLayout hl = new HorizontalLayout();
            hl.addStyleName("botoneracampo");

            Button b;

            if (owned) {

                //g.setHeightByRows(5);

                bind(binder, g, field, targetClass, originalEditableFields, object);

                if (field.isAnnotationPresent(ModifyValuesOnly.class) && (attachedActions.get(field.getName()) == null || attachedActions.get(field.getName()).size() == 0)) g.setSelectionMode(Grid.SelectionMode.NONE);

                if (inline) {

                        g.getEditor().setEnabled(true);
                        g.getEditor().setBuffered(false);


                        if (!field.isAnnotationPresent(ModifyValuesOnly.class)) {

                            hl.addComponent(b = new Button(VaadinIcons.PLUS));
                            b.addStyleName(ValoTheme.BUTTON_QUIET);
                            b.addStyleName(ValoTheme.BUTTON_TINY);
                            b.addStyleName("test-" + field.getId() + "-add");
                            b.addClickListener(e -> {
                                try {
                                    Object bean = binder.getBean();

                                    ReflectionHelper.addToCollection(field, bean);

                                    binder.setBean(bean, false);
                                } catch (Exception e1) {
                                    Notifier.alert(e1);
                                }
                            });

                        }

                    } else {

                        g.addItemClickListener(e -> {
                            //if (MDDUIAccessor.isMobile() || e.getMouseEventDetails().isDoubleClick()) {
                            if (e.getColumn() != null) {
                                Object i = e.getItem();
                                if (i != null) {

                                    editar(binder, field, i, e.getRowIndex());

                                }
                            }
                            //}
                        });


                        if (!field.isAnnotationPresent(ModifyValuesOnly.class) && ReflectionHelper.puedeAnadir(field)) {

                            hl.addComponent(b = new Button(VaadinIcons.PLUS));
                            b.addStyleName(ValoTheme.BUTTON_QUIET);
                            b.addStyleName(ValoTheme.BUTTON_TINY);
                            b.addStyleName("test-" + field.getId() + "-add");
                            b.addClickListener(e -> {

                                try {
                                    Constructor con = ReflectionHelper.getConstructor(field.getGenericClass(), binder.getBeanType());
                                    if (con == null) {
                                        con = Arrays.stream(field.getGenericClass().getConstructors()).filter(c -> c.getParameterCount() == 0).findFirst().orElse(null);
                                    }
                                    if (con != null && Modifier.isPublic(con.getModifiers())) {
                                        try {
                                            Collection col;
                                            Object i = Iterables.getLast(col = ReflectionHelper.addToCollection(field, binder.getBean()));
                                            //editar(binder, field, i, col.size() - 1);
                                            binder.setBean(binder.getBean(), false);
                                        } catch (Exception ex) {
                                            Notifier.alert(ex);
                                        }
                                    } else {
                                        con = ReflectionHelper.getConstructor(field.getGenericClass());
                                        if (con != null && con.getParameterCount() > 0) {
                                            VaadinHelper.fill("I need some data", con, i -> {
                                                try {
                                                    Collection col = ReflectionHelper.addToCollection(field, binder.getBean(), i);
                                                    //editar(binder, field, i, col.size() - 1);
                                                    binder.setBean(binder.getBean(), false);
                                                } catch (Exception ex) {
                                                    Notifier.alert(ex);
                                                }
                                            }, () -> MDDUIAccessor.goBack());
                                        } else Notifier.alert("No constructor found for " + field.getGenericClass().getSimpleName());
                                    }


                                } catch (Exception ex) {
                                    Notifier.alert(ex);
                                }

                            });
                        }

                    }

                if (!field.isAnnotationPresent(ModifyValuesOnly.class)) {

                    if (ReflectionHelper.puedeClonar(field)) {

                        hl.addComponent(b = new Button(VaadinIcons.COPY));
                        b.addStyleName(ValoTheme.BUTTON_QUIET);
                        b.addStyleName(ValoTheme.BUTTON_TINY);
                        b.addStyleName("test-" + field.getId() + "-clone");
                        b.addClickListener(e -> {
                            try {

                                Object bean = binder.getBean();

                                for (Object o : g.getSelectedItems()) {

                                    if (o instanceof ProxyClass) o = ((ProxyClass) o).toObject();


                                    ReflectionHelper.addToCollection(field, bean, ReflectionHelper.clone(o));

                                }

                                binder.setBean(bean, false);
                            } catch (Exception e1) {
                                Notifier.alert(e1);
                            }
                        });

                    }


                    if (ReflectionHelper.puedeBorrar(field)) {
                        hl.addComponent(b = new Button(VaadinIcons.MINUS));
                        b.addStyleName(ValoTheme.BUTTON_QUIET);
                        b.addStyleName(ValoTheme.BUTTON_TINY);
                        b.addStyleName("test-" + field.getId() + "-delete");
                        b.addClickListener(e -> {
                            try {
                                Object bean = binder.getBean();
                                Set l = (Set) g.getSelectedItems().stream().map(o -> o != null && o instanceof ProxyClass ? ((ProxyClass) o).toObject() : o).collect(Collectors.toSet());

                                ReflectionHelper.setValue(field, bean, ReflectionHelper.removeAll((Collection) ReflectionHelper.getValue(field, bean), l));

                                binder.setBean(bean, false);
                            } catch (Throwable throwable) {
                                Notifier.alert(throwable);
                            }
                        });
                    }

                    if (ReflectionHelper.puedeOrdenar(field)) {

                        hl.addComponent(b = new Button(VaadinIcons.ARROW_UP));
                        b.addStyleName(ValoTheme.BUTTON_QUIET);
                        b.addStyleName(ValoTheme.BUTTON_TINY);
                        b.addStyleName("test-" + field.getId() + "-up");
                        b.addClickListener(e -> {
                            try {

                                Object bean = binder.getBean();

                                Collection col = (Collection) ReflectionHelper.getValue(field, bean);

                                if (col != null && col instanceof  List) {
                                    List l = new ArrayList(col);

                                    Set sel = new HashSet(g.getSelectedItems());
                                    boolean posible = true;
                                    for (Object o : sel) {
                                        int index = l.indexOf(o);
                                        if (index == 0) {
                                            posible = false;
                                            break;
                                        }
                                    }

                                    if (posible) {
                                        for (Object o : (List) sel.stream().sorted((o1,o2) -> l.indexOf(o1) - l.indexOf(o2)).collect(Collectors.toList())) {
                                            int index = l.indexOf(o);
                                            if (index > 0) {
                                                l.remove(o);
                                                l.add(index - 1, o);
                                            }
                                        }

                                        ReflectionHelper.setValue(field, bean, l);
                                        binder.update(bean);
                                        g.deselectAll();
                                        sel.forEach(i -> g.select(i));
                                    }

                                }

                            } catch (Exception e1) {
                                Notifier.alert(e1);
                            }
                        });

                        hl.addComponent(b = new Button(VaadinIcons.ARROW_DOWN));
                        b.addStyleName(ValoTheme.BUTTON_QUIET);
                        b.addStyleName(ValoTheme.BUTTON_TINY);
                        b.addStyleName("test-" + field.getId() + "-down");
                        b.addClickListener(e -> {
                            try {

                                Object bean = binder.getBean();

                                Collection col = (Collection) ReflectionHelper.getValue(field, bean);

                                if (col != null && col instanceof  List) {
                                    List l = new ArrayList(col);

                                    Set sel = new HashSet(g.getSelectedItems());
                                    boolean posible = true;
                                    for (Object o : sel) {
                                        int index = l.indexOf(o);
                                        if (index == l.size() - 1) {
                                            posible = false;
                                            break;
                                        }
                                    }

                                    if (posible) {
                                        for (Object o : (List) sel.stream().sorted((o1,o2) -> l.indexOf(o2) - l.indexOf(o1)).collect(Collectors.toList())) {
                                            int index = l.indexOf(o);
                                            if (index < l.size() -1) {
                                                l.remove(o);
                                                l.add(index + 1, o);
                                            }
                                        }

                                        ReflectionHelper.setValue(field, bean, l);
                                        binder.update(bean);
                                        g.deselectAll();
                                        sel.forEach(i -> g.select(i));
                                    }
                                }

                            } catch (Exception e1) {
                                Notifier.alert(e1);
                            }
                        });

                    }

                }

            } else {


                DataProvider dpa = (field.isAnnotationPresent(DataProvider.class)) ? field.getAnnotation(DataProvider.class) : null;

                boolean seleccion = false;

                if (Set.class.isAssignableFrom(field.getType())) seleccion = true;
                else if (dpa == null) {

                    Method mdp = ReflectionHelper.getMethod(field.getDeclaringClass(), ReflectionHelper.getGetter(field.getName()) + "DataProvider");

                    seleccion = mdp != null;

                } else seleccion = true;


                if (seleccion) { // queremos seleccionar valores de entre una lista

                    g.addStyleName("unclickable");

                    if (MDDUIAccessor.getPendingSelection() != null) {
                        g.setDataProvider(new ListDataProvider(MDDUIAccessor.getPendingSelection()));
                        MDDUIAccessor.setPendingSelection(null);
                    } else {

                        if (dpa != null) {
                            try {
                                g.setDataProvider((com.vaadin.data.provider.DataProvider) ReflectionHelper.newInstance(dpa.dataProvider()));
                            } catch (Exception e) {
                                Notifier.alert(e);
                            }
                        } else if (Set.class.isAssignableFrom(field.getType())) {

                            // estamos seleccionando valores que no hayan sido añadidos
                            try {
                                com.vaadin.data.provider.DataProvider dp = null;
                                FieldInterfaced mbf = ReflectionHelper.getMapper(field);
                                if (mbf != null && mbf.isAnnotationPresent(ManyToOne.class)) {
                                    dp = new JPQLListDataProvider("select x from " + targetClass.getName() + " x where x." + mbf.getName() + " = null order by x." + ReflectionHelper.getIdField(targetClass).getName() + " asc");
                                } else {
                                    dp = new JPQLListDataProvider(targetClass);
                                }
                                g.setDataProvider(dp);
                            } catch (Throwable throwable) {
                                Notifier.alert(throwable);
                            }

                        } else {
                            JPAManyToOneFieldBuilder.setDataProvider(g, field, binder);
                        }

                    }

                    bindSelection(binder, g, field);

                } else {

                    bind(binder, g, field, targetClass, null);

                    {

                        g.addItemClickListener(e -> {
                            //if (MDDUIAccessor.isMobile() || e.getMouseEventDetails().isDoubleClick()) {
                            Object i = e.getItem();
                            if (i != null) {
                                MDDUIAccessor.go(field.getName());
                            }
                            //}
                        });

                        hl.addComponent(b = new Button(VaadinIcons.PLUS));
                        b.addStyleName(ValoTheme.BUTTON_QUIET);
                        b.addStyleName(ValoTheme.BUTTON_TINY);
                        b.addClickListener(e -> MDDUIAccessor.go(field.getName()));

                        hl.addComponent(b = new Button(VaadinIcons.MINUS));
                        b.addStyleName(ValoTheme.BUTTON_QUIET);
                        b.addStyleName(ValoTheme.BUTTON_TINY);
                        b.addClickListener(e -> {
                            try {
                                Object bean = binder.getBean();
                                Set l = g.getSelectedItems();

                                ReflectionHelper.setValue(field, bean, ReflectionHelper.removeAll((Collection) ReflectionHelper.getValue(field, bean), l));

                                binder.setBean(bean, false);

                            } catch (Throwable throwable) {
                                Notifier.alert(throwable);
                            }
                        });

                    }

                }

            }

            if (hl.getComponentCount() > 0) {

                VerticalLayout vl;
                addComponent(container, vl = new VerticalLayout(g, hl), attachedActions.get(field.getName()));
                vl.addStyleName(CSS.NOPADDING);
                vl.addStyleName("contenedorbotoneracampo");
                vl.addStyleName("conbotonera");

                if (allFieldContainers != null) allFieldContainers.put(field, vl);

            } else {

                addComponent(container, g, attachedActions.get(field.getName()));

                if (allFieldContainers != null) allFieldContainers.put(field, g);


            }

        }

        return r;
    }

    private static void editar(MDDBinder binder, FieldInterfaced field, Object i, int indice) {
        String state = MateuUI.get().getStack().getState(MateuUI.get().getStack().getLast());
        if (!state.endsWith("/")) state += "/";
        state += field.getName();

        try {
            //todo: ver como resolvemso esto de una manera más elegante
            MDDUIAccessor.setPendingResult(indice);
            MDDUIAccessor.goTo(state);
        } catch (Exception e1) {
            e1.printStackTrace();

        }
    }


    //set
    public static void bindSet(MDDBinder binder, Label l, FieldInterfaced field) {

        Binder.BindingBuilder aux = binder.forField(new HasValue() {

            Object v;

            @Override
            public void setValue(Object o) {

                v = o;


                try {

                    Collection elems = (Collection) o;

                    String s = "";

                    if (o == null || elems.size() == 0) s = "No item";
                    else {
                        for (Object x : elems) {
                            if (!"".equalsIgnoreCase(s)) s += ", ";
                            s += x;
                        }
                    }

                    l.setValue(s);

                } catch (Throwable e) {
                    Notifier.alert(e);
                }
            }

            @Override
            public Object getValue() {
                return v;
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

    //usetable
    public static void bind(MDDBinder binder, Label l, FieldInterfaced field) {

        Binder.BindingBuilder aux = binder.forField(new HasValue() {

            Object v;

            @Override
            public void setValue(Object o) {

                v = o;


                try {

                        Collection elems = (Collection) o;

                        StringWriter sw;
                        PrintWriter pw = new PrintWriter(sw = new StringWriter());

                        String colsFilter = "";
                        if (field.isAnnotationPresent(UseTable.class)) colsFilter = field.getAnnotation(UseTable.class).fields();

                        List<FieldInterfaced> cols = getColumnFields(field, colsFilter);

                        pw.println("<table class='onetomanytable'>");
                        pw.println("<thead><tr>");
                        cols.forEach(col -> pw.println("<th>" + Helper.capitalize(col.getName()) + "</th>"));
                        pw.println("</tr></thead>");
                        pw.println("<tbody>");
                        if (o == null || ((Collection)o).size() == 0) {
                            pw.println("<tr><td colspan='" + cols.size() + "'>----- Empty list -----</td></tr>");
                        } else {
                            for (Object e : elems) {
                                pw.println("<tr>");
                                for (FieldInterfaced col : cols) {
                                    boolean num = false;
                                    if (int.class.equals(col.getType()) || Integer.class.equals(col.getType())) {
                                        num = true;
                                    } else if (long.class.equals(col.getType()) || Long.class.equals(col.getType())) {
                                        num = true;
                                    } else if (double.class.equals(col.getType()) || Double.class.equals(col.getType())) {
                                        num = true;
                                    }
                                    Object v = ReflectionHelper.getValue(col, e);
                                    if (v != null) {
                                        if (col.isAnnotationPresent(WeekDays.class)) {
                                            boolean[] wds = (boolean[]) v;
                                            String s = "";
                                            for (int i = 0; i < wds.length; i++) s += wds[i]?"|":"-";
                                            v = s;
                                        }
                                    }
                                    pw.println("<td " + (num?" class= 'numeric'":"") + ">" + (v != null?v:"---") + "</td>");
                                }
                                pw.println("</tr>");
                            };
                        }
                        pw.println("</tbody>");
                        pw.println("<tfoot><tr>");
                        cols.forEach(col -> {
                            boolean num = false;
                            String s = "";
                            if (int.class.equals(col.getType()) || Integer.class.equals(col.getType())) {
                                int t = 0;
                                if (elems != null) for (Object elem : elems) {
                                    try {
                                        Object w = ReflectionHelper.getValue(col, elem);
                                        t += (Integer) w;
                                    } catch (NoSuchMethodException e) {
                                        e.printStackTrace();
                                    } catch (IllegalAccessException e) {
                                        e.printStackTrace();
                                    } catch (InvocationTargetException e) {
                                        e.printStackTrace();
                                    }
                                }
                                s += t;
                                num = true;
                            } else if (long.class.equals(col.getType()) || Long.class.equals(col.getType())) {
                                long t = 0;
                                if (elems != null) for (Object elem : elems) {
                                    try {
                                        Object w = ReflectionHelper.getValue(col, elem);
                                        t += (Long) w;
                                    } catch (NoSuchMethodException e) {
                                        e.printStackTrace();
                                    } catch (IllegalAccessException e) {
                                        e.printStackTrace();
                                    } catch (InvocationTargetException e) {
                                        e.printStackTrace();
                                    }
                                }
                                s += t;
                                num = true;
                            } else if (double.class.equals(col.getType()) || Double.class.equals(col.getType())) {
                                double t = 0;
                                if (elems != null) for (Object elem : elems) {
                                    try {
                                        Object w = ReflectionHelper.getValue(col, elem);
                                        if (w != null) t += (Double) w;
                                    } catch (NoSuchMethodException e) {
                                        e.printStackTrace();
                                    } catch (IllegalAccessException e) {
                                        e.printStackTrace();
                                    } catch (InvocationTargetException e) {
                                        e.printStackTrace();
                                    }
                                }
                                if (col.isAnnotationPresent(Money.class)) {
                                    DecimalFormat df = new DecimalFormat("##,###,###,###,##0.00");
                                    s = df.format(t);
                                } else {
                                    s += t;
                                }
                                num = true;
                            }
                            pw.println("<th " + (num?" class= 'numeric'":"") + ">" + s + "</th>");
                        });
                        pw.println("</tr></tfoot>");
                        pw.println("</table>");

                        l.setValue(sw.toString());

                    } catch (Throwable e) {
                    Notifier.alert(e);
                    }
            }

            @Override
            public Object getValue() {
                return v;
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
            } else if (LocalTime.class.equals(f.getType()) || LocalTime.class.equals(f.getType())) {
                editable = true;
            } else if (f.getType().isEnum()) {
                editable = true;
            } else if (f.isAnnotationPresent(ManyToOne.class)) {
                editable = !IResource.class.isAssignableFrom(f.getType());
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

    private Component buildMap(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, boolean owned, Map<String, List<AbstractAction>> attachedActions) {
        Class keyType = ReflectionHelper.getGenericClass(field, Map.class, "K");
        Class valueType = ReflectionHelper.getGenericClass(field, Map.class, "V");

        Grid g = new Grid();
        g.addStyleName("gridonetomany");
        g.addStyleName("nooutput");
        g.addStyleName("test-" + field.getId() + "-grid");

        ListViewComponent.buildColumns(g, getColumnFields(field), false, false);

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
        vl.addStyleName("test-" + field.getId());

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
            AbstractFieldBuilder b = (AbstractFieldBuilder) MDDUIAccessor.getFieldBuilder(f);
            if (b != null) b.build(fieldGroup, fieldGroupHeader, f, m, finalHl, auxbinder, null, null, null, false, attachedActions);
        });

        vl.addComponent(lx);

        HorizontalLayout hl = new HorizontalLayout();
        Button b;

        g.setHeightMode(HeightMode.UNDEFINED);

        g.addItemClickListener(e -> {
            MapEntry value = (MapEntry) e.getItem();
            try {
                Map<String, Object> aux = (Map<String, Object>) auxbinder.getBean();
                aux.put("key", value.getKey());
                aux.put("value", value.getValue());
                auxbinder.update(aux);
            } catch (Exception ex) {
                Notifier.alert(ex);
            }
        });

        hl.addComponent(b = new Button("Put", VaadinIcons.PLUS));
        b.addStyleName("test-" + field.getId() + "-put");
        b.addStyleName(ValoTheme.BUTTON_QUIET);
        b.addStyleName(ValoTheme.BUTTON_TINY);
        b.addClickListener(e -> {

            Object bean = binder.getBean();

            Map<String, Object> aux = (Map<String, Object>) auxbinder.getBean();
            Object k = aux.get("key");
            Object v = aux.get("value");

            try {

                if (k != null) {
                    ReflectionHelper.addToMap(field, bean, k, v);

                    binder.setBean(bean, false);
                }

            } catch (Exception e1) {
                Notifier.alert(e1);
            }


        });

        hl.addComponent(b = new Button("Remove selected lines", VaadinIcons.MINUS));
        b.addStyleName(ValoTheme.BUTTON_QUIET);
        b.addStyleName(ValoTheme.BUTTON_TINY);
        b.addStyleName("test-" + field.getId() + "-remove");
        b.addClickListener(e -> {


            try {
                Object bean = binder.getBean();
                Set l = g.getSelectedItems();

                ReflectionHelper.removeFromMap(field, bean, l);

                binder.setBean(bean, false);
            } catch (Exception e1) {
                Notifier.alert(e1);
            }

        });

        vl.addComponent(hl);

        container.addComponent(vl);

        addErrorHandler(field, g);

        if (allFieldContainers != null) allFieldContainers.put(field, vl);

        return g;
    }

    private void bind(MDDBinder binder, CheckBoxGroup g, FieldInterfaced field) {
         Binder.BindingBuilder aux = binder.forField(new HasValue() {


            private List<HasValue.ValueChangeListener> listeners = new ArrayList<>();

            @Override
            public void setValue(Object o) {
                Set items = null;
                if (o == null) {
                    items = new HashSet();
                } else {

                    if (o instanceof Set) {
                        items = (Set) o;
                    } else if (o instanceof List) {
                        items = new HashSet(((List)o));
                    }
                }
                try {
                    ReflectionHelper.setValue(field, binder.getBean(), items);
                } catch (Exception e) {
                    Notifier.alert(e);
                }
                g.setValue(items);
                //listeners.forEach(l -> l.valueChange(new ValueChangeEvent(g, null, true)));
            }

            @Override
            public Object getValue() {
                return g.getValue() != null?new HashSet<>(g.getValue()):null;
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
        });
        aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
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

        if (Map.class.isAssignableFrom(field.getType())) {
            aux.withConverter(new Converter() {
                @Override
                public Result convertToModel(Object o, ValueContext valueContext) {
                    Map m = new HashMap();
                    if (o != null) {
                        ((Collection)o).forEach(e -> m.put(((MapEntry)e).getKey(), ((MapEntry)e).getValue()));
                    }

                    return Result.ok((o != null)?m:null);
                }

                @Override
                public Object convertToPresentation(Object o, ValueContext valueContext) {
                    return (o != null)?toList((Map) o):null;
                }
            });

        }

        aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
    }

    private void updateReferences(MDDBinder binder, FieldInterfaced field, HasValue.ValueChangeEvent<Set<Object>> e) {
        Object bean = binder.getBean();
    }

    private Object toId(Object row) {
        return ReflectionHelper.getId(row);
    }


    public static List<FieldInterfaced> getColumnFields(FieldInterfaced field, String filter) {
        List<FieldInterfaced> l;
        if (Strings.isNullOrEmpty(filter)) {
            l = getColumnFields(field);
        } else {
            l = new ArrayList<>();
            List<FieldInterfaced> aux = ReflectionHelper.getAllFields(field.getGenericClass());
            String limpio = "";
            for (String s : filter.split(",")) {
                String n = s.trim();
                if (n.contains("(")) n = n.substring(0, n.indexOf("("));
                if (n.contains(" ")) n = n.substring(0, n.indexOf(" "));
                if (!"".equals(limpio)) limpio += ",";
                limpio += n;
            }
            List<String> fns = Arrays.asList(limpio.replaceAll(" ", "").split(","));
            for (String fn : fns) {
                if (fn.contains(".")) {
                    l.add(new FieldInterfacedFromPath(field.getGenericClass(), fn));
                } else {
                    List<FieldInterfaced> finalL = l;
                    aux.stream().filter(f -> fn.equals(f.getName())).findFirst().ifPresent(f -> finalL.add(f));
                }
            }
        }
        return l;
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

        l = ListViewComponent.getColumnFields(rowType, true, field.isAnnotationPresent(FieldsFilter.class)?field.getAnnotation(FieldsFilter.class).value():null, new ArrayList<>(), new HashMap<>());

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
            fns = fns.stream().map(s -> s.trim()).collect(Collectors.toList());

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

/*
    private void bind(MDDBinder binder, CheckBoxGroup cbg, FieldInterfaced field) {
        Binder.BindingBuilder aux = binder.forField(cbg);
        aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
    }
*/

    private void bindSelection(MDDBinder binder, Grid g, FieldInterfaced field) {
        HasValue hv;
        Binder.BindingBuilder aux = binder.forField(hv = new HasValue() {

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
        Binder.Binding b = aux.bind(field.getName());

        hv.addValueChangeListener(e -> updateReferences(binder, field, e));

        if (Set.class.isAssignableFrom(field.getType())) {
            try {
                ReflectionHelper.setValue(field, binder.getBean(), new HashSet<>());
            } catch (Exception e) {
                Notifier.alert(e);
            }
        }
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
        completeBinding(aux, binder, field);
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
                Object bean = binder.getBean();
                ReflectionHelper.setValue(field, bean, ReflectionHelper.removeAll((Collection) ReflectionHelper.getValue(field, bean), Sets.newHashSet(x)));
                binder.setBean(bean, false);
            } catch (Throwable throwable) {
                Notifier.alert(throwable);
            }
        });

        return hl;
    }

    private void bindResourcesList(MDDBinder binder, Layout l, FieldInterfaced field) {
        Binder.BindingBuilder aux = binder.forField(new HasValue() {
            private Object v;

            @Override
            public void setValue(Object o) {
                v = o;

                l.removeAllComponents();

                if (o == null || ((Collection)o).size() == 0) {
                    Label label;
                    l.addComponent(label = new Label(VaadinIcons.PLUS.getHtml()));
                    label.setContentMode(ContentMode.HTML);
                    label.addStyleName("fileicon");
                }
                else {
                    try {

                        for (Object i : (Collection)o) {
                            IResource file = (IResource) i;
                            boolean empty = true;
                            if (file != null && file.getName () != null) {
                                String u = file.toFileLocator().getUrl();
                                if (!Strings.isNullOrEmpty(u)) {
                                    if (file.getName().toLowerCase().endsWith(".jpg")
                                            || file.getName().toLowerCase().endsWith(".jpeg")
                                            || file.getName().toLowerCase().endsWith(".gif")
                                            || file.getName().toLowerCase().endsWith(".png")
                                            || file.getName().toLowerCase().endsWith(".svg")
                                            || file.getName().toLowerCase().endsWith(".webp")) {
                                        Image image = new Image();
                                        image.setWidth("130px");
                                        image.setSource(!Strings.isNullOrEmpty(u)?new ExternalResource(u):new ClassResource("/images/noimage.png"));
                                        l.addComponent(image);
                                    } else {
                                        Label label;
                                        l.addComponent(label = new Label(VaadinIcons.FILE.getHtml()));
                                        label.setContentMode(ContentMode.HTML);
                                        label.addStyleName("fileicon");
                                    }
                                    empty = false;
                                }
                            }
                            if (empty) {
                                Image image = new Image();
                                image.setWidth("130px");
                                image.setSource(new ClassResource("/images/noimage.png"));
                                l.addComponent(image);
                            }
                        }

                    } catch (Exception e) {
                        Notifier.alert(e);
                    }
                }
            }

            @Override
            public Object getValue() {
                return v;
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
        completeBinding(aux, binder, field);
    }


    static void bind(MDDBinder binder, CssLayout l, FieldInterfaced field, Method htmlGetter) {
        bind(binder, l, field, htmlGetter, false);
    }

    static void bind(MDDBinder binder, CssLayout l, FieldInterfaced field, Method htmlGetter, boolean output) {
        Binder.BindingBuilder aux = binder.forField(new HasValue() {
            private Object v;

            @Override
            public void setValue(Object o) {
                v = o;

                l.removeAllComponents();

                if (o == null || ((Collection)o).size() == 0) {
                    HorizontalLayout clickable;
                    l.addComponent(clickable = new HorizontalLayout(new Label("Empty list")));
                    clickable.addStyleName(CSS.NOPADDING);
                    if (!output) {
                        clickable.addStyleName(CSS.CLICKABLE);
                        clickable.addLayoutClickListener(e -> {
                            //if (e.isDoubleClick())
                            MDDUIAccessor.go(field.getName());
                        });
                    }
                } else {
                    int pos = 0;
                    for (Object i : ((Collection) o)) {
                        HorizontalLayout clickable;
                        Label lab;
                        l.addComponent(clickable = new HorizontalLayout(lab = new Label(((Card)i).toHtml(), ContentMode.HTML)));
                        clickable.addStyleName("carditem");
                        if (!output) {
                            clickable.addStyleName(CSS.CLICKABLE);
                            int finalPos = pos;
                            clickable.addLayoutClickListener(e -> {
                                //if (e.isDoubleClick()) {
                                if (i != null) {
                                    editar(binder, field, i, finalPos);
                                }
                                //}
                            });

                            if (ReflectionHelper.puedeOrdenar(field)) {

                                DragSourceExtension<HorizontalLayout> dragSource = new DragSourceExtension<>(clickable);

                                // set the allowed effect
                                dragSource.setEffectAllowed(EffectAllowed.MOVE);
                                // set the text to transfer
                                dragSource.setDataTransferText("hello receiver");
                                // set other data to transfer (in this case HTML)
                                dragSource.setDataTransferData("text/html", "<label>hello receiver</label>");

                                dragSource.addDragStartListener(event ->
                                        dragSource.setDragData(i)
                                );
                                dragSource.addDragEndListener(event ->
                                        dragSource.setDragData(null)
                                );





                                clickable.setPrimaryStyleName("zonadrop");

                                // make the layout accept drops
                                DropTargetExtension<HorizontalLayout> dropTarget = new DropTargetExtension<>(clickable);

                                // the drop effect must match the allowed effect in the drag source for a successful drop
                                dropTarget.setDropEffect(DropEffect.MOVE);

                                // catch the drops
                                dropTarget.addDropListener(event -> {
                                    // if the drag source is in the same UI as the target
                                    Optional<AbstractComponent> dragSourcex = event.getDragSourceComponent();
                                    if (dragSourcex.isPresent() && dragSourcex.get() instanceof HorizontalLayout) {

                                        /*
                                        // move the label to the layout
                                        clickable.addComponent(dragSourcex.get());

                                        // get possible transfer data
                                        String message = event.getDataTransferData("text/html");
                                        if (message != null) {
                                            Notification.show("DropEvent with data transfer html: " + message);
                                        } else {
                                            // get transfer text
                                            message = event.getDataTransferText();
                                            Notification.show("DropEvent with data transfer text: " + message);
                                        }
                                         */

                                        // handle possible server side drag data, if the drag source was in the same UI
                                        event.getDragData().ifPresent(data -> {
                                            log.info("recibido: " + data);
                                            if (!i.equals(data)) {
                                                Object bean = binder.getBean();
                                                try {
                                                    List l = new ArrayList((Collection) ReflectionHelper.getValue(field, bean));
                                                    l.remove(data);
                                                    l.add(l.indexOf(i), data);
                                                    ReflectionHelper.setValue(field, bean, l);
                                                    binder.update(bean);
                                                } catch (Exception e) {
                                                    Notifier.alert(e);
                                                }
                                            }
                                        });
                                    }
                                });

                            }

                        }
                        pos++;
                    }
                    if (!output && ReflectionHelper.puedeOrdenar(field)) {
                        HorizontalLayout clickable;
                        Label lab;
                        l.addComponent(clickable = new HorizontalLayout(lab = new Label("<div style='width: 30px; height: 50px;'></div>", ContentMode.HTML)));
                        clickable.setPrimaryStyleName("zonadrop");

                        // make the layout accept drops
                        DropTargetExtension<HorizontalLayout> dropTarget = new DropTargetExtension<>(clickable);

                        // the drop effect must match the allowed effect in the drag source for a successful drop
                        dropTarget.setDropEffect(DropEffect.MOVE);

                        // catch the drops
                        dropTarget.addDropListener(event -> {
                            // if the drag source is in the same UI as the target
                            Optional<AbstractComponent> dragSourcex = event.getDragSourceComponent();
                            if (dragSourcex.isPresent() && dragSourcex.get() instanceof HorizontalLayout) {
                                // handle possible server side drag data, if the drag source was in the same UI
                                event.getDragData().ifPresent(data -> {
                                    log.info("recibido: " + data);
                                    Object bean = binder.getBean();
                                    try {
                                        List l = new ArrayList((Collection) ReflectionHelper.getValue(field, bean));
                                        l.remove(data);
                                        l.add(data);
                                        ReflectionHelper.setValue(field, bean, l);
                                        binder.update(bean);
                                    } catch (Exception e) {
                                        Notifier.alert(e);
                                    }
                                });
                            }
                        });
                    }

                }
            }

            @Override
            public Object getValue() {
                return v;
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
        completeBinding(aux, binder, field);
    }


    static void bind(MDDBinder binder, Label l, FieldInterfaced field, Method htmlGetter) {
        Binder.BindingBuilder aux = binder.forField(new HasValue() {
            private Object v;

            @Override
            public void setValue(Object o) {
                v = o;

                if (o == null || ((Collection)o).size() == 0) l.setValue("Empty list");
                else {
                    try {
                        l.setValue(htmlGetter != null? (String) htmlGetter.invoke(binder.getBean()) :"" + ((Collection)o).size() + " items");
                    } catch (Exception e) {
                        Notifier.alert(e);
                    }
                }
            }

            @Override
            public Object getValue() {
                return v;
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
        completeBinding(aux, binder, field);
    }

    public static void bind(MDDBinder binder, Grid g, FieldInterfaced field, Class targetClass, List<FieldInterfaced> originalEditableFields) {
        bind(binder, g, field, targetClass, originalEditableFields, null);
    }

    public static void bind(MDDBinder binder, Grid g, FieldInterfaced field, Class targetClass, List<FieldInterfaced> originalEditableFields, Object owner) {

        if (ProxyClass.class.isAssignableFrom(targetClass)) {

            HasValue hv = new HasValue() {
                private Object v;

                @Override
                public void setValue(Object o) {
                    v = o;

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
                                            Notifier.alert(e);
                                        }
                                    } else {
                                        Notifier.alert("Missing " + vmn + " method at " + field.getDeclaringClass().getName());
                                    }


                                    int pos = 0;
                                    if (possibleValues != null) {
                                        Map l = valoresPosiblesPorCampo.get(f.getName());
                                        if (l == null) valoresPosiblesPorCampo.put(f.getName(), l = new HashMap());
                                        for (Object v : possibleValues)
                                            if (v != null) {
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
                        ((ArrayList) items).add(((ProxyClass) o).toObject());
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
            };

            completeBinding(hv, binder, field);

        } else {

            HasValue hv = new HasValue() {
                private Object v;

                @Override
                public void setValue(Object o) {
                    v = o;
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
            };

            completeBinding(hv, binder, field);
        }

    }

    private static List<MapEntry> toList(Map m) {
        List<MapEntry> l = new ArrayList<>();
        if (m != null) m.entrySet().forEach(e -> l.add(new MapEntry(((Map.Entry)e).getKey(), ((Map.Entry)e).getValue())));
        return (m != null)?l:null;
    }

    protected void bind(MDDBinder binder, TwinColSelect<Object> tf, FieldInterfaced field) {
        Binder.BindingBuilder aux = binder.forField(tf).withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        completeBinding(aux, binder, field);
    }


}
