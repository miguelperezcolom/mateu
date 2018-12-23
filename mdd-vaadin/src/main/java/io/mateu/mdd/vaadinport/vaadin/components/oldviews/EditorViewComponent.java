package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.data.Binder;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.KPI;
import io.mateu.mdd.core.annotations.NotWhenCreating;
import io.mateu.mdd.core.annotations.NotWhenEditing;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.Pair;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.PersistentPOJO;
import io.mateu.mdd.core.model.authentication.Audit;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.ClassOption;
import io.mateu.mdd.vaadinport.vaadin.components.app.AbstractMDDExecutionContext;
import io.mateu.mdd.vaadinport.vaadin.util.VaadinHelper;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.reflection.ReflectionHelper;

import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.*;

public class EditorViewComponent extends AbstractViewComponent implements IEditorViewComponent {

    private final boolean createSaveButton;
    private final List<FieldInterfaced> visibleFields;
    private final List<FieldInterfaced> hiddenFields;
    private Object owner = null;
    private FieldInterfaced field = null;
    private Map<HasValue, List<Validator>> validators = new HashMap<>();

    protected boolean newRecord;
    private Class modelType;

    private MDDBinder binder;

    private AbstractStylist stylist;
    private Panel panel;

    private List<EditorListener> listeners = new ArrayList<>();
    private boolean modificado;
    private Layout kpisContainer;
    private List<String> shortcutsCreated = new ArrayList<>();
    private Object modelId;

    private Map<Method, Optional<Method>> mvs = new HashMap<>();

    public boolean isModificado() {
        return modificado;
    }

    public boolean isNewRecord() {
        return newRecord;
    }

    public void setModelType(Class modelType) {
        this.modelType = modelType;
    }

    public void addEditorListener(EditorListener listener) {
        listeners.add(listener);
    }


    public MDDBinder getBinder() {
        return binder;
    }

    public List<Object> getMergeables() {
        return binder.getMergeables();
    }

    public List<Object> getRemovables() {
        return binder.getRemovables();
    }

    public EditorViewComponent(Class modelType) {
        this(modelType, true);
    }

    public EditorViewComponent(Object owner, FieldInterfaced field, Class modelType, List<FieldInterfaced> visibleFields, List<FieldInterfaced> hiddenFields, boolean createSaveButton) {
        this.owner = owner;
        this.field = field;
        this.modelType = modelType;
        this.visibleFields = visibleFields;
        this.hiddenFields = hiddenFields;
        this.createSaveButton = createSaveButton;
    }

    public EditorViewComponent(Object owner, FieldInterfaced field, Class modelType, boolean createSaveButton) {
        this(owner, field, modelType, new ArrayList<>(), new ArrayList<>(), createSaveButton);
    }

    public EditorViewComponent(Class modelType, boolean createSaveButton) {
        this(null, null, modelType, createSaveButton);
    }

    public EditorViewComponent(Object model) {
        this(model, true);
    }

    public EditorViewComponent(Object model, List<FieldInterfaced> visibleFields, List<FieldInterfaced> hiddenFields) {
        this(model, visibleFields, hiddenFields, true);
    }

    public EditorViewComponent(Object model, boolean createSaveButton) {
        this(model, new ArrayList<>(), new ArrayList<>(), createSaveButton);
    }

    public EditorViewComponent(Object model, List<FieldInterfaced> visibleFields, List<FieldInterfaced> hiddenFields, boolean createSaveButton) {
        this.modelType = model.getClass();
        this.visibleFields = visibleFields;
        this.hiddenFields = hiddenFields;
        this.createSaveButton = createSaveButton;
        setModel(model);
    }

    public Object getModel() {
        return (binder != null)?binder.getBean():null;
    }

    public void setModel(Object model) {

        modelType = model.getClass();

        binder = new MDDBinder(model.getClass(), this);
        
        if (createSaveButton) {
            
            binder.addValueChangeListener(e -> {
                modificado = true;
            });

        }

        binder.setBean(model);

        build(model);

        for (Optional<Method> omv : mvs.values()) {
            if (omv.isPresent()) {

                Method mv = omv.get();

                if (mv.isAnnotationPresent(DependsOn.class)) {
                    String fns = mv.getAnnotation(DependsOn.class).value();

                    if (fns != null) {
                        for (String fn : fns.split(",")) {
                            fn = fn.trim();
                            getBinder().getBinding(fn).ifPresent(b -> ((Binder.Binding)b).getField().addValueChangeListener(e -> {

                                if (getBinder().getBean() != null) { // puede pasar que llamemos a este método cuando todavía no hayamos bindeado nada

                                    rebuildActions();

                                }

                            }));
                        }
                    }
                }


            }

        }


    }

