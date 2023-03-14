package com.example.demo.crud1;

import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.Status;
import io.mateu.mdd.shared.data.StatusType;
import io.mateu.mdd.shared.interfaces.HasStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import javax.validation.constraints.Max;

@Getter@Setter@Slf4j
public class ReadOnlyIntermediary implements ReadOnlyPojo, HasStatus {

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

    @Section("S2")
    @FieldGroup("G2")
    private Crud2 salesAgents;

    public Status getStatus() {
        return new Status(StatusType.DANGER, "gagagagga");
    }

    public ReadOnlyIntermediary() {

    }

    public ReadOnlyIntermediary(Fila row) {
        this.row = row;
        nombre = row.getNombre();
        edad = row.getEdad();
    }

    @Override
    public void load(Object id) throws Throwable {
        nombre = (String) id;
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
        log.info("hola!");
    }
}
