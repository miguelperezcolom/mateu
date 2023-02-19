package io.mateu.remote.dtos;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Field {

    private String id;

    private String type;

    private String caption;

    private String description;

    private List<Validation> validations = new ArrayList<>();


}
