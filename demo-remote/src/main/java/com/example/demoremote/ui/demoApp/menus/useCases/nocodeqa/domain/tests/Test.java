package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.Status;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.Status;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.steps.TestStep;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.ReadOnly;
import io.mateu.mdd.shared.data.ResultType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Getter@Setter
public abstract class Test {

    @Id
    String id = UUID.randomUUID().toString();

    @ManyToOne@NotNull
    TestProject project;

    String name;

    @io.mateu.mdd.shared.annotations.Status
    Status status;

    @ReadOnly
    @io.mateu.mdd.shared.annotations.Status
    Result lastResult;

    String comments;

    @Override
    public String toString() {
        return name;
    }

    @Action
    public static io.mateu.mdd.shared.data.Result deployAndRun(
            //List<Test> selection
    ) {
        //System.out.println(selection);
        return new io.mateu.mdd.shared.data.Result(ResultType.Success,
                "Tests have been deployed and scheduled for run", null, null);
    }

}
