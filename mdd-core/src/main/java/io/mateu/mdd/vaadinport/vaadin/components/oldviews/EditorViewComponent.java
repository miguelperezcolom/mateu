package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.data.HasValue;
import com.vaadin.data.ValidationResult;
import com.vaadin.data.Validator;
import com.vaadin.data.ValueContext;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.ErrorMessage;
import com.vaadin.shared.ui.ErrorLevel;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.Pair;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.PersistentPOJO;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.ClassOption;
import io.mateu.mdd.vaadinport.vaadin.util.VaadinHelper;

import javax.persistence.Entity;
import javax.persistence.EntityManager;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.*;

public class EditorViewComponent extends AbstractViewComponent {

    private final boolean createSaveButton;
    private Map<HasValue, List<Validator>> validators = new HashMap<>();

    protected boolean newRecord;
    private Class modelType;

    private MDDBinder binder;

    private AbstractStylist stylist;
    private Panel panel;

    private List<EditorListener> listeners = new ArrayList<>();
    private boolean modificado;

    public boolean isModificado() {
        return modificado;
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

    public EditorViewComponent(Class modelType) {
        this(modelType, true);
    }

    public EditorViewComponent(Class modelType, boolean createSaveButton) {
        this.modelType = modelType;
        this.createSaveButton = createSaveButton;
    }

    public EditorViewComponent(Object model) {
        this(model, true);
    }

    public EditorViewComponent(Object model, boolean createSaveButton) {
        this.modelType = model.getClass();
        this.createSaveButton = createSaveButton;
        setModel(model);
    }

    public Object getModel() {
        return (binder != null)?binder.getBean():null;
    }

    public void setModel(Object model) {

        binder = new MDDBinder(model.getClass());

        if (createSaveButton) {
            
            binder.addValueChangeListener(e -> {
                modificado = true;
            });

        }

        binder.setBean(model);

        build(model);
    }

    private void build(Object model) {

        try {
            if (panel == null) build();

            Pair<Component, AbstractStylist> r = FormLayoutBuilder.get().build(binder, model.getClass(), model, validators, ReflectionHelper.getAllEditableFields(model.getClass()), false);

            stylist = r.getValue();

            panel.setContent(r.getKey());

            AbstractStylist finalStylist = stylist;
            binder.addValueChangeListener(e -> {
                updateActions();
                binder.setBean(binder.getBean(), false); // para campos calculados
            });

            updateActions();

            if (getView() != null) getView().updateViewTitle(toString());


        } catch (Exception e) {
            MDD.alert(e);
        }

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
                Method m = ReflectionHelper.getMethod(stylist.getClass(), "is" + (k.substring(0, 1).toUpperCase() + k.substring(1)) + "Enabled");
                if (m != null) {
                    try {
                        ((MenuBar.MenuItem)menuItemsById.get(k)).setEnabled((Boolean) m.invoke(stylist, model));
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                }
            }
        }
    }


    @Override
    public void addViewActionsMenuItems(MenuBar bar) {

        if (createSaveButton && (modelType.isAnnotationPresent(Entity.class) || PersistentPOJO.class.isAssignableFrom(modelType))) {
            MenuBar.Command cmd;
            MenuBar.MenuItem i = bar.addItem("Save", VaadinIcons.DOWNLOAD, cmd = new MenuBar.Command() {
                @Override
                public void menuSelected(MenuBar.MenuItem menuItem) {
                    try {

                        //binder.writeBean(entities);

                        ValueContext vc = new ValueContext();
                        for (HasValue h : validators.keySet())
                            for (Validator v : validators.get(h)) {
                                ValidationResult r = v.apply(h.getValue(), vc);
                                if (h instanceof AbstractComponent) {
                                    AbstractComponent c = (AbstractComponent) h;
                                    if (r.isError()) {
                                        c.setComponentError(new ErrorMessage() {
                                            @Override
                                            public ErrorLevel getErrorLevel() {
                                                return r.getErrorLevel().get();
                                            }

                                            @Override
                                            public String getFormattedHtmlMessage() {
                                                return r.getErrorMessage();
                                            }
                                        });
                                    } else {
                                        c.setComponentError(null);
                                    }
                                }
                            }

                        if (binder.validate().isOk()) {

                            save();

                            MDDUI.get().getNavegador().goBack();

                        } else Notification.show("There are errors", Notification.Type.ERROR_MESSAGE);


                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
                    }
                }
            });
            i.setStyleName(ValoTheme.BUTTON_PRIMARY);

            i.setDescription("Click Ctrl + S to fire");
            Button b;
            addComponent(b = new Button());
            b.addStyleName("hidden");
            b.addClickListener(e -> cmd.menuSelected(i));
            b.setClickShortcut(ShortcutAction.KeyCode.S, ShortcutAction.ModifierKey.CTRL);
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

        List<Method> ms = new ArrayList<>();
        for (Method m : ReflectionHelper.getAllMethods(modelType)) {
            if (!Modifier.isStatic(m.getModifiers()) && m.isAnnotationPresent(Action.class)) {
                ms.add(m);
            }
        }

        ms.sort((a, b) -> {
            return a.getAnnotation(Action.class).order() - b.getAnnotation(Action.class).order();
        });

        ms.forEach(m -> l.add(ViewComponentHelper.createAction(m, this)));

        return l;
    }

    public Method getMethod(String methodName) {

        Method a = null;

        for (Method m : ReflectionHelper.getAllMethods(getModelType())) {
            if (m.getName().equals(methodName)) {
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
        if (modelType.isAnnotationPresent(Entity.class)) {

            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {
                    for (Object o : getMergeables()) em.merge(o);
                    Object m = getModel();
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

        listeners.forEach(l -> l.onSave(getModel()));
    }

    public void load(Object id) throws Throwable {
        if (id == null) {
            newRecord = true;

            Set<Class> subClasses = ReflectionHelper.getSubclasses(modelType);

            if (subClasses.size() > 1) {

                Set<ClassOption> subClassesOptions = new LinkedHashSet<>();
                subClasses.forEach(c -> subClassesOptions.add(new ClassOption(c)));

                VaadinHelper.choose("Please choose type", subClassesOptions, c -> {
                    try {
                        setModel(((ClassOption)c).get_class().newInstance());
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                }, () -> MDDUI.get().getNavegador().goBack());
            } else if (subClasses.size() == 1) {
                setModel(subClasses.iterator().next().newInstance());
            } else {
                setModel(modelType.newInstance());
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
                PersistentPOJO ppojo = (PersistentPOJO) modelType.newInstance();

                ppojo.load(id);

                setModel(ppojo);

            } else {
                setModel(modelType.newInstance());
            }

        }
    }

    public void clear() {
        panel.setContent(null);
    }

}
