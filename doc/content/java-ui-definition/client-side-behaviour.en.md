---
title: "Client-side behaviour"
weight: 75
---

Usually there is some logic you want to happen in the browser, without a server round-trip. 
Some examples could be hiding some content or changing the validation of a field according to a field value.

Mateu provides kind of business rules support for changing properties of things on the browser according to the 
component state (or what is the same, the field values). 

<p align="center"><img src="../../../images/arch-overall-8.svg?raw=true" width="600"/></p>

Those rules are sequentially evaluated and, if the filter evaluation return truthy, then the rule is applied. This way
you can change attributes in the browser without a server round-trip.

More or less, the logic is this: the sentence "field x is hidden if y == 5 and z" is always true, and Mateu will make sure 
it is always true. For stating this logic, we would create a rule like this:

| Filter | Action     | Field name | Field attribute | Value | Expression              | Result   
|--------|------------|------------|-----------------|-------|-------------------------|----------|
| true   | UpdateData | x          | hidden          |       | state.y == 5 && state.z | Continue |

The rule above would be defined, like always, from our java class:

{{< tabs "favicon" >}}

{{< tab "Declarative" >}}

Just annotate your class with `@Rule`, as in the example below:

```java

@Rule(
  filter = "true",
  action = RuleAction.UpdateData,
  fieldName = "x",
  fieldAttribute = RuleFieldAttribute.hidden,
  expression = "state.y == 5 && state.z",
  result = RuleResult.Continue
)
public class VisibilityRulePage {

}
```


{{< /tab >}}

{{< tab "Imperatively" >}}

If you want to declare your rule using a fluent style code you can do so by implementing the `RuleSupplier` interface, like in the example below:

```java

public class VisibilityRulePage implements ComponentTreeSupplier, RuleSupplier {

  // ...

  @Override
  public List<Rule> rules() {
    return List.of(
      Rule.builder()
        .filter("true")
        .action(RuleAction.UpdateData)
        .fieldName("x")
        .fieldAttribute(RuleFieldAttribute.hidden)
        .expression("state.y == 5 && state.z")
        .result(RuleResult.Continue)
        .build()
    );
  }
}


```


{{< /tab >}}

{{< /tabs >}}

Please notice there are some fields (filter, result) in the rule which could be avoided right now, but I have 
intentionally left them there as I expect this to have more functionality and need them in the near future.    
