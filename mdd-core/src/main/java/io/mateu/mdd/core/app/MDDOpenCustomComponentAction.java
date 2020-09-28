package io.mateu.mdd.core.app;


public class MDDOpenCustomComponentAction extends AbstractAction {

    public final Class viewClass;
    public final Object component;

    public MDDOpenCustomComponentAction(String name, Class viewClass) {
        super(name);
        this.viewClass = viewClass;
        this.component = null;
    }

    public MDDOpenCustomComponentAction(String name, Object component) {
        super(name);
        this.viewClass = component.getClass();
        this.component = component;
    }

    @Override
    public String toString() {
        return "Home";
    }
}
