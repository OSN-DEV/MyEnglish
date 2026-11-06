import React from "react";

/**
 * ローディングイメージ
 * 表示・非表示は呼び出し側の条件付き描画で切り替える (例: `isLoading && <Loading />`)
 */
const Loading: React.FC = () => {

    return (
        // 背景: 画面全体を白の半透明で覆い、操作できないことを示す
        // - inset-0: top/right/bottom/left をすべて 0 にする (fixed と組み合わせて全画面)
        // - z-[10100]: [] で囲むと Tailwind に無い任意の値を直接指定できる
        // - bg-white/60: 「/数字」で不透明度を指定できる (白の 60%)
        // - flex + items-center + justify-center: 中の要素を上下左右の中央に置く
        <div className="fixed inset-0 z-[10100] flex items-center justify-center bg-white/60">
            {/*
              スピナー本体 (配色はアプリのメインカラー indigo に合わせる)
              - size-12: width/height とも 48px
              - border-4 border-indigo-100: 円の輪全体を薄い色で描く
              - border-t-indigo-600: 上側の線だけ濃い色にする。回転したときに動いている部分として見える
              - animate-spin: Tailwind 標準のアニメーション。1 秒で 1 回転を繰り返す
            */}
            <div className="size-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
        </div>
    );
};

export default Loading;
