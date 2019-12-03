package io.mateu.mdd.core.model.test;

import lombok.MateuMDDEntity;

@MateuMDDEntity
public class MateuMDDEntityTest1 {

    private final String nombre;

    public static void main(String[] args) {
        System.out.println(new MateuMDDEntityTest1("aaaaaaaaa"));
        System.out.println(new MateuMDDEntityTest1());
    }

}
