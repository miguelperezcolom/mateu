package io.mateu.mdd.core.interfaces;

import java.lang.reflect.Method;
import java.util.List;

public interface HasActions {

  List<Method> getActionMethods();
}
