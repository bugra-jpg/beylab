import * as THREE from './assets/vendor/three.module.min.js';
const host=document.getElementById('field-canvas');
const opening=document.getElementById('opening');
const story=document.querySelector('.story');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(host){
try{
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);host.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(0,0,15);
  const group=new THREE.Group();scene.add(group);
  const mobile=innerWidth<760,count=mobile?2800:6400;
  const positions=new Float32Array(count*3),colors=new Float32Array(count*3),ring=new Float32Array(count*3),pair=new Float32Array(count*3),fused=new Float32Array(count*3),angles=new Float32Array(count);
  let seed=240905;function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
  // Keep the plasma toroidal as the reactor envelope fades; only the final atomic scene morphs.
  function torus(phi,t,r){
    const R=2.23,radial=r*Math.cos(t);
    return [(R+radial)*Math.cos(phi),r*Math.sin(t)*1.32,(R+radial)*Math.sin(phi)];
  }

  for(let i=0;i<count;i++){
    const phi=random()*Math.PI*2,t=random()*Math.PI*2,r=.06+Math.sqrt(random())*.27;
    ring.set(torus(phi,t,r),i*3);angles[i]=phi;
    const az=random()*Math.PI*2,v=random()*2-1,rad=Math.cbrt(random()),h=Math.sqrt(1-v*v),side=i<count/2?-1:1;
    const x=h*Math.cos(az),y=v,z=h*Math.sin(az);
    pair.set([side*1.5+x*rad*.66,side*.24+y*rad*.66,z*rad*.66],i*3);
    // A compact merged core and a few outward trajectories suggest the reaction.
    const core=i<count*.86,fr=core?rad*.88:1.25+random()*2.5;
    fused.set([x*fr,y*fr,z*fr],i*3);
  }
  positions.set(ring);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const sprite=document.createElement('canvas');sprite.width=sprite.height=32;
  const ctx=sprite.getContext('2d'),grad=ctx.createRadialGradient(16,16,0,16,16,16);
  grad.addColorStop(0,'rgba(255,255,255,1)');grad.addColorStop(.3,'rgba(255,255,255,.65)');grad.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,32,32);
  const tex=new THREE.CanvasTexture(sprite);
  const plasmaMaterial=new THREE.PointsMaterial({size:mobile?.048:.040,vertexColors:true,transparent:true,opacity:.90,map:tex,depthWrite:false,blending:THREE.AdditiveBlending});
  const points=new THREE.Points(geo,plasmaMaterial);points.name='plasma';group.add(points);
  const haloMaterial=new THREE.PointsMaterial({size:mobile?.11:.095,color:0xec73fa,transparent:true,opacity:.10,map:tex,depthWrite:false,blending:THREE.AdditiveBlending});
  const halo=new THREE.Points(geo,haloMaterial);group.add(halo);
  const shell=new THREE.Group();shell.name='confinement-envelope';group.add(shell);
  function makePath(samples,coordinates,material,parent){
    const a=new Float32Array((samples+1)*3);
    for(let i=0;i<=samples;i++){const [phi,t,r]=coordinates(i/samples);a.set(torus(phi,t,r),i*3);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(a.slice(),3));
    const line=new THREE.Line(geometry,new THREE.LineBasicMaterial(material));line.userData={baseOpacity:material.opacity};parent.add(line);return line;
  }
  for(let j=0;j<16;j++)makePath(480,f=>{const phi=f*Math.PI*6;return [phi,phi*2/3+j/16*Math.PI*2,.77];},{color:j%3===0?0xaec5ff:0x537af4,transparent:true,opacity:j%3===0?.21:.10,blending:THREE.AdditiveBlending,depthWrite:false},shell);
  for(let j=0;j<12;j++)makePath(64,f=>[j/12*Math.PI*2,f*Math.PI*2,.91],{color:0x809cff,transparent:true,opacity:.20,depthWrite:false},shell);
  const corePath=makePath(320,f=>[f*Math.PI*2,0,.025],{color:0xffb2f4,transparent:true,opacity:.32,blending:THREE.AdditiveBlending,depthWrite:false},group);
  const wavePts=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;wavePts.push(new THREE.Vector3(Math.cos(a)*1.3,Math.sin(a)*1.3,0));}
  const wave=new THREE.Line(new THREE.BufferGeometry().setFromPoints(wavePts),new THREE.LineBasicMaterial({color:0xffd4a6,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));wave.name='fusion-wave';group.add(wave);
  const dustPos=new Float32Array(160*3);for(let i=0;i<160;i++){dustPos[i*3]=(random()-.5)*25;dustPos[i*3+1]=(random()-.5)*15;dustPos[i*3+2]=-3-random()*4;}
  const dust=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(dustPos,3)),new THREE.PointsMaterial({color:0xa4bfff,size:.016,transparent:true,opacity:.22,map:tex,depthWrite:false}));scene.add(dust);
  const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  let running=true,frame=0,time=0,last=performance.now(),shellFade=0,flowPhase=0;
  function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}resize();
  const ro=new ResizeObserver(resize);ro.observe(host);
  const io=new IntersectionObserver(([e])=>{running=e.isIntersecting;},{rootMargin:'100px'});io.observe(opening);
  function animate(now){
    frame=requestAnimationFrame(animate);const dt=Math.min(.05,(now-last)/1000);last=now;if(!running||document.hidden)return;if(!reduce)time+=dt;
    const small=innerWidth<760,r=story.getBoundingClientRect(),p=reduce?0:clamp(-r.top/Math.max(1,r.height-innerHeight));
    const targetFade=smooth((p-.15)/.22),heat=smooth((p-.22)/.27),atomic=smooth((p-.70)/.11),merge=smooth((p-.86)/.13),settle=reduce?1:1-Math.exp(-dt*10);
    shellFade+=(targetFade-shellFade)*settle;
    if(!reduce)flowPhase+=dt*(1.6+heat*5.4);
    for(let i=0;i<count;i++){
      const k=i*3;
      const flow=.76+.24*Math.sin(angles[i]*3-flowPhase);
      for(let axis=0;axis<3;axis++){
        const j=k+axis,confined=ring[j],reaction=pair[j]*(1-merge)+fused[j]*merge;
        positions[j]+=((confined*(1-atomic)+reaction*atomic)-positions[j])*settle;
      }
      // Travelling brightness gives the plasma motion without adding mechanical detail.
      const pale=.30+heat*.45;
      const plasmaR=.88+heat*.12,plasmaG=pale,plasmaB=1-heat*.10;
      const second=i>=count/2,atomR=second?1:.40,atomG=second?.58:.75,atomB=second?.32:1;
      colors[k]=plasmaR*flow*(1-atomic)+(atomR*(1-merge)+merge)*atomic;
      colors[k+1]=plasmaG*flow*(1-atomic)+(atomG*(1-merge)+.84*merge)*atomic;
      colors[k+2]=plasmaB*flow*(1-atomic)+(atomB*(1-merge)+.58*merge)*atomic;
    }
    geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;
    plasmaMaterial.size=(small?.048:.040)*(1+heat*.36*(1-atomic));haloMaterial.opacity=(.10+heat*.19)*(1-atomic*.6);
    haloMaterial.color.setHex(heat>.5?0xffb2bd:0xec73fa);
    shell.visible=atomic<.999&&shellFade<.999;corePath.visible=atomic<.999;
    for(const line of shell.children)line.material.opacity=line.userData.baseOpacity*(1-atomic)*(1-shellFade);
    corePath.material.opacity=corePath.userData.baseOpacity*(1-atomic)*(1+heat*.7);
    wave.visible=merge>.001;wave.material.opacity=atomic*merge*.23;wave.scale.setScalar(1+merge*1.4);
    const viewportHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z,viewportWidth=viewportHeight*camera.aspect;
    const entering=reduce?0:smooth(1-r.top/innerHeight);
    const size=small?Math.min(.68,viewportWidth*.43/3.2):Math.min(1.08,viewportWidth*.235/3.2);
    group.position.set(small?entering*.45:viewportWidth*.24,small?-1.30-entering*.55:.40,0);
    group.scale.setScalar(size*(1-atomic*.10));
    group.rotation.set(.52*(1-atomic),(.30+time*.04)*(1-atomic),-.24*(1-atomic));dust.rotation.z=time*.004;
    renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(animate);document.documentElement.classList.add('webgl-ready');
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);document.documentElement.classList.add('no-webgl');});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);ro.disconnect();io.disconnect();const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());tex.dispose();renderer.dispose();},{once:true});
}catch(e){document.documentElement.classList.add('no-webgl');console.warn('The decorative field view could not be started. Page content remains available.');}
}
