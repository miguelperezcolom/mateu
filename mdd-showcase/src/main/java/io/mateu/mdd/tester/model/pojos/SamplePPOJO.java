package io.mateu.mdd.tester.model.pojos;


import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.interfaces.PersistentPOJO;
import io.mateu.mdd.util.Helper;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Date;

@Getter@Setter@Slf4j
public class SamplePPOJO implements PersistentPOJO {

    private String name;

    private int age;



    @Action(value = "Set date")
    public void test1() {
        log.debug("test1");
        setName("" + new Date());
    }

    @Action(value = "Serialize")
    public String test2() throws IOException {
        log.debug("test2");
        return Helper.toJson(this);
    }

    @Action(value = "Serialize w/params")
    public String test3(String s) throws IOException {
        log.debug("test3 " + s);
        return Helper.toJson(this) + "<br><br>" + s;
    }

    @Override
    public void save() throws Throwable {
        log.debug("save(" + Helper.toJson(this) + ")");
    }

    @Override
    public void load(Object id) throws Throwable {
        log.debug("load(" + id + ")");
        setName("id = " + id);
    }

    @Override
    public Object getId() {
        return 3;
    }
}
