package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/** Page metadata */
@Builder
public record PageDto(
    String id,
    String favicon,
    String pageTitle,
    String icon,
    String title,
    boolean readOnly,
    String subtitle,
    StatusDto status,
    List<BadgeDto> badges,
    List<KPIDto> kpis,
    List<BannerDto> banners,
    List<ActionDto> actions,
    List<ButtonDto> toolbar,
    List<ButtonDto> buttons,
    ComponentDto avatar,
    List<ComponentDto> header,
    List<ComponentDto> footer)
    implements ComponentMetadataDto {}
