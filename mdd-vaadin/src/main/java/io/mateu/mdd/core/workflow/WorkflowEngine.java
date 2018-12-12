package io.mateu.mdd.core.workflow;

import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicBoolean;

public class WorkflowEngine {

    private static ConcurrentLinkedQueue queue;
    private static ThreadLocal<Boolean> uselocalRunners = new ThreadLocal<>();
    private static ThreadLocal<ConcurrentLinkedQueue> localQueues = new ThreadLocal<>();

    public static AtomicBoolean running = new AtomicBoolean();

    static {
        start();
    }

    public static void exit(int status) {
        while (queue.size() > 0 || running.get()) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        System.exit(status);
    }

    public static void activateLocalRunner() {
        uselocalRunners.set(true);
        localQueues.set(new ConcurrentLinkedQueue());
    }

    public static void add(Runnable task) {
        System.out.println("añadiendo tarea " + task.getClass().getName());

        if (uselocalRunners.get() != null && uselocalRunners.get()) {
            System.out.println("va al runner del thread");
            localQueues.get().add(task);
        } else {
            System.out.println("va al workflow global");
            queue.add(task);
        }
    }

    public static void runAndWaitThreadLocalTasks() {
        while (localQueues.get().size() > 0) {
            CountDownLatch latch = new CountDownLatch(1);
            Runnable task = (Runnable) localQueues.get().poll();
            try {
                task.run();
                System.out.println("tarea local ejecutada en queue local");
                latch.countDown();
            } catch (Throwable e) {
                e.printStackTrace();
            }
            try {
                latch.await();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
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
                                System.out.println("Runing task " + o.getClass().getName());
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
