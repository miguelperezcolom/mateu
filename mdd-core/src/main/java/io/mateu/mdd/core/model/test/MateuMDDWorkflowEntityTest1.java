package io.mateu.mdd.core.model.test;

import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import lombok.MateuMDDEntity;

import javax.persistence.PostPersist;
import javax.persistence.PostUpdate;
import javax.validation.constraints.NotNull;
import java.util.Optional;

@MateuMDDEntity
public class MateuMDDWorkflowEntityTest1 {

    @NotNull
    private String name;

    private String kpi;

    public MateuMDDWorkflowEntityTest1(@NotNull String name) {
        this.name = name;
    }

    @PostPersist@PostUpdate
    public void post() {

        TestLog.add("post()");

        if (kpi == null || !kpi.equals(name)) WorkflowEngine.add(() -> {
            TestLog.add("task.run()");
            if ("xxx".equals(name)) {
                TestLog.add("task.sleep()");
                Thread.sleep(1000);
            }
            Helper.transact(em -> {
                TestLog.add("task.transact()");
                Optional.ofNullable(em.find(MateuMDDWorkflowEntityTest1.class, getId())).ifPresent(a -> a.kpi = a.name);
            });
        });

    }

}
