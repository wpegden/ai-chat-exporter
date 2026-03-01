# AGENTS.md

## Project Overview

This repository is a private fork of:

https://github.com/amazingpaddy/ai-chat-exporter

The upstream project provides high-quality export of AI chat
conversations (including Gemini) into Markdown, PDF, JSON, and other
formats.

This fork does NOT change the core exporter.

Instead, it extends the project with automatic, privacy-preserving
export of Gemini chats without user interaction.

The existing Markdown and LaTeX handling pipeline must be reused.

------------------------------------------------------------------------

## Primary Objective

Implement automatic Gemini chat exporting that:

1.  Detects when Gemini finishes generating a response.
2.  Automatically exports a Markdown snapshot.
3.  Produces stable sequential files.
4.  Never exports historical chats when first opened.
5.  Requires zero manual clicks.
6.  Maintains full compatibility with upstream exporter logic.

------------------------------------------------------------------------

## Core Principles

### 1. Reuse Existing Export Pipeline

Do NOT reimplement Markdown conversion.

Always call:

ExportService.buildMarkdown(...) FileExportService.downloadMarkdown(...)

The upstream exporter already correctly handles:

-   LaTeX
-   MathJax
-   KaTeX
-   Code blocks
-   Tables
-   Formatting edge cases

Reimplementation is forbidden.

------------------------------------------------------------------------

### 2. Autosave Is Gemini-Only

Autosave must:

-   Run only on gemini.google.com
-   Live inside src/content_scripts/gemini.js
-   Not affect ChatGPT, Claude, or other platforms

------------------------------------------------------------------------

### 3. Preserve Upstream Behavior

If autosave is disabled:

-   The extension must behave identically to upstream.

Autosave is strictly additive.

------------------------------------------------------------------------

## Functional Requirements

### Stable Filename System

Each Gemini conversation receives a permanent base filename:

Example:

Persistent Browser Architecture-01.md Persistent Browser
Architecture-02.md

Rules:

-   Base name chosen once per conversation
-   Stored locally
-   Never changes if Gemini renames chat
-   Sequential numbering increases monotonically
-   Files are append-only snapshots

------------------------------------------------------------------------

### Conversation Identity

Derived from:

location.pathname (/app/`<conversation_id>`{=html})

Fallback:

location.href

State stored using:

localStorage key:
ai_chat_exporter_autosave_state:`<conversation_key>`{=html}

------------------------------------------------------------------------

### Baseline Protection (Critical)

When opening an existing chat:

-   Do NOT export immediately.
-   Record current turn count as baselineTurns.
-   Only export when turns exceed baseline.

------------------------------------------------------------------------

### Generation Detection

Primary signal:

Stop button presence.

If Stop button exists → generation ongoing. If Stop button disappears →
generation complete.

Secondary signals:

-   Progress indicators
-   aria-busy
-   Spinners

------------------------------------------------------------------------

### Debounce

Wait:

-   = 1.6 seconds after last DOM mutation

-   = 1.2 seconds after generation completes

------------------------------------------------------------------------

### Autosave UI

Inject minimal widget bottom-left:

States:

-   Not downloaded
-   Waiting
-   Downloaded

Button:

Force → creates new numbered snapshot.

------------------------------------------------------------------------

### Snapshot Behavior

Each autosave creates a full conversation snapshot.

Do NOT export only last turn.

------------------------------------------------------------------------

### Deduplication

Use simple hash:

hash = turns.length + markdown.length

If unchanged → skip export.

------------------------------------------------------------------------

## Security & Privacy

All autosave functionality must:

-   Operate fully client-side
-   Never transmit chat data
-   Never add analytics
-   Never log sensitive content

------------------------------------------------------------------------

## Acceptance Criteria

Autosave is correct only if:

-   LaTeX identical to manual export
-   No export on first open of old chat
-   Exactly one export per completed response
-   Deep Think mode works
-   Reload does not duplicate export
-   Rename does not affect filenames
-   Manual export unchanged
