package io.mateu.demo.staticbundle;

import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import lombok.Getter;
import lombok.Setter;

/**
 * A {@code :param} route (route {@code /item/:id}) bundled as a TEMPLATE. Its structure is
 * param-independent, so the exporter renders it once with a placeholder id; at runtime the client
 * matches {@code /item/42}, injects {@code id=42} into the state, and the {@code relatedPosts} select
 * fetches its options CLIENT-SIDE from a public API whose URL interpolates {@code ${state.id}} — so a
 * per-id detail screen works served from a static host with NO Mateu backend.
 */
@UI("/item/:id")
@Title("Item ${state.id}")
@Getter
@Setter
public class Item {

  @PlainText private String id;

  @RestOptions(
      url = "https://jsonplaceholder.typicode.com/posts?userId=${state.id}",
      valuePath = "id",
      labelPath = "title")
  private String relatedPost;
}
