package io.mateu.mdd.core.app;


import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class MDDOpenListViewAction extends AbstractAction {

    private final Class listViewClass;
    private final Object id;

    public MDDOpenListViewAction(String name, Class listViewClass) {
        this(name, listViewClass, null);
    }

    public MDDOpenListViewAction(String name, Class listViewClass, Object id) {
        super(name);
        this.listViewClass = listViewClass;
        this.id = id;
    }

    @Override
    public void run() throws Exception {
        MDDUI.get().getNavegador().getViewProvider().openListView(this, listViewClass);
    }
}
