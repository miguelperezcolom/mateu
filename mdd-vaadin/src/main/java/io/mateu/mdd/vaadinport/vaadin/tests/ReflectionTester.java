package io.mateu.mdd.vaadinport.vaadin.tests;

import io.mateu.mdd.core.interfaces.AbstractJPQLListView;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.tester.model.jpql.SampleJPQLLIstView;
import io.mateu.mdd.tester.model.rpc.SampleRPCListView;
import io.mateu.mdd.tester.model.rpc.SampleRPCToJPAListView;
import io.mateu.mdd.vaadinport.vaadin.tests.reflection.MiJPQLListViewCaso1;
import io.mateu.mdd.vaadinport.vaadin.tests.reflection.MiJPQLListViewCaso2;

public class ReflectionTester {

    public static void main(String[] args) {
        test1();
    }

    private static void test1() {

        System.out.println(ReflectionHelper.getGenericClass(SampleJPQLLIstView.class, AbstractJPQLListView.class, "R"));

        System.out.println(ReflectionHelper.getGenericClass(MiJPQLListViewCaso1.class, AbstractJPQLListView.class, "R"));

        System.out.println(ReflectionHelper.getGenericClass(MiJPQLListViewCaso2.class, AbstractJPQLListView.class, "R"));

        System.out.println(ReflectionHelper.getGenericClass(SampleJPQLLIstView.class, RpcView.class, "C"));

        System.out.println(ReflectionHelper.getGenericClass(SampleRPCListView.class, RpcView.class, "C"));

        System.out.println(ReflectionHelper.getGenericClass(SampleRPCToJPAListView.class, RpcView.class, "C"));

    }

}
