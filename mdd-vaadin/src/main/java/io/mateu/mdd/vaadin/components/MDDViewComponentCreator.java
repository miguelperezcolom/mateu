package io.mateu.mdd.vaadin.components;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.components.views.*;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;

import javax.persistence.Entity;
import java.util.Map;
import java.util.function.Consumer;

public class MDDViewComponentCreator {

    public static Component createComponent(MDDOpenEditorAction action) {
        return createComponent(action.getViewClass(), action.getBeanId());
    }

    public static Component createComponent(Class viewClass, Object id) {
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

    public static Component createComponent(Object bean) {
        Component v = null;

        if (bean != null) {


            if (bean instanceof Component) {

                v = (Component) bean;

            } else {

                Class modelType = null;
                try {

                    modelType = bean.getClass();

                    v = createEditorViewComponent(modelType);

                    if (MateuUI.get() != null) MateuUI.get().setCurrentEditor((EditorViewComponent) v);

                    if (modelType.isAnnotationPresent(Entity.class))
                        ((EditorViewComponent)v).load(ReflectionHelper.getId(bean));
                    else ((EditorViewComponent)v).setModel(bean);


                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (InstantiationException e) {
                    e.printStackTrace();
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }

            }

        }

        return v;
    }

    public static Component createComponent(Class viewClass) {
        Component v = null;

        try {

            if (RpcCrudView.class.isAssignableFrom(viewClass)) {
                v = new RpcListViewComponent(viewClass);
            } else {
                v = new RpcListViewComponent(viewClass);
            }

        } catch (Exception e) {
            Notifier.alert(e);
        }
        return v;
    }

    public static ListViewComponent createSearcherComponent(MDDBinder parentBinder, FieldInterfaced field) {
        ListViewComponent v = null;
        Class modelType = null;
        try {

            modelType = field.getType();
            v = createListViewComponent(modelType,
                    null, null, null, null,
                    null, null, (o) -> {
                try {
                    Object bean = parentBinder.getBean();
                    ReflectionHelper.setValue(field, bean, o);
                    parentBinder.update(bean);
                } catch (Exception e) {
                    Notifier.alert(e);
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
        return v;
    }

    public static Component createComponent(MDDOpenCRUDAction action) {
        Component v = null;
        Class modelType = null;
        try {

            modelType = action.getEntityClass();
            v = createListViewComponent(modelType, action.getQueryFilters(), action.getExtraFilters(),
                    action.getDefaultValues(), action.getColumns(), action.getFilters(), action.getFields());

        } catch (Exception e) {
            e.printStackTrace();
        }
        return v;
    }

    public static EditorViewComponent createEditorViewComponent(Class modelType) throws Exception {
        return createEditorViewComponent(modelType, true);
    }

    public static EditorViewComponent createEditorViewComponent(Class modelType, boolean createSaveBUtton)
            throws Exception {
        EditorViewComponent v = new EditorViewComponent(modelType, createSaveBUtton);
        return v;
    }

    public static EditorViewComponent createEditorViewComponent(Object owner, FieldInterfaced field,
                                                                Class modelType, boolean createSaveBUtton)
            throws Exception {
        EditorViewComponent v = new EditorViewComponent(owner, field, modelType, createSaveBUtton);
        return v;
    }

    private static ListViewComponent createListViewComponent(Class modelType, String queryFilters,
                                                             ExtraFilters extraFilters,
                                                             Map<String, Object> defaultValues) throws Exception {
        return createListViewComponent(modelType, queryFilters, extraFilters, defaultValues,
                null, null, null);
    }

    private static ListViewComponent createListViewComponent(Class modelType, String queryFilters,
                                                             ExtraFilters extraFilters,
                                                             Map<String, Object> defaultValues, String columns,
                                                             String filters, String fields) throws Exception {
        return createListViewComponent(modelType, queryFilters, extraFilters, defaultValues, columns,
                filters, fields, null);
    }

    private static ListViewComponent createListViewComponent(Class modelType, String queryFilters,
                                                             ExtraFilters extraFilters,
                                                             Map<String, Object> defaultValues, String columns,
                                                             String filters, String fields, Consumer<Object> callback)
            throws Exception {
        ListViewComponent v = null;
        if (modelType.isAnnotationPresent(Entity.class)) {
            v = new JPAListViewComponent(modelType, queryFilters, extraFilters, defaultValues, columns, filters,
                    fields, callback);
        } else {

        }
        return v;
    }

    public static Component createComponent(WizardPage page) {
        return new WizardComponent(page);
    }
}
