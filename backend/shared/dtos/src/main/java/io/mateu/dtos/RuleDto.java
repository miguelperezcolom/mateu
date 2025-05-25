package io.mateu.dtos;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class RuleDto {

  // this is a js expression which must evaluate to true
  // examples:
  // event.dataType == change && event.source == 'name'
  // name == 'Mateu' && age < 20
  // (name == 'Mateu') || (name == 'Antonia')
  private String filter;

  private RuleActionDto action;

  // can be a js expression, an array of field names, a json for an object to be merged to the
  // datastore, ...
  // examples:
  // name = 'Mateu'
  // ['name', 'age', 'address']
  private Object data;

  private RuleResultDto result;
}
