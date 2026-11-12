package com.example.app;

/** Where an order is in its life. A small enum renders as a choice, and as text in a listing. */
public enum OrderStatus {
  Open,
  Paid,
  Shipped,
  Cancelled
}
