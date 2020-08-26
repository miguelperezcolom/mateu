package ${package}.model;

import javax.validation.constraints.NotNull;
import lombok.MateuMDDEntity;

@MateuMDDEntity
public class Person {

    @NotNull
    private String name;

    private int age;

    private Gender gender;

}
