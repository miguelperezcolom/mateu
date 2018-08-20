package io.mateu.mdd.core.app;


import io.mateu.mdd.core.reflection.ReflectionHelper;

import java.lang.reflect.Method;
import java.util.function.Consumer;

public class MDDCallMethodAction extends AbstractAction {

    private final Method method;

    public MDDCallMethodAction(String name, Consumer methodReference) {
        super(name);
        method = ReflectionHelper.getMethod(methodReference);
    }

    public MDDCallMethodAction(String name, Class type, String methodName) {
        super(name);
        this.method = ReflectionHelper.getMethod(type, methodName);
    }


    @Override
    public void run(MDDExecutionContext context) {
        context.callMethod(this, method, null);
    }
}
