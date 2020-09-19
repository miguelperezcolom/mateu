package io.mateu;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Slf4j@Getter
public class Limpia {

    private String nombre;

    public void test() {
        getNombre().toLowerCase();
    }

}
