package io.mateu.uidl.interfaces;

public interface SimpleEntityView<T extends SimpleEntity>
    extends SimpleEntity,
        CrudEditorForm<String>,
        CrudCreationForm<String>,
        EditableFieldsProvider,
        StateSupplier {

  String name();
}
