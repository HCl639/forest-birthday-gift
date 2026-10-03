// 驗證日光射線求交、不同高度的視差，以及正確位置的輪廓重合。
const assert=require('node:assert/strict');
require('../geometry.js');
const g=globalThis.ForestGeometry;
const area=poly=>Math.abs(poly.reduce((sum,p,i)=>{const q=poly[(i+1)%poly.length];return sum+p.x*q.z-q.x*p.z;},0))/2;
assert.ok(Math.abs(g.fragments.reduce((sum,poly)=>sum+area(poly),0)-area(g.outline))<1e-8,'四片應完整分割同一輪廓');
assert.ok(g.rms(g.shadowPolygons(36),g.targets)<1e-10,'目標光線下應完整拼合');
assert.ok(g.rms(g.shadowPolygons(83),g.targets)>60,'初始陰影應明顯分離');
for(const value of [0,15,36,62,100]){
 const light=g.lightAt(value);
 g.sources.forEach((poly,i)=>poly.forEach(p=>{
  const s=g.shadow(p,light);
  assert.equal(s.y,0);
  assert.ok(Math.abs((p.x-s.x)/p.y-light.x)<1e-12);
  assert.ok(Math.abs((p.z-s.z)/p.y-light.z)<1e-12);
 }));
}
const a=g.shadowPolygons(20),b=g.shadowPolygons(80);
const moves=a.map((poly,i)=>Math.abs(poly[0].x-b[i][0].x));
assert.ok(moves[3]>moves[0]*2,'較高木雕的影子應移動更多');
const camera=g.cameraPolygons(62);
camera.forEach((poly,i)=>poly.forEach((p,j)=>{
 assert.ok(Math.abs(p.x-400-g.fragments[i][j].x)<1e-10);
 assert.ok(Math.abs(p.y-210-g.fragments[i][j].z)<1e-10);
}));
console.log('PASS: 平行光投影、地面求交、高度視差、完整拼合、相機視差。');
