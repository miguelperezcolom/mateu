package io.mateu.showcase.tester.app.simpleCase;

import io.mateu.mdd.core.annotations.Action;

public class SubMenu {

    @Action
    public String option1() {
        return "Returned from option 1";
    }


    @Action
    public String option2() {
        return "Returned from option 2";
    }

}
