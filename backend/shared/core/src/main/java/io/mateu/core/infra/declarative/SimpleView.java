package io.mateu.core.infra.declarative;

import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.Entity;
import io.mateu.uidl.interfaces.Named;

public interface SimpleView<T extends Named>
    extends Entity<String>, CrudEditorForm<String>, CrudCreationForm<String> {

  String name();
}
