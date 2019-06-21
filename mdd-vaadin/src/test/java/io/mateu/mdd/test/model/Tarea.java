package io.mateu.mdd.test.model;

import io.mateu.mdd.core.workflow.WorkflowEngine;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity@Getter@Setter
public class Tarea {

    @Id@GeneratedValue
    private long id;

    private String nombre = "Tarea creada " + LocalDateTime.now();


    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (id > 0 && obj != null && obj instanceof Tarea && id == ((Tarea) obj).getId());
    }

}
