package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * Form metadata
 *
 * @param icon This form icon
 * @param title This form title
 * @param readOnly If this form is read only
 * @param subtitle This form subtitle
 * @param status This form status. This has a special visual representation on top of the form
 * @param badges Badges to be shown for this form
 * @param banners Banners to be shown in this form
 * @param actions Actions for this form. To be shown at the top
 * @param buttons Actions for this form. To be shown at the bottom
 */
@Builder
public record FormDto(
    String icon,
    String title,
    boolean readOnly,
    String subtitle,
    StatusDto status,
    boolean noHeader,
    List<BadgeDto> badges,
    List<BannerDto> banners,
    List<ActionDto> actions,
    List<ButtonDto> toolbar,
    List<ButtonDto> buttons,
    ComponentDto avatar,
    List<ComponentDto> header,
    List<ComponentDto> footer,
    /**
     * The small line of text shown ABOVE the title — as on {@link PageDto#overline()}. {@code null}
     * when the page declares none.
     */
    String overline,
    /** What the header shows while the title is still empty — as on {@link PageDto}. */
    String titlePlaceholder,
    /** The "last updated" line of the header — as on {@link PageDto#timestamp()}. */
    String timestamp,
    /** The header's key facts — as on {@link PageDto#kpis()}; {@code null} when none. */
    List<KPIDto> kpis,
    /** Previous/next object arrows — as on {@link PageDto#peerNav()}. */
    PeerNavDto peerNav,
    /** The record/context switcher — as on {@link PageDto#switcher()}. */
    RecordSwitcherDto switcher,
    /**
     * The page's floating action buttons — as on {@link PageDto#fabs()}; {@code null} when none.
     */
    List<FabDto> fabs)
    implements ComponentMetadataDto {

  public FormDto {
    badges = Collections.unmodifiableList(badges != null ? badges : Collections.emptyList());
    banners = Collections.unmodifiableList(banners != null ? banners : Collections.emptyList());
    actions = Collections.unmodifiableList(actions != null ? actions : Collections.emptyList());
    buttons = Collections.unmodifiableList(buttons != null ? buttons : Collections.emptyList());
    toolbar = Collections.unmodifiableList(toolbar != null ? toolbar : Collections.emptyList());
  }

  @Override
  public List<BadgeDto> badges() {
    return Collections.unmodifiableList(badges);
  }

  @Override
  public List<BannerDto> banners() {
    return Collections.unmodifiableList(banners);
  }

  @Override
  public List<ActionDto> actions() {
    return Collections.unmodifiableList(actions);
  }

  @Override
  public List<ButtonDto> buttons() {
    return Collections.unmodifiableList(buttons);
  }

  @Override
  public List<ButtonDto> toolbar() {
    return Collections.unmodifiableList(toolbar);
  }
}
