import { useState, useEffect, useMemo } from "react";

export function WidgetConfigurator() {
  const [chains, setChains] = useState([]);
  const [fromChainId, setFromChainId] = useState("8453");
  const [toChainId, setToChainId] = useState("42161");
  const [fromTokens, setFromTokens] = useState([]);
  const [toTokens, setToTokens] = useState([]);
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [chainSearch, setChainSearch] = useState("");
  const [loadingFrom, setLoadingFrom] = useState(false);
  const [loadingTo, setLoadingTo] = useState(false);
  const [copied, setCopied] = useState(null);
  const [tab, setTab] = useState("iframe");

  // Fetch chains
  useEffect(() => {
    fetch("https://li.quest/v1/chains?chainTypes=EVM,SVM,UTXO,MVM")
      .then((r) => r.json())
      .then((data) => {
        const lifi = (data.chains || []).map((c) => ({
          id: c.id, name: c.name, coin: c.coin || c.nativeToken?.symbol || "", logoURI: c.logoURI,
        }));
        const extra = [
          { id: 900000001, name: "NEAR", coin: "NEAR" },
          { id: 900000002, name: "TON", coin: "TON" },
          { id: 900000003, name: "Tron", coin: "TRX" },
          { id: 900000004, name: "XRP Ledger", coin: "XRP" },
          { id: 900000005, name: "Dogecoin", coin: "DOGE" },
        ];
        const ids = new Set(lifi.map((c) => c.id));
        setChains([...lifi, ...extra.filter((c) => !ids.has(c.id))]);
      })
      .catch(() => {});
  }, []);

  // Fetch tokens for from chain
  useEffect(() => {
    if (!fromChainId) return;
    setLoadingFrom(true);
    setFromToken("");
    setFromSearch("");
    fetch(`https://li.quest/v1/tokens?chains=${fromChainId}`)
      .then((r) => r.json())
      .then((data) => setFromTokens((data.tokens?.[fromChainId] || []).map((t) => ({
        address: t.address, symbol: t.symbol, name: t.name, logoURI: t.logoURI,
      }))))
      .catch(() => setFromTokens([]))
      .finally(() => setLoadingFrom(false));
  }, [fromChainId]);

  // Fetch tokens for to chain
  useEffect(() => {
    if (!toChainId) return;
    setLoadingTo(true);
    setToToken("");
    setToSearch("");
    fetch(`https://li.quest/v1/tokens?chains=${toChainId}`)
      .then((r) => r.json())
      .then((data) => setToTokens((data.tokens?.[toChainId] || []).map((t) => ({
        address: t.address, symbol: t.symbol, name: t.name, logoURI: t.logoURI,
      }))))
      .catch(() => setToTokens([]))
      .finally(() => setLoadingTo(false));
  }, [toChainId]);

  const filteredChains = useMemo(() => {
    if (!chainSearch.trim()) return chains;
    const q = chainSearch.toLowerCase();
    return chains.filter((c) => c.name.toLowerCase().includes(q) || c.coin.toLowerCase().includes(q) || String(c.id).includes(q));
  }, [chains, chainSearch]);

  const filteredFromTokens = useMemo(() => {
    const list = fromSearch.trim()
      ? fromTokens.filter((t) => t.symbol.toLowerCase().includes(fromSearch.toLowerCase()) || t.name.toLowerCase().includes(fromSearch.toLowerCase()))
      : fromTokens;
    return list.slice(0, 80);
  }, [fromTokens, fromSearch]);

  const filteredToTokens = useMemo(() => {
    const list = toSearch.trim()
      ? toTokens.filter((t) => t.symbol.toLowerCase().includes(toSearch.toLowerCase()) || t.name.toLowerCase().includes(toSearch.toLowerCase()))
      : toTokens;
    return list.slice(0, 80);
  }, [toTokens, toSearch]);

  const fromChain = chains.find((c) => String(c.id) === fromChainId);
  const toChain = chains.find((c) => String(c.id) === toChainId);
  const selectedFromToken = fromTokens.find((t) => t.address === fromToken);
  const selectedToToken = toTokens.find((t) => t.address === toToken);

  const iframeCode = useMemo(() => {
    const p = ["embed=1", "theme=dark", `fromChain=${fromChainId}`, `toChain=${toChainId}`];
    if (fromToken) p.push(`fromToken=${encodeURIComponent(fromToken)}`);
    if (toToken) p.push(`toToken=${encodeURIComponent(toToken)}`);
    return `<iframe\n  src="https://www.hypermid.io/widget?${p.join("&")}"\n  width="470"\n  height="700"\n  frameborder="0"\n  allow="clipboard-write; payment; web-share"\n  style="border: none; border-radius: 16px;"\n></iframe>`;
  }, [fromChainId, toChainId, fromToken, toToken]);

  const scriptCode = useMemo(() => {
    const lines = [`  containerId: "hypermid-widget",`, `  theme: "dark",`, `  defaultFromChain: ${fromChainId},`, `  defaultToChain: ${toChainId},`];
    if (fromToken) lines.push(`  defaultFromToken: "${fromToken}",`);
    if (toToken) lines.push(`  defaultToToken: "${toToken}",`);
    return `<div id="hypermid-widget"></div>\n\n<script src="https://widget.hypermid.io/v1/embed.js"></script>\n<script>\n  HypermidWidget.init({\n${lines.join("\n")}\n  });\n</script>`;
  }, [fromChainId, toChainId, fromToken, toToken]);

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const labelStyle = { fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--tw-prose-headings, #1a202c)" };
  const cardStyle = { border: "1px solid var(--tw-prose-hr, #e2e8f0)", borderRadius: 12, padding: 16, marginBottom: 16, background: "var(--tw-prose-bg, transparent)" };
  const inputStyle = { width: "100%", fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--tw-prose-hr, #e2e8f0)", background: "transparent", color: "inherit", boxSizing: "border-box" };
  const listStyle = { maxHeight: 200, overflowY: "auto", border: "1px solid var(--tw-prose-hr, #e2e8f0)", borderRadius: 8 };
  const itemStyle = (selected) => ({
    display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 12px", border: "none", borderBottom: "1px solid var(--tw-prose-hr, #e2e8f0)",
    background: selected ? "rgba(68, 225, 170, 0.1)" : "transparent", color: selected ? "#44E1AA" : "inherit", cursor: "pointer", fontSize: 13, textAlign: "left",
  });
  const badgeStyle = { fontSize: 11, padding: "4px 12px", borderRadius: 8, border: "1px solid var(--tw-prose-hr, #e2e8f0)", cursor: "pointer", fontWeight: 500 };

  return (
    <div style={{ marginTop: 16 }}>
      {/* Selection summary */}
      <div style={{ ...cardStyle, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, opacity: 0.6, marginBottom: 4 }}>From</div>
          <div style={{ fontWeight: 600 }}>{fromChain?.name || "—"}</div>
          {selectedFromToken && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              {selectedFromToken.logoURI && <img src={selectedFromToken.logoURI} alt="" width={16} height={16} style={{ borderRadius: "50%" }} />}
              <span style={{ fontSize: 13 }}>{selectedFromToken.symbol}</span>
            </div>
          )}
          {!selectedFromToken && <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>Native token</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 20 }}>→</div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, opacity: 0.6, marginBottom: 4 }}>To</div>
          <div style={{ fontWeight: 600 }}>{toChain?.name || "—"}</div>
          {selectedToToken && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              {selectedToToken.logoURI && <img src={selectedToToken.logoURI} alt="" width={16} height={16} style={{ borderRadius: "50%" }} />}
              <span style={{ fontSize: 13 }}>{selectedToToken.symbol}</span>
            </div>
          )}
          {!selectedToToken && <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>Native token</div>}
        </div>
      </div>

      {/* Chain search */}
      <input
        type="text"
        value={chainSearch}
        onChange={(e) => setChainSearch(e.target.value)}
        placeholder="Search chains by name, symbol, or ID..."
        style={{ ...inputStyle, marginBottom: 16 }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* From column */}
        <div>
          <div style={labelStyle}>From Chain</div>
          <div style={listStyle}>
            {filteredChains.map((c) => (
              <button key={c.id} type="button" onClick={() => setFromChainId(String(c.id))} style={itemStyle(String(c.id) === fromChainId)}>
                {c.logoURI ? <img src={c.logoURI} alt="" width={18} height={18} style={{ borderRadius: 4 }} /> : <span style={{ width: 18, height: 18, borderRadius: 4, background: "#e2e8f0", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{c.coin[0]}</span>}
                <span style={{ flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: 10, opacity: 0.5, fontFamily: "monospace" }}>{c.coin}</span>
              </button>
            ))}
          </div>

          <div style={{ ...labelStyle, marginTop: 16 }}>
            From Token
            {loadingFrom && <span style={{ color: "#44E1AA", fontSize: 11, marginLeft: 8 }}>loading...</span>}
            {!loadingFrom && <span style={{ opacity: 0.5, fontSize: 11, marginLeft: 8 }}>({fromTokens.length})</span>}
          </div>
          <input type="text" value={fromSearch} onChange={(e) => setFromSearch(e.target.value)} placeholder="Search tokens..." style={{ ...inputStyle, marginBottom: 8 }} />
          <div style={listStyle}>
            <button type="button" onClick={() => setFromToken("")} style={itemStyle(!fromToken)}>Native (default)</button>
            {filteredFromTokens.map((t) => (
              <button key={t.address} type="button" onClick={() => setFromToken(t.address)} style={itemStyle(t.address === fromToken)}>
                {t.logoURI && <img src={t.logoURI} alt="" width={16} height={16} style={{ borderRadius: "50%" }} />}
                <span style={{ fontWeight: 500, minWidth: 50 }}>{t.symbol}</span>
                <span style={{ flex: 1, fontSize: 11, opacity: 0.5 }}>{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* To column */}
        <div>
          <div style={labelStyle}>To Chain</div>
          <div style={listStyle}>
            {filteredChains.map((c) => (
              <button key={c.id} type="button" onClick={() => setToChainId(String(c.id))} style={itemStyle(String(c.id) === toChainId)}>
                {c.logoURI ? <img src={c.logoURI} alt="" width={18} height={18} style={{ borderRadius: 4 }} /> : <span style={{ width: 18, height: 18, borderRadius: 4, background: "#e2e8f0", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{c.coin[0]}</span>}
                <span style={{ flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: 10, opacity: 0.5, fontFamily: "monospace" }}>{c.coin}</span>
              </button>
            ))}
          </div>

          <div style={{ ...labelStyle, marginTop: 16 }}>
            To Token
            {loadingTo && <span style={{ color: "#44E1AA", fontSize: 11, marginLeft: 8 }}>loading...</span>}
            {!loadingTo && <span style={{ opacity: 0.5, fontSize: 11, marginLeft: 8 }}>({toTokens.length})</span>}
          </div>
          <input type="text" value={toSearch} onChange={(e) => setToSearch(e.target.value)} placeholder="Search tokens..." style={{ ...inputStyle, marginBottom: 8 }} />
          <div style={listStyle}>
            <button type="button" onClick={() => setToToken("")} style={itemStyle(!toToken)}>Native (default)</button>
            {filteredToTokens.map((t) => (
              <button key={t.address} type="button" onClick={() => setToToken(t.address)} style={itemStyle(t.address === toToken)}>
                {t.logoURI && <img src={t.logoURI} alt="" width={16} height={16} style={{ borderRadius: "50%" }} />}
                <span style={{ fontWeight: 500, minWidth: 50 }}>{t.symbol}</span>
                <span style={{ flex: 1, fontSize: 11, opacity: 0.5 }}>{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated code */}
      <div style={{ ...cardStyle, marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 4 }}>
            <button type="button" onClick={() => setTab("iframe")} style={{ ...badgeStyle, background: tab === "iframe" ? "#44E1AA" : "transparent", color: tab === "iframe" ? "#000" : "inherit" }}>Iframe</button>
            <button type="button" onClick={() => setTab("script")} style={{ ...badgeStyle, background: tab === "script" ? "#44E1AA" : "transparent", color: tab === "script" ? "#000" : "inherit" }}>Script Tag</button>
          </div>
          <button type="button" onClick={() => copy(tab === "iframe" ? iframeCode : scriptCode, tab)} style={{ ...badgeStyle, background: copied === tab ? "#0AA65B" : "transparent", color: copied === tab ? "#fff" : "inherit" }}>
            {copied === tab ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre style={{ fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.6, margin: 0, padding: 12, borderRadius: 8, background: "var(--shiki-bg, #1e1e2e)", color: "var(--shiki-fg, #cdd6f4)", overflow: "auto" }}>
          {tab === "iframe" ? iframeCode : scriptCode}
        </pre>
      </div>
    </div>
  );
}
