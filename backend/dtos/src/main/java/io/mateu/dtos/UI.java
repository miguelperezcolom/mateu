package io.mateu.dtos;

import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class UI {

  private String favIcon;

  private String logo;

  private String title;

  private String subtitle;

  private List<Menu> menu;

  private String homeJourneyTypeId;

  private String loginUrl;

  private String logoutUrl;
}