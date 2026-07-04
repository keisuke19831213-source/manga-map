"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { geoMercator, geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import { spotsOf, workById, type MapSpot } from "@/lib/data";
import { amazonLink, coverSrc } from "@/lib/affiliate";
import { useMeta } from "@/lib/useMeta";
import { useVoicesByWork } from "@/lib/usePosts";
import Cover, { AmazonButton } from "@/components/Cover";
import MiniBubble from "@/components/MiniBubble";

const INK = "#171310";
const ACCENT = "#e33b2e";

const VIEW = {
  world: { w: 1000, h: 520 },
  japan: { w: 620, h: 620 },
};

type MapKind = "world" | "japan";

function useGeo(kind: MapKind): FeatureCollection | null {
  const [geo, setGeo] = useState<Record<MapKind, FeatureCollection | null>>({
    world: null,
    japan: null,
  });

  useEffect(() => {
    if (geo[kind]) return;
    const file = kind === "world" ? "/geo/countries-110m.json" : "/geo/japan.topojson";
    const objName = kind === "world" ? "countries" : "japan";
    fetch(file)
      .then((r) => r.json())
      .then((topo: Topology) => {
        const fc = feature(
          topo,
          topo.objects[objName] as GeometryCollection
        ) as unknown as FeatureCollection;
        // 南極大陸は表示しない
        const features =
          kind === "world"
            ? fc.features.filter((f) => (f.properties as { name?: string })?.name !== "Antarctica")
            : fc.features;
        setGeo((g) => ({ ...g, [kind]: { type: "FeatureCollection", features } }));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  return geo[kind];
}

export default function AtlasMap() {
  const [mapKind, setMapKind] = useState<MapKind>("japan");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fc = useGeo(mapKind);
  const meta = useMeta();
  const voices = useVoicesByWork();

  const spots = spotsOf(mapKind);
  const selected: MapSpot | undefined = spots.find((s) => s.id === selectedId);
  const { w, h } = VIEW[mapKind];

  const { projection, paths } = useMemo(() => {
    if (!fc) return { projection: null as GeoProjection | null, paths: [] as string[] };
    const proj =
      mapKind === "world"
        ? geoNaturalEarth1().fitExtent(
            [
              [8, 8],
              [w - 8, h - 8],
            ],
            fc
          )
        : geoMercator().fitExtent(
            [
              [16, 16],
              [w - 16, h - 16],
            ],
            fc
          );
    const gen = geoPath(proj);
    return { projection: proj, paths: fc.features.map((f) => gen(f) || "") };
  }, [fc, mapKind, w, h]);

  const project = (s: MapSpot): [number, number] | null => {
    if (!projection) return null;
    const p = projection([s.lon, s.lat]);
    if (!p) return null;
    return [p[0] + (s.dx ?? 0), p[1] + (s.dy ?? 0)];
  };

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
          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="atlas-svg"
            role="img"
            aria-label={mapKind === "world" ? "世界地図" : "日本地図"}
          >
            {!fc && (
              <text x={w / 2} y={h / 2} textAnchor="middle" fontSize={16} fill="#8a93a3">
                地図を読み込み中…
              </text>
            )}
            <g fill="#ffffff" stroke={INK} strokeWidth={mapKind === "world" ? 0.6 : 0.9} strokeLinejoin="round">
              {paths.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
            {projection &&
              spots.map((s) => {
                const p = project(s);
                if (!p) return null;
                const [x, y] = p;
                const active = s.id === selectedId;
                const r = mapKind === "world" ? 9 : 8;
                return (
                  <g key={s.id} style={{ cursor: "pointer" }} onClick={() => setSelectedId(active ? null : s.id)}>
                    <title>{s.place}</title>
                    {active && (
                      <circle cx={x} cy={y} r={r + 7} fill="none" stroke={ACCENT} strokeWidth={2.5} strokeDasharray="4 4" />
                    )}
                    <circle cx={x} cy={y} r={r} fill={active ? ACCENT : "#fff"} stroke={INK} strokeWidth={2.5} />
                    <text
                      x={x}
                      y={y + 4.5}
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

        <aside style={{ flex: "0 1 340px", minWidth: 280 }}>
          {selected ? (
            <div className="spot-popup">
              <h3>📍 {selected.place}</h3>
              {selected.works.map(({ workId, note }) => {
                const wk = workById(workId);
                if (!wk) return null;
                const az = amazonLink(meta, wk.id);
                return (
                  <div key={workId} className="sw" style={{ display: "flex", gap: 10 }}>
                    <Cover src={coverSrc(meta, wk.id)} title={wk.title} width={46} />
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
                        <div style={{ marginTop: 5 }}>
                          <AmazonButton href={az} small />
                        </div>
                      )}
                    </div>
                  </div>
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
