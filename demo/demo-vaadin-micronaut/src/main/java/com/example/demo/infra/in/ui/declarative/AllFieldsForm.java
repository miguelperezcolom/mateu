package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Range;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;

import java.io.File;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;

import static io.mateu.core.infra.JsonSerializer.toJson;

record Row(String name, int age) {

}

@Route("/app/all-fields")
public class AllFieldsForm {

    /*
  money
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

    boolean booleanField = true;
    Boolean wrappedBoolean = Boolean.TRUE;

    LocalDate localDate = LocalDate.now();

    /*
    Date date = new Date();
    java.sql.Date sqlDate = new java.sql.Date(System.currentTimeMillis());
    ZonedDateTime zonedDateTime = ZonedDateTime.now();
    LocalTime localTime = LocalTime.now();

    int[] intArray;
    long[] longArray;
    float[] floatArray;
    double[] doubleArray;
    Double[] wrappedDoubleArray;
    BigInteger[] bigIntegerArray;
    BigDecimal[] bigDecimalArray;
    String[] stringArray;
    Boolean[] booleanArray;
    Boolean[] wrappedBooleanArray;
    LocalDate[] localDateArray;
    Date[] dateArray;
    java.sql.Date[] sqlDateArray;
    ZonedDateTime[] zonedDateTimeArray;
    LocalTime[] localTimeArray;
    Integer[] wrappedIntegerArray;
    Long[] wrappedLongArray;
    Float[] wrappedFloatArray;


    List<String> stringList;
    List<Boolean> booleanList;
    List<Integer> integerList;
    List<Float> floatList;
    List<Double> doubleList;
    List<BigInteger> bigIntegerList;
    List<BigDecimal> bigDecimalList;


    List<Row> list;

    File file;

    Status status = new Status(StatusType.SUCCESS, "Hola!");

    Component component = new Text("Hola!");

    Menu menu = new Menu("Hola!", List.of(new RouteLink("/app/page1", "Page 1"), new RouteLink("/app/page2", "Page 2")));

    Range range = new Range(20, 30);

     */

    @Button
    Object sayHello() {
        return new Message("Hello " + toJson(this));
    }



}
