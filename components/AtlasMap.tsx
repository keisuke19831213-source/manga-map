"use client";

import { useState } from "react";
import Link from "next/link";
import { spotsOf, workById, type MapSpot } from "@/lib/data";

const INK = "#171310";
const LAND = "#ffffff";
const ACCENT = "#e33b2e";

function WorldBase() {
  return (
    <g stroke={INK} strokeWidth={3} fill={LAND} strokeLinejoin="round">
      {/* 北アメリカ */}
      <path d="M 75,95 L 110,78 L 160,70 L 215,66 L 268,72 L 302,86 L 312,106 L 296,122 L 306,142 L 296,166 L 286,186 L 270,180 L 250,200 L 236,216 L 250,236 L 262,250 L 268,262 L 256,254 L 238,230 L 222,214 L 202,188 L 182,158 L 162,128 L 148,110 L 118,106 L 92,116 L 72,108 Z" />
      {/* グリーンランド */}
      <path d="M 322,52 L 362,42 L 392,56 L 380,86 L 350,96 L 326,76 Z" />
      {/* 南アメリカ */}
      <path d="M 268,262 L 292,256 L 318,268 L 346,290 L 358,316 L 346,346 L 326,386 L 313,426 L 305,456 L 296,450 L 295,414 L 285,370 L 275,324 L 262,290 Z" />
      {/* アフリカ */}
      <path d="M 458,168 L 492,160 L 526,162 L 556,170 L 571,190 L 586,214 L 601,222 L 586,240 L 576,276 L 561,316 L 548,346 L 538,358 L 522,344 L 512,310 L 500,270 L 492,248 L 470,242 L 448,224 L 442,200 L 448,180 Z" />
      <path d="M 590,310 L 601,300 L 607,316 L 598,340 L 588,332 Z" />
      {/* ユーラシア */}
      <path d="M 448,145 L 452,125 L 470,114 L 490,118 L 508,104 L 520,94 L 522,80 L 536,60 L 561,54 L 576,70 L 640,60 L 720,57 L 800,61 L 861,68 L 896,80 L 880,100 L 891,115 L 872,126 L 862,140 L 855,158 L 843,172 L 838,192 L 818,215 L 801,235 L 788,252 L 778,240 L 762,232 L 745,238 L 725,230 L 712,262 L 700,236 L 681,226 L 655,235 L 631,245 L 612,226 L 600,206 L 586,196 L 570,186 L 560,176 L 545,168 L 532,158 L 522,150 L 505,156 L 495,146 L 480,150 L 468,158 L 455,162 Z" />
      {/* イギリス */}
      <path d="M 486,105 L 496,95 L 503,106 L 496,120 L 486,116 Z" />
      {/* 日本列島 */}
      <path d="M 892,146 L 901,157 L 898,172 L 889,183 L 884,176 L 891,163 L 886,152 Z" />
      {/* 東南アジア・オセアニアの島々 */}
      <ellipse cx="795" cy="268" rx="14" ry="6" transform="rotate(35 795 268)" />
      <ellipse cx="826" cy="286" rx="13" ry="5" />
      <ellipse cx="833" cy="262" rx="10" ry="8" />
      <ellipse cx="856" cy="270" rx="6" ry="8" />
      <ellipse cx="905" cy="288" rx="20" ry="8" />
      <ellipse cx="854" cy="232" rx="6" ry="10" />
      {/* オーストラリア */}
      <path d="M 845,330 L 881,321 L 913,334 L 923,360 L 906,386 L 872,392 L 848,378 L 838,355 Z" />
      <ellipse cx="946" cy="406" rx="5" ry="8" transform="rotate(30 946 406)" />
      <ellipse cx="955" cy="426" rx="5" ry="9" transform="rotate(40 955 426)" />
      {/* 海のラベル */}
      <text x="180" y="330" fill="#9aa8b5" stroke="none" fontSize="20" fontWeight="800" letterSpacing="6">PACIFIC</text>
      <text x="600" y="420" fill="#9aa8b5" stroke="none" fontSize="20" fontWeight="800" letterSpacing="6">INDIAN</text>
      <text x="380" y="120" fill="#9aa8b5" stroke="none" fontSize="16" fontWeight="800" letterSpacing="4">ATLANTIC</text>
    </g>
  );
}

