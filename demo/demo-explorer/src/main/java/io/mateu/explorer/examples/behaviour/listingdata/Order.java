package io.mateu.explorer.examples.behaviour.listingdata;

import io.mateu.uidl.annotations.RangeFilter;
import io.mateu.uidl.interfaces.Identifiable;
import java.time.LocalDate;

/**
 * One order. In an {@code AutoCrud<Order>} every basic field is a column, a form field AND a filter
 * of the smart search bar — with the richer widget its type asks for: the enum a multi-select, the
 * date a from–to range, the {@code @RangeFilter} number a min–max range.
 *
 * <p>Boxed types (not {@code double}/{@code int}): a filter counts as SET only when it differs from a
 * fresh instance, and a primitive's 0 would always be "set".
 */
public class Order implements Identifiable {

  public String id;
  public String customer;
  public String city;
  public OrderStatus status;
  public LocalDate date;

  @RangeFilter public Double amount;

  public Integer items;

  public Order() {}

  public Order(
      String id,
      String customer,
      String city,
      OrderStatus status,
      LocalDate date,
      Double amount,
      Integer items) {
    this.id = id;
    this.customer = customer;
    this.city = city;
    this.status = status;
    this.date = date;
    this.amount = amount;
    this.items = items;
  }

  @Override
  public String id() {
    return id;
  }

  /** What the free-text search matches against (every word must appear, any order). */
  @Override
  public String toString() {
    return id + " " + customer + " " + city;
  }
}
