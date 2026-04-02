---
title: "Validations"
weight: 50
---

With Mateu you can define field and form-wise validations.

## Field level validations

This is the list of supported field level validations:

- required
- minValue
- maxValue
- pattern
- minLength
- maxLength

## Form wise validations

You can specify for wise validations by providing a set of rules which are evaluated after each value change.
For each rule you can set:

- A condition which is evaluated each time.
- Field id for the error message, if the condition is not met. Use an empty value if you want to display the error message at form level. 
- Error message. You can set a javascript literal, so you can use variables here.

Please notice that you can repeat the rule as many times as you want, to set error messages for different fields for teh same condition.

## Error message internationalisation

Please notice that error messages are translated in the backend, before going to the frontend. There is a chapter
about i18n in this manual. 
