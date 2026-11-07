# Književni i gramatički kutak 📚

Interaktivan sajt za **srpski jezik i književnost, IV razred gimnazije**. Napravljen je kao jednostavan statički sajt bez instalacije i bez baze podataka, tako da radi na GitHub Pages.

## Šta je već napravljeno?

- Početna strana sa pregledom gradiva i pojmom dana
- Biblioteka sa 8 početnih kartica dela (pisac, rod, vrsta, motivi, tema)
- Pojmovnik sa 32 književna i teorijska pojma
- Gramatika: 6 početnih oblasti iz sintakse, pravopisa i jezičke kulture
- Testovi: 41 početno pitanje; ponuđeni odgovori, više tačnih odgovora, povezivanje pojmova i prepoznavanje odlomka
- Nasumičan redosled pitanja i ponuđenih odgovora, objašnjenje tačnog odgovora
- Pregled rezultata i istorija testova, sačuvana dela i tamna tema
- Prilagođen prikaz za telefon i računar

**Napomena:** Početne kartice dela su kratke. Nisu zamena za analizu celog dela. Pitanja sa odlomcima i detaljnije analize proširivaćemo na osnovu školskih tekstova i beležaka koje korisnica dostavi.

## Fajlovi

| Fajl | Namena |
|---|---|
| `index.html` | Okvir sajta i navigacija |
| `style.css` | Izgled i prikaz na telefonima |
| `data.js` | Sva dela, pojmovi, lekcije i pitanja |
| `app.js` | Pretraga, testovi, bodovanje, istorija rezultata |

## GitHub Pages: objavljivanje

1. U root (osnovni nivo) repository-ja otpremi `index.html`, `style.css`, `data.js`, `app.js` (i po želji ovaj `README.md`).
2. U repository-ju otvori **Settings → Pages**.
3. Pod **Build and deployment** izaberi **Deploy from a branch**.
4. Branch: **main**, folder: **/(root)**, pa klikni **Save**.
5. Kada GitHub završi objavljivanje, otvori link koji se pojavljuje u Pages podešavanjima.

Na GitHub-u postoji i opcija **Add file → Upload files**: datoteke iz ZIP arhive prvo treba **raspakovati**, a zatim ih zajedno prevući na stranicu za otpremanje. Nemoj otpremati samo ZIP, jer GitHub Pages neće automatski prikazati njegov sadržaj.

## Kako dodavati gradivo

Svi edukativni podaci su u `data.js`, u objektu `window.KUTAK_DATA`:

- `terms`: naziv, oblast, definicija i primer književnog pojma;
- `works`: naslov, autor, književni rod, vrsta, period i tematski krugovi;
- `grammar`: naslov i objašnjenje gramatičke lekcije, dodatna pravila i primer;
- `questions`: pitanja za proveru znanja.

Vrste pitanja:

```js
// Jedan tačan odgovor (answer = indeks tačne opcije, od nule)
{ id: 'q42', category: 'Teorija', type: 'single',
  prompt: 'Kako se naziva pesma od 14 stihova?',
  options: ['Sonet', 'Elegija', 'Balada'], answer: 0,
  explain: 'Sonet ima 14 stihova.' }

// Povezivanje pojmova
{ id: 'q43', category: 'Književnost', type: 'matching',
  prompt: 'Poveži naslov i pisca',
  pairs: [['Hamlet', 'Vilijam Šekspir'], ['Prokleta avlija', 'Ivo Andrić']],
  explain: 'Vežba prepoznavanja pisaca.' }

// Više tačnih odgovora
{ id: 'q44', category: 'Teorija', type: 'multi',
  prompt: 'Označi sve primere dramskih pojmova',
  options: ['Katarza', 'Zaplet', 'Sonet'], answers: [0, 1],
  explain: 'Sonet je pesnički oblik.' }
```

Svako pitanje mora imati **jedinstveni** `id`. Ponuđeni odgovori se mešaju u testu, tako da tačan odgovor neće stalno biti na prvom mestu. Ako dodaješ prepoznavanje dela po tekstu, koristi tip `quote` sa poljem `quote`, uz podatke za običan pojedinačni izbor odgovora.

## Privatnost i ograničenja

Rezultati testova i sačuvana dela ostaju u `localStorage` pregledača. Ne šalju se na server i **ne prenose se automatski na drugi telefon ili računar**. Brisanje podataka pregledača može izbrisati rezultate.

Sajt trenutno nema korisničke naloge niti automatsko dodavanje pitanja preko administratorskog panela; nova pitanja se dodaju izmenom `data.js` i objavljivanjem promena na GitHub-u.