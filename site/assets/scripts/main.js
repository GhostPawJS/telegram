// Replays a recorded run of @ghostpaw/telegram 0.6.2 (2026-10-24, fixed clock). Without this script every step and result stays visible.
const STATES = [{"rows": [{"k": "Messages stored", "v": "0"}, {"k": "Edits kept", "v": "0"}, {"k": "Outbound calls", "v": "0"}, {"k": "Last read", "v": "—"}, {"k": "Tool result", "v": "—"}], "foot": "Eight empty tables after initTelegramTables(db)."}, {"rows": [{"k": "Messages stored", "v": "1 · Lena, msg 10", "t": "cyan"}, {"k": "Edits kept", "v": "0"}, {"k": "Outbound calls", "v": "0"}, {"k": "Last read", "v": "handler: row already stored", "t": "cyan"}, {"k": "Tool result", "v": "—"}], "foot": "Stored before onMessage ran."}, {"rows": [{"k": "Messages stored", "v": "1"}, {"k": "Edits kept", "v": "0"}, {"k": "Outbound calls", "v": "1 · sendMessage", "t": "cyan"}, {"k": "Last read", "v": "—"}, {"k": "Tool result", "v": "—"}], "foot": "The handler's reply went to the stand-in."}, {"rows": [{"k": "Messages stored", "v": "1 · msg 10 edited", "t": "violet"}, {"k": "Edits kept", "v": "1 · “…shared drive.”", "t": "violet"}, {"k": "Outbound calls", "v": "1"}, {"k": "Last read", "v": "—"}, {"k": "Tool result", "v": "—"}], "foot": "The old text is kept as edit history."}, {"rows": [{"k": "Messages stored", "v": "2 · Jun, msg 11", "t": "cyan"}, {"k": "Edits kept", "v": "1"}, {"k": "Outbound calls", "v": "1"}, {"k": "Last read", "v": "replyChain → 10, 11", "t": "violet"}, {"k": "Tool result", "v": "—"}], "foot": "Reply edges come from reply_to_message."}, {"rows": [{"k": "Messages stored", "v": "2"}, {"k": "Edits kept", "v": "1"}, {"k": "Outbound calls", "v": "1"}, {"k": "Last read", "v": "search “cafe” → 11, 10", "t": "cyan"}, {"k": "Tool result", "v": "—"}], "foot": "Diacritics folded: cafe finds café. The index has the edited text."}, {"rows": [{"k": "Messages stored", "v": "2"}, {"k": "Edits kept", "v": "1"}, {"k": "Outbound calls", "v": "1 · still one", "t": "ward"}, {"k": "Last read", "v": "—"}, {"k": "Tool result", "v": "tg_send · plan", "t": "ward"}], "foot": "A plan. Nothing was sent."}];
(() => {
  const list = document.getElementById("state-list");
  const foot = document.getElementById("state-foot");
  const steps = Array.from(document.querySelectorAll(".step"));
  const reset = document.getElementById("reset");
  const status = document.getElementById("run-status");
  if (!list || !steps.length) return;
  const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  let at = 0;

  function paint(i) {
    const s = STATES[i];
    list.textContent = "";
    for (const r of s.rows) {
      const li = document.createElement("li");
      if (r.t) li.className = "t-" + r.t;
      const k = document.createElement("span"); k.className = "k"; k.textContent = r.k;
      const v = document.createElement("span"); v.className = "v"; v.textContent = r.v;
      li.append(k, v);
      if (r.w != null) {
        const bar = document.createElement("span"); bar.className = "bar";
        const fill = document.createElement("i");
        bar.append(fill); li.append(bar);
        const w = Math.max(0, Math.min(1, r.w)) * 100 + "%";
        const from = list.dataset.prev && JSON.parse(list.dataset.prev)[r.k];
        fill.style.width = motion && from != null ? from : w;
        if (motion && from != null) requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = w; }));
      }
      list.append(li);
    }
    const prev = {};
    for (const r of s.rows) if (r.w != null) prev[r.k] = Math.max(0, Math.min(1, r.w)) * 100 + "%";
    list.dataset.prev = JSON.stringify(prev);
    if (foot) foot.textContent = s.foot || "";
  }

  function mark() {
    steps.forEach((el, i) => {
      el.classList.toggle("done", i < at);
      el.classList.toggle("next", i === at);
    });
    if (status) status.textContent = at < steps.length ? "Step " + (at + 1) + " of " + steps.length + " is next." : "All " + steps.length + " steps replayed.";
  }

  steps.forEach((el, i) => {
    const btn = el.querySelector(".run-btn");
    btn.addEventListener("click", () => {
      if (i !== at) return;
      at = i + 1;
      paint(at);
      mark();
      if (el.classList.contains("refused") && motion) {
        el.classList.add("flash");
        el.addEventListener("animationend", () => el.classList.remove("flash"), { once: true });
      }
      const next = steps[at] && steps[at].querySelector(".run-btn");
      const res = el.querySelector(".result");
      if (res) { res.setAttribute("tabindex", "-1"); res.focus({ preventScroll: true }); }
      if (next) next.setAttribute("aria-describedby", "run-status");
    });
  });
  if (reset) reset.addEventListener("click", () => { at = 0; list.dataset.prev = ""; paint(0); mark(); steps[0].querySelector(".run-btn").focus(); });
  paint(0);
  mark();

  document.querySelectorAll(".copy").forEach((b) => {
    b.addEventListener("click", async () => {
      const input = document.getElementById(b.dataset.copy);
      try { await navigator.clipboard.writeText(input.value); } catch { input.select(); document.execCommand("copy"); }
      const label = b.textContent;
      b.textContent = "Copied";
      setTimeout(() => { b.textContent = label; }, 1400);
    });
  });
})();
