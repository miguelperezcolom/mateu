package io.mateu.mdd.core.app;


import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class MDDOpenEditorAction extends AbstractAction {

    private final Object bean;
    private final Class viewClass;
    private final Object id;

    public MDDOpenEditorAction(String name, Class viewClass) {
        this(name, viewClass, null);
    }

    public MDDOpenEditorAction(String name, Class viewClass, Object id) {
        super(name);
        this.viewClass = viewClass;
        this.id = id;
        this.bean = null;
    }

    public MDDOpenEditorAction(String name, Object bean) {
        super(name);
        this.viewClass = null;
        this.id = null;
        this.bean = bean;
    }

    @Override
    public void run() throws Throwable {
        if (bean != null) MDDUI.get().getNavegador().getViewProvider().openEditor( bean);
        else MDDUI.get().getNavegador().getViewProvider().openEditor(this, viewClass, id);;
    }
}
