package io.mateu.mdd.core.app;


import io.mateu.reflection.ReflectionHelper;

import java.util.function.Supplier;

public class MDDOpenEditorAction extends AbstractAction {

    private final Object bean;
    private final Class viewClass;
    private final Object beanId;
    private final Supplier<Object> supplier;

    public MDDOpenEditorAction(String name, Class viewClass) {
        this(name, viewClass, null);
    }

    public MDDOpenEditorAction(String name, Class viewClass, Object beanId) {
        super(name);
        this.viewClass = viewClass;
        this.beanId = beanId;
        this.bean = null;
        this.supplier = null;
    }

    public MDDOpenEditorAction(String name, Object bean) {
        super(name);
        this.viewClass = bean != null?bean.getClass():null;
        this.beanId = bean != null?ReflectionHelper.getId(bean):null;
        this.bean = bean;
        this.supplier = null;
    }

    public MDDOpenEditorAction(String name, Supplier<Object> supplier) {
        super(name);
        this.viewClass = null;
        this.beanId = null;
        this.bean = null;
        this.supplier = supplier;
    }

    public Class getViewClass() {
        return supplier != null?supplier.get().getClass():viewClass;
    }

    public Object getBean() {
        return supplier != null?supplier.get():bean;
    }

    public Object getBeanId() {
        return supplier != null?ReflectionHelper.getId(supplier.get()):beanId;
    }
}
