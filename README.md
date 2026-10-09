# Fluxer Esc "jump to present" toggle (userscript)

In Fluxer chat, pressing **[Esc]** scrolls you to the bottom of the channel and marks it read, even when every keyboard shortcut is disabled. I disagree with this behavior. The listener is hard-coded and fires on any [Esc] that nothing else has already handled (`defaultPrevented` is false). So closing an image preview with [Esc] can also yank you to the bottom of the chat, which is how I ended up writing this.

This userscript stops that. The "Jump to Present" button is not touched and keeps working. Note that the button is only shown when you are viewing an older window of messages and newer ones are waiting to be loaded (`newerPageAvailable`), so in normal use there is no on-screen way to scroll down, as far as I can tell, besides scrolling or pressing [End] with the main chat window selected.

- **Default: OFF.** [Esc] no longer scrolls you down.
- **Alt+Shift+E** toggles it ON/OFF and shows a small toast to inform of selected mode. ON restores the original behaviour.
- Other [Esc] behaviour (closing dialogs, cancelling a reply or edit, and so on) is unchanged.
- Side effect: while OFF, [Esc] also no longer marks the channel as read, because both happen in the same handler.
- The setting is saved in your browser if storage is available. Otherwise it lives in memory and resets to OFF on reload.

## Install

1. Install a userscript manager such as Tampermonkey or Violentmonkey.
2. Open the script from the main branch. It should be the most up-to-date version. Look for the file `fluxer-esc-jump-chat-fix.user.js`
3. If the manager intercepts it, it opens an install page with the source. Read it before confirming. It is about 80 lines. Do not install a script you have not looked at.
4. If nothing happens, or the browser just downloads the file, install it by hand:
   - Tampermonkey: click the extension icon, then Dashboard, then the + tab (Create a new script).
   - Violentmonkey: click the extension icon, then Open Dashboard, then the + button.
   - Select all of the template it inserts (Ctrl+A), delete it, and paste the full contents of `fluxer-esc-jump-chat-fix.user.js`.
   - Save with Ctrl+S, or File, then Save. The tab name should change to the script name from the header. Close the editor.

It matches `cunnyverse.moe` and `web.fluxer.app`. For another instance, add a line like this to the header and reinstall:

```
// @match        https://your-instance.example/*
```

## Why you can trust (and check) it

The script is small on purpose. You can verify these claims yourself:

- No network requests: no `fetch`, `XMLHttpRequest`, `WebSocket`, or `sendBeacon`.
- No `eval` or `new Function`, and no external code (`@require`).
- No `GM_*` privileges (`@grant none`), and no auto-update URL, so it never changes unless you install a new version yourself.
- It only reads and writes one `localStorage` key, `fluxerEscJump`, and inspects the source text of keydown listeners to find the one that triggers the jump.

Check what you installed against the published checksum:

```
sha256sum fluxer-esc-jump-chat-fix.user.js
```

| Release | SHA-256 |
| --- | --- |
| v1.0.1 | `A000FE5F132A367DB1F198EF213A304D8B4604F34C465F6E6BA3565FAF2420A1` |

## How it works

Fluxer registers a hard-coded `keydown` listener that sends an `ESCAPE_PRESSED` event on [Esc], bypassing the keybind settings. The script wraps `addEventListener` and, for keydown listeners whose source contains `ESCAPE_PRESSED`, skips them on [Esc] while the toggle is OFF. Nothing else is modified.

This is a stopgap. A proper fix belongs in Fluxer itself, so that the Escape behaviour follows the "Mark channel as read" keybind setting.

## Caveats

- Built against the Fluxer web client as of October 2026. A refactor of the [Esc] handler could break it. Open an issue if it stops working.
- The built-in "Mark channel as read" keybind (also [Esc] by default) can still trigger a jump in channels with unread messages. Disable that keybind in Settings → Keybinds if you want to block it as well.

## License

WTFPL. Do what you want.
