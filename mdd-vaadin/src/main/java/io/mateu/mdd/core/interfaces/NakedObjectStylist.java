package io.mateu.mdd.core.interfaces;

public class NakedObjectStylist extends AbstractStylist {


    private final Class modelType;

    public NakedObjectStylist(Class modelType) {
        super();
        this.modelType = modelType;
    }


    @Override
    public Class getStylistClass() {
        return modelType;
    }
}