    private void build(Object model) {

        long t0 = System.currentTimeMillis();

        MDDUI.get().getNavegador().getViewProvider().setCurrentEditor(this);

        try {
            if (panel == null) build();


            List<FieldInterfaced> kpis = ReflectionHelper.getKpiFields(model.getClass());
            if (kpis.size() > 0) {
                if (kpisContainer == null) {
                    kpisContainer = new CssLayout();
                    kpisContainer.addStyleName(CSS.NOPADDING);
                } else {
                    kpisContainer.removeAllComponents();
                }

                for (FieldInterfaced kpi : kpis) {

                    kpisContainer.addComponent(createKpi(binder, kpi));

                }

                addComponent(kpisContainer, getComponentIndex(panel));
            } else if (kpisContainer != null) {
                removeComponent(kpisContainer);
                kpisContainer = null;
            }


            List<FieldInterfaced> fields = ReflectionHelper.getAllEditableFields(model.getClass(), (owner != null) ? owner.getClass() : null, false, field);

            if (visibleFields != null && visibleFields.size() > 0) {
                fields.removeIf(f -> !visibleFields.contains(f));
            }

            if (hiddenFields != null && hiddenFields.size() > 0) {
                fields.removeIf(f -> hiddenFields.contains(f));
            }

            Pair<Component, AbstractStylist> r = FormLayoutBuilder.get().build(binder, model.getClass(), model, validators, fields);

            stylist = r.getValue();

            panel.setContent(r.getKey());


            AbstractStylist finalStylist = stylist;
            binder.addValueChangeListener(e -> {
                MDDUI.get().access(new Runnable() {
                    @Override
                    public void run() {
                        //rebuildActions();
                        binder.setBean(binder.getBean(), false); // para campos calculados
                    }
                });
            });

            if (getView() != null) getView().updateViewTitle(toString());


            focusFirstField(panel.getContent());

        } catch (Exception e) {
            MDD.alert(e);
        }

        rebuildActions();

        System.out.println("******* añadiendo listeners para lanzar acciones: actionsByMethod.size() = " + actionsByMethod.size());
        actionsByMethod.keySet().forEach(x -> {
            Method m = (Method) x;
            if (m.isAnnotationPresent(DependsOn.class)) {
                System.out.println("******* añadiendo listeners para lanzar acciones: m = " + m.getName());
                for (String fn : m.getAnnotation(DependsOn.class).value().split(",")) {
                    fn = fn.trim();
                    System.out.println("******* añadiendo listeners para lanzar acciones: fn = " + fn);
                    String finalFn = fn;
                    binder.getBinding(fn).ifPresent(b -> ((Binder.Binding)b).getField().addValueChangeListener(e -> {

                        System.out.println("******* lanzando acción para método " + m.getName() + "porque ha cambiado " + finalFn);

                        ((AbstractAction)actionsByMethod.get(m)).run(new AbstractMDDExecutionContext());

                        rebuildActions();

                    }));
                }
            }
        });

        System.out.println("editor component built in " + (System.currentTimeMillis() - t0) + " ms.");

    }

    private boolean focusFirstField(Component c) {
        if (c instanceof AbstractField) {
            if (c instanceof TextField) ((TextField)c).selectAll();
            ((AbstractField) c).focus();
            return true;
        } else if (c instanceof HasComponents) {
            HasComponents l = (HasComponents) c;
            for (Component ch : l) {
                if (focusFirstField(ch)) {
                    return true;
                }
            }
        }
        return false;
    }

