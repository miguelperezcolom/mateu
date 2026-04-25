package io.mateu.core.domain.act.crudfieldhandlers;

import static io.mateu.core.domain.act.crudfieldhandlers.AddActionHandler.handleAdd;
import static io.mateu.core.domain.act.crudfieldhandlers.CancelActionHandler.handleCancel;
import static io.mateu.core.domain.act.crudfieldhandlers.MoveDownActionHandler.handleMoveDown;
import static io.mateu.core.domain.act.crudfieldhandlers.MoveUpActionHandler.handleMoveUp;
import static io.mateu.core.domain.act.crudfieldhandlers.NextActionHandler.handleNext;
import static io.mateu.core.domain.act.crudfieldhandlers.PrevActionHandler.handlePrev;
import static io.mateu.core.domain.act.crudfieldhandlers.RemoveActionHandler.handleRemove;
import static io.mateu.core.domain.act.crudfieldhandlers.SaveActionHandler.handleSave;
import static io.mateu.core.domain.act.crudfieldhandlers.SelectActionHandler.handleSelect;
import static io.mateu.core.domain.act.crudfieldhandlers.SelectedActionHandler.handleSelected;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.State;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CrudFieldHandlersTest {

  FakeHttpRequest http;
  Map<String, Object> showDetail;
  Map<String, Object> editing;
  Field field;
  String fieldId = "items";

  public static class FormWithList {
    public List<Map<String, Object>> items;
  }

  @BeforeEach
  void setUp() throws Exception {
    showDetail = new HashMap<>();
    editing = new HashMap<>();
    field = FormWithList.class.getDeclaredField("items");

    var row1 = new HashMap<String, Object>();
    row1.put("name", "Alice");
    row1.put("_rowNumber", 0);
    var row2 = new HashMap<String, Object>();
    row2.put("name", "Bob");
    row2.put("_rowNumber", 1);

    var componentState = new HashMap<String, Object>();
    componentState.put("items", new ArrayList<>(List.of(row1, row2)));
    componentState.put("items-_rowNumber", 0);
    componentState.put("items-name", "Alice updated");

    http = new FakeHttpRequest();
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(componentState).build());
  }

  @Test
  void addHandlerShowsDetail() {
    var result = handleAdd(new Object(), "items_add", http, "", showDetail, editing, field, fieldId);
    assertThat(result).isInstanceOf(State.class);
    assertThat(showDetail.get(fieldId)).isEqualTo(true);
    assertThat(editing.get(fieldId)).isEqualTo(false);
  }

  @Test
  void cancelHandlerHidesDetail() {
    showDetail.put(fieldId, true);
    var result = handleCancel(new Object(), "items_cancel", http, "", showDetail, editing, field, fieldId);
    assertThat(result).isInstanceOf(State.class);
    assertThat(showDetail.get(fieldId)).isEqualTo(false);
    assertThat(editing.get(fieldId)).isEqualTo(false);
  }

  @Test
  void selectHandlerShowsDetail() {
    var result = handleSelect(new Object(), "items_select", http, "", showDetail, editing, field, fieldId);
    assertThat(result).isInstanceOf(State.class);
    assertThat(showDetail.get(fieldId)).isEqualTo(true);
  }

  @Test
  void selectedHandlerShowsDetail() {
    var result = handleSelected(new Object(), "items_selected", http, "", showDetail, editing, field, fieldId);
    assertThat(result).isInstanceOf(State.class);
    assertThat(showDetail.get(fieldId)).isEqualTo(true);
  }

  @Test
  void removeHandlerRemovesRow() {
    var result = handleRemove(new Object(), "items_remove", http, "", showDetail, editing, field, fieldId);
    assertThat(result).isInstanceOf(State.class);
    assertThat(showDetail.get(fieldId)).isEqualTo(false);
  }

  @Test
  void saveHandlerHidesDetail() {
    var result = handleSave(new Object(), "items_save", http, "", showDetail, editing, field, fieldId);
    assertThat(result).isInstanceOf(State.class);
    assertThat(showDetail.get(fieldId)).isEqualTo(false);
    assertThat(editing.get(fieldId)).isEqualTo(false);
  }

  @Test
  void nextHandlerAdvancesRow() {
    var result = handleNext(new Object(), "items_next", http, "", showDetail, editing, field, fieldId);
    assertThat(result).isInstanceOf(State.class);
  }

  @Test
  void prevHandlerGoesBack() {
    var state = new HashMap<String, Object>();
    var row1 = new HashMap<String, Object>();
    row1.put("_rowNumber", 0);
    var row2 = new HashMap<String, Object>();
    row2.put("_rowNumber", 1);
    state.put("items", new ArrayList<>(List.of(row1, row2)));
    state.put("items-_rowNumber", 1);
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(state).build());
    var result = handlePrev(new Object(), "items_prev", http, "", showDetail, editing, field, fieldId);
    assertThat(result).isInstanceOf(State.class);
  }

  @Test
  void moveDownHandlerMovesRow() {
    var result = handleMoveDown(new Object(), "items_move-down", http, "", showDetail, editing, field, fieldId);
    assertThat(result).isInstanceOf(State.class);
  }

  @Test
  void moveUpHandlerMovesRow() {
    var state = new HashMap<String, Object>();
    var row1 = new HashMap<String, Object>();
    row1.put("_rowNumber", 0);
    var row2 = new HashMap<String, Object>();
    row2.put("_rowNumber", 1);
    state.put("items", new ArrayList<>(List.of(row1, row2)));
    state.put("items-_rowNumber", 1);
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(state).build());
    var result = handleMoveUp(new Object(), "items_move-up", http, "", showDetail, editing, field, fieldId);
    assertThat(result).isInstanceOf(State.class);
  }
}
