package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.google.common.collect.Lists;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Panel;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.ClassOption;
import io.mateu.mdd.vaadinport.vaadin.navigation.MDDViewComponentCreator;
import io.mateu.mdd.vaadinport.vaadin.util.VaadinHelper;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.Entity;
import javax.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Consumer;

@Slf4j
public class OwnedCollectionComponent extends HorizontalLayout {

    private final Button goToPreviousButton;
    private final Button goToNextButton;
    private final Button addButton;
    private final Button removeButton;
    private final Button copyButton;

    private final VerticalLayout container;

    private final MDDBinder parentBinder;
    private final FieldInterfaced field;
    private Collection collection;

    private int currentIndex = 0;


    private EditorViewComponent editorViewComponent;
    private boolean modificado;

    public EditorViewComponent getEditorViewComponent() {
        return editorViewComponent;
    }


    public OwnedCollectionComponent(MDDBinder parentBinder, FieldInterfaced field) throws Exception {
        this(parentBinder, field, -1);
    }

    public MDDBinder getParentBinder() {
        return parentBinder;
    }

    public OwnedCollectionComponent(MDDBinder parentBinder, FieldInterfaced field, int index) throws Exception {

        this.parentBinder = parentBinder;
        this.field = field;


        collection = (Collection) ReflectionHelper.getValue(field, parentBinder.getBean());

        addStyleName(CSS.NOPADDING);

        setSizeFull();

        VerticalLayout hl = new VerticalLayout(goToPreviousButton = new Button(VaadinIcons.ARROW_LEFT), goToNextButton = new Button(VaadinIcons.ARROW_RIGHT), addButton = new Button(VaadinIcons.PLUS), removeButton = new Button(VaadinIcons.MINUS), copyButton = new Button(VaadinIcons.COPY));
        hl.addStyleName("botoneracollection");
        hl.addStyleName(CSS.NOPADDING);
        hl.setSizeUndefined();

        addComponent(hl);

        Panel panel;
        addComponentsAndExpand(panel = new Panel(container = new VerticalLayout()));
        panel.addStyleName(ValoTheme.PANEL_BORDERLESS);
        panel.setSizeFull();
        container.addStyleName(CSS.NOPADDING);

        //addComponentsAndExpand(new Label(""));
        setExpandRatio(panel, 1);


        goToPreviousButton.addClickListener(e -> {
            try {
                setIndex(currentIndex - 1);
            } catch (Exception e1) {
                MDD.alert(e1);
            }
        });


        goToNextButton.addClickListener(e -> {
            try {
                setIndex(currentIndex + 1);
            } catch (Exception e1) {
                MDD.alert(e1);
            }
        });

        addButton.addClickListener(e -> {
            try {

                setIndex(collection.size());

            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }
        });

        removeButton.addClickListener(e -> {
            if (currentIndex >= 0 && currentIndex < collection.size()) MDD.confirm("Are you sure you want to delete this item?", () -> {
                try {
                    Object m = editorViewComponent.getModel();
                    collection = ReflectionHelper.removeFromCollection(parentBinder, field, parentBinder.getBean(), Lists.newArrayList(m));
                    parentBinder.getRemovables().add(m);

                    try {
                        if (collection.size() == 0) setIndex(collection.size());
                        else if (currentIndex == collection.size()) setIndex(collection.size() - 1);
                        else setIndex(currentIndex);
                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
                    }

                } catch (Exception ex) {
                    MDD.alert(ex);
                }
            });
            else MDD.alert("Can not remove this item");
        });

        copyButton.addClickListener(e -> {
            try {

                if (currentIndex > 0) {
                    getElementAt(currentIndex, v0 -> {
                        try {
                            getElementAt(currentIndex - 1, v -> {
                                ReflectionHelper.copy(v0, v);
                            });
                        } catch (Exception ex) {
                            ex.printStackTrace();
                        }
                    });
                }

            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }
        });

        // incrustamos un nuevo elemento
        //setIndex(collection.size());
        if (index < 0) setIndex(collection.size());
        else getElementAt(index, v -> {
            try {
                setElement(v, index);
            } catch (Exception e) {
                MDD.alert(e);
            }
        });

        addAttachListener(x -> {
            log.debug("attached!");
            if (editorViewComponent != null) {
                editorViewComponent.getBinder().addValueChangeListener(e -> {
                    updateButtons();
                });
            }
            updateButtons();
        });
    }

