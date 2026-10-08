(() => {
 const dialog=document.getElementById('ai-image-dialog');
 const content=document.getElementById('ai-image-content');
 const title=document.getElementById('ai-image-title');
 let trigger=null;
 document.querySelectorAll('[data-ai-panel]').forEach(button=>button.addEventListener('click',()=>{
  trigger=button;
  const panel=button.querySelector('.ai-art-viewport').cloneNode(true);
  panel.querySelector('img').loading='eager';
  content.replaceChildren(panel);
  title.textContent=button.dataset.aiTitle;
  dialog.showModal();
  dialog.scrollTop=0;
 }));
 document.getElementById('ai-image-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>trigger?.focus());
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
})();
