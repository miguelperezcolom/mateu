package io.mateu.mdd.test;

import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import io.mateu.mdd.test.model.Entidad;
import org.junit.Test;

import java.util.List;

import static junit.framework.TestCase.*;

public class WorkflowTest {


    @Test
    public void test() throws Throwable {

        Helper.transact(em -> {

            assertEquals(true, WorkflowEngine.isLocalRunnerActive());

            em.persist(new Entidad());

        });

        assertEquals(false, WorkflowEngine.isLocalRunnerActive());

        assertEquals(1, Helper.selectObjects("select x from Entidad x").size());

        assertEquals(1, Helper.selectObjects("select x from Evento x").size());

        assertEquals(1, Helper.selectObjects("select x from Tarea x").size());


        Entidad x = ((List<Entidad>)Helper.selectObjects("select x from Entidad x")).get(0);

        System.out.println(x.getId() + " - " + x.getTrigger() + " - " + x.getLog().size());

        assertEquals(1, ((List<Entidad>)Helper.selectObjects("select x from Entidad x")).get(0).getLog().size());


    }

}
