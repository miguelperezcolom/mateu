package io.mateu.e2e.yamlfed.orders;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** No UI code here: every screen of this app is a YAML definition under specs/ui. */
@SpringBootApplication(scanBasePackages = "io.mateu.e2e.yamlfed.orders")
public class OrdersApplication {

  public static void main(String[] args) {
    SpringApplication.run(OrdersApplication.class, args);
  }
}
