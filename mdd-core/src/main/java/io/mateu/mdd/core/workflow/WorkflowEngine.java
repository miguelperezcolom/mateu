package io.mateu.mdd.core.workflow;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicBoolean;

public class WorkflowEngine {

    private static ConcurrentLinkedQueue queue;
    private static ThreadLocal<Boolean> uselocalRunners = new ThreadLocal<>();
    private static ThreadLocal<Boolean> waitingForLocalRunners = new ThreadLocal<>();
    private static ThreadLocal<ConcurrentLinkedQueue> localQueues = new ThreadLocal<>();

    public static AtomicBoolean running = new AtomicBoolean();

    static {
        start();
    }

    public static void exit(int status) {
        shutdown();
        System.exit(status);
    }

    public static void shutdown() {
        while (queue.size() > 0 || running.get()) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }


    public static boolean isLocalRunnerActive() {
        return !(uselocalRunners.get() == null || !uselocalRunners.get());
    }

    public static boolean activateLocalRunner() {
        boolean alreadyActive = isLocalRunnerActive();
        if (!alreadyActive) {
            uselocalRunners.set(true);
            localQueues.set(new ConcurrentLinkedQueue());
            waitingForLocalRunners.set(false);
            alreadyActive = false;
        }
        return !alreadyActive;
    }

    public static void cancelLocalRunner() {
        if (uselocalRunners.get() == null) {
            uselocalRunners.set(false);
            localQueues.set(new ConcurrentLinkedQueue());
            waitingForLocalRunners.set(false);
        }
    }


    public static void add(Task task) {
        //System.out.println("añadiendo tarea " + task.getClass().getName());

        if (uselocalRunners.get() != null && uselocalRunners.get()) {
            //System.out.println("va al runner del thread");
            localQueues.get().add(task);
        } else {
            //System.out.println("va al workflow global");
            queue.add(task);
        }
    }

    public static void runAndWaitThreadLocalTasks() {
        runAndWaitThreadLocalTasks(false);
    }

    public static void runAndWaitThreadLocalTasks(boolean force) {
        //System.out.println("runAndWaitThreadLocalTasks(" + force + ")");
        if (force || !uselocalRunners.get()) {
            //System.out.println("ejecutando tareas thread local. localQueues.get().size() = " + localQueues.get().size());
            uselocalRunners.set(true);
            while (localQueues.get().size() > 0) {
                //System.out.println("ejecutando tarea thread local. localQueues.get().size() = " + localQueues.get().size());
                Task task = (Task) localQueues.get().poll();
                try {
                    task.run();
                } catch (Throwable e) {
                    e.printStackTrace();
                }
            }
            //System.out.println("localQueues empty");
            uselocalRunners.set(false);
        }
    }

    private static synchronized void start() {

        System.out.println("start workflowengine");

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
                                System.out.println("" + LocalDateTime.now() + ": Runing task " + o.getClass().getName());
                                Runnable task = (Runnable) o;
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
