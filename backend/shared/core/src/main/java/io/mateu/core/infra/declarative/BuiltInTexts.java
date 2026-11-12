package io.mateu.core.infra.declarative;

import io.mateu.core.application.i18n.TranslationRegistry;
import io.mateu.core.domain.out.componentmapper.TranslatorContext;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Translator;
import java.util.Locale;
import java.util.Map;

/**
 * A text Mateu itself writes (a button label, a dialog title), in English, through the app's {@link
 * Translator} bean for this request — the same i18n hook as every other Mateu text — or the
 * mapping's translator context when no bean is reachable.
 *
 * <p>When the app's translator leaves the text as it is, Mateu's OWN words (the built-in buttons: a
 * crud's New / Save / Cancel / Edit / Delete / Back to list…) come out in the UI's language from a
 * small catalogue of their own, like the renderers' chrome texts: the language the translator says
 * ({@link Translator#locale}), else the browser's ({@code Accept-Language}) — the one the client
 * puts on {@code <html lang>} and draws its chrome in. They were English next to the renderer's own
 * Spanish («Save» beside «Cancelar»). A language the catalogue lacks keeps English.
 */
public final class BuiltInTexts {

  private BuiltInTexts() {}

  /**
   * Mateu's own words, by language (es, fr, de, pt, it — the renderers' chrome languages), keyed by
   * their English text. Kept in step with the renderers' chrome catalogues (libs/mateu
   * chromeTexts.ts, Redwood i18n.mjs); every language has every key (BuiltInTextsTest).
   */
  static final Map<String, Map<String, String>> CATALOGUE =
      Map.of(
          "es",
          Map.ofEntries(
              // a crud's built-in buttons (Crud.newLabel(), saveLabel()…)
              Map.entry("New", "Nuevo"),
              Map.entry("Save", "Guardar"),
              Map.entry("Save and next", "Guardar y siguiente"),
              Map.entry("Cancel", "Cancelar"),
              Map.entry("Delete", "Eliminar"),
              Map.entry("Edit", "Editar"),
              Map.entry("Add another", "Añadir otro"),
              Map.entry("Back to list", "Volver al listado"),
              Map.entry("Import", "Importar"),
              Map.entry("History", "Historial"),
              // the other built-in buttons that already pass through here
              Map.entry("Save and close", "Guardar y cerrar"),
              Map.entry("Skip", "Omitir"),
              Map.entry("Today", "Hoy"),
              Map.entry("Reload", "Recargar"),
              Map.entry("Overwrite", "Sobrescribir"),
              // the default text of @NotEmpty / @NotNull (ConstraintValidationMapper)
              Map.entry("Cannot be empty", "No puede estar vacío"),
              // the toast of an undoable delete (Restorable)
              Map.entry("1 record deleted", "1 registro eliminado"),
              Map.entry("{0} records deleted", "{0} registros eliminados"),
              Map.entry("1 record restored", "1 registro restaurado"),
              Map.entry("{0} records restored", "{0} registros restaurados")),
          "fr",
          Map.ofEntries(
              Map.entry("New", "Nouveau"),
              Map.entry("Save", "Enregistrer"),
              Map.entry("Save and next", "Enregistrer et suivant"),
              Map.entry("Cancel", "Annuler"),
              Map.entry("Delete", "Supprimer"),
              Map.entry("Edit", "Modifier"),
              Map.entry("Add another", "En ajouter un autre"),
              Map.entry("Back to list", "Retour à la liste"),
              Map.entry("Import", "Importer"),
              Map.entry("History", "Historique"),
              Map.entry("Save and close", "Enregistrer et fermer"),
              Map.entry("Skip", "Passer"),
              Map.entry("Today", "Aujourd'hui"),
              Map.entry("Reload", "Recharger"),
              Map.entry("Overwrite", "Écraser"),
              Map.entry("Cannot be empty", "Ne peut pas être vide"),
              Map.entry("1 record deleted", "1 enregistrement supprimé"),
              Map.entry("{0} records deleted", "{0} enregistrements supprimés"),
              Map.entry("1 record restored", "1 enregistrement restauré"),
              Map.entry("{0} records restored", "{0} enregistrements restaurés")),
          "de",
          Map.ofEntries(
              Map.entry("New", "Neu"),
              Map.entry("Save", "Speichern"),
              Map.entry("Save and next", "Speichern und weiter"),
              Map.entry("Cancel", "Abbrechen"),
              Map.entry("Delete", "Löschen"),
              Map.entry("Edit", "Bearbeiten"),
              Map.entry("Add another", "Weiteren hinzufügen"),
              Map.entry("Back to list", "Zurück zur Liste"),
              Map.entry("Import", "Importieren"),
              Map.entry("History", "Verlauf"),
              Map.entry("Save and close", "Speichern und schließen"),
              Map.entry("Skip", "Überspringen"),
              Map.entry("Today", "Heute"),
              Map.entry("Reload", "Neu laden"),
              Map.entry("Overwrite", "Überschreiben"),
              Map.entry("Cannot be empty", "Darf nicht leer sein"),
              Map.entry("1 record deleted", "1 Datensatz gelöscht"),
              Map.entry("{0} records deleted", "{0} Datensätze gelöscht"),
              Map.entry("1 record restored", "1 Datensatz wiederhergestellt"),
              Map.entry("{0} records restored", "{0} Datensätze wiederhergestellt")),
          "pt",
          Map.ofEntries(
              Map.entry("New", "Novo"),
              Map.entry("Save", "Salvar"),
              Map.entry("Save and next", "Salvar e próximo"),
              Map.entry("Cancel", "Cancelar"),
              Map.entry("Delete", "Excluir"),
              Map.entry("Edit", "Editar"),
              Map.entry("Add another", "Adicionar outro"),
              Map.entry("Back to list", "Voltar à lista"),
              Map.entry("Import", "Importar"),
              Map.entry("History", "Histórico"),
              Map.entry("Save and close", "Salvar e fechar"),
              Map.entry("Skip", "Pular"),
              Map.entry("Today", "Hoje"),
              Map.entry("Reload", "Recarregar"),
              Map.entry("Overwrite", "Sobrescrever"),
              Map.entry("Cannot be empty", "Não pode ficar vazio"),
              Map.entry("1 record deleted", "1 registro excluído"),
              Map.entry("{0} records deleted", "{0} registros excluídos"),
              Map.entry("1 record restored", "1 registro restaurado"),
              Map.entry("{0} records restored", "{0} registros restaurados")),
          "it",
          Map.ofEntries(
              Map.entry("New", "Nuovo"),
              Map.entry("Save", "Salva"),
              Map.entry("Save and next", "Salva e avanti"),
              Map.entry("Cancel", "Annulla"),
              Map.entry("Delete", "Elimina"),
              Map.entry("Edit", "Modifica"),
              Map.entry("Add another", "Aggiungi un altro"),
              Map.entry("Back to list", "Torna all'elenco"),
              Map.entry("Import", "Importa"),
              Map.entry("History", "Cronologia"),
              Map.entry("Save and close", "Salva e chiudi"),
              Map.entry("Skip", "Salta"),
              Map.entry("Today", "Oggi"),
              Map.entry("Reload", "Ricarica"),
              Map.entry("Overwrite", "Sovrascrivi"),
              Map.entry("Cannot be empty", "Non può essere vuoto"),
              Map.entry("1 record deleted", "1 record eliminato"),
              Map.entry("{0} records deleted", "{0} record eliminati"),
              Map.entry("1 record restored", "1 record ripristinato"),
              Map.entry("{0} records restored", "{0} record ripristinati")));

