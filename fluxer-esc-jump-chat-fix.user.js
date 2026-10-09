// ==UserScript==
// @name         Fluxer: configurable [Esc] toggle for "jump to Present"
// @namespace    https://github.com/fluxerapp/fluxer
// @version      1.0.1
// @description  Stops [Esc] from scrolling to the bottom of a Fluxer chat (and marking it read). Toggle ON/OFF with Alt+Shift+E. Default OFF ([Esc] does NOT scroll down). The "Jump to present" button is untouched.
// @match        https://cunnyverse.moe/*
// @match        https://web.fluxer.app/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
// To use on other instances add a line like "// @match https://your-instance/*" to the block above, i.e. directly above the line " // @match        https://web.fluxer.app/* ".
(function () {
	"use strict";
	if (window.__fluxerEscJumpPatch) return;
	window.__fluxerEscJumpPatch = true;

	var KEY = "fluxerEscJump"; // "1" = [Esc] jumps (original behaviour); anything else = [Esc] does not jump
	var mem = null;

	function jumpEnabled() {
		try { return window.localStorage.getItem(KEY) === "1"; } catch (_) { return mem === 1; }
	}
	function setJump(on) {
		mem = on ? 1 : 0;
		try { window.localStorage.setItem(KEY, on ? "1" : "0"); } catch (_) {}
	}

	function toast(text) {
		var d = document.createElement("div");
		d.textContent = text;
		d.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#222;color:#fff;padding:8px 14px;border-radius:8px;z-index:2147483647;font:14px sans-serif";
		(document.body || document.documentElement).appendChild(d);
		setTimeout(function () { d.remove(); }, 1800);
	}

	// Wrap keydown listeners whose source dispatches ESCAPE_PRESSED, so [Esc] is
	// ignored by them while the jump is disabled. Everything else is untouched.
	var wrappers = new WeakMap();
	var origAdd = EventTarget.prototype.addEventListener;
	var origRemove = EventTarget.prototype.removeEventListener;

	function isEscJumpListener(fn) {
		if (typeof fn !== "function") return false;
		try {
			var src = Function.prototype.toString.call(fn);
			return src.indexOf("ESCAPE_PRESSED") !== -1 && src.indexOf('"Escape"') !== -1;
		} catch (_) { return false; }
	}

	EventTarget.prototype.addEventListener = function (type, listener, opts) {
		if (type === "keydown" && isEscJumpListener(listener)) {
			var w = wrappers.get(listener);
			if (!w) {
				w = function (ev) {
					if (ev && ev.key === "Escape" && !jumpEnabled()) return;
					return listener.apply(this, arguments);
				};
				wrappers.set(listener, w);
			}
			return origAdd.call(this, type, w, opts);
		}
		return origAdd.call(this, type, listener, opts);
	};
	EventTarget.prototype.removeEventListener = function (type, listener, opts) {
		var w = type === "keydown" && typeof listener === "function" ? wrappers.get(listener) : null;
		return origRemove.call(this, type, w || listener, opts);
	};

	origAdd.call(window, "keydown", function (ev) {
		if (ev.altKey && ev.shiftKey && !ev.ctrlKey && !ev.metaKey && ev.code === "KeyE") {
			ev.preventDefault();
			var on = !jumpEnabled();
			setJump(on);
			toast("[Esc] jump-to-present: " + (on ? "ON" : "OFF"));
		}
	}, true);
})();
