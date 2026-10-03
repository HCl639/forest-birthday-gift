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
assert.ok(Math.abs(g.heartSlices.reduce((sum,poly)=>sum+area(poly),0)-area(g.heart))<1e-8,'三片應完整分割同一顆心，不能有缺口或重疊面積');
g.heartPolygons(50).forEach((poly,i)=>poly.forEach((p,j)=>{
 assert.ok(Math.abs(p.x-400-g.heartSlices[i][j].x)<1e-10);
 assert.ok(Math.abs(p.y-212-g.heartSlices[i][j].z)<1e-10);
}));
for(const value of [0,16,50,84,100])g.heartPolygons(value).flat().forEach(p=>{
 assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y),'旋轉範圍內投影應有限');
 assert.ok(p.x>100&&p.x<700&&p.y>25&&p.y<370,'心形木雕應保持在裝置可見範圍內');
});
console.log('PASS: 日光投影、完整拼合、相機視差、心形分割與旋轉透視。');
