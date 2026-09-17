// Keep the scene covered until initialization and the first render finish.
requestAnimationFrame(()=>requestAnimationFrame(()=>{
  import('./main.js').catch(()=>{
    document.getElementById('loading').hidden=true;
    document.getElementById('error').hidden=false;
  });
}));
