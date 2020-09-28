package io.mateu.mdd.core.app;


public class MDDViewObject extends AbstractAction {

    public final Object o;

    public MDDViewObject(String name, Object o) {
        super(name);
        this.o = o;
    }

}
