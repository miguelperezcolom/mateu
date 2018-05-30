package io.mateu.mdd.core.app;


import io.mateu.mdd.core.MDD;

public class MDDOpenEditorAction extends AbstractAction {

    private final Class viewClass;
    private final Object id;
    private boolean modifierPressed;

    public MDDOpenEditorAction(String name, Class viewClass, Object id) {
        this(name, viewClass, id, false);
    }

    public MDDOpenEditorAction(String name, Class viewClass) {
        this(name, viewClass, null, false);
    }

    public MDDOpenEditorAction(String name, Class viewClass, Object id, boolean modifierPressed) {
        super(name);
        this.viewClass = viewClass;
        this.id = id;
        this.modifierPressed = modifierPressed;
    }

    @Override
    public void run() {
        MDD.openEditor(this, viewClass, id, modifierPressed);
    }
}
