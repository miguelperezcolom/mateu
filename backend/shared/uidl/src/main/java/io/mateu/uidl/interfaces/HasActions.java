package io.mateu.uidl.interfaces;

import java.lang.reflect.Method;
import java.util.List;

public interface HasActions {

  List<Method> getActionMethods();
}
