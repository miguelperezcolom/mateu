package io.mateu.mdd.core.app;


import com.vaadin.ui.Component;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class MDDOpenCustomComponentAction extends AbstractAction {

    private final Class viewClass;

    public MDDOpenCustomComponentAction(String name, Class viewClass) {
        super(name);
        this.viewClass = viewClass;
    }

    @Override
    public void run() {
        try {
            MDDUI.get().getNavegador().getViewProvider().open(this, (Component) viewClass.newInstance());
        } catch (Exception e) {
            MDD.alert(e);
        }
    }

    @Override
    public String toString() {
        return "Home";
    }
}
