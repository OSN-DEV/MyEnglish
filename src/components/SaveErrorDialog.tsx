import { AlertTriangle } from "lucide-react";

interface SaveErrorDialogProps {
  /** 保存に失敗した理由 */
  errorMessage: string;
  /** 再試行: もう一度書き戻す */
  onRetry: () => void;
  /** キャンセル: 書き戻さずにトップ画面へ戻る */
  onCancel: () => void;
}

/**
 * エクセルへの書き戻しに失敗したときのダイアログ (spec 6).
 * エクセルでファイルを開いている場合などに表示し、再試行かキャンセルを選ばせる.
 */
export const SaveErrorDialog = (props: SaveErrorDialogProps) => {
  const { errorMessage, onRetry, onCancel } = props;
  return (
    // 画面全体を半透明の黒で覆い、ダイアログ以外を操作できなくする
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 px-4">
      <div
        role="alertdialog"
        aria-labelledby="save-error-title"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1 min-w-0">
            <h2 id="save-error-title" className="text-sm font-bold text-slate-800">
              エクセルに保存できませんでした
            </h2>
            <p className="text-xs text-slate-600">
              エクセルでファイルを開いている場合は、閉じてから「再試行」を押してください。
            </p>
            <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-2 break-all">
              {errorMessage}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            キャンセル (保存せず TOP へ)
          </button>
          <button
            onClick={onRetry}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
          >
            再試行
          </button>
        </div>
      </div>
    </div>
  );
};
