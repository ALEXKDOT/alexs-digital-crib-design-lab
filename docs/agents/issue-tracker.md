# Issue tracker: GitHub

Issues and specifications live in the GitHub Issues tracker for
`ALEXKDOT/alexs-digital-crib-design-lab`. Use the `gh` CLI for all operations.

## Conventions

- **Verify the target**: `gh repo view --json nameWithOwner`.
- **Create**: `gh issue create --title "..." --body "..."`.
- **Read**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List**: `gh issue list --state open --json number,title,body,labels,comments`.
  Add appropriate `--label` and `--state` filters.
- **Create a sub-issue**: `gh issue create --parent <parent> ...`, or
  `gh issue edit <parent> --add-sub-issue <child>`.
- **Add a dependency**: `gh issue edit <child> --add-blocked-by <blocker>`.
  If native dependencies are unavailable, add `Blocked by: #<number>` to the
  top of the child issue.
- **Count open blockers**:
  `gh api repos/{owner}/{repo}/issues/<number> --jq .issue_dependencies_summary.blocked_by`.
- **Comment**: `gh issue comment <number> --body "..."`.
- **Apply or remove labels**:
  `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- **Close**: explain the outcome in a comment, then run
  `gh issue close <number>`.

Infer the repository from the Git remote. Before the first issue write in a
session, verify that `gh repo view --json nameWithOwner` returns
`ALEXKDOT/alexs-digital-crib-design-lab`.

## Pull requests as a triage surface

**PRs as a request surface: no.**

GitHub shares one number space across issues and pull requests. If a bare issue
number is ambiguous, try `gh pr view <number>` and fall back to
`gh issue view <number>`.

## Skill terminology

- **Publish to the issue tracker**: create a GitHub issue.
- **Fetch the relevant ticket**: read the GitHub issue and its comments.
- **Map**: one issue labelled `wayfinder:map`.
- **Child ticket**: a sub-issue of the map, labelled `wayfinder:<type>`.
- **Claim**: assign the ticket with `gh issue edit <number> --add-assignee @me`.
- **Resolve**: comment with the result, close the ticket, and update the map.
