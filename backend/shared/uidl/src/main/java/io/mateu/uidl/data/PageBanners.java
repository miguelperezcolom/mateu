package io.mateu.uidl.data;

import java.util.List;

public record PageBanners(List<PageBanner> banners, boolean append) {

  public static PageBanners replace(PageBanner... banners) {
    return new PageBanners(List.of(banners), false);
  }

  public static PageBanners append(PageBanner... banners) {
    return new PageBanners(List.of(banners), true);
  }
}
