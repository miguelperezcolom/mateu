package io.mateu.mdd.vaadinport.vaadin.navigation;

import com.vaadin.navigator.View;
import com.vaadin.ui.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ViewStack {

    private List<io.mateu.mdd.vaadinport.vaadin.navigation.View> stack = new ArrayList<>();
    private Map<String, io.mateu.mdd.vaadinport.vaadin.navigation.View> viewByState = new HashMap<>();
    private Map<io.mateu.mdd.vaadinport.vaadin.navigation.View, String> stateByView = new HashMap<>();

    public int size() {
        return stack.size();
    }





    public void push(String state, Component component) {
        io.mateu.mdd.vaadinport.vaadin.navigation.View v;
        viewByState.put(state, v = new io.mateu.mdd.vaadinport.vaadin.navigation.View(this, component));
        stateByView.put(v, state);
        stack.add(v);
    }





    public void pop() {
        pop(1);
    }

    public void pop(int positions) {
        if (positions <= stack.size()) {
            int index = stack.size() - positions;
            if (index < 0) index = 0;
            while (index < stack.size()) {
                View v = stack.remove(stack.size() - 1);
                String state = stateByView.remove(v);
                viewByState.remove(state);
            }
        }
    }



    public io.mateu.mdd.vaadinport.vaadin.navigation.View getLast() {
        return stack.get(stack.size() - 1);
    }

    public io.mateu.mdd.vaadinport.vaadin.navigation.View getParent(View view) {
        int pos = stack.indexOf(view);
        return stack.get(pos - 1);
    }

    public void popTo(int index) {
        pop(stack.size() - (index + 1));
    }

    public int getStackSize() {
        return stack.size();
    }

    public io.mateu.mdd.vaadinport.vaadin.navigation.View getViewInStack(int pos) {
        return stack.get(pos);
    }

    public io.mateu.mdd.vaadinport.vaadin.navigation.View get(int index) {
        return stack.get(index);
    }

    public io.mateu.mdd.vaadinport.vaadin.navigation.View get(String state) {
        return viewByState.get(state);
    }

    public int indexOf(View v) {
        return stack.indexOf(v);
    }

    public String getState(View v) {
        return (v != null)?stateByView.get(v):"";
    }

    public void clear() {
        popTo(-1);
    }
}
