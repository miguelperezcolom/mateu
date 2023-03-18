package io.mateu.remote.dtos;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Column {

    private String id;

    private String type;

    private String stereotype;

    private String caption;

    private String description;

    private String width;

    private List<Pair> attributes = new ArrayList<>();

}
