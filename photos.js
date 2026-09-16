(function(){
  const grid=document.getElementById('photo-grid');
  const empty=document.getElementById('photo-empty');
  const count=document.getElementById('photo-count');
  const dialog=document.getElementById('photo-dialog');
  const dialogImage=dialog&&dialog.querySelector('img');
  const dialogTitle=dialog&&dialog.querySelector('.photo-dialog-title');
  const dialogMeta=dialog&&dialog.querySelector('.photo-dialog-meta');

  function openPhoto(photo){
    if(!dialog)return;
    dialogImage.src=photo.src;
    dialogImage.alt=photo.alt||photo.title;
    dialogTitle.textContent=photo.title;
    dialogMeta.textContent=[photo.location,photo.date].filter(Boolean).join(' · ');
    dialog.showModal();
  }

  fetch('photos.json?v='+Date.now(),{cache:'no-store'})
    .then(response=>{if(!response.ok)throw new Error('Gallery unavailable');return response.json();})
    .then(photos=>{
      count.textContent=photos.length?String(photos.length).padStart(2,'0')+' FRAME'+(photos.length===1?'':'S'):'NEW FRAMES SOON';
      if(!photos.length){empty.hidden=false;return;}
      const fragment=document.createDocumentFragment();
      photos.forEach((photo,index)=>{
        const button=document.createElement('button');
        button.className='photo-card';
        button.type='button';
        button.setAttribute('aria-label',(photo.title||'Photograph')+' — open large view');
        button.innerHTML='<span class="photo-number">'+String(index+1).padStart(2,'0')+'</span><img loading="lazy" decoding="async"><span class="photo-caption"><strong></strong><small></small></span>';
        const image=button.querySelector('img');
        image.src=photo.src;
        image.alt=photo.alt||photo.title||'';
        button.querySelector('strong').textContent=photo.title||'Untitled frame';
        const meta=[photo.location,photo.date].filter(Boolean).join(' · ');
        const metaNode=button.querySelector('small');
        metaNode.textContent=meta;
        if(!meta)metaNode.hidden=true;
        button.addEventListener('click',()=>openPhoto(photo));
        fragment.appendChild(button);
      });
      grid.appendChild(fragment);
    })
    .catch(()=>{empty.hidden=false;empty.querySelector('p').textContent='The gallery is taking a moment. Please try again soon.';});

  if(dialog){
    dialog.querySelector('.photo-dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  }
})();
