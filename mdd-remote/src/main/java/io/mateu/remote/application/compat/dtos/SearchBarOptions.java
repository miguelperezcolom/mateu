package io.mateu.remote.application.compat.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class SearchBarOptions {

  String i18nPrefixKey;
}
