package io.mateu.mdd.test.model;

import lombok.MateuMDDEntity;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.time.LocalDateTime;

@MateuMDDEntity
public class Tarea {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name = "Tarea creada " + LocalDateTime.now();

}
