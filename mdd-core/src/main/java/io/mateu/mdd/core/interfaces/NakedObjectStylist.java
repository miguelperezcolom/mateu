package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;

import java.lang.reflect.Method;
import java.util.List;

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