    private Component createKpi(MDDBinder binder, FieldInterfaced kpi) {

        VerticalLayout vl = new VerticalLayout();
        vl.addStyleName("kpi");
        vl.setWidthUndefined();

        vl.addComponent(new Label(ReflectionHelper.getCaption(kpi)));

        Label l;
        vl.addComponent(l = new Label());
        l.addStyleName("valor");
        l.setContentMode(ContentMode.HTML);
        Binder.Binding binding = binder.forField(new HasValue() {

            Object v = null;

            @Override
            public void setValue(Object o) {
                v = o;
                String s = "";
                if (v == null) s = "";
                else {
                    if (v instanceof Boolean) {
                        if ((Boolean) v && !kpi.getAnnotation(KPI.class).reversed()) {
                            s = VaadinIcons.CHECK.getHtml();
                            l.addStyleName(ValoTheme.BUTTON_FRIENDLY);
                        } else {
                            s = VaadinIcons.CLOSE.getHtml();
                            l.addStyleName(ValoTheme.BUTTON_DANGER);
                        }
                        l.addStyleName("centered");
                    } else {
                        s = "" + v;
                    }
                }
                l.setValue(s);
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
        }).bind(kpi.getName());

        return vl;

    }

    public void updateModel(Object model) {
        binder.setBean(model, false);
    }

    @Override
    public String toString() {
        String t = (stylist != null)?stylist.getViewTitle(newRecord, getModel()):"Not yet";
        return t;
    }

    public Class getModelType() {
        return modelType;
    }

    @Override
    public EditorViewComponent build() throws IllegalAccessException, InstantiationException {

        super.build();

        addStyleName("editorviewcomponent");

        panel = new Panel();
        panel.addStyleName(ValoTheme.PANEL_BORDERLESS);
        addComponentsAndExpand(panel);


        return this;
    }

    private void updateActions() {
        if (stylist != null) {
            Object model = binder.getBean();

            for (String k : (Set<String>) menuItemsById.keySet()) {
                ((MenuBar.MenuItem)menuItemsById.get(k)).setEnabled(stylist.isActionEnabled(k, model));
            }
        }
    }


    @Override
    public void addViewActionsMenuItems(MenuBar bar) {

        if (modelType.isAnnotationPresent(Entity.class) || PersistentPOJO.class.isAssignableFrom(modelType)) {
            if (field == null && !isActionPresent("refresh")) {

                MenuBar.Command cmd;
                MenuBar.MenuItem i = bar.addItem("Refresh", VaadinIcons.REFRESH, cmd = new MenuBar.Command() {
                    @Override
                    public void menuSelected(MenuBar.MenuItem menuItem) {
                        try {

                            load(modelId);

                        } catch (Throwable throwable) {
                            MDD.alert(throwable);
                        }
                    }
                });
                //i.setStyleName(ValoTheme.butt);

                i.setDescription("Click Ctrl + R to refresh.");

                addMenuItem("refresh", i);


                if (!shortcutsCreated.contains("refresh")) {

                    Button b;
                    addComponent(b = new Button());
                    b.addStyleName("hidden");
                    b.addClickListener(e -> cmd.menuSelected(i));
                    b.setClickShortcut(ShortcutAction.KeyCode.R, ShortcutAction.ModifierKey.CTRL);

                    shortcutsCreated.add("refresh");
                }
            }
        }

        if (createSaveButton && (modelType.isAnnotationPresent(Entity.class) || PersistentPOJO.class.isAssignableFrom(modelType))) {
            if (!isActionPresent("save")) {

                MenuBar.Command cmd;
                MenuBar.MenuItem i = bar.addItem("Save", VaadinIcons.DOWNLOAD, cmd = new MenuBar.Command() {
                    @Override
                    public void menuSelected(MenuBar.MenuItem menuItem) {
                        try {

                            if (binder.validate().isOk()) {

                                preSave();

                                save();

                                MDDUI.get().getNavegador().goBack();

                            } else Notification.show("There are errors", Notification.Type.ERROR_MESSAGE);


                        } catch (Throwable throwable) {
                            MDD.alert(throwable);
                        }
                    }
                });
                i.setStyleName(ValoTheme.BUTTON_PRIMARY);

                i.setDescription("Click Ctrl + S to fire. Ctrl + Alt + S to duplicate.");

                addMenuItem("save", i);


                if (!shortcutsCreated.contains("save")) {

                    Button b;
                    addComponent(b = new Button());
                    b.addStyleName("hidden");
                    b.addClickListener(e -> cmd.menuSelected(i));
                    b.setClickShortcut(ShortcutAction.KeyCode.S, ShortcutAction.ModifierKey.CTRL);

                    addComponent(b = new Button());
                    b.addStyleName("hidden");
                    b.addClickListener(e -> {
                        if (binder.validate().isOk()) {

                            try {
                                save();

                                Object old = getBinder().getBean();

                                load(null);

                                Object current = getBinder().getBean();
                                for (FieldInterfaced f : ReflectionHelper.getAllEditableFields(old.getClass())) {
                                    if (f.isAnnotationPresent(Keep.class)) {
                                        ReflectionHelper.setValue(f, current, ReflectionHelper.getValue(f, old));
                                    }
                                }
                                getBinder().setBean(current, false);


                            } catch (Throwable throwable) {
                                throwable.printStackTrace();
                            }


                        } else Notification.show("There are errors", Notification.Type.ERROR_MESSAGE);

                    });
                    b.setClickShortcut(ShortcutAction.KeyCode.S, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);


                    shortcutsCreated.add("save");
                }
            }

        }

        super.addViewActionsMenuItems(bar);

    }

    public AbstractStylist getStylist() {
        return stylist;
    }

    public void setStylist(AbstractStylist stylist) {
        this.stylist = stylist;
    }


    @Override
    public List<AbstractAction> getActions() {
        List<AbstractAction> l = new ArrayList<>();

        Object bean = (binder != null)?binder.getBean():null;


        boolean isEditingNewRecord = MDDUI.get().isEditingNewRecord();


        List<Method> ms = new ArrayList<>();
        for (Method m : ReflectionHelper.getAllMethods(modelType)) {
            if (m.isAnnotationPresent(Action.class) && !(Modifier.isStatic(m.getModifiers())
                    || (m.isAnnotationPresent(NotWhenCreating.class) && isEditingNewRecord)
                    || (m.isAnnotationPresent(NotWhenEditing.class) && !isEditingNewRecord)
            )) {

                Optional<Method> omv = mvs.get(m);

                if (omv == null) {

                    Method mv = ReflectionHelper.getMethod(modelType, ReflectionHelper.getGetter(m.getName()).replaceFirst("get", "is") + "Visible");

                    omv = mv != null?Optional.of(mv):Optional.empty();

                    mvs.put(m, omv);
                }

                Method mv = null;
                if (omv.isPresent()) mv = omv.get();
                try {

                    if (mv == null || bean == null || (Boolean) mv.invoke(bean)) {
                        ms.add(m);
                    }

                } catch (Exception e) {
                    MDD.alert(e);
                }
            }
        }

        ms.sort((a, b) -> {
            return a.getAnnotation(Action.class).order() - b.getAnnotation(Action.class).order();
        });

        ms.forEach(m -> {
            AbstractAction a;
            l.add(a = ViewComponentHelper.createAction(m, this));
        });

        return l;
    }

    public Method getMethod(String methodName) {

        Method a = null;

        for (Method m : ReflectionHelper.getAllMethods(getModelType())) {
            if (!Modifier.isStatic(m.getModifiers()) && m.getName().equals(methodName)) {
                a = m;
                break;
            }
        }

        return a;

    }


    public FieldInterfaced getField(String fieldName) {

        FieldInterfaced a = null;

        for (FieldInterfaced m : ReflectionHelper.getAllFields(getModelType())) {
            if (m.getName().equals(fieldName)) {
                a = m;
                break;
            }
        }

        return a;
    }

    public void save() throws Throwable {
        save(true);
    }

    public void save(boolean goBack) throws Throwable {
        save(goBack, true);
    }

    public void preSave() throws Throwable {
        for (EditorListener l : listeners) l.preSave(getModel());
    }

    public void save(boolean goBack, boolean notify) throws Throwable {
        if (modelType.isAnnotationPresent(Entity.class)) {

            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {
                    for (Object o : getRemovables()) {
                        if (getMergeables().contains(o)) getMergeables().remove(o);

                        if (!em.contains(o)) {
                            o = em.merge(o);
                        }
                        if (em.contains(o)) {
                            em.remove(o);
                        }
                    }
                    for (Object o : getMergeables()) em.merge(o);
                    Object m = getModel();


                    auditar(em, m);

                    setModel(em.merge(m));
                }
            });

            //todo: ver que hacemos aquí. Volvemos y ya está?
            // cambiamos la url, para reflejar el cambio
            //if (goBack) MDDUI.get().getNavegador().goTo(ReflectionHelper.getId(getModel()));

        } else if (PersistentPOJO.class.isAssignableFrom(modelType)) {

            PersistentPOJO ppojo = (PersistentPOJO) getModel();

            ppojo.save();

        }

