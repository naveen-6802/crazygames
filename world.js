import * as T from './three.module.js';
import {createPremiumScenery} from './premium-maps.js';
import {mergeGeometries} from './geometry-utils.js';
function batch(group){for(const child of [...group.children])if(child.isGroup)batch(child);const sets=new Map();for(const m of [...group.children])if(m.isMesh&&!m.children.length){m.updateMatrix();const list=sets.get(m.material)||[];list.push(m);sets.set(m.material,list)}for(const [material,meshes] of sets){if(meshes.length<2)continue;const parts=meshes.map(m=>m.geometry.clone().applyMatrix4(m.matrix));const geometry=mergeGeometries(parts);parts.forEach(p=>p.dispose());if(!geometry)continue;meshes.forEach(m=>group.remove(m));const combined=new T.Mesh(geometry,material);combined.castShadow=true;combined.receiveShadow=true;group.add(combined)}}
const mat=(color,metalness=0,roughness=.8)=>new T.MeshStandardMaterial({color,metalness,roughness});
const boxGeo=new T.BoxGeometry(1,1,1),nightFog=new T.Color('#152331');
export function box(parent,x,y,z,w,h,d,material){const m=new T.Mesh(boxGeo,material);m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
export const curve=s=>Math.sin(s/430)*12+Math.sin(s/970)*20;
export const LANES=[-5.25,-1.75,1.75,5.25];
export function makeCar(color='#edb03a',type=0){
 const g=new T.Group(),body=new T.Group();g.add(body);g.userData.body=body;
 const paint=mat(color,.65,.28),black=mat('#11171b',.22,.5),glass=mat('#233f4b',.6,.16),trim=mat('#6b777c',.8,.22),rubber=mat('#101317',0,.9),tail=new T.MeshStandardMaterial({color:'#b82316',emissive:'#ff3015',emissiveIntensity:.8}),light=new T.MeshStandardMaterial({color:'#ffeed1',emissive:'#ffe6b0',emissiveIntensity:2});
 const length=[4.1,4.5,4.8,4.6,4.8,6.9][type]||4.2,wide=type===2?2.02:1.85,high=type===2?1.55:type===5?2.35:1.12;
 box(body,0,.48,0,wide,.38,length,black);box(body,0,.72,0,wide,.44,length-.18,paint);
 box(body,0,.94,-length*.3,wide*.94,.13,length*.28,paint);box(body,0,.9,length*.38,wide,.12,length*.16,paint);
 if(type===5){box(body,0,1.6,.3,2.1,1.65,4.8,paint);box(body,0,1.3,-2.55,1.95,1.3,1.4,paint);box(body,0,1.6,-3.27,1.75,.6,.04,glass)}else{
 box(body,0,high+.03,.08,wide*.76,.14,length*.29,paint);
 const windshield=box(body,0,(high+.93)/2,-length*.16,wide*.77,high-.78,.06,glass);windshield.rotation.x=.48;
 const rear=box(body,0,(high+.93)/2,length*.22,wide*.78,high-.8,.06,glass);rear.rotation.x=-.42;
 for(const side of [-1,1]){box(body,side*wide*.405,(high+.88)/2,.07,.05,high-.84,length*.31,glass);box(body,side*wide*.42,(high+.88)/2,.1,.05,high-.82,.055,black);box(body,side*1.0,1,-.52,.22,.12,.3,paint)}
 }
 box(body,0,.55,-length/2-.01,wide*.65,.18,.04,black);box(body,0,.47,length/2+.02,wide*.7,.08,.05,trim);
 for(const side of [-1,1]){box(body,side*.67,.81,-length/2+.05,.41,.08,.04,light);box(body,side*.64,.82,length/2-.06,.51,.07,.04,tail);box(body,side*.57,.4,length/2+.04,.16,.09,.12,trim)}
 if(type===1||type>=3){box(body,0,1.01,length*.36,wide*.87,.065,.23,black);for(const side of [-1,1])box(body,side*.6,.96,length*.36,.06,.16,.07,black)}
 const wheels=[];for(const x of [-wide*.51,wide*.51])for(const z of [-length*.3,length*.3]){let pivot=new T.Group();pivot.position.set(x,.43,z);g.add(pivot);const wheel=new T.Mesh(new T.CylinderGeometry(.39,.39,.25,16),rubber);wheel.rotation.z=Math.PI/2;pivot.add(wheel);const hub=new T.Mesh(new T.CylinderGeometry(.25,.25,.265,8),trim);hub.rotation.z=Math.PI/2;pivot.add(hub);wheels.push({pivot,wheel,hub,front:z<0})}
 const flames=[];const flameMaterial=new T.MeshBasicMaterial({color:'#7effcd',transparent:true,opacity:.85,depthWrite:false});for(const x of [-.57,.57]){const flame=new T.Mesh(new T.ConeGeometry(.14,1.6,8),flameMaterial);flame.rotation.x=Math.PI/2;flame.position.set(x,.4,length/2+.75);flame.visible=false;g.add(flame);flames.push(flame)}
 const beams=[];for(const x of [-.65,.65]){let spot=new T.SpotLight('#fff0ce',0,65,.32,.5,1.3);spot.position.set(x,.9,-1.8);spot.target.position.set(x,.1,-40);g.add(spot,spot.target);beams.push(spot)}
 batch(body);g.userData={body,paint,glass,tail,light,wheels,length,width:wide,beams,flames};return g;
}
export class World{
 constructor(canvas){
 this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;
 this.scene=new T.Scene();this.scene.fog=new T.FogExp2('#b9a49a',.0028);this.camera=new T.PerspectiveCamera(55,innerWidth/innerHeight,.1,1700);this.scene.add(new T.HemisphereLight('#b7d3e0','#5e5545',2));this.sun=new T.DirectionalLight('#ffd4a0',3.2);this.sun.position.set(-75,65,-130);this.sun.castShadow=true;this.sun.shadow.mapSize.set(1024,1024);Object.assign(this.sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:220});this.sun.shadow.bias=-.0003;this.scene.add(this.sun,this.sun.target);
 const sky=new T.Mesh(new T.SphereGeometry(1500,32,20),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{night:{value:0},alpine:{value:0}},vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v;uniform float night;uniform float alpine;void main(){vec3 n=normalize(v);float h=max(n.y,0.);vec3 c=mix(vec3(.94,.66,.43),vec3(.29,.47,.61),pow(h,.5));c=mix(c,mix(vec3(.76,.86,.93),vec3(.13,.39,.65),pow(h,.5)),alpine);float s=pow(max(dot(n,normalize(vec3(-.5,.14,-1.))),0.),380.);c+=vec3(1.,.7,.32)*s*1.6;gl_FragColor=vec4(mix(c,vec3(.025,.047,.085)+vec3(.02,.025,.04)*h,night),1.);}'}));this.scene.add(sky);this.sky=sky;
 this.groundMat=mat('#74735b');const ground=box(this.scene,0,-.35,-500,3500,.3,2800,this.groundMat);ground.receiveShadow=true;ground.castShadow=false;
 const water=box(this.scene,-210,-.17,-500,315,.1,2600,mat('#607e85',.65,.22));water.castShadow=false;this.water=water;
 this.roadMat=mat('#363b3d',.08,.85);this.edgeMat=mat('#8e8b7c');const line=mat('#e3dbba'),rail=mat('#8b9698',.7,.45),trunk=mat('#535749'),leaf=mat('#405a4a'),rock=mat('#7d8079');this.chunks=[];const forestLeaves=[mat('#386e37'),mat('#568742'),mat('#72994d')],forestBark=mat('#51432e'),cityStone=mat('#71828d',.25,.65),cityGlass=mat('#355667',.5,.3),cityTrim=mat('#bbc2ba',.3,.5),cityWindows=new T.MeshStandardMaterial({color:'#d7c498',emissive:'#edc278',emissiveIntensity:.4});
 for(let i=0;i<38;i++){let g=new T.Group();g.userData.s=i*30;this.scene.add(g);box(g,0,-.05,0,16,.15,30.2,this.roadMat);box(g,-8.3,0,0,.6,.1,30.2,this.edgeMat);box(g,8.3,0,0,.6,.1,30.2,this.edgeMat);
 for(let x of [-7.3,7.3])box(g,x,.04,0,.12,.02,30.2,line);
 for(let x of [-3.5,0,3.5])for(let z of [-10,0,10])box(g,x,.045,z,.105,.025,4,line);
 for(const side of [-1,1]){box(g,side*8.8,.7,0,.13,.19,30.2,rail);for(const z of [-12,0,12]){box(g,side*8.8,.38,z,.1,.75,.1,rail);box(g,side*7.7,.05,z,.12,.04,.2,line)}
 if(i%2===0){box(g,side*9.5,4.9,0,.12,9.8,.12,rail);box(g,side*8.4,9.6,0,2.2,.08,.13,rail);box(g,side*7.4,9.55,0,.75,.07,.3,new T.MeshStandardMaterial({color:'#ffe4b3',emissive:'#ffdf94',emissiveIntensity:1}))}}
 const scenery=new T.Group();g.add(scenery);for(let j=0;j<3;j++){let tree=new T.Group();tree.position.set(17+(i*17+j*13)%70,0,j*10-10);box(tree,0,2.8,0,.5,5.6,.5,trunk);for(let k=0;k<3;k++){let cone=new T.Mesh(new T.ConeGeometry(2.3-k*.5,4.7,7),leaf);cone.position.y=4+k*1.8;tree.add(cone)}scenery.add(tree)}
 if(i%4===0){let mountain=new T.Mesh(new T.ConeGeometry(55+(i%3)*20,60+(i%5)*12,5),rock);mountain.position.set(145,20,0);mountain.rotation.y=i;scenery.add(mountain)}

 // Pooled scenery for each selectable map; only the selected group is rendered.
 const forest=new T.Group();g.add(forest);g.userData.forest=forest;
 for(const side of [-1,1])for(let j=0;j<12;j++){
  const x=side*(12+(j%4)*9+(i*7+j*3)%5),z=-13+Math.floor(j/4)*12+(i+j)%4;
  const height=6+(i*3+j*7)%7,radius=2.3+(j%3)*.7;
  box(forest,x,height*.3,z,.5,height*.6,.5,forestBark);
  for(let k=0;k<3;k++){const crown=new T.Mesh(new T.ConeGeometry(radius-k*.4,height*.55,7),forestLeaves[(i+j+k)%3]);crown.position.set(x,height*.46+k*height*.19,z);crown.castShadow=true;forest.add(crown)}
 }
 const city=new T.Group();g.add(city);g.userData.city=city;
 for(const side of [-1,1]){
  box(city,side*12,.08,0,5,.25,30.2,cityTrim);
  for(let j=0;j<2;j++){
   const x=side*(21+j*23),z=(j===0?-4:7),height=12+(i*13+j*19)%55,w=10+(i+j)%5,d=13;
   box(city,x,height/2,z,w,height,d,(i+j)%2?cityGlass:cityStone);
   box(city,x,height+.3,z,w+.6,.6,d+.6,cityTrim);
   if((i+j)%3===0)box(city,x,height+2,z,w*.4,4,d*.5,cityStone);
   for(let y=3;y<height-1;y+=3.5)for(let col=-1;col<=1;col++){
    box(city,x+col*w*.25,y,z+d/2+.03,w*.14,1.35,.06,cityWindows);
    box(city,x-side*(w/2+.03),y,z+col*d*.26,.06,1.35,d*.16,cityWindows);
   }
  }
 }
 forest.visible=false;city.visible=false;
 const tunnel=new T.Group();g.add(tunnel);box(tunnel,-9,4.5,0,1.2,9,30.2,rock);box(tunnel,9,4.5,0,1.2,9,30.2,rock);box(tunnel,0,9.3,0,19,1,30.2,rock);for(let z of [-10,0,10])box(tunnel,0,8.7,z,1.8,.06,.3,line);tunnel.visible=false;g.userData.tunnel=tunnel;g.userData.scenery=scenery;
 if(i%10===4){box(g,0,7.8,0,19,.15,.15,rail);box(g,-9,3.9,0,.2,7.8,.2,rail);box(g,9,3.9,0,.2,7.8,.2,rail);const cv=document.createElement('canvas');cv.width=512;cv.height=128;const c=cv.getContext('2d');c.fillStyle='#254b46';c.fillRect(0,0,512,128);c.strokeStyle='#d9e2d3';c.lineWidth=5;c.strokeRect(6,6,500,116);c.fillStyle='#f3f1db';c.textAlign='center';c.font='bold 37px Arial';c.fillText(i%20===4?'OUT OFFICE':'THE OPEN ROAD',256,55);c.font='28px Arial';c.fillText('↑       KEEP DRIVING       ↑',256,99);const sign=new T.Mesh(new T.PlaneGeometry(7.6,1.9),new T.MeshBasicMaterial({map:new T.CanvasTexture(cv)}));sign.position.set(0,7.1,.12);g.add(sign)}
 batch(g);this.chunks.push(g)}
 this.particles=[];for(let i=0;i<24;i++){let p=new T.Mesh(new T.SphereGeometry(.07,4,3),new T.MeshBasicMaterial({color:'#ffbe50'}));p.visible=false;p.userData.life=0;this.scene.add(p);this.particles.push(p)}
 this.player=makeCar();this.scene.add(this.player);this.night=0;this.resize();window.addEventListener('resize',()=>this.resize());
 }
 resize(){this.renderer.setSize(innerWidth,innerHeight);this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix()}
 quality(q){const n={Low:.85,Medium:1,High:1.5,Ultra:2}[q]||1.5;this.renderer.setPixelRatio(Math.min(devicePixelRatio,n));this.renderer.shadowMap.enabled=q!=='Low';this.resize()}
 setCar(type,color){if(this.playerType===type){this.player.userData.paint.color.set(color);return}this.playerType=type;this.scene.remove(this.player);const old=this.player;old.traverse(o=>{if(o.isMesh){if(o.geometry!==boxGeo)o.geometry.dispose();}});const materials=new Set();old.traverse(o=>{if(o.material)materials.add(o.material)});materials.forEach(m=>m.dispose());this.player=makeCar(color,type);this.scene.add(this.player)}
 burst(x,z){for(let p of this.particles){p.position.set(x,.6,z);p.visible=true;p.userData={life:.35+Math.random()*.5,vx:(Math.random()-.5)*8,vy:Math.random()*5,vz:(Math.random()-.5)*8}}}
 update(distance,dt,map='coast',weather='Sunset'){
 let target=weather==='Night'?1:weather==='Cycle'?(Math.sin(distance/2200-1)+1)*.4:0;if(map==='harbour')target=Math.max(.78,target);this.night+=(target-this.night)*dt*1.4;this.sky.material.uniforms.alpine.value=map==='alpine'?1:0;this.sun.color.set(map==='alpine'?'#e5f3ff':map==='harbour'?'#afc7fa':'#ffd4a0');this.sky.material.uniforms.night.value=this.night;this.sun.intensity=3.2*(1-this.night)+.15;this.scene.fog.color.set(map==='alpine'?'#bdcedd':'#b9a49a').lerp(nightFog,this.night);this.scene.fog.density=weather==='Fog'?.006:weather==='Rain'?.004:.0028;
 this.roadMat.roughness=map==='harbour'?.3:weather==='Rain'?.24:.85;this.roadMat.color.set(map==='harbour'?'#202e3c':'#363b3d');this.groundMat.color.set(map==='forest'?'#548244':map==='city'?'#677078':map==='alpine'?'#d2e1e9':map==='harbour'?'#1b2e3b':'#74735b');this.water.visible=map==='coast'||map==='harbour';this.water.position.x=map==='harbour'?-130:-210;this.water.scale.x=map==='harbour'?180:315;this.water.material.color.set(map==='harbour'?'#153b52':'#607e85');
 for(let g of this.chunks){if((map==='alpine'||map==='harbour')&&!g.userData[map]){const scenery=createPremiumScenery(map,this.chunks.indexOf(g));batch(scenery);g.userData[map]=scenery;g.add(scenery)}for(const id of ['alpine','harbour'])if(g.userData[id])g.userData[id].visible=map===id;while(g.userData.s<distance-70)g.userData.s+=38*30;while(g.userData.s>distance+1100)g.userData.s-=38*30;const s=g.userData.s;g.position.set(curve(s)-curve(distance),0,distance-s);g.rotation.y=-Math.atan((curve(s+1)-curve(s-1))/2);g.userData.tunnel.visible=map==='coast'&&(Math.floor(s/30)%120+120)%120>=78&&(Math.floor(s/30)%120+120)%120<87;g.userData.scenery.visible=map==='coast'&&!g.userData.tunnel.visible;g.userData.forest.visible=map==='forest';g.userData.city.visible=map==='city'}
 for(const p of this.particles){if(p.userData.life>0){p.userData.life-=dt;p.position.x+=p.userData.vx*dt;p.position.y+=p.userData.vy*dt;p.position.z+=p.userData.vz*dt;p.userData.vy-=10*dt;p.visible=p.userData.life>0}}
 }
 render(){this.renderer.render(this.scene,this.camera)}
}
export {T};
