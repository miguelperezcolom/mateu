package com.example.app;

import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import java.time.LocalDate;

/** One row of the Orders listing. The record's components are its columns, in this order. */
public record Order(
    String id,
    String customer,
    String product,
    LocalDate date,
    @Stereotype(FieldStereotype.money) double amount,
    OrderStatus status) {}
