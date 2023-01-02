package io.mateu.mdd.vaadin.components.views;

import com.google.common.collect.Iterables;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDRunnableAction;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.components.ClassOption;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.util.VaadinHelper;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.OneToMany;
import javax.validation.constraints.NotNull;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.*;
import java.util.function.Consumer;

@Slf4j
public class OwnedCollectionViewComponent extends EditorViewComponent {

    private final MDDBinder parentBinder;
    private final FieldInterfaced field;
    private Collection collection;
    List<AbstractAction> myActions;

    private int currentIndex = 0;

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.LIST_SELECT;
    }

    public boolean beforeBack() {
        if (!validate()) return false;
        Object bean = getParentBinder().getBean();
        try {
            ReflectionHelper.setValue(field, bean, collection);
            getParentBinder().setBean(bean, false);
        } catch (Exception e) {
            Notifier.alert(e);
            return false;
        }
        return true;
    }

    public MDDBinder getParentBinder() {
        return parentBinder;
    }

    @Override
    public List<AbstractAction> getActions() {
        if (myActions == null) {
            myActions = buildActions();
            getActionsPerSection().put("", myActions);
        }
        return myActions;
    }

    private List<AbstractAction> buildActions() {
        List<AbstractAction> l = new ArrayList<>();

        if (field != null) {

        /*
        goToPreviousButton.setClickShortcut(ShortcutAction.KeyCode.B, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);
        goToNextButton.setClickShortcut(ShortcutAction.KeyCode.N, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);
        addButton.setClickShortcut(ShortcutAction.KeyCode.M, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);
         */

            if (!isActionPresent("col_prev")) {
                l.add(new MDDRunnableAction("") {
                    //l.add(new AbstractAction("col_prev", VaadinIcons.ARROW_UP, "Prev") {

                    @Override
                    public void run() {
                        if (validate()) {
                            if (currentIndex > 0) {
                                try {
                                    setIndex(currentIndex - 1);
                                } catch (Exception e1) {
                                    Notifier.alert(e1);
                                }
                            } else Notifier.info("This was already the first item of the list");
                        }
                    }
                }.setIcon(VaadinIcons.ARROW_UP).setId("col_prev"));
            } else getMenuItemById("col_prev").setVisible(true);

            if (!isActionPresent("col_next")) {
                l.add(new MDDRunnableAction("") {
                    //l.add(new AbstractAction("col_next", VaadinIcons.ARROW_DOWN, "Next") {
                    @Override
                    public void run() {
                        if (validate()) {
                            if (collection != null && currentIndex < collection.size() - 1) {
                                try {
                                    setIndex(currentIndex + 1);
                                } catch (Exception e1) {
                                    Notifier.alert(e1);
                                }
                            } else Notifier.info("This was already the last item of the list");
                        }
                    }
                }.setIcon(VaadinIcons.ARROW_DOWN).setId("col_next"));
            } else getMenuItemById("col_next").setVisible(true);

            if (ReflectionHelper.puedeAnadir(field)) {
                if (!isActionPresent("col_add")) {
                    l.add(new MDDRunnableAction("Add") {
                        @Override
                        public void run() {
                            if (validate()) {
                                try {

                                    setIndex(collection.size());

                                } catch (Throwable throwable) {
                                    Notifier.alert(throwable);
                                }
                            }
                        }
                    }.setIcon(VaadinIcons.PLUS).setId("col_add"));
                } else getMenuItemById("col_add").setVisible(true);
            }

            if (ReflectionHelper.puedeBorrar(field)) {
                if (!isActionPresent("col_remove")) {
                    l.add(new MDDRunnableAction("Remove") {
                        @Override
                        public void run() {
                            if (currentIndex >= 0 && currentIndex < collection.size())
                                VaadinHelper.confirm("Are you sure you want to delete this item?", () -> {

                                    try {
                                        Object m = getModel();
                                        if (m != null && m instanceof ResourceModel)
                                            m = ((ResourceModel) m).getResource();

                                        Object parentBean = parentBinder.getBean();
                                        collection = ReflectionHelper.remove((Collection) ReflectionHelper.getValue(field, parentBean), m);
                                        ReflectionHelper.setValue(field, parentBean, collection);
                                        parentBinder.setBean(parentBean, false);

                                        try {
                                            if (collection.size() == 0) MDDUIAccessor.goBack();
                                            else if (currentIndex == collection.size()) setIndex(collection.size() - 1);
                                            else setIndex(currentIndex);
                                        } catch (Throwable throwable) {
                                            Notifier.alert(throwable);
                                        }

                                    } catch (Throwable throwable) {
                                        Notifier.alert(throwable);
                                    }
                                });
                            else Notifier.info("Can not remove this item");

                        }
                    }.setIcon(VaadinIcons.MINUS).setId("col_remove"));
                } else getMenuItemById("col_remove").setVisible(true);
            }

            if (ReflectionHelper.puedeAnadir(field)) {
                if (!isActionPresent("col_copy")) {
                    l.add(new MDDRunnableAction("Copy prev") {
                        @Override
                        public void run() {
                            try {

                                if (currentIndex > 0) {
                                    getElementAt(currentIndex, v0 -> {
                                        try {
                                            getElementAt(currentIndex - 1, v -> {
                                                ReflectionHelper.copy(v, v0);
                                                getBinder().update(v0);
                                            });
                                        } catch (Exception ex) {
                                            ex.printStackTrace();
                                        }
                                    });
                                } else Notifier.info("This is the first item of the list. Can not copy from previous");

                            } catch (Throwable throwable) {
                                Notifier.alert(throwable);
                            }

                        }
                    }.setIcon(VaadinIcons.COPY).setId("col_copy"));
                } else getMenuItemById("col_copy").setVisible(true);
            }

            l.addAll(super.getActions());

        }

        return l;
    }

    @Override
    protected void removeUneditableFields(List<FieldInterfaced> fields) {
        super.removeUneditableFields(fields);
        if (field != null) fields.removeIf(f -> {
            OneToMany a = field.getAnnotation(OneToMany.class);
            return a != null && f.getName().equals(a.mappedBy());
        });
    }

    public OwnedCollectionViewComponent(MDDBinder parentBinder, FieldInterfaced field, int index) throws Exception {
        super(field.getGenericClass());
        this.parentBinder = parentBinder;
        this.field = field;
        collection = (Collection) ReflectionHelper.getValue(field, parentBinder.getBean());

        // incrustamos un nuevo elemento
        //setIndex(collection.size());
        if (index < 0) setIndex(collection.size());
        else getElementAt(index, v -> {
            try {
                setElement(v, index);
            } catch (Exception e) {
                Notifier.alert(e);
            }
        });
    }

    private void setElement(Object value, int index) throws Exception {

        currentIndex = index;

        setModel(value);

        if (getParent() != null) MDDUIAccessor.updateTitle(toString());
    }

    @Override
    public void onGoBack() {

        if (parentBinder != null) {
            try {
                Object o = parentBinder.getBean();
                ReflectionHelper.setValue(field, o, collection);
                parentBinder.update(o);
            } catch (Exception e) {
                Notifier.alert(e);
            }
        }

    }

    @Override
    public String toString() {
        String s = "";
        Object b = (parentBinder != null)?parentBinder.getBean():null;
        s += b != null?b:"---";
        s += ": ";
        if (currentIndex < collection.size()) s += Helper.capitalize(field.getName() + " " + (currentIndex + 1) + " of " + collection.size());
        else s += Helper.capitalize("New " + field.getName());
        //if (parentBinder != null && parentBinder.getViewComponent() != null) s += " from " + parentBinder.getViewComponent().getTitle();
        return s;
    }

    public void setIndex(int index) throws Exception {

        getElementAt(index, v -> {
            try {
                setElement(v, index);
            } catch (Exception e) {
                Notifier.alert(e);
            }
        });

    }

    private void getElementAt(int index, Consumer consumer) throws Exception {
        Object v = null;

        if (index == collection.size()) {

            Set<Class> subClasses = ReflectionHelper.getSubclasses(ReflectionHelper.getGenericClass(field.getGenericType()));

            Class c = null;

            if (subClasses.size() > 1) {

                Set<ClassOption> subClassesOptions = new LinkedHashSet<>();
                subClasses.forEach(cl -> subClassesOptions.add(new ClassOption(cl)));

                VaadinHelper.choose("Please choose type", subClassesOptions, cl -> {
                    try {
                        Object o = newInstance(((ClassOption)cl).get_class());
                        Object parentBean = parentBinder.getBean();
                        collection = ReflectionHelper.extend((Collection) ReflectionHelper.getValue(field, parentBean), o);
                        ReflectionHelper.setValue(field, parentBean, collection);
                        parentBinder.setBean(parentBean, false);
                        consumer.accept(o);
                    } catch (Exception e) {
                        Notifier.alert(e);
                    }
                }, () -> MDDUIAccessor.goBack());
            } else if (subClasses.size() == 1) {
                c = subClasses.iterator().next();
            } else {

                c = ReflectionHelper.getGenericClass(field.getGenericType());

            }


            if (c != null) {
                try {
                    Constructor con = ReflectionHelper.getConstructor(c, parentBinder.getBeanType());
                    if (con == null) {
                        con = c.getConstructor();
                    }
                    if (con != null && Modifier.isPublic(con.getModifiers())) {
                        try {

                            Object parentBean = parentBinder.getBean();
                            collection = ReflectionHelper.addToCollection(field, parentBinder.getBean());
                            ReflectionHelper.setValue(field, parentBean, collection);
                            parentBinder.setBean(parentBean, false);

                            Object i = Iterables.getLast(collection);
                            consumer.accept(i);
                        } catch (Exception ex) {
                            Notifier.alert(ex);
                        }
                    } else {
                        con = ReflectionHelper.getConstructor(c);
                        if (con != null) {
                            VaadinHelper.fill("I need some data", con, i -> {
                                try {
                                    collection = ReflectionHelper.addToCollection(field, parentBinder.getBean());
                                    consumer.accept(i);
                                } catch (Exception ex) {
                                    Notifier.alert(ex);
                                }
                            }, () -> MDDUIAccessor.goBack());
                        } else Notifier.alert("No constructor found for " + c.getSimpleName());
                    }


                } catch (NoSuchMethodException ex) {
                    Notifier.alert(ex);
                }
            }

        } else {
            if (collection instanceof List) {
                v = ((List) collection).get(index);
            } else if (collection instanceof Collection) {
                int pos = 0;
                for (Object o : ((Collection) collection)) {
                    if (pos++ == index) {
                        v = o;
                        break;
                    }
                }
            }
            consumer.accept(v);
        }


    }

    private Object newInstance(Class c) throws IllegalAccessException, InstantiationException, InvocationTargetException, NoSuchMethodException {
        Object parent = parentBinder.getBean();

        Method m = ReflectionHelper.getMethod(parent.getClass(), "create" + ReflectionHelper.getFirstUpper(field.getName()) + "Instance");

        Object i = null;

        if (m != null) {
            i = m.invoke(parent);
        } else {
            i = ReflectionHelper.newInstance(c, parent);
            for (FieldInterfaced f : ReflectionHelper.getAllFields(c))
                if (f.getType().equals(parent.getClass()) && f.isAnnotationPresent(NotNull.class)) {
                    ReflectionHelper.setValue(f, i, parent);
                    break;
                }
        }


        return i;
    }
}
