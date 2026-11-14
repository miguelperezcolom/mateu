package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * The signed-in user the app's header shows in its user menu: the name, and when known the e-mail
 * and an http(s) picture URL (initials are drawn without one). Display only.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserProfileDto(String name, String email, String picture) {}
