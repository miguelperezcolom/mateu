package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.core.application.runaction.YamlUidlLoader;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Help;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.Component;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.Callable;

/**
 * "Prompt → screen" on the Redwood/VB renderer: type what you want, an LLM authors the Mateu
 * definition (YAML), and Mateu renders it IN THIS PAGE through the normal pipeline — so it looks
 * like any real Redwood/VB screen. The generated tree is held in a {@link Callable} island. This is
 * the VB counterpart of the Vaadin {@code /generate} demo: the same wire model, a different renderer.
 * Set MATEU_AGENT_URL to a plain-text /chat endpoint that returns the YAML (defaults to the deployed
 * ec-demo1 agent).
 */
@UI("/generate")
@Title("Prompt → screen")
public class GenerateScreen {

  @Help("Describe the screen you want, then press Generate")
  public String prompt = "a hotel guest check-in screen";

  private transient Component generated;

  @Colspan(2)
  public Callable<Component> screen = this::render;

  @Button Runnable generate = this::doGenerate;

  private Component render() {
    return generated != null
        ? generated
        : parse("type: Text\ntext: \"↑ Describe a screen above and press Generate.\"\nsize: l");
  }

  private void doGenerate() {
    try {
      Component c = parse(author(prompt));
      generated = c != null ? c : parse("type: Text\ntext: \"Could not parse the generated definition.\"");
    } catch (Exception e) {
      generated = parse("type: Text\ntext: \"Generation failed: " + safe(e.getMessage()) + "\"");
    }
  }

  private static Component parse(String yaml) {
    return new YamlUidlLoader().parseText(yaml);
  }

  private static String author(String prompt) throws Exception {
    String url =
        System.getenv().getOrDefault("MATEU_AGENT_URL", "https://ec1.mateu.io/ai/api/agent/chat");
    String token = System.getenv("MATEU_AGENT_TOKEN");
    String instr =
        "Author a Mateu page layout in YAML for the request below. Reply with ONLY YAML (no prose,"
            + " no markdown fences). Do NOT call tools or navigate. Format: top-level 'layout:' whose"
            + " value is {type: VerticalLayout, content: [ ... ]}. Allowed: {type: Text, text: '...',"
            + " size: xl}; {type: Card, content: {type: FormLayout, content: [ ...fields... ]}}; a"
            + " field is {type: FormField, label: '...', dataType: string|date|integer|bool}. Request: ";
    String body = "{\"message\":" + json(instr + prompt) + ",\"sessionId\":\"gen-vb\"}";
    var builder =
        HttpRequest.newBuilder(URI.create(url))
            .timeout(Duration.ofSeconds(90))
            .header("content-type", "application/json");
    if (token != null && !token.isBlank()) builder.header("Authorization", "Bearer " + token);
    var response =
        HttpClient.newHttpClient()
            .send(
                builder.POST(HttpRequest.BodyPublishers.ofString(body)).build(),
                HttpResponse.BodyHandlers.ofString());
    return stripFences(response.body());
  }

  private static String stripFences(String s) {
    if (s == null) return "";
    String t = s.trim();
    int i = t.indexOf("```");
    if (i >= 0) {
      int j = t.indexOf('\n', i);
      int k = t.lastIndexOf("```");
      if (j >= 0 && k > j) t = t.substring(j + 1, k).trim();
    }
    return t;
  }

  private static String safe(String s) {
    return s == null ? "" : s.replace("\"", "'").replace("\n", " ");
  }

  private static String json(String s) {
    StringBuilder b = new StringBuilder("\"");
    for (char c : s.toCharArray()) {
      switch (c) {
        case '"' -> b.append("\\\"");
        case '\\' -> b.append("\\\\");
        case '\n' -> b.append("\\n");
        case '\r' -> b.append("\\r");
        case '\t' -> b.append("\\t");
        default -> b.append(c);
      }
    }
    return b.append("\"").toString();
  }
}
