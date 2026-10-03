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
  globalThis.ForestGeometry={outline,fragments,sources,targets,heights,lightAt,shadow,iso,rms,shadowPolygons,cameraPolygons,path};
})();
