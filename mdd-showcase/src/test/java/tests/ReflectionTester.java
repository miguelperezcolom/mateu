package tests;

import io.mateu.mdd.core.interfaces.AbstractJPQLListView;
import io.mateu.reflection.ReflectionHelper;
import lombok.extern.slf4j.Slf4j;
import tests.reflection.MiJPQLListViewCaso1;
import tests.reflection.MiJPQLListViewCaso2;

@Slf4j
public class ReflectionTester {

    public static void main(String[] args) {
        test1();
    }

    private static void test1() {

        log.debug("" + ReflectionHelper.getGenericClass(MiJPQLListViewCaso1.class, AbstractJPQLListView.class, "R"));

        log.debug("" + ReflectionHelper.getGenericClass(MiJPQLListViewCaso2.class, AbstractJPQLListView.class, "R"));

    }

}
