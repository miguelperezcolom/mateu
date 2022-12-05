package io.mateu.mdd.vaadin.components.views;

import io.mateu.mdd.shared.reflection.FieldInterfaced;

public class RpcViewFieldViewComponent extends AbstractViewComponent {

    private final FieldInterfaced field;
    private final EditorViewComponent editorViewComponent;


    public RpcViewFieldViewComponent(FieldInterfaced field, EditorViewComponent editorViewComponent) {
        this.field = field;
        this.editorViewComponent = editorViewComponent;
    }

    public FieldInterfaced getField() {
        return field;
    }

    public EditorViewComponent getEditorViewComponent() {
        return editorViewComponent;
    }
}
