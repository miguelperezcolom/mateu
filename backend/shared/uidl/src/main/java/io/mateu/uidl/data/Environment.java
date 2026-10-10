package io.mateu.uidl.data;

import java.util.Map;

/**
 * A deployment environment: per-source overrides of the REST source catalogue, so the same {@code
 * sources.yaml} can be pointed at {@code pre} or {@code pro} WITHOUT being edited.
 *
 * <p>Authored as a {@code type: Environment} file anywhere under {@code specs/ui/}, or by
 * convention as {@code specs/ui/environments/<name>.yaml} (the file name is the name):
 *
 * <pre>
 * type: Environment
 * name: pre
 * sources:
 *   orders: {baseUrl: https://pre.api.acme.com}
 *   payments: {url: https://pre.pay.acme.com/v1/payments, proxy: true}
 * </pre>
 *
 * The active environment is {@code -Dmateu.environment=pre} / {@code MATEU_ENVIRONMENT=pre} on a
 * server, or the {@code environment} parameter of the {@code mateu-bundle} goal for a static
 * bundle. <b>Never put a secret here</b>: credentials stay {@code ${secret.X}} placeholders, which
 * only the server-side proxy resolves (from {@code MATEU_SECRET_X}).
 *
 * @param name the environment's name ({@code pre}, {@code pro}…)
 * @param sources source name → what this environment changes about it
 */
public record Environment(String name, Map<String, Environment.SourceOverride> sources) {

  public Environment {
    name = name == null ? "" : name.trim();
    sources = sources == null ? Map.of() : Map.copyOf(sources);
  }

  /**
   * What an environment may change about a catalogue entry — the DEPLOYMENT of an endpoint, never
   * its contract. Method, body, paths and the field mapping describe what the screens read and are
   * the same in every environment, so they are deliberately not overridable here.
   *
   * @param baseUrl replaces the ORIGIN of the entry's url ({@code scheme://host[:port]}), keeping
   *     its path and query; a base url with a path of its own is prepended to that path. A relative
   *     entry url gets it prepended.
   * @param url replaces the whole url (wins over {@code baseUrl})
   * @param headers merged over the entry's headers (this environment's value wins per name). Use
   *     {@code ${secret.X}} for credentials, never a literal
   * @param proxy when set, replaces the entry's {@code proxy} flag
   */
  public record SourceOverride(
      String baseUrl, String url, Map<String, String> headers, Boolean proxy) {

    public SourceOverride {
      headers = headers == null ? Map.of() : Map.copyOf(headers);
    }
  }
}
