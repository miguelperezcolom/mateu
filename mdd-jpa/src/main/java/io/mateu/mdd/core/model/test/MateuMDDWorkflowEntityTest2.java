package io.mateu.mdd.core.model.test;

import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.workflow.WorkflowEngine;
import lombok.MateuMDDEntity;

import javax.persistence.PostPersist;
import javax.persistence.PostUpdate;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class MateuMDDWorkflowEntityTest2 {

    @NotNull
    private String name;

    private String kpi;

    public MateuMDDWorkflowEntityTest2(@NotNull String name) {
        this.name = name;
    }

    @PostPersist@PostUpdate
    public void post() {

        TestLog.add("2.post()");

        if (kpi == null || !kpi.equals(name)) WorkflowEngine.add(() -> {
            Helper.transact(em -> {
                TestLog.add("2.task.transact()");
                em.persist(new MateuMDDWorkflowEntityTest1("Hola"));
            });
        });

    }

}
