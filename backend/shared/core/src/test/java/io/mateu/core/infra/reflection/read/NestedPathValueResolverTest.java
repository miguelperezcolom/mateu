package io.mateu.core.infra.reflection.read;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/** Dotted-path value reads (grid columns like "customer.name"): fields, getters, nulls. */
class NestedPathValueResolverTest {

  // the resolver reads through GETTERS only — bare fields yield null
  @SuppressWarnings("unused")
  static class Customer {
    String name = "Ada";
    Address address = new Address();

    public String getName() {
      return name;
    }

    public Address getAddress() {
      return address;
    }
  }

  @SuppressWarnings("unused")
  static class Address {
    String city = "Palma";

    public String getCity() {
      return city;
    }
  }

  @SuppressWarnings("unused")
  static class Order {
    Customer customer = new Customer();
    String code = "O-1";

    public Customer getCustomer() {
      return customer;
    }

    public String getCode() {
      return code;
    }
  }

  @Test
  void plainFieldReads() throws Exception {
    assertThat(NestedPathValueResolver.getValue("code", new Order())).isEqualTo("O-1");
  }

  @Test
  void singleHopDottedPathReads() throws Exception {
    assertThat(NestedPathValueResolver.getValue("customer.name", new Order())).isEqualTo("Ada");
  }

  @Test
  void multiHopDottedPathReads() throws Exception {
    assertThat(NestedPathValueResolver.getValue("customer.address.city", new Order()))
        .isEqualTo("Palma");
  }

  @Test
  void nullIntermediateYieldsNull() throws Exception {
    var order = new Order();
    order.customer = null;
    assertThat(NestedPathValueResolver.getValue("customer.name", order)).isNull();
  }

  @Test
  void unknownSegmentYieldsNull() throws Exception {
    assertThat(NestedPathValueResolver.getValue("customer.unknown", new Order())).isNull();
  }

  @Test
  void nullTargetYieldsNull() throws Exception {
    assertThat(NestedPathValueResolver.getValue("code", null)).isNull();
  }
}
