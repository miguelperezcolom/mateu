package io.mateu.uidl.interfaces;

public interface NamedView<T extends Named>
    extends Named,
        CrudEditorForm<String>,
        CrudCreationForm<String>,
        EditableFieldsProvider,
        StateSupplier {

  String name();
}
