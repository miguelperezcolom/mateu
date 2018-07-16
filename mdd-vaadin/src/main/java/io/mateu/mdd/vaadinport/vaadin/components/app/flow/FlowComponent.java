package io.mateu.mdd.vaadinport.vaadin.components.app.flow;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.MDDAction;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.app.MDDOpenListViewAction;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.views.EditorViewFlowComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.views.CrudViewFlowComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.views.ListViewFlowComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.*;

import javax.persistence.Entity;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FlowComponent extends HorizontalLayout implements MDDExecutionContext {

    private List<FlowViewComponent> stack = new ArrayList<>();
    private Map<FlowViewComponent, Component> wrappers = new HashMap<>();


    public FlowComponent() {
        addStyleName("flowcomponent");

        setSpacing(false);

        setResponsive(true);

        setSizeFull();

    }

    public void push(FlowViewComponent component) {
        Component w;
        addComponent(w = wrapViewComponent(component));
        stack.add(component);
        wrappers.put(component, w);
    }

    private Component wrapViewComponent(FlowViewComponent component) {
        Component l;
        VerticalLayout vl;
        l = vl = new VerticalLayout();
        vl.addComponent(createHeader(component));
        vl.addComponentsAndExpand(component);
        if (!(component instanceof ListViewFlowComponent || component instanceof CrudViewFlowComponent)) {
            l = new Panel(l);
            l.setStyleName(ValoTheme.PANEL_BORDERLESS);
            l.addStyleName("flowwrapperpanel");
            l = new VerticalLayout(l); // para dar siempre el mismo padding
        }
        return l;
    }

    private Component createHeader(FlowViewComponent component) {
        HorizontalLayout l = new HorizontalLayout();

        l.addStyleName("viewHeader");

        if (stack.size() > 0) l.addComponent(createBackLink());
        l.addComponent(createTitleLabel(component));

        return l;
    }

    private Component createTitleLabel(FlowViewComponent component) {
        Label l = new Label();
        l.addStyleName("viewTitle");

        updateViewTitle(l, component.getViewTile());

        component.addFlowViewListener(new FlowViewListener() {
            @Override
            public void titleChanged(String newTitle) {
                updateViewTitle(l, newTitle);
            }
        });

        return l;
    }

    private void updateViewTitle(Label l, String newTitle) {
        l.setValue(newTitle);
        UI.getCurrent().getPage().setTitle((newTitle != null)?newTitle:"No title");
    }

    private Component createBackLink() {
        Button b = new Button(null, VaadinIcons.ARROW_CIRCLE_LEFT);
        b.setDescription("Back to " + stack.get(stack.size() - 1).getViewTile());
        b.addClickListener(e -> {
            MyUI.get().getNavegador().goBack();
        });
        b.addStyleName(ValoTheme.BUTTON_QUIET);
        b.addStyleName("backlink");
        return b;
    }

    public void pop() {
        pop(1);
        showLast();
    }

    public void pop(int positions) {
        if (positions < stack.size()) {
            int index = stack.size() - positions;
            if (index < 0) index = 0;
            while (index < stack.size()) {
                FlowViewComponent c = stack.remove(stack.size() - 1);
                removeComponent(wrappers.get(c));
                wrappers.remove(c);
            }
        }
    }

    public void showLast() {
        stack.stream().map(c -> wrappers.get(c)).forEach(w -> {
            if (!w.getStyleName().contains("hidden")) {
                w.addStyleName("hidden");
                setExpandRatio(w, 0);
            }
        });
        if (stack.size() > 0) {
            FlowViewComponent fvc = stack.get(stack.size() - 1);

            if (fvc instanceof EditorViewFlowComponent) {

                EditorViewComponent evc = ((EditorViewFlowComponent) fvc).getEditorViewComponent();

                evc.setModel(evc.getModel());

            }


            Component w = wrappers.get(fvc);
            if (w.getStyleName().contains("hidden")) w.removeStyleName("hidden");
            setExpandRatio(w, 1);
        }
    }

    public Component getParent(Component component) {
        int pos = stack.indexOf(component);
        return stack.get(pos - 1);
    }

    public void popTo(int index) {
        pop(stack.size() - (index + 1));
    }

    public int getStackSize() {
        return stack.size();
    }

    public FlowViewComponent getComponentInStack(int pos) {
        return stack.get(pos);
    }

    @Override
    public void alert(String s) {
        MDD.alert(s);
    }

    @Override
    public void openEditor(MDDOpenEditorAction mddOpenEditorAction, Class viewClass, Object id, boolean modifierPressed) {
        Class modelType = null;
        try {

            modelType = viewClass;

            push(new EditorViewFlowComponent(calculateCurrentState(),  createEditorViewComponent(modelType)));

        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void openListView(MDDOpenListViewAction mddOpenListViewAction, Class viewClass, boolean modifierPressed) {
        try {

            if (RpcCrudView.class.isAssignableFrom(viewClass)) {
                Class modelType = ReflectionHelper.getGenericClass(viewClass, RpcCrudView.class, "T");
                push(new CrudViewFlowComponent(calculateCurrentState(), new CRUDViewComponent(new RpcListViewComponent(viewClass).build(), createEditorViewComponent(modelType)).build()));
            } else {
                push(new ListViewFlowComponent(calculateCurrentState(), new RpcListViewComponent(viewClass).build()));
            }

        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void openCRUD(MDDAction mddAction, Class entityClass, String queryFilters, boolean modifierPressed) {
        Class modelType = null;
        try {

            modelType = entityClass;
            CRUDViewComponent v = new CRUDViewComponent(createListViewComponent(modelType), createEditorViewComponent(modelType)).build();

            push(new CrudViewFlowComponent(calculateCurrentState(), v));

        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        }
    }

    private EditorViewComponent createEditorViewComponent(Class modelType) throws InstantiationException, IllegalAccessException {
        EditorViewComponent v = new EditorViewComponent(modelType).build();
        return v;
    }

    private ListViewComponent createListViewComponent(Class modelType) throws IllegalAccessException, InstantiationException {
        ListViewComponent v = null;
        if (modelType.isAnnotationPresent(Entity.class)) {
            v = new JPAListViewComponent(modelType).build();
        } else {

        }
        return v;
    }

    private String calculateCurrentState() {
        String s = "";
        if (stack.size() > 0) s = stack.get(stack.size() - 1).getStatePath();
        return s;
    }
}
