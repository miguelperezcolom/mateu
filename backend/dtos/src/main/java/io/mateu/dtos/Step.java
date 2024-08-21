package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.*;

public record Step(
    String id,
    String name,
    String type,
    View view,
    String previousStepId,
    String target) {

}
