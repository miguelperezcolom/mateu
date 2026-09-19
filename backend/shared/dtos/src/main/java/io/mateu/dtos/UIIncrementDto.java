package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.With;

/**
 * UI increment. Components to be added / replacements / actions to run
 *
 * @param commands List of command to run in the frontend
 * @param messages List of messages to be shown in the UI
 * @param fragments List of new UI fragments
 * @param wireVersion Version of the wire protocol this payload conforms to (e.g. "3.0"). Additive
 *     within a major version; a consumer may read it to guard against a mismatched producer.
 *     Defaults to {@link #WIRE_VERSION} when not set, so every response carries it.
 */
@Builder
@With
public record UIIncrementDto(
    List<UICommandDto> commands,
    List<MessageDto> messages,
    List<UIFragmentDto> fragments,
    List<BannerDto> banners,
    boolean appendBanners,
    Object appData,
    Object appState,
    String wireVersion) {

  /**
   * Current wire protocol version. Bumped only on a breaking (major) change to the wire; additions
   * within a major are backward compatible and do not change it.
   */
  public static final String WIRE_VERSION = "3.0";

  public UIIncrementDto {
    commands = Collections.unmodifiableList(commands != null ? commands : List.of());
    messages = Collections.unmodifiableList(messages != null ? messages : List.of());
    fragments = Collections.unmodifiableList(fragments != null ? fragments : List.of());
    banners = Collections.unmodifiableList(banners != null ? banners : List.of());
    wireVersion = wireVersion != null ? wireVersion : WIRE_VERSION;
  }

  @Override
  public List<MessageDto> messages() {
    return Collections.unmodifiableList(messages);
  }

  @Override
  public List<UICommandDto> commands() {
    return Collections.unmodifiableList(commands);
  }

  public List<UIFragmentDto> fragments() {
    return Collections.unmodifiableList(fragments);
  }
}
