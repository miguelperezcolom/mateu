package io.mateu.mdd.vaadin.controllers.secondLevel;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.vaadin.components.app.views.secondLevel.FiltersViewFlowComponent;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.JPAListViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.components.views.RpcListViewComponent;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.controllers.thirdLevel.MethodController;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.persistence.JPAHelper;

import java.lang.reflect.Method;

public class ListViewComponentController extends Controller {

    private final ListViewComponent listViewComponent;

    public ListViewComponentController(ViewStack stack, String path, ListViewComponent listViewComponent) {
        this.listViewComponent = listViewComponent;
        register(stack, path, listViewComponent);
    }


    @Override
    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {

        if (!"".equals(cleanStep)) {
            if ("filters".equals(step)) {
                register(stack, path + "/" + step, new FiltersViewFlowComponent(listViewComponent));
            } else if ("new".equals(step)) {
                EditorViewComponent editor = new EditorViewComponent(listViewComponent, listViewComponent.getModelType());
                editor.load(null);
                new EditorController(stack, path + "/" + step, editor).next(stack, path, step, remaining);
            } else {

                Method method = listViewComponent.getMethod(step);

                if (method != null) {
                    new MethodController(stack, path + "/" + step, method).apply(stack, path, step, cleanStep, remaining);
                } else {
                    if (listViewComponent instanceof JPAListViewComponent) {
                        Class type = listViewComponent.getModelType();
                        new EditorController(stack, path + "/" + step, listViewComponent, JPAHelper.find(type, ReflectionHelper.toId(type, step))).next(stack, path, step, remaining);
                    } else {
                        Object o = null;
                        if (MDDUIAccessor.getPendingResult() != null) {
                            o = MDDUIAccessor.getPendingResult();
                            MDDUIAccessor.setPendingResult(null);
                        } else o = ((RpcListViewComponent) listViewComponent).onEdit(step);

                        if (o instanceof RpcView) register(stack, path + "/" + step, new RpcListViewComponent((RpcView) o));
                        else if (!(o instanceof Component)) new EditorController(stack, path + "/" + step, listViewComponent, o).next(stack, path, step, remaining);
                        else register(stack, path + "/" + step, (Component) o);
                    }

                }

            }
        }

/*
            if (method == null && !"filters".equals(step) && listViewComponent instanceof RpcListViewComponent) {
                if (pendingResult == null) {
                    try {

                    } catch (Throwable e) {
                        Notifier.alert(e);
                    }
                }
            } else if (method != null) {

                callMethod(state, method, listViewComponent instanceof RpcListViewComponent ? ((RpcListViewComponent) listViewComponent).getRpcListView() : null, listViewComponent);

            } else if ("filters".equals(step)) {

                try {
                    return new FiltersViewFlowComponent(listViewComponent);
                } catch (Exception e) {
                    Notifier.alert(e);
                }

            } else {

                if (listViewComponent instanceof JPACollectionFieldListViewComponent) {

                    JPACollectionFieldListViewComponent cflistViewComponent = (JPACollectionFieldListViewComponent) listViewComponent;

                    Class targetType = cflistViewComponent.getModelType();
                    if (pendingResult != null) targetType = pendingResult.getClass();
                    Object parent = cflistViewComponent.getEvfc().getModel();

                    FieldInterfaced mf = ReflectionHelper.getMapper(cflistViewComponent.getField());

                    List<FieldInterfaced> parentFields = ReflectionHelper.getAllFields(parent.getClass());

                    List<FieldInterfaced> hiddenFields = new ArrayList<>();

                    for (FieldInterfaced f : ReflectionHelper.getAllEditableFields(targetType)) {

                        boolean hide = false;
                        for (FieldInterfaced pf : parentFields) {
                            if (f.equals(mf)
                                    ||
                                    (pf.isAnnotationPresent(ManyToOne.class) && f.isAnnotationPresent(ManyToOne.class) && pf.getType().equals(f.getType()) && pf.getName().equals(f.getName()))) {
                                hide = true;
                                break;
                            }
                        }

                        if (hide) hiddenFields.add(f);
                    }

                    EditorViewComponent evc = new EditorViewComponent(cflistViewComponent, cflistViewComponent.getItem(step), null, hiddenFields);

                    return evc;


                } else if (listViewComponent instanceof CollectionListViewComponent) {

                    CollectionListViewComponent cflistViewComponent = (CollectionListViewComponent) listViewComponent;

                    EditorViewComponent evc = new EditorViewComponent(cflistViewComponent, cflistViewComponent.deserializeId(step), null, null);

                    return evc;

                } else {

                    EditorViewComponent evc = new EditorViewComponent(listViewComponent, listViewComponent.getModelType());

                    evc.setBeforeOpen(() -> {
                        try {

                            if (Strings.isNullOrEmpty(step) || "new".equals(step)) { // estamos añadiendo un nuevo registro
                                evc.load(null);
                            } else { // step es el id del objeto a editar
                                String sid = URLDecoder.decode(Helper.decodeState(step), "iso-8859-1");
                                evc.load(listViewComponent.deserializeId(sid));
                            }

                        } catch (Throwable throwable) {
                            throwable.printStackTrace();
                        }
                    });

                    evc.addEditorListener(new EditorListener() {
                        @Override
                        public void preSave(Object model) throws Throwable {

                        }

                        @Override
                        public void onSave(Object model) {

                        }

                        @Override
                        public void onGoBack(Object model) {
                            try {
                                listViewComponent.search(listViewComponent.getModelForSearchFilters());
                            } catch (Throwable throwable) {
                                Notifier.alert(throwable);
                            }
                        }
                    });

                    return evc;

                }
            }

        }

 */
    }
}
