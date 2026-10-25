<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>語学学習アプリ (Language Learning App)</title>
  <!-- Tailwind CSS v4.0 CDN -->
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Custom Style Adjustments & Tailwind v4 Theme Rules -->
  <style type="text/tailwindcss">
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Zen+Maru+Gothic:wght@400;500;700&display=swap');
    
    @theme {
      --font-sans: 'Zen Maru Gothic', 'Plus Jakarta Sans', sans-serif;
      --color-brand-50: #f0f3ff;
      --color-brand-100: #e0e7ff;
      --color-brand-200: #c7d2fe;
      --color-brand-500: #6366f1;
      --color-brand-600: #4f46e5;
      --color-brand-700: #4338ca;
      --color-pastel-bg: #f8fafc;
      --color-pastel-card: #ffffff;
      --color-pastel-accent: #e0e7ff;
      --color-pastel-mint: #d1fae5;
      --color-pastel-rose: #ffe4e6;
      --color-pastel-amber: #fef3c7;
    }

    body {
      font-family: var(--font-sans);
      user-select: none;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Range slider custom styling */
    input[type=range] {
      accent-color: #6366f1;
    }
  </style>
</head>
<body class="bg-slate-100 text-slate-700 h-screen w-screen overflow-hidden flex items-center justify-center p-0 md:p-2">

  <!-- Main Container (Optimized for 800x600 Desktop Window) -->
  <div class="w-full h-full max-w-[800px] max-h-[600px] bg-white md:rounded-2xl shadow-xl flex flex-col overflow-hidden relative border border-slate-200/80">

    <!-- ========================================== -->
    <!-- TOP SCREEN (トップ画面)                    -->
    <!-- ========================================== -->
    <div id="top-screen" class="w-full h-full flex flex-col bg-slate-50/50">
      
      <!-- Top App Header -->
      <header class="h-14 bg-white/80 backdrop-blur border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <i data-lucide="book-open-check" class="w-4 h-4"></i>
          </div>
          <h1 class="font-bold text-slate-800 text-lg tracking-tight">LingoMaster</h1>
        </div>
        <span class="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">v1.0.0</span>
      </header>

      <!-- 2 Column Layout -->
      <div class="flex-1 flex overflow-hidden p-4 gap-4 relative">
        
        <!-- LEFT COLUMN: Item List (Takes remaining width) -->
        <section class="flex-1 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden relative">
          <!-- List Header -->
          <div class="p-3.5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
            <h2 class="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <i data-lucide="file-text" class="w-4 h-4 text-indigo-500"></i>
              教材データ一覧
            </h2>
            <span id="item-count" class="text-xs text-slate-400 font-medium">3件</span>
          </div>

          <!-- Items Scroll Area -->
          <div id="item-list" class="flex-1 overflow-y-auto p-3 space-y-2">
            <!-- Sample Items dynamically populated by JS -->
          </div>

          <!-- Floating Action Button (FAB) for Import -->
          <button id="btn-import" title="ファイルを追加" class="absolute right-4 bottom-4 w-12 h-12 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-full shadow-lg hover:shadow-indigo-200/80 transition-all transform active:scale-95 flex items-center justify-center group">
            <i data-lucide="plus" class="w-6 h-6 group-hover:rotate-90 transition-transform duration-200"></i>
          </button>
          <input type="file" id="file-input" accept=".json,.csv,.txt" class="hidden" />
        </section>

        <!-- RIGHT COLUMN: Settings Panel (Fixed Width) -->
        <section class="w-[320px] flex flex-col gap-3 overflow-y-auto pr-0.5">
          
          <!-- Card 1: 開始条件 -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <i data-lucide="sliders" class="w-3.5 h-3.5 text-indigo-500"></i>
              問題の開始条件
            </h3>
            
            <!-- 出題数 -->
            <div class="flex items-center justify-between gap-2">
              <label class="text-xs font-semibold text-slate-600">出題数</label>
              <select id="setting-count" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-indigo-500 transition">
                <option value="5">5問</option>
                <option value="10" selected>10問</option>
                <option value="20">20問</option>
                <option value="50">50問</option>
                <option value="all">全問題</option>
              </select>
            </div>

            <!-- 出題順 -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600 block">出題順</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition">
                  <input type="radio" name="order" value="head" checked class="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5">
                  <span class="text-xs font-medium text-slate-700">先頭から</span>
                </label>
                <label class="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition">
                  <input type="radio" name="order" value="least" class="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5">
                  <span class="text-xs font-medium text-slate-700">実施数少順</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Card 2: 再生オプション -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <i data-lucide="volume-2" class="w-3.5 h-3.5 text-indigo-500"></i>
              再生オプション
            </h3>

            <!-- 自動再生 -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-600">自動再生</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="setting-autoplay" checked class="sr-only peer">
                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>

            <!-- 再生回数 -->
            <div class="flex items-center justify-between gap-2">
              <label class="text-xs font-semibold text-slate-600">再生回数</label>
              <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <input type="number" id="setting-loop" value="1" min="1" max="5" class="w-12 text-center text-xs py-1.5 font-medium bg-transparent focus:outline-none">
                <span class="text-[10px] text-slate-400 pr-2">回</span>
              </div>
            </div>

            <!-- 再生後の挙動 -->
            <label class="flex items-start gap-2 cursor-pointer pt-1">
              <input type="checkbox" id="setting-autonext" checked class="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5">
              <span class="text-[11px] leading-tight font-medium text-slate-600">再生後に次の問題へ自動移動する</span>
            </label>

            <!-- 再生速度 -->
            <div class="flex items-center justify-between gap-2 pt-1">
              <label class="text-xs font-semibold text-slate-600">再生速度</label>
              <select id="setting-speed" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-indigo-500 transition">
                <option value="0.8">0.8x</option>
                <option value="0.9">0.9x</option>
                <option value="1.0" selected>1.0x (標準)</option>
                <option value="1.1">1.1x</option>
                <option value="1.2">1.2x</option>
                <option value="1.3">1.3x</option>
                <option value="1.4">1.4x</option>
                <option value="1.5">1.5x</option>
              </select>
            </div>
          </div>

          <!-- Action Buttons (Bottom) -->
          <div class="mt-auto space-y-2 pt-1">
            <button id="btn-start" class="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <i data-lucide="play" class="w-4 h-4 fill-white"></i>
              開始
            </button>
            <button id="btn-resume" class="w-full py-2 px-4 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-600 text-xs font-bold rounded-xl border border-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
              前回の続きから再開
            </button>
          </div>

        </section>

      </div>
    </div>


    <!-- ========================================== -->
    <!-- QUESTION SCREEN (問題画面)                -->
    <!-- ========================================== -->
    <div id="question-screen" class="w-full h-full flex-col bg-slate-50 hidden">
      
      <!-- HEADER AREA (Fixed Height) -->
      <header class="h-14 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div class="flex items-center gap-3">
          <button id="btn-exit" class="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            終了
          </button>
          <div class="h-4 w-px bg-slate-200"></div>
          <span id="q-item-name" class="text-xs font-bold text-slate-700 truncate max-w-[200px]">TOEIC 頻出英単語 1000</span>
        </div>

        <!-- Progress Indicator -->
        <div class="flex items-center gap-2 text-xs">
          <span class="font-semibold text-slate-400">今回: <strong id="q-progress-session" class="text-indigo-600">1 / 10</strong></span>
          <span class="text-slate-300">|</span>
          <span class="font-medium text-slate-500">アイテム内No: <strong id="q-progress-total" class="text-slate-700">15</strong></span>
        </div>
      </header>

      <!-- MAIN LEARNING AREA (Scrollable) -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        
        <!-- Meta Info Card -->
        <div class="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm space-y-1">
          <div class="flex items-center justify-between">
            <span id="q-meta-title" class="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">Lesson 01 - Business</span>
            <span id="q-meta-h1" class="text-[11px] font-medium text-slate-400">見出し1: オフィスでの会話</span>
          </div>
          <div class="flex gap-4 text-xs text-slate-500 pt-1 border-t border-slate-50 mt-1">
            <span>見出し2: <strong id="q-meta-h2" class="font-normal text-slate-700">会議室予約</strong></span>
            <span>見出し3: <strong id="q-meta-h3" class="font-normal text-slate-700">-</strong></span>
          </div>
        </div>

        <!-- Main Sentence Card -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 relative">
          <!-- English Sentence -->
          <div class="space-y-1">
            <span class="text-[10px] font-bold tracking-wider uppercase text-slate-400">English</span>
            <p id="q-text-en" class="text-lg md:text-xl font-bold text-slate-800 leading-relaxed tracking-wide">
              We need to reschedule the quarterly budget meeting for next Tuesday.
            </p>
          </div>

          <hr class="border-slate-100">

          <!-- Japanese Translation (Toggleable) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold tracking-wider uppercase text-slate-400">Japanese</span>
              <button id="btn-toggle-jp" class="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 focus:outline-none">
                <i data-lucide="eye" id="icon-jp-eye" class="w-3.5 h-3.5"></i>
                <span id="text-toggle-jp">日本語訳を隠す</span>
              </button>
            </div>
            <div id="wrapper-jp" class="transition-all duration-200">
              <p id="q-text-jp" class="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                来週の火曜日に四半期予算会議の予定を変更する必要があります。
              </p>
            </div>
          </div>
        </div>

        <!-- Note Area (Words / Explanations) -->
        <div class="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 space-y-2">
          <div class="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
            <i data-lucide="sticky-note" class="w-4 h-4 text-amber-500"></i>
            学習メモ・解説
          </div>
          <div id="q-notes" class="text-xs text-slate-600 leading-normal space-y-1">
            <p><span class="font-semibold text-slate-800">・reschedule (動)</span>: 予定を変更する、日時を繰り延べる</p>
            <p><span class="font-semibold text-slate-800">・quarterly (形)</span>: 四半期ごとの、年4回の</p>
          </div>
        </div>

      </main>

      <!-- CONTROL AREA (Fixed Bottom) -->
      <footer class="bg-white border-t border-slate-200/80 p-3 space-y-3 shrink-0 shadow-lg z-10">
        
        <!-- Player Controls & Seekbar -->
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col gap-2">
          
          <!-- Seekbar & Time -->
          <div class="flex items-center gap-3 px-1">
            <span id="player-time-current" class="text-[10px] font-mono font-medium text-slate-400 w-8 text-right">0:00</span>
            <input type="range" id="player-seekbar" value="0" min="0" max="100" class="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer">
            <span id="player-time-total" class="text-[10px] font-mono font-medium text-slate-400 w-8">0:03</span>
          </div>

          <!-- Controls Row -->
          <div class="flex items-center justify-between pt-1">
            
            <!-- Hide Question Toggle Switch -->
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="btn-hide-question" class="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5">
              <span class="text-xs font-semibold text-slate-600">問題を非表示</span>
            </label>

            <!-- Play Buttons -->
            <div class="flex items-center gap-2">
              <button id="btn-restart" title="先頭から再生" class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              </button>

              <button id="btn-play" class="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md shadow-indigo-200 transition active:scale-95">
                <i data-lucide="play" id="icon-play" class="w-4 h-4 fill-white translate-x-0.5"></i>
              </button>
            </div>

            <!-- Speed Control -->
            <div class="flex items-center gap-1">
              <i data-lucide="gauge" class="w-3.5 h-3.5 text-slate-400"></i>
              <select id="player-speed" class="text-[11px] font-bold bg-transparent text-slate-600 focus:outline-none cursor-pointer">
                <option value="0.8">0.8x</option>
                <option value="0.9">0.9x</option>
                <option value="1.0" selected>1.0x</option>
                <option value="1.1">1.1x</option>
                <option value="1.2">1.2x</option>
                <option value="1.3">1.3x</option>
                <option value="1.4">1.4x</option>
                <option value="1.5">1.5x</option>
              </select>
            </div>

          </div>
        </div>

        <!-- Pagination Buttons -->
        <div class="grid grid-cols-2 gap-3">
          <button id="btn-prev" class="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 active:scale-[0.98]">
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
            前へ
          </button>
          <button id="btn-next" class="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 shadow-sm active:scale-[0.98]">
            次へ
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
        </div>

      </footer>

    </div>

  </div>

  <!-- Notification Toast -->
  <div id="toast" class="fixed bottom-6 right-6 bg-slate-800 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg transition-opacity duration-300 opacity-0 pointer-events-none z-50 flex items-center gap-2">
    <i data-lucide="info" class="w-4 h-4 text-indigo-400"></i>
    <span id="toast-message">メッセージ</span>
  </div>

  <!-- ========================================== -->
  <!-- JAVASCRIPT APP LOGIC                       -->
  <!-- ========================================== -->
  <script>
    // --- Mock Data ---
    let items = [
      { id: '1', name: 'TOEIC 頻出英単語 1000.json', count: 12 },
      { id: '2', name: '日常英会話フレーズ集_基本.csv', count: 5 },
      { id: '3', name: 'ビジネス英語表現カード.json', count: 0 }
    ];

    const sampleQuestions = [
      {
        id: 1,
        title: "Lesson 01 - Business",
        h1: "オフィスでの会話",
        h2: "会議室予約",
        h3: "",
        en: "We need to reschedule the quarterly budget meeting for next Tuesday.",
        jp: "来週の火曜日に四半期予算会議の予定を変更する必要があります。",
        notes: "・reschedule (動): 予定を変更する\n・quarterly (形): 四半期ごとの"
      },
      {
        id: 2,
        title: "Lesson 01 - Business",
        h1: "オフィスでの会話",
        h2: "メール送信",
        h3: "添付ファイル",
        en: "Please find the attached document regarding our revised project proposal.",
        jp: "修正されたプロジェクト提案書に関する添付ファイルをご確認ください。",
        notes: "・attached (形): 添付された\n・revised (形): 改訂された"
      },
      {
        id: 3,
        title: "Lesson 02 - Travel",
        h1: "空港での手続き",
        h2: "",
        h3: "",
        en: "Could you tell me where the baggage claim area for Flight 302 is?",
        jp: "302便の手荷物受取所がどこにあるか教えていただけますか？",
        notes: "・baggage claim (名): 手荷物受取所"
      }
    ];

    // --- State ---
    let selectedItemId = '1';
    let currentQuestionIdx = 0;
    let isPlaying = false;
    let playInterval = null;
    let playbackProgress = 0;

    // --- DOM Elements ---
    const topScreen = document.getElementById('top-screen');
    const questionScreen = document.getElementById('question-screen');
    const itemList = document.getElementById('item-list');
    const itemCount = document.getElementById('item-count');
    
    // Settings Elements
    const settingCount = document.getElementById('setting-count');
    const settingAutoplay = document.getElementById('setting-autoplay');
    const settingLoop = document.getElementById('setting-loop');
    const settingAutonext = document.getElementById('setting-autonext');
    const settingSpeed = document.getElementById('setting-speed');

    // Player Elements
    const btnPlay = document.getElementById('btn-play');
    const iconPlay = document.getElementById('icon-play');
    const playerSeekbar = document.getElementById('player-seekbar');
    const playerTimeCurrent = document.getElementById('player-time-current');
    const playerSpeed = document.getElementById('player-speed');

    // Render Items Function
    function renderItems() {
      itemList.innerHTML = '';
      itemCount.textContent = `${items.length}件`;

      items.forEach(item => {
        const isSelected = item.id === selectedItemId;
        const div = document.createElement('div');
        div.className = `p-3 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
          isSelected 
            ? 'bg-indigo-50/70 border-indigo-200 shadow-sm' 
            : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
        }`;

        div.onclick = () => {
          selectedItemId = item.id;
          renderItems();
        };

        div.innerHTML = `
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="w-8 h-8 rounded-lg ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'} flex items-center justify-center shrink-0">
              <i data-lucide="file" class="w-4 h-4"></i>
            </div>
            <div class="truncate">
              <h4 class="text-xs font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-700'} truncate">${item.name}</h4>
              <p class="text-[10px] ${isSelected ? 'text-indigo-600' : 'text-slate-400'} font-medium">${item.count}回実施</p>
            </div>
          </div>
          <button onclick="deleteItem(event, '${item.id}')" title="削除" class="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        `;
        itemList.appendChild(div);
      });
      lucide.createIcons();
    }

    // Delete Item
    window.deleteItem = function(e, id) {
      e.stopPropagation();
      items = items.filter(i => i.id !== id);
      if (selectedItemId === id && items.length > 0) {
        selectedItemId = items[0].id;
      }
      renderItems();
      showToast('ファイルを削除しました');
    };

    // Import File Handler
    document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click();
    document.getElementById('file-input').onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const newItem = {
          id: Date.now().toString(),
          name: file.name,
          count: 0
        };
        items.push(newItem);
        selectedItemId = newItem.id;
        renderItems();
        showToast(`「${file.name}」を取り込みました`);
      }
    };

    // Switch Screens
    function startQuestionSession() {
      const selectedItem = items.find(i => i.id === selectedItemId);
      if (selectedItem) {
        selectedItem.count += 1;
        renderItems();
        document.getElementById('q-item-name').textContent = selectedItem.name;
      }
      topScreen.classList.add('hidden');
      questionScreen.classList.remove('hidden');
      questionScreen.classList.add('flex');
      
      currentQuestionIdx = 0;
      loadQuestion(currentQuestionIdx);

      // Apply initial settings
      playerSpeed.value = settingSpeed.value;
      if (settingAutoplay.checked) {
        setTimeout(togglePlay, 300);
      }
    }

    document.getElementById('btn-start').onclick = startQuestionSession;
    document.getElementById('btn-resume').onclick = () => {
      showToast('前回の続きから再開します');
      startQuestionSession();
    };

    document.getElementById('btn-exit').onclick = () => {
      pauseAudio();
      questionScreen.classList.add('hidden');
      questionScreen.classList.remove('flex');
      topScreen.classList.remove('hidden');
    };

    // Load Question Data
    function loadQuestion(index) {
      const q = sampleQuestions[index % sampleQuestions.length];
      
      document.getElementById('q-progress-session').textContent = `${index + 1} / ${settingCount.value === 'all' ? sampleQuestions.length : settingCount.value}`;
      document.getElementById('q-progress-total').textContent = q.id;

      document.getElementById('q-meta-title').textContent = q.title;
      document.getElementById('q-meta-h1').textContent = q.h1 ? `見出し1: ${q.h1}` : '-';
      document.getElementById('q-meta-h2').textContent = q.h2 || '-';
      document.getElementById('q-meta-h3').textContent = q.h3 || '-';

      document.getElementById('q-text-en').textContent = q.en;
      document.getElementById('q-text-jp').textContent = q.jp;
      
      // Parse notes newline to HTML
      const notesContainer = document.getElementById('q-notes');
      notesContainer.innerHTML = q.notes
        .split('\n')
        .map(line => `<p>${line}</p>`)
        .join('');

      resetAudio();
    }

    // Toggle Japanese Text
    let isJpHidden = false;
    document.getElementById('btn-toggle-jp').onclick = () => {
      isJpHidden = !isJpHidden;
      const jpWrapper = document.getElementById('wrapper-jp');
      const toggleText = document.getElementById('text-toggle-jp');
      const icon = document.getElementById('icon-jp-eye');

      if (isJpHidden) {
        jpWrapper.classList.add('opacity-0', 'pointer-events-none');
        toggleText.textContent = '日本語訳を表示';
        icon.setAttribute('data-lucide', 'eye-off');
      } else {
        jpWrapper.classList.remove('opacity-0', 'pointer-events-none');
        toggleText.textContent = '日本語訳を隠す';
        icon.setAttribute('data-lucide', 'eye');
      }
      lucide.createIcons();
    };

    // Hide Question Text Flag
    document.getElementById('btn-hide-question').onchange = (e) => {
      const enText = document.getElementById('q-text-en');
      if (e.target.checked) {
        enText.classList.add('blur-sm', 'select-none');
      } else {
        enText.classList.remove('blur-sm', 'select-none');
      }
    };

    // --- Simulated Audio Player logic using SpeechSynthesis API fallback ---
    function togglePlay() {
      if (isPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    }

    function playAudio() {
      isPlaying = true;
      iconPlay.setAttribute('data-lucide', 'pause');
      lucide.createIcons();

      // Fallback speech synthesis or simulated seekbar movement
      const textToSpeak = sampleQuestions[currentQuestionIdx % sampleQuestions.length].en;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'en-US';
        utterance.rate = parseFloat(playerSpeed.value);
        
        utterance.onend = () => {
          pauseAudio();
          playbackProgress = 100;
          updateSeekbarUI();
          if (settingAutonext.checked) {
            setTimeout(nextQuestion, 500);
          }
        };
        
        window.speechSynthesis.speak(utterance);
      }

      // Timer for seekbar visual update
      clearInterval(playInterval);
      playInterval = setInterval(() => {
        if (playbackProgress < 100) {
          playbackProgress += 2 * parseFloat(playerSpeed.value);
          updateSeekbarUI();
        } else {
          clearInterval(playInterval);
        }
      }, 100);
    }

    function pauseAudio() {
      isPlaying = false;
      iconPlay.setAttribute('data-lucide', 'play');
      lucide.createIcons();
      clearInterval(playInterval);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
    }

    function resetAudio() {
      pauseAudio();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      playbackProgress = 0;
      updateSeekbarUI();
    }

    function updateSeekbarUI() {
      playerSeekbar.value = Math.min(playbackProgress, 100);
      const totalSec = 3;
      const curSec = Math.floor((playbackProgress / 100) * totalSec);
      playerTimeCurrent.textContent = `0:0${curSec}`;
    }

    btnPlay.onclick = togglePlay;
    document.getElementById('btn-restart').onclick = () => {
      resetAudio();
      playAudio();
    };

    playerSpeed.onchange = (e) => {
      settingSpeed.value = e.target.value;
      if (isPlaying) {
        playAudio();
      }
    };

    // Navigation
    function nextQuestion() {
      const maxCount = settingCount.value === 'all' ? sampleQuestions.length : parseInt(settingCount.value);
      if (currentQuestionIdx + 1 < maxCount) {
        currentQuestionIdx++;
        loadQuestion(currentQuestionIdx);
        if (settingAutoplay.checked) {
          playAudio();
        }
      } else {
        showToast('セッションが完了しました');
        document.getElementById('btn-exit').click();
      }
    }

    function prevQuestion() {
      if (currentQuestionIdx > 0) {
        currentQuestionIdx--;
        loadQuestion(currentQuestionIdx);
        if (settingAutoplay.checked) {
          playAudio();
        }
      }
    }

    document.getElementById('btn-next').onclick = nextQuestion;
    document.getElementById('btn-prev').onclick = prevQuestion;

    // Toast Utility
    function showToast(msg) {
      const toast = document.getElementById('toast');
      document.getElementById('toast-message').textContent = msg;
      toast.classList.remove('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        toast.classList.add('opacity-0', 'pointer-events-none');
      }, 2500);
    }

    // Initialize Icons & List
    window.onload = () => {
      renderItems();
      lucide.createIcons();
    };
  </script>
</body>
</html>