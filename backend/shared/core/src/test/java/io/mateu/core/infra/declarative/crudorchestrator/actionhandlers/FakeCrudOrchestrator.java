package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.NamedView;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Minimal CrudOrchestrator for unit-testing action handlers. Tracks which operations were called
 * and with which arguments.
 */
public class FakeCrudOrchestrator
    extends CrudOrchestrator<
        NamedView<FakeEntity>,
        NamedView<FakeEntity>,
        NamedView<FakeEntity>,
        NoFilters,
        FakeEntity,
        String> {

  public boolean saveNewCalled = false;
  public boolean saveCalled = false;
  public List<String> deletedIds = new ArrayList<>();
  public String savedIdToReturn = "saved-123";

  private final Map<String, FakeEntity> db = new HashMap<>();

  public FakeCrudOrchestrator() {
    db.put("entity-1", new FakeEntity("entity-1", "First"));
    db.put("entity-2", new FakeEntity("entity-2", "Second"));
  }

  @Override
  public CrudAdapter<
          NamedView<FakeEntity>,
          NamedView<FakeEntity>,
          NamedView<FakeEntity>,
          NoFilters,
          FakeEntity,
          String>
      adapter() {
    return new CrudAdapter<>() {
      @Override
      public ListingData<FakeEntity> search(
          String searchText, NoFilters filters, Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(new ArrayList<>(db.values()));
      }

      @Override
      public void deleteAllById(List<String> selectedIds, HttpRequest httpRequest) {
        deletedIds.addAll(selectedIds);
        selectedIds.forEach(db::remove);
      }

      @Override
      public NamedView<FakeEntity> getView(String id, HttpRequest httpRequest) {
        return null;
      }

      @Override
      public NamedView<FakeEntity> getEditor(String id, HttpRequest httpRequest) {
        return null;
      }

      @Override
      public NamedView<FakeEntity> getCreationForm(HttpRequest httpRequest) {
        return null;
      }
    };
  }

  @Override
  public Object saveNew(HttpRequest httpRequest) {
    saveNewCalled = true;
    return savedIdToReturn;
  }

  @Override
  public Object save(HttpRequest httpRequest) {
    saveCalled = true;
    return savedIdToReturn;
  }

  @Override
  public Object create(HttpRequest httpRequest) {
    return null;
  }

  @Override
  public Object edit(String id, HttpRequest httpRequest) {
    return null;
  }

  @Override
  public Object view(String id, HttpRequest httpRequest) {
    return null;
  }

  @Override
  public String toId(String s) {
    return s;
  }

  @Override
  public Class viewClass() {
    return FakeEntity.class;
  }

  @Override
  public Class editorClass() {
    return FakeEntity.class;
  }

  @Override
  public Class creationFormClass() {
    return FakeEntity.class;
  }

  @Override
  public Class filtersClass() {
    return NoFilters.class;
  }

  @Override
  public Class rowClass() {
    return FakeEntity.class;
  }

  @Override
  public String getIdFieldForRow() {
    return "id";
  }
}
