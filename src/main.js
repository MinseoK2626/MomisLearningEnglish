import "@fontsource-variable/dm-sans";
import "@fontsource-variable/noto-sans-kr";
import "./style.css";
import {
  locations,
  phrases,
  listening,
  simulations,
  cafeSentence,
} from "./data.js";
import {
  immigrationQuestions,
  immigrationDefaults,
  immigrationAnswers,
  airportSituations,
  airportDefaults,
  extraBuilders,
} from "./builders.js";
const app = document.querySelector("#app");
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let saved = [];
try {
  saved = JSON.parse(
    (localStorage.getItem("mamalingo-favorites") ??
      localStorage.getItem("speakeasy-favorites")) ||
      "[]",
  );
  if (!Array.isArray(saved)) saved = [];
  saved = saved.filter(
    (p) =>
      p &&
      typeof p.en === "string" &&
      typeof p.ko === "string" &&
      locations.some((l) => l.id === p.loc),
  );
} catch {}
let loc = null,
  tab = "say",
  mode = "home",
  task = "",
  step = 0,
  response = null,
  history = [],
  builder = [];
const airportState = { ...airportDefaults };
const extraStates = Object.fromEntries(
  Object.entries(extraBuilders).map(([id, b]) => [id, { ...b.defaults }]),
);
let immigrationState = { ...immigrationDefaults },
  immigrationCard = null,
  immigrationQuestion = "purpose",
  airportSituation = "checkin",
  practiceIndex = 0;
