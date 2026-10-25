"use client";

import { useEffect, useState } from "react";
import { verifyAuditChain, type AuditRecord } from "@/lib/sevasetu";

type User = {
  id: string;
  name: string;
  email: string;
  role: "donor" | "ngo" | "reviewer" | "admin";
};

type RankedItem = {
  id: string;
  item: string;
  quantity: number;
  ngo: string;
  score: number;
  breakDown: Record<string, number>;
  reason: string;
};

const demoAccounts = [
  { email: "donor@sevasetu.local", password: "donor123" },
  { email: "ngo@sevasetu.local", password: "ngo123" },
  { email: "reviewer@sevasetu.local", password: "reviewer123" },
  { email: "admin@sevasetu.local", password: "admin123" },
];

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("donor@sevasetu.local");
  const [password, setPassword] = useState("donor123");
  const [area, setArea] = useState("Viman Nagar");
  const [item, setItem] = useState("Books");
  const [quantity, setQuantity] = useState(12);
  const [ranked, setRanked] = useState<RankedItem[]>([]);
  const [status, setStatus] = useState("Choose a demo account and sign in.");
  const [donationId, setDonationId] = useState<string | null>(null);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [auditStatus, setAuditStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void fetch(`/api/engine?area=${encodeURIComponent(area)}`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.ranked)) setRanked(data.ranked);
      })
      .catch(() => setRanked([]));
  }, [user, area]);

  const handleLogin = async () => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || "Login failed.");
      return;
    }

    setUser(data.user);
    setStatus(`Signed in as ${data.user.name} (${data.user.role}).`);
    if (data.user.role === "admin") await refreshAuditTrail();
  };

  const refreshAuditTrail = async () => {
    const response = await fetch("/api/audit", { credentials: "include" });
    const data = await response.json();
    if (!response.ok) {
      setAuditStatus(data.error || "Could not load audit trail.");
      return;
    }
    const records = Array.isArray(data.records) ? (data.records as AuditRecord[]) : [];
    setAuditRecords(records);
    const verification = await verifyAuditChain(records);
    setAuditStatus(
      verification.valid
        ? "Hash chain verified"
        : `Integrity issue at record${verification.brokenIndexes.length === 1 ? "" : "s"} ${verification.brokenIndexes.join(", ")}`,
    );
  };

  const handleDonation = async () => {
    if (!user) {
      setStatus("Please sign in before creating a donation.");
      return;
    }

    const response = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ item, quantity, area, ngoId: "ngo-3" }),
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || "Donation failed.");
      return;
    }

    setDonationId(data.donation.id);
    setStatus(`Donation created: ${data.donation.id}. The engine re-ranked eligible requests.`);
    const engineResponse = await fetch(`/api/engine?area=${encodeURIComponent(area)}`, { credentials: "include" });
    const engineData = await engineResponse.json();
    if (Array.isArray(engineData.ranked)) setRanked(engineData.ranked);
    if (user.role === "admin") await refreshAuditTrail();
  };

  return (
    <main className="page-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="eyebrow">SevaSetu</span>
          <h1>Explainable donation allocation</h1>
        </div>

        <div className="auth-box">
          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button className="primary-button" type="button" onClick={handleLogin}>
            Sign in
          </button>

          <div className="demo-list">
            {demoAccounts.map((demo) => (
              <button
                key={demo.email}
                type="button"
                className="demo-button"
                onClick={() => {
                  setEmail(demo.email);
                  setPassword(demo.password);
                }}
              >
                {demo.email}
              </button>
            ))}
          </div>
        </div>

        <div className="mini-panel">
          <strong>Eligibility rule</strong>
          <p>Verified NGO · compatible item · open request · in-range area · not expired.</p>
        </div>
      </aside>

      <section className="content">
        <header className="hero">
          <div>
            <p className="eyebrow alt">Pune, India</p>
            <h2>Match donations to verified need.</h2>
          </div>
          <label className="field compact">
            <span>Donor area</span>
            <select value={area} onChange={(event) => setArea(event.target.value)}>
              <option value="Kothrud">Kothrud</option>
              <option value="Baner">Baner</option>
              <option value="Hadapsar">Hadapsar</option>
              <option value="Viman Nagar">Viman Nagar</option>
            </select>
          </label>
        </header>

        <div className="panel status-panel">
          <strong>Status</strong>
          <p>{status}</p>
        </div>

        <div className="panel-layout">
          <div className="panel">
            <h3>Create donation</h3>
            <label className="field">
              <span>Item</span>
              <select value={item} onChange={(event) => setItem(event.target.value)}>
                <option>Books</option>
                <option>Clothes</option>
                <option>Utensils</option>
                <option>Furniture</option>
              </select>
            </label>
            <label className="field">
              <span>Quantity</span>
              <input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value || 1))} />
            </label>
            <button type="button" className="primary-button" onClick={handleDonation}>
              Submit donation
            </button>
            {donationId ? <p className="result-line">Latest donation ID: {donationId}</p> : null}
          </div>

          <div className="panel">
            <h3>Eligible NGO requests</h3>
            {ranked.length === 0 ? (
              <p className="empty-state">No eligible requests are currently ranked for this area.</p>
            ) : (
              ranked.map((entry) => (
                <div key={entry.id} className="request-card selected">
                  <div>
                    <strong>{entry.ngo}</strong>
                    <small>
                      {entry.item} · {entry.quantity} units
                    </small>
                  </div>
                  <span>{entry.score}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <h3>Why this NGO ranks highest</h3>
          {ranked[0] ? (
            <>
              <div className="score-row">
                <span>Total score</span>
                <strong>{ranked[0].score}</strong>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${Math.min(ranked[0].score, 100)}%` }} />
              </div>
              <ul className="factor-list">
                {Object.entries(ranked[0].breakDown).map(([factor, value]) => (
                  <li key={factor}>
                    <span>{factor}</span>
                    <strong>{value}</strong>
                  </li>
                ))}
              </ul>
              <p className="reason-box">{ranked[0].reason}</p>
            </>
          ) : (
            <p className="empty-state">Run a donation or log in to see the score breakdown.</p>
          )}
        </div>

        {user?.role === "admin" ? (
          <section className="panel audit-panel" aria-labelledby="audit-heading">
            <div className="audit-heading-row">
              <div>
                <h3 id="audit-heading">Audit trail</h3>
                <p className="audit-summary">Administrative activity log · {auditRecords.length} records</p>
              </div>
              <button type="button" className="secondary-button" onClick={() => void refreshAuditTrail()}>
                Refresh and verify
              </button>
            </div>
            {auditStatus ? (
              <p className={`audit-status ${auditStatus === "Hash chain verified" ? "valid" : "invalid"}`}>
                {auditStatus}
              </p>
            ) : null}
            {auditRecords.length === 0 ? (
              <p className="empty-state">No audit records are available.</p>
            ) : (
              <div className="audit-table-wrap">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Actor</th>
                      <th>Role</th>
                      <th>Action</th>
                      <th>Resource</th>
                      <th>Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...auditRecords].reverse().map((record, index) => (
                      <tr key={`${record.timestamp}-${record.resource}-${index}`}>
                        <td>{new Date(record.timestamp).toLocaleString()}</td>
                        <td>{record.actor}</td>
                        <td>{record.role}</td>
                        <td>{record.action.replaceAll("_", " ")}</td>
                        <td>{record.resource}</td>
                        <td>{record.outcome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        <div className="panel">
          <h3>Role-aware permissions</h3>
          <ul className="role-list">
            <li>Donor: can submit donations and track ranking.</li>
            <li>NGO: can review needs and inventory actions.</li>
            <li>Reviewer: can review NGO verification.</li>
            <li>Admin: can audit and verify hash-chain records.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
