package com.example.app;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * The tasks, in memory. In a real app this is your database or an API. One shared instance: the
 * view models are created fresh on every request, so the data has to live somewhere that outlives
 * them.
 */
public class TaskStore {

  public static final TaskStore INSTANCE = new TaskStore();

  private final Map<String, Task> tasks = new LinkedHashMap<>();

  private TaskStore() {
    var today = LocalDate.now();
    save(new Task("T-1", "Restock the warehouse", "Ana", Task.Stage.Todo, today.plusDays(1), true));
    save(new Task("T-2", "Service the forklift", "Ben", Task.Stage.Todo, today.plusDays(3), false));
    save(new Task("T-3", "Quarterly inventory", "Carla", Task.Stage.Doing, today.plusDays(6), false));
    save(new Task("T-4", "Onboard the new driver", "Ana", Task.Stage.Doing, today.plusDays(2), false));
    save(new Task("T-5", "Renew the fleet insurance", "Ben", Task.Stage.Done, today.minusDays(2), false));
  }

  public synchronized List<Task> findAll() {
    return List.copyOf(tasks.values());
  }

  public synchronized Optional<Task> findById(String id) {
    return Optional.ofNullable(tasks.get(id));
  }

  public synchronized void save(Task task) {
    tasks.put(task.id(), task);
  }
}
