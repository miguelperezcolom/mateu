package io.mateu.mdd.util.workflow;

import io.mateu.mdd.shared.INotifier;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.runnable.RunnableThrowsThrowable;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
public class WorkflowEngine {

    private static ConcurrentLinkedQueue queue;
    private static ThreadLocal<Boolean> uselocalRunner = new ThreadLocal<>();
    private static ThreadLocal<List<ConcurrentLinkedQueue>> localQueue = new ThreadLocal<>();

    public static AtomicInteger localRunners = new AtomicInteger();
    public static AtomicBoolean running = new AtomicBoolean();

    static {
        start();
    }

    public static void exit(int status) {
        shutdown();
        System.exit(status);
    }

    public static void shutdown() {
        while (localRunners.get() > 0 || queue.size() > 0 || running.get()) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }


    public static boolean isLocalRunnerActive() {
        return !(uselocalRunner.get() == null || !uselocalRunner.get());
    }

    public static boolean activateLocalRunner() {
        boolean alreadyActive = isLocalRunnerActive();
        log.debug("el local runner ya está activo");
        if (!alreadyActive) {
            uselocalRunner.set(true);
            localQueue.set(new ArrayList<>());
            alreadyActive = false;
        }
        localQueue.get().add(0, new ConcurrentLinkedQueue());
        localRunners.incrementAndGet();
        return !alreadyActive;
    }

    public static void cancelLocalRunner() {
        if (uselocalRunner.get() != null) {
            if (localQueue.get().size() > 0) localQueue.get().remove(0);
        }
        localRunners.decrementAndGet();
    }


    public static void add(Task task) {
        log.debug("añadiendo tarea " + task.getClass().getName());

        if (uselocalRunner.get() != null && uselocalRunner.get()) {
            log.debug("va al runner del thread");
            localQueue.get().get(0).add(task);
        } else {
            log.debug("va al workflow global");
            queue.add(task);
        }
    }

    public static void runAndWaitThreadLocalTasks(boolean forceRunAndWait, RunnableThrowsThrowable callback) {
        log.debug("runAndWaitThreadLocalTasks(" + forceRunAndWait + ", " + callback + "");
        ConcurrentLinkedQueue tasks = localQueue.get() != null && localQueue.get().size() > 0?localQueue.get().get(0):new ConcurrentLinkedQueue();
        Task r = () -> {
            while (tasks.size() > 0) {
                Task task = (Task) tasks.poll();
                try {
                    task.run();
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
            }

            if (callback != null) {
                try {
                    log.debug("llamando al callback");
                    callback.run();
                } catch (Throwable throwable) {
                    Helper.getImpl(INotifier.class).alert(throwable);
                }
            }

        };

        if (!forceRunAndWait && callback != null) { // no esperamos. Las derivamos a la cola general
            log.debug("derivando tareas a la cola general");
            queue.add(r);
        } else { // queremos que se ejecuten ya y esperar, o meter en otro therad y que se llame al callback cuando acaben
            log.debug("ejecutando tareas locales");
            try {
                r.run();
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
            log.debug("fin ejecución tareas locales");
        }
        if (localQueue.get() != null) localQueue.get().remove(tasks);
        localRunners.decrementAndGet();
        if (uselocalRunner.get() != null && uselocalRunner.get() && localRunners.get() <= 0) uselocalRunner.set(false);
    }

    private static synchronized void start() {

        log.debug("start workflowengine");

        if (queue == null) {

            queue = new ConcurrentLinkedQueue();

            new Thread(new Runnable() {
                @Override
                public void run() {

                    while (true) {

                        if (queue.size() == 0) {
                            try {
                                Thread.sleep(100);
                            } catch (InterruptedException e) {
                                e.printStackTrace();
                            }
                        }

                        while (queue.size() > 0) {
                            try {
                                running.set(true);
                                Object o = queue.poll();
                                log.debug("" + LocalDateTime.now() + ": Runing task " + o.getClass().getName());
                                Task task = (Task) o;
                                task.run();
                            } catch (Throwable e) {
                                e.printStackTrace();
                            }

                            running.set(false);
                        }
                    }

                }
            }).start();

        }


    }


}
