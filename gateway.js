(() => {
  const root = document.getElementById('gateway-explorer');
  const find = id => document.getElementById(id);
  const canvas = find('flow-canvas');
  const run = find('flow-run');
  const reset = find('flow-reset');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const icons = {OpenAI:'ChatGPT',Anthropic:'Claude',Google:'Gemini',DeepSeek:'Deepseek',Alibaba:'Qwen',xAI:'Grok'};
  let provider = 'OpenAI', timers = [], generation = 0;
  function stop(){ generation++; timers.forEach(clearTimeout); timers=[]; run.disabled=false; root.setAttribute('aria-busy','false'); }
  function ready(){
    stop(); canvas.dataset.stage='idle';
    find('flow-step').textContent='SIAP DIJELAJAHI';
    find('flow-description').textContent=`Aplikasi Anda terhubung ke ${provider} melalui TokenKu.`;
    find('flow-run-label').textContent='Jalankan ilustrasi';
    find('flow-counter').textContent='01 — 04'; reset.hidden=true;
  }
  root.querySelectorAll('[data-explore]').forEach(button=>button.addEventListener('click',()=>{
    provider=button.dataset.explore;
    root.querySelectorAll('[data-explore]').forEach(b=>{const selected=b===button;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
    find('flow-provider-name').textContent=provider;
    const hasIcon=Boolean(icons[provider]);
    find('flow-provider-logo').hidden=!hasIcon;
    find('flow-provider-initial').hidden=hasIcon;
    find('flow-provider-initial').textContent=provider==='Midjourney'?'MJ':provider==='Kling'?'KL':'SU';
    if(hasIcon)find('flow-provider-logo').src=`assets/Logo-Card_${icons[provider]}.svg`;
    ready();
  }));
  const stages = () => [
    ['request','01 / PERMINTAAN DARI APLIKASI','Aplikasi mengirim instruksi dan pilihan model ke gateway TokenKu.'],
    ['gateway','02 / MELALUI TOKENKU',`TokenKu meneruskan permintaan ke model ${provider} yang dipilih.`],
    ['provider','03 / DIPROSES PROVIDER',`${provider} memproses masukan sesuai model dan parameter yang dipilih.`],
    ['response','04 / JAWABAN KEMBALI','Hasil dikembalikan ke aplikasi melalui TokenKu. Pemakaian mengikuti tarif model.']
  ];
  function display(index){const stage=stages()[index];canvas.dataset.stage=stage[0];find('flow-step').textContent=stage[1];find('flow-description').textContent=stage[2];find('flow-counter').textContent=`0${index+1} / 04`;}
  run.addEventListener('click',()=>{
    stop();const cycle=generation;reset.hidden=false;
    if(reducedMotion.matches){display(3);find('flow-run-label').textContent='Ulangi ilustrasi';return;}
    run.disabled=true;find('flow-run-label').textContent='Menelusuri alur…';display(0);
    for(let i=1;i<4;i++)timers.push(setTimeout(()=>{if(generation===cycle)display(i);},i*1050));
    timers.push(setTimeout(()=>{if(generation!==cycle)return;run.disabled=false;find('flow-run-label').textContent='Ulangi ilustrasi';},4300));
  });
  reset.addEventListener('click',ready);
  reducedMotion.addEventListener?.('change',ready);
  document.addEventListener('visibilitychange',()=>{if(document.hidden && run.disabled)ready();});
})();
