package io.mateu.core.domain.out.fragmentmapper;

import static io.mateu.core.domain.out.fragmentmapper.mappers.ConfirmDialogMapper.mapConfirmDialogToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ContextMenuMapper.mapContextMenuToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CookieConsentMapper.mapCookieConsentToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CustomFieldMapper.mapCustomFieldToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.DetailsMapper.mapDetailsToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.DialogMapper.mapDialogToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MessageInputMapper.mapMessageInputToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MessageListMapper.mapMessageListToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.NotificationMapper.mapNotificationToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.PopoverMapper.mapPopoverToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TooltipMapper.mapTooltipToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.HttpRequest;

final class OverlayComponentDispatcher {

  static ComponentDto dispatch(
      io.mateu.uidl.fluent.Component component,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (component instanceof ConfirmDialog confirmDialog) {
      return mapConfirmDialogToDto(
          confirmDialog, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof ContextMenu contextMenu) {
      return mapContextMenuToDto(
          contextMenu, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof CookieConsent cookieConsent) {
      return mapCookieConsentToDto(cookieConsent);
    }
    if (component instanceof Details details) {
      return mapDetailsToDto(
          details, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Dialog dialog) {
      return mapDialogToDto(
          dialog, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Notification notification) {
      return mapNotificationToDto(notification);
    }
    if (component instanceof Popover popover) {
      return mapPopoverToDto(
          popover, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Tooltip tooltip) {
      return mapTooltipToDto(
          tooltip, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof MessageInput messageInput) {
      return mapMessageInputToDto(messageInput);
    }
    if (component instanceof MessageList messageList) {
      return mapMessageListToDto(messageList);
    }
    if (component instanceof CustomField customField) {
      return mapCustomFieldToDto(
          customField, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    return null;
  }
}
