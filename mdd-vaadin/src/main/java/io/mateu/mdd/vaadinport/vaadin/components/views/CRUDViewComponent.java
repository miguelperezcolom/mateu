package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.google.common.base.Strings;
import com.vaadin.ui.*;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.vaadinport.vaadin.MyUI;

import javax.persistence.EntityManager;

public class CRUDViewComponent extends HorizontalLayout implements ListViewComponentListener, ViewComponent {

    private final ListViewComponent listViewComponent;
    private final EditorViewComponent editorViewComponent;
    private AbstractAction originatingAction;

    public CRUDViewComponent(ListViewComponent listViewComponent, EditorViewComponent editorViewComponent) {


        this.listViewComponent = listViewComponent;
        this.editorViewComponent = editorViewComponent;

        listViewComponent.addListener(this);


    }

    public CRUDViewComponent build() {

        addStyleName("crudviewcomponent");

        addComponentsAndExpand(listViewComponent);
        addComponentsAndExpand(editorViewComponent);

        return this;
    }

    @Override
    public void onEdit(Object id) {
        try {
            ((MyUI)UI.getCurrent()).goTo(listViewComponent.getPathForEditor(id));
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }

    public void showList() {
        /*
        if (getComponentIndex(editorViewComponent) >= 0) removeComponent(editorViewComponent);
        if (getComponentIndex(listViewComponent) < 0) addComponentsAndExpand(listViewComponent);
        */
        setExpandRatio(editorViewComponent, 0);
        setExpandRatio(listViewComponent, 1);

        UI.getCurrent().getPage().setTitle((listViewComponent.getViewTitle() != null)?listViewComponent.getViewTitle():"No title");
    }

    public void showEditor() {
        /*
        if (getComponentIndex(listViewComponent) >= 0) removeComponent(listViewComponent);
        if (getComponentIndex(editorViewComponent) < 0) addComponentsAndExpand(editorViewComponent);
        */
        setExpandRatio(editorViewComponent, 1);
        setExpandRatio(listViewComponent, 0);

        UI.getCurrent().getPage().setTitle((editorViewComponent.getViewTitle() != null)?editorViewComponent.getViewTitle():"No title");
    }

    public void loadInEditor(String sid) throws Throwable {
        if (Strings.isNullOrEmpty(sid) || "add".equalsIgnoreCase(sid)) {
            editorViewComponent.load(null);
        } else {
            editorViewComponent.load(listViewComponent.deserializeId(sid));
        }
        showEditor();
    }

    @Override
    public void setOriginatingAction(AbstractAction action) {
        this.originatingAction = action;
        listViewComponent.setOriginatingAction(action);
        editorViewComponent.setOriginatingAction(action);
    }
}
