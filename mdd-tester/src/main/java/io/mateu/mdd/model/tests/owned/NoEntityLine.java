package io.mateu.mdd.model.tests.owned;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter@Setter
public class NoEntityLine implements Serializable {

    private String descripcion;

    private int cantidad;

    private double importe;

    private boolean ivaIncluido;

}
