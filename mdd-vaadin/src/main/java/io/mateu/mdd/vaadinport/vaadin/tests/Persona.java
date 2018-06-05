package io.mateu.mdd.vaadinport.vaadin.tests;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter@Setter
public class Persona {

    private String nombre;

    private String apellidos;

    private int edad;

    private String nombreCompleto;

    transient String descripcion;


    public void setNombre(String nombre) {
        this.nombre = nombre;
        setNombreCompleto(nombre + " " + apellidos);
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
        setNombreCompleto(nombre + " " + apellidos);
    }

    public String getDescripcion() {
        return "" + nombre + " " + apellidos + " es una persona que tiene " + edad + " años.";
    }
}