function JapanBase() {
  return (
    <g stroke={INK} strokeWidth={3} fill={LAND} strokeLinejoin="round">
      {/* 北海道 */}
      <path d="M 412,95 L 445,75 L 478,92 L 483,115 L 461,131 L 446,122 L 433,141 L 421,153 L 412,141 L 420,120 Z" />
      {/* 本州 */}
      <path d="M 408,205 L 416,194 L 431,205 L 433,236 L 428,270 L 438,300 L 446,330 L 441,356 L 436,372 L 433,383 L 419,389 L 401,393 L 391,403 L 372,398 L 356,409 L 346,429 L 330,421 L 318,429 L 300,421 L 268,421 L 245,429 L 225,421 L 212,429 L 205,415 L 219,405 L 246,398 L 269,392 L 291,382 L 311,375 L 331,368 L 346,356 L 349,338 L 356,325 L 363,339 L 359,352 L 376,346 L 391,331 L 400,301 L 406,261 L 403,226 Z" />
      {/* 四国 */}
      <path d="M 275,436 L 300,428 L 323,438 L 311,456 L 285,459 L 269,448 Z" />
      {/* 九州 */}
      <path d="M 210,438 L 229,432 L 241,445 L 239,468 L 229,492 L 216,511 L 202,505 L 195,480 L 198,455 Z" />
      {/* 五島列島 */}
      <ellipse cx="152" cy="482" rx="6" ry="10" transform="rotate(35 152 482)" />
      <ellipse cx="143" cy="497" rx="4" ry="7" transform="rotate(35 143 497)" />
      {/* 佐渡 */}
      <ellipse cx="390" cy="290" rx="8" ry="12" transform="rotate(40 390 290)" />
      {/* 沖縄 */}
      <ellipse cx="122" cy="600" rx="8" ry="4" transform="rotate(-25 122 600)" />
      <ellipse cx="103" cy="616" rx="6" ry="3" transform="rotate(-25 103 616)" />
      <ellipse cx="88" cy="630" rx="5" ry="3" transform="rotate(-25 88 630)" />
      {/* 海のラベル */}
      <text x="120" y="250" fill="#9aa8b5" stroke="none" fontSize="18" fontWeight="800" letterSpacing="5">日本海</text>
      <text x="430" y="500" fill="#9aa8b5" stroke="none" fontSize="18" fontWeight="800" letterSpacing="5">太平洋</text>
    </g>
  );
}

export default function AtlasMap() {
  const [mapKind, setMapKind] = useState<"japan" | "world">("japan");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const spots = spotsOf(mapKind);
  const selected: MapSpot | undefined = spots.find((s) => s.id === selectedId);
  const viewBox = mapKind === "world" ? "0 0 1000 500" : "60 40 480 620";

  return (
    <>
      <div className="filter-row">
        <button
          className={`chip ${mapKind === "japan" ? "active" : ""}`}
          onClick={() => {
            setMapKind("japan");
            setSelectedId(null);
          }}
        >
          🗾 日本地図
        </button>
        <button
          className={`chip ${mapKind === "world" ? "active" : ""}`}
          onClick={() => {
            setMapKind("world");
            setSelectedId(null);
          }}
        >
          🌏 世界地図
        </button>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="atlas-wrap" style={{ flex: "1 1 460px", minWidth: 320 }}>
          <svg viewBox={viewBox} className="atlas-svg" role="img" aria-label={mapKind === "world" ? "世界地図" : "日本地図"}>
            {mapKind === "world" ? <WorldBase /> : <JapanBase />}
            {spots.map((s) => {
              const active = s.id === selectedId;
              const r = mapKind === "world" ? 9 : 8;
              return (
                <g
                  key={s.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedId(active ? null : s.id)}
                >
                  <title>{s.place}</title>
                  {active && (
                    <circle cx={s.x} cy={s.y} r={r + 7} fill="none" stroke={ACCENT} strokeWidth={2.5} strokeDasharray="4 4" />
                  )}
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={r}
                    fill={active ? ACCENT : "#fff"}
                    stroke={INK}
                    strokeWidth={2.5}
                  />
                  <text
                    x={s.x}
                    y={s.y + 4.5}
                    textAnchor="middle"
                    fontSize={r + 2}
                    fontWeight={900}
                    fill={active ? "#fff" : INK}
                    stroke="none"
                  >
                    {s.works.length}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <aside style={{ flex: "0 1 320px", minWidth: 280 }}>
          {selected ? (
            <div className="spot-popup">
              <h3>📍 {selected.place}</h3>
              {selected.works.map(({ workId, note }) => {
                const w = workById(workId);
                if (!w) return null;
                return (
                  <Link key={workId} href={`/works/${w.id}`} className="sw">
                    <span className="t">
                      {w.title}
                      <span style={{ fontWeight: 400, fontSize: 11, color: "#4a4238" }}> ({w.year})</span>
                    </span>
                    <span className="n">{note}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="spot-popup" style={{ background: "#fdf6d8" }}>
              <h3>使い方</h3>
              <p style={{ fontSize: 13, lineHeight: 1.9, margin: 0 }}>
                地図上の <strong>丸いピン</strong> がマンガの舞台。数字はその場所を舞台にした作品数です。
                ピンをクリックすると作品と「聖地メモ」が出ます。
              </p>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            {spots.map((s) => (
              <button
                key={s.id}
                className="style-opt"
                style={{ margin: "0 6px 6px 0", ...(s.id === selectedId ? { background: "var(--yellow)" } : {}) }}
                onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
              >
                {s.place} ({s.works.length})
              </button>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
