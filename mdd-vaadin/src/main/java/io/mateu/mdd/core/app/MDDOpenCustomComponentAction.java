package io.mateu.mdd.core.app;


import com.vaadin.ui.Component;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.MDD;

public class MDDOpenCustomComponentAction extends AbstractAction {

    private final Class viewClass;
    private boolean modifierPressed;

    public MDDOpenCustomComponentAction(String name, Class viewClass) {
        this(name, viewClass, false);
    }

    public MDDOpenCustomComponentAction(String name, Class viewClass, boolean modifierPressed) {
        super(name);
        this.viewClass = viewClass;
        this.modifierPressed = modifierPressed;
    }

    @Override
    public void run(MDDExecutionContext context) {
        try {
            context.open(this, (Component) viewClass.newInstance(), modifierPressed);
        } catch (Exception e) {
            MDD.alert(e);
        }
    }
}
