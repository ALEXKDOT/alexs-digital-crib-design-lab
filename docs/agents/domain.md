# Domain docs

This repository uses a single domain context.

## Before exploring

Read these when they exist and are relevant to the work:

- `GLOSSARY.md` at the repository root.
- ADRs under `docs/adr/` that affect the area being changed.

If they do not exist, proceed silently. The domain-modeling workflow creates
them when terminology or architectural decisions need to be recorded.

## Layout

```text
/
├── GLOSSARY.md
├── docs/
│   └── adr/
└── src/
```

## Vocabulary

Use terms as defined in `GLOSSARY.md` in issue titles, proposals, tests, and
implementation notes. If a needed concept is absent, reconsider whether it
belongs to the existing vocabulary or record the gap for domain modeling.

## ADR conflicts

Surface conflicts with existing ADRs explicitly instead of silently overriding
them. Name the ADR and explain why the decision may need to be revisited.
