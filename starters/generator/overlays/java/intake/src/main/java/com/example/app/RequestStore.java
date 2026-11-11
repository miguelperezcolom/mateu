package com.example.app;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * The submitted requests, in memory. In a real app the wizard's completion action would call your
 * service or database instead. One shared instance: the view models are created fresh on every
 * request, so the data has to live somewhere that outlives them.
 */
public class RequestStore {

  public static final RequestStore INSTANCE = new RequestStore();

  private final List<IntakeRequest> requests = new ArrayList<>();

  private RequestStore() {
    add("Ada Lovelace", "ada@example.com", Intake.Category.Equipment, "A second monitor", false);
    add("Alan Turing (Bletchley Ltd)", "alan@example.com", Intake.Category.Access, "VPN access", true);
  }

  public synchronized IntakeRequest add(
      String requester, String email, Intake.Category category, String summary, boolean urgent) {
    var request =
        new IntakeRequest(
            String.format("R-%04d", requests.size() + 1),
            LocalDate.now(),
            requester,
            email,
            category,
            summary,
            urgent);
    requests.add(request);
    return request;
  }

  /** Newest first. */
  public synchronized List<IntakeRequest> findAll() {
    return requests.reversed();
  }
}
