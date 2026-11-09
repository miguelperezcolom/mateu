package io.mateu.explorer.examples.components.element;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves the JavaScript module an {@code Element} imports. In a real app this is a file of your
 * front-end build or a third-party package (any web component works); it is inlined here so the
 * whole example is one Java file you can read.
 */
@RestController
public class MuseumClockModule {

  static final String MODULE =
      """
      class MuseumClock extends HTMLElement {
        connectedCallback() {
          this.style.cssText = 'display:inline-block;padding:.5rem 1rem;border-radius:999px;'
            + 'background:#0f172a;color:#f8fafc;font-variant-numeric:tabular-nums;';
          const tick = () => this.textContent =
            '🕰 ' + (this.getAttribute('city') || '') + ' · ' + new Date().toLocaleTimeString();
          tick();
          this.timer = setInterval(tick, 1000);
        }
        disconnectedCallback() { clearInterval(this.timer); }
      }
      if (!customElements.get('explorer-museum-clock')) {
        customElements.define('explorer-museum-clock', MuseumClock);
      }
      """;

  @GetMapping("/explorer-api/museum-clock.js")
  public ResponseEntity<String> module() {
    return ResponseEntity.ok().header("Content-Type", "text/javascript").body(MODULE);
  }
}
