package io.mateu.core.domain.uidefinition.core.interfaces;

import java.lang.reflect.Method;
import java.util.List;

public interface HasActions {

  List<Method> getActionMethods();
}
