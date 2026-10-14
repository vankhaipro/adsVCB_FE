// Run: node scripts/test-sales-orders.cjs (uses the local TypeScript compiler, no extra dependencies).
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const Module = require('node:module');
const filename = require.resolve('../src/lib/salesOrders.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 } }).outputText;
const mod = new Module(filename, module); mod._compile(compiled, filename);
const { filterOrders, groupOrders, channelKey } = mod.exports;
const base = { id: '1', code: 'HK1', externalId: '001', currency: 'VND', revenue: 100, value: 100, eligible: true, owner: 'Owner', team: 'Team A', seller: 'Seller', sellerTeam: 'Sales', channel: 'Page', channelId: 'channel1', platform: 'FACEBOOK', status: 'Đã thanh toán' };
const rows = [base, { ...base, id: '2', code: 'HK2', owner: 'Chưa xác định', team: 'Chưa xác định', channelId: null, channel: 'Chưa xác định', revenue: 200 }, { ...base, id: '3', code: 'HK3', currency: 'JPY', revenue: 10000 }, { ...base, id: '4', code: 'HK4', eligible: false, revenue: 0, value: 500, status: 'Đã hủy' }, { ...base, id: '5', code: 'HK5', team: 'Team B', revenue: 300 }];
const f = { currency: 'VND', platform: '', channel: '', staff: '', team: '', status: 'REVENUE', search: '', role: 'owner' };
const selected = filterOrders(rows,f);
assert.equal(selected.length,3);
for(const by of ['staff','channel','team']) {
  const groups = groupOrders(selected,by,'owner');
  assert.equal(groups.reduce((s,g)=>s+g.revenue,0),600);
  assert.equal(groups.reduce((s,g)=>s+g.orders,0),3);
}
assert.equal(groupOrders(selected,'staff','owner').length,3); // same owner in two teams stays separate
assert.equal(filterOrders(rows,{...f,currency:'JPY'}).length,1);
assert.equal(filterOrders(rows,{...f,staff:'Seller',role:'seller'}).length,3);
assert.equal(filterOrders(rows,{...f,team:'Team B'}).length,1);
assert.equal(filterOrders(rows,{...f,search:'hk2'}).length,1);
assert.equal(filterOrders(rows,{...f,status:'ALL'}).length,4);
assert.equal(filterOrders(rows,{...f,status:'Đã hủy'})[0].revenue,0);
assert.equal(filterOrders(rows,{...f,channel:channelKey(base)}).length,2);
assert.equal(groupOrders(rows,'channel','owner').filter(g=>g.name==='Page').length,2); // currency separation even if caller forgot filtering
console.log('PASS: currency isolation, unknown attribution, all three reconciled breakdowns, role/team/channel/search/status filters.');
