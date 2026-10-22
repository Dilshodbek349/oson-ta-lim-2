/* Oson Ta’lim.uz demo. Backend/API yo‘q: foydalanuvchilar va yozuvlar localStorage'da.
   MUHIM: Bu kod haqiqiy ishlab chiqarish tizimi uchun xavfsiz autentifikatsiya emas. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const KEY = {
    users: 'oson_talim_users_v2', session: 'oson_talim_session_v2',
    centers: 'oson_talim_centers_v2', specialists: 'oson_talim_specialists_v2',
    news: 'oson_talim_news_v2', settings: 'oson_talim_settings_v2',
    kelajak: 'oson_talim_kelajak_link_v2'
  };
  // DEMO ONLY — haqiqiy saytda login va ruxsat serverda tekshirilishi shart.
  const DEMO_ADMIN_CODE = 'ADMIN17';
  const DEMO_ADMIN_PASSWORD = 'Kelajak17!';
  const KELAJAK_URL = 'https://kelajak.uzedu.uz/#/home';
  const demoCenters = [
    { id: 'demo-c1', name: 'Kelajak ta’lim markazi', subject: 'Matematika, Ingliz tili, IT', district: 'Yunusobod', sample: true },
    { id: 'demo-c2', name: 'Ilm-Ziyo markazi', subject: 'Kimyo, Biologiya', district: 'Chilonzor', sample: true },
    { id: 'demo-c3', name: 'Global Education', subject: 'Ingliz tili, Robototexnika', district: 'Yakkasaroy', sample: true }
  ];
  const demoSpecialists = [
    { id: 'demo-s1', name: 'Mavluda Karimova', subject: 'Logoped', district: 'Yunusobod', sample: true },
    { id: 'demo-s2', name: 'Jasur Rahimov', subject: 'Defektolog', district: 'Chilonzor', sample: true },
    { id: 'demo-s3', name: 'Dilnoza Ismoilova', subject: 'Maxsus pedagog', district: 'Mirzo Ulug‘bek', sample: true }
  ];

  function read(key, fallback) {
    try { const val = localStorage.getItem(key); return val ? JSON.parse(val) : fallback; }
    catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { toast('Brauzer xotirasiga saqlab bo‘lmadi.'); return false; }
  }
  function readItems(key) { const data = read(key, []); return Array.isArray(data) ? data : []; }
  function text(element, value) { if (element) element.textContent = String(value); }
  function el(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  const formatNumber = n => Number(n).toLocaleString('ru-RU').replaceAll('\u00a0', ' ');
  const uid = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(36).slice(2));
  let session = null;
  let toastTimer;

  function toast(message) {
    const popup = $('#toast');
    text(popup, message);
    popup.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => popup.classList.remove('visible'), 3000);
  }
  function message(selector, value, isSuccess = false) {
    const target = $(selector);
    text(target, value);
    target?.classList.toggle('success', isSuccess);
  }
  function setAuthTab(tab) {
    for (const button of $$('.auth-tab')) {
      const selected = button.dataset.tab === tab;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
    }
    $('#loginForm').hidden = tab !== 'login';
    $('#registerForm').hidden = tab !== 'register';
    $('#adminForm').hidden = tab !== 'admin';
    for (const id of ['#loginMessage','#registerMessage','#adminMessage']) message(id, '');
  }
  function showLogin() {
    session = null;
    $('#authScreen').hidden = false;
    $('#appShell').hidden = true;
    $('#sidebar').classList.remove('open');
    $('#mobileShade').hidden = true;
    setAuthTab('login');
    window.scrollTo(0, 0);
  }
  function enterApp(data) {
    if (!data || !['admin', 'user'].includes(data.role)) { showLogin(); return; }
    session = data;
    if (!save(KEY.session, data)) return;
    $('#authScreen').hidden = true;
    $('#appShell').hidden = false;
    text($('#profileName'), data.role === 'admin' ? 'Admin' : data.name);
    text($('#profileRole'), data.role === 'admin' ? 'Tizim administratori' : 'Foydalanuvchi');
    text($('#profileInitial'), (data.name || 'A').trim().charAt(0).toUpperCase());
    for (const node of $$('.admin-only')) node.hidden = data.role !== 'admin';
    renderAll();
    window.scrollTo(0, 0);
    if (window.location.hash && window.location.hash !== '#start') {
      history.replaceState(null, '', window.location.pathname + window.location.search + '#home');
    }
    toast('Xush kelibsiz, ' + (data.role === 'admin' ? 'Administrator' : data.name) + '!');
  }

  $$('.auth-tab').forEach(btn => btn.addEventListener('click', () => setAuthTab(btn.dataset.tab)));
  $$('[data-go-tab]').forEach(btn => btn.addEventListener('click', () => setAuthTab(btn.dataset.goTab)));
  $('#navLogin').addEventListener('click', () => {setAuthTab('login');$('.auth-card').scrollIntoView({behavior:'smooth',block:'center'});});
  $('#forgotPassword').addEventListener('click', () => toast('Demo versiyada parolni tiklash ulanmagan. Yangi demo hisob ochishingiz mumkin.'));
  $$('.eye-toggle').forEach(btn => btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.password);
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.setAttribute('aria-label', input.type === 'text' ? 'Parolni yashirish' : 'Parolni ko‘rsatish');
  }));
  $('#registerForm').addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#registerName').value.trim();
    const identity = $('#registerIdentity').value.trim().toLowerCase();
    const password = $('#registerPassword').value;
    const confirmation = $('#registerPassword2').value;
    if (!name || !identity || password.length < 6) {message('#registerMessage','Ma’lumotlarni to‘liq kiriting.');return;}
    if (password !== confirmation) {message('#registerMessage','Parollar bir-biriga mos emas.');return;}
    const users = readItems(KEY.users);
    if (users.some(u => u.identity === identity)) {message('#registerMessage','Bu email yoki telefon allaqachon ro‘yxatdan o‘tgan.');return;}
    // Demo maqsadida brauzerning localStorage xotirasida saqlanadi; server autentifikatsiyasi emas.
    const user = {id:uid(),name,identity,password,createdAt:new Date().toISOString()};
    users.push(user);
    if (save(KEY.users, users)) {message('#registerMessage','Ro‘yxatdan o‘tish muvaffaqiyatli!',true);enterApp({name,identity,role:'user'});}
  });
  $('#loginForm').addEventListener('submit', event => {
    event.preventDefault();
    const identity = $('#loginIdentity').value.trim().toLowerCase();
    const password = $('#loginPassword').value;
    const user = readItems(KEY.users).find(u => u.identity === identity && u.password === password);
    if (!user) {message('#loginMessage','Hisob topilmadi yoki parol xato. Ro‘yxatdan o‘tishni tekshiring.');return;}
    enterApp({name:user.name,identity:user.identity,role:'user'});
  });
  $('#adminForm').addEventListener('submit', event => {
    event.preventDefault();
    if ($('#adminCode').value.trim() !== DEMO_ADMIN_CODE || $('#adminPass').value !== DEMO_ADMIN_PASSWORD) {
      message('#adminMessage','Admin kodi yoki paroli noto‘g‘ri.');return;
    }
    enterApp({name:'Administrator',identity:DEMO_ADMIN_CODE,role:'admin'});
  });
  $('#logoutBtn').addEventListener('click', () => {
    try { localStorage.removeItem(KEY.session); } catch {}
    showLogin();toast('Hisobdan chiqdingiz.');
  });

  function renderTable(tbodySelector, samples, key) {
    const tbody = $(tbodySelector);
    tbody.replaceChildren();
    const isAdmin = session?.role === 'admin';
    for (const item of [...samples, ...readItems(key)]) {
      const row = el('tr');
      [item.name, item.subject, item.district].forEach(value => row.appendChild(el('td', '', value)));
      const status = el('td');
      status.appendChild(el('span','row-status'+(item.sample?' sample':''),item.sample?'Namuna':'Qo‘shilgan'));
      row.appendChild(status);
      if (isAdmin) {
        const cell = el('td');
        if (!item.sample) {
          const button = el('button','row-delete','O‘chirish');
          button.type = 'button';
          button.addEventListener('click', () => {
            const updated = readItems(key).filter(x => x.id !== item.id);
            if (save(key,updated)) {renderAll();toast('Yozuv o‘chirildi.');}
          });
          cell.appendChild(button);
        } else cell.textContent = '—';
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
  }
  function formatDate(input) {
    const iso = input || new Date().toISOString().slice(0,10);
    const parts = iso.split('-');
    return parts.length === 3 ? `${parts[0]}-yil ${parts[2]}.${parts[1]}` : iso;
  }
  function newsRow(item) {
    const row = el('article','news-row');
    const thumb = el('span','news-thumb thumb-a');
    const ico = document.createElementNS('http://www.w3.org/2000/svg','svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg','use');
    use.setAttribute('href','#i-news');ico.appendChild(use);thumb.appendChild(ico);
    const copy = el('span');
    copy.append(el('b','',item.title),el('small','',formatDate(item.date)+' · Siz qo‘shgan'));
    row.append(thumb,copy);
    return row;
  }
  function renderNews() {
    $$('#newsPreview .news-row.added').forEach(node=>node.remove());
    const additions = readItems(KEY.news);
    // Namuna yangiliklari doim pastda qoladi.
    additions.slice().reverse().forEach(item => {
      const row = newsRow(item);row.classList.add('added');
      $('#newsPreview').prepend(row);
    });
    const list = $('#newsTable');list.replaceChildren();
    if (!additions.length) {list.appendChild(el('p','helper-copy','Yangi qo‘shilgan yangiliklar hozircha yo‘q.'));return;}
    additions.slice().reverse().forEach(item => {
      const entry = el('article','news-admin-item');
      const content = el('div');
      content.append(el('b','',item.title),el('small','',formatDate(item.date)),el('p','',item.description));
      const button = el('button','news-delete','O‘chirish');button.type='button';
      button.addEventListener('click', () => {
        if (save(KEY.news,readItems(KEY.news).filter(x => x.id !== item.id))) {renderAll();toast('Yangilik o‘chirildi.');}
      });
      entry.append(content,button);list.appendChild(entry);
    });
  }
  function renderCounts() {
    text($('#userCount'),formatNumber(12450+readItems(KEY.users).length));
    text($('#centerCount'),formatNumber(320+readItems(KEY.centers).length));
    text($('#newsCount'),formatNumber(186+readItems(KEY.news).length));
    text($('#specialistCount'),formatNumber(48+readItems(KEY.specialists).length));
    text($('#registeredCount'),readItems(KEY.users).length);
  }
  function applySettings() {
    const settings = read(KEY.settings,{siteName:'Oson Ta’lim.uz',phone:'904959597'});
    const siteName = (settings.siteName || 'Oson Ta’lim.uz').trim();
    const phone = (settings.phone || '904959597').trim();
    $$('.site-brand-name').forEach(node => text(node,siteName));
    $('#siteNameInput').value = siteName;
    $('#phoneInput').value = phone;
    const anchor = $('#contact-landing a');
    anchor.href = 'tel:' + phone.replace(/[^0-9+]/g,'');
    text(anchor, phone);
    document.title = siteName + ' — O‘qish oson. Kelajak yorqin!';
  }
  function renderAll() {
    renderTable('#centerTable',demoCenters,KEY.centers);
    renderTable('#specialistTable',demoSpecialists,KEY.specialists);
    renderNews();renderCounts();applySettings();
  }
  function wireForm(triggerSelector, formSelector, fields, key, label) {
    $(triggerSelector).addEventListener('click', () => {const f=$(formSelector);f.hidden=!f.hidden;if(!f.hidden)f.querySelector('input')?.focus();});
    $(formSelector).addEventListener('submit', event => {
      event.preventDefault();if(session?.role!=='admin')return;
      const values = fields.map(selector=>$(selector).value.trim());
      if (values.some(v=>!v)) {toast('Barcha maydonlarni to‘ldiring.');return;}
      const entries=readItems(key);
      entries.push({id:uid(),name:values[0],subject:values[1],district:values[2],sample:false});
      if (save(key,entries)) {
        event.target.reset();event.target.hidden=true;renderAll();toast(label+' qo‘shildi.');
      }
    });
  }
  wireForm('#showCenterForm','#centerForm',['#centerName','#centerSubject','#centerDistrict'],KEY.centers,'Markaz');
  wireForm('#showSpecialistForm','#specialistForm',['#specialistName','#specialistRole','#specialistArea'],KEY.specialists,'Mutaxassis');
  $('#showNewsForm').addEventListener('click',()=>{const form=$('#newsForm');form.hidden=!form.hidden;if(!form.hidden)$('#newNewsTitle').focus();});
  $('#newsForm').addEventListener('submit',event=>{
    event.preventDefault();if(session?.role!=='admin')return;
    const title=$('#newNewsTitle').value.trim(),date=$('#newNewsDate').value,description=$('#newNewsText').value.trim();
    if(!title||!description)return;
    const entries=readItems(KEY.news);
    entries.push({id:uid(),title,date,description});
    if(save(KEY.news,entries)){event.target.reset();event.target.hidden=true;renderAll();toast('Yangilik qo‘shildi.');}
  });
  $('#settingsForm').addEventListener('submit',event=>{
    event.preventDefault();if(session?.role!=='admin')return;
    const siteName=$('#siteNameInput').value.trim(),phone=$('#phoneInput').value.trim();
    if(!siteName||!phone)return;
    if(save(KEY.settings,{siteName,phone})) {applySettings();text($('#settingsMessage'),'Ma’lumotlar brauzer xotirasida saqlandi.');toast('Sozlamalar saqlandi.');}
  });
  $('#saveKelajakLink').addEventListener('click',()=>{
    if(session?.role!=='admin')return;
    if(save(KEY.kelajak,{url:KELAJAK_URL,savedAt:new Date().toISOString()})) {
      text($('#syncMessage'),'Rasmiy havola saqlandi. Kelajak API ulanmagani sababli ma’lumotlar avtomatik uzatilmaydi.');
      toast('Kelajak markazi havolasi saqlandi.');
    }
  });
  $('#notificationBtn').addEventListener('click',()=>toast('Bildirishnomalar demo: yangi xabarlar uchun server ulanmagan.'));
  $('#menuBtn').addEventListener('click',()=>{
    const isOpen=$('#sidebar').classList.toggle('open');
    $('#mobileShade').hidden=!isOpen;
    $('#menuBtn').setAttribute('aria-expanded',String(isOpen));
  });
  function closeMobileSidebar(){ $('#sidebar').classList.remove('open');$('#mobileShade').hidden=true;$('#menuBtn').setAttribute('aria-expanded','false'); }
  $('#mobileShade').addEventListener('click',closeMobileSidebar);
  $$('[data-nav]').forEach(link=>link.addEventListener('click',()=>{
    $$('[data-nav]').forEach(a=>a.classList.remove('active'));
    link.classList.add('active');closeMobileSidebar();
  }));
  $$('[data-scroll]').forEach(button=>button.addEventListener('click',()=>{
    const section=document.getElementById(button.dataset.scroll);
    if(section&&!section.hidden)section.scrollIntoView({behavior:'smooth',block:'start'});
  }));
  $('#globalSearch').addEventListener('keydown',event=>{
    if(event.key!=='Enter')return;
    event.preventDefault();
    const query=event.target.value.trim().toLocaleLowerCase('uz');
    if(!query)return;
    const sections=$$('.dashboard-main section').filter(s=>!s.hidden&&s.innerText.toLocaleLowerCase('uz').includes(query));
    if(sections.length){sections[0].scrollIntoView({behavior:'smooth',block:'center'});toast('Mos bo‘lim topildi.');}
    else toast('Hech narsa topilmadi.');
  });

  // Sahifani qayta ochganda demo sessiyani tiklash.
  const storedSession=read(KEY.session,null);
  if (storedSession && (storedSession.role==='user'||storedSession.role==='admin')) enterApp(storedSession);
  else showLogin();
  applySettings();
})();
