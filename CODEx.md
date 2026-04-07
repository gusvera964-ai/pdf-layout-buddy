# CODEx — TL;DR Side Panel (MVP)

## 1) Назначение и границы

**Цель:** быстро сжимать текущую страницу в TL;DR через локальный API.
**Негоулы:** нет авторизации, нет полнотекстового парсинга HTML, нет длительного хранилища >3 карточек, нет прод-аналитики.

## 2) Пользовательские сценарии (MVP)

1. Указать адрес API → проверить соединение → получить индикатор статуса.
2. Нажать **Сжать (Alt+S)** → получить буллеты и выводы → скопировать.
3. Откатиться к одному из **3 последних** TL;DR в истории и скопировать его.
4. Видеть ошибки (API/контент/таймаут) и честный дисклеймер.

## 3) Пермишены и технологии

* **Chrome Manifest V3:** `storage`, `activeTab`, `scripting`, `side_panel`, `commands`.
* **Host permissions:** `<all_urls>` (MVP).
* **Стек:** React + TS, ESBuild (или Vite), Chrome APIs (background, content script, messaging).
* **Бэкенд:** локальный FastAPI (или совместимый) с `/health`, `/tldr`.

## 4) Архитектурная диаграмма (словами)

UI (Side Panel, React) ←→ Services (api, storage, messaging) ←→ Background (hotkey) ←→ Content Script (page context).
UI формирует запрос к API, результат кладёт в `chrome.storage.local` (история ≤3).

## 5) Структура репозитория (MVP)

```
/extension
  /public
    manifest.json
    index.html
    icon.png
  /src
    background.ts            # service worker (hotkey → UI)
    contentScript.ts         # контекст страницы (url/title/selection)
    sidePanel.tsx            # bootstrap React
    /ui
      App.tsx                # основной интерфейс
    /services
      api.ts                 # pingApi/summarize
      storage.ts             # chrome.storage sync/local
      messaging.ts           # хелперы обмена сообщениями
    /utils
      format.ts              # clipboard, time
      errors.ts              # типы ошибок (опционально)
/scripts
  build-extra.mjs            # сборка через esbuild
package.json
vite.config.ts (опц. если используешь Vite)
CODEx.md
```

## 6) Модули и ответственность

### UI-компоненты

* `ApiSettingsBar`: поле API, `[Сохранить]`, `[Проверить API]`, индикатор 🟢/🔴.
* `ActionBar`: `[Сжать (Alt+S)]`, индикатор ⏳/✅/❌.
* `SummaryView`: заголовок, буллеты, выводы, `[📋 Копировать]`.
* `HistoryList`: ≤3 карточки с краткими пунктами и копированием.
* `ErrorBanner`: ошибки.
* `HintBlock`: подсказки и дисклеймер.

### Состояние (в App.tsx)

```ts
type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

interface TldrItem {
  id: string;
  title: string;
  bullets: string[];
  conclusions: string[];
  url: string;
  createdAt: number;
}

interface UiState {
  apiBaseUrl: string;
  apiReachable: boolean | null;
  requestStatus: RequestStatus;
  errorMessage?: string;
  current: TldrItem | null;
  history: TldrItem[];              // максимум 3
}
```

### Сервисы

`services/api.ts`

```ts
export async function pingApi(baseUrl: string): Promise<boolean>;
export async function summarize(
  baseUrl: string,
  payload: { url: string; selection?: string; html?: string }
): Promise<{ title: string; bullets: string[]; conclusions: string[] }>;
```

`services/storage.ts`

```ts
export async function loadApiBaseUrl(): Promise<string | null>;
export async function saveApiBaseUrl(url: string): Promise<void>;
export async function loadHistory(): Promise<TldrItem[]>;
export async function saveHistory(history: TldrItem[]): Promise<void>;
export async function pushHistory(item: TldrItem, max?: number): Promise<void>; // dedup + truncate
```

`services/messaging.ts` (сигнатуры)

```ts
export type Msg =
  | { type: 'REQUEST_PAGE_CONTEXT' }
  | { type: 'RESPONSE_PAGE_CONTEXT'; payload: { url: string; title: string; selection?: string } }
  | { type: 'SUMMARIZE_HOTKEY' };

export function requestPageContext(): Promise<{ url: string; title: string; selection?: string }>;
```

### Content Script

* Возвращает `{ url, title, selection? }` по запросу `REQUEST_PAGE_CONTEXT`.
* Не парсит DOM глубоко (MVP).

### Background (Service Worker)

* Слушает `commands.onCommand('summarize')` → шлёт `SUMMARIZE_HOTKEY` в UI.

