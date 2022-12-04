package com.example.demo.crud1;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data@AllArgsConstructor
public class Fila {

    private String nombre;

    private int edad;

    @Override
    public String toString() {
        return nombre;
    }

}
