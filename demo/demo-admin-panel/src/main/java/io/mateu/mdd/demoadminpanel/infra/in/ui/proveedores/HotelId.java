package io.mateu.mdd.demoadminpanel.infra.in.ui.proveedores;

import io.mateu.mdd.demoadminpanel.infra.in.ui.HotelSelector;
import io.mateu.uidl.annotations.Searchable;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Semantic annotation for a hotel id. Composes {@link Searchable} with {@link HotelSelector}
 * (which is both the Selector and the LookupLabelSupplier), so a developer writes just
 * {@code @HotelId String hotelId;}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@Searchable(selector = HotelSelector.class, label = HotelSelector.class)
public @interface HotelId {}
