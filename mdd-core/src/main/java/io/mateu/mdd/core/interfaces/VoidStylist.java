package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.core.reflection.FieldInterfaced;

import java.util.List;

public class VoidStylist extends AbstractStylist {


    @Override
    public List<String> style(FieldInterfaced field, Object model) {
        return null;
    }

}
