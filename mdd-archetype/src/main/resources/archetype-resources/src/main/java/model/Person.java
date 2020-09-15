package $

import lombok.MateuMDDEntity;

import javax.validation.constraints.NotNull;

{package}.model;

@MateuMDDEntity
public class Person {

    @NotNull
    private String name;

    private int age;

    private Gender gender;

}
