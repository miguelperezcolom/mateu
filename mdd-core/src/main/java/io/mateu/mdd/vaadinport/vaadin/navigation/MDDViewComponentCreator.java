package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.app.MDDOpenListViewAction;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.*;

import javax.persistence.Entity;
import java.util.Map;

public class MDDViewComponentCreator {

    public static Component createComponent(MDDOpenEditorAction mddOpenEditorAction, Class viewClass, Object id, boolean modifierPressed) {
        Component v = null;

        Class modelType = null;
        try {

            modelType = viewClass;

            v = createEditorViewComponent(modelType);

            ((EditorViewComponent)v).load(id);


        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        return v;
    }

    public static Component createComponent(MDDOpenListViewAction mddOpenListViewAction, Class viewClass, boolean modifierPressed) {
        Component v = null;

        try {

            if (RpcCrudView.class.isAssignableFrom(viewClass)) {
                Class modelType = ReflectionHelper.getGenericClass(viewClass, RpcCrudView.class, "T");
                v = new RpcListViewComponent(viewClass);
            } else {
                v = new RpcListViewComponent(viewClass);
            }

        } catch (Exception e) {
            MDD.alert(e);
        }
        return v;
    }

    public static Component createComponent(MDDOpenCRUDAction mddOpenCRUDAction, Class entityClass, String queryFilters, ExtraFilters extraFilters, Map<String, Object> defaultValues, boolean modifierPressed) {
        Component v = null;
        Class modelType = null;
        try {

            modelType = entityClass;
            v = createListViewComponent(modelType, queryFilters, extraFilters, defaultValues);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return v;
    }

    public static EditorViewComponent createEditorViewComponent(Class modelType) throws Exception {
        return createEditorViewComponent(modelType, true);
    }

    public static EditorViewComponent createEditorViewComponent(Class modelType, boolean createSaveBUtton) throws Exception {
        EditorViewComponent v = new EditorViewComponent(modelType, createSaveBUtton);
        return v;
    }

    public static EditorViewComponent createEditorViewComponent(Object owner, FieldInterfaced field, Class modelType, boolean createSaveBUtton) throws Exception {
        EditorViewComponent v = new EditorViewComponent(owner, field, modelType, createSaveBUtton);
        return v;
    }

    private static ListViewComponent createListViewComponent(Class modelType, String queryFilters, ExtraFilters extraFilters, Map<String, Object> defaultValues) throws Exception {
        ListViewComponent v = null;
        if (modelType.isAnnotationPresent(Entity.class)) {
            v = new JPAListViewComponent(modelType, extraFilters, defaultValues);
        } else {

        }
        return v;
    }

    public static Component createComponent(WizardPage page) throws Exception {
        return new WizardComponent(page);
    }
}
