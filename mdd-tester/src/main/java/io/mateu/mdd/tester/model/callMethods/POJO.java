package io.mateu.mdd.tester.model.callMethods;

import io.mateu.mdd.core.annotations.Action;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class POJO {

    private String name;

    private int age;

    public POJO(String name, int age) {
        this.name = name;
        this.age = age;
    }


    @Action
    public String someMethod() {

        System.out.println("someMethod runs at server ;)");

        return "Done!";
    }


}
