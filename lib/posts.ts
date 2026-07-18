// ユーザー投稿(おすすめ・コメント)の型と保存処理
import { delItem, listItems, putItem } from "@/lib/storage";

export type BubbleStyle = "speech" | "shout" | "think" | "whisper" | "narration";
export type BubbleFont = "antique" | "mincho" | "sakebi" | "tegaki" | "shojo" | "fude" | "pop";

export interface Post {
  id: string;
  type: "recommend" | "comment";
  user: string;
  workId?: string; // 図鑑内の作品への投稿の場合
  freeTitle?: string; // 図鑑にない作品のおすすめの場合
  volume?: string; // 巻
  page?: string; // ページ番号 または Kindle位置(%付き文字列 例:"37%")
  panel?: string; // コマ
  scene?: string; // シーン名(例: 山王戦ラスト)
  spoiler?: boolean; // ネタバレ(ぼかして表示し、タップで開示)
  emotion?: string; // 感情タグ(EmotionId)。この作品/コマが起こした感情の軸
  text: string;
  bubble?: BubbleStyle; // 吹き出しの形
  font?: BubbleFont; // 吹き出しのフォント
  createdAt: string;
}

export async function readPosts(): Promise<Post[]> {
  return listItems<Post>("posts", "posts.json");
}

export async function addPost(post: Post): Promise<void> {
  await putItem<Post>("posts", "posts.json", post);
}

export async function deletePost(id: string): Promise<boolean> {
  return delItem<Post>("posts", "posts.json", id);
}
