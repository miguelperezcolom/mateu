package io.mateu.mdd.tester.model.callMethods;

import io.mateu.mdd.core.annotations.Action;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Getter@Slf4j
public class POJO {

    private String name;

    private int age;

    public POJO(String name, int age) {
        this.name = name;
        this.age = age;
    }


    @Action
    public String someMethod() {

        log.debug("someMethod runs at server ;)");

        return "Done!";
    }


    @Override
    public String toString() {
        return "A read only pojo";
    }
}
