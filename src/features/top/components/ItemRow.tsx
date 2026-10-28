import { File, Trash2 } from "lucide-react";
import type { Item } from "../../../types/Item";

interface ItemRowProps {
  isSelected: boolean;
  item: Item;
  onSelect: (item: Item) => void;
  onDelete: (item: Item) => void;
}

/**
 * アイテム一覧の 1 行.
 * 行のクリックで選択、削除ボタンで削除を親へ通知する.
 */
export const ItemRow = (props: ItemRowProps) => {
  const { isSelected, item, onSelect, onDelete } = props;

  return (
    <div
      onClick={() => onSelect(item)}
      className={"p-3 rounded-xl border transition cursor-pointer flex items-center justify-between group " +
        (isSelected ? "bg-indigo-50/70 border-indigo-200 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50")
      }
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={"w-8 h-8 rounded-lg flex items-center justify-center shrink-0 " + (isSelected ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-400")}>
          <File className="w-4 h-4" />
        </div>
        <div className="truncate">
          <h4 className={"text-xs font-bold truncate " + (isSelected ? "text-indigo-950" : "text-slate-700")}>
            {item.displayName}
          </h4>
          <p className={"text-[10px] font-medium " + (isSelected ? "text-indigo-600" : "text-slate-400")}>{item.playCount}回実施</p>
        </div>
      </div>
      <button
        title="削除"
        onClick={(e) => {
          // 行の選択が同時に走らないようにする
          e.stopPropagation();
          onDelete(item);
        }}
        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
