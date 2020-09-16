package io.mateu.mdd.core.eventBus;

import io.mateu.mdd.core.reflection.MiniReflectionHelper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

public class EventBus {

    private final Thread worker;
    //todo: convertirla en threadsafe
    private Map<Class, List<Consumer>> consumers = new HashMap();
    //todo: convertirla en threadsafe
    private List<Event> events = new ArrayList<>();

    static EventBus instance;

    static synchronized EventBus get() {
        if (instance == null) {
            instance = new EventBus();
        }
        return instance;
    }

    public EventBus() {
        worker = new Thread(() -> {
            try {
                while (true) {
                    while (events.size() > 0) {
                        Event event = events.remove(0);
                        List<Consumer> l = consumers.get(event.getClass());
                        if (l == null || l.size() == 0) {
                            System.out.println("**** NO CONSUMER FOR EVENTS OF TYPE " + event.getClass().getSimpleName() + " ****");
                        } else {
                            l.stream().forEach(c -> c.accept(event));
                        }
                    }
                    Thread.sleep(100);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        worker.start();
    }

    public static void publish(Event event) {
        get().events.add(event);
    }

    public static void register(Consumer consumer) {
        if (consumer != null) {
            Class eventClass = MiniReflectionHelper.getGenericClass(consumer.getClass());
            List<Consumer> l = get().consumers.get(eventClass);
            if (l == null) {
                get().consumers.put(eventClass, l = new ArrayList<>());
            }
            l.add(consumer);
        }
    }

    public static void unregister(Consumer consumer) {
        if (consumer != null) {
            Class eventClass = MiniReflectionHelper.getGenericClass(consumer.getClass());
            List<Consumer> l = get().consumers.get(eventClass);
            if (l != null) l.remove(consumer);
        }
    }

}
