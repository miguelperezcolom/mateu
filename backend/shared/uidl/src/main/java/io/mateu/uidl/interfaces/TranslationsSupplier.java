package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Translations;
import java.util.List;

/**
 * The CODE producer of the translation catalogue — the programmatic twin of the {@code type:
 * Translations} files, exactly as {@link RestSourceCatalogSupplier} is for {@code sources.yaml}.
 * Register it as a bean; its messages are merged UNDER the authored files (a key a YAML file also
 * declares takes the file's text — authored wins).
 */
public interface TranslationsSupplier {

  List<Translations> translations();
}
