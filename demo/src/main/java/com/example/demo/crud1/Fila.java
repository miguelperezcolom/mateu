package com.example.demo.crud1;

import io.mateu.mdd.shared.annotations.Ignored;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Objects;
import java.util.UUID;

@Data@AllArgsConstructor
public class Fila {

    @Ignored
    private final String id = UUID.randomUUID().toString();

    private String nombre;

    private int edad;

    @Override
    public String toString() {
        return nombre;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Fila fila = (Fila) o;
        return Objects.equals(id, fila.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
