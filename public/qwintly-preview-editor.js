(function () {
  if (window.__qwintlyPreviewEditorInstalled) return;
  window.__qwintlyPreviewEditorInstalled = true;

  const SOURCE = "qwintly-preview-editor";

  const currentScript = document.currentScript;
  const parentOrigin = currentScript?.dataset?.parentOrigin || null;

  let editEnabled = false;
  let hoveredEl = null;
  let activeEl = null;
  let activeOldText = null;
  let toolbar = null;
  let aiButton = null;

  function installStyles() {
    if (document.getElementById("__qwintly_preview_editor_style")) return;
    const style = document.createElement("style");
    style.id = "__qwintly_preview_editor_style";
    style.textContent =
      '#qwintly-editor-toolbar{position:absolute;z-index:2147483647;display:none;gap:6px;padding:6px 8px;background:rgba(15,23,42,.88);color:#fff;border:1px solid rgba(148,163,184,.35);border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,.25);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";font-size:12px;line-height:1}' +
      "#qwintly-editor-toolbar button{appearance:none;border:0;background:rgba(255,255,255,.12);color:#fff;padding:6px 8px;border-radius:8px;cursor:pointer}" +
      "#qwintly-editor-toolbar button:hover{background:rgba(255,255,255,.18)}" +
      "#qwintly-editor-toolbar .qwintly-editor-sep{width:1px;background:rgba(255,255,255,.22);margin:0 2px}" +
      ".qwintly-editor-hover{outline:2px solid rgba(59,130,246,.85)!important;outline-offset:2px!important;box-shadow:0 0 0 3px rgba(59,130,246,.12)!important}" +
      ".qwintly-editor-active{outline:2px solid rgba(34,197,94,.95)!important;outline-offset:2px!important;box-shadow:0 0 0 3px rgba(34,197,94,.16)!important}" +
      "#qwintly-editor-toolbar button[data-action=ai-select]{background:linear-gradient(135deg,#6366f1 0%,#a855f7 100%)!important;border:1px solid rgba(255,255,255,.25)!important;display:flex;align-items:center;justify-content:center;padding:5px 7px}" +
      "#qwintly-editor-toolbar button[data-action=ai-select]:hover{background:linear-gradient(135deg,#4f46e5 0%,#9333ea 100%)!important;box-shadow:0 0 8px rgba(99,102,241,.5)}" +
      "#qwintly-ai-selector-btn{position:absolute;z-index:2147483646;display:none;align-items:center;justify-content:center;width:28px;height:28px;background:linear-gradient(135deg,#6366f1 0%,#a855f7 100%);color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:50%;box-shadow:0 4px 12px rgba(99,102,241,.35),0 2px 4px rgba(0,0,0,.1);cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;padding:0}" +
      "#qwintly-ai-selector-btn:hover{transform:scale(1.1);box-shadow:0 6px 16px rgba(99,102,241,.5),0 4px 8px rgba(0,0,0,.15);background:linear-gradient(135deg,#4f46e5 0%,#9333ea 100%)}";
    (document.head || document.documentElement).appendChild(style);
  }

  function isEligibleEl(el) {
    if (el?.nodeType !== 1) return false;
    const tag = (el.tagName || "").toLowerCase();
    if (
      tag === "html" ||
      tag === "body" ||
      tag === "head" ||
      tag === "script" ||
      tag === "style"
    )
      return false;
    if (!el.id) return false;
    if (el.closest?.("#qwintly-editor-toolbar") || el.closest?.("#qwintly-ai-selector-btn")) return false;
    return true;
  }

  function clearHover() {
    if (hoveredEl) hoveredEl.classList.remove("qwintly-editor-hover");
    hoveredEl = null;
    hideAiButton();
  }

  function clearActive() {
    if (activeEl) {
      activeEl.classList.remove("qwintly-editor-active");
      try {
        activeEl.contentEditable = "false";
      } catch {}
      activeEl = null;
    }
    activeOldText = null;
  }

  function ensureToolbar() {
    if (toolbar && document.body.contains(toolbar)) return toolbar;
    toolbar = document.createElement("div");
    toolbar.id = "qwintly-editor-toolbar";
    toolbar.innerHTML =
      '<button type="button" data-action="ai-select" title="Select with AI">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/></svg>' +
      '</button>' +
      '<span class="qwintly-editor-sep"></span>' +
      '<button type="button" data-action="confirm" title="Confirm">&#10003;</button>' +
      '<button type="button" data-action="cancel" title="Cancel">&#10005;</button>' +
      '<span class="qwintly-editor-sep"></span>' +
      '<button type="button" data-action="delete" title="Delete">DEL</button>';
    toolbar.addEventListener("mousedown", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
    toolbar.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const btn = e.target?.closest?.("button[data-action]") || null;
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === "confirm") confirmEdit();
      else if (action === "cancel") cancelEdit();
      else if (action === "delete") deleteActiveEl();
      else if (action === "ai-select") selectActiveElWithAi();
    });
    document.body.appendChild(toolbar);
    return toolbar;
  }

  function selectActiveElWithAi() {
    if (!activeEl?.id) return;
    const elId = activeEl.id;
    clearActive();
    hideToolbar();
    postToParent({
      type: "ELEMENT_SELECTED",
      id: elId,
    });
  }

  function ensureAiButton() {
    if (aiButton && document.body.contains(aiButton)) return aiButton;
    aiButton = document.createElement("button");
    aiButton.id = "qwintly-ai-selector-btn";
    aiButton.type = "button";
    aiButton.title = "Select with AI";
    aiButton.innerHTML =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/></svg>';
    aiButton.addEventListener("mousedown", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
    aiButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!hoveredEl?.id) return;
      const elId = hoveredEl.id;
      clearHover();
      postToParent({
        type: "ELEMENT_SELECTED",
        id: elId,
      });
    });
    document.body.appendChild(aiButton);
    return aiButton;
  }

  function positionAiButtonFor(el) {
    const btn = ensureAiButton();
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY - 12;
    const left = rect.right + window.scrollX - 16;
    btn.style.top = Math.max(4, top) + "px";
    btn.style.left = Math.max(4, Math.min(window.innerWidth + window.scrollX - 32, left)) + "px";
    btn.style.display = "flex";
  }

  function hideAiButton() {
    if (!aiButton) return;
    aiButton.style.display = "none";
  }

  function positionToolbarFor(el) {
    const t = ensureToolbar();
    const rect = el.getBoundingClientRect();
    const top = Math.max(8, rect.top + window.scrollY - 42);
    const left = Math.max(8, rect.left + window.scrollX);
    t.style.top = top + "px";
    t.style.left = left + "px";
    t.style.display = "flex";
  }

  function hideToolbar() {
    if (!toolbar) return;
    toolbar.style.display = "none";
  }

  function postToParent(payload) {
    try {
      if (!window.parent) return;
      window.parent.postMessage(
        { source: SOURCE, ...payload },
        parentOrigin || "*",
      );
    } catch {}
  }

  function startEdit(el) {
    clearHover();
    clearActive();
    activeEl = el;
    activeOldText = el.innerText == null ? "" : String(el.innerText);
    el.classList.add("qwintly-editor-active");
    try {
      el.contentEditable = "true";
      el.focus({ preventScroll: true });
    } catch {}
    positionToolbarFor(el);
  }

  function confirmEdit() {
    if (!activeEl?.id) return;
    const elId = activeEl.id;
    const newText =
      activeEl.innerText == null ? "" : String(activeEl.innerText);
    const oldText = activeOldText == null ? "" : String(activeOldText);
    clearActive();
    hideToolbar();
    if (newText === oldText) return;
    postToParent({
      type: "OP_CONFIRMED",
      op: { kind: "text", id: elId, oldText: oldText, newText: newText },
    });
  }

  function cancelEdit() {
    if (!activeEl) return;
    try {
      activeEl.innerText = activeOldText == null ? "" : String(activeOldText);
    } catch {}
    clearActive();
    hideToolbar();
  }

  function deleteActiveEl() {
    if (!activeEl?.id) return;
    const el = activeEl;
    const parent = el.parentElement;
    if (!parent?.id) return;
    let next = el.nextElementSibling;
    while (next && !next.id) next = next.nextElementSibling;
    const payload = {
      kind: "delete",
      id: el.id,
      parentId: parent.id,
      nextSiblingId: next ? next.id : null,
      oldOuterHTML: el.outerHTML,
    };
    clearActive();
    hideToolbar();
    try {
      el.remove();
    } catch {}
    postToParent({ type: "OP_CONFIRMED", op: payload });
  }

  function applyOp(op) {
    if (!op?.kind || !op.id) return;
    if (op.kind === "text") {
      const el = document.getElementById(op.id);
      if (el) el.innerText = op.newText || "";
    } else if (op.kind === "delete") {
      const del = document.getElementById(op.id);
      if (del) del.remove();
    }
  }

  function revertTextOp(op) {
    const el = document.getElementById(op.id);
    if (el) el.innerText = op.oldText || "";
  }

  function revertDeleteOp(op) {
    const parent = document.getElementById(op.parentId);
    if (!parent) return;
    if (document.getElementById(op.id)) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(op.oldOuterHTML || "", "text/html");
    const node = doc.body.firstElementChild;
    if (!node) return;

    const before = op.nextSiblingId
      ? document.getElementById(op.nextSiblingId)
      : null;
    if (before?.parentElement === parent) {
      before.before(node);
    } else {
      parent.appendChild(node);
    }
  }

  function revertOp(op) {
    if (!op?.kind || !op.id) return;
    if (op.kind === "text") {
      revertTextOp(op);
    } else if (op.kind === "delete") {
      revertDeleteOp(op);
    }
  }

  function onMouseOver(e) {
    if (!editEnabled) return;
    const el = e.target;
    if (!isEligibleEl(el)) return;
    if (hoveredEl === el) return;
    clearHover();
    hoveredEl = el;
    hoveredEl.classList.add("qwintly-editor-hover");
    positionAiButtonFor(hoveredEl);
  }

  function onMouseOut(e) {
    if (!editEnabled) return;
    const el = e.target;
    const related = e.relatedTarget;

    if (
      (el === hoveredEl && (related === aiButton || related?.closest?.("#qwintly-ai-selector-btn"))) ||
      ((el === aiButton || el?.closest?.("#qwintly-ai-selector-btn")) && related === hoveredEl)
    ) {
      return;
    }

    if (hoveredEl && el === hoveredEl) {
      clearHover();
    } else if ((el === aiButton || el?.closest?.("#qwintly-ai-selector-btn")) && related !== hoveredEl) {
      clearHover();
    }
  }

  function onClick(e) {
    if (!editEnabled) return;
    const el = e.target;
    if (!isEligibleEl(el)) return;
    e.preventDefault();
    e.stopPropagation();
    startEdit(el);
  }

  function onKeyDown(e) {
    if (!editEnabled) return;
    if (!activeEl) return;
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
      return;
    }
    if ((e.key === "Enter" && (e.metaKey || e.ctrlKey)) || e.key === "F2") {
      e.preventDefault();
      confirmEdit();
      return;
    }
    // Allow normal text editing keys (Backspace/Delete) while contentEditable.
    // Use Ctrl/Cmd+Backspace/Delete as an explicit shortcut to delete the whole element.
    if (
      (e.key === "Delete" || e.key === "Backspace") &&
      (e.metaKey || e.ctrlKey) &&
      !e.shiftKey &&
      !e.altKey
    ) {
      e.preventDefault();
      deleteActiveEl();
    }
  }

  window.addEventListener("message", function (event) {
    if (event.source !== window.parent) return;
    if (parentOrigin && event.origin !== parentOrigin) return;
    const data = event?.data;
    if (data?.source !== SOURCE) return;

    if (data.type === "PING") {
      postToParent({
        type: "READY",
        route: location.pathname + location.search + location.hash,
      });
      return;
    }
    if (data.type === "SET_EDIT_MODE") {
      editEnabled = Boolean(data.enabled);
      clearHover();
      if (!editEnabled) {
        cancelEdit();
        hideToolbar();
      }
      return;
    }
    if (data.type === "APPLY_OP") return applyOp(data.op);
    if (data.type === "REVERT_OP") return revertOp(data.op);
  });

  installStyles();
  document.addEventListener("mouseover", onMouseOver, true);
  document.addEventListener("mouseout", onMouseOut, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKeyDown, true);

  // --- ADDED NAVIGATION OBSERVER ---
  function notifyRouteChange() {
    postToParent({
      type: "ROUTE",
      route:
        window.location.pathname +
        window.location.search +
        window.location.hash,
    });
  }

  (function () {
    const originalPushState = window.history.pushState;
    window.history.pushState = function () {
      originalPushState.apply(window.history, arguments);
      notifyRouteChange();
    };
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function () {
      originalReplaceState.apply(window.history, arguments);
      notifyRouteChange();
    };
  })();
  window.addEventListener("popstate", notifyRouteChange);
  window.addEventListener("hashchange", notifyRouteChange);
  // ---------------------------------

  postToParent({
    type: "READY",
    route: location.pathname + location.search + location.hash,
  });
})();
