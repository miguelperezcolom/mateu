package io.mateu.mdd.vaadinport.vaadin.tests;

import io.mateu.mdd.core.annotations.FullWidth;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotEmpty;

@Data
@Getter@Setter
public class Persona {

    @FullWidth
    @NotEmpty
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

    public Persona() {

    }

    public Persona(String nombre, String apellidos, int edad) {
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.edad = edad;
    }
}
