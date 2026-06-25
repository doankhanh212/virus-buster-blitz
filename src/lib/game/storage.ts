import type { GameStats, Player } from "./types";

export interface ScoreEntry {
  id: string;
  name: string;
  company: string;
  phone: string;
  score: number;
  accuracy: number;
  maxCombo: number;
  backupHealth: number;
  customerTrust: number;
  dataSaved: number;
  ransomwareBlocked: number;
  playedAt: string;
}

const STORAGE_KEY = "dvct-scores";

function readRaw(): ScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ScoreEntry[]) : [];
  } catch {
    return [];
  }
}

/** All entries, newest first. */
export function getScores(): ScoreEntry[] {
  return readRaw().sort((a, b) => +new Date(b.playedAt) - +new Date(a.playedAt));
}

/** Entries ranked by score (desc), then accuracy, then earliest play time. */
export function getLeaderboard(): ScoreEntry[] {
  return readRaw().sort(
    (a, b) =>
      b.score - a.score ||
      b.accuracy - a.accuracy ||
      +new Date(a.playedAt) - +new Date(b.playedAt),
  );
}

export function saveScore(player: Player, stats: GameStats): ScoreEntry {
  const accuracy =
    stats.totalClicks > 0 ? Math.round((stats.correctHits / stats.totalClicks) * 100) : 0;

  const entry: ScoreEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: player.name,
    company: player.company,
    phone: player.phone,
    score: stats.score,
    accuracy,
    maxCombo: stats.maxCombo,
    backupHealth: stats.backupHealth,
    customerTrust: stats.customerTrust,
    dataSaved: Math.max(0, 100 - stats.dataLocked),
    ransomwareBlocked: stats.bossDefeats,
    playedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const all = readRaw();
      all.push(entry);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // Storage may be unavailable in private/kiosk modes; scores stay in-session only.
    }
  }

  return entry;
}

export function clearScores() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const EXPORT_COLUMNS: { key: keyof ScoreEntry; label: string }[] = [
  { key: "name", label: "Người chơi" },
  { key: "company", label: "Công ty" },
  { key: "phone", label: "Số điện thoại" },
  { key: "score", label: "Điểm" },
  { key: "accuracy", label: "Độ chính xác (%)" },
  { key: "maxCombo", label: "Combo cao nhất" },
  { key: "ransomwareBlocked", label: "Ransomware chặn được" },
  { key: "dataSaved", label: "Dữ liệu cứu (%)" },
  { key: "backupHealth", label: "Backup (%)" },
  { key: "customerTrust", label: "Niềm tin KH (%)" },
  { key: "playedAt", label: "Thời gian chơi" },
];

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("vi-VN");
}

/**
 * Builds an Excel-openable workbook (HTML-table `.xls`) so internal staff can
 * download the full player list without any external dependency.
 */
export function exportScoresToExcel(entries: ScoreEntry[]) {
  if (typeof window === "undefined") return;

  const ranked = [...entries].sort((a, b) => b.score - a.score || b.accuracy - a.accuracy);

  const header = `<tr>${EXPORT_COLUMNS.map(
    (col) => `<th style="background:#0b1220;color:#fff;border:1px solid #888;padding:6px;">${escapeHtml(col.label)}</th>`,
  ).join("")}</tr>`;

  const body = ranked
    .map((entry) => {
      const cells = EXPORT_COLUMNS.map((col) => {
        const value = col.key === "playedAt" ? formatTime(entry.playedAt) : entry[col.key];
        return `<td style="border:1px solid #ccc;padding:6px;">${escapeHtml(value)}</td>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const html = `﻿<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8" /></head>
<body><table>${header}${body}</table></body></html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `nguoi-choi-dap-virus-${stamp}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
