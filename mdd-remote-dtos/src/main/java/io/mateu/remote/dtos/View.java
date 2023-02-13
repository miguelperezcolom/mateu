package io.mateu.remote.dtos;

import lombok.Data;

import java.util.Map;

@Data
public class View {

    private ViewMetadata metadata;

    private Map<String, Object> data;

}
