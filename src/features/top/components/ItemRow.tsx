import { File, GripVertical, Trash2, TriangleAlert } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ItemEntry } from "../../../types/Item";

interface ItemRowProps {
  isSelected: boolean;
  entry: ItemEntry;
  onSelect: (entry: ItemEntry) => void;
  onDelete: (entry: ItemEntry) => void;
}

/**
 * アイテム一覧の 1 行.
 * 行のクリックで選択、削除ボタンで削除を親へ通知する.
 * 左端のつまみをドラッグすると並び替えられる (並び替えの確定は親の DndContext で行う).
 * 読み込めなかったアイテムは、ファイル名とエラーメッセージを表示する.
 */
export const ItemRow = (props: ItemRowProps) => {
  const { isSelected, entry, onSelect, onDelete } = props;
  const { item } = entry;
  const fileName = entry.filePath.split(/[\\/]/).pop() ?? entry.filePath;

  // 並び替え用. id は一覧内で一意なパスを使う (読み込めなかったアイテムには id が無いため)
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.filePath });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(entry)}
      className={"p-3 pl-1.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between group " +
        (isSelected ? "bg-indigo-50/70 border-indigo-200 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50") +
        (isDragging ? " relative z-10 shadow-md opacity-90" : "")
      }
    >
      <div className="flex items-center gap-1.5 overflow-hidden">
        {/* ドラッグ用のつまみ. ここを掴んだときだけ並び替えが始まる (行のクリック選択と分けるため) */}
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          title="ドラッグして並び替え"
          onClick={(e) => e.stopPropagation()}
          className="p-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className={"w-8 h-8 rounded-lg flex items-center justify-center shrink-0 " +
          (item === null ? "bg-rose-50 text-rose-400" : isSelected ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-400")}>
          {item === null ? <TriangleAlert className="w-4 h-4" /> : <File className="w-4 h-4" />}
        </div>
        <div className="truncate ml-1.5">
          <h4 className={"text-xs font-bold truncate " + (isSelected ? "text-indigo-950" : "text-slate-700")}>
            {item?.displayName ?? fileName}
          </h4>
          {item === null ? (
            <p className="text-[10px] font-medium text-rose-500 truncate" title={entry.errorMessage ?? ""}>
              {entry.errorMessage}
            </p>
          ) : (
            <p className={"text-[10px] font-medium " + (isSelected ? "text-indigo-600" : "text-slate-400")}>{item.playCount}回実施</p>
          )}
        </div>
      </div>
      <button
        title="削除"
        onClick={(e) => {
          // 行の選択が同時に走らないようにする
          e.stopPropagation();
          onDelete(entry);
        }}
        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
