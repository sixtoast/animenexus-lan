"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/components/SessionProvider";

export function AccountClient() {
  const {
    session,
    ready,
    connecting,
    syncing,
    error,
    connect,
    disconnect,
    syncLists,
    clearError,
  } = useSession();
  const [username, setUsername] = useState("");
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  if (!ready) {
    return (
      <div className="state-box">
        <div className="spinner" />
        <p>Loading session…</p>
      </div>
    );
  }

  async function onConnect(e: React.FormEvent) {
    e.preventDefault();
    setSyncMsg(null);
    clearError();
    await connect(username);
  }

  async function onSync() {
    setSyncMsg(null);
    const n = await syncLists();
    if (n > 0) {
      setSyncMsg(
        `Imported ${n} titles from AniList into your local watchlist.`,
      );
    }
  }

  return (
    <div className="account-panel">
      {error ? (
        <div className="state-box error" style={{ marginBottom: 16 }}>
          <p>{error}</p>
        </div>
      ) : null}
      {syncMsg ? (
        <div
          className="state-box"
          style={{
            marginBottom: 16,
            borderColor: "rgba(240,160,144,0.35)",
          }}
        >
          <p>{syncMsg}</p>
          <p style={{ marginTop: 10 }}>
            <Link href="/watchlist" className="btn btn-accent btn-sm">
              Open watchlist →
            </Link>
          </p>
        </div>
      ) : null}

      {!session ? (
        <form className="account-form" onSubmit={onConnect}>
          <p className="account-note">
            Connect with a public AniList username (no password). We only read
            lists that are already public on AniList — nothing is written back.
          </p>
          <label className="filter-label" htmlFor="anilist-user">
            AniList username
          </label>
          <div className="account-row">
            <input
              id="anilist-user"
              className="filter-input"
              placeholder="e.g. Josh"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={connecting}
            />
            <button
              type="submit"
              className="btn btn-accent btn-sm"
              disabled={connecting}
            >
              {connecting ? "Connecting…" : "Connect"}
            </button>
          </div>
        </form>
      ) : (
        <div className="account-connected">
          <div className="account-profile">
            {session.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.avatar} alt="" className="account-avatar" />
            ) : (
              <div className="account-avatar account-avatar-fallback">
                {session.username.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="account-name">{session.username}</p>
              <p className="account-meta">
                Connected{" "}
                {new Date(session.connectedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              {session.lastSyncAt ? (
                <p className="account-meta">
                  Last sync: {new Date(session.lastSyncAt).toLocaleString()} ·{" "}
                  {session.lastSyncCount ?? 0} titles
                </p>
              ) : (
                <p className="account-meta">Not synced yet</p>
              )}
            </div>
          </div>

          <div className="account-actions">
            <button
              type="button"
              className="btn btn-accent btn-sm"
              onClick={onSync}
              disabled={syncing}
            >
              {syncing ? "Syncing…" : "Sync AniList lists → watchlist"}
            </button>
            <a
              href={`https://anilist.co/user/${encodeURIComponent(session.username)}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
            >
              Open on AniList ↗
            </a>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={disconnect}
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
