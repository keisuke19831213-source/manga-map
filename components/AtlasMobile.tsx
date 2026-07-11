"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { geoMercator, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import { spotsOf, workById, type MapSpot } from "@/lib/data";
import { amazonLink, coverThumb } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import { useVoicesByWork } from "@/lib/usePosts";
import { AmazonButton } from "@/components/Cover";
import MiniBubble from "@/components/MiniBubble";

const VIEW = {
  world: { w: 1000, h: 520 },
  japan: { w: 620, h: 620 },
};

type MapKind = "world" | "japan";

// スマホ用: 触らない静的地図 + 聖地カードのリスト。
// ピンをタップすると該当カードへスクロールする(パン/ズームなし=軽い)
export default function AtlasMobile() {
  const [mapKind, setMapKind] = useState<MapKind>("japan");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [fc, setFc] = useState<Record<MapKind, FeatureCollection | null>>({ world: null, japan: null });
  const meta = useMeta();
  const voices = useVoicesByWork();
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (fc[mapKind]) return;
    const file = mapKind === "world" ? "/geo/countries-110m.json" : "/geo/japan.topojson";
    const objName = mapKind === "world" ? "countries" : "japan";
    fetch(file)
      .then((r) => r.json())
      .then((topo: Topology) => {
        const f = feature(topo, topo.objects[objName] as GeometryCollection) as unknown as FeatureCollection;
        const features =
          mapKind === "world" ? f.features.filter((x) => (x.properties as { name?: string })?.name !== "Antarctica") : f.features;
        setFc((g) => ({ ...g, [mapKind]: { type: "FeatureCollection", features } }));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapKind]);

  const { w, h } = VIEW[mapKind];
  const spots = useMemo(() => spotsOf(mapKind), [mapKind]);

  const { paths, pos } = useMemo(() => {
    const f = fc[mapKind];
    if (!f) return { paths: [] as string[], pos: null as ((s: MapSpot) => [number, number]) | null };
    const proj =
      mapKind === "world"
        ? geoNaturalEarth1().fitExtent([[8, 8], [w - 8, h - 8]], f)
        : geoMercator().fitExtent([[16, 16], [w - 16, h - 16]], f);
    const gen = geoPath(proj);
    return {
      paths: f.features.map((ft) => gen(ft) || ""),
      pos: (s: MapSpot): [number, number] => {
        const p = proj([s.lon, s.lat]) || [0, 0];
        return [p[0] + (s.dx ?? 0) * 0.6, p[1] + (s.dy ?? 0) * 0.6];
      },
    };
  }, [fc, mapKind, w, h]);

  const tapPin = (id: string) => {
    setActiveId(id);
    cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="filter-row" style={{ marginBottom: 12 }}>
        <button className={`chip ${mapKind === "japan" ? "active" : ""}`} onClick={() => { setMapKind("japan"); setActiveId(null); }}>
          🗾 日本
        </button>
        <button className={`chip ${mapKind === "world" ? "active" : ""}`} onClick={() => { setMapKind("world"); setActiveId(null); }}>
          🌏 世界
        </button>
        <span style={{ fontSize: 11, color: "var(--ink-soft)", alignSelf: "center", fontWeight: 700 }}>
          ピンをタップ→下のカードへ
        </span>
      </div>

      {/* 静的地図(操作なし=軽量) */}
      <div className="atlas-wrap" style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${w} ${h}`} className="atlas-svg" style={{ display: "block", width: "100%", height: "auto" }}>
          <g fill="#ffffff" stroke="#171310" strokeWidth={mapKind === "world" ? 0.7 : 0.9} strokeLinejoin="round">
            {paths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          {pos &&
            spots.map((s) => {
              const [x, y] = pos(s);
              const active = s.id === activeId;
              return (
                <g key={s.id} onClick={() => tapPin(s.id)} style={{ cursor: "pointer" }}>
                  <circle cx={x} cy={y} r={mapKind === "world" ? 16 : 13} fill="transparent" />
                  {active && <circle cx={x} cy={y} r={14} fill="none" stroke="#e33b2e" strokeWidth={2.5} strokeDasharray="4 4" />}
                  <circle cx={x} cy={y} r={mapKind === "world" ? 9 : 8} fill={active ? "#e33b2e" : "#fff"} stroke="#171310" strokeWidth={2.5} />
                  <text x={x} y={y + 4.5} textAnchor="middle" fontSize={10} fontWeight={900} fill={active ? "#fff" : "#171310"}>
                    {s.works.length}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      {/* 聖地カード */}
      <div style={{ marginTop: 16 }}>
        {spots.map((s) => (
          <div
            key={s.id}
            ref={(el) => {
              cardRefs.current[s.id] = el;
            }}
            className="spot-popup"
            style={{ marginBottom: 14, scrollMarginTop: 100, outline: s.id === activeId ? "3px solid var(--accent)" : "none" }}
            onClick={() => setActiveId(s.id)}
          >
            <h3>📍 {s.place}</h3>
            {s.works.map(({ workId, note }) => {
              const wk = workById(workId);
              if (!wk) return null;
              const az = amazonLink(meta, wk.id);
              const cover = coverThumb(meta, wk.id);
              return (
                <div key={workId} className="sw" style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: "0 0 44px" }}>
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={wk.title} loading="lazy" style={{ width: 44, height: 63, objectFit: "cover", border: "2px solid #171310", boxShadow: "2px 2px 0 #171310" }} />
                    ) : (
                      <div style={{ width: 44, height: 63, border: "2px solid #171310", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1e9d6" }}>📖</div>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <Link href={`/works/${wk.id}`}>
                      <span className="t">
                        {wk.title}
                        <span style={{ fontWeight: 400, fontSize: 11, color: "#4a4238" }}> ({wk.year})</span>{" "}
                        {voices[wk.id] && <span className="cbadge">💬 {voices[wk.id].count}</span>}
                      </span>
                    </Link>
                    <span className="n">{note}</span>
                    {voices[wk.id]?.latest && <MiniBubble post={voices[wk.id].latest!} />}
                    {az && (
                      <div style={{ marginTop: 6 }}>
                        <AmazonButton href={az} small />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
