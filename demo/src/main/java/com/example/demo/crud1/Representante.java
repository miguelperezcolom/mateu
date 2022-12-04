package com.example.demo.crud1;

import lombok.Data;

import java.util.List;

@Data
public class Representante {

    private String nombre;

    private Direccion direccion;

    private List<Email> emails;

}
