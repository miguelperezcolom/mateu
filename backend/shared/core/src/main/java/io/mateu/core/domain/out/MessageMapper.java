package io.mateu.core.domain.out;

import io.mateu.dtos.BannerDto;
import io.mateu.dtos.BannerThemeDto;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.NotificationPositionDto;
import io.mateu.dtos.NotificationVariantDto;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.data.PageBanners;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Collection;
import java.util.List;

public class MessageMapper {

  public static List<BannerDto> mapToBannerDtos(
      Object instance, String baseUrl, HttpRequest httpRequest) {
    if (instance instanceof PageBanners pageBanners) {
      return pageBanners.banners().stream().map(MessageMapper::mapBanner).toList();
    }
    if (instance instanceof PageBanner banner) {
      return List.of(mapBanner(banner));
    }
    if (instance instanceof Collection<?> collection) {
      // a PageBanners travels inside a list too (the new state AND appended banners, in one
      // answer): it used to be dropped there, banners and append flag both
      return collection.stream()
          .flatMap(
              o ->
                  o instanceof PageBanners pageBanners
                      ? pageBanners.banners().stream()
                      : o instanceof PageBanner banner
                          ? java.util.stream.Stream.of(banner)
                          : java.util.stream.Stream.empty())
          .map(MessageMapper::mapBanner)
          .toList();
    }
    return List.of();
  }

  public static boolean mapToAppendBanners(Object instance) {
    if (instance instanceof PageBanners pageBanners) {
      return pageBanners.append();
    }
    if (instance instanceof Collection<?> collection) {
      return collection.stream().anyMatch(o -> o instanceof PageBanners b && b.append());
    }
    return false;
  }

  private static BannerDto mapBanner(PageBanner banner) {
    BannerThemeDto theme = BannerThemeDto.NONE;
    if (banner.theme() != null) {
      try {
        theme = BannerThemeDto.valueOf(banner.theme().name());
      } catch (IllegalArgumentException ignored) {
      }
    }
    return new BannerDto(
        theme,
        false,
        banner.closeable(),
        banner.title(),
        banner.description(),
        banner.timeoutSeconds());
  }

  public static List<MessageDto> mapToMessageDtos(
      Object instance, String baseUrl, HttpRequest httpRequest) {
    if (instance instanceof Message message) {
      return List.of(mapMessage(message));
    }
    if (instance instanceof Collection<?> collection) {
      return collection.stream()
          .filter(o -> o instanceof Message)
          .map(message -> mapMessage((Message) message))
          .toList();
    }
    return List.of();
  }

  private static MessageDto mapMessage(Message message) {
    return MessageDto.builder()
        .variant(
            message.variant() != null
                ? NotificationVariantDto.valueOf(message.variant().name())
                : null)
        .position(
            message.position() != null
                ? NotificationPositionDto.valueOf(message.position().name())
                : null)
        .title(message.title())
        .text(message.text())
        // an ERROR stays until dismissed — in every backend and renderer (owner, 2026-10-12): read
        // in 3 s and gone, the user often never saw why the save failed
        .duration(
            persistenceOf(message) == io.mateu.dtos.MessagePersistenceDto.sticky
                ? 0
                : message.duration() > 0 ? message.duration() : 3000)
        .undoLabel(message.undoLabel())
        .undoActionId(message.undoActionId())
        .undoParameters(message.undoParameters())
        .persistence(persistenceOf(message))
        .actions(actionsOf(message))
        .key(message.key())
        .build();
  }

  /** As declared; else an error is sticky (see the duration) and anything else a toast. */
  static io.mateu.dtos.MessagePersistenceDto persistenceOf(Message message) {
    if (message.persistence() != null) {
      return io.mateu.dtos.MessagePersistenceDto.valueOf(message.persistence().name());
    }
    return message.variant() == io.mateu.uidl.data.NotificationVariant.error
        ? io.mateu.dtos.MessagePersistenceDto.sticky
        : io.mateu.dtos.MessagePersistenceDto.toast;
  }

  /**
   * The declared actions; an undo set only through the legacy {@code undo*} fields becomes one of
   * them (style undo), so a renderer reads one list.
   */
  static List<io.mateu.dtos.MessageActionDto> actionsOf(Message message) {
    var actions =
        new java.util.ArrayList<>(
            message.actions().stream().map(io.mateu.uidl.data.LongTask::toDto).toList());
    var undoListed =
        message.actions().stream()
            .anyMatch(
                a -> message.undoActionId() != null && message.undoActionId().equals(a.actionId()));
    if (message.undoActionId() != null && !undoListed) {
      actions.add(
          new io.mateu.dtos.MessageActionDto(
              message.undoLabel(),
              message.undoActionId(),
              message.undoParameters(),
              null,
              Message.STYLE_UNDO));
    }
    return actions;
  }
}