    private void setElement(Object value, int index) throws Exception {

        modificado = false;

        editorViewComponent = MDDViewComponentCreator.createEditorViewComponent(parentBinder.getBean(), field, value.getClass(), false);
        editorViewComponent.setModel(value);
        editorViewComponent.addStyleName(CSS.NOPADDING);

        editorViewComponent.getBinder().addValueChangeListener(e -> {
            try {
                collection = ReflectionHelper.addToCollection(parentBinder, field, parentBinder.getBean(), editorViewComponent.getModel());
                MDD.updateTitle(toString());
            } catch (Exception e1) {
                MDD.alert(e1);
            }
            /*
            if (value.getClass().isAnnotationPresent(Entity.class)) parentBinder.getMergeables().add(value);
            if (index == collection.size()) {
                Object i;
                collection.add(i = editorViewComponent.getModel());
                try {
                    ReflectionHelper.reverseMap(editorViewComponent.getBinder(), field, parentBinder.getBean(), i);
                } catch (Exception e1) {
                    MDD.alert(e1);
                }
                MDD.updateTitle(toString());
            }
            */
            modificado = true;
            updateButtons();
        });

        container.removeAllComponents();


        container.addComponent(editorViewComponent);

        currentIndex = index;

        if (getParent() != null) MDD.updateTitle(toString());

        updateButtons();
    }

    private void updateButtons() {
        /*
        goToPreviousButton.setVisible(currentIndex > 0);
        goToNextButton.setVisible(collection.size() > currentIndex +1);
        addButton.setVisible(collection.size() == currentIndex +1);
        */

        boolean valid =  !modificado || editorViewComponent.getBinder().validate().isOk();

        goToPreviousButton.setEnabled(valid && currentIndex > 0);
        goToNextButton.setEnabled(valid && currentIndex < collection.size() - 1);
        addButton.setEnabled(valid && (modificado || currentIndex < collection.size()));

        goToPreviousButton.setClickShortcut(ShortcutAction.KeyCode.B, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);
        goToNextButton.setClickShortcut(ShortcutAction.KeyCode.N, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);
        addButton.setClickShortcut(ShortcutAction.KeyCode.M, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);

    }

    @Override
    public String toString() {
        String s = "";
        Object b = (parentBinder != null)?parentBinder.getBean():null;
        s += b != null?b:"---";
        s += ": ";
        if (currentIndex < collection.size()) s += Helper.capitalize(field.getName() + " " + (currentIndex + 1) + " of " + collection.size());
        else s += Helper.capitalize("New " + field.getName());
        return s;
    }

    public void setIndex(int index) throws Exception {

        getElementAt(index, v -> {
            try {
                setElement(v, index);
            } catch (Exception e) {
                MDD.alert(e);
            }
        });

    }

    private void getElementAt(int index, Consumer consumer) throws Exception {
        Object v = null;

        if (index == collection.size()) {

            Set<Class> subClasses = ReflectionHelper.getSubclasses(ReflectionHelper.getGenericClass(field.getGenericType()));

            if (subClasses.size() > 1) {

                Set<ClassOption> subClassesOptions = new LinkedHashSet<>();
                subClasses.forEach(c -> subClassesOptions.add(new ClassOption(c)));

                VaadinHelper.choose("Please choose type", subClassesOptions, c -> {
                    try {
                        consumer.accept(newInstance(((ClassOption)c).get_class()));
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                }, () -> MDDUI.get().getNavegador().goBack());
            } else if (subClasses.size() == 1) {
                v = newInstance(subClasses.iterator().next());
                consumer.accept(v);
            } else {

                v = newInstance(ReflectionHelper.getGenericClass(field.getGenericType()));

                if (field.getType().isAnnotationPresent(Entity.class)) {

                    ReflectionHelper.reverseMap(parentBinder, field, parentBinder.getBean(), v);

                }

                consumer.accept(v);

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
            i = c.newInstance();
            for (FieldInterfaced f : ReflectionHelper.getAllFields(c))
                if (f.getType().equals(parent.getClass()) && f.isAnnotationPresent(NotNull.class)) {
                    ReflectionHelper.setValue(f, i, parent);
                    break;
                }
        }


        return i;
    }
}
