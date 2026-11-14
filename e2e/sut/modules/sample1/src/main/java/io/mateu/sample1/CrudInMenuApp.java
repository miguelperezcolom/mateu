package io.mateu.sample1;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * The spring-mvc starter's shape: an app whose menu entry IS a crud. Its record pages' actions
 * (Edit, Save) bubble to the app, which sends ITS route — still the listing's after a row click —
 * and the save from listing → row → Edit → Save was refused as "This record no longer exists".
 */
@UI("/crud-in-menu")
@Title("Crud in a menu")
public class CrudInMenuApp {

  @Menu MenuProducts products;

  @Title("Products")
  public static class MenuProducts extends AutoCrud<MenuProduct> {

    @Override
    public CrudStore<MenuProduct> store() {
      return STORE;
    }
  }

  public record MenuProduct(@EditableOnlyWhenCreating String id, String name, double price)
      implements Identifiable {}

  static final Map<String, MenuProduct> PRODUCTS = new LinkedHashMap<>();

  static {
    for (var p :
        List.of(
            new MenuProduct("M-001", "Espresso machine", 249),
            new MenuProduct("M-002", "Coffee grinder", 89.5))) {
      PRODUCTS.put(p.id(), p);
    }
  }

  static final CrudStore<MenuProduct> STORE =
      new CrudStore<>() {
        @Override
        public Optional<MenuProduct> findById(String id) {
          return Optional.ofNullable(PRODUCTS.get(id));
        }

        @Override
        public String save(MenuProduct entity) {
          PRODUCTS.put(entity.id(), entity);
          return entity.id();
        }

        @Override
        public List<MenuProduct> findAll() {
          return new ArrayList<>(PRODUCTS.values());
        }

        @Override
        public void deleteAllById(List<String> ids) {
          ids.forEach(PRODUCTS::remove);
        }
      };
}