  public static String translate(String text, HttpRequest httpRequest) {
    if (text == null || text.isBlank()) {
      return text;
    }
    if (httpRequest == null) {
      // a text built lazily (a Callable<Component> field the mapping invokes) may not have the
      // request at hand: the request being mapped is the one
      httpRequest = TranslatorContext.request();
    }
    if (httpRequest == null && TranslatorContext.isSet()) {
      return TranslatorContext.translate(text);
    }
    Translator translator = null;
    try {
      translator = MateuBeanProvider.getSingletonBean(Translator.class);
    } catch (RuntimeException ignored) {
      // no bean provider (e.g. a plain unit test): fall back to the translator context
    }
    String translated;
    if (translator == null) {
      translated = TranslatorContext.translate(text);
    } else {
      try {
        // with no request at all the app's translator still gets the text (its default language)
        translated = translator.translate(text, httpRequest);
      } catch (RuntimeException translatorNeedsTheRequest) {
        translated = text;
      }
    }
    if (!text.equals(translated)) {
      return translated;
    }
    return ownWord(text, language(translator, httpRequest));
  }

  /**
   * {@code text} in {@code language} when it is one of Mateu's own words, else {@code text} as it
   * is (an app's label, a language the catalogue lacks, no language at all).
   */
  static String ownWord(String text, String language) {
    if (language == null) {
      return text;
    }
    var words = CATALOGUE.get(language);
    return words == null ? text : words.getOrDefault(text, text);
  }

  /**
   * The UI's language (a lower-case primary subtag) for this request: the translator's, else the
   * browser's first {@code Accept-Language}; null with no request, or for a static bundle's raw
   * render (the visitor's browser picks the language there).
   */
  static String language(Translator translator, HttpRequest httpRequest) {
    if (httpRequest == null || TranslationRegistry.isRaw(httpRequest)) {
      return null;
    }
    String tag = null;
    if (translator != null) {
      try {
        tag = translator.locale(httpRequest);
      } catch (RuntimeException ignored) {
        // a translator that cannot tell: the browser's, then
      }
    }
    if (tag == null || tag.isBlank()) {
      try {
        var acceptLanguage = httpRequest.getHeaderValue("Accept-Language");
        if (acceptLanguage != null) {
          tag = acceptLanguage.split(",")[0].split(";")[0].trim();
        }
      } catch (RuntimeException ignored) {
        // no headers (a synthetic request)
      }
    }
    if (tag == null || tag.isBlank() || "*".equals(tag)) {
      return null;
    }
    return Locale.forLanguageTag(tag.replace('_', '-')).getLanguage().toLowerCase(Locale.ROOT);
  }
}
