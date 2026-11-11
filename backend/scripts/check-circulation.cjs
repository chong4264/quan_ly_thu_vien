// Run after `npm run build`. Uses a disposable PostgreSQL database, never the app database.
const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');
const { Client } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const appDir = path.resolve(__dirname, '..');
const database = `library_check_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
const connection = {
  host: process.env.DATABASE_HOST || '127.0.0.1', port: Number(process.env.DATABASE_PORT || 5432),
  user: process.env.DATABASE_USERNAME, password: process.env.DATABASE_PASSWORD, database: 'postgres',
};
assert.equal(process.env.DATABASE_CLIENT, 'postgres', 'This check requires PostgreSQL');
assert.ok(['localhost', '127.0.0.1', '::1'].includes(connection.host), 'Only local PostgreSQL is supported');
assert.ok(!process.env.DATABASE_URL, 'Use individual local database settings for this check');
const maintenance = new Client(connection);
let app;
let base;
let createdDatabase = false;
let checks = 0;
const password = `Check-${crypto.randomBytes(16).toString('hex')}!A1`;
const uid = (name) => `api::${name}.${name}`;
const doc = (name) => app.documents(uid(name));
const verify = (message) => { checks++; console.log(`PASS ${message}`); };

async function request(route, token, method = 'GET', body, status = 200) {
  const response = await fetch(`${base}/api${route}`, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  assert.equal(response.status, status, `${method} ${route}: ${JSON.stringify(result)}`);
  return result;
}
async function account(name, role) {
  const user = await app.plugin('users-permissions').service('user').add({
    username: `check.${name}`, email: `check.${name}@example.test`, password,
    provider: 'local', confirmed: true, blocked: false, role: role.id,
  });
  const login = await request('/auth/local', null, 'POST', { identifier: user.email, password });
  return { ...user, token: login.jwt };
}
async function main() {
  await maintenance.connect();
  await maintenance.query(`CREATE DATABASE "${database}"`);
  createdDatabase = true;
  Object.assign(process.env, {
    DATABASE_NAME: database, DATABASE_SCHEMA: 'public', DATABASE_URL: '',
    HOST: '127.0.0.1', PORT: '0', NODE_ENV: 'test', STRAPI_TELEMETRY_DISABLED: 'true',
  });
  process.chdir(appDir);
  const { createStrapi } = require('@strapi/strapi');
  app = await createStrapi({ appDir, distDir: path.join(appDir, 'dist'), serveAdminPanel: false }).load();
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${app.server.httpServer.address().port}`;
  const roles = await app.db.query('plugin::users-permissions.role').findMany();
  const staff = await account('staff', roles.find((r) => r.type === 'librarian'));
  const reader = await account('reader', roles.find((r) => r.type === 'authenticated'));
  const other = await account('other', roles.find((r) => r.type === 'authenticated'));
  const unlinked = await account('unlinked', roles.find((r) => r.type === 'authenticated'));
  const type = await doc('patron-type').create({ data: { name: 'Check university', maxBooks: 3, loanDays: 14, maxRenewals: 1, renewDays: 7 } });
  const patronData = (code, userId) => ({ fullName: `Độc giả ${code}`, studentCode: code,
    cardBarcode: `CARD-${code}`, className: 'CNTT-ĐH', cardStatus: 'active', patronType: type.documentId, userId });
  const payload = patronData('CHECK-A', reader.id);
  const created = await request('/patrons/manage', staff.token, 'POST', { data: payload }, 201);
  const patron = created.data;
  const second = (await request('/patrons/manage', staff.token, 'POST', { data: patronData('CHECK-B', other.id) }, 201)).data;
  await request('/patrons/manage', reader.token, 'GET', undefined, 403);
  await request('/patrons/manage', null, 'GET', undefined, 403);
  const options = await request('/patrons/manage/options?q=check', staff.token);
  assert.ok(options.users.some((u) => u.id === unlinked.id));
  assert.ok(!options.users.some((u) => u.id === reader.id));
  assert.ok(!JSON.stringify(options).includes('password'));
  const list = await request('/patrons/manage?q=CHECK-A', staff.token);
  assert.equal(list.data.length, 1);
  await request('/patrons/manage', staff.token, 'POST', { data: payload }, 400);
  await request('/patrons/manage', staff.token, 'POST', { data: { ...payload, studentCode: 'OTHER', cardBarcode: 'OTHER', userId: reader.id } }, 400);
  await request(`/patrons/manage/${patron.documentId}`, staff.token, 'PUT', { data: { ...payload, userId: other.id } }, 400);
  const profile = await request('/patrons/me', reader.token);
  assert.equal(profile.patron.documentId, patron.documentId);
  verify('Staff creates/searches patrons, links each reader once, reader cannot manage patrons, options omit secrets');
  const unknownRole = await app.db.query('plugin::users-permissions.role').create({ data: { name: 'Check custom role', type: 'check-custom', description: 'Policy check' } });
  await app.db.query('plugin::users-permissions.permission').create({ data: { action: 'api::patron.patron.staffList', role: unknownRole.id } });
  const unknown = await account('custom', unknownRole);
  await request('/patrons/manage', unknown.token, 'GET', undefined, 403);
  verify('Staff policy rejects unknown roles even when an action is accidentally granted');

  const books = [];
  const copies = [];
  for (let i = 0; i < 7; i++) {
    const book = await doc('book').create({ data: { title: `Check book ${i}`, author: 'Check author', status: 'active', allowHomeLoan: true } });
    books.push(book);
    copies.push(await doc('copy').create({ data: { book: book.documentId, accessionNo: `CHECK-ACC-${i}`, barcode: `CHECK-BC-${i}`, circulationStatus: 'available', condition: 'good' } }));
  }
  await request('/loan-requests', unlinked.token, 'POST', { bookId: books[0].documentId }, 400);
  await request('/loan-requests', staff.token, 'POST', { bookId: books[0].documentId }, 403);
  const submit = (book) => request('/loan-requests', reader.token, 'POST', { bookId: book.documentId, note: 'Nhận tại quầy' }, 201);
  const firstRequest = (await submit(books[0])).data;
  await request('/loan-requests', reader.token, 'POST', { bookId: books[0].documentId }, 400);
  assert.equal((await doc('copy').findOne({ documentId: copies[0].documentId })).circulationStatus, 'available');
  const mine = await request('/loan-requests/me', reader.token);
  assert.equal(mine.data.length, 1);
  assert.equal((await request('/loan-requests/me', other.token)).data.length, 0);
  await request(`/loan-requests/${firstRequest.documentId}/cancel`, other.token, 'POST', {}, 404);
  await request('/loan-requests/admin', reader.token, 'GET', undefined, 403);
  await request(`/loan-requests/${firstRequest.documentId}/fulfill`, reader.token, 'POST', { copyBarcode: copies[0].barcode }, 403);
  await request(`/patrons/manage/${patron.documentId}`, staff.token, 'DELETE', undefined, 400);
  verify('Online requests enforce role, own data, duplicate prevention and preserve history; pending request does not lend a copy');

  const simultaneous = await Promise.allSettled([
    submit(books[1]), submit(books[1]),
  ]);
  assert.equal(simultaneous.filter((r) => r.status === 'fulfilled').length, 1);
  const request2 = simultaneous.find((r) => r.status === 'fulfilled').value.data;
  const request3 = (await submit(books[2])).data;
  await request('/loan-requests', reader.token, 'POST', { bookId: books[3].documentId }, 400);
  await request(`/loan-requests/${request2.documentId}/cancel`, reader.token, 'POST', {});
  await request(`/loan-requests/${request2.documentId}/cancel`, reader.token, 'POST', {}, 400);
  await request(`/loan-requests/${request3.documentId}/reject`, staff.token, 'POST', { responseNote: '' }, 400);
  await request(`/loan-requests/${request3.documentId}/reject`, staff.token, 'POST', { responseNote: 'Theo đề nghị độc giả' });
  verify('Concurrent duplicate requests, request quota, reader cancellation and rejection state transitions');

  await request(`/patrons/manage/${patron.documentId}`, staff.token, 'PUT', { data: { ...payload, cardStatus: 'locked' } });
  await request('/loan-requests', reader.token, 'POST', { bookId: books[3].documentId }, 400);
  await request(`/loan-requests/${firstRequest.documentId}/fulfill`, staff.token, 'POST', { copyBarcode: copies[0].barcode }, 400);
  await request(`/patrons/manage/${patron.documentId}`, staff.token, 'PUT', { data: payload });
  await request(`/patrons/manage/${patron.documentId}`, staff.token, 'PUT', { data: { ...payload, cardExpiresAt: '2000-01-01' } });
  await request('/loan-requests', reader.token, 'POST', { bookId: books[3].documentId }, 400);
  await request(`/patrons/manage/${patron.documentId}`, staff.token, 'PUT', { data: payload });
  await doc('book').update({ documentId: books[4].documentId, data: { status: 'restricted' } });
  await request('/loan-requests', reader.token, 'POST', { bookId: books[4].documentId }, 400);
  await doc('book').update({ documentId: books[4].documentId, data: { status: 'active' } });
  await request(`/loan-requests/${firstRequest.documentId}/fulfill`, staff.token, 'POST', { copyBarcode: copies[1].barcode }, 400);
  const fulfilled = await request(`/loan-requests/${firstRequest.documentId}/fulfill`, staff.token, 'POST', { copyBarcode: copies[0].barcode });
  assert.equal(fulfilled.data.status, 'fulfilled');
  assert.ok(fulfilled.data.loan.documentId);
  assert.equal((await doc('copy').findOne({ documentId: copies[0].documentId })).circulationStatus, 'borrowed');
  await request(`/loan-requests/${firstRequest.documentId}/fulfill`, staff.token, 'POST', { copyBarcode: copies[0].barcode }, 400);
  const active = await request('/loan-items/me/current', reader.token);
  assert.ok(JSON.stringify(active).includes(books[0].title));
  verify('Locked cards and wrong titles rejected; fulfillment creates one real loan visible in reader current loans');

  const loanService = app.service(uid('loan'));
  const race = await Promise.allSettled([
    loanService.checkout({ patronBarcode: patron.cardBarcode, copyBarcodes: [copies[3].barcode], librarianId: staff.id }),
    loanService.checkout({ patronBarcode: second.cardBarcode, copyBarcodes: [copies[3].barcode], librarianId: staff.id }),
  ]);
  assert.equal(race.filter((r) => r.status === 'fulfilled').length, 1);
  await assert.rejects(() => loanService.checkout({ patronBarcode: second.cardBarcode, copyBarcodes: [copies[4].barcode, copies[4].accessionNo], librarianId: staff.id }));
  const doubleReturn = await Promise.allSettled([
    loanService.returnBook({ copyBarcode: copies[0].barcode, returnCondition: 'normal', librarianId: staff.id }),
    loanService.returnBook({ copyBarcode: copies[0].barcode, returnCondition: 'normal', librarianId: staff.id }),
  ]);
  assert.equal(doubleReturn.filter((r) => r.status === 'fulfilled').length, 1);
  const returnCount = await doc('return-receipt').count({ filters: { loanItem: { copy: { documentId: copies[0].documentId } } } });
  assert.equal(returnCount, 1);
  verify('Concurrent checkout lends each copy once; barcode aliases and concurrent double return cannot duplicate records');
  const competing = (await request('/loan-requests', other.token, 'POST', { bookId: books[5].documentId }, 201)).data;
  const decisions = await Promise.allSettled([
    request(`/loan-requests/${competing.documentId}/fulfill`, staff.token, 'POST', { copyBarcode: copies[5].barcode }),
    request(`/loan-requests/${competing.documentId}/cancel`, other.token, 'POST', {}),
  ]);
  assert.equal(decisions.filter((r) => r.status === 'fulfilled').length, 1);
  const finalRequest = await doc('loan-request').findOne({ documentId: competing.documentId });
  const finalCopy = await doc('copy').findOne({ documentId: copies[5].documentId });
  assert.equal(finalCopy.circulationStatus, finalRequest.status === 'fulfilled' ? 'borrowed' : 'available');
  verify('Concurrent cancellation and fulfillment have exactly one winner and consistent copy state');

  const temp = (await request('/patrons/manage', staff.token, 'POST', { data: patronData('CHECK-DELETE', null) }, 201)).data;
  await request(`/patrons/manage/${temp.documentId}`, staff.token, 'DELETE');
  await request(`/patrons/manage/${temp.documentId}`, staff.token, 'GET', undefined, 404);
  const counts = await request('/loans/status-counts', staff.token);
  const adminList = await request('/loans/admin-list?pageSize=100', staff.token);
  assert.equal(counts.all, adminList.meta.pagination.total);
  const filtered = await request(`/loans/admin-list?${new URLSearchParams({ q: books[0].title, className: 'CNTT-ĐH', status: 'returned' })}`, staff.token);
  assert.equal(filtered.data.length, 1);
  assert.equal(filtered.data[0].documentId, fulfilled.data.loan.documentId);
  const printed = await request(`/loans/${fulfilled.data.loan.documentId}/print`, staff.token);
  assert.equal(printed.code, fulfilled.data.loan.code);
  assert.equal(printed.librarian, staff.username);
  const returns = await request('/return-receipts/shift-history?mine=true', staff.token);
  assert.ok(returns.data.some((r) => r.accessionNo === copies[0].accessionNo));
  await request('/patrons/lookup?q=CHECK', reader.token, 'GET', undefined, 403);
  await request('/loans/admin-list', reader.token, 'GET', undefined, 403);
  await request('/loans/checkout', reader.token, 'POST', { patronBarcode: patron.cardBarcode, copyBarcodes: [copies[5].barcode] }, 403);
  verify('Unused patrons can be removed; loan dashboard and staff permissions match loan records');
  console.log(`Completed ${checks} integration groups in disposable PostgreSQL database.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => {
  try {
    if (app) await app.destroy();
    if (createdDatabase) {
      assert.match(database, /^library_check_\d+_[a-f0-9]{8}$/);
      await maintenance.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=$1 AND pid<>pg_backend_pid()', [database]);
      await maintenance.query(`DROP DATABASE "${database}"`);
      console.log('Removed disposable PostgreSQL database.');
    }
  } finally { await maintenance.end(); }
});
