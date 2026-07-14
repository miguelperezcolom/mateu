package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One card of a {@link Testimonials} block: a {@code quote}, an {@code author} with {@code role}
 * and {@code avatar} (emoji or image URL), and an optional {@code rating} of 0–5 stars.
 */
@Builder
public record Testimonial(String quote, String author, String role, String avatar, int rating) {}
