package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.app.MDDOpenListViewAction;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.*;

import javax.persistence.Entity;

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
                v = new CRUDViewComponent(new RpcListViewComponent(viewClass).build(), createEditorViewComponent(modelType)).build();
            } else {
                v = new RpcListViewComponent(viewClass).build();
            }

        } catch (Exception e) {
            MDD.alert(e);
        }
        return v;
    }

    public static Component createComponent(MDDOpenCRUDAction mddOpenCRUDAction, Class entityClass, String queryFilters, boolean modifierPressed) {
        Component v = null;
        Class modelType = null;
        try {

            modelType = entityClass;
            v = new CRUDViewComponent(createListViewComponent(modelType), createEditorViewComponent(modelType)).build();

        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        }
        return v;
    }

    private static EditorViewComponent createEditorViewComponent(Class modelType) throws InstantiationException, IllegalAccessException {
        EditorViewComponent v = new EditorViewComponent(modelType).build();
        return v;
    }

    private static ListViewComponent createListViewComponent(Class modelType) throws IllegalAccessException, InstantiationException {
        ListViewComponent v = null;
        if (modelType.isAnnotationPresent(Entity.class)) {
            v = new JPAListViewComponent(modelType).build();
        } else {

        }
        return v;
    }

    public static Component createComponent(WizardPage page) throws IllegalAccessException, InstantiationException {
        EditorViewComponent v = createEditorViewComponent(page.getClass());
        v.setModel(page);
        return v;
    }
}
