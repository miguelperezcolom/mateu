package io.mateu.core.infra.declarative;

import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.Entity;
import io.mateu.uidl.interfaces.SimpleEntity;

public interface SimpleView<T extends SimpleEntity> extends Entity<String>,
        CrudEditorForm<String>,
        CrudCreationForm<String>
{

  String name();

}
