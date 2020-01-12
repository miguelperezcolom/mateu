package io.mateu.mdd.core.model.test;

import lombok.MateuMDDEntity;

import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class MateuMDDEntityTest1 {

    @NotNull
    private final MateuMDDEntityTest2 name;

    private int age = 20;

    public static void main(String[] args) {
        System.out.println(new MateuMDDEntityTest1(new MateuMDDEntityTest2("aaaaaaaaa")));
        System.out.println(new MateuMDDEntityTest1());
    }

}
