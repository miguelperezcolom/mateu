package io.mateu.mdd.tester.model.basic;

import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;

import java.util.ArrayList;
import java.util.List;

public class MyStylist extends AbstractStylist {
    @Override
    public List<String> style(FieldInterfaced field, Object model) {
        List<String> styles = new ArrayList<>();

        StyledDemoEntity m = (StyledDemoEntity) model;

        if (m != null) {

            if ("visibleWhenLessThan10".equals(field.getName()) && m.getValue() > 10) {
                styles.add("hidden");
            } else if ("visibleWhenMoreThan10".equals(field.getName()) && m.getValue() <= 10) {
                styles.add("hidden");
            }

        }


        return styles;
    }
}
