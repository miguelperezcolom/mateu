package io.mateu.mdd.core.app;


public class MDDOpenListViewAction extends AbstractAction {

    public final Class listViewClass;
    private final Object id;

    public MDDOpenListViewAction(String name, Class listViewClass) {
        this(name, listViewClass, null);
    }

    public MDDOpenListViewAction(String name, Class listViewClass, Object id) {
        super(name);
        this.listViewClass = listViewClass;
        this.id = id;
    }

}
