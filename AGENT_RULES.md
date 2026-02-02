# Agent Rules
1) After any code changes, run: npm run verify
2) If verify fails, fix and re-run until it passes.
3) Do not proceed to new tasks with failing verify.
4) Do not change files outside src/ unless requested.
5) Do not add dependencies unless verify requires it.

## Verification rule (mandatory)
After any code change:
1) Run `npm test`
2) Run `npm run verify`
Never claim verify passed unless command output shows success.
If verify fails, fix it and rerun.