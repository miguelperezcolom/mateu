package io.mateu;

import lombok.MateuMDDEntity;
import lombok.extern.slf4j.Slf4j;

@MateuMDDEntity
@Slf4j
public class Entidad {

    private String name;

    public void test() {
        new Limpia().getNombre().toLowerCase();
    }

}
