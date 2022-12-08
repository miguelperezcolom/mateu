package com.example.demo.crud1;

import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.FieldGroup;
import io.mateu.mdd.shared.annotations.Ignored;
import io.mateu.mdd.shared.annotations.Section;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import java.io.IOException;
import java.util.List;

@Getter@Setter
public class ReadOnlyPersona implements ReadOnlyPojo {

    @Ignored
    private Fila row;

    @Override
    public Object getEditor() {
        return new Editor(row);
    }

    private String nombre;

    @Max(message = "Hola caracola", value = 70)
    private int edad;

    @FieldGroup("Más campos")
    private String nombre2;

    @Max(message = "Hola caracola", value = 70)
    private int edad2;

    private Representante representante;

    private List<Direccion> direcciones;

    @Section("S1")
    private String nombre3;

    @Min(value = 70)
    private int edad3;

    @Section("S2")
    @FieldGroup("G2")
    private String nombre4;

    private int edad4;

    public ReadOnlyPersona() {

    }

    public ReadOnlyPersona(Fila row) {
        this.row = row;
        nombre = row.getNombre();
        edad = row.getEdad();
    }

    @Override
    public void load(Object id) throws Throwable {

    }

    public void delete() throws Throwable {

    }

    @Override
    public Object getId() {
        return nombre;
    }

    @Override
    public String toString() {
        return nombre;
    }

    @Override
    public String getEntityName() {
        return "Persona";
    }

    @Action
    public void unaAction() {
        System.out.println("hola!");
    }
}
