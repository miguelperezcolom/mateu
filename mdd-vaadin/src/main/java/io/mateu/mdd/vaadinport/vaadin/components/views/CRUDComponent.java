package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.ui.HorizontalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;

import javax.persistence.EntityManager;

public class CRUDComponent extends HorizontalLayout implements ListViewComponentListener {

    private final ListViewComponent listViewComponent;
    private final EditorViewComponent editorViewComponent;

    public CRUDComponent(ListViewComponent listViewComponent, EditorViewComponent editorViewComponent) {

        addStyleName("crudcomponent");

        this.listViewComponent = listViewComponent;
        this.editorViewComponent = editorViewComponent;

        listViewComponent.addListener(this);

        addComponent(listViewComponent);
        addComponent(editorViewComponent);

    }

    @Override
    public void onEdit(Object id) {
        try {
            editorViewComponent.load(id);
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }
}
