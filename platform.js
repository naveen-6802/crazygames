// Basic Launch: no SDK download, account request, cloud migration, or ad calls.
// A future v3 adapter can implement this interface after SDK.init() completes.
export class FixedStepper {
  constructor(step=1/60){this.step=step;this.accumulator=0}
  reset(){this.accumulator=0}
  advance(seconds,update){
    this.accumulator+=Math.min(.1,Math.max(0,seconds));
    while(this.accumulator+1e-10>=this.step){
      this.accumulator=Math.max(0,this.accumulator-this.step);
      update(this.step);
    }
  }
}

// Preserve the original key and complete JSON schema. A future cloud adapter must
// initialize and reconcile saves BEFORE constructing SaveManager; never replace a
// populated local save with an empty cloud record. Browser storage is origin-bound.
export const storage={
  backend:null,
  memory:new Map(),
  getItem(key){
    try { const value=this.backend?this.backend.getItem(key):localStorage.getItem(key);
      if(value!==null&&value!==undefined){this.memory.set(key,value);return value}
    } catch {}
    return this.memory.get(key)??null;
  },
  setItem(key,value){
    this.memory.set(key,value);
    try {localStorage.setItem(key,value)}catch{}
    try {Promise.resolve(this.backend?.setItem(key,value)).catch(()=>{})}catch{}
  },
  useBackend(backend){this.backend=backend}
};

export class PlatformBridge {
  constructor(){this.adapter=null;this.playing=false;this.loading=true;this.muted=false;this.adPending=false;this.getState=()=> 'menu';this.onMute=()=>{}}
  call(name,...args){try{return Promise.resolve(this.adapter?.[name]?.(...args)).catch(()=>null)}catch{return Promise.resolve(null)}}
  async install(adapter){
    // Explicit opt-in only. The shipping Basic build never calls install().
    try{await adapter.init()}catch{return false}
    this.adapter=adapter;
    await this.call('subscribeMute',value=>this.setMuted(value));
    await this.call(this.loading?'loadingStart':'loadingStop');
    if(this.playing)await this.call('gameplayStart');
    return true;
  }
  setGameplay(active){if(this.playing===active)return;this.playing=active;void this.call(active?'gameplayStart':'gameplayStop')}
  setLoading(active){if(this.loading===active)return;this.loading=active;void this.call(active?'loadingStart':'loadingStop')}
  setMuted(value){this.muted=!!value;this.onMute(this.muted||this.adPending)}
  getUser(){return this.call('getUser')}
  // Only wire these to new, explicit game-over UI actions during Full Launch.
  // Return true ONLY after the adapter confirms a completed reward, never on error.
  requestRevive(event){return this.requestAd('rewarded','revive',event)}
  requestBonusCoins(event){return this.requestAd('rewarded','bonus-coins',event)}
  requestMidgame(){return this.requestAd('midgame','run-ended')}
  async requestAd(type,placement,event){
    if(!this.adapter?.requestAd||this.adPending||this.getState()!=='over')return false;
    if(type==='rewarded'&&!event?.isTrusted)return false;
    this.adPending=true;this.setGameplay(false);this.onMute(true);
    try {return (await this.adapter.requestAd(type,placement))===true}
    catch{return false}
    finally {this.adPending=false;this.onMute(this.muted)}
  }
}
export const platform=new PlatformBridge();
