package io.mateu.uidl.interfaces;

/**
 * Marker interface that opts a CRUD entity/view into row deletion. When the CRUD's view class
 * implements it, {@code ListRouteResolver} adds the delete action to the listing.
 */
public interface Deleteable {}
