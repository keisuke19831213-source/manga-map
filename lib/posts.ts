// ユーザー投稿(おすすめ・コメント)の型とファイルベースの保存処理
import { promises as fs } from "fs";
import path from "path";

export type BubbleStyle = "speech" | "shout" | "think" | "narration";
export type BubbleFont = "antique" | "tegaki" | "sakebi" | "pop" | "fude" | "dot";

export interface Post {
  id: string;
  type: "recommend" | "comment";
  user: string;
  workId?: string; // 図鑑内の作品への投稿の場合
  freeTitle?: string; // 図鑑にない作品のおすすめの場合
  volume?: string; // 巻
  page?: string; // ページ
  panel?: string; // コマ
  text: string;
  bubble?: BubbleStyle; // 吹き出しの形
  font?: BubbleFont; // 吹き出しのフォント
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "posts.json");

export async function readPosts(): Promise<Post[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Post[];
  } catch {
    return [];
  }
}

export async function addPost(post: Post): Promise<void> {
  const posts = await readPosts();
  posts.push(post);
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), "utf-8");
}
