package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.google.common.base.Strings;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Component;
import com.vaadin.ui.UI;
import com.vaadin.ui.Window;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.interfaces.PersistentPOJO;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;

import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.validation.constraints.Size;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.*;

public class ViewComponentHelper {
    public static AbstractAction createAction(Method m, AbstractViewComponent viewComponent) {

        AbstractAction action = viewComponent.getActionByMethod(m);

        if (action == null) {
            Action aa = m.getAnnotation(Action.class);

            action = new AbstractAction(m.getName(), (!Strings.isNullOrEmpty(aa.value())) ? aa.value() : Helper.capitalize(m.getName())) {
                @Override
                public void run(MDDExecutionContext context) {

                    if (aa.isGrous()) {

                        UI.getCurrent().addWindow(new ActionGroupWindow(m, (List<Component>) viewComponent.menuItemsByGroup.get(m.getName())));

                    } else {

                        boolean needsValidation = aa.validateBefore();
                        if (!needsValidation && viewComponent instanceof EditorViewComponent) needsValidation = ((EditorViewComponent)viewComponent).getModelType().isAnnotationPresent(Entity.class) || PersistentPOJO.class.isAssignableFrom(((EditorViewComponent)viewComponent).getModelType());

                        if (!needsValidation || ((EditorViewComponent)viewComponent).validate()) {

                            try {
                                if (m.isAnnotationPresent(Action.class) && m.getAnnotation(Action.class).saveBefore() && viewComponent instanceof EditorViewComponent) {
                                    ((EditorViewComponent) viewComponent).save(false);
                                }

                                boolean allInjectable = true;
                                boolean needsTransaction = false;
                                boolean needsSelection = false;
                                for (Parameter p : m.getParameters()) {
                                    Class<?> pgc = ReflectionHelper.getGenericClass(p.getParameterizedType());
                                    if (EntityManager.class.equals(p.getType())) {
                                        needsTransaction = true;
                                    } else if (UserData.class.equals(p.getType())) {
                                    } else if (viewComponent instanceof ListViewComponent && Set.class.isAssignableFrom(p.getType()) && (m.getDeclaringClass().equals(pgc) || (viewComponent instanceof RpcListViewComponent && ReflectionHelper.getGenericClass(((RpcListViewComponent)viewComponent).getRpcListView().getClass(), RpcView.class, "C").equals(pgc)))) {
                                        if (!p.isAnnotationPresent(Size.class) || p.getAnnotation(Size.class).min() > 0)
                                            needsSelection = true;
                                    } else {
                                        allInjectable = false;
                                    }
                                }

                                try {

                                    Set selection = new HashSet();
                                    if (viewComponent instanceof ListViewComponent) {
                                        ListViewComponent lvc = (ListViewComponent) viewComponent;

                                        Helper.notransact(em -> {
                                            boolean jpa = lvc.getColumnType().isAnnotationPresent(Entity.class);
                                            lvc.getSelection().forEach(o -> {
                                                if (jpa && o instanceof Object[]) {
                                                    selection.add(em.find(lvc.getColumnType(), lvc.deserializeId("" + lvc.toId(o))));
                                                } else {
                                                    selection.add(o);
                                                }
                                            });
                                        });


                                    }

                                    if (needsSelection && selection.size() == 0) throw new Exception("You must first select some records.");

                                    if (!allInjectable) { // si necesita rellenar parámetros
                                        MDD.getPort().open(m, selection);
                                    } else { // si no tiene parámetros o si todos son inyectables

                                        try {
                                            // necesita transacción?

                                            Object instance = null;

                                            if (viewComponent instanceof EditorViewComponent) {
                                                EditorViewComponent evc = (EditorViewComponent) viewComponent;
                                                instance = evc.getModel();
                                            } else if (viewComponent instanceof RpcListViewComponent) {
                                                instance = ((RpcListViewComponent)viewComponent).getRpcListView();
                                            }


                                            if (needsTransaction) {

                                                Object finalInstance = instance;
                                                Set finalSelection = selection;
                                                Helper.transact(new JPATransaction() {
                                                    @Override
                                                    public void run(EntityManager em) throws Throwable {

                                                        if (viewComponent instanceof EditorViewComponent) {

                                                            Object ni = em.merge(finalInstance);

                                                            invoke(viewComponent, m, ni, finalSelection, em, null);

                                                            if (viewComponent instanceof EditorViewComponent) ((EditorViewComponent) viewComponent).setModel(ni);

                                                        } else {

                                                            invoke(viewComponent, m, finalInstance, finalSelection, em, null);

                                                        }

                                                    }
                                                });

                                                if (viewComponent instanceof EditorViewComponent && instance.getClass().isAnnotationPresent(Entity.class)) {
                                                    EditorViewComponent evc = (EditorViewComponent) viewComponent;
                                                    Object i = evc.getModel();
                                                    Helper.notransact(em -> evc.setModel(em.find(i.getClass(), ReflectionHelper.getId(i))));
                                                }

                                            } else {

                                                invoke(viewComponent, m, instance, selection, null, null);

                                            }


                                            if (m.isAnnotationPresent(Action.class) && m.getAnnotation(Action.class).saveAfter() && viewComponent instanceof EditorViewComponent) {
                                                ((EditorViewComponent) viewComponent).save(false);
                                            } else if (viewComponent instanceof EditorViewComponent) {
                                                EditorViewComponent evc = (EditorViewComponent) viewComponent;
                                                evc.getBinder().update(evc.getModel());
                                            }

                                        } catch (Throwable throwable) {
                                            MDD.alert(throwable);
                                        }

                                    }

                                } catch (Throwable throwable) {
                                    MDD.alert(throwable);
                                }

                            } catch (Throwable throwable) {
                                MDD.alert(throwable);
                            }

                        }

                    }

                }
            }.setStyle(aa.style()).setIcon(VaadinIcons.ADOBE_FLASH.equals(aa.icon())?null:aa.icon())
                    .setConfirmationMessage(aa.confirmationMessage());

            action.setGroup(aa.group());
            viewComponent.setAction(m, action);
        }

        return action;

    }

