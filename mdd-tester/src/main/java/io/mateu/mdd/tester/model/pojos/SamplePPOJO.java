package io.mateu.mdd.tester.model.pojos;


import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.interfaces.PersistentPOJO;
import io.mateu.mdd.core.util.Helper;
import lombok.Getter;
import lombok.Setter;

import java.io.IOException;
import java.util.Date;

@Getter@Setter
public class SamplePPOJO implements PersistentPOJO {

    private String name;

    private int age;



    @Action(value = "Set date")
    public void test1() {
        System.out.println("test1");
        setName("" + new Date());
    }

    @Action(value = "Serialize")
    public String test2() throws IOException {
        System.out.println("test2");
        return Helper.toJson(this);
    }

    @Action(value = "Serialize w/params")
    public String test3(String s) throws IOException {
        System.out.println("test3 " + s);
        return Helper.toJson(this) + "<br><br>" + s;
    }

    @Override
    public void save() throws Throwable {
        System.out.println("save(" + Helper.toJson(this) + ")");
    }

    @Override
    public void load(Object id) throws Throwable {
        System.out.println("load(" + id + ")");
        setName("id = " + id);
    }

    @Override
    public Object getId() {
        return 3;
    }
}
