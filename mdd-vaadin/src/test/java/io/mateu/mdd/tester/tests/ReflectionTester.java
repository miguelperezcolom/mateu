package io.mateu.mdd.tester.tests;

import io.mateu.mdd.core.interfaces.AbstractJPQLListView;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.tester.model.jpql.SampleJPQLLIstView;
import io.mateu.mdd.tester.model.rpc.SampleRPCListView;
import io.mateu.mdd.tester.model.rpc.SampleRPCToJPAListView;
import io.mateu.mdd.tester.tests.reflection.MiJPQLListViewCaso1;
import io.mateu.mdd.tester.tests.reflection.MiJPQLListViewCaso2;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ReflectionTester {

    public static void main(String[] args) {
        test1();
    }

    private static void test1() {

        log.debug("" + ReflectionHelper.getGenericClass(SampleJPQLLIstView.class, AbstractJPQLListView.class, "R"));

        log.debug("" + ReflectionHelper.getGenericClass(MiJPQLListViewCaso1.class, AbstractJPQLListView.class, "R"));

        log.debug("" + ReflectionHelper.getGenericClass(MiJPQLListViewCaso2.class, AbstractJPQLListView.class, "R"));

        log.debug("" + ReflectionHelper.getGenericClass(SampleJPQLLIstView.class, RpcView.class, "C"));

        log.debug("" + ReflectionHelper.getGenericClass(SampleRPCListView.class, RpcView.class, "C"));

        log.debug("" + ReflectionHelper.getGenericClass(SampleRPCToJPAListView.class, RpcView.class, "C"));

    }

}
