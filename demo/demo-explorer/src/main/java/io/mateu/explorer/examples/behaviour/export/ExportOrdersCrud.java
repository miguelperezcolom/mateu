package io.mateu.explorer.examples.behaviour.export;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.explorer.examples.behaviour.listingdata.Order;
import io.mateu.explorer.examples.behaviour.listingdata.Orders;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.CrudStore;

/**
 * Mateu owns the Export buttons, the columns, the rows (the CURRENT search and filters) and the
 * download; the file is written by a {@code ListingExporter}. CSV has a built-in one; the Excel
 * button only shows because this app registers an exporter for that format ({@link
 * SpreadsheetExporter}).
 */
@Title("Orders — export")
public class ExportOrdersCrud extends AutoCrud<Order> {

  @Override
  public CrudStore<Order> store() {
    return Orders.store();
  }

  @Override
  public boolean csvExportable() {
    return true;
  }

  @Override
  public boolean excelExportable() {
    return true;
  }
}
