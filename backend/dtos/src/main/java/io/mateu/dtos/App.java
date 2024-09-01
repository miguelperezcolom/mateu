package io.mateu.dtos;

/**
 * Apps in a multi app UI
 *
 * @param icon Icon for this app
 * @param name Name for this app
 * @param description Description for this app
 * @param url Url for this app
 * @param disabled If this app is disabled
 */
public record App(String icon, String name, String description, String url, boolean disabled) {}
