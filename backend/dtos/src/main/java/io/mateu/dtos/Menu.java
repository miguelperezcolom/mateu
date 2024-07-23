package io.mateu.dtos;

import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Menu {

  private MenuType type;

  private String icon;

  private String caption;

  private String journeyTypeId;

  private List<Menu> submenus;
}
