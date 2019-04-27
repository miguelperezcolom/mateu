package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.data.*;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.ErrorMessage;
import com.vaadin.shared.ui.ErrorLevel;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.Pair;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.PersistentPOJO;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Version;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class MethodParametersViewComponent extends AbstractViewComponent implements IEditorViewComponent {

    private final Method method;
    private final Object bean;
    private final MDDExecutionContext context;
    private final MDDBinder parentBinder;
    private final Set pendingSelection;
    private Map<HasValue, List<Validator>> validators = new HashMap<>();

    private Map<String, Object> model = new HashMap<>();

    private MDDBinder binder;

    private AbstractStylist stylist;
    private Class parametersType;
    private Object paremetersModel;

    public List<Object> getMergeables() {
        return binder.getMergeables();
    }

    public MethodParametersViewComponent(MDDBinder parentBinder, Object bean, Method method, MDDExecutionContext context, Set pendingSelection) {

        this.parentBinder = parentBinder;
        this.context = context;
        this.bean = bean;
        this.method = method;
        this.pendingSelection = pendingSelection;

        //setViewTitle(stylist.getViewTitle(newRecord, entities));

        try {
            build();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public String toString() {
        String t = Helper.capitalize(method.getName());
        if (method.isAnnotationPresent(Action.class)) t = method.getAnnotation(Action.class).value();
        return t;
    }

    @Override
    public MethodParametersViewComponent build() throws Exception {

        long t0 = System.currentTimeMillis();

        super.build();

        addStyleName("editorviewcomponent");

        parametersType = ReflectionHelper.createClass("" + method.getDeclaringClass().getName() + "" + method.getName() + "0003Parameters", getAllFields(), false);
        paremetersModel = parametersType.newInstance();

        binder = new MDDBinder(parametersType);
        //binder = new Binder(modelType, true);

        Pair<Component, AbstractStylist> r = FormLayoutBuilder.get().build(binder, parametersType, paremetersModel, validators, ReflectionHelper.getAllFields(parametersType));

        stylist = r.getValue();
        addComponent(r.getKey());



        Button b;
        addComponent(b = new Button("Run", VaadinIcons.BOLT));
        b.addStyleName(ValoTheme.BUTTON_PRIMARY);
        b.addClickListener(e -> run());
        b.setClickShortcut(ShortcutAction.KeyCode.ENTER);


        addComponentsAndExpand(new Label(""));

        System.out.println("method parameters component built in " + (System.currentTimeMillis() - t0) + " ms.");


        return this;
    }

    private List<FieldInterfaced> getAllFields() {
        List<FieldInterfaced> allFields = ReflectionHelper.getAllFields(method);

        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Version.class) || f.isAnnotationPresent(Ignored.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))
        ).collect(Collectors.toList());

        return allFields;
    }

    public void run() {
        try {

            BinderValidationStatus v = binder.validate();

            if (v.isOk()) {


                System.out.println(binder.getBean());


                Object r = ReflectionHelper.execute(MDD.getUserData(), method, binder, bean, pendingSelection);

                if (r instanceof Class && (((Class) r).isAnnotationPresent(Entity.class) || PersistentPOJO.class.isAssignableFrom((Class<?>) r))) {

                    MDDUI.get().getNavegador().getViewProvider().openCRUD(null, (Class) r, null, null, false);


                } else {

                    if (method.isAnnotationPresent(Action.class) && method.getAnnotation(Action.class).saveAfter() && parentBinder.getViewComponent() != null && parentBinder.getViewComponent() instanceof EditorViewComponent) {
                        ((EditorViewComponent) parentBinder.getViewComponent()).save(false);
                    }

                    if (parentBinder != null) {
                        parentBinder.setBean(null, false);
                        parentBinder.setBean(bean, false);
                    }


                    if (void.class.equals(method.getReturnType())) {
                        MDDUI.get().getNavegador().goBack();
                        MDD.info("Done");
                    } else {
                        MDDUI.get().getNavegador().showResult(context.getCurrentState(), method, r, context, true);
                    }

                }

                // cambiamos la url, para reflejar el cambio


            } else MDD.alert(v);


        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }


    public AbstractStylist getStylist() {
        return stylist;
    }

    public void setStylist(AbstractStylist stylist) {
        this.stylist = stylist;
    }


    @Override
    public Method getMethod(String name) {
        return null;
    }

    @Override
    public FieldInterfaced getField(String name) {
        FieldInterfaced f = null;
        for (FieldInterfaced x : getAllFields()) {
            if (name.equals(x.getName())) {
                f = x;
                break;
            }
        }
        return f;
    }

    @Override
    public Object getModel() {
        return binder.getBean();
    }

    @Override
    public MDDBinder getBinder() {
        return binder;
    }

    @Override
    public void updateModel(Object m) {
        binder.setBean(m, false);
    }

    @Override
    public void preSave() throws Throwable {

    }

    @Override
    public void save(boolean goBack) {

    }

    @Override
    public void save(boolean goBack, boolean notify) throws Throwable {

    }


}
