package io.mateu.mdd.core.app;


public class MDDOpenListViewAction extends AbstractAction {

    private final Class listViewClass;
    private final Object selectedId;

    public MDDOpenListViewAction(String name, Class listViewClass) {
        this(name, listViewClass, null);
    }

    public MDDOpenListViewAction(String name, Class listViewClass, Object selectedId) {
        super(name);
        this.listViewClass = listViewClass;
        this.selectedId = selectedId;
    }

    public Class getListViewClass() {
        return listViewClass;
    }

    public Object getSelectedId() {
        return selectedId;
    }
}
