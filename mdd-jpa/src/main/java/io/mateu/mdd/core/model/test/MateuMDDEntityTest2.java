package io.mateu.mdd.core.model.test;

import lombok.MateuMDDEntity;

@MateuMDDEntity
public class MateuMDDEntityTest2 {

    private final String name;

    public MateuMDDEntityTest2() {
        this.name = "";
    }

    public MateuMDDEntityTest2(String name) {
        this.name = name;
    }

    public static void main(String[] args) {
        System.out.println(new MateuMDDEntityTest2("aaaaaaaaa"));
        System.out.println(new MateuMDDEntityTest2());
    }

}
