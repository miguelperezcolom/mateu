package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.ui.Component;
import com.vaadin.ui.HorizontalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.vaadinport.vaadin.MyUI;

public class CRUDViewComponent extends HorizontalLayout implements ListViewComponentListener, ViewComponent {

    private final ListViewComponent listViewComponent;
    private final EditorViewComponent editorViewComponent;
    private MenuEntry originatingAction;

    public CRUDViewComponent(ListViewComponent listViewComponent, EditorViewComponent editorViewComponent) {


        this.listViewComponent = listViewComponent;
        this.editorViewComponent = editorViewComponent;

        listViewComponent.addListener(this);


    }

    public CRUDViewComponent build() {

        addStyleName("crudviewcomponent");

        return this;
    }

    @Override
    public void onEdit(Object id) {
        try {
            MyUI.get().getNavegador().go(listViewComponent.getPathForEditor(id));
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }

    @Override
    public String getViewTitle() {
        return listViewComponent.getViewTitle();
    }


    public ListViewComponent getListViewComponent() {
        return listViewComponent;
    }

    public EditorViewComponent getEditorViewComponent() {
        return editorViewComponent;
    }

    public Component getFiltersViewComponent() {
        return listViewComponent.getFiltersViewComponent();
    }

}
