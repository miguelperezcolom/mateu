package io.mateu.uidl.security;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * The signed-in user as the app's header shows them: the user menu (avatar or initials, the name,
 * and Sign out inside it). Display only — never an input to access control, which reads {@link
 * CallerIdentity}.
 *
 * @param name the name to show (never blank)
 * @param email the e-mail address, or null
 * @param picture an http(s) URL of the user's picture, or null (initials are drawn instead)
 */
@Experimental
@Builder
public record UserProfile(String name, String email, String picture) {

  public UserProfile {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("A user profile needs a name to show");
    }
    email = email == null || email.isBlank() ? null : email;
    picture = picture == null || picture.isBlank() ? null : picture;
  }

  /** A user known by name only. */
  public static UserProfile named(String name) {
    return new UserProfile(name, null, null);
  }
}
