package io.mateu.uidl.fluent;

import io.mateu.uidl.data.Menu;
import java.util.List;
import lombok.Builder;

@Builder
public record App(
    String favicon,
    String pageTitle,
    String title,
    String subtitle,
    List<Menu> menu,
    AppVariant variant) {}
