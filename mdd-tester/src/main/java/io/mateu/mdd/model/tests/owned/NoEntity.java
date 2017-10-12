package io.mateu.mdd.model.tests.owned;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Getter@Setter
public class NoEntity implements Serializable {

    private String texto;

    private int edad;

    private List<NoEntityLine> lineas = new ArrayList<>();

}
