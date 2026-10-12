package io.mateu.dtos;

/** A live value on the app header ("Business date: 12 Oct"), addressed by {@code id}. */
public record HeaderValueDto(String id, String label, String value) {}