        modificado = false;

        if (notify) listeners.forEach(l -> l.onSave(getModel()));
    }

    private void auditar(EntityManager em, Object bean) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

        for (FieldInterfaced f : ReflectionHelper.getAllFields(bean.getClass())) if (Audit.class.equals(f.getType())) {
            Audit a = (Audit) ReflectionHelper.getValue(f, bean);
            if (a == null) {
                a = new Audit((MDD.getUserData() != null)?em.find(User.class, MDD.getUserData().getLogin()):null);
                ReflectionHelper.setValue(f, bean, a);
            } else {
                a.touch((MDD.getUserData() != null)?em.find(User.class, MDD.getUserData().getLogin()):null);
            }
        }

    }

    public void load(Object id, Object parent, FieldInterfaced field) throws Throwable {
        this.modelId = id;
        this.modificado = false;
        if (id == null) {
            newRecord = true;

            Set<Class> subClasses = ReflectionHelper.getSubclasses(modelType);

            if (subClasses.size() > 1) {

                Set<ClassOption> subClassesOptions = new LinkedHashSet<>();
                subClasses.forEach(c -> subClassesOptions.add(new ClassOption(c)));

                VaadinHelper.choose("Please choose type", subClassesOptions, c -> {
                    try {
                        setModel(newInstance(((ClassOption)c).get_class(), parent));
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                }, () -> MDDUI.get().getNavegador().goBack());
            } else if (subClasses.size() == 1) {
                setModel(newInstance(subClasses.iterator().next(), parent));
            } else {
                setModel(newInstance(modelType, parent));
            }

        } else {
            newRecord = false;

            if (modelType.isAnnotationPresent(Entity.class)) {

                Helper.notransact(new JPATransaction() {
                    @Override
                    public void run(EntityManager em) throws Throwable {
                        setModel(em.find(modelType, id));
                    }
                });

            } else if (PersistentPOJO.class.isAssignableFrom(modelType)) {
                PersistentPOJO ppojo = null;

                if (id != null && modelType.equals(id.getClass())) ppojo = (PersistentPOJO) id;
                else ppojo = (PersistentPOJO) modelType.newInstance();

                ppojo.load(id);


                if (parent != null) {
                    for (FieldInterfaced f : ReflectionHelper.getAllFields(ppojo.getClass())) if (f.getType().equals(parent.getClass()) && f.isAnnotationPresent(NotNull.class)) {
                        ReflectionHelper.setValue(f, ppojo, parent);
                        break;
                    }
                }

                setModel(ppojo);

            } else {

                if (parent != null) {
                    for (FieldInterfaced f : ReflectionHelper.getAllFields(id.getClass())) if (f.getType().equals(parent.getClass()) && f.isAnnotationPresent(NotNull.class)) {
                        ReflectionHelper.setValue(f, id, parent);
                        break;
                    }
                }


                setModel(id);
            }

        }

    }

    public static Object newInstance(Class c, Object parent) throws IllegalAccessException, InstantiationException, InvocationTargetException, NoSuchMethodException {
        Object i = c.newInstance();
        if (parent != null) {
            for (FieldInterfaced f : ReflectionHelper.getAllFields(c)) if (f.getType().equals(parent.getClass()) && f.isAnnotationPresent(NotNull.class)) {
                ReflectionHelper.setValue(f, i, parent);
                break;
            }
        }
        return i;
    }

    public void load(Object id) throws Throwable {
        load(id, null, null);
    }

    public void rebuildActions() {
        markAllAsUnseen();
        addViewActionsMenuItems(bar);
        removeUnseen();
        updateActions();
    }

    public void clear() {
        panel.setContent(null);
    }

    public void onGoBack() {
        for (EditorListener l : listeners) l.onGoBack(binder.getBean());
    }
}
