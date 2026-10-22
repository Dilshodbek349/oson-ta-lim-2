# Oson Ta’lim.uz — yangi dizayn

Bu loyiha avvalgi HTML/CSS/JS prototipi asosida tayyorlangan. Yuborilgan logotip bilan kirish sahifasi va admin dashboard dizayni kod ko‘rinishida qayta ishlangan. Barcha interfeys elementlari HTML/CSS/SVG, screenshot emas.

## VS Code’da ochish

1. ZIP faylni oching (`Extract All` / `Извлечь все`).
2. `Oson_Talim_Yangi_Dizayn` papkasini **VS Code → File → Open Folder** orqali oching.
3. `index.html` faylini Live Server (`Open with Live Server`) orqali ishga tushiring. Shuningdek, faylni to‘g‘ridan-to‘g‘ri brauzerda ham ochish mumkin.

## Fayllar

- `index.html` — kirish, ro‘yxatdan o‘tish, admin sahifalari.
- `style.css` — ekran o‘lchamiga mos responsive dizayn.
- `script.js` — demo autentifikatsiya, qidiruv, menyu, qo‘shish/o‘chirish, sozlamalar.
- `assets/logo.png` — foydalanuvchi yuborgan logotip, fonsiz PNG.
- `assets/logo-light.png` — qoramtir sidebar uchun oq variant.
- `assets/education-hero.svg` — kitoblar va bitiruv qalpog‘i uchun tahrirlash mumkin bo‘lgan SVG.
- `assets/favicon.png` — brauzer yorlig‘i ikonkasi.

## Sinash

**Oddiy foydalanuvchi:** `Ro‘yxatdan o‘tish` yorlig‘idan yangi hisob yarating, keyin login bilan kiring.

**Admin demo:** `Admin` yorlig‘ini tanlang.
- Kod: `ADMIN17`
- Parol: `Kelajak17!`

Admin markazlar, mutaxassislar va yangiliklar qo‘shishi/o‘chirishi va sozlamalarni saqlashi mumkin. Demo kontent «Namuna» deb belgilangan. O‘zgarishlar `localStorage`da saqlanadi, serverda emas.

## Muhim cheklovlar

- Bu frontend **demo**. Foydalanuvchi login/parollari `localStorage`da saqlanadi; bu ishlab chiqarish (production) uchun **xavfsiz emas**. Haqiqiy tizimda backend, serverda parolni xeshlash, avtorizatsiya, HTTPS, bazaga ulanish va API kerak.
- Kelajak markazi bilan avtomatik sinxronizatsiya **ulanmagan**. Rasmiy sayt havolasi ishlaydi va saqlanadi. "Ulangan" deb ko‘rsatilmaydi.
- Google/Apple tugmalari dizayn uchun ko‘rsatilgan va faol emas; OAuth integratsiyasi mavjud emas.
- Statistika va dastlabki ma’lumotlar **namunaviy**, real vaqt ma’lumotlari emas.

## O‘zgartirish

Ranglar `style.css` boshidagi `:root` bo‘limida. Logotipni yangilash uchun `assets/logo.png` va `assets/logo-light.png` fayllarini almashtiring. Matnlar `index.html` ichida.
