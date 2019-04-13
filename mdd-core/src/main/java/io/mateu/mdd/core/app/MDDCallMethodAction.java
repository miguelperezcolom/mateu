package io.mateu.mdd.core.app;


import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.reflection.ReflectionHelper;

import java.lang.reflect.Method;
import java.util.function.Consumer;

public class MDDCallMethodAction extends AbstractAction {

    private final Method method;
    private final String error;

    public MDDCallMethodAction(String name, Class type, String methodName) {
        super(name);
        this.method = ReflectionHelper.getMethod(type, methodName);
        this.error = (method == null)?"No method " + methodName + " in class " + type.getSimpleName():"";
    }


    @Override
    public void run(MDDExecutionContext context) {
        if (method == null) MDD.alert(error);
        else context.callMethod(getName(), method, null, null);
    }
}
