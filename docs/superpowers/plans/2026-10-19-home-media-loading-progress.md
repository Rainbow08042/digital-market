# Execution Ledger: 2026-10-19-home-media-loading-plan.md

- Task 1: Resource collector and image preloader implemented. Collects the 15 unique configured homepage image URLs; ignores empty entries and employee detail assets.
- Task 2: Readiness gate connected to the existing opening; image failures settle; progress reflects settled image count.
- Task 3: Browser and visual scripts extended for controlled delayed responses, errors and reduced motion.
- Task 4: Independent review by Archimedes completed; six findings evaluated and addressed in the final fix pass. Final verification results recorded below when available.

## Rulings

- This directory has no Git repository. Work directly in the authorized workspace; do not initialize Git or manufacture commit history. No commit-based review or isolated worktree can be supplied.
- Use a dedicated lifecycle regression script rather than expanding the full catalog script further; this permits targeted verification of unmount and media-query changes.
- The all-images requirement also applies to reduced-motion and hash entries. Show a static loading cover for these visits, then skip the animated reveal as before.
- No synthetic timeout releases a still-pending image: slow responses continue to wait; load/decode failures settle as errors. This preserves the requested all-images gate.

## Independent Review

- P1: Async intro escaped GSAP context. Fixed by registering it with the active matchMedia context. Lifecycle regression initially failed, then passed.
- P1: Reverted matchMedia continuation could start an old intro. Fixed with a per-match active flag checked after readiness.
- P1: Reduced motion and hash entries bypassed loading gate. Fixed with a static cover independent of animation preference.
- P2: Image load settled before decoding. Fixed by awaiting decode and settling decoding errors.
- P2: Slow-response tests relied on default navigation load. Fixed with DOMContentLoaded navigation and explicit request release.
- P2: Preference tests only reloaded pages. Added same-document preference and active-unmount regression scenarios.

No deferred minor findings were reported by the independent reviewer.

## Verification After Review Fixes

- `verify-browser.js`: 124 assertions passed, including held requests and single-image failure.
- `verify-loading-lifecycle.js`: 7 assertions passed in a clean browser session. The intermediate timeout was caused by reusing a session with an un-released route from a failed test; clean-session execution passed.
- `verify-responsive.js`: 44 assertions passed across 320, 390, 768, 1440 and 1920 pixels.
- `verify-edge-glow.js`: 25 assertions passed with no runtime errors. Final automated verification totals 200 assertions.
- `npm run build`: production build passed after the review fixes.
- Local Vite server restarted as a hidden background process at http://127.0.0.1:5173/.

## Percentage Revision

- Replaced image-count progress with received response bytes divided by aggregate Content-Length. Missing or encoded response lengths do not produce guessed intermediate percentages.
- Loading copy is `LOADING / N%`, using the same node and center as the following DIGITAL MARKET title. Moved the fixed vertical offset into CSS top positioning so GSAP cannot overwrite it.
- Stream readers and object URLs are cleaned up on cancellation; decoding remains part of the readiness gate, with byte progress capped at 99 until image processing settles.
- Verification: byte-progress Node test passed; browser regression passed 125 checks; lifecycle regression passed 7 checks; loading-label alignment passed 2 checks; production build passed.
- Screenshots: `output/playwright/loading-percent.png` and `output/playwright/loading-brand-alignment.png`.

## Public Deployment

- User authorized production deployment; new release `20261019210902` is active at http://150.158.39.41:8088/.
- Archive and all 38 extracted files verified before atomic current-symlink switch. Previous release `20261015111745` retained.
- Public checks: 44 HTTP/hash checks, 2 loading-label alignment checks and 11 desktop/mobile/route checks passed.
- Both services remain active. Existing Nginx PID/start time and existing download-page SHA-256 unchanged.
- Local SSH key access restricted to current user to satisfy OpenSSH. No private key content uploaded or included in artifacts.
