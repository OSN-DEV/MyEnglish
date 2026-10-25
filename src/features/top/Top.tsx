

export const Top = () => {
    return (
    )
//         <main>
//   <!-- Main Container (Optimized for 800x600 Desktop Window) -->
//   <div class="w-full h-full max-w-[800px] max-h-[600px] bg-white md:rounded-2xl shadow-xl flex flex-col overflow-hidden relative border border-slate-200/80">

//     <!-- ========================================== -->
//     <!-- TOP SCREEN (トップ画面)                    -->
//     <!-- ========================================== -->
//     <div id="top-screen" class="w-full h-full flex flex-col bg-slate-50/50">
      
//       <!-- Top App Header -->
//       <header class="h-14 bg-white/80 backdrop-blur border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
//         <div class="flex items-center gap-2">
//           <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
//             <i data-lucide="book-open-check" class="w-4 h-4"></i>
//           </div>
//           <h1 class="font-bold text-slate-800 text-lg tracking-tight">LingoMaster</h1>
//         </div>
//         <span class="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">v1.0.0</span>
//       </header>

//       <!-- 2 Column Layout -->
//       <div class="flex-1 flex overflow-hidden p-4 gap-4 relative">
        
//         <!-- LEFT COLUMN: Item List (Takes remaining width) -->
//         <section class="flex-1 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden relative">
//           <!-- List Header -->
//           <div class="p-3.5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
//             <h2 class="text-sm font-bold text-slate-700 flex items-center gap-1.5">
//               <i data-lucide="file-text" class="w-4 h-4 text-indigo-500"></i>
//               教材データ一覧
//             </h2>
//             <span id="item-count" class="text-xs text-slate-400 font-medium">3件</span>
//           </div>

//           <!-- Items Scroll Area -->
//           <div id="item-list" class="flex-1 overflow-y-auto p-3 space-y-2">
//             <!-- Sample Items dynamically populated by JS -->
//           </div>

//           <!-- Floating Action Button (FAB) for Import -->
//           <button id="btn-import" title="ファイルを追加" class="absolute right-4 bottom-4 w-12 h-12 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-full shadow-lg hover:shadow-indigo-200/80 transition-all transform active:scale-95 flex items-center justify-center group">
//             <i data-lucide="plus" class="w-6 h-6 group-hover:rotate-90 transition-transform duration-200"></i>
//           </button>
//           <input type="file" id="file-input" accept=".json,.csv,.txt" class="hidden" />
//         </section>

//         <!-- RIGHT COLUMN: Settings Panel (Fixed Width) -->
//         <section class="w-[320px] flex flex-col gap-3 overflow-y-auto pr-0.5">
          
//           <!-- Card 1: 開始条件 -->
//           <div class="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
//             <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
//               <i data-lucide="sliders" class="w-3.5 h-3.5 text-indigo-500"></i>
//               問題の開始条件
//             </h3>
            
//             <!-- 出題数 -->
//             <div class="flex items-center justify-between gap-2">
//               <label class="text-xs font-semibold text-slate-600">出題数</label>
//               <select id="setting-count" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-indigo-500 transition">
//                 <option value="5">5問</option>
//                 <option value="10" selected>10問</option>
//                 <option value="20">20問</option>
//                 <option value="50">50問</option>
//                 <option value="all">全問題</option>
//               </select>
//             </div>

//             <!-- 出題順 -->
//             <div class="space-y-1.5">
//               <label class="text-xs font-semibold text-slate-600 block">出題順</label>
//               <div class="grid grid-cols-2 gap-2">
//                 <label class="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition">
//                   <input type="radio" name="order" value="head" checked class="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5">
//                   <span class="text-xs font-medium text-slate-700">先頭から</span>
//                 </label>
//                 <label class="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition">
//                   <input type="radio" name="order" value="least" class="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5">
//                   <span class="text-xs font-medium text-slate-700">実施数少順</span>
//                 </label>
//               </div>
//             </div>
//           </div>

//           <!-- Card 2: 再生オプション -->
//           <div class="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
//             <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
//               <i data-lucide="volume-2" class="w-3.5 h-3.5 text-indigo-500"></i>
//               再生オプション
//             </h3>

//             <!-- 自動再生 -->
//             <div class="flex items-center justify-between">
//               <span class="text-xs font-semibold text-slate-600">自動再生</span>
//               <label class="relative inline-flex items-center cursor-pointer">
//                 <input type="checkbox" id="setting-autoplay" checked class="sr-only peer">
//                 <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
//               </label>
//             </div>

//             <!-- 再生回数 -->
//             <div class="flex items-center justify-between gap-2">
//               <label class="text-xs font-semibold text-slate-600">再生回数</label>
//               <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
//                 <input type="number" id="setting-loop" value="1" min="1" max="5" class="w-12 text-center text-xs py-1.5 font-medium bg-transparent focus:outline-none">
//                 <span class="text-[10px] text-slate-400 pr-2">回</span>
//               </div>
//             </div>

//             <!-- 再生後の挙動 -->
//             <label class="flex items-start gap-2 cursor-pointer pt-1">
//               <input type="checkbox" id="setting-autonext" checked class="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5">
//               <span class="text-[11px] leading-tight font-medium text-slate-600">再生後に次の問題へ自動移動する</span>
//             </label>

//             <!-- 再生速度 -->
//             <div class="flex items-center justify-between gap-2 pt-1">
//               <label class="text-xs font-semibold text-slate-600">再生速度</label>
//               <select id="setting-speed" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-indigo-500 transition">
//                 <option value="0.8">0.8x</option>
//                 <option value="0.9">0.9x</option>
//                 <option value="1.0" selected>1.0x (標準)</option>
//                 <option value="1.1">1.1x</option>
//                 <option value="1.2">1.2x</option>
//                 <option value="1.3">1.3x</option>
//                 <option value="1.4">1.4x</option>
//                 <option value="1.5">1.5x</option>
//               </select>
//             </div>
//           </div>

//           <!-- Action Buttons (Bottom) -->
//           <div class="mt-auto space-y-2 pt-1">
//             <button id="btn-start" class="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
//               <i data-lucide="play" class="w-4 h-4 fill-white"></i>
//               開始
//             </button>
//             <button id="btn-resume" class="w-full py-2 px-4 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-600 text-xs font-bold rounded-xl border border-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
//               <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
//               前回の続きから再開
//             </button>
//           </div>

//         </section>

//       </div>
//     </div>  
//       </main>
}