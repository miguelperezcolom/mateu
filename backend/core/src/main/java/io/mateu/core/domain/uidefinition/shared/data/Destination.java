package io.mateu.core.domain.uidefinition.shared.data;

public record Destination(
        DestinationType type,
        String description,
        String value) {
}
