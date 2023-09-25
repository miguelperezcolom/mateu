package io.mateu.remote.dtos;

import java.util.Map;
import lombok.Data;

@Data
public class ActionData {

  Map<String, Object> data;

  Map<String, Object> args;
}
