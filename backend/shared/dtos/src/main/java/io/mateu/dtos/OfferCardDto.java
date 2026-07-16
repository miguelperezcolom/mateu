package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record OfferCardDto(
    String tag,
    String title,
    String subtitle,
    String image,
    List<String> features,
    String priceLabel,
    String actionLabel,
    String actionId,
    boolean current,
    String currentLabel,
    boolean added,
    String addedLabel)
    implements ComponentMetadataDto {

  public OfferCardDto {
    features = Collections.unmodifiableList(features != null ? features : Collections.emptyList());
  }

  @Override
  public List<String> features() {
    return Collections.unmodifiableList(features);
  }
}
