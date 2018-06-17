package io.mateu.mdd.vaadinport.vaadin.components.app.flow;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.Page;
import com.vaadin.ui.*;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDAction;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.views.EditorViewFlowComponent;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.views.ViewFlowComponent;
import io.mateu.mdd.vaadinport.vaadin.components.views.CRUDViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.views.JPAEditorViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.views.JPAListViewComponent;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FlowComponent extends HorizontalLayout implements MDDExecutionContext {

    private List<FlowViewComponent> stack = new ArrayList<>();
    private Map<FlowViewComponent, Component> wrappers = new HashMap<>();

    public void push(FlowViewComponent component) {
        Component w;
        addComponent(w = wrapViewComponent(component));
        stack.add(component);
        wrappers.put(component, w);
    }

    private Component wrapViewComponent(FlowViewComponent component) {
        VerticalLayout l = new VerticalLayout();
        if (stack.size() > 0) l.addComponent(createBackLink());
        l.addComponent(createTitleLabel(component));
        l.addComponentsAndExpand(component);
        return l;
    }

    private Component createTitleLabel(FlowViewComponent component) {
        Label l = new Label(component.getViewTile());
        l.addStyleName("viewTitle");
        return l;
    }

    private Component createBackLink() {
        Button b = new Button("Back to " + stack.get(stack.size() - 1).getViewTile(), VaadinIcons.ARROW_CIRCLE_LEFT);
        b.addClickListener(e -> {
            String u = Page.getCurrent().getLocation().getPath();
            u = u.substring(0, u.lastIndexOf("/"));
            ((MyUI)UI.getCurrent()).goTo(u);
        });
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
            if (!w.getStyleName().contains("hidden")) w.addStyleName("hidden");
        });
        if (stack.size() > 0) {
            FlowViewComponent fvc = stack.get(stack.size() - 1);
            Component w = wrappers.get(fvc);
            if (w.getStyleName().contains("hidden")) w.removeStyleName("hidden");
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
            CRUDViewComponent v = new CRUDViewComponent(new JPAListViewComponent(modelType).build(), new JPAEditorViewComponent(modelType).build()).build();
            v.setOriginatingAction((AbstractAction) MDD.getApp().getMenu(calculateCurrentState()));

            push(new EditorViewFlowComponent(calculateCurrentState(), v.getEditorViewComponent()));

        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        }
    }

    private String calculateCurrentState() {
        String s = "";
        if (stack.size() > 0) s = stack.get(stack.size() - 1).getStatePath();
        return s;
    }

    @Override
    public void openCRUD(MDDAction mddAction, Class entityClass, String queryFilters, boolean modifierPressed) {
        Class modelType = null;
        try {

            modelType = entityClass;
            CRUDViewComponent v = new CRUDViewComponent(new JPAListViewComponent(modelType).build(), new JPAEditorViewComponent(modelType).build()).build();
            v.setOriginatingAction((AbstractAction) MDD.getApp().getMenu(calculateCurrentState()));

            push(new ViewFlowComponent(calculateCurrentState(), v));

        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        }
    }
}
