package io.mateu.mdd.vaadin.components.views;

import com.google.common.base.Strings;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Component;
import com.vaadin.ui.UI;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDRunnableAction;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;
import io.mateu.util.persistence.JPAHelper;
import io.mateu.util.persistence.JPATransaction;

import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.validation.constraints.Size;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.*;

public class ViewComponentHelper {
    public static AbstractAction createAction(Method m, AbstractViewComponent viewComponent) {
        return createAction(null, m, viewComponent);
    }

    public static AbstractAction createAction(FieldInterfaced field, Method m, AbstractViewComponent viewComponent) {

        AbstractAction action = viewComponent.getActionByMethod(m);

        if (action == null) {
            //Action aa = m.getAnnotation(Action.class);

            String caption = getCaption(m);

            action = new MDDRunnableAction(caption) {
                @Override
                public void run() {

                    if (isGroup(m)) {

                        UI.getCurrent().addWindow(new ActionGroupWindow(m, (List<Component>) viewComponent.menuItemsByGroup.get(m.getName())));

                    } else {

                        boolean needsValidation = validateBefore(m);
                        if (!needsValidation && viewComponent instanceof EditorViewComponent) needsValidation = ((EditorViewComponent)viewComponent).getModelType().isAnnotationPresent(Entity.class) || PersistentPojo.class.isAssignableFrom(((EditorViewComponent)viewComponent).getModelType());
                        needsValidation &= !(viewComponent instanceof ListViewComponent);

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

                                        JPAHelper.notransact(em -> {
                                            boolean jpa = lvc.getColumnType().isAnnotationPresent(Entity.class);
                                            lvc.getSelection().forEach(o -> {
                                                if (jpa && o instanceof Object[]) {
                                                    selection.add(em.find(lvc.getColumnType(), lvc.deserializeId("" + lvc.toId(o))));
                                                } else {
                                                    selection.add(o);
                                                }
                                            });
                                        });


                                    } else if (viewComponent instanceof EditorViewComponent) {
                                        if (MDDUIAccessor.getPendingSelection() != null) selection.addAll(MDDUIAccessor.getPendingSelection());
                                        MDDUIAccessor.setPendingSelection(null);
                                    }

                                    if (needsSelection && selection.size() == 0) throw new Exception("You must first select some records.");

                                    if (!allInjectable) { // si necesita rellenar parámetros
                                        MDDUIAccessor.open(field, m, selection);
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
                                                JPAHelper.transact( new JPATransaction() {
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
                                                    JPAHelper.notransact(em -> evc.setModel(em.find(i.getClass(), ReflectionHelper.getId(i))));
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
                                            Notifier.alert(throwable);
                                        }

                                    }

                                } catch (Throwable throwable) {
                                    Notifier.alert(throwable);
                                }

                            } catch (Throwable throwable) {
                                Notifier.alert(throwable);
                            }

                        }

                    }

                }
            }.setStyle(getStyle(m)).setIcon(getIcon(m))
                    .setConfirmationMessage(getConfirmationMessage(m))
            .setFluentId(m.getName()).setValidationNeeded(validateBefore(m));

            action.setGroup(getGroup(m));
            action.setId(m.getName());
            viewComponent.setAction(m, action);
        }

        return action;

    }

    private static String getGroup(Method m) {
        Action aa = m.getAnnotation(Action.class);
        MainAction ma = m.getAnnotation(MainAction.class);
        if (aa != null) {
            return aa.group();
        }
        if (ma != null) {
            return ma.group();
        }
        return "";
    }

    private static String getConfirmationMessage(Method m) {
        Action aa = m.getAnnotation(Action.class);
        MainAction ma = m.getAnnotation(MainAction.class);
        if (aa != null) {
            return aa.confirmationMessage();
        }
        if (ma != null) {
            return ma.confirmationMessage();
        }
        return "";
    }

    private static VaadinIcons getIcon(Method m) {
        Action aa = m.getAnnotation(Action.class);
        MainAction ma = m.getAnnotation(MainAction.class);
        if (aa != null) {
            return VaadinIcons.ADOBE_FLASH.equals(aa.icon())?null:aa.icon();
        }
        if (ma != null) {
            return VaadinIcons.ADOBE_FLASH.equals(ma.icon())?null:ma.icon();
        }
        return null;
    }

    private static String getStyle(Method m) {
        Action aa = m.getAnnotation(Action.class);
        MainAction ma = m.getAnnotation(MainAction.class);
        if (aa != null) {
            return aa.style();
        }
        if (ma != null) {
            return ma.style();
        }
        return "";
    }

    private static boolean validateBefore(Method m) {
        Action aa = m.getAnnotation(Action.class);
        MainAction ma = m.getAnnotation(MainAction.class);
        if (aa != null) {
            return aa.validateBefore();
        }
        if (ma != null) {
            return ma.validateBefore();
        }
        return false;
    }

    private static boolean isGroup(Method m) {
        Action aa = m.getAnnotation(Action.class);
        MainAction ma = m.getAnnotation(MainAction.class);
        if (aa != null) {
            return aa.isGroup();
        }
        if (ma != null) {
            return ma.isGroup();
        }
        return false;
    }

    private static String getCaption(Method m) {
        Action aa = m.getAnnotation(Action.class);
        MainAction ma = m.getAnnotation(MainAction.class);
        if (aa != null) {
            return (!Strings.isNullOrEmpty(aa.value()) ? aa.value() : Helper.capitalize(m.getName()));
        }
        if (ma != null) {
            return (!Strings.isNullOrEmpty(ma.value()) ? ma.value() : Helper.capitalize(m.getName()));
        }
        return "Submit";
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
            } else if (viewComponent instanceof ListViewComponent && Set.class.isAssignableFrom(p.getType()) && (m.getDeclaringClass().equals(pgc) || (viewComponent instanceof RpcListViewComponent && ReflectionHelper.getGenericClass(((RpcListViewComponent)viewComponent).getRpcListView().getClass(), RpcView.class, "C").equals(pgc)))) {
                if (needsEm && ReflectionHelper.getGenericClass(p.getParameterizedType()).isAnnotationPresent(Entity.class)) {
                    Set aux = new HashSet();
                    for (Object o : selection) aux.add(em.find(ReflectionHelper.getGenericClass(p.getParameterizedType()), ReflectionHelper.getId(o)));
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
                    Notifier.alert(throwable);
                }
            }

        } else {
            MDDUIAccessor.open(m, r);
        }

    }
}
