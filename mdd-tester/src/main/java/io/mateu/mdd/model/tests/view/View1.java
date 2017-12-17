package io.mateu.mdd.model.tests.view;

import io.mateu.ui.core.shared.UserData;
import io.mateu.ui.mdd.server.annotations.Action;
import io.mateu.ui.mdd.server.interfaces.Filtered;
import io.mateu.ui.mdd.server.interfaces.View;

import javax.persistence.EntityManager;

public class View1 implements View<Booking>, Filtered {

    @Override
    public String getFields() {
        return "leadname, cost, sale";
    }

    @Override
    public String getParams() {
        return "leadname";
    }

    @Override
    public String getCols() {
        return "id, leadname, cost, sale";
    }

    @Override
    public String getOrderCriteria() {
        return null;
    }


    @Action(name = "test 1")
    public static void test1() {
        System.out.println("test 1!!!");
    }



    @Action(name = "test 2")
    public void test2() {
        System.out.println("test 2!!!");
    }


    @Action(name = "test 3")
    public void test3(Booking b) {
        System.out.println("test 3!!!" + b.getLeadName());
    }

    @Override
    public String getAdditionalCriteria(EntityManager em, UserData user) {
        return "x.user = '" + user.getLogin() + "'";
    }

}
