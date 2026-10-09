Feature: Sample - open app pages
  Spec: docs/specs/sample/SAMPLE.md
  Tester verify: docs/scenario/sample/SAMPLE_TESTER_VERIFY.md
  Dataset: features/sample/datasets/sample.dataset.ts
  Out of scope: TC_3 (Manual), TC_4 (Out, blank Expected)
  Mode: BDD+DDT

  @sample @unauthenticated
  Scenario Outline: Sample case from dataset
    When the user runs sample case "<caseId>"
    Then the sample case "<caseId>" should pass

    Examples: [<caseId>] <note>
      | caseId             | note                            |
      | homeOpens          | TC_1: open home page            |
      | homeOpensWithQuery | TC_2: open home page with query |
