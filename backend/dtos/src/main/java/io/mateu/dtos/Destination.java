package io.mateu.dtos;

public record Destination(
        DestinationType type,
        String description,
        String value) {
}
