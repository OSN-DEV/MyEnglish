import { File, Trash2 } from "lucide-react";

interface ItemSettingProps {
  isSelected: Boolean;
  itemSetting: ItemSetting;
  onItemSettingClick: (item: ItemSetting) => void
  onDeleteItemSettingClick: (item: ItemSetting) => void
}

export const ItemSetting = (props: ItemSettingProps) => {
    const {isSelected, itemSetting, onItemSettingClick, onDeleteItemSettingClick} = props;

  return (
    <div className={"p-3 rounded-xl border transition cursor-pointer flex items-center justify-between group " + 
        (isSelected ? "bg-indigo-50/70 border-indigo-200 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50")
    } >
      <div className="flex items-center gap-3 overflow-hidden w-full" onClick={() => onItemSettingClick(itemSetting)}>
        <div className={"w-8 h-8 rounded-lg flex items-center justify-center shrink-0 " + (isSelected?"bg-indigo-500 text-white" : "bg-slate-100 text-slate-400")}>
          <File className="w-4  h-4" />
        </div>
        <div className="truncate">
          <h4 className="text-xs font-bold text-indigo-950 truncate">
            {itemSetting.displayName}
          </h4>
          <p className={"text-[10px] font-medium " + (isSelected ? "text-indigo-600" : "text-slate-400")}>{itemSetting.playCount}回実施</p>
        </div>
      </div>
      <button
        title="削除"
        onClick={() => onDeleteItemSettingClick(itemSetting)}
        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
