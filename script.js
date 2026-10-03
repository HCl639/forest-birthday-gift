/* 原創向量插畫，無框架、無外部字型或網路依賴；file:// 也可執行。
 * door-frame-enhanced.png 為增強版影片的第一個解碼影格（完整尺寸、未裁切）。
 * 更換影片後，以 README 的 OpenCV 指令重新擷取；本機選片則即時擷取。
 */
'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const video = $('#birthday-video');
const dialog = $('#level-dialog');
const scene = $('#level-scene');
const storageKey = 'wishing-woods-progress-v1';
const gameState = { levels: [false, false, false, false], active: null, rewarding: false, playing: false, mediaReady: false };
const levels = [
  { title: '森林尋物', eyebrow: 'CHAPTER 01 · 白天的悄悄話', instruction: '探一探苔蘚、木箱和樹洞。小動物留下的線索，會帶你找到第一塊拼圖。' },
  { title: '換個角度，魔法就出現', eyebrow: 'CHAPTER 02 · 午後的光與風', instruction: '左右走一走，或移動下方刻度。讓懸在不同遠近的四片木雕，在眼前拼成同一個輪廓。' },
  { title: '追著黃昏的光走', eyebrow: 'CHAPTER 03 · 夕陽寫下的線索', instruction: '左右拖動夕陽刻度。四片木雕懸在不同高度；讓它們投在石台上的影子，貼合淡淡的輪廓。' },
  { title: '把心願連成天秤', eyebrow: 'CHAPTER 04 · 星空裡的生日願望', instruction: '從輕輕閃爍的星星開始，依序點亮星光，最後回到起點，畫出天秤座。' }
];
const svg = (content, viewBox = '0 0 100 100') => `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${content}</svg>`;
// 自製角色與道具，統一柔和線條與蜂蜜色。
const drawings = {
  honey: `<path d="M25 31Q50 21 75 31L81 79Q80 91 50 92Q20 91 19 79Z" fill="#cc9849" stroke="#936a37" stroke-width="2"/><ellipse cx="50" cy="30" rx="27" ry="8" fill="#eee0b3"/><path d="M22 37Q31 43 33 58Q39 67 43 50Q50 42 53 55Q60 65 63 45L78 38" fill="#f0bd55"/><path d="M34 66Q50 58 66 66V80H34Z" fill="#f2e7bd"/><path d="M41 72h18" stroke="#a88040" stroke-width="2"/><path d="M57 20l16-15" stroke="#9b764a" stroke-width="5"/><path d="M64 7l13 13M68 3l13 13" stroke="#b58b4e" stroke-width="4"/>`,
  leaf: `<path d="M15 83Q3 23 85 12Q101 74 15 83Z" fill="#9cae71" stroke="#738958" stroke-width="2"/><path d="M12 91L75 24M33 69L29 42M45 56L68 62M59 43L55 26" fill="none" stroke="#d8dfaa" stroke-width="2"/>`,
  sun: `<circle cx="50" cy="48" r="24" fill="#dfab57"/><g stroke="#d2a15c" stroke-width="2" stroke-linecap="round"><path d="M50 8v9M50 79v10M10 48h9M82 48h9M21 19l7 7M74 72l7 7M21 79l7-7M74 26l7-7"/></g><path d="M7 86Q30 69 50 83Q71 70 94 86" fill="none" stroke="#85956e" stroke-width="3"/>`,
  stars: `<path d="M24 62L33 25L73 34L79 72Z" fill="none" stroke="#a3b4a9" stroke-width="1.5"/><g fill="#f6f0c9" stroke="#b7a776"><path d="M33 16l2 7 7 2-7 2-2 7-2-7-7-2 7-2Z"/><path d="M73 27l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/><path d="M24 55l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/><path d="M79 65l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/></g><circle cx="52" cy="9" r="2" fill="#c6b477"/>`,
  bush: `<path d="M8 80Q-1 48 24 50Q21 20 47 34Q62 10 77 41Q102 31 96 64Q111 90 74 89H29Z" fill="#729458"/><path d="M20 71q10-19 24-9M48 54q9-16 22-4M64 79q11-20 22-12" fill="none" stroke="#a8b978" stroke-width="3"/>`,
  rock: `<path d="M9 79L23 43L55 27L83 45L94 78L65 90L30 88Z" fill="#a6ac95" stroke="#7d8b76" stroke-width="2"/><path d="M23 43L44 68L83 45M44 68L30 88M44 68L65 90" fill="none" stroke="#c9ceba" stroke-width="2"/>`,
  hollow: `<path d="M24 4Q45 15 74 4L83 94H15Z" fill="#a68555"/><path d="M28 13l-4 71M69 12l6 70M44 7v15" stroke="#805e3c" stroke-width="3"/><ellipse cx="50" cy="60" rx="22" ry="28" fill="#66543b"/><ellipse cx="50" cy="66" rx="15" ry="21" fill="#3f4430"/><path d="M17 88Q50 78 83 88" fill="none" stroke="#c29c65" stroke-width="3"/>`,
  crate: `<path d="M16 30L76 24L91 38L30 44Z" fill="#dbb77a" stroke="#9b774b" stroke-width="2"/><path d="M16 30v51l14 13V44M30 44l61-6v48L30 94Z" fill="#ba935e" stroke="#8f6d44" stroke-width="2"/><path d="M33 53l55-6M33 69l55-6M33 84l55-6M41 50l38 30" stroke="#e2c18a" stroke-width="3"/>`,
  flower: `<path d="M50 90V43M50 73Q18 50 22 74Q32 86 50 79M50 66Q80 45 78 66Q67 77 50 74" fill="#7b9957" stroke="#64854e" stroke-width="3"/><g fill="#f1deb1"><ellipse cx="50" cy="26" rx="10" ry="17"/><ellipse cx="68" cy="41" rx="16" ry="10"/><ellipse cx="59" cy="56" rx="10" ry="15"/><ellipse cx="38" cy="55" rx="10" ry="15"/><ellipse cx="31" cy="38" rx="16" ry="10"/></g><circle cx="50" cy="42" r="12" fill="#d7a650"/>`
};
$('#bear').innerHTML = svg(`<ellipse cx="83" cy="175" rx="63" ry="9" fill="#5c724d22"/><ellipse cx="55" cy="31" rx="18" ry="19" fill="#d6a74c"/><ellipse cx="109" cy="31" rx="18" ry="19" fill="#d6a74c"/><ellipse cx="55" cy="32" rx="10" ry="11" fill="#e7bf69"/><ellipse cx="109" cy="32" rx="10" ry="11" fill="#e7bf69"/><ellipse cx="82" cy="126" rx="43" ry="47" fill="#deb45a"/><ellipse cx="83" cy="125" rx="27" ry="33" fill="#ecd08b"/><ellipse cx="46" cy="164" rx="20" ry="13" fill="#d2a34b"/><ellipse cx="116" cy="164" rx="20" ry="13" fill="#d2a34b"/><ellipse cx="36" cy="114" rx="14" ry="27" transform="rotate(25 36 114)" fill="#dbaf54"/><ellipse cx="128" cy="111" rx="13" ry="26" transform="rotate(-30 128 111)" fill="#dbaf54"/><path d="M38 57Q39 22 80 25Q127 24 127 63Q126 99 83 102Q38 99 38 57Z" fill="#e6bc65"/><ellipse cx="82" cy="76" rx="26" ry="18" fill="#f0d89a"/><g fill="#59482f"><circle cx="61" cy="61" r="3.3"/><circle cx="102" cy="61" r="3.3"/><ellipse cx="82" cy="72" rx="6" ry="4.5"/></g><path d="M82 76v7m-8-2q8 9 16 0" stroke="#725537" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="52" cy="75" rx="7" ry="4" fill="#d995633a"/><ellipse cx="111" cy="75" rx="7" ry="4" fill="#d995633a"/><path d="M52 99Q80 111 113 98L110 108Q80 123 53 109Z" fill="#738859"/><path d="M100 108l8 25 12-5-9-24" fill="#829662"/><path d="M142 151q-2-28 10-40q16 17 9 39" fill="#bdc4a0"/><path d="M144 116l-4-35q10-6 13 31M155 116l5-34q11 0 3 35" fill="#bdc4a0"/><circle cx="147" cy="126" r="2" fill="#514e37"/><circle cx="159" cy="125" r="2" fill="#514e37"/><path d="M153 132l3 0" stroke="#87735a" stroke-width="2"/>`, '0 0 185 190');
['honey','leaf','sun','stars'].forEach((key,i) => $(`#art-${i}`).innerHTML = svg(drawings[key]));
// 多層森林、彎曲小徑與葉冠，均為原創 SVG 路徑。
$('#forest').innerHTML = `<defs><linearGradient id="hill" x2="0" y2="1"><stop stop-color="#bbc99b"/><stop offset="1" stop-color="#80955e"/></linearGradient><linearGradient id="path" x2="0" y2="1"><stop stop-color="#dedbb0"/><stop offset="1" stop-color="#e9d8a7"/></linearGradient></defs><path d="M0 513Q183 410 380 505Q720 398 1000 491Q1240 424 1440 471V940H0Z" fill="#c3cfab"/><path d="M0 640Q240 557 464 609Q826 539 1080 624Q1300 529 1440 580V940H0Z" fill="url(#hill)"/><path d="M624 598Q849 639 699 744Q561 837 955 940H461Q363 826 579 741Q735 650 624 598Z" fill="url(#path)" opacity=".76"/>` +
  [ [-50,1.05],[100,.7],[235,.47],[1170,.48],[1320,.8],[1440,1.1] ].map(([x,s],i)=>`<g transform="translate(${x} ${320-190*s}) scale(${s})"><path d="M-26 650Q-4 400-25 100L22 86Q14 420 49 650Z" fill="${i%2?'#7b8155':'#6e794e'}"/><path d="M5 298L-111 161M12 226L99 106M8 393L-98 299" stroke="#7c8755" stroke-width="18" stroke-linecap="round"/><g fill="${i%2?'#849966':'#718856'}"><ellipse cx="-60" cy="119" rx="105" ry="135"/><ellipse cx="65" cy="49" rx="118" ry="136"/><ellipse cx="-3" cy="-31" rx="135" ry="128"/><ellipse cx="-111" cy="258" rx="65" ry="79"/></g><g fill="#9aaf77" opacity=".5"><ellipse cx="-91" cy="55" rx="48" ry="62"/><ellipse cx="72" cy="-16" rx="62" ry="80"/></g></g>`).join('') +
 `<path d="M0 854Q81 799 160 844Q215 814 275 883L285 940H0Z" fill="#69804e"/><path d="M1440 796Q1358 764 1284 839Q1221 817 1162 893L1132 940H1440Z" fill="#687e4d"/><g fill="#e0d49a"><circle cx="75" cy="859" r="3"/><circle cx="111" cy="883" r="4"/><circle cx="1334" cy="840" r="3"/><circle cx="1297" cy="883" r="4"/></g><g fill="#8d9e66"><path d="M322 853q-30-50-10-59q26 21 10 59M331 863q-4-62 23-50q8 28-23 50M1100 809q-30-50-10-59q26 21 10 59"/></g><g fill="#fff5c5" opacity=".8"><path d="M356 350q9-11 13 0q9-8 10 2q-14 10-23-2M1085 300q9-11 13 0q9-8 10 2q-14 10-23-2"/></g>`;

