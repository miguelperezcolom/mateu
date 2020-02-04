package io.mateu.mdd.core.app;


public class MDDOpenListViewAction extends AbstractAction {

    private final Class listViewClass;
    private final Object id;
    private boolean modifierPressed;

    public MDDOpenListViewAction(String name, Class listViewClass) {
        this(name, listViewClass, null, false);
    }

    public MDDOpenListViewAction(String name, Class listViewClass, Object id, boolean modifierPressed) {
        super(name);
        this.listViewClass = listViewClass;
        this.id = id;
        this.modifierPressed = modifierPressed;
    }

    @Override
    public void run(MDDExecutionContext context) throws Exception {
        context.openListView(this, listViewClass, modifierPressed);
    }
}
