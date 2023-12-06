package io.mateu.mdd.core.app;

import java.lang.reflect.Method;

public class MDDCallMethodAction extends AbstractAction {

  public final Method method;
  public final Object instance;

  public MDDCallMethodAction(String name, Method method, Object instance) {
    super(name);
    this.method = method;
    this.instance = instance;
  }
}
