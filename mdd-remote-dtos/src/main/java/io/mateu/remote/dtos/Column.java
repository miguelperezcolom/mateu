package io.mateu.remote.dtos;

import java.util.ArrayList;
import java.util.List;

public class Column {

    private String id;

    private String type;

    private String caption;

    private String description;

    private String width;

    private List<Pair> attributes = new ArrayList<>();

}
