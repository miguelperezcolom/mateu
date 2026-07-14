package io.mateu.dtos;

import lombok.Builder;

@Builder
public record TestimonialDto(String quote, String author, String role, String avatar, int rating) {}
