/* 原創五聲音階森林配樂：即時合成，不下載音檔、不使用第三方曲目。 */
'use strict';
(() => {
  const button=document.querySelector('#music-toggle');
  let context,master,timer,nextTime,beat=0,enabled=true,videoPlaying=false;
  const melody=[76,null,79,81,79,76,74,null,72,null,74,76,79,null,76,null,
    74,null,76,79,76,74,72,null,69,null,72,74,76,null,74,null,
    76,null,79,84,81,79,76,null,74,null,76,79,81,null,79,null,
    76,null,74,72,74,76,79,null,76,null,74,72,69,null,72,null];
  const chords=[[48,55,60],[45,52,57],[53,60,65],[55,62,67]];
  function note(midi,start,length,volume){
    const voice=context.createGain();
    voice.gain.setValueAtTime(0,start);
    voice.gain.linearRampToValueAtTime(volume,start+.025);
    voice.gain.exponentialRampToValueAtTime(.0001,start+length);
    voice.connect(master);
    const frequency=440*2**((midi-69)/12);
    [1,2,3].forEach((harmonic,i)=>{
      const oscillator=context.createOscillator(),gain=context.createGain();
      oscillator.type='sine';oscillator.frequency.value=frequency*harmonic;
      gain.gain.value=[1,.15,.035][i];oscillator.connect(gain);gain.connect(voice);
      oscillator.start(start);oscillator.stop(start+length+.05);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();if(i===2)voice.disconnect();};
    });
  }
  function schedule(){
    if(context.state!=='running')return;
    if(nextTime<context.currentTime)nextTime=context.currentTime+.04;
    while(nextTime<context.currentTime+.8){
      const index=beat%melody.length;
      if(melody[index]!==null)note(melody[index],nextTime,2.1,.16);
      if(index%8===0)chords[Math.floor(index/8)%4].forEach(n=>note(n,nextTime,5.3,.032));
      nextTime+=.65;beat++;
    }
  }
  function update(){
    button.setAttribute('aria-pressed',String(enabled));
    button.textContent=enabled?'♪ 音樂開':'♪ 音樂關';
    document.body.dataset.music=videoPlaying?'video':enabled&&context?.state==='running'?'playing':'off';
    if(master){
      const now=context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value,now);
      master.gain.linearRampToValueAtTime(enabled && !videoPlaying ? .22 : 0,now+(videoPlaying ? .12 : .7));
    }
  }
  async function start(){
    const AudioEngine=window.AudioContext||window.webkitAudioContext;
    if(!AudioEngine)return;
    try{
      if(!context){context=new AudioEngine();master=context.createGain();master.gain.value=0;master.connect(context.destination);nextTime=context.currentTime+.04;timer=setInterval(schedule,400);}
      await context.resume();schedule();update();
    }catch{document.body.dataset.music='off';}
  }
  button.addEventListener('click',()=>{enabled=!enabled;if(enabled)start();update();});
  document.addEventListener('pointerdown',event=>{
    if(enabled&&!context&&!event.target.closest('#music-toggle,#door'))start();
  });
  document.addEventListener('keydown',event=>{
    if(enabled&&!context&&['Enter',' '].includes(event.key)&&!event.target.closest('#music-toggle,#door'))start();
  });
  window.forestMusic={
    beforeVideo(){videoPlaying=true;if(enabled)start();update();},
    afterVideo(){videoPlaying=false;update();},
  };
  window.addEventListener('pagehide',()=>{clearInterval(timer);context?.close();});
  update();
})();
