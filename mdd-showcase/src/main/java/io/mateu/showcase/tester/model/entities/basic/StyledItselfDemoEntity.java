package io.mateu.showcase.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.Action;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import java.util.Arrays;
import java.util.List;

@MateuMDDEntity
@Slf4j
public class StyledItselfDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    private String stringField = "zzzz";

    private int value;

    private String visibleWhenLessThan10 = "visible when value is lower than 10";

    transient String visibleWhenMoreThan10 = "visible when value is greater than 10";

    private String aux;

    @Action
    public void myAction() {
        log.debug("my action called");
    }







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
