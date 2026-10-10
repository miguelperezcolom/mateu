package io.mateu.mdd.demovbpms.infra.in.ui.financials;

import io.mateu.uidl.annotations.Menu;

/** Section "Financials" (OPERA Cloud 26.3 user guide, chapter 006). */
public class FinancialsMenu {

  @Menu Billing billing;

  @Menu FolioCharges folio;
}
