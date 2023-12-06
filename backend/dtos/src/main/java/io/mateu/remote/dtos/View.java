package io.mateu.remote.dtos;

import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class View {

  private String title;

  private String subtitle;

  private List<Message> messages;

  private ViewPart header;

  private ViewPart left;

  private ViewPart main;

  private ViewPart right;

  private ViewPart footer;
}
