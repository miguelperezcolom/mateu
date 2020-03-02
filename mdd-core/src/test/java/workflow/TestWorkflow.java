package workflow;

import io.mateu.mdd.core.model.test.MateuMDDWorkflowEntityTest1;
import io.mateu.mdd.core.model.test.MateuMDDWorkflowEntityTest2;
import io.mateu.mdd.core.model.test.TestLog;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import org.junit.Assert;
import org.junit.Test;

import java.util.stream.Collectors;

import static org.junit.Assert.assertEquals;

public class TestWorkflow {

    @Test
    public void test1() {

        TestLog.clear();

        try {
            Helper.transact(em -> em.persist(new MateuMDDWorkflowEntityTest1("Mateu")));
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        WorkflowEngine.shutdown();

        String l;
        System.out.println(l = TestLog.get().stream().collect(Collectors.joining(",")));

        assertEquals("post(),task.run(),task.transact(),post()", l);
    }



    @Test
    public void test2() {

        TestLog.clear();

        try {
            Helper.transact(em -> em.persist(new MateuMDDWorkflowEntityTest1("Mateu")));
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Helper.transact(em -> em.persist(new MateuMDDWorkflowEntityTest1("Mateu")));
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        WorkflowEngine.shutdown();

        String l;
        System.out.println(l = TestLog.get().stream().collect(Collectors.joining(",")));

        assertEquals("post(),task.run(),task.transact(),post(),post(),task.run(),task.transact(),post()", l);
    }


    @Test
    public void test3() {

        TestLog.clear();

        MateuMDDWorkflowEntityTest1 e = new MateuMDDWorkflowEntityTest1("Mateu");

        try {
            Helper.transact(em -> em.persist(e));
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Helper.transact(em -> em.find(MateuMDDWorkflowEntityTest1.class, e.getId()).setName("aaaaa"));
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        WorkflowEngine.shutdown();

        String l;
        System.out.println(l = TestLog.get().stream().collect(Collectors.joining(",")));

        assertEquals("post(),task.run(),task.transact(),post(),post(),task.run(),task.transact(),post()", l);
    }


    @Test
    public void test4() {

        TestLog.clear();

        MateuMDDWorkflowEntityTest1 e = new MateuMDDWorkflowEntityTest1("xxx");

        try {
            Helper.transact(em -> em.persist(e), () -> {
                TestLog.add("callback()");
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        String l;
        System.out.println(l = TestLog.get().stream().collect(Collectors.joining(",")));

        assertEquals("post()", l);

        WorkflowEngine.shutdown();

        try {
            Thread.sleep(2000);
        } catch (InterruptedException ex) {
            ex.printStackTrace();
        }

        System.out.println(l = TestLog.get().stream().collect(Collectors.joining(",")));

        assertEquals("post(),task.run(),task.sleep(),task.transact(),post(),callback()", l);
    }


    @Test
    public void test5() {

        TestLog.clear();

        MateuMDDWorkflowEntityTest2 e = new MateuMDDWorkflowEntityTest2("xxx");

        try {
            Helper.transact(em -> em.persist(e), () -> {
                TestLog.add("callback()");
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        String l;
        System.out.println(l = TestLog.get().stream().collect(Collectors.joining(",")));

        assertEquals("2.post()", l);

        WorkflowEngine.shutdown();

        System.out.println(l = TestLog.get().stream().collect(Collectors.joining(",")));

        assertEquals("2.post(),2.task.transact(),post(),task.run(),task.transact(),post(),callback()", l);
    }


}
