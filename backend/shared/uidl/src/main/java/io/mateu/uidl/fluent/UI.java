package io.mateu.uidl.fluent;

import lombok.Builder;

@Builder
public record UI(String favicon, String pageTitle, String homeRoute) {}
