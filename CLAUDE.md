# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Goal

モダンで先進的なUI/UXのぷよぷよアプリ（Puyo Puyo game）をNext.js で構築する。

## Links

- **GitHub**: https://github.com/masa0980-sudo/puyo-puyo-next-gen
- **Production**: https://claudecode-test-mauve.vercel.app

## Commands

```bash
# 開発サーバー起動（npm run dev は .bin 未作成時に失敗するため node で直接実行）
node node_modules/next/dist/bin/next dev --webpack
npm run build    # 本番ビルド
npm run lint     # ESLint 実行
```

> **注意**: 初回 `npm install` 後に `.bin` が作成されない場合は、ターミナルで `npm install` を再実行して `.bin/next.cmd` が生成されることを確認すること。

## Stack

- **Next.js 16** — App Router, `src/` ディレクトリ構成
- **React 19** — Server Components デフォルト、`"use client"` でクライアント化
- **TypeScript 5** — strict モード有効
- **Tailwind CSS v4** — `@import "tailwindcss"` 方式（設定ファイル不要）
- **Geist フォント** — CSS 変数 `--font-geist-sans` / `--font-geist-mono` で適用

## Architecture

```
src/app/
  layout.tsx   # ルートレイアウト（フォント・メタデータ設定）
  page.tsx     # トップページ
  globals.css  # Tailwind v4 import + CSS カスタムプロパティ
```

### App Router の規則

- `layout.tsx` — 共有レイアウト
- `page.tsx` — ルートのページコンポーネント
- `"use client"` ディレクティブ — ゲームロジック・インタラクション（`useState`, `useEffect`, キーボード入力）が必要なコンポーネントに必須

### パスエイリアス

`@/*` → `src/*`（例: `import { foo } from "@/lib/foo"`）

## Tailwind CSS v4 の注意点

v4 では `tailwind.config.js` は使わない。カスタムテーマは `globals.css` 内の `@theme` ブロックで定義する：

```css
@theme inline {
  --color-primary: #ff6b6b;
}
```

## ぷよぷよ実装ガイド（実装済み）

ゲームロジックはすべてクライアントサイドで動作する。実際の構成：

```
src/
  app/
    page.tsx        # エントリポイント（GameScreen をレンダリング）
    layout.tsx      # Geist フォント・メタデータ
    globals.css     # Tailwind v4 + puyo-erase / chain-popup アニメーション
  lib/
    types.ts        # 全型定義（PuyoColor, Piece, GameState, GameAction 等）
    constants.ts    # ゲーム定数（ボードサイズ・速度・スコアテーブル）
    puyoGame.ts     # 純粋関数ゲームロジック（BFS 連鎖検出・重力・回転）
    reducer.ts      # useReducer 状態機械（フェーズ管理・スコア計算）
    storage.ts      # localStorage ハイスコア永続化
    sound.ts        # Web Audio API サウンドエフェクト（外部ファイル不要）
  components/
    GameScreen.tsx  # メインコンテナ（ゲームループ・キーボード入力）
    GameBoard.tsx   # 6×12 ボード描画（ゴーストぷよ・消去アニメ）
    PuyoCell.tsx    # 個別セル（グラデーション・光沢・ゴースト表示）
    ScorePanel.tsx  # スコア/レベル/連鎖 HUD
    NextPiece.tsx   # NEXT / 2ND ぷよプレビュー
    ChainPopup.tsx  # 連鎖数ポップアップアニメーション
    TitleScreen.tsx # タイトル画面
    PauseOverlay.tsx   # ポーズオーバーレイ
    GameOverScreen.tsx # ゲームオーバー画面
    TouchControls.tsx  # モバイルタッチボタン
```

ゲームループは `useEffect` + `setInterval`（falling フェーズ: `dropInterval` ms、その他: 50 ms）。
キーボード操作は `window.addEventListener("keydown", ...)` で実装。

### ゲームフェーズ

```
title → falling → locking → checking → erasing（4 tick）→ dropping → checking → …
                                      ↘ gameover
```

### 実装済みの挙動メモ

- 横並びペアで片方のみ接地した場合、固定後に `applyGravity` を即時適用して浮いた方を落下させる（`reducer.ts` の `tickLocking` / `HARD_DROP`）
- タッチコントロールの表示切り替えは `globals.css` の `pointer:coarse:flex` / `pointer:fine:hidden` で制御
- サウンドは Web Audio API で合成（`sound.ts`）。外部ファイル不要。初回キー操作で AudioContext を起動

