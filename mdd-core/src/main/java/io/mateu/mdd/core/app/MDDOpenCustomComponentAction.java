package io.mateu.mdd.core.app;


import com.vaadin.ui.Component;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class MDDOpenCustomComponentAction extends AbstractAction {

    private final Class viewClass;
    private final Object component;

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
    public void run() {
        try {
            MDDUI.get().getNavegador().getViewProvider().open(this, (Component) (component != null?component:ReflectionHelper.newInstance(viewClass)));
        } catch (Exception e) {
            MDD.alert(e);
        }
    }

    @Override
    public String toString() {
        return "Home";
    }
}
