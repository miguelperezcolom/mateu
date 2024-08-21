package io.mateu.dtos;

import lombok.*;

public record Step(
    String id, String name, String type, View view, String previousStepId, String target) {}
