# CODEX.md

## Purpose

Guidance for autonomous agents modifying this Chrome Extension fork.

This project modifies a Manifest V3 Chrome extension. Special care is
required.

------------------------------------------------------------------------

## Critical Rules

### Do Not Rewrite Export Logic

Never modify:

-   ExportService
-   FileExportService
-   Turndown rules
-   Markdown math handling

Autosave must call existing exporter functions.

------------------------------------------------------------------------

### Respect MV3 Architecture

Manifest V3 separates:

-   Content scripts
-   Background service worker
-   Popup UI

Autosave must live in the Gemini content script.

Do not move export logic into background worker.

------------------------------------------------------------------------

### Avoid Breaking Permissions

Do not:

-   Add new permissions
-   Add host permissions
-   Add external APIs
-   Add network calls

Autosave must remain fully local.

------------------------------------------------------------------------

### DOM Mutation Handling

Use MutationObserver with debounce.

Never:

-   Poll faster than 300ms
-   Use blocking loops
-   Trigger export on every mutation

------------------------------------------------------------------------

### Conversation State

Store per-chat state in:

localStorage

Key format:

ai_chat_exporter_autosave_state:`<conversation_key>`{=html}

Do not use chrome.storage for per-chat export state.

------------------------------------------------------------------------

### Safe Filename Rules

Use sanitized conversation title once. Store baseTitle permanently.
Append sequential numbers.

Never regenerate base name after first export.

------------------------------------------------------------------------

### Stop Button Detection

Primary generation signal:

Presence of Stop button.

If Stop exists → do not export. If Stop disappears → generation
complete.

------------------------------------------------------------------------

### UI Injection Rules

Injected widget must:

-   Be small
-   Use inline styles
-   Avoid global CSS pollution
-   Not interfere with Gemini layout

------------------------------------------------------------------------

## Testing Checklist

Agent must verify:

1.  Manual export unchanged.
2.  Autosave disabled → no auto export.
3.  Autosave enabled → auto snapshot after response.
4.  Old chats do not export on open.
5.  Reload does not duplicate export.
6.  Deep Think responses export correctly.
7.  Math formatting preserved.

------------------------------------------------------------------------

## Maintenance Strategy

Keep autosave code isolated. Prefer rebasing over diverging. Minimize
changes to upstream files.

------------------------------------------------------------------------

## Final Rule

This fork is automation-only.

It must remain:

-   Deterministic
-   Offline
-   Private
-   Compatible with upstream updates
