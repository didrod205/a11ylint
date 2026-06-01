---
name: Bug report
about: A wrong or unexpected lint result
title: ""
labels: bug
assignees: ""
---

**What happened**
A clear description of the bug.

**Minimal reproduction**
The smallest HTML snippet that triggers it:

```html
<img src="a.png">
```

```bash
a11ylint scan ...
```

**Expected vs actual**
What you expected, and what a11ylint reported (paste the rule id, e.g.
`img-alt`, and the WCAG criterion if relevant).

**Environment**
- a11ylint version: (`a11ylint --version`)
- Node version: (`node -v`)
- OS:
