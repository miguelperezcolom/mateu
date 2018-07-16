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
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.PMO;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.data.MDDBinder;
import javafx.scene.input.KeyCode;
import javafx.util.Pair;

import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class EditorViewComponent extends AbstractViewComponent {

    private Map<HasValue, List<Validator>> validators = new HashMap<>();

    protected boolean newRecord;
    private Object model;
    private final Class modelType;

    private MDDBinder binder;

    private AbstractStylist stylist;

    public List<Object> getMergeables() {
        return binder.getMergeables();
    }

    public EditorViewComponent(Class modelType) {

        this.modelType = modelType;
        try {
            this.model = modelType.newInstance();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }

        setViewTitle(modelType.getSimpleName());
    }


    public EditorViewComponent(Object model) {
        this.modelType = model.getClass();
        this.model = model;
    }

    public Object getModel() {
        return model;
    }

    public void setModel(Object model) {
        this.model = model;
        binder.setBean(model);
        setViewTitle(stylist.getViewTitle(newRecord, model));
    }

    public Class getModelType() {
        return modelType;
    }

    @Override
    public EditorViewComponent build() throws IllegalAccessException, InstantiationException {

        super.build();

        addStyleName("editorviewcomponent");


        binder = new MDDBinder(modelType);
        //binder = new Binder(modelType, true);

        Pair<Component, AbstractStylist> r = FormLayoutBuilder.build(binder, modelType, model, validators, getAllFields());

        stylist = r.getValue();
        addComponent(r.getKey());

        return this;
    }

    private List<FieldInterfaced> getAllFields() {
        List<FieldInterfaced> allFields = ReflectionHelper.getAllFields(modelType);

        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Ignored.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))
        ).collect(Collectors.toList());

        return allFields;
    }

    @Override
    public void addViewActionsMenuItems(MenuBar bar) {

        super.addViewActionsMenuItems(bar);

        if (modelType.isAnnotationPresent(Entity.class) || PMO.class.isAssignableFrom(modelType)) {
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

                        if (binder.allValid()) {

                            save();

                            MyUI.get().getNavegador().goBack();

                        } else Notification.show("There are errors", Notification.Type.ERROR_MESSAGE);


                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
                    }
                }
            });

            Button b;
            addComponent(b = new Button());
            b.addStyleName("hidden");
            b.addClickListener(e -> cmd.menuSelected(i));
            b.setClickShortcut(ShortcutAction.KeyCode.ENTER);
        }

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

        for (Method m : ReflectionHelper.getAllMethods(modelType)) {
            if (!Modifier.isStatic(m.getModifiers()) && m.isAnnotationPresent(Action.class)) {
                Action aa = m.getAnnotation(Action.class);
                l.add(ViewComponentHelper.createAction(m, this));
            }
        }

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



    public void save() throws Throwable {
        if (modelType.isAnnotationPresent(Entity.class)) {

            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {
                    for (Object o : getMergeables()) em.merge(o);
                    Object m = getModel();
                    setModel(em.merge(m));
                }
            });

            // cambiamos la url, para reflejar el cambio
            MyUI.get().getNavegador().goTo(ReflectionHelper.getId(model));

        } else if (PMO.class.isAssignableFrom(modelType)) {

            PMO pmo = (PMO) getModel();

            pmo.save();

            // cambiamos la url, para reflejar el cambio
            MyUI.get().getNavegador().goTo(pmo.getId());

        }
    }

    public void load(Object id) throws Throwable {
        if (id == null) {
            newRecord = true;
            setModel(modelType.newInstance());
        } else {
            newRecord = false;

            if (modelType.isAnnotationPresent(Entity.class)) {

                Helper.notransact(new JPATransaction() {
                    @Override
                    public void run(EntityManager em) throws Throwable {
                        setModel(em.find(modelType, id));
                    }
                });

            } else if (PMO.class.isAssignableFrom(modelType)) {
                PMO pmo = (PMO) modelType.newInstance();

                pmo.load(id);

                setModel(pmo);
            } else {
                setModel(modelType.newInstance());
            }

        }

    }
}