## 7) Контракты API

```
GET  /health
200: { ok: true }

POST /tldr
Body: { url: string; selection?: string; html?: string }
200: { title: string; bullets: string[]; conclusions: string[] }
4xx/5xx: текст/JSON ошибки
```

## 8) Пользовательские флоу

### A. Инициализация

1. UI монтируется → читает `apiBaseUrl` (`sync`) и `history` (`local`).
2. Если `apiBaseUrl` задан, мягко пингует `/health` → ставит индикатор.

### B. Сжатие (кнопка/Alt+S)

1. UI → `REQUEST_PAGE_CONTEXT` в активную вкладку.
2. Получает `{ url, title, selection? }`.
3. `POST /tldr` → получает `{ title, bullets, conclusions }`.
4. Собирает `TldrItem`, рендерит в `current`, пушит в историю (обрезка до 3).

### C. Копирование

* `formatForClipboard(item)` → `navigator.clipboard.writeText(...)`.

## 9) UI-формат буфера

```
{title}

• bullet 1
• bullet 2
...

Выводы:
- conclusion 1
- conclusion 2

{url}
```

## 10) Ошибки и поведение

* Нет `apiBaseUrl` → дизейбл «Сжать», подсказка указать адрес.
* `/health` недоступен → 🔴 + короткое сообщение.
* Content script недоступен → «Не удалось получить контекст страницы».
* `/tldr` вернул 4xx/5xx → «Ошибка при обращении к API: …».
* Таймаут (реком. 20–30с) → «Похоже, API не отвечает».

## 11) Клавиши и доступность

* Глобальный хоткей: `Alt+S` (`commands` в manifest).
* Кнопки и входные поля — фокусируемые; минимум ARIA-лейблов (todo в post-MVP).

## 12) Безопасность и приватность (MVP)

* Нет удалённых хранилищ/телеметрии.
* История держится локально в `chrome.storage.local`, максимум 3 элемента.
* `host_permissions: <all_urls>` — **сузить** в post-MVP.

## 13) Сборка и запуск

```
cd extension
npm i
npm run build    # scripts/build-extra.mjs (esbuild) → /extension/dist
```

Chrome → `chrome://extensions` → Developer mode → **Load unpacked** → `extension/dist`.

## 14) Чек-лист готовности (MVP)

* [ ] `manifest.json` загружен, нет ошибок в консоли расширений.
* [ ] Панель открывается, ввод API сохраняется.
* [ ] `/health` → 🟢 OK.
* [ ] Alt+S шлёт `SUMMARIZE_HOTKEY` и триггерит `REQUEST_PAGE_CONTEXT`.
* [ ] `/tldr` возвращает корректный JSON (минимум 1 буллет).
* [ ] Копирование в буфер работает.
* [ ] История обрезается до 3, без дубликатов (`url+title`).
* [ ] Ошибки отображаются человекочитаемо.

## 15) Расширения после MVP (опционально)

* Вкладки **Текущий/История**; быстрый поиск по истории; экспорт .md/.txt.
* Валидация схемы ответа (`zod`).
* Сужение `host_permissions`; разрешения по доменам; CSP-ограничения.
* Отправка выделенного текста vs всей страницы (переключатель).
* Темизация, клавиатурная навигация, ARIA.

---

### Приложение A — ключевые сигнатуры (быстрая вставка)

**background.ts**

```ts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'summarize') chrome.runtime.sendMessage({ type: 'SUMMARIZE_HOTKEY' });
});
```

**contentScript.ts**

```ts
chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
  if (msg?.type === 'REQUEST_PAGE_CONTEXT') {
    const selection = window.getSelection()?.toString()?.trim();
    sendResponse({ ok: true, payload: { url: location.href, title: document.title, selection: selection || undefined } });
  }
});
```

**api.ts**

```ts
export async function pingApi(baseUrl: string) { /* GET /health → boolean */ }
export async function summarize(baseUrl: string, payload: { url: string; selection?: string; html?: string }) {
  /* POST /tldr → { title, bullets, conclusions } */
}
```

**storage.ts**

```ts
export async function pushHistory(item: TldrItem, max = 3) { /* dedup(url+title) + slice(0,max) */ }
```

**format.ts**

```ts
export function formatForClipboard(item: TldrItem): string { /* красивый текст для буфера */ }
```

---

если нужно, добавлю **таб-навигацию (Текущий/История)** и **zod-валидацию** прямо в Codex как “доп. раздел B”, или соберу единый `manifest.json` с уже суженными пермишенами под твои целевые домены.
