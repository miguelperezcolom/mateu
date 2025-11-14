package io.mateu.uidl.annotations;

import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.data.RuleFieldAttribute;
import io.mateu.uidl.data.RuleResult;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Repeatable(Rules.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Rule {

  String filter();

  RuleAction action();

  String fieldName();

  RuleFieldAttribute fieldAttribute();

  String value();

  String expression();

  String actionId();

  RuleResult result();
}
