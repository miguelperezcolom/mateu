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
    int level,
    boolean readOnly,
    String subtitle,
    StatusDto status,
    List<BreadcrumbDto> breadcrumbs,
    List<BadgeDto> badges,
    List<KPIDto> kpis,
    List<BannerDto> banners,
    List<ActionDto> actions,
    List<ButtonDto> toolbar,
    List<ButtonDto> buttons,
    ComponentDto avatar,
    List<ComponentDto> header,
    List<ComponentDto> footer,
    List<FabDto> fabs,
    Boolean toc,
    /**
     * Lateral navigation across peer objects — the previous/next arrows in the page header (the
     * Oracle Redwood "next/previous object" element). {@code null} when the page supplies none.
     */
    PeerNavDto peerNav,
    /**
     * The page's "last updated" timestamp shown in the header (the Oracle Redwood timestamp header
     * element), from a {@code @Timestamp} field; {@code null} when the page declares none.
     */
    String timestamp,
    /**
     * How the page's content column is sized within the viewport (the first parameter of the Oracle
     * Redwood page templates): {@code "fixed"} (capped, centered column), {@code "fullWidth"}
     * (fluid with side margins, uncapped) or {@code "edgeToEdge"} (content touches the viewport
     * edges). {@code null} = the renderer infers it from the page content.
     */
    String pageWidth,
    /**
     * The page's coarse template type (the Oracle Redwood page-template families): {@code
     * "landing"}, {@code "collection"}, {@code "detail"}, {@code "form"}, {@code "process"} or
     * {@code "dashboard"} — inferred from the ModelView's shape unless declared with
     * {@code @PageTemplate}.
     */
    String pageType)
    implements ComponentMetadataDto {}
