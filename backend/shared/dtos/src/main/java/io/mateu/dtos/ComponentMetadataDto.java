package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/** Parent interface for all component metadata types */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = FormDto.class, name = "Form"),
  @JsonSubTypes.Type(value = AppDto.class, name = "App"),
  @JsonSubTypes.Type(value = CrudlDto.class, name = "Crud"),
  @JsonSubTypes.Type(value = ResultDto.class, name = "Result"),
  @JsonSubTypes.Type(value = MicroFrontendDto.class, name = "MicroFrontend"),
  @JsonSubTypes.Type(value = CardDto.class, name = "Card"),
  @JsonSubTypes.Type(value = DirectoryDto.class, name = "Directory"),
  @JsonSubTypes.Type(value = StepperDto.class, name = "Stepper"),
  @JsonSubTypes.Type(value = HorizontalLayoutDto.class, name = "HorizontalLayout"),
  @JsonSubTypes.Type(value = VerticalLayoutDto.class, name = "VerticalLayout"),
  @JsonSubTypes.Type(value = SplitLayoutDto.class, name = "SplitLayout"),
  @JsonSubTypes.Type(value = MasterDetailLayoutDto.class, name = "MasterDetailLayout"),
  @JsonSubTypes.Type(value = TabLayoutDto.class, name = "TabLayout"),
  @JsonSubTypes.Type(value = TabDto.class, name = "Tab"),
  @JsonSubTypes.Type(value = AccordionLayoutDto.class, name = "AccordionLayout"),
  @JsonSubTypes.Type(value = AccordionPanelDto.class, name = "AccordionPanel"),
  @JsonSubTypes.Type(value = FormLayoutDto.class, name = "FormLayout"),
  @JsonSubTypes.Type(value = ScrollerDto.class, name = "Scroller"),
  @JsonSubTypes.Type(value = FullWidthDto.class, name = "FullWidth"),
  @JsonSubTypes.Type(value = ContainerDto.class, name = "Container"),
  @JsonSubTypes.Type(value = ElementDto.class, name = "Element"),
  @JsonSubTypes.Type(value = FormFieldDto.class, name = "FormField"),
  @JsonSubTypes.Type(value = TextDto.class, name = "Text"),
  @JsonSubTypes.Type(value = AvatarDto.class, name = "Avatar"),
  @JsonSubTypes.Type(value = AvatarGroupDto.class, name = "AvatarGroup"),
  @JsonSubTypes.Type(value = BadgeDto.class, name = "Badge"),
  @JsonSubTypes.Type(value = AnchorDto.class, name = "Anchor"),
  @JsonSubTypes.Type(value = ButtonDto.class, name = "Button"),
  @JsonSubTypes.Type(value = ChartDto.class, name = "Chart"),
  @JsonSubTypes.Type(value = IconDto.class, name = "Icon"),
  @JsonSubTypes.Type(value = ConfirmDialogDto.class, name = "ConfirmDialog"),
  @JsonSubTypes.Type(value = ContextMenuDto.class, name = "ContextMenu"),
  @JsonSubTypes.Type(value = CookieConsentDto.class, name = "CookieConsent"),
  @JsonSubTypes.Type(value = DetailsDto.class, name = "Details"),
  @JsonSubTypes.Type(value = DialogDto.class, name = "Dialog"),
  @JsonSubTypes.Type(value = ImageDto.class, name = "Image"),
  @JsonSubTypes.Type(value = MapDto.class, name = "Map"),
  @JsonSubTypes.Type(value = MarkdownDto.class, name = "Markdown"),
  @JsonSubTypes.Type(value = NotificationDto.class, name = "Notification"),
  @JsonSubTypes.Type(value = ProgressBarDto.class, name = "ProgressBar"),
  @JsonSubTypes.Type(value = PopoverDto.class, name = "Popover"),
  @JsonSubTypes.Type(value = TooltipDto.class, name = "Tooltip"),
  @JsonSubTypes.Type(value = MessageInputDto.class, name = "MessageInput"),
  @JsonSubTypes.Type(value = MessageListDto.class, name = "MessageList"),
  @JsonSubTypes.Type(value = CustomFieldDto.class, name = "CustomField"),
  @JsonSubTypes.Type(value = MenuBarDto.class, name = "MenuBar"),
  @JsonSubTypes.Type(value = GridDto.class, name = "Grid"),
  @JsonSubTypes.Type(value = GridColumnDto.class, name = "GridColumn"),
  @JsonSubTypes.Type(value = VirtualListDto.class, name = "VirtualList")
})
public interface ComponentMetadataDto {}