try {
  const stored = JSON.parse(
    localStorage.getItem("mamalingo-immigration-draft") || "null",
  );
  if (stored && typeof stored === "object")
    for (const key of Object.keys(immigrationDefaults)) {
      const value = stored[key];
      const field = immigrationQuestions
        .flatMap((q) => q.fields)
        .find((f) => f.key === key);
      if (
        typeof value === "string" &&
        value.length <= 200 &&
        (!field?.options || field.options.some((o) => o.en === value))
      )
        immigrationState[key] = value;
    }
  const card = JSON.parse(
    localStorage.getItem("mamalingo-immigration-card") || "null",
  );
  if (
    Array.isArray(card?.answers) &&
    card.answers.length <= 20 &&
    card.answers.every((p) =>
      ["en", "ko", "title"].every(
        (k) => typeof p[k] === "string" && p[k].length <= 500,
      ),
    )
  )
    immigrationCard = card;
} catch {}
function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
function extendedState() {
  return loc === "airport"
    ? airportState
    : loc === "immigration"
      ? immigrationState
      : extraStates[loc];
}
function richFields(fields, state) {
  return `<div class="builder-fields rich-fields">${fields
    .filter((f) => !f.when || f.when(state))
    .map(
      (f) =>
        `<label class="field">${escape(f.label)}${f.options ? `<select data-rich="${f.key}">${f.options.map((o) => `<option value="${escape(o.en)}" ${state[f.key] === o.en ? "selected" : ""}>${escape(o.ko)}</option>`).join("")}</select>` : `<input data-rich="${f.key}" type="${f.type || "text"}" maxlength="200" value="${escape(state[f.key] || "")}" placeholder="${escape(f.placeholder || "")}" ${f.type === "date" ? "" : 'autocomplete="off"'}>`}</label>`,
    )
    .join("")}</div>`;
}
function richResults(answers) {
  return answers.length
    ? answers.map((p) => phrase(p.en, p.ko)).join("")
    : '<p class="selection-note" role="status">옵션에 맞는 이름이나 날짜를 입력해 주세요. 출국 날짜는 도착 날짜 이후로 골라 주세요.</p>';
}
function extendedView() {
  if (loc === "airport") {
    const situation = airportSituations.find((q) => q.id === airportSituation);
    return `<h2>✈ 공항에서 무엇을 하고 계세요?</h2><p class="intro">출발부터 도착까지, 필요한 순간의 말을 골라 보세요.</p><label class="field situation-select">지금 상황<select data-airport-situation>${airportSituations.map((q) => `<option value="${q.id}" ${airportSituation === q.id ? "selected" : ""}>${q.title}</option>`).join("")}</select></label><div class="builder-label"><span>✧</span>${situation.title}</div>${richFields(situation.fields, airportState)}${richResults(situation.generate(airportState))}<h2 class="more-phrases">자주 쓰는 공항 표현</h2>${phrases.airport.map((p) => phrase(...p)).join("")}`;
  }
  if (loc === "immigration") {
    const q = immigrationQuestions.find((q) => q.id === immigrationQuestion);
    return `<div class="immigration-intro"><span>♡</span><div><h2>입국심사 준비하기</h2><p>차분하게 하나씩 골라요. 실제 여행 계획에 맞게 선택해 주세요.</p></div></div><div class="question-selector" aria-label="입국심사 질문 선택">${immigrationQuestions.map((q, i) => `<button data-question="${q.id}" class="${immigrationQuestion === q.id ? "chosen" : ""}"><span>${String(i + 1).padStart(2, "0")}</span>${q.title}</button>`).join("")}<button data-question="summary" class="${immigrationQuestion === "summary" ? "chosen" : ""}"><span>♡</span>나의 답변 카드</button></div>${
      q
        ? `<div class="question-heading"><span>${q.icon}</span><h2>${q.title}</h2></div><details class="officer-questions" open><summary>직원이 이렇게 물어볼 수 있어요</summary>${phrase(q.questions[0][0], q.questions[0][1], "직원의 질문")}${
            q.questions.length > 1
              ? `<details class="alternative-questions"><summary>이렇게 물어보기도 해요 · ${q.questions.length - 1}개</summary>${q.questions
                  .slice(1)
                  .map(([en, ko]) => phrase(en, ko, "직원의 질문"))
                  .join("")}</details>`
              : ""
          }</details><div class="builder-label">어떻게 대답하시겠어요?</div>${richFields(q.fields, immigrationState)}${richResults(q.generate(immigrationState))}<div class="question-navigation"><button data-nav-question="${immigrationQuestions[Math.max(0, immigrationQuestions.indexOf(q) - 1)].id}" ${q.id === "purpose" ? "disabled" : ""}>← 이전 질문</button><button class="primary" data-nav-question="${immigrationQuestions[immigrationQuestions.indexOf(q) + 1]?.id || "summary"}">${q.id === "plans" ? "나의 답변 카드 보기 ♡" : "다음 질문 →"}</button></div>`
        : immigrationSummary()
    }<details class="legacy-phrases"><summary>자주 쓰는 기본 표현</summary>${phrases.immigration.map((p) => phrase(...p)).join("")}</details>`;
  }
  const b = extraBuilders[loc];
  return `<h2>${b.title}</h2><p class="intro">필요한 것을 한국어로 고르면, 부탁할 말이 완성돼요.</p>${richFields(b.fields, extraStates[loc])}${richResults(b.generate(extraStates[loc]))}<h2 class="more-phrases">자주 쓰는 표현</h2>${phrases[loc].map((p) => phrase(...p)).join("")}`;
}
function immigrationSummary() {
  const answers = immigrationAnswers(immigrationState),
    missing = immigrationQuestions.filter(
      (q) => !q.generate(immigrationState).length,
    );
  return `<section class="preparation-card"><div class="card-heading"><span>🛂</span><div><div class="eyebrow">A LITTLE PREPARATION, A LOT OF COMFORT</div><h2>나의 입국심사 답변</h2><p>내 여행 이야기를 한곳에 모았어요.</p></div></div>${missing.length ? `<p class="selection-note">${missing.map((q) => escape(q.title)).join(", ")}의 직접 입력을 마쳐 주세요.</p>` : ""}<div class="preparation-actions"><button class="primary" data-action="practice-card">🔊 ${practiceIndex ? "다음 답변 듣기" : "하나씩 연습하기"} <span>${practiceIndex ? `${practiceIndex} / ${answers.length}` : ""}</span></button><button class="save-card" data-action="save-card" ${missing.length ? "disabled" : ""}>♡ 내 입국심사 카드 저장</button></div><p class="intro">듣기 버튼을 누를 때마다 다음 답변을 하나씩 들려드려요.</p>${answers.map((p, i) => `<div class="summary-answer ${practiceIndex === i + 1 ? "practicing" : ""}"><h3>${escape(p.title)}</h3>${phrase(p.en, p.ko)}</div>`).join("")}</section>`;
}
function savedCardView() {
  if (!immigrationCard) return "";
  return `<section class="favorite-group saved-immigration"><div class="saved-card-heading"><h2>🛂 내 입국심사 카드</h2><button data-action="remove-card" aria-label="저장한 입국심사 카드 삭제">삭제</button></div><p class="intro">저장해 둔 답변이에요. 여행 계획이 바뀌면 입국심사에서 수정하고 다시 저장해 주세요.</p><button class="primary" data-action="edit-card">입국심사 답변 수정하기 →</button><details><summary>저장한 답변 보기 · ${immigrationCard.answers.length}개</summary>${immigrationCard.answers.map((p) => `<h3>${escape(p.title)}</h3>${phrase(p.en, p.ko, "이렇게 말하세요", "immigration")}`).join("")}</details></section>`;
}
function art(id) {
  const paths = {
    airport:
      '<path d="m16 56 25-9-9-22 8-3 18 19 24-8q12-3 14 3t-9 9l-25 8-3 25-8 3-9-20-19 4z"/>',
    immigration:
      '<rect x="27" y="17" width="48" height="64" rx="7"/><circle cx="51" cy="44" r="13"/><path d="M38 44h26M51 31q-10 13 0 26 10-13 0-26M39 68h24"/>',
    cafe: '<path d="M25 42h49v20q0 21-24 21T25 62zM74 47h7q20 0 14 15-4 9-20 9M20 86h61M35 28q-7-8 0-15M50 28q-7-8 0-15M65 28q-7-8 0-15"/>',
    restaurant:
      '<path d="M23 17v23q0 9 9 9t9-9V17M32 17v68M74 17q-20 20-13 38h13M74 17v68"/><circle cx="53" cy="52" r="32" opacity=".18"/>',
    shopping:
      '<path d="m22 37-5 47h66l-5-47zM35 38V26q0-17 15-17t15 17v12"/><path d="M40 61q10 11 20 0"/>',
    souvenir:
      '<rect x="20" y="42" width="61" height="41" rx="3"/><path d="M16 30h69v14H16zM50 30v53M50 30Q18 28 30 14 42 5 50 30Q80 29 70 14 58 4 50 30"/>',
    hotel:
      '<path d="M24 85V19h53v66M16 85h69M43 85V65h15v20M35 31h7m18 0h7M35 43h7m18 0h7M35 55h7m18 0h7"/>',
    transport:
      '<path d="m22 42 9-20h39l9 20M17 44h67v28H17zM25 72v12m50-12v12M43 21v-7h15v7M26 56h10m28 0h10"/>',
    emergency:
      '<path d="M50 83 19 52Q0 26 25 18q18-5 25 12 8-17 25-12 25 8 6 34zM32 50h12V38h12v12h12v12H56v12H44V62H32z"/>',
  };
  return `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[id]}</svg>`;
}
function shell(content) {
  app.dataset.place = loc || "";
  app.innerHTML = `<header><button class="brand" data-action="home"><span class="brand-mark">m<span>♡</span></span><span>MamaLingo<small>엄마의 미국 생활 영어</small></span></button><div class="header-right"><span class="korean">한국어 · EN</span><button class="saved-header" data-action="favorites" aria-label="내 표현">♡ <span>내 표현</span><b>${saved.length + (immigrationCard ? 1 : 0)}</b></button></div></header><main>${content}</main><nav class="bottom-nav"><button class="${mode === "home" ? "active" : ""}" data-action="home">⌂<span>어디에 계세요?</span></button><button class="${mode === "favorites" ? "active" : ""}" data-action="favorites">♡<span>내 표현</span></button><button data-action="help">♧<span>사용 방법</span></button></nav><div id="toast" role="status"></div><div id="modal"></div>`;
}
function home() {
  mode = "home";
  loc = null;
  shell(
    `<section class="hero"><div class="hero-text"><div class="eyebrow"><span></span> A LITTLE LOVE FOR EVERY JOURNEY</div><h1>지금 어디에 계세요?<span>낯선 곳에서도, 마음 편하게.</span></h1><p>하고 싶은 말을 한국어로 고르세요.<br>필요한 영어는 저희가 준비할게요.</p><div class="hero-note"><span>✧</span> 말하지 않아도 괜찮아요. 들려주거나 보여주세요.</div></div><div class="travel-art" aria-hidden="true"><div class="art-sun"></div><div class="art-cloud c1"></div><div class="art-cloud c2"></div><span class="flight">✈</span><div class="art-hill"></div><div class="suitcase"><div class="handle"></div><span>USA</span><div class="sticker">✿</div></div><div class="passport">✧<small>PASSPORT</small></div><span class="sparkle">✧</span><div class="art-caption">a little love, wherever you go.</div></div></section><section class="places"><div class="section-heading"><h2>어디서 영어가 필요하세요?</h2><span>상황을 선택해 주세요</span></div><div class="destination-grid">${locations.map((l) => `<button class="destination ${l.color} ${l.id === "emergency" ? "emergency" : ""}" data-location="${l.id}"><div class="illustration">${art(l.id)}</div><div class="destination-copy"><h3>${l.ko}</h3><span>${l.en}</span><p>${l.desc}</p></div><span class="card-arrow">↗</span></button>`).join("")}</div></section><div class="comfort"><span>♡</span><div><b>영어를 잘하지 않아도, 여행은 즐거울 수 있어요.</b><p>공부도, 시험도 없어요. 지금 필요한 말만 함께 찾아요.</p></div><span class="comfort-flower">✿</span></div><footer>Made with love, for Mom <span>✧</span> MamaLingo</footer>`,
  );
}
function phrase(en, ko, label = "이렇게 말하세요", saveLoc = loc || "airport") {
  const liked = saved.some((p) => p.en === en);
  return `<article class="phrase"><div class="phrase-top"><span>${escape(label)}</span><button class="favorite ${liked ? "liked" : ""}" data-save="${escape(en)}" data-save-loc="${saveLoc}" data-ko="${escape(ko)}" aria-label="${liked ? "내 표현에서 삭제" : "내 표현에 저장"}">${liked ? "♥" : "♡"}</button></div><h3 lang="en">${escape(en)}</h3><p>${escape(ko)}</p><div class="phrase-actions"><button class="listen" data-speak="${escape(en)}">🔊 영어로 들려주기</button><button data-slow="${escape(en)}" aria-label="천천히 듣기">🐢 천천히</button><button class="show" data-show="${escape(en)}">▣ 화면으로 보여주기</button></div></article>`;
}
function select(label, values, index) {
  return `<label class="field">${label}<select data-field="${index}">${values.map(([ko, en]) => `<option value="${escape(en)}" ${builder[index] === en ? "selected" : ""}>${ko}</option>`).join("")}</select></label>`;
}
const opts = {
  drink: [
    ["라떼", "latte"],
    ["아메리카노", "Americano"],
    ["카푸치노", "cappuccino"],
    ["차", "tea"],
  ],
  temp: [
    ["아이스", "iced"],
    ["따뜻하게", "hot"],
  ],
  size: [
    ["스몰", "small"],
    ["미디엄", "medium"],
    ["라지", "large"],
  ],
  milk: [
    ["일반 우유", "regular"],
    ["오트밀크", "oat milk"],
    ["두유", "soy milk"],
    ["아몬드밀크", "almond milk"],
  ],
  extra: [
    ["추가 안 해요", "none"],
    ["샷 추가", "an extra shot"],
    ["바닐라 시럽", "vanilla syrup"],
  ],
  place: [
    ["포장할게요", "to go"],
    ["여기서 마실게요", "here"],
  ],
  caffeine: [
    ["일반", "regular"],
    ["디카페인", "decaf"],
  ],
};
const tasks = [
  ["table", "자리 요청하기"],
  ["order", "음식 주문하기"],
  ["request", "직원에게 부탁하기"],
  ["problem", "음식에 문제가 있어요"],
  ["pay", "계산하기"],
  ["box", "포장하기"],
  ["diet", "알레르기 / 식단"],
];
function setupTask(t) {
  task = t;
  builder =
    t === "cafe"
      ? ["latte", "iced", "medium", "regular", "none", "to go", "regular"]
      : t === "table"
        ? ["two", "no", "Kim"]
        : t === "order"
          ? ["steak", "medium rare", "fries"]
          : t === "request"
            ? ["water", "more"]
            : t === "immigration"
              ? ["daughter", "two weeks", "daughter"]
              : t === "shopping"
                ? ["UVA T-shirt", "medium", "gift"]
                : t === "problem"
                  ? ["wrong"]
                  : t === "diet"
                    ? ["nuts", "allergy", "remove"]
                    : [];
}
function builderView() {
  let fields = "",
    en = "",
    ko = "";
  if (task === "cafe") {
    fields = Object.entries(opts)
      .map(([key, v], i) =>
        select(
          [
            "무엇을 주문하시나요?",
            "따뜻하게 / 차갑게",
            "사이즈",
            "우유",
            "추가 옵션",
            "어디서 드실 건가요?",
            "카페인",
          ][i],
          v,
          i,
        ),
      )
      .join("");
    en = cafeSentence(builder);
    ko = `${opts.size.find((v) => v[1] === builder[2])[0]} ${builder[1] === "iced" ? "아이스" : "따뜻한"} ${builder[6] === "decaf" ? "디카페인 " : ""}${opts.drink.find((v) => v[1] === builder[0])[0]}${builder[3] === "regular" ? "" : `, ${opts.milk.find((v) => v[1] === builder[3])[0]}로`}${builder[4] === "none" ? "" : `, ${opts.extra.find((v) => v[1] === builder[4])[0]}`} 주세요. ${builder[5] === "to go" ? "포장할게요." : "여기서 마실게요."}`;
  }
  if (task === "table") {
    fields =
      select(
        "몇 명이세요?",
        [
          ["1명", "one"],
          ["2명", "two"],
          ["3명", "three"],
          ["4명", "four"],
        ],
        0,
      ) +
      select(
        "예약하셨나요?",
        [
          ["예약 안 했어요", "no"],
          ["예약했어요", "yes"],
        ],
        1,
      );
    if (builder[1] === "yes")
      fields += `<label class="field">예약한 이름<input data-name value="${escape(builder[2])}" placeholder="Kim" aria-label="예약한 이름"></label>`;
    en =
      builder[1] === "yes"
        ? `Hi, I have a reservation for ${builder[0]} under ${builder[2] || "Kim"}.`
        : `Hi, could ${builder[0] === "one" ? "I" : "we"} get a table for ${builder[0]}, please?`;
    ko =
      builder[1] === "yes"
        ? `${builder[2] || "Kim"} 이름으로 ${["one", "two", "three", "four"].indexOf(builder[0]) + 1}명 예약했어요.`
        : `${["one", "two", "three", "four"].indexOf(builder[0]) + 1}명 자리 부탁드려요.`;
  }
  if (task === "order") {
    fields =
      select(
        "무엇을 드시고 싶으세요?",
        [
          ["스테이크", "steak"],
          ["연어", "salmon"],
          ["치킨", "chicken"],
        ],
        0,
      ) +
      (builder[0] === "steak"
        ? select(
            "굽기",
            [
              ["미디엄 레어", "medium rare"],
              ["미디엄", "medium"],
              ["웰던", "well done"],
            ],
            1,
          )
        : "") +
      select(
        "사이드",
        [
          ["감자튀김", "fries"],
          ["샐러드", "a side salad"],
          ["채소", "vegetables"],
        ],
        2,
      );
    en = `Could I get the ${builder[0]}${builder[0] === "steak" ? `, ${builder[1]}` : ""}, with ${builder[2]}, please?`;
    ko = `${builder[0] === "steak" ? `스테이크를 ${builder[1]}로` : builder[0] === "salmon" ? "연어를" : "치킨을"}, ${builder[2] === "fries" ? "감자튀김" : builder[2] === "vegetables" ? "채소" : "샐러드"}와 함께 주세요.`;
  }
  if (task === "request") {
    const items = [
      ["물", "water"],
      ["냅킨", "napkins"],
      ["포크", "fork"],
      ["접시", "plate"],
      ["케첩", "ketchup"],
      ["메뉴", "menu"],
    ];
    fields =
      select("무엇이 필요하세요?", items, 0) +
      select(
        "어떻게 하고 싶으세요?",
        [
          ["주세요", "need"],
          ["더 주세요", "more"],
          ["바꿔주세요", "replace"],
        ],
        1,
      );
    const count = ["fork", "plate", "menu"].includes(builder[0]);
    en =
      builder[1] === "replace"
        ? `Could I get ${count ? "a clean " + builder[0] : "fresh " + builder[0]}, please?`
        : `Could ${builder[0] === "water" ? "we" : "I"} get ${count ? (builder[1] === "more" ? "another " : "a ") : builder[1] === "more" ? "some more " : "some "}${builder[0]}, please?`;
    ko = `${items.find((v) => v[1] === builder[0])[0]}${builder[1] === "more" ? " 더 주세요." : builder[1] === "replace" ? " 새것으로 바꿔 주세요." : " 주세요."}`;
  }
  if (task === "problem") {
    const p = [
      [
        "주문한 음식과 달라요",
        "Excuse me, I think this is not what I ordered.",
      ],
      [
        "음식이 너무 차가워요",
        "Excuse me, my food is cold. Could you warm it up, please?",
      ],
      [
        "스테이크가 너무 익었어요",
        "Excuse me, my steak is overcooked. Could you help me, please?",
      ],
      [
        "음식이 아직 안 나왔어요",
        "Excuse me, my order hasn't arrived yet. Could you check on it, please?",
      ],
      ["이것을 주문하지 않았어요", "Excuse me, I didn't order this."],
    ];
    if (builder[0] === "wrong") builder[0] = p[0][1];
    fields = select("어떤 문제가 있나요?", p, 0);
    en = builder[0];
    ko = p.find((v) => v[1] === en)[0];
  }
  if (task === "diet") {
    const food = [
      ["견과류", "nuts"],
      ["유제품", "dairy"],
      ["글루텐", "gluten"],
      ["갑각류", "shellfish"],
    ];
    fields =
      select("어떤 재료인가요?", food, 0) +
      select(
        "왜 피하시나요?",
        [
          ["알레르기가 있어요", "allergy"],
          ["먹지 않아요", "avoid"],
        ],
        1,
      ) +
      select(
        "무엇을 물어볼까요?",
        [
          ["빼주실 수 있나요?", "remove"],
          ["이 음식에 들어 있나요?", "contains"],
          ["추천해 주실 수 있나요?", "recommend"],
        ],
        2,
      );
    en =
      builder[1] === "allergy"
        ? `I have a ${builder[0] === "nuts" ? "nut" : builder[0]} allergy.`
        : `I don't eat ${builder[0]}.`;
    ko = `${food.find((v) => v[1] === builder[0])[0]}${builder[1] === "allergy" ? " 알레르기가 있어요." : "를 먹지 않아요."}`;
    return `<div class="builder-fields">${fields}</div>${phrase(en, ko)}${phrase(builder[2] === "remove" ? `Could you make this without ${builder[0]}, please?` : builder[2] === "contains" ? `Does this contain ${builder[0]}?` : `Could you recommend something without ${builder[0]}, please?`, builder[2] === "remove" ? `${food.find((v) => v[1] === builder[0])[0]}를 빼고 만들어 주실 수 있나요?` : builder[2] === "contains" ? `이 음식에 ${food.find((v) => v[1] === builder[0])[0]}가 들어 있나요?` : `${food.find((v) => v[1] === builder[0])[0]}가 없는 음식을 추천해 주세요.`)}`;
  }
  return `<div class="builder-fields">${fields}</div><div id="result">${phrase(en, ko)}</div>`;
}
function detail() {
  mode = "location";
  const l = locations.find((l) => l.id === loc);
  shell(
    `<button class="back" data-action="home">← 다른 장소 선택하기</button><div class="location-title"><div class="small-art ${l.color}">${art(l.id)}</div><div><div class="eyebrow">${l.en.toUpperCase()}</div><h1>${l.ko}</h1><p>${l.desc}</p></div></div><div class="tabs"><button data-tab="say" class="${tab === "say" ? "selected" : ""}">하고 싶은 말</button><button data-tab="hear" class="${tab === "hear" ? "selected" : ""}">이런 말을 들어요</button>${simulations[loc] ? `<button data-tab="simulate" class="${tab === "simulate" ? "selected" : ""}">미리 경험해보기</button>` : ""}</div><section class="detail-content">${tab === "say" ? sayView() : tab === "hear" ? `<h2>${loc === "immigration" ? "👂 이런 질문도 들을 수 있어요" : "이런 말을 들을 수 있어요"}</h2><p class="intro">${loc === "immigration" ? "모든 질문을 받는 것은 아니에요. 익숙한 질문부터 천천히 들어보세요." : "영어를 듣고, 아래의 뜻을 확인해 보세요."}</p>${listening[loc].map(([en, ko]) => phrase(en, ko, "상대방의 말")).join("")}` : simulationView()}</section>`,
  );
}
function sayView() {
  if (
    [
      "airport",
      "immigration",
      "shopping",
      "souvenir",
      "hotel",
      "transport",
    ].includes(loc)
  )
    return extendedView();
  let html =
    '<h2>지금 무엇을 하고 싶으세요?</h2><p class="intro">한국어로 고르면, 자연스러운 영어가 완성돼요.</p>';
  if (loc === "emergency")
    html +=
      '<div class="emergency-note">위급한 상황에서는 미국 긴급전화 <a href="tel:911">911</a>로 전화하세요.</div>';
  if (loc === "emergency") return html + extendedView();
  if (loc === "restaurant") {
    html += `<div class="task-grid">${tasks.map(([id, ko]) => `<button data-task="${id}" class="${task === id ? "chosen" : ""}">${ko}</button>`).join("")}</div>`;
    if (["table", "order", "request", "problem", "diet"].includes(task))
      return html + builderView();
    if (task === "pay")
      return (
        html +
        phrases.restaurant
          .slice(0, 5)
          .map((p) => phrase(...p))
          .join("")
      );
    if (task === "box") return html + phrase(...phrases.restaurant[5]);
  }
  if (loc === "cafe") {
    html +=
      `<div class="builder-label"><span>✧</span> ${loc === "cafe" ? "나만의 주문 만들기" : loc === "immigration" ? "내 방문 이야기" : "원하는 물건 찾기"}</div>` +
      builderView();
  }
  return html + phrases[loc].map((p) => phrase(...p)).join("");
}
function simulationView() {
  const scenes = simulations[loc];
  if (step >= scenes.length)
    return `<div class="simulation complete"><span>✧</span><h2>이제 조금 더 익숙해졌나요?</h2><p>정답도, 점수도 없어요. 편안하게 다시 경험해 보세요.</p>${history.map((h) => phrase(h.en, h.ko)).join("")}<button class="primary" data-action="restart">다시 경험해보기 ↻</button></div>`;
  const [en, ko, choices] = scenes[step];
  return `<div class="simulation"><div class="sim-progress">미리 경험해보기 <span>${step + 1} / ${scenes.length}</span></div><p class="intro">상대방의 말을 듣고, 하고 싶은 답을 고르세요.</p><div class="speech-bubble"><span>상대방</span><h3>${en}</h3><p>${ko}</p><button data-speak="${escape(en)}">◖ 듣기</button></div>${response ? `${phrase(response.en, response.ko)}<button class="primary" data-action="next">${step === scenes.length - 1 ? "마무리하기" : "다음 대화"} →</button>` : `<h2>어떻게 답하고 싶으세요?</h2><div class="sim-choices">${choices.map(([k, e], i) => `<button data-answer="${i}">${k}<span>→</span></button>`).join("")}</div>`}</div>`;
}
function favorites() {
  mode = "favorites";
  shell(
    `<div class="favorites-title"><div class="eyebrow">YOUR LITTLE PHRASEBOOK</div><h1>내 표현 <span>♡</span></h1><p>여행에서 꺼내 쓰고 싶은 말들을 모아두세요.</p></div>${savedCardView()}${
      saved.length
        ? locations
            .filter((l) => saved.some((p) => p.loc === l.id))
            .map(
              (l) =>
                `<section class="favorite-group"><h2>${l.ko} <small>${l.en}</small></h2>${saved
                  .filter((p) => p.loc === l.id)
                  .map((p) => phrase(p.en, p.ko))
                  .join("")}</section>`,
            )
            .join("")
        : immigrationCard
          ? ""
          : `<div class="empty"><span>♡</span><h2>나만의 작은 표현집</h2><p>마음에 드는 표현의 ♡를 눌러 주세요.<br>필요할 때 여기에서 바로 꺼내 쓸 수 있어요.</p><button class="primary" data-action="home">표현 찾아보기 →</button></div>`
    }`,
  );
}
let toastTimer;
function toast(msg) {
  const t = document.querySelector("#toast");
  t.textContent = msg;
  t.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("visible"), 3500);
}
function speak(text, slow = false) {
  if (!("speechSynthesis" in window)) {
    toast(
      "이 브라우저는 음성 재생을 지원하지 않아요. 화면으로 보여주기를 이용해 주세요.",
    );
    return;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = slow ? 0.7 : 0.92;
  const voices = speechSynthesis.getVoices();
  u.voice = voices.find((v) => v.lang === "en-US") || null;
  u.onerror = (e) => {
    if (e.error !== "interrupted" && e.error !== "canceled")
      toast("음성을 재생하지 못했어요. 화면으로 보여주기를 이용해 주세요.");
  };
  speechSynthesis.speak(u);
  toast(slow ? "천천히 들려드릴게요" : "영어로 들려드릴게요");
}
let previousFocus;
function modal(content) {
  previousFocus = document.activeElement;
  document.querySelector("#modal").innerHTML =
    `<div class="overlay" role="dialog" aria-modal="true" aria-label="${content.startsWith("<p") ? "영어 문장 보여주기" : "사용 방법"}"><button class="close" data-action="close" aria-label="닫기">×</button>${content}</div>`;
  document.body.style.overflow = "hidden";
  document.querySelector(".close").focus();
}
function close() {
  document.querySelector("#modal").innerHTML = "";
  document.body.style.overflow = "";
  previousFocus?.focus();
}
app.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const d = b.dataset;
  if (d.question || d.navQuestion) {
    immigrationQuestion = d.question || d.navQuestion;
    practiceIndex = 0;
    detail();
    document
      .querySelector(
        immigrationQuestion === "summary"
          ? ".preparation-card"
          : ".question-heading",
      )
      ?.scrollIntoView({ block: "start" });
  }
  if (d.action === "practice-card") {
    const answers = immigrationAnswers(immigrationState);
    if (answers.length) {
      const i = practiceIndex % answers.length;
      practiceIndex = i + 1;
      detail();
      speak(answers[i].en);
      document
        .querySelector(".practicing")
        ?.scrollIntoView({ block: "center" });
    }
  }
  if (d.action === "save-card") {
    if (
      immigrationQuestions.some((q) => !q.generate(immigrationState).length)
    ) {
      toast("직접 입력을 마친 뒤 저장해 주세요.");
      return;
    }
    immigrationCard = { answers: immigrationAnswers(immigrationState) };
    const stored = persist("mamalingo-immigration-card", immigrationCard);
    detail();
    toast(
      stored
        ? "내 입국심사 카드를 저장했어요 ♡"
        : "이번 방문 동안만 카드를 보관해요. 저장 공간을 확인해 주세요.",
    );
  }
  if (d.action === "remove-card") {
    immigrationCard = null;
    try {
      localStorage.removeItem("mamalingo-immigration-card");
    } catch {}
    favorites();
  }
  if (d.action === "edit-card") {
    loc = "immigration";
    tab = "say";
    immigrationQuestion = "summary";
    detail();
    window.scrollTo(0, 0);
  }
  if (d.location) {
    loc = d.location;
    tab = "say";
    step = 0;
    response = null;
    history = [];
    setupTask(
      loc === "cafe"
        ? "cafe"
        : loc === "restaurant"
          ? "table"
          : loc === "immigration"
            ? "immigration"
            : ["shopping", "souvenir"].includes(loc)
              ? "shopping"
              : "",
    );
    detail();
    window.scrollTo(0, 0);
  }
  if (d.tab) {
    tab = d.tab;
    detail();
  }
  if (d.task) {
    setupTask(d.task);
    detail();
  }
  if (d.speak) speak(d.speak);
  if (d.slow) speak(d.slow, true);
  if (d.show) modal(`<p class="show-english" lang="en">${escape(d.show)}</p>`);
  if (d.save) {
    const idx = saved.findIndex((p) => p.en === d.save);
    if (idx >= 0) saved.splice(idx, 1);
    else
      saved.push({ en: d.save, ko: d.ko, loc: d.saveLoc || loc || "airport" });
    try {
      localStorage.setItem("mamalingo-favorites", JSON.stringify(saved));
    } catch {
      toast("저장 공간을 사용할 수 없어 이번 방문 동안만 보관해요.");
    }
    if (mode === "favorites") favorites();
    else detail();
  }
  if (d.answer !== undefined) {
    const [ko, en] = simulations[loc][step][2][Number(d.answer)];
    response = { en, ko };
    history.push(response);
    detail();
  }
  if (d.action === "home") {
    home();
    window.scrollTo(0, 0);
  }
  if (d.action === "favorites") {
    favorites();
    window.scrollTo(0, 0);
  }
  if (d.action === "close") close();
  if (d.action === "next") {
    step++;
    response = null;
    detail();
  }
  if (d.action === "restart") {
    step = 0;
    response = null;
    history = [];
    detail();
  }
  if (d.action === "help")
    modal(
      '<div class="help"><span>✧</span><h2>세 번의 선택, 편안한 여행.</h2><p>1. 지금 계신 장소를 골라 주세요.</p><p>2. 하고 싶은 말을 한국어로 선택하세요.</p><p>3. 영어로 들려주거나, 화면을 보여주세요.</p><hr><p>♡를 누르면 내 표현에 보관돼요.<br>마이크 없이, 부담 없이 이용하세요.</p><p class="intro">음성은 기기의 영어 음성을 사용해요. 기기 설정에 영어 음성이 설치되어 있어야 해요.</p></div>',
    );
});
app.addEventListener("change", (e) => {
  if (e.target.hasAttribute("data-airport-situation")) {
    airportSituation = e.target.value;
    detail();
    document.querySelector("[data-airport-situation]")?.focus();
  }
  if (e.target.dataset.rich) {
    const key = e.target.dataset.rich;
    extendedState()[key] = e.target.value;
    practiceIndex = 0;
    const scroll = window.scrollY;
    const stored =
      loc === "immigration"
        ? persist("mamalingo-immigration-draft", immigrationState)
        : true;
    detail();
    document
      .querySelector(`[data-rich="${key}"]`)
      ?.focus({ preventScroll: true });
    window.scrollTo(0, scroll);
    if (!stored) toast("답변은 이번 방문 동안만 보관돼요.");
  }
  if (e.target.dataset.field !== undefined) {
    const index = Number(e.target.dataset.field);
    builder[index] = e.target.value;
    detail();
    document.querySelector(`[data-field="${index}"]`)?.focus();
  }
  if (e.target.hasAttribute("data-name")) {
    builder[2] = e.target.value;
    detail();
    document.querySelector("[data-name]")?.focus();
  }
});
document.addEventListener("keydown", (e) => {
  const overlay = document.querySelector(".overlay");
  if (!overlay) return;
  if (e.key === "Escape") close();
  if (e.key === "Tab") {
    const buttons = [...overlay.querySelectorAll("button,a,input,select")];
    if (buttons.length === 1) {
      e.preventDefault();
      buttons[0].focus();
    }
  }
});
home();
