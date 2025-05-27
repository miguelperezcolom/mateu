package io.mateu.uidl.fluent;

import lombok.Builder;

@Builder
public record Page(String favicon, String pageTitle, String title, String subtitle) {}