let activeController = null;
let alignmentTimer = null;
let mediaGeneration = 0;
let fileURL = null;
let toastTimer;
function toast(text) { $('#toast').textContent = text; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3000); }
function save() { try { localStorage.setItem(storageKey, JSON.stringify(gameState.levels)); } catch { /* 私密瀏覽/file 協定可禁用儲存，遊戲仍正常。 */ } }
try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (Array.isArray(saved) && saved.length === 4) { let preceding = true; gameState.levels = saved.map(value => (preceding = preceding && value === true)); } } catch { /* 首次進入 */ }
function renderProgress(celebrate = false) {
  const count = gameState.levels.filter(Boolean).length;
  document.body.dataset.time = String(count);
  $('#time-label').textContent = ['白晝 · 森林甦醒','午後 · 葉間微光','黃昏 · 夕陽低語','星夜 · 心願閃爍','星夜 · 秘密完整'][count];
  $('#progress-count').textContent = `${count} / 4`;
  $('#progress-icons').textContent = gameState.levels.map(done => done ? '◆' : '◇').join(' ');
  $$('.piece').forEach((piece,i) => piece.classList.toggle('collected',gameState.levels[i]));
  $$('.level-entry').forEach((entry,i) => {
    entry.disabled = gameState.levels[i] || (i > 0 && !gameState.levels[i-1]);
    entry.classList.toggle('done',gameState.levels[i]);
    $('.entry-status',entry).textContent = gameState.levels[i] ? '已收集拼圖 ✓' : entry.disabled ? `等待第${['一','二','三'][i-1]}塊拼圖` : '開始探索 ↗';
  });
  $('#wood-frame').classList.toggle('complete',count === 4);
  $('#door').disabled = count !== 4 || !gameState.mediaReady;
  $('#door').setAttribute('aria-label', count === 4 ? '點一下，播放生日動畫' : `神秘木門，已收集 ${count} 塊拼圖`);
  $('#frame-message').textContent = count === 4 ? '門已經完整了。' : count === 0 ? '每一塊拼圖，都藏著一點小小的魔法。' : ['','找到第一塊了。午後的風，帶來新的線索。','兩塊拼圖了。跟著夕陽，繼續往前。','只差最後一塊了。抬頭看看星空。'][count];
  if (count === 4) setTimeout(() => { if (!gameState.playing && gameState.levels.every(Boolean)) $('#frame-message').textContent = gameState.mediaReady ? '點一下，看看門後有什麼。' : '選擇生日影片，讓最後的秘密開始。'; }, celebrate ? 1800 : 700);
}
function stopLevel() { activeController?.abort(); activeController = null; clearTimeout(alignmentTimer); alignmentTimer = null; }
function closeLevel() { if (gameState.rewarding) return; stopLevel(); dialog.close(); gameState.active = null; }
$('#close-level').addEventListener('click',closeLevel);
dialog.addEventListener('cancel',event => { event.preventDefault(); closeLevel(); });
dialog.addEventListener('click',event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeLevel(); } });
function openLevel(index) {
  if (gameState.rewarding || gameState.playing || gameState.levels[index] || (index && !gameState.levels[index-1])) return;
  stopLevel(); activeController = new AbortController(); gameState.active = index;
  $('#level-title').textContent = levels[index].title; $('#level-eyebrow').textContent = levels[index].eyebrow; $('#level-instruction').textContent = levels[index].instruction;
  $('#level-feedback').textContent = ''; scene.innerHTML = ''; scene.className = ''; dialog.showModal();
  [setupSearch,setupParallax,setupShadows,setupStars][index]();
}
$$('.level-entry').forEach(entry => entry.addEventListener('click',() => openLevel(Number(entry.dataset.level))));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function award(index) {
  if (gameState.rewarding || gameState.levels[index] || gameState.active !== index) return;
  gameState.rewarding = true; $('#close-level').disabled = true; scene.classList.add('aligned');
  $$('.fragment, .shadow-fragment',scene).forEach(fragment => { fragment.style.transition = 'transform .4s ease'; fragment.style.transform = 'none'; });
  $('#level-feedback').textContent = ['找到第一塊了。','風景相遇，第二塊拼圖亮起來了。','光與影的秘密，原來在這裡。','天秤座把最後一塊拼圖送給你。'][index];
  stopLevel();
  await delay(900);
  dialog.close(); gameState.active = null;
  // 小螢幕可能剛從頁面下方開關卡，先把木框帶回視野，讓飛入動畫可見。
  $('#wood-frame').scrollIntoView({block:'center',behavior:'instant'});
  const target = $(`[data-piece="${index}"]`); const box = target.getBoundingClientRect();
  const reward = document.createElement('div'); reward.className = 'reward'; reward.style.left = `${innerWidth/2-35}px`; reward.style.top = `${innerHeight/2-35}px`; document.body.append(reward);
  await delay(35);
  reward.style.transform = `translate(${box.left+box.width/2-innerWidth/2}px,${box.top+box.height/2-innerHeight/2}px) scale(.55) rotate(12deg)`;
  await delay(1000);
  reward.remove(); gameState.levels[index] = true; save(); renderProgress(true); target.classList.add('arrived');
  setTimeout(() => target.classList.remove('arrived'),1400);
  gameState.rewarding = false; $('#close-level').disabled = false;
}
// 滑鼠、觸控 Pointer Events + 原生 range 的鍵盤支援。不同深度各自位移。
function installPerspectiveControl(target, update) {
  let pointer = null;
  const signal = activeController.signal;
  const setFromPoint = event => { const rect = scene.getBoundingClientRect(); target.value = String(Math.round(Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100)))); update(Number(target.value)); };
  scene.addEventListener('pointerdown',event => { if (event.target.closest('input') || gameState.rewarding) return; pointer = event.pointerId; scene.setPointerCapture(pointer); setFromPoint(event); },{signal});
  scene.addEventListener('pointermove',event => { if (event.pointerId === pointer) setFromPoint(event); },{signal});
  const release = () => { pointer = null; };
  scene.addEventListener('pointerup',release,{signal}); scene.addEventListener('pointercancel',release,{signal});
  target.addEventListener('input',() => update(Number(target.value)),{signal});
  update(Number(target.value));
}
// 共用像素比例。影片與拼圖永远使用同一個容器，沒有放大裁切差異。
function setDoorImage(url) { document.documentElement.style.setProperty('--door-image',`url("${url}")`); }
setDoorImage('assets/door-frame-enhanced.png');
function mediaNotice(message) {
  const notice = $('#media-notice'); notice.replaceChildren(document.createTextNode(message));
  const pick = document.createElement('button'); pick.textContent = '選擇影片'; pick.addEventListener('click',() => $('#video-file').click()); notice.append(pick); notice.hidden = false;
}
video.addEventListener('loadeddata',() => { gameState.mediaReady = true; $('#media-notice').hidden = true; renderProgress(); });
video.addEventListener('loadedmetadata',() => { if(video.videoWidth && video.videoHeight) $('#door').style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`; });
video.addEventListener('error',() => { gameState.mediaReady = false; if (gameState.playing) recoverPlayback(); renderProgress(); mediaNotice('生日影片尚未載入。請確認 assets/birthday-enhanced.mp4，或選擇本機影片。'); });
$('#choose-video').addEventListener('click',() => $('#video-file').click());
$('#video-file').addEventListener('change',async event => {
  const file = event.target.files[0]; if(!file || gameState.playing) return;
  const generation = ++mediaGeneration;
  gameState.mediaReady = false; $('#door').disabled = true;
  if(fileURL) URL.revokeObjectURL(fileURL); fileURL = URL.createObjectURL(file);
  video.src = fileURL; video.removeAttribute('poster'); video.load();
  try {
    await new Promise((resolve,reject) => { video.addEventListener('loadeddata',resolve,{once:true}); video.addEventListener('error',reject,{once:true}); });
    if(generation !== mediaGeneration) return;
    // 新片第一個可解碼影格，PNG 保留原像素。Blob URL 可在 file:// 安全畫入 canvas。
    video.currentTime = 0;
    const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight; canvas.getContext('2d').drawImage(video,0,0);
    const still = canvas.toDataURL('image/png'); setDoorImage(still); video.poster = still;
    gameState.mediaReady = true; renderProgress(); toast('新影片的第一幀，已經放進木框裡了。');
  } catch { gameState.mediaReady = false; renderProgress(); mediaNotice('這支影片無法解碼，請選擇瀏覽器支援的 MP4（H.264）。'); }
  event.target.value = '';
});
function recoverPlayback() {
  video.pause(); gameState.playing = false; video.classList.remove('visible'); document.body.classList.remove('cinema','cinema-expanded'); $('#wood-frame').classList.remove('playing'); $('#door').disabled = !gameState.mediaReady;
  $$('.interface').forEach(element => { element.inert = false; });
}
$('#door').addEventListener('click',async () => {
  if(gameState.playing || !gameState.mediaReady || !gameState.levels.every(Boolean)) return;
  // 以木門原本的螢幕位置作為展開起點，避免影片突然跳到畫面中央。
  const opening = $('#door').getBoundingClientRect();
  for (const [name,value] of Object.entries({left:opening.left,top:opening.top,width:opening.width,height:opening.height})) {
    $('#door').style.setProperty(`--opening-${name}`,`${value}px`);
  }
  gameState.playing = true; video.currentTime = 0; video.muted = false; $('#door').disabled = true;
  try {
    // play() 必須在此次使用者點擊的處理函式內啟動，允許手機播放帶聲音的影片。
    await video.play();
    // 先讓已解碼的第一幀出現，再把拼圖淡出，避免載入黑屏。
    video.classList.add('visible'); document.body.classList.add('cinema'); $('#wood-frame').classList.add('playing'); $('#media-notice').hidden = true;
    $$('.interface').forEach(element => { element.inert = true; });
    // 先繪製原尺寸影片，再平滑鋪滿整個視窗（包含手機直向）。
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if(gameState.playing) document.body.classList.add('cinema-expanded');
    }));
  } catch { recoverPlayback(); toast('播放暫時沒有開始，請再輕觸木門一次。'); }
});
video.addEventListener('ended',() => {
  // 先保留目前的終點影格；部分瀏覽器在結束時重新解碼，canvas 可避免黑畫面。
  const canvas = $('#last-frame'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  try { canvas.getContext('2d').drawImage(video,0,0); canvas.classList.add('visible'); } catch { /* file:// 的影片仍可直接保留最後一幀 */ }
  video.pause();
  // 不再 seek：部分不支援 Range 的靜態伺服器會在 seek 時重置到 0。
  // canvas 保留真正的最後影格，video 自然停在 duration，比回退 0.05 秒更穩定。
  // 保持同一頁、同一個畫框，不出現結尾 UI。
});
$('#reset').addEventListener('click',() => {
  if(gameState.rewarding || gameState.playing) return;
  closeLevel(); gameState.levels.fill(false); save(); renderProgress(); toast('新的森林旅程，從第一片葉子開始。');
});
renderProgress();

// 畫框依主場景剩餘高度排版，文字和關卡入口保持正常字級，整頁不需捲動。
function fitForestLayout() {
  if(gameState.playing)return;
  const clearing=$('.clearing'),frame=$('#wood-frame'),message=$('#frame-message');
  const style=getComputedStyle(frame),messageStyle=getComputedStyle(message);
  const verticalPadding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom);
  const horizontalPadding=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight);
  const caption=message.getBoundingClientRect().height+parseFloat(messageStyle.marginTop)+$('.frame-foot').getBoundingClientRect().height;
  const ratio=video.videoWidth&&video.videoHeight?video.videoWidth/video.videoHeight:910/512;
  const available=Math.max(1,clearing.clientHeight-caption-verticalPadding-8);
  const width=Math.max(1,Math.min(clearing.clientWidth*.88,available*ratio+horizontalPadding));
  document.documentElement.style.setProperty('--fitted-frame-width',`${width}px`);
  document.documentElement.style.setProperty('--clearing-height',`${clearing.clientHeight}px`);
  if(scene.clientHeight)scene.style.setProperty('--scene-height',`${scene.clientHeight}px`);
}
let layoutFrame;
function queueLayoutFit(){cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(fitForestLayout);}
window.addEventListener('resize',queueLayoutFit);
video.addEventListener('loadedmetadata',queueLayoutFit);
if(typeof ResizeObserver!=='undefined'){
  const layoutObserver=new ResizeObserver(queueLayoutFit);
  layoutObserver.observe($('.clearing'));
  layoutObserver.observe(scene);
}
queueLayoutFit();
