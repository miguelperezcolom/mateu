package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.UserTrigger;
import java.util.Collection;

public interface ToolbarSupplier {

  Collection<UserTrigger> toolbar();
}
