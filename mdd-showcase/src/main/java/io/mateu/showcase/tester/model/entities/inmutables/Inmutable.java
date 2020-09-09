package io.mateu.showcase.tester.model.entities.inmutables;

import lombok.Getter;
import lombok.ToString;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@Entity@ToString
public class Inmutable {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)@Getter
    private long id;

    private final String nombre;

    private final int valor;

    private Inmutable() {
        nombre = null;
        valor = 0;
    }

    public Inmutable(String nombre, int valor) {
        this.nombre = nombre;
        this.valor = valor;
    }

}
