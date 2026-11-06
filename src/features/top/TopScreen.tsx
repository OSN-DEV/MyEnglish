import {
  BookOpenCheck,
  FileText,
  Plus,
  Sliders,
  Volume2,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { open } from "@tauri-apps/plugin-dialog";
import { addItem, getItems, removeItem } from "../../repositories/ItemRepository";
import { ItemRow } from "./components/ItemRow";
import type { Item, ItemEntry } from "../../types/Item";
import { SPEED_OPTIONS } from "../../constants";

interface TopScreenProps {
  onStartClick: (item: Item, isResume: boolean) => void;
}

/**
 * トップ画面.
 * アイテム一覧の表示・選択と、選択中アイテムの出題・再生設定の編集を行う.
 */
export const TopScreen = (props: TopScreenProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [entries, setEntries] = useState<ItemEntry[]>([]);
  // 選択はパスで管理する (読み込めなかったアイテムには id が無いため)
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  // 一覧の取得・追加・削除に失敗したときのエラーメッセージ (null のときは非表示)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appVersion, setAppVersion] = useState<string>("");
  // 選択中のアイテムは一覧から導出する (コピーを別の state に持たない)
  const currentItem =
    entries.find((entry) => entry.filePath === selectedPath)?.item ?? null;
  const { onStartClick } = props;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const entries = await getItems();
        setEntries(entries);
        setSelectedPath(entries[0]?.filePath ?? null);
      } catch (error) {
        setErrorMessage(`アイテム一覧の取得に失敗しました: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
    getVersion().then(setAppVersion);
  }, []);

  /**
   * 一覧の行を選択したときの処理.
   * @param entry 選択されたアイテム
   */
  const handleSelectItem = (entry: ItemEntry) => {
    setSelectedPath(entry.filePath);
  };

  /**
   * 一覧の削除ボタンを押したときの処理.
   * 一覧から外すだけで、エクセルファイルは削除しない.
   * 削除したアイテムが選択中だった場合は選択を解除する.
   * @param entry 削除するアイテム
   */
  const handleDeleteItem = async (entry: ItemEntry) => {
    try {
      await removeItem(entry.filePath);
    } catch (error) {
      setErrorMessage(`アイテムの削除に失敗しました: ${error}`);
      return;
    }
    setEntries((prevEntries) =>
      prevEntries.filter((e) => e.filePath !== entry.filePath),
    );
    if (entry.filePath === selectedPath) {
      setSelectedPath(null);
    }
  };

  /**
   * 設定項目を変更したときの処理.
   * 選択中のアイテムの指定した項目を更新する.
   * @param field 更新する項目名
   * @param value 更新後の値
   */
  const handleFieldChange = <K extends keyof Item>(
    field: K,
    value: Item[K],
  ) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.filePath === selectedPath && entry.item !== null
          ? { ...entry, item: { ...entry.item, [field]: value } }
          : entry,
      ),
    );
  };

  /**
   * 開始・再開ボタンを押したときの処理.
   * 選択中のアイテムを親へ渡して出題を開始する. 未選択の場合は何もしない.
   * @param isResume true: 前回の続きから再開、false: 先頭から開始
   */
  const handleStartResumeClick = (isResume: boolean) => {
    if (currentItem === null) {
      return;
    }
    onStartClick(currentItem, isResume);
  };

  /**
   * ファイル追加ボタンを押したときの処理.
   * エクセルファイルを選択してアイテムに追加する.
   */
  const handleAddFile = async () => {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "Excel",
          extensions: ["xlsx"],
        },
        {
          name: "All",
          extensions: ["*"],
        },
      ],
    });
    if (!selected) {
      return;
    }
    setErrorMessage(null);
    try {
      // 登録済み・読み込めないファイルの場合は Rust 側でエラーになる
      const newItem = await addItem(selected);
      setEntries((prevEntries) => [
        ...prevEntries,
        { filePath: newItem.filePath, item: newItem, errorMessage: null },
      ]);
    } catch (error) {
      setErrorMessage(String(error));
    }
  };

  return (
    <div
      id="top-screen"
      className="w-full h-full flex flex-col overflow-y-auto bg-slate-50/50"
    >
      {/* ヘッダ */}
      <header className="h-14 bg-white/80 backdrop-blur border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <BookOpenCheck className="w-4  h-4" />
          </div>
          <h1 className="font-bold text-slate-800 text-lg tracking-tight">
            My English
          </h1>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
          v{appVersion}
        </span>
      </header>

      <div className="flex-1 flex p-4 gap-4">
        {/* LEFT COLUMN: Item List (Takes remaining width) */}
        {/* 中身を absolute で配置し、一覧の件数が行の高さに影響しないようにする */}
        <section className="flex-1 min-w-0 relative">
          <div className="absolute inset-0 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
            {/* List Header */}
            <div className="shrink-0 p-3.5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                教材データ一覧
              </h2>
              <span
                id="item-count"
                className="text-xs text-slate-400 font-medium"
              >
                {entries.length}件
              </span>
            </div>

            {/* Items Scroll Area */}
            <div
              id="item-list"
              className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2"
            >
              {isLoading ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  読み込み中…
                </p>
              ) : (
                entries.map((entry) => (
                  <ItemRow
                    key={entry.filePath}
                    isSelected={entry.filePath === selectedPath}
                    entry={entry}
                    onSelect={handleSelectItem}
                    onDelete={handleDeleteItem}
                  />
                ))
              )}
            </div>

            {/* Import Button (一覧と重ならないよう下部の帯に配置) */}
            <div className="shrink-0 p-3 border-t border-slate-100">
              {errorMessage && (
                <div className="mb-2 p-2 rounded-lg border border-rose-200 bg-rose-50 text-[11px] text-rose-700 flex items-start gap-2">
                  <p className="flex-1 break-all">{errorMessage}</p>
                  <button
                    title="閉じる"
                    onClick={() => setErrorMessage(null)}
                    className="text-rose-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <button
                id="btn-import"
                title="ファイルを追加"
                onClick={handleAddFile}
                className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                ファイルを追加
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Settings Panel (Fixed Width) */}
        <fieldset
          className="w-[320px] shrink-0 flex flex-col gap-3"
          disabled={currentItem === null}
        >
          {/*  Card 1: 開始条件 */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              問題の開始条件
            </h3>

            {/*   出題数 */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-600">
                出題数
              </label>
              <input
                onChange={(e) =>
                  handleFieldChange("questionCount", Number(e.target.value))
                }
                value={currentItem?.questionCount ?? ""}
                type="number"
                id="setting-count"
                min="1"
                className="w-12 text-center text-xs py-1.5 font-medium bg-transparent focus:outline-none"
              />
            </div>

            {/* 出題順 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">
                出題順
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition">
                  <input
                    checked={currentItem?.questionOrder === "head"}
                    onChange={() => handleFieldChange("questionOrder", "head")}
                    type="radio"
                    name="order"
                    value="head"
                    className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    先頭から
                  </span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition">
                  <input
                    type="radio"
                    checked={currentItem?.questionOrder === "fewer"}
                    onChange={() => handleFieldChange("questionOrder", "fewer")}
                    name="order"
                    value="fewer"
                    className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    出題回数が少ない順
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/*  Card 2: 再生オプション */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
              再生オプション
            </h3>

            {/* 自動再生 */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                自動再生
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="setting-autoplay"
                  checked={currentItem?.autoPlay ?? false}
                  onChange={(e) =>
                    handleFieldChange("autoPlay", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>

            {/*  再生回数 */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-600">
                再生回数
              </label>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <input
                  type="number"
                  id="setting-loop"
                  onChange={(e) =>
                    handleFieldChange("repeatCount", Number(e.target.value))
                  }
                  value={currentItem?.repeatCount ?? ""}
                  min="1"
                  className="w-12 text-center text-xs py-1.5 font-medium bg-transparent focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 pr-2">回</span>
              </div>
            </div>

            {/*  再生後の挙動 */}
            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                id="setting-autonext"
                checked={currentItem?.autoMove ?? false}
                onChange={(e) =>
                  handleFieldChange("autoMove", e.target.checked)
                }
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span className="text-[11px] leading-tight font-medium text-slate-600">
                再生後に次の問題へ自動移動する
              </span>
            </label>

            {/*  再生速度 */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <label className="text-xs font-semibold text-slate-600">
                再生速度
              </label>
              <select
                id="setting-speed"
                value={(currentItem?.playbackSpeed ?? 1.0).toFixed(1)}
                onChange={(e) =>
                  handleFieldChange("playbackSpeed", Number(e.target.value))
                }
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-indigo-500 transition"
              >
                {SPEED_OPTIONS.map((speed) => (
                  <option key={speed} value={speed.toFixed(1)}>
                    {speed.toFixed(1)}x{speed === 1.0 ? " (標準)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/*  Action Buttons (Bottom) */}
          <div className="mt-auto space-y-2 pt-1">
            <button
              id="btn-start"
              onClick={() => handleStartResumeClick(false)}
              type="button"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 enabled:hover:from-indigo-600 enabled:hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all enabled:active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-white" />
              開始
            </button>
            <button
              id="btn-resume"
              onClick={() => handleStartResumeClick(true)}
              className="w-full py-2 px-4 bg-indigo-50 enabled:hover:bg-indigo-100/80 text-indigo-600 text-xs font-bold rounded-xl border border-indigo-100 transition-all enabled:active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              前回の続きから再開
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  );
};
