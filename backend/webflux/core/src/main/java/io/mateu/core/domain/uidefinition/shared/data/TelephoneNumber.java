package io.mateu.core.domain.uidefinition.shared.data;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class TelephoneNumber {

  String prefix;

  String number;
}
