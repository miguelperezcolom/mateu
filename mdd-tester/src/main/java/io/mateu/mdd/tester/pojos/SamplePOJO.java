package io.mateu.mdd.tester.pojos;


import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.util.Helper;
import lombok.Getter;
import lombok.Setter;

import java.io.IOException;
import java.util.Date;

@Getter@Setter
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


    @Action(name = "Set date")
    public void test1() {
        System.out.println("test1");
        setName("" + new Date());
    }

    @Action(name = "Serialize")
    public String test2() throws IOException {
        System.out.println("test2");
        return Helper.toJson(this);
    }

    @Action(name = "Serialize w/params")
    public String test3(String s) throws IOException {
        System.out.println("test3 " + s);
        return Helper.toJson(this) + "<br><br>" + s;
    }
}
