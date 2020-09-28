package io.mateu.mdd.core.app;


public class MDDOpenEditorAction extends AbstractAction {

    public final Object bean;
    public final Class viewClass;
    public final Object id;

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

}
