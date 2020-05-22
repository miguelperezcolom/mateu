package io.mateu.mdd.tester.app.pra;

import lombok.MateuMDDEntity;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@MateuMDDEntity
public class Fruit {

    @NotNull
    private String name;

    private LocalDate issueDate;

    private boolean active;

}
