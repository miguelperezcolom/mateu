package io.mateu.remote.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Field {

    private String id;

    private String type;

    private String stereotype;

    private String caption;

    private String placeholder;

    private String classes;

    private String description;

    private List<Validation> validations = new ArrayList<>();

    private List<Pair> attributes = new ArrayList<>();

}
