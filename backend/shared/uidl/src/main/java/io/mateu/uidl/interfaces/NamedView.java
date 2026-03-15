package io.mateu.uidl.interfaces;

public interface NamedView<T extends Identifiable>
    extends Identifiable,
        CrudEditorForm<String>,
        CrudCreationForm<String>,
        EditableFieldsProvider,
        StateSupplier {

  String name();

}