    private static void invoke(AbstractViewComponent viewComponent, Method m, Object instance, Set selection, EntityManager em, Map<String, Object> parameterValues) throws InvocationTargetException, IllegalAccessException {

        boolean needsEm = false;
        for (Parameter p : m.getParameters()) {
            if (EntityManager.class.equals(p.getType())) {
                needsEm = true;
                break;
            }
        }

        List<Object> vs = new ArrayList<>();
        for (Parameter p : m.getParameters()) {
            Class<?> pgc = ReflectionHelper.getGenericClass(p.getParameterizedType());
            if (EntityManager.class.equals(p.getType())) {
                vs.add(em);
            } else if (UserData.class.equals(p.getType())) {
                vs.add(MDD.getUserData());
            } else if (viewComponent instanceof ListViewComponent && Set.class.isAssignableFrom(p.getType()) && (m.getDeclaringClass().equals(pgc) || (viewComponent instanceof RpcListViewComponent && ReflectionHelper.getGenericClass(((RpcListViewComponent)viewComponent).getRpcListView().getClass(), RpcView.class, "C").equals(pgc)))) {
                if (needsEm && ReflectionHelper.getGenericClass(p.getParameterizedType()).isAnnotationPresent(Entity.class)) {
                    Set aux = new HashSet();
                    for (Object o : selection) aux.add(em.merge(o));
                    selection = aux;
                }
                vs.add(selection);
            } else {
                vs.add((parameterValues != null)?parameterValues.get(p.getName()):null);
            }
        }
        Object[] args = vs.toArray();

        Object r = m.invoke(instance, args);

        if (void.class.equals(m.getReturnType())) {

            if (viewComponent instanceof ListViewComponent) {
                ListViewComponent lvc = (ListViewComponent) viewComponent;
                try {
                    lvc.search(lvc.getModelForSearchFilters());
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
            }

        } else {
            MDD.getPort().open(m, r);
        }

    }
}
