// Post-analysis script of the public-API compatibility check (japicmp) when it is REPORT-ONLY:
// mateu-dtos always (the wire DTOs are outside the Java binary promise), and any module run with
// -Dmateu.api.enforce=false. It changes nothing; the report is written to target/japicmp/.
// The enforcing twin is api-guard-enforce-true.groovy (picked by the value of mateu.japicmp.enforce).

jApiClasses
