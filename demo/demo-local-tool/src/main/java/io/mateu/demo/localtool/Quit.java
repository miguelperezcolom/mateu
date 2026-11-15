package io.mateu.demo.localtool;

import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

/**
 * Stops the tool. It runs OFF the request thread and a moment later, so the answer to the Quit
 * click (the goodbye) reaches the browser before the server goes away.
 */
@Component
public class Quit {

  /** How the process ends once Spring has closed; a bean so a test can replace System.exit. */
  public interface ProcessExit {
    void exit(int status);
  }

  private final ConfigurableApplicationContext context;
  private final ProcessExit processExit;
  private final AtomicBoolean quitting = new AtomicBoolean();

  public Quit(ConfigurableApplicationContext context, ProcessExit processExit) {
    this.context = context;
    this.processExit = processExit;
  }

  public void soon() {
    if (!quitting.compareAndSet(false, true)) {
      return; // a second click while stopping
    }
    var stopper =
        new Thread(
            () -> {
              try {
                Thread.sleep(500);
              } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
              }
              System.out.println("  Local tool stopped. Bye!");
              processExit.exit(SpringApplication.exit(context, () -> 0));
            },
            "local-tool-quit");
    stopper.setDaemon(false);
    stopper.start();
  }

  @org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
  static class Config {
    @org.springframework.context.annotation.Bean
    @org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean // a test brings its own
    ProcessExit processExit() {
      return System::exit;
    }
  }
}
