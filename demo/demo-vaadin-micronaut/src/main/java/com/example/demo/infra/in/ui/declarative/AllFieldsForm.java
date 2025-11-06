package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Message;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;

import static io.mateu.core.infra.JsonSerializer.toJson;

@Route("/app/all-fields")
public class AllFieldsForm {

    /*
  string,
  date,
  time,
  dateTime,
  bool,
  array,
  file,
  status,
  money,
  component,
  menu,
  range
     */
    int intField = 17;
    long longField = 17;
    float floatField = 17;
    double doubleField = 17;
    Integer integer = 17;
    Long wrappedLong = 17L;
    Double wrappedDouble = 17d;
    BigInteger bigInteger = BigInteger.ONE;
    BigDecimal bigDecimal = BigDecimal.TEN;

    String stringField = "Mateu";

    LocalDate localDate = LocalDate.now();

    @Button
    Object sayHello() {
        return new Message("Hello " + toJson(this));
    }



}
