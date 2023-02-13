package io.mateu.remote.dtos;

import lombok.Data;

import java.util.Map;

@Data
public class ActionData {

    Map<String, Object> data;

    Map<String, Object> args;

}
