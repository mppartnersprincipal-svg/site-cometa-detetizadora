// Agregações do /dashboard (api/_lib/report.js): funil, contatos, jornadas e KPIs.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { funnels, kpis, contactReport, journeys, SECTIONS, SECTION_LABEL } from '../api/_lib/report.js';

const ev = (session_id, ts, name, props = {}, page_type = 'limpa-fossa') => ({ session_id, ts, name, props, page_type });

test('funnel counts unique sessions per section over sessions that opened the page', () => {
  const events = [
    ev('a', 't', 'page_view'), ev('b', 't', 'page_view'),
    ev('a', 't', 'section_view', { section: 'quando' }), ev('a', 't', 'section_view', { section: 'quando' }),
    ev('b', 't', 'section_view', { section: 'topo' }),
  ];
  const f = funnels(events)['limpa-fossa'];
  assert.equal(f.sessions, 2);
  assert.equal(f.steps.find((s) => s.key === 'quando').value, 1);
  assert.equal(f.steps.find((s) => s.key === 'quando').pct, 50);
  assert.equal(f.steps.find((s) => s.key === 'topo').label, 'Início da página');
});

test('each page has its own funnel: a view on one page never counts on another', () => {
  const events = [ev('a', 't', 'page_view'), ev('a', 't', 'section_view', { section: 'como' }), ev('c', 't', 'page_view', {}, 'inicio')];
  const f = funnels(events);
  assert.equal(f['limpa-fossa'].sessions, 1);
  assert.equal(f.inicio.sessions, 1);
  assert.equal(f.inicio.steps.find((s) => s.key === 'empresas').value, 0);
  assert.equal(f.hidrojato.sessions, 0);
});

test('funnel follows the section order of each page, all ending in service area and final CTA', () => {
  assert.deepEqual(SECTIONS.inicio.slice(0, 3), ['topo', 'servicos', 'numeros']);
  assert.deepEqual(SECTIONS['caixa-dagua'].slice(0, 2), ['topo', 'antes-depois']);
  assert.equal(Object.keys(SECTIONS).length, 7);
  for (const [page, keys] of Object.entries(SECTIONS)) {
    assert.equal(keys[0], 'topo', page);
    assert.deepEqual(keys.slice(-2), ['area', 'final'], page);
    keys.forEach((k) => assert.ok(SECTION_LABEL[k], page + ': ' + k));
  }
});

test('conversion counts WhatsApp OR phone, once per session', () => {
  const k = kpis([{ id: 1, wa_clicks: 2 }, { id: 2, phone_clicks: 1 }, { id: 3 }, { id: 4, wa_clicks: 1, phone_clicks: 1 }]);
  assert.equal(k.converting_sessions, 3);
  assert.equal(k.conversion_rate, 75);
  assert.equal(k.contacts, 5);
});

test('contacts are grouped by cta_location and pivoted by channel', () => {
  const events = [
    ev('a', 't', 'whatsapp_click', { cta_location: 'cta_whatsapp_hero' }),
    ev('b', 't', 'whatsapp_click', { cta_location: 'cta_whatsapp_hero' }),
    ev('b', 't', 'phone_click', { cta_location: 'telefone · contato' }),
    ev('a', 't', 'cta_click', { cta_location: 'maps · contato' }),
  ];
  const channel = { a: 'google_ads', b: 'direct' };
  const c = contactReport(events, (id) => channel[id]);
  assert.deepEqual(c.wa_by_location, [{ key: 'cta_whatsapp_hero', value: 2 }]);
  assert.deepEqual(c.phone_by_location, [{ key: 'telefone · contato', value: 1 }]);
  assert.deepEqual(c.cta_by_location, [{ key: 'maps · contato', value: 1 }]);
  const hero = c.contact_location_x_channel.find((r) => r.row === 'wa|cta_whatsapp_hero');
  assert.deepEqual(hero.cols, { google_ads: 1, direct: 1 });
});

test('journeys default to sessions that contacted; "todas" keeps every session', () => {
  const sessions = [{ id: 'a', wa_clicks: 1 }, { id: 'b' }];
  const evs = { a: [ev('a', 't', 'page_view'), ev('a', 't', 'whatsapp_click', { cta_location: 'fab_whatsapp' })] };
  const conv = journeys(sessions, evs, 'conv');
  assert.equal(conv.length, 1);
  assert.deepEqual(conv[0].trail.map((s) => s.text), ['Abriu a página de limpa fossa', 'WhatsApp (fab_whatsapp)']);
  assert.equal(journeys(sessions, evs, 'todas').length, 2);
});

test('click texts containing | keep text, section and page apart', async () => {
  const { clicks } = await import('../api/_lib/report.js');
  const [row] = clicks([{ session_id: 'a', name: 'click', page_type: 'inicio', props: { text: 'Limpa fossa | empresa', section: 'header' } }]);
  assert.deepEqual(row, { text: 'Limpa fossa | empresa', section: 'header', page: 'inicio', value: 1 });
});
