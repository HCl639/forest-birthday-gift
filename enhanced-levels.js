/* 細緻場景與實際投影關卡。與原頁共用狀態、獎勵、觸控和影片轉場。 */
'use strict';
const G = ForestGeometry;
const artDefs = `<defs>
  <linearGradient id="wood3d" x1="0" x2="1" y2=".7"><stop stop-color="#5d361e"/><stop offset=".25" stop-color="#b9874d"/><stop offset=".55" stop-color="#dbb77b"/><stop offset="1" stop-color="#6e4426"/></linearGradient>
  <radialGradient id="honey3d" cx=".3" cy=".2"><stop stop-color="#ffdf89"/><stop offset=".65" stop-color="#c9943e"/><stop offset="1" stop-color="#805020"/></radialGradient>
  <radialGradient id="stone3d" cx=".3" cy=".2"><stop stop-color="#bbbda5"/><stop offset=".7" stop-color="#717d6a"/><stop offset="1" stop-color="#3e4f41"/></radialGradient>
  <linearGradient id="leaf3d" x2="1" y2="1"><stop stop-color="#bdcb78"/><stop offset=".45" stop-color="#6e9143"/><stop offset="1" stop-color="#244c2e"/></linearGradient>
  <radialGradient id="petal3d"><stop stop-color="#fff4d4"/><stop offset="1" stop-color="#d5b687"/></radialGradient>
  <filter id="propShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="2" dy="5" stdDeviation="3" flood-color="#1c2715" flood-opacity=".42"/></filter>
  <filter id="magicGlow" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#ffdf75"/></filter>
  <pattern id="grain3d" width="34" height="80" patternUnits="userSpaceOnUse"><path d="M2 0q14 22 2 40t0 40M16 0q-8 30 5 45t-2 35M28 0q8 20 0 35t4 45" stroke="#4f2e19" opacity=".22" fill="none" stroke-width="1.3"/></pattern>
</defs>`;
function detailedSVG(content,viewBox='0 0 100 100',extra='') {
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" ${extra}>${artDefs}${content}</svg>`;
}
function propArt(key) {
  let drawing=drawings[key];
  if(key==='bush') {
    drawing='<ellipse cx="50" cy="85" rx="42" ry="8" fill="#233f2966"/>';
    for(let i=0;i<24;i++) {const x=12+(i*31)%76,y=28+(i*17)%51,a=(i*43)%160-80;drawing+=`<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 15Q-18-6 0-18Q18-6 0 15" fill="url(#leaf3d)"/><path d="M0 13V-13m0 6l-7-6m7 13l8-7" stroke="#c4d58c" opacity=".6" fill="none" stroke-width=".8"/></g>`;}
  } else if(key==='hollow') {
    drawing=`<path d="M17 98Q30 66 21 0H80Q71 67 88 98Z" fill="url(#wood3d)"/><path d="M17 98Q30 66 21 0H80Q71 67 88 98Z" fill="url(#grain3d)"/><ellipse cx="52" cy="60" rx="25" ry="29" fill="#412819" stroke="#b38a53" stroke-width="4"/><ellipse cx="52" cy="64" rx="20" ry="24" fill="#211f14"/><path class="hidden-piece" d="M43 52h8q-5-9 4-9t4 9h8v20H43Z" fill="#f2cf73"/><g class="hollow-curtain"><path d="M28 78Q43 28 68 38Q81 51 72 88Z" fill="url(#leaf3d)"/><path d="M34 79L63 44m-19 23l17 4m-8-15l-9-2" stroke="#bbc777" fill="none"/><path d="M20 85Q6 55 31 62Q45 81 20 85" fill="#536e34"/></g><path d="M13 97Q30 75 44 95Q62 79 90 95" fill="#536c37"/>`;
  } else {
    drawing=drawing.replaceAll('fill="#cc9849"','fill="url(#honey3d)"').replaceAll('fill="#a6ac95"','fill="url(#stone3d)"').replaceAll('fill="#ba935e"','fill="url(#wood3d)"').replaceAll('fill="#dbb77a"','fill="#e8c48a"').replaceAll('fill="#9cae71"','fill="url(#leaf3d)"').replaceAll('fill="#f1deb1"','fill="url(#petal3d)"');
    if(key==='crate') drawing=drawing.replace('<path d="M16 30','<path class="crate-lid" d="M16 30');
    if(key==='rock') drawing+='<path d="M18 77q7-12 18-5t18 1q10-7 26 0" stroke="#627c3d" stroke-width="9" fill="none" opacity=".8"/><circle cx="61" cy="51" r="2" fill="#e0dfbd"/>';
    if(key==='honey') drawing+='<ellipse cx="36" cy="47" rx="3" ry="12" fill="#fff6c4" opacity=".5"/>';
  }
  return detailedSVG(`<g filter="url(#propShadow)">${drawing}</g>`);
}
// 維尼肖像直接使用使用者影片的既有截圖，以 CSS 排版，未重新生成或修改影像。
$('#bear').innerHTML='<span class="pooh-portrait"><img src="assets/video-reference.webp" alt="生日影片裡穿紅色上衣的小熊維尼" width="910" height="512"></span><span class="pooh-name">Winnie the Pooh</span>';
['honey','leaf','sun','stars'].forEach((key,i)=>$(`#art-${i}`).innerHTML=propArt(key));
function ambience() {
  return `<div class="scene-haze"></div><div class="scene-dust">${Array.from({length:18},(_,i)=>`<i style="--x:${(i*37+8)%97}%;--y:${(i*23+12)%85}%;--delay:${-i*.8}s"></i>`).join('')}</div>`;
}
function sceneControl(label,left,right,initial) {
  return `<label class="scene-footer physical-control"><span>${left}</span><input type="range" min="0" max="100" value="${initial}" aria-label="${label}"><span>${right}</span></label>`;
}
function geometryFeedback(error,index,settle) {
  clearTimeout(alignmentTimer);
  const near=error<= (index===2 ? 10 : 12);
  scene.classList.toggle('aligned',near);
  const score=Math.round(Math.max(0,Math.min(100,100-error*1.15)));
  $('.resonance-fill',scene).style.width=`${score}%`;
  $('.resonance',scene).setAttribute('aria-label',`輪廓接近程度 ${score}%`);
  $('#level-feedback').textContent=near ? '輪廓相遇了，讓這束光停留一會兒……' : error<30 ? '邊緣快要貼合了，再慢慢挪一點。' : index===2 ? '看著木雕與它的影子，跟著夕陽慢慢找。' : '遠近的木片，正在眼前慢慢相遇。';
  if(near) alignmentTimer=setTimeout(()=>{settle?.();$('.resonance-fill',scene).style.width='100%';$('.resonance',scene).setAttribute('aria-label','輪廓接近程度 100%');award(index);},1000);
}
function resonance() {return '<div class="resonance"><span>輪廓的共鳴</span><div><i class="resonance-fill"></i></div></div>';}
// 預先解碼圖集；網路尚未完成時，六件道具先以內建向量插畫顯示。
const searchAtlas = new Image();
searchAtlas.src = 'assets/woodland-props-small.webp';
const searchAtlasReady = searchAtlas.decode().then(()=>true).catch(()=>false);
function setupSearch() {
  scene.className='detailed-scene search-scene';
  scene.innerHTML=ambience()+'<div class="exploration-note">葉間的足跡 <span>0 / 6</span></div><div class="search-clue">維尼說：有一處陰涼的地方，傳來小小的金色微光。</div>';
  const found=new Set();
  const objects=[['bush','草叢',8,57],['rock','苔蘚石頭',27,72],['hollow','樹洞',68,40],['honey','蜂蜜罐',55,68],['crate','木箱',78,70],['flower','花朵',39,43]];
  const atlas={bush:'0% 0%',rock:'50% 0%',hollow:'100% 0%',honey:'0% 100%',crate:'50% 100%',flower:'100% 100%'};
  objects.forEach(([key,label,x,y])=>{
    const object=document.createElement('button');object.className=`hidden-object detailed-prop sprite-prop prop-${key}`;object.style.left=`${x}%`;object.style.top=`${y}%`;object.setAttribute('aria-label',`探索${label}`);
    object.innerHTML=`<span class="prop-fallback">${propArt(key)}</span><span class="prop-sprite ${key==='crate'?'crate-body':''}" style="background-position:${atlas[key]}"></span>${key==='crate'?'<span class="prop-sprite crate-top" style="background-position:50% 100%"></span>':''}${key==='hollow'?`<span class="sprite-secret">✧</span><span class="hollow-vines">${propArt('leaf')}</span>`:''}`;
    scene.append(object);
    object.addEventListener('click',()=>{
      if(gameState.rewarding)return;
      found.add(key);$('.exploration-note span',scene).textContent=`${found.size} / 6`;
      object.classList.remove('react');void object.offsetWidth;object.classList.add('react');
      if(key==='hollow'){object.classList.add('discovered');award(0);return;}
      const mote=document.createElement('span');mote.className=`reaction illustrated-reaction ${key==='honey'?'bee-flight':''}`;
      mote.innerHTML=key==='honey'?detailedSVG('<ellipse cx="48" cy="44" rx="18" ry="12" fill="#f8d86c"/><path d="M43 34v20M54 34v20" stroke="#4a3621" stroke-width="5"/><ellipse cx="39" cy="25" rx="14" ry="10" fill="#fff8d8" opacity=".8"/><ellipse cx="59" cy="25" rx="14" ry="10" fill="#fff8d8" opacity=".8"/><circle cx="68" cy="42" r="3" fill="#352b20"/>'):key==='crate'?detailedSVG('<path d="M25 45Q30 90 50 94Q74 81 75 45Z" fill="url(#wood3d)"/><path d="M19 45Q20 13 50 18Q81 13 83 45Z" fill="#685334"/><path d="M49 18V8" stroke="#685334" stroke-width="6"/>'):propArt(key==='rock'?'stars':'leaf');
      mote.style.left=`${x+4}%`;mote.style.top=`${y}%`;scene.append(mote);setTimeout(()=>mote.remove(),1800);
      $('#level-feedback').textContent={bush:'露水從葉尖落下，裡面只有一片柔軟的羽毛。',rock:'苔蘚下面有小小的足跡，往老樹的方向去了。',honey:'小蜜蜂繞了個圈，像是在指向那片樹蔭。',crate:'木箱輕輕打開，松鼠的橡果滾了出來。',flower:'花瓣送出一陣香氣，金色微光在樹旁一閃而過。'}[key];
    },{signal:activeController.signal});
  });
  searchAtlasReady.then(ready=>{
    if(ready && scene.classList.contains('search-scene'))scene.classList.add('search-art-ready');
  });
}
function setupParallax() {
  scene.className='detailed-scene parallax-scene heart-scene';
  scene.innerHTML=ambience()+resonance()+`<div class="scene-story">轉動木雕，讓一顆心從不同深度慢慢浮現。</div>${detailedSVG(`<ellipse cx="400" cy="377" rx="170" ry="16" fill="#0b201680"/><path d="M365 370L380 341H420L435 370Z" fill="url(#wood3d)" stroke="#d3ad70"/><path d="M400 335V352" stroke="#c99e60" stroke-width="9"/><circle cx="400" cy="211" r="150" fill="#132a214d" stroke="#d1af73" stroke-width="6"/><circle cx="400" cy="211" r="141" fill="none" stroke="#dcc18a55" stroke-width="1"/>${Array.from({length:24},(_,i)=>`<path d="M400 62v${i%3===0?10:5}" transform="rotate(${i*15} 400 211)" stroke="#edd39a" stroke-width="1.5"/>`).join('')}<path class="heart-guide" d="${G.path(G.heart,p=>({x:400+p.x,y:212+p.z}))}" fill="#edc67410" stroke="#f4d49a" stroke-width="2" stroke-dasharray="4 6"/><ellipse class="turning-ring" cx="400" cy="211" rx="145" ry="150" fill="none" stroke="#bd8b47" stroke-width="3"/><g class="heart-pieces" filter="url(#propShadow)">${G.heartSlices.map((_,i)=>`<g data-heart-piece="${i}"><path class="heart-side" fill="#58351e"/><path class="heart-face" fill="${['#b28547','#ddbc7c','#9d753c'][i]}" stroke="#ffe3a5" stroke-width="1.8"/><path class="heart-grain" fill="url(#grain3d)"/></g>`).join('')}</g><text class="heart-reveal" x="400" y="215" text-anchor="middle" fill="#fff0c5" font-size="18" letter-spacing="4">FOR YOU</text>`,'0 0 800 450','class="heart-device-svg"')}${sceneControl('旋轉森林心願裝置','向左轉','向右轉',16)}`;
  const device=$('.heart-device-svg',scene);
  const fitDevice=()=>device.setAttribute('viewBox',window.innerWidth<=600?'200 0 400 450':'0 0 800 450');
  fitDevice();
  window.addEventListener('resize',fitDevice,{signal:activeController.signal});
  const target=G.heartPolygons(50);
  const renderView=(value,check=true)=>{
    const polys=G.heartPolygons(value),backs=G.heartPolygons(value,true);
    polys.forEach((poly,i)=>{
      const piece=$(`[data-heart-piece="${i}"]`,scene);
      $('.heart-side',piece).setAttribute('d',G.path(backs[i]));
      $('.heart-face',piece).setAttribute('d',G.path(poly));
      $('.heart-grain',piece).setAttribute('d',G.path(poly));
    });
    $('.turning-ring',scene).setAttribute('rx',String(145*Math.abs(Math.cos((value-50)*Math.PI/150))));
    const mapped=polys.map(poly=>poly.map(p=>({x:p.x,z:p.y}))),goal=target.map(poly=>poly.map(p=>({x:p.x,z:p.y})));
    if(check){
      geometryFeedback(G.rms(mapped,goal),1,()=>{$('input',scene).value='50';renderView(50,false);});
      if(!scene.classList.contains('aligned'))$('#level-feedback').textContent='看著虛線愛心，轉到三片木雕的邊緣剛好相接。';
    }
  };
  installPerspectiveControl($('input',scene),renderView);
}
function setupShadows() {
  scene.className='detailed-scene shadow-scene physical-shadows';
  const board=[{x:-145,y:0,z:38},{x:145,y:0,z:38},{x:145,y:0,z:248},{x:-145,y:0,z:248}];
  scene.innerHTML=ambience()+resonance()+`<div class="scene-story">夕陽照過懸掛的木雕，把秘密留在石台上。</div>${detailedSVG(`<g class="physical-sun"><circle r="23" fill="#ffe2a3" filter="url(#magicGlow)"/><circle r="45" fill="#ffd17c" opacity=".12"/></g><path d="${G.path(board,G.iso)}" fill="url(#stone3d)" stroke="#c4b282" stroke-width="3"/><path d="${G.path(G.outline,p=>G.iso({x:p.x-10,y:0,z:p.z+140}))}" fill="none" stroke="#ead297" stroke-opacity=".55" stroke-dasharray="3 6" stroke-width="1.2"/><g class="vector-shadows" fill="#171f20" fill-opacity=".67">${G.sources.map((_,i)=>`<path data-shadow="${i}"/>`).join('')}</g><g class="light-traces" stroke="#ffe4a3" stroke-width=".9" stroke-dasharray="3 5" opacity=".28"></g><g class="suspensions" stroke="#c8b081" stroke-width="1.2">${G.sources.map(poly=>{const p=G.iso(poly[0]);return `<path d="M${p.x} 0V${p.y}"/>`;}).join('')}</g><g class="wood-sources" filter="url(#propShadow)">${G.sources.map((poly,i)=>`<g data-source="${i}"><path d="${G.path(poly.map(p=>({...p,y:p.y-4})),G.iso)}" fill="#4c311c"/><path d="${G.path(poly,G.iso)}" fill="url(#wood3d)" stroke="#e4bd7b" stroke-width="1.3"/><path d="${G.path(poly,G.iso)}" fill="url(#grain3d)"/></g>`).join('')}</g><g class="height-tags" fill="#fff0c1" font-size="11" font-family="serif">${G.sources.map((poly,i)=>{const p=G.iso(poly[0]);return `<text x="${p.x-10}" y="${p.y-9}">${['Ⅰ','Ⅱ','Ⅲ','Ⅳ'][i]}</text>`;}).join('')}</g>`,'0 0 800 450','class="physical-svg"')}${sceneControl('移動夕陽，改變光線方向','夕陽向西','夕陽向東',83)}`;
  const renderLight=(value,check=true)=>{
    const shadows=G.shadowPolygons(value);
    shadows.forEach((poly,i)=>$(`[data-shadow="${i}"]`,scene).setAttribute('d',G.path(poly,G.iso)));
    $('.physical-sun',scene).setAttribute('transform',`translate(${90+value*6.2} 46)`);
    // 虛線直接連接木雕頂點與地面交點，清楚呈現光照因果。
    $('.light-traces',scene).innerHTML=G.sources.map((poly,i)=>{const p=G.iso(poly[0]),s=G.iso(shadows[i][0]);return `<path d="M${p.x} ${p.y}L${s.x} ${s.y}"/>`;}).join('');
    // 容錯成立後，只微調實際光向，再完整重算投影，絕不把影子硬移到目標。
    if(check)geometryFeedback(G.rms(shadows,G.targets),2,()=>{$('input',scene).value='36';renderLight(36,false);});
  };
  installPerspectiveControl($('input',scene),renderLight);
}
function setupStars() {
  scene.className='detailed-scene night-scene detailed-stars';
  const stars=[{x:29,y:65,name:'天秤座 Alpha',caption:'α'},{x:38,y:24,name:'天秤座 Beta',caption:'β'},{x:70,y:32,name:'天秤座 Gamma',caption:'γ'},{x:73,y:71,name:'天秤座 Sigma',caption:'σ'},{x:17,y:34,name:'遠方星星'},{x:87,y:18,name:'遠方星星'},{x:51,y:79,name:'遠方星星'}];
  let step=0;const order=[0,1,2,3,0];
  scene.innerHTML=ambience()+`<div class="star-journal">星光手記 <span>0 / 5</span></div><div class="shooting-star"></div><svg class="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none"><g class="good-lines" stroke="#f4d68d" stroke-width=".35" fill="none"></g><g class="bad-lines" stroke="#dcbb91" stroke-width=".3" fill="none"></g><path class="constellation-guide" d="M29 65L38 24L70 32L73 71Z" fill="none" stroke="#ded3a1" stroke-width=".12" stroke-dasharray=".5 2" opacity=".18"/></svg><div class="libra-mark">♎<span>LIBRA</span><small>願每一個心願，都被星空溫柔接住。</small></div>`;
  for(let i=0;i<100;i++){const dot=document.createElement('span');dot.className='star-decoration';dot.style.cssText=`left:${(i*37+7)%100}%;top:${(i*29+13)%96}%;width:${i%3+1}px;height:${i%3+1}px;animation-delay:${-i*.23}s`;scene.append(dot);}
  const buttons=stars.map((star,i)=>{const button=document.createElement('button');button.className='star-button';button.style.left=`${star.x}%`;button.style.top=`${star.y}%`;button.setAttribute('aria-label',star.name);button.innerHTML=`✦${star.caption?`<span class="star-name">${star.caption}</span>`:''}`;scene.append(button);button.addEventListener('click',()=>pick(i),{signal:activeController.signal});return button;});
  function line(a,b,error=false){const el=document.createElementNS('http://www.w3.org/2000/svg','line');for(const[k,v]of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))el.setAttribute(k,String(v));if(error){el.classList.add('error-line');setTimeout(()=>el.remove(),750);}$(error?'.bad-lines':'.good-lines',scene).append(el);}
  function hint(){buttons.forEach((button,i)=>{button.classList.toggle('next',i===order[step]);button.setAttribute('aria-label',`${stars[i].name}${i===order[step]?'，微微閃爍':''}`);});}
  function pick(i){if(gameState.rewarding)return;if(i!==order[step]){if(step)line(stars[order[step-1]],stars[i],true);$('#level-feedback').textContent='星空沒有催促你。沿著下一顆微亮的星，慢慢連。';return;}buttons[i].classList.add('chosen');if(step)line(stars[order[step-1]],stars[i]);step++;$('.star-journal span',scene).textContent=`${step} / 5`;if(step===order.length){buttons.forEach(button=>button.classList.remove('next'));award(3);}else{$('#level-feedback').textContent=step===4?'最後回到 α，讓天秤的心願完整。':['','第一顆星，收藏一份期待。','第二顆星，收藏一份勇氣。','第三顆星，收藏一份溫柔。'][step];hint();}}
  hint();
}
