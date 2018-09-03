package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.navigation.MDDViewComponentCreator;

import javax.persistence.Entity;
import java.lang.reflect.InvocationTargetException;
import java.util.Collection;
import java.util.List;

public class OwnedCollectionComponent extends VerticalLayout {

    private final Button goToPreviousButton;
    private final Button goToNextButton;
    private final VerticalLayout container;
    private final Button addButton;
    private final MDDBinder parentBinder;
    private final FieldInterfaced field;
    private final Collection collection;

    private int currentIndex = 0;


    private EditorViewComponent editorViewComponent;
    private boolean modificado;

    public EditorViewComponent getEditorViewComponent() {
        return editorViewComponent;
    }


    public OwnedCollectionComponent(MDDBinder parentBinder, FieldInterfaced field) throws Exception {
        this(parentBinder, field, -1);
    }

    public OwnedCollectionComponent(MDDBinder parentBinder, FieldInterfaced field, int index) throws Exception {

        this.parentBinder = parentBinder;
        this.field = field;


        collection = (Collection) ReflectionHelper.getValue(field, parentBinder.getBean());

        addStyleName("nopadding");

        addComponent(container = new VerticalLayout());
        container.addStyleName("nopadding");


        HorizontalLayout hl;
        addComponent(hl = new HorizontalLayout(goToPreviousButton = new Button(VaadinIcons.ARROW_LEFT), goToNextButton = new Button(VaadinIcons.ARROW_RIGHT), addButton = new Button(VaadinIcons.PLUS)));
        hl.addStyleName("nopadding");

        addComponentsAndExpand(new Label(""));

        goToPreviousButton.addClickListener(e -> {
            try {
                setIndex(currentIndex - 1);
            } catch (Exception e1) {
                MDD.alert(e1);
            }
        });
        goToPreviousButton.setClickShortcut(ShortcutAction.KeyCode.ARROW_LEFT, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);


        goToNextButton.addClickListener(e -> {
           try {
                setIndex(currentIndex + 1);
            } catch (Exception e1) {
                MDD.alert(e1);
            }
        });
        goToNextButton.setClickShortcut(ShortcutAction.KeyCode.ARROW_RIGHT, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);

        addButton.addClickListener(e -> {
            try {

                setIndex(collection.size());

            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }
        });
        addButton.setClickShortcut(107, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);

        // incrustamos un nuevo elemento
        //setIndex(collection.size());
        if (index < 0) setElement(ReflectionHelper.getGenericClass(field.getGenericType()).newInstance(), collection.size());
        else setElement(getElementAt(index), index);

        addAttachListener(x -> {
            System.out.println("attached!");
            if (editorViewComponent != null) {
                editorViewComponent.getBinder().addValueChangeListener(e -> {
                    updateButtons();
                });
            }
            updateButtons();
        });
    }

    private void setElement(Object value, int index) throws IllegalAccessException, InstantiationException {

        modificado = false;

        editorViewComponent = MDDViewComponentCreator.createEditorViewComponent(parentBinder.getBean(), value.getClass(), false);
        editorViewComponent.setModel(value);
        editorViewComponent.addStyleName("nopadding");

        editorViewComponent.getBinder().addValueChangeListener(e -> {
            try {
                ReflectionHelper.addToCollection(parentBinder, field, parentBinder.getBean(), editorViewComponent.getModel());
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
    }

    @Override
    public String toString() {
        String s = "";
        if (currentIndex < collection.size()) s = Helper.capitalize(field.getName() + " " + (currentIndex + 1) + " of " + collection.size());
        else s = Helper.capitalize("New " + field.getName());
        return s;
    }

    public void setIndex(int index) throws Exception {

        Object v = getElementAt(index);

        setElement(v, index);

    }

    private Object getElementAt(int index) throws Exception {
        Object v = null;

        if (index == collection.size()) {
            v = ReflectionHelper.getGenericClass(field.getGenericType()).newInstance();

            if (field.getType().isAnnotationPresent(Entity.class)) {

                ReflectionHelper.reverseMap(parentBinder, field, parentBinder.getBean(), v);

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
        }

        return v;
    }
}
