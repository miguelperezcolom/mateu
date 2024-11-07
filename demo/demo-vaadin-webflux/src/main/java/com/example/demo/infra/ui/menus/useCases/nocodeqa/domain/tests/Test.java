package com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests;

import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.Status;
import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.ReadOnly;
import io.mateu.uidl.core.data.ResultType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
public abstract class Test {

  @Id String id = UUID.randomUUID().toString();

  @ManyToOne @NotNull TestProject project;

  String name;

  @io.mateu.uidl.core.annotations.Status
  Status status;

  @ReadOnly @io.mateu.uidl.core.annotations.Status
  Result lastResult;

  String comments;

  @Override
  public String toString() {
    return name;
  }

  @Action
  public static io.mateu.uidl.core.data.Result deployAndRun(
      // List<Test> selection
      ) {
    // System.out.println(selection);
    return new io.mateu.uidl.core.data.Result(
        "Deploy and run",
            ResultType.Success,
            "Tests have been deployed and scheduled for run",
            null,
            null,
            null,
            null);
  }
}
