package io.mateu.showcase.tester.model.pojos;


import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.util.Helper;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Date;

@Getter@Setter@Slf4j
public class SamplePOJO {

    private String name;

    private int a;

    private int b;

    @Output
    private int c;


    public void setA(int a) {
        this.a = a;
        multiply();
    }

    public void setB(int b) {
        this.b = b;
        multiply();
    }


    private void multiply() {
        setC(a * b);
    }


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
}