### サウンド一覧

| タイミング | 関数 | 音の特徴 |
|---|---|---|
| 左右移動 | `playMove()` | 短いクリック（square波、220Hz） |
| 回転 | `playRotate()` | 2音チャイム（440→550Hz） |
| 通常着地 | `playLand()` | 低音ドスッ（sine波、140→70Hz） |
| ハードドロップ | `playHardDrop()` | 強い衝撃音（sawtooth波） |
| ぷよ消去 | `playErase(chain)` | ポップ連打（連鎖数に応じて音数・音程が上昇） |
| ゲームオーバー | `playGameOver()` | 下降4音メロディ |

---

## 要件定義

### 機能要件

#### ゲームボード
- サイズ: 横 6 列 × 縦 13 行（うち最上行は隠し行・出現判定用）
- ぷよは上から落下し、最下行またはすでにあるぷよの上に積み上がる
- ゲームオーバー条件: 出現位置（3 列目上端）にぷよが存在する状態でネクストが出現したとき

#### ぷよの種類と色
- 5 色（赤・緑・青・黄・紫）
- 2 個ペア（操作ぷよ）が上から出現する
- ネクストぷよ 2 セット分を常に表示する

#### 操作
| キー | アクション |
|------|-----------|
| ← / → | 横移動 |
| ↓ | 高速落下（ソフトドロップ） |
| Space / ↑ | 即時落下（ハードドロップ） |
| Z | 左回転 |
| X | 右回転 |
| P | 一時停止 / 再開 |

#### 消去・連鎖ルール
- 同色のぷよが上下左右に 4 個以上つながると消去
- 消去後、上にあるぷよが落下し再チェック（連鎖）
- 連鎖数に応じてボーナス倍率を加算

#### スコア計算
```
基礎得点 = 消去ぷよ数 × 10
連鎖ボーナス = [0, 8, 16, 32, 64, 96, 128, ...] (連鎖数に応じたテーブル)
加算スコア = 基礎得点 × max(1, 連鎖ボーナス)
```

#### レベルシステム
- 初期落下速度: 1000 ms/行
- 10 連鎖消去ごとにレベルアップ
- レベルアップごとに落下速度を 50 ms 短縮（最速 100 ms/行）

#### ゴーストぷよ
- 操作中のぷよが落下する位置を半透明で先行表示する

---

### UI/UX 要件

#### ビジュアルデザイン
- ダークテーマをベースとしたモダンデザイン
- ぷよは円形グラデーション + 光沢感のある CSS で表現（SVG または `border-radius` + `box-shadow`）
- ボードの背景はグリッドライン入りの半透明パネル
- グラスモーフィズム（`backdrop-filter: blur`）をサイドパネルに適用

#### アニメーション
- 消去時: フラッシュ → 縮小 → 消滅（CSS keyframes、200 ms）
- 落下時: 重力感のある ease-in カーブ
- 連鎖数表示: 画面中央にポップアップ（スケールイン → フェードアウト）
- ハードドロップ時: 着地エフェクト（ripple）

#### レイアウト
```
┌─────────────────────────────────┐
│  SCORE    LEVEL    CHAIN        │  ← ヘッダー
├──────────┬──────────────────────┤
│ NEXT     │                      │
│ [ぷよ×2] │   ゲームボード        │
│          │   (6×12 グリッド)    │
│ NEXT2    │                      │
│ [ぷよ×2] │                      │
└──────────┴──────────────────────┘
```
- レスポンシブ: スマートフォン縦向きでもプレイ可能（ボタン操作 UI を表示）

#### スマートフォン対応
- 画面下部にタッチ操作ボタン（←・→・↓・Z・X・ハードドロップ）を表示
- `pointer: coarse` メディアクエリで自動切り替え

#### 画面遷移
1. **タイトル画面** — ゲームタイトル +「スタート」ボタン + ハイスコア表示
2. **ゲーム画面** — メインゲームプレイ
3. **ポーズ画面** — 半透明オーバーレイ + 「再開」「タイトルへ」
4. **ゲームオーバー画面** — スコア・最高連鎖数 + 「もう一度」「タイトルへ」

---

### 非機能要件

- フレームレート: 60 fps を維持（`requestAnimationFrame` または `setInterval` 16 ms）
- ローカルストレージにハイスコアを永続化
- サーバーサイドレンダリング不使用（ゲームロジックはすべてクライアント）
- テスト: ゲームロジック（連鎖計算・消去判定）は純粋関数として実装し、単体テストを可能にする
