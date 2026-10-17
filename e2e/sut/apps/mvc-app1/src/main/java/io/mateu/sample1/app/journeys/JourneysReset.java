package io.mateu.sample1.app.journeys;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * TEST-ONLY: puts the journey fixtures' in-memory data back to its seed, so each journey starts
 * from a known state whatever ran before it (a retry included). Called by tests/journeys/_support.ts.
 */
@RestController
public class JourneysReset {

  @PostMapping("/j-reset")
  public String reset() {
    JTasksCrud.reset();
    JStockCrud.reset();
    JChargesListing.reset();
    JArticlesCrud.reset();
    return "ok";
  }
}
