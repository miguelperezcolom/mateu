package io.mateu.mdd.vaadin.navigation;

import com.vaadin.navigator.View;
import com.vaadin.ui.Component;
import com.vaadin.ui.UI;
import com.vaadin.ui.Window;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.components.views.RpcListViewComponent;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ViewStack {

    private List<io.mateu.mdd.vaadin.navigation.View> stack = new ArrayList<>();
    private Map<String, io.mateu.mdd.vaadin.navigation.View> viewByState = new HashMap<>();
    private Map<io.mateu.mdd.vaadin.navigation.View, String> stateByView = new HashMap<>();

    public int size() {
        return stack.size();
    }

    public Map<io.mateu.mdd.vaadin.navigation.View, String> getStateByView() {
        return stateByView;
    }

    public Map<String, io.mateu.mdd.vaadin.navigation.View> getViewByState() {
        return viewByState;
    }

    public io.mateu.mdd.vaadin.navigation.View push(String state, Component component, Controller c) throws Exception {
        io.mateu.mdd.vaadin.navigation.View v;

        if (component != null && component instanceof AbstractViewComponent) {
            String t = null;
            if (component instanceof ListViewComponent) {
                ((ListViewComponent) component).setBaseUrl(state);
            }
            if (component instanceof RpcListViewComponent) {
                RpcListViewComponent rlvc = (RpcListViewComponent) component;
                if (rlvc.getRpcListView() != null) {
                    Class cl = rlvc.getRpcListView().getClass();
                    Method m = ReflectionHelper.getMethod(cl, "toString");
                    if (m != null && !Object.class.equals(m.getDeclaringClass())) {
                        t = "" + rlvc.getRpcListView();
                    }
                }
            }
            if (MDDUIAccessor.getApp().getMenu(state) != null) {
                t = MDDUIAccessor.getApp().getMenu(state).getCaption();
            }
            if (t != null) ((AbstractViewComponent)component).setTitle(t);
            if (stack.size() > 0 && stack.get(stack.size() - 1).getViewComponent() instanceof AbstractViewComponent) {
                ((AbstractViewComponent)component).setParentView((AbstractViewComponent) stack.get(stack.size() - 1).getViewComponent());
            }
        }

        push(state, v = new io.mateu.mdd.vaadin.navigation.View(this, component), c);

        return v;
    }

    public io.mateu.mdd.vaadin.navigation.View push(String state, io.mateu.mdd.vaadin.navigation.View v, Controller c) throws Exception {
        String cleanState = cleanState(state);
        boolean yaAbierto = false;
        if (v.getViewComponent() instanceof EditorViewComponent) {
            if (((EditorViewComponent) v.getViewComponent()).getModel() != null) yaAbierto = stack.stream().anyMatch(w -> w.getViewComponent() instanceof EditorViewComponent && ((EditorViewComponent) w.getViewComponent()).getModel() != null && !(((EditorViewComponent) w.getViewComponent()).getModel() instanceof ReadOnlyPojo) && ((EditorViewComponent) w.getViewComponent()).getModel().equals(((EditorViewComponent) v.getViewComponent()).getModel()));
        } else if (v.getViewComponent() instanceof ListViewComponent) {
            ((ListViewComponent) v.getViewComponent()).setBaseUrl(state);
        }

        if (yaAbierto) {
            throw new Exception("You are already editing " + v.getViewComponent().getPageTitle());
        }

        if (viewByState.containsKey(cleanState)) {
            io.mateu.mdd.vaadin.navigation.View x = viewByState.remove(cleanState);
            stateByView.remove(x);
            stack.remove(x);
        }
        viewByState.put(cleanState, v);
        stateByView.put(v, cleanState);
        v.setController(c);
        stack.add(v);
        return v;
    }




    public View pop() {
        return pop(1);
    }

    public View pop(int positions) {
        View r = null;
        if (positions <= stack.size()) {
            int index = stack.size() - positions;
            if (index < 0) index = 0;
            while (index < stack.size()) {
                View v = r = stack.remove(stack.size() - 1);
                String state = stateByView.remove(v);
                viewByState.remove(state);
                if (viewByState.size() != stateByView.size()) {
                    List<String> missedStates = viewByState.keySet().stream().filter(k -> !stateByView.values().contains(k)).collect(Collectors.toList());
                    List<io.mateu.mdd.vaadin.navigation.View> missedViews = stateByView.keySet().stream().filter(k -> !viewByState.values().contains(k)).collect(Collectors.toList());
                    missedStates.forEach(k -> viewByState.remove(k));
                    missedViews.forEach(k -> stateByView.remove(k));
                }
                if (viewByState.size() != stateByView.size()) {
                    Notifier.alert("stateByView.size()=" + stateByView.size() + ", viewByState.size()=" + viewByState.size());
                }
                if (v instanceof io.mateu.mdd.vaadin.navigation.View && ((io.mateu.mdd.vaadin.navigation.View) v).getWindowContainer() != null) {
                    Window w = ((io.mateu.mdd.vaadin.navigation.View) v).getWindowContainer();
                    if (stack.size() > 0 && !w.equals(getLast().getWindowContainer())) {
                        w.setData("noback");
                        w.close();
                    }
                }
            }
        }
        return r;
    }



    public io.mateu.mdd.vaadin.navigation.View getLast() {
        int pos = stack.size() - 1;
        return pos >= 0?stack.get(pos):null;
    }

    public io.mateu.mdd.vaadin.navigation.View getParent(View view) {
        int pos = stack.indexOf(view);
        return pos > 0?stack.get(pos - 1):null;
    }

    public void popTo(int index) {
        pop(stack.size() - (index + 1));
    }

    public int getStackSize() {
        return stack.size();
    }

    public io.mateu.mdd.vaadin.navigation.View getViewInStack(int pos) {
        return stack.get(pos);
    }

    public io.mateu.mdd.vaadin.navigation.View get(int index) {
        return stack.get(index);
    }

    public io.mateu.mdd.vaadin.navigation.View get(String state) {
        return viewByState.get(cleanState(state));
    }

    public int indexOf(View v) {
        return stack.indexOf(v);
    }

    public String getState(View v) {
        return (v != null)?stateByView.get(v):"";
    }

    public void clear() {
        stack = new ArrayList<>();
        viewByState = new HashMap<>();
        stateByView = new HashMap<>();
        if (UI.getCurrent() != null) UI.getCurrent().getWindows().forEach(w -> {
            w.setData("noback");
            w.close();
        });
    }

    public List<io.mateu.mdd.vaadin.navigation.View> getStack() {
        return stack;
    }

    public View getLastNavigable() {
        io.mateu.mdd.vaadin.navigation.View firstInWindow = stack.stream().filter(v -> v.getWindowContainer() != null).findFirst().orElse(null);
        io.mateu.mdd.vaadin.navigation.View last = getLast();
        if (firstInWindow != null) {
            int pos = stack.indexOf(firstInWindow);
            last = stack.get(pos - 1);
        }
        return last;
    }

    public View popTo(String state) {
        String cleanState = cleanState(state);
        View v = null;
        while (v == null && stack.size() > 0) {
            View r = stack.get(stack.size() - 1);
            if (cleanState.equals(getState(r))) {
                v = r;
                break;
            } else {
                pop();
            }
        }
        return v;
    }

    public static String cleanState(String state) {
        String s = "";
        for (String t : state.split("/")) {
            if (!"".equals(s)) s += "/";
            s += t.contains("&")?t.substring(0, t.indexOf("&")):t;
        }
        return s;
    }
}
