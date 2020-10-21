package ${package}.model;

import lombok.MateuMDDEntity;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class Person {

    @NotNull
    private String name;

    private int age;

    private Gender gender;

}
