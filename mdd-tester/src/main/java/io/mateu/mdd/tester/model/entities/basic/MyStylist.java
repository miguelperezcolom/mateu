package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MyStylist extends AbstractStylist<StyledDemoEntity> {


    public List<String> getVisibleWhenLessThan10Styles(StyledDemoEntity model) {
        return Arrays.asList((model.getValue() >= 10)?"hidden":"");
    }

    public List<String> getVisibleWhenMoreThan10Styles(StyledDemoEntity model) {
        return Arrays.asList((model.getValue() <= 10)?"hidden":"");
    }


    public boolean isAuxVisible(StyledDemoEntity model) {
        return model.getValue() > 25;
    }

    public boolean isMyActionEnabled(StyledDemoEntity model) {
        return model.getValue() > 20;
    }

}
