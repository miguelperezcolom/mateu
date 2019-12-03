package io.mateu.mdd.core.model.test;

import lombok.MateuMDDEntity;

@MateuMDDEntity
public class MateuMDDEntityTest2 {

    private final String nombre;

    public MateuMDDEntityTest2() {
        this.nombre = "";
    }

    public MateuMDDEntityTest2(String nombre) {
        this.nombre = nombre;
    }

    public static void main(String[] args) {
        System.out.println(new MateuMDDEntityTest2("aaaaaaaaa"));
        System.out.println(new MateuMDDEntityTest2());
    }

}
