package io.mateu.remote.dtos;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class Field {

    private String id;

    private String type;

    private String caption;

    private String description;

    private List<Validation> validations = new ArrayList<>();


}
