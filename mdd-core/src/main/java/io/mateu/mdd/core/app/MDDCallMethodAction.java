package io.mateu.mdd.core.app;


public class MDDCallMethodAction extends AbstractAction {

    private final Class entityClass;
    private final String methodName;

    public MDDCallMethodAction(String name, Class entityClass, String methodName) {
        super(name);
        this.entityClass = entityClass;
        this.methodName = methodName;
    }


    @Override
    public void run(MDDExecutionContext context) {
        context.callMethod(this, entityClass, methodName);
    }
}
