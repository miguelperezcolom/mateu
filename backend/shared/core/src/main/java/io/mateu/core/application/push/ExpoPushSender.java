package io.mateu.core.application.push;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.interfaces.PushSender;
import io.mateu.uidl.push.PushMessage;
import io.mateu.uidl.push.PushResult;
import io.mateu.uidl.push.PushToken;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

/**
 * Mateu's optional {@link PushSender} over Expo's push service (the Mateu phone app is an Expo app,
 * so its tokens are Expo push tokens): on only with {@code mateu.push.expo.enabled=true}, and only
 * when the app registers no {@code PushSender} of its own.
 *
 * <p>Plain JDK {@link HttpClient}, no SDK. Messages go in batches of at most {@value #BATCH}
 * (Expo's limit); {@code mateu.push.expo.access-token} (env {@code MATEU_PUSH_EXPO_ACCESS_TOKEN}),
 * when set, is sent as the bearer token Expo's "enhanced security" asks for. A ticket answering
 * {@code DeviceNotRegistered} reports its token as gone, and Mateu unregisters it. Expo's later
 * receipts are not polled: a token that fails only there stays until the phone unregisters it.
 */
@Slf4j
public final class ExpoPushSender implements PushSender {

  public static final String DEFAULT_URL = "https://exp.host/--/api/v2/push/send";
  static final int BATCH = 100;

  /** The Android channel the Mateu app creates for its notifications. */
  static final String CHANNEL = "mateu";

  private static final ObjectMapper JSON = new ObjectMapper();

  private final URI url;
  private final String accessToken;
  private final HttpClient client;

  public ExpoPushSender(String url, String accessToken) {
    this.url = URI.create(url != null && !url.isBlank() ? url : DEFAULT_URL);
    this.accessToken = accessToken != null && !accessToken.isBlank() ? accessToken : null;
    this.client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
  }

  @Override
  public PushResult send(PushMessage message, List<PushToken> tokens) {
    if (message == null || tokens == null || tokens.isEmpty()) {
      return PushResult.none();
    }
    int accepted = 0;
    var gone = new ArrayList<String>();
    for (int from = 0; from < tokens.size(); from += BATCH) {
      var batch = tokens.subList(from, Math.min(tokens.size(), from + BATCH));
      try {
        var result = sendBatch(message, batch);
        accepted += result.accepted();
        gone.addAll(result.unregisteredTokens());
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        break;
      } catch (Exception e) {
        log.warn("Expo push: a batch of {} could not be sent: {}", batch.size(), e.toString());
      }
    }
    return new PushResult(accepted, gone);
  }

  private PushResult sendBatch(PushMessage message, List<PushToken> batch) throws Exception {
    var messages = new ArrayList<Map<String, Object>>(batch.size());
    for (var token : batch) {
      messages.add(messageFor(message, token));
    }
    var request =
        HttpRequest.newBuilder(url)
            .timeout(Duration.ofSeconds(30))
            .header("Content-Type", "application/json")
            .header("Accept", "application/json");
    if (accessToken != null) {
      request.header("Authorization", "Bearer " + accessToken);
    }
    var response =
        client.send(
            request
                .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(messages)))
                .build(),
            HttpResponse.BodyHandlers.ofString());
    if (response.statusCode() / 100 != 2) {
      log.warn("Expo push answered {}: {}", response.statusCode(), abbreviated(response.body()));
      return PushResult.none();
    }
    var tickets = JSON.readTree(response.body()).path("data");
    int accepted = 0;
    var gone = new ArrayList<String>();
    for (int i = 0; i < batch.size() && i < tickets.size(); i++) {
      JsonNode ticket = tickets.get(i);
      if ("ok".equals(ticket.path("status").asText())) {
        accepted++;
      } else if ("DeviceNotRegistered".equals(ticket.path("details").path("error").asText())) {
        gone.add(batch.get(i).token());
      } else {
        log.warn("Expo push refused a message: {}", ticket.path("message").asText(""));
      }
    }
    return new PushResult(accepted, gone);
  }

  /** One Expo message: the push's texts, and {@code ui} + {@code route} for the tap. */
  static Map<String, Object> messageFor(PushMessage message, PushToken token) {
    var data = new LinkedHashMap<String, Object>(message.data());
    if (token.ui() != null) {
      data.put("ui", token.ui());
    }
    if (message.route() != null && !message.route().isBlank()) {
      data.put("route", message.route());
    }
    if (message.id() != null) {
      data.put("id", message.id());
    }
    var out = new LinkedHashMap<String, Object>();
    out.put("to", token.token());
    out.put("title", message.title() != null ? message.title() : "Notification");
    if (message.text() != null && !message.text().isBlank()) {
      out.put("body", message.text());
    }
    out.put("data", data);
    out.put("sound", "default");
    out.put("channelId", CHANNEL);
    return out;
  }

  private static String abbreviated(String body) {
    if (body == null) {
      return "";
    }
    return body.length() > 300 ? body.substring(0, 300) + "…" : body;
  }
}
