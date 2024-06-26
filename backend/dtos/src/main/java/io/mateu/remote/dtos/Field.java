package io.mateu.remote.dtos;

import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Field {

  private String id;

  private String type;

  private String stereotype;

  private boolean observed;

  private String caption;

  private String placeholder;

  private String cssClasses;

  private String description;

  private List<Badge> badges;

  private List<Validation> validations = new ArrayList<>();

  private List<Pair> attributes = new ArrayList<>();
}
