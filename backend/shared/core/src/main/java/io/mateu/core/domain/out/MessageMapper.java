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
      return collection.stream()
          .filter(o -> o instanceof PageBanner)
          .map(o -> mapBanner((PageBanner) o))
          .toList();
    }
    return List.of();
  }

  public static boolean mapToAppendBanners(Object instance) {
    if (instance instanceof PageBanners pageBanners) {
      return pageBanners.append();
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
        .duration(message.duration() > 0 ? message.duration() : 3000)
        .undoLabel(message.undoLabel())
        .undoActionId(message.undoActionId())
        .undoParameters(message.undoParameters())
        .build();
  }
}
