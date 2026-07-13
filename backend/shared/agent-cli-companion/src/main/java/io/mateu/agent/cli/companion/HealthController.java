package io.mateu.agent.cli.companion;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** The chat probes this to discover a running companion and show its badge. */
@RestController
public class HealthController {

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("status", "up", "service", "mateu-agent-companion");
  }
}
