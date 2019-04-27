package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class CRUDViewComponent extends AbstractViewComponent implements ListViewComponentListener {

    private final ListViewComponent listViewComponent;
    private final EditorViewComponent editorViewComponent;
    private MenuEntry originatingAction;

    public CRUDViewComponent(ListViewComponent listViewComponent, EditorViewComponent editorViewComponent) {


        this.listViewComponent = listViewComponent;
        this.editorViewComponent = editorViewComponent;

        editorViewComponent.setListViewComponent(listViewComponent);

        listViewComponent.addListener(this);

    }

    public CRUDViewComponent build() {
        addStyleName("crudviewcomponent");


        addComponentsAndExpand(getListViewComponent());


        return this;
    }

    @Override
    public void onEdit(Object id) {
        try {
            MDDUI.get().getNavegador().go(listViewComponent.getPathForEditor(id));
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }

    @Override
    public void onSelect(Object id) {
        // do nothing
    }

    @Override
    public String toString() {
        return listViewComponent.toString();
    }


    public ListViewComponent getListViewComponent() {
        return listViewComponent;
    }

    public EditorViewComponent getEditorViewComponent() {
        return editorViewComponent;
    }

}
