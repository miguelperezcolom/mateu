package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Stylist;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Getter@Setter
@Stylist(MyStylist.class)
@Slf4j
public class StyledDemoEntity {

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

}
