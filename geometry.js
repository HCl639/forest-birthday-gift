/* 純幾何運算，可用 node tools/check-geometry.js 驗證。
 * X/Z 為地面座標，Y 為高度。日光視為平行光，射線與 Y=0 求交。
 * 投影公式：shadow = (x - y*light.x, 0, z - y*light.z)。
 * 同一個物件輪廓用於木雕本體和它的影子，不使用無關影子動畫。
 */
'use strict';
(() => {
  const outline=[];
  const point=(x,z)=>outline.push({x,z});
  const curve=(p0,p1,p2,p3)=>{for(let i=1;i<=16;i++){const t=i/16,s=1-t;point(s*s*s*p0[0]+3*s*s*t*p1[0]+3*s*t*t*p2[0]+t*t*t*p3[0],s*s*s*p0[1]+3*s*s*t*p1[1]+3*s*t*t*p2[1]+t*t*t*p3[1]);}};
  point(-60,-45);point(-15,-45);curve([-15,-45],[-30,-75],[30,-75],[15,-45]);point(60,-45);point(60,-12);curve([60,-12],[91,-28],[91,28],[60,12]);point(60,45);point(15,45);curve([15,45],[30,18],[-30,18],[-15,45]);point(-60,45);point(-60,12);curve([-60,12],[-33,28],[-33,-28],[-60,-12]);
  function clip(poly,axis,sign){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],ai=a[axis]*sign>=0,bi=b[axis]*sign>=0;if(ai)out.push({...a});if(ai!==bi){const t=-a[axis]/(b[axis]-a[axis]);out.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});}}return out;}
  const fragments=[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sz])=>clip(clip(outline,'x',sx),'z',sz));
  const lightAt=value=>({x:(value-50)/65,z:-.75});
  const targetLight=lightAt(36);
  const origin={x:-10,z:140};
  const heights=[54,85,116,147];
  const targets=fragments.map(poly=>poly.map(p=>({x:p.x+origin.x,y:0,z:p.z+origin.z})));
  // 反向設計固定木雕位置，使目標光向下投影後，輪廓確實能相接。
  const sources=targets.map((poly,i)=>poly.map(p=>({x:p.x+heights[i]*targetLight.x,y:heights[i],z:p.z+heights[i]*targetLight.z})));
  const shadow=(p,light)=>({x:p.x-p.y*light.x,y:0,z:p.z-p.y*light.z});
  const iso=p=>({x:400+p.x*.95+p.z*.45,y:210+p.z*.60-p.y*.95});
  function rms(a,b){let sum=0,n=0;a.forEach((poly,i)=>poly.forEach((p,j)=>{sum+=(p.x-b[i][j].x)**2+(p.z-b[i][j].z)**2;n++;}));return Math.sqrt(sum/n);}
  const shadowPolygons=value=>sources.map(poly=>poly.map(p=>shadow(p,lightAt(value))));
  const depths=[140,280,440,620],focal=600,targetCamera=60;
  const cameraPolygons=value=>fragments.map((poly,i)=>{const scale=focal/(focal+depths[i]);const camera=(value-50)*5;return poly.map(p=>({x:400+(targetCamera+p.x/scale-camera)*scale,y:210+p.z}));});
  const path=(poly,project=p=>p)=>poly.map((p,i)=>{const v=project(p);return `${i?'L':'M'}${v.x.toFixed(2)},${v.y.toFixed(2)}`;}).join(' ')+' Z';
  // 三塊有真實深度的天秤符號木雕，轉動同一座裝置後做透視投影。
  const libra=[];
  libra.push({x:-110,z:12},{x:-110,z:-6},{x:-70,z:-6});
  for(let i=0;i<=60;i++){const t=Math.PI-i/60*Math.PI;libra.push({x:70*Math.cos(t),z:-6-70*Math.sin(t)});}
  libra.push({x:110,z:-6},{x:110,z:12},{x:48,z:12},{x:48,z:-6});
  for(let i=0;i<=60;i++){const t=i/60*Math.PI;libra.push({x:48*Math.cos(t),z:-6-48*Math.sin(t)});}
  libra.push({x:-48,z:12});
  const libraSlices=[clip(libra.map(p=>({x:p.x+38,z:p.z})),'x',-1).map(p=>({x:p.x-38,z:p.z})),
    clip(clip(libra.map(p=>({x:p.x+38,z:p.z})),'x',1).map(p=>({x:p.x-76,z:p.z})),'x',-1).map(p=>({x:p.x+38,z:p.z})),
    clip(libra.map(p=>({x:p.x-38,z:p.z})),'x',1).map(p=>({x:p.x+38,z:p.z}))];
  const libraDepths=[-95,0,95],libraFocal=650;
  const libraBar=[{x:-110,z:40},{x:110,z:40},{x:110,z:58},{x:-110,z:58}];
  function libraPolygons(value,back=false,bar=false){
    const angle=(value-50)*Math.PI/150,c=Math.cos(angle),s=Math.sin(angle);
    return (bar?[libraBar]:libraSlices).map((poly,i)=>poly.map(p=>{
      const depth=bar?0:libraDepths[i],scale=(libraFocal+depth)/libraFocal;
      const x=p.x*scale,y=p.z*scale,z=depth+(back?10:0);
      const rx=x*c+z*s,rz=-x*s+z*c;
      const perspective=libraFocal/(libraFocal+rz);
      return {x:400+rx*perspective,y:212+y*perspective};
    }));
  }
  globalThis.ForestGeometry={outline,fragments,sources,targets,heights,lightAt,shadow,iso,rms,shadowPolygons,cameraPolygons,path,libra,libraSlices,libraPolygons};
})();
