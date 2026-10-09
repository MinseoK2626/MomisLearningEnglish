// Rich builders extend the existing Korean-select → English → listen/show pattern.
const option = (ko, en) => ({ ko, en });
const field = (key, label, options, extra = {}) => ({
  key,
  label,
  options: options.map(([ko, en]) => option(ko, en)),
  ...extra,
});
const custom = (key, label, when, placeholder, type = "text") => ({
  key,
  label,
  type,
  when,
  placeholder,
});
export const regions = [
  ["버지니아", "Virginia"],
  ["뉴욕", "New York"],
  ["캘리포니아", "California"],
  ["직접 입력", "custom"],
];
const regionFields = (key = "region") => [
  field(key, "지역", regions),
  custom(
    `${key}Text`,
    "지역 이름 (영문)",
    (s) => s[key] === "custom",
    "예: Texas",
  ),
];
const region = (s, key = "region") =>
  s[key] === "custom" ? (s[`${key}Text`] || "").trim() : s[key];
const answer = (en, ko) => ({ en: en?.replace(/\.\.$/, "."), ko });
const pick = (fields, s, key) =>
  fields.find((f) => f.key === key)?.options?.find((o) => o.en === s[key])
    ?.ko || "";
export function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "";
  const d = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(+d) || d.toISOString().slice(0, 10) !== value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
const durationOptions = [
  ["1주", "one week"],
  ["2주", "two weeks"],
  ["3주", "three weeks"],
  ["한 달", "one month"],
  ["날짜 직접 선택", "custom"],
];
export const immigrationQuestions = [
  {
    id: "purpose",
    title: "방문 목적",
    icon: "♡",
    questions: [
      ["What is the purpose of your visit?", "방문 목적이 무엇인가요?"],
      ["What brings you to the United States?", "미국에 왜 오셨어요?"],
      ["Why are you visiting the U.S.?", "미국에 왜 방문하시나요?"],
    ],
    fields: [
      field("purpose", "방문 목적", [
        ["딸을 만나러 왔어요", "daughter"],
        ["가족을 만나러 왔어요", "family"],
        ["관광하러 왔어요", "vacation"],
        ["딸도 만나고 여행도 하려고 왔어요", "both"],
        ["친구를 만나러 왔어요", "friend"],
      ]),
    ],
    generate: (s) => [
      answer(
        {
          daughter: "I'm here to visit my daughter.",
          family: "I'm here to visit my family.",
          vacation: "I'm here for a vacation.",
          both: "I'm visiting my daughter and doing some sightseeing.",
          friend: "I'm here to visit a friend.",
        }[s.purpose],
        {
          daughter: "딸을 만나러 왔어요.",
          family: "가족을 만나러 왔어요.",
          vacation: "관광하러 왔어요.",
          both: "딸도 만나고 관광도 하려고 왔어요.",
          friend: "친구를 만나러 왔어요.",
        }[s.purpose],
      ),
    ],
  },
  {
    id: "stay",
    title: "체류 기간",
    icon: "◷",
    questions: [
      ["How long will you be staying?", "얼마나 머무르실 건가요?"],
      [
        "How long are you staying in the U.S.?",
        "미국에서 얼마나 머무르시나요?",
      ],
    ],
    fields: [
      field("duration", "체류 기간", durationOptions),
      custom(
        "arrival",
        "도착 날짜",
        (s) => s.duration === "custom",
        "",
        "date",
      ),
      custom(
        "departure",
        "출국 날짜",
        (s) => s.duration === "custom",
        "",
        "date",
      ),
    ],
    generate: (s) => {
      if (s.duration !== "custom")
        return [
          answer(
            `I'll be staying for ${s.duration}.`,
            `${pick(immigrationQuestions[1].fields, s, "duration")} 동안 머물 거예요.`,
          ),
        ];
      if (
        !formatDate(s.arrival) ||
        !formatDate(s.departure) ||
        s.departure <= s.arrival
      )
        return [];
      const days = Math.round(
        (new Date(s.departure) - new Date(s.arrival)) / 86400000,
      );
      return [
        answer(
          `I'll be staying for ${days} days, until ${formatDate(s.departure)}.`,
          `${s.departure}까지 ${days}일 동안 머물 거예요.`,
        ),
      ];
    },
  },
  {
    id: "accommodation",
    title: "머무르는 곳",
    icon: "⌂",
    questions: [["Where will you be staying?", "어디에서 머무르시나요?"]],
    fields: [
      field("accommodation", "숙소", [
        ["딸 집", "daughter"],
        ["아들 집", "son"],
        ["가족 집", "family"],
        ["호텔", "hotel"],
        ["친구 집", "friend"],
      ]),
      ...regionFields(),
    ],
    generate: (s) =>
      region(s)
        ? [
            answer(
              `I'll be staying ${s.accommodation === "hotel" ? "at a hotel" : `with ${s.accommodation === "friend" ? "a friend" : "my " + s.accommodation}`} in ${region(s)}.`,
              `${region(s)}의 ${pick(immigrationQuestions[2].fields, s, "accommodation")}에서 머물 거예요.`,
            ),
          ]
        : [],
  },
  {
    id: "visitor",
    title: "만나는 사람",
    icon: "♧",
    questions: [["Who are you visiting?", "누구를 만나러 오셨나요?"]],
    fields: [
      field("visitor", "누구를 만나러 왔나요?", [
        ["딸", "daughter"],
        ["아들", "son"],
        ["가족", "family"],
        ["친구", "friend"],
      ]),
    ],
    generate: (s) => [
      answer(
        `I'm visiting ${s.visitor === "friend" ? "a friend" : "my " + s.visitor}.`,
        `${{ daughter: "딸을", son: "아들을", family: "가족을", friend: "친구를" }[s.visitor]} 만나러 왔어요.`,
      ),
    ],
  },
  {
    id: "companion",
    title: "여행 동행",
    icon: "♧",
    questions: [["Are you traveling alone?", "혼자 여행하시나요?"]],
    fields: [
      field("companion", "누구와 함께 오셨나요?", [
        ["네, 혼자 왔어요", "alone"],
        ["남편과 함께 왔어요", "husband"],
        ["가족과 함께 왔어요", "family"],
        ["친구와 함께 왔어요", "friend"],
      ]),
    ],
    generate: (s) => [
      answer(
        s.companion === "alone"
          ? "Yes, I'm traveling alone."
          : `I'm traveling with ${s.companion === "friend" ? "a friend" : "my " + s.companion}.`,
        {
          alone: "네, 혼자 여행하고 있어요.",
          husband: "남편과 함께 여행하고 있어요.",
          family: "가족과 함께 여행하고 있어요.",
          friend: "친구와 함께 여행하고 있어요.",
        }[s.companion],
      ),
    ],
  },
  {
    id: "return",
    title: "돌아가는 비행기",
    icon: "✈",
    questions: [
      ["Do you have a return ticket?", "돌아가는 비행기 표가 있나요?"],
      ["When are you flying back?", "언제 돌아가시나요?"],
    ],
    fields: [
      field("return", "귀국편", [
        ["네, 있어요", "yes"],
        ["1주 후", "one week"],
        ["2주 후", "two weeks"],
        ["3주 후", "three weeks"],
        ["날짜 선택", "custom"],
        ["아직 없어요", "no"],
      ]),
      custom(
        "returnDate",
        "귀국 날짜",
        (s) => s.return === "custom",
        "",
        "date",
      ),
    ],
    generate: (s) =>
      s.return === "custom"
        ? formatDate(s.returnDate)
          ? [
              answer(
                `Yes, my return flight is on ${formatDate(s.returnDate)}.`,
                `네, 귀국편은 ${s.returnDate}이에요.`,
              ),
            ]
          : []
        : [
            answer(
              s.return === "yes"
                ? "Yes, I have a return ticket."
                : s.return === "no"
                  ? "No, I don't have a return ticket yet."
                  : `Yes, my return flight is in ${s.return}.`,
              s.return === "yes"
                ? "네, 돌아가는 비행기 표가 있어요."
                : s.return === "no"
                  ? "아직 귀국편 표가 없어요."
                  : `네, 귀국편은 ${pick(immigrationQuestions[5].fields, s, "return")}예요.`,
            ),
          ],
  },
  {
    id: "previous",
    title: "이전 방문",
    icon: "✧",
    questions: [
      [
        "Have you been to the United States before?",
        "전에 미국에 와보신 적 있나요?",
      ],
    ],
    fields: [
      field("previous", "미국에 전에 와본 적 있나요?", [
        ["네", "yes"],
        ["아니요, 처음이에요", "no"],
        ["여러 번 왔어요", "many"],
      ]),
    ],
    generate: (s) => [
      answer(
        {
          yes: "Yes, I've been here before.",
          no: "No, this is my first time.",
          many: "Yes, I've visited several times.",
        }[s.previous],
        {
          yes: "네, 전에 와본 적 있어요.",
          no: "아니요, 이번이 처음이에요.",
          many: "네, 여러 번 방문했어요.",
        }[s.previous],
      ),
    ],
  },
  {
    id: "occupation",
    title: "나의 직업",
    icon: "✿",
    questions: [["What do you do?", "어떤 일을 하시나요?"]],
    fields: [
      field("occupation", "직업", [
        ["주부예요", "homemaker"],
        ["회사원이에요", "office worker"],
        ["자영업이에요", "self-employed"],
        ["은퇴했어요", "retired"],
        ["기타", "custom"],
      ]),
      field(
        "otherJob",
        "어떤 일을 하시나요?",
        [
          ["선생님", "teacher"],
          ["간호사", "nurse"],
          ["농업", "farmer"],
          ["현재 일하지 않아요", "not working"],
        ],
        { when: (s) => s.occupation === "custom" },
      ),
    ],
    generate: (s) => {
      const job = s.occupation === "custom" ? s.otherJob : s.occupation;
      return [
        answer(
          {
            homemaker: "I'm a homemaker.",
            "office worker": "I'm an office worker.",
            "self-employed": "I'm self-employed.",
            retired: "I'm retired.",
            teacher: "I'm a teacher.",
            nurse: "I'm a nurse.",
            farmer: "I'm a farmer.",
            "not working": "I'm not working at the moment.",
          }[job],
          {
            homemaker: "주부예요.",
            "office worker": "회사원이에요.",
            "self-employed": "자영업을 하고 있어요.",
            retired: "은퇴했어요.",
            teacher: "선생님이에요.",
            nurse: "간호사예요.",
            farmer: "농업에 종사해요.",
            "not working": "현재 일하지 않아요.",
          }[job],
        ),
      ];
    },
  },
  {
    id: "daughter",
    title: "딸에 대한 질문",
    icon: "♡",
    questions: [
      ["What does your daughter do?", "따님은 어떤 일을 하나요?"],
      ["Where does your daughter live?", "따님은 어디에 사나요?"],
      [
        "How long has your daughter been in the United States?",
        "따님은 미국에 얼마나 있었나요?",
      ],
    ],
    fields: [
      field("daughterJob", "딸은 무엇을 하나요?", [
        ["대학생이에요", "university student"],
        ["대학원생이에요", "graduate student"],
        ["직장인이에요", "working"],
      ]),
      ...regionFields("daughterRegion"),
      field("daughterTime", "미국에 얼마나 있었나요?", [
        ["6개월", "six months"],
        ["1년", "one year"],
        ["2년", "two years"],
        ["3년", "three years"],
        ["5년", "five years"],
        ["잘 모르겠어요", "unsure"],
      ]),
    ],
    generate: (s) => {
      const r = region(s, "daughterRegion");
      if (!r) return [];
      return [
        answer(
          s.daughterJob === "working"
            ? `My daughter works in ${r}.`
            : `My daughter is a ${s.daughterJob} in ${r}.`,
          `딸은 ${r}에서 ${s.daughterJob === "working" ? "직장을 다니고" : s.daughterJob === "graduate student" ? "대학원에 다니고" : "대학교에 다니고"} 있어요.`,
        ),
        answer(`My daughter lives in ${r}.`, `딸은 ${r}에 살고 있어요.`),
        answer(
          s.daughterTime === "unsure"
            ? "I'm not sure exactly how long she's been here."
            : `My daughter has been in the United States for ${s.daughterTime}.`,
          s.daughterTime === "unsure"
            ? "정확히 얼마나 있었는지는 잘 모르겠어요."
            : `딸은 미국에 ${pick(immigrationQuestions[8].fields, s, "daughterTime")} 있었어요.`,
        ),
      ];
    },
  },
  {
    id: "plans",
    title: "미국에서의 계획",
    icon: "✧",
    questions: [
      [
        "What are your plans while you’re here?",
        "미국에 있는 동안 무엇을 하실 건가요?",
      ],
    ],
    fields: [
      field("plans", "미국에서 무엇을 할 예정인가요?", [
        ["딸과 시간을 보낼 거예요", "daughter"],
        ["관광할 거예요", "sightseeing"],
        ["여행할 거예요", "travel"],
        ["가족을 방문할 거예요", "family"],
        ["쇼핑도 하고 관광도 할 거예요", "shopping"],
      ]),
    ],
    generate: (s) => [
      answer(
        {
          daughter: "I'll spend time with my daughter.",
          sightseeing: "I'll do some sightseeing.",
          travel: "I'll travel around the United States.",
          family: "I'll visit my family.",
          shopping: "I'll do some shopping and sightseeing.",
        }[s.plans],
        {
          daughter: "딸과 시간을 보낼 거예요.",
          sightseeing: "관광할 거예요.",
          travel: "미국을 여행할 거예요.",
          family: "가족을 방문할 거예요.",
          shopping: "쇼핑도 하고 관광도 할 거예요.",
        }[s.plans],
      ),
    ],
  },
];
export const immigrationDefaults = {
  purpose: "daughter",
  duration: "two weeks",
  accommodation: "daughter",
  region: "Virginia",
  visitor: "daughter",
  companion: "alone",
  return: "yes",
  previous: "no",
  occupation: "homemaker",
  otherJob: "teacher",
  daughterJob: "university student",
  daughterRegion: "Virginia",
  daughterTime: "two years",
  plans: "daughter",
  arrival: "",
  departure: "",
  returnDate: "",
  regionText: "",
  daughterRegionText: "",
};
export function immigrationAnswers(s) {
  return immigrationQuestions.flatMap((q) =>
    q.generate(s).map((p) => ({ ...p, title: q.title })),
  );
}
const cities = [
  ["뉴욕", "New York"],
  ["워싱턴 D.C.", "Washington, D.C."],
  ["샬러츠빌", "Charlottesville"],
  ["직접 입력", "custom"],
];
const cityFields = [
  field("city", "어디로 가시나요?", cities),
  custom(
    "cityText",
    "도착 도시 (영문)",
    (s) => s.city === "custom",
    "예: Boston",
  ),
];
const city = (s) => (s.city === "custom" ? (s.cityText || "").trim() : s.city);
const bagFields = [
  field("bagColor", "가방 특징", [
    ["검은색 캐리어", "black"],
    ["회색 캐리어", "gray"],
    ["빨간색 캐리어", "red"],
    ["파란색 캐리어", "blue"],
  ]),
  field("bagSize", "크기", [
    ["작은 가방", "small"],
    ["중간 크기", "medium-sized"],
    ["큰 가방", "large"],
  ]),
];
const bagDescription = (s) =>
  answer(
    `It's a ${s.bagSize} ${s.bagColor} suitcase.`,
    `${{ small: "작은", "medium-sized": "중간 크기의", large: "큰" }[s.bagSize]} ${{ black: "검은색", gray: "회색", red: "빨간색", blue: "파란색" }[s.bagColor]} 캐리어예요.`,
  );
export const airportSituations = [
  {
    id: "checkin",
    title: "체크인하기",
    fields: [
      ...cityFields,
      field("seat", "좌석", [
        ["상관없어요", "any"],
        ["창가", "window"],
        ["통로", "aisle"],
      ]),
      field("bags", "수하물", [
        ["부칠 짐 없음", "0"],
        ["가방 1개", "1"],
        ["가방 2개", "2"],
      ]),
    ],
    generate: (s) =>
      city(s)
        ? [
            answer(
              `Hi, I'd like to check in for my flight to ${city(s)}.`,
              `${city(s)}행 비행기 체크인하려고 해요.`,
            ),
            answer(
              s.seat === "any"
                ? "Any seat is fine, thank you."
                : `Could I have ${s.seat === "aisle" ? "an aisle" : "a window"} seat, please?`,
              s.seat === "any"
                ? "좌석은 상관없어요."
                : `${s.seat === "aisle" ? "통로" : "창가"} 좌석 부탁드려요.`,
            ),
            answer(
              s.bags === "0"
                ? "I don't have any bags to check."
                : s.bags === "1"
                  ? "I'd like to check this bag."
                  : "I'd like to check these two bags.",
              s.bags === "0"
                ? "부칠 짐은 없어요."
                : `가방 ${s.bags}개를 부치고 싶어요.`,
            ),
          ]
        : [],
  },
  {
    id: "baggage",
    title: "수하물 부치기",
    fields: [
      field("bags", "몇 개를 부치시나요?", [
        ["가방 1개", "1"],
        ["가방 2개", "2"],
      ]),
      field("bagRequest", "무엇을 알고 싶으세요?", [
        ["짐을 부치고 싶어요", "check"],
        ["무게 제한", "weight"],
        ["추가 요금", "fee"],
        ["최종 목적지까지 가는지", "destination"],
      ]),
      ...cityFields,
    ],
    generate: (s) => {
      if (!city(s)) return [];
      return [
        answer(
          s.bags === "1"
            ? "I'd like to check one bag."
            : "I'd like to check two bags.",
          `가방 ${s.bags}개를 부치고 싶어요.`,
        ),
        answer(
          {
            check: "Where can I check my bags?",
            weight: "What is the baggage weight limit?",
            fee: "Is there an extra fee for my bags?",
            destination: `Will my bags go all the way to ${city(s)}?`,
          }[s.bagRequest],
          {
            check: "어디에서 짐을 부칠 수 있나요?",
            weight: "수하물 무게 제한이 얼마인가요?",
            fee: "제 짐에 추가 요금이 있나요?",
            destination: `짐이 ${city(s)}까지 바로 가나요?`,
          }[s.bagRequest],
        ),
      ];
    },
  },
  {
    id: "security",
    title: "보안검색",
    fields: [
      field("securityItem", "어떤 물건인가요?", [
        ["신발", "shoes"],
        ["노트북", "laptop"],
        ["액체", "liquids"],
        ["약", "medicine"],
      ]),
      field("securityAction", "무엇을 물어볼까요?", [
        ["꺼내야 하는지", "remove"],
        ["가져가도 되는지", "allowed"],
        ["따로 보여드릴지", "show"],
      ]),
    ],
    generate: (s) => [
      answer(
        s.securityAction === "remove"
          ? s.securityItem === "shoes"
            ? "Do I need to take off my shoes?"
            : `Do I need to take my ${s.securityItem} out of my bag?`
          : s.securityAction === "allowed"
            ? `Can I take my ${s.securityItem} through security?`
            : `Would you like to see my ${s.securityItem} separately?`,
        `${{ shoes: "신발", laptop: "노트북", liquids: "액체", medicine: "약" }[s.securityItem]}${s.securityAction === "remove" ? "을 벗거나 가방에서 꺼내야 하나요?" : s.securityAction === "allowed" ? "을 보안검색대에 가져가도 되나요?" : "을 따로 보여드릴까요?"}`,
      ),
    ],
  },
  {
    id: "gate",
    title: "게이트 찾기",
    fields: [
      field("find", "무엇을 찾고 있나요?", [
        ["제 게이트", "gate"],
        ["출국장", "departures area"],
        ["보안검색대", "security checkpoint"],
        ["화장실", "restroom"],
        ["수하물 찾는 곳", "baggage claim"],
        ["환승 게이트", "connecting gate"],
      ]),
      custom(
        "gate",
        "탑승구 번호 (알고 있을 때)",
        (s) => ["gate", "connecting gate"].includes(s.find),
        "예: B12",
      ),
      field("direction", "무엇을 알고 싶나요?", [
        ["어디인지", "where"],
        ["얼마나 걸리는지", "time"],
        ["걸어갈 수 있는지", "walk"],
        ["셔틀을 타야 하는지", "shuttle"],
      ]),
    ],
    generate: (s) => {
      const dest = ["gate", "connecting gate"].includes(s.find)
        ? s.gate?.trim()
          ? `Gate ${s.gate.trim()}`
          : s.find === "gate"
            ? "my gate"
            : "my connecting gate"
        : `the ${s.find}`;
      return [
        answer(
          {
            where: `Excuse me, where is ${dest}?`,
            time: `How long does it take to get to ${dest}?`,
            walk: `Can I walk to ${dest}?`,
            shuttle: `Do I need to take a shuttle to get to ${dest}?`,
          }[s.direction],
          `${pick(airportSituations[3].fields, s, "find")}${s.gate && ["gate", "connecting gate"].includes(s.find) ? ` ${s.gate}` : ""}${{ where: "은 어디인가요?", time: "까지 얼마나 걸리나요?", walk: "까지 걸어갈 수 있나요?", shuttle: "까지 셔틀을 타야 하나요?" }[s.direction]}`,
        ),
      ];
    },
  },
  {
    id: "boarding",
    title: "비행기 탑승",
    fields: [
      field("boardingQuestion", "무엇을 물어볼까요?", [
        ["탑승 시작 시간", "time"],
        ["탑승 그룹", "group"],
        ["이 비행기가 맞는지", "flight"],
      ]),
      ...cityFields,
    ],
    generate: (s) =>
      city(s)
        ? [
            answer(
              {
                time: `What time does boarding start for the flight to ${city(s)}?`,
                group: "Which boarding group am I in?",
                flight: `Is this the flight to ${city(s)}?`,
              }[s.boardingQuestion],
              {
                time: `${city(s)}행 비행기는 몇 시에 탑승하나요?`,
                group: "제 탑승 그룹은 무엇인가요?",
                flight: `이 비행기가 ${city(s)}행이 맞나요?`,
              }[s.boardingQuestion],
            ),
          ]
        : [],
  },
  {
    id: "cabin",
    title: "기내에서",
    fields: [
      field("cabinItem", "무엇이 필요하세요?", [
        ["물", "water"],
        ["차", "tea"],
        ["커피", "coffee"],
        ["담요", "blanket"],
        ["베개", "pillow"],
      ]),
      field("cabinAction", "어떻게 부탁할까요?", [
        ["주세요", "need"],
        ["하나 더 주세요", "more"],
      ]),
    ],
    generate: (s) => {
      const count = ["blanket", "pillow"].includes(s.cabinItem);
      return [
        answer(
          `Could I get ${count ? (s.cabinAction === "more" ? "another " : "a ") : s.cabinAction === "more" ? "some more " : "some "}${s.cabinItem}, please?`,
          `${pick(airportSituations[5].fields, s, "cabinItem")}${s.cabinAction === "more" ? " 더" : ""} 주세요.`,
        ),
      ];
    },
  },
  {
    id: "transfer",
    title: "환승하기",
    fields: [
      ...cityFields,
      field("transferQuestion", "무엇이 궁금하세요?", [
        ["환승 게이트 위치", "gate"],
        ["짐을 다시 부쳐야 하는지", "bags"],
        ["다시 보안검색을 받는지", "security"],
        ["환승 시간이 충분한지", "time"],
      ]),
    ],
    generate: (s) =>
      city(s)
        ? [
            answer(
              `I have a connecting flight to ${city(s)}.`,
              `${city(s)}행 비행기로 환승해요.`,
            ),
            answer(
              {
                gate: "Where is the gate for my connecting flight?",
                bags: "Do I need to collect and recheck my bags?",
                security: "Do I need to go through security again?",
                time: "Do I have enough time to make my connection?",
              }[s.transferQuestion],
              {
                gate: "환승하는 비행기의 게이트가 어디인가요?",
                bags: "짐을 찾아서 다시 부쳐야 하나요?",
                security: "보안검색을 다시 받아야 하나요?",
                time: "환승할 시간이 충분한가요?",
              }[s.transferQuestion],
            ),
          ]
        : [],
  },
  {
    id: "claim",
    title: "수하물 찾기",
    fields: [
      ...cityFields.map((f) => ({
        ...f,
        label: f.key === "city" ? "어디에서 출발하셨나요?" : "출발 도시 (영문)",
      })),
      field("claimQuestion", "무엇을 찾으세요?", [
        ["수하물 벨트", "carousel"],
        ["수하물 찾는 곳", "where"],
        ["수하물 카트", "cart"],
      ]),
    ],
    generate: (s) =>
      city(s)
        ? [
            answer(
              {
                carousel: `Which carousel is for the flight from ${city(s)}?`,
                where: "Where is the baggage claim?",
                cart: "Where can I get a luggage cart?",
              }[s.claimQuestion],
              {
                carousel: `${city(s)}에서 온 비행기의 수하물 벨트는 어디인가요?`,
                where: "수하물 찾는 곳이 어디인가요?",
                cart: "수하물 카트는 어디에 있나요?",
              }[s.claimQuestion],
            ),
          ]
        : [],
  },
  {
    id: "lost",
    title: "짐이 안 나왔어요",
    fields: [
      field("bagProblem", "어떤 문제가 있나요?", [
        ["제 가방이 안 나왔어요", "late"],
        ["가방이 파손됐어요", "damaged"],
        ["다른 사람 가방인 것 같아요", "other"],
        ["제 가방을 찾을 수 없어요", "missing"],
        ["짐이 다른 공항으로 간 것 같아요", "airport"],
      ]),
      ...bagFields,
    ],
    generate: (s) => [
      answer(
        {
          late: "My suitcase hasn't come out yet.",
          damaged: "My suitcase was damaged.",
          other: "I think this is someone else's suitcase.",
          missing: "I can't find my checked bag.",
          airport: "I think my bag was sent to a different airport.",
        }[s.bagProblem],
        {
          late: "제 가방이 아직 나오지 않았어요.",
          damaged: "제 캐리어가 파손됐어요.",
          other: "다른 사람의 가방인 것 같아요.",
          missing: "제가 부친 가방을 찾을 수 없어요.",
          airport: "제 짐이 다른 공항으로 간 것 같아요.",
        }[s.bagProblem],
      ),
      bagDescription(s),
    ],
  },
  {
    id: "help",
    title: "공항 직원에게 도움 요청",
    fields: [
      field("airportHelp", "어떤 도움이 필요하세요?", [
        ["길 안내", "directions"],
        ["휠체어", "wheelchair"],
        ["항공사 카운터 찾기", "counter"],
        ["전화 걸기", "call"],
      ]),
      field("language", "말씀 속도", [
        ["천천히 말씀해 주세요", "slow"],
        ["한국어 가능한 직원", "korean"],
      ]),
    ],
    generate: (s) => [
      answer(
        {
          directions: "Could you help me find my way, please?",
          wheelchair: "Could I get wheelchair assistance, please?",
          counter: "Could you help me find my airline’s counter, please?",
          call: "Could you help me make a phone call, please?",
        }[s.airportHelp],
        {
          directions: "길을 찾는 것을 도와주세요.",
          wheelchair: "휠체어 도움을 받을 수 있을까요?",
          counter: "항공사 카운터 찾는 것을 도와주세요.",
          call: "전화 거는 것을 도와주세요.",
        }[s.airportHelp],
      ),
      answer(
        s.language === "slow"
          ? "I don't speak English well. Could you speak slowly, please?"
          : "Is there someone who speaks Korean?",
        s.language === "slow"
          ? "영어를 잘 못해요. 천천히 말씀해 주세요."
          : "한국어를 하는 직원이 있나요?",
      ),
    ],
  },
];
export const airportDefaults = {
  city: "Washington, D.C.",
  cityText: "",
  seat: "any",
  bags: "1",
  bagRequest: "check",
  securityItem: "shoes",
  securityAction: "remove",
  find: "gate",
  gate: "",
  direction: "where",
  boardingQuestion: "time",
  cabinItem: "water",
  cabinAction: "need",
  transferQuestion: "gate",
  claimQuestion: "carousel",
  bagProblem: "late",
  bagColor: "black",
  bagSize: "large",
  airportHelp: "directions",
  language: "slow",
};
export const extraBuilders = {
  shopping: {
    title: "마음에 드는 물건 찾기",
    fields: [
      field("item", "무엇을 찾고 있나요?", [
        ["UVA 티셔츠", "UVA T-shirt"],
        ["티셔츠", "T-shirt"],
        ["모자", "hat"],
      ]),
      field("size", "사이즈", [
        ["스몰", "small"],
        ["미디엄", "medium"],
        ["라지", "large"],
      ]),
      field("gift", "누구를 위한 건가요?", [
        ["선물", "gift"],
        ["제가 쓸 거예요", "myself"],
      ]),
      field("color", "색상", [
        ["색상 상관없어요", "any"],
        ["네이비", "navy"],
        ["흰색", "white"],
        ["검은색", "black"],
        ["분홍색", "pink"],
      ]),
      field(
        "recipient",
        "누구 선물인가요?",
        [
          ["딸", "daughter"],
          ["아들", "son"],
          ["친구", "friend"],
          ["가족", "family"],
        ],
        { when: (s) => s.gift === "gift" },
      ),
    ],
    defaults: {
      item: "UVA T-shirt",
      size: "medium",
      gift: "gift",
      color: "any",
      recipient: "daughter",
    },
    generate: (s) => [
      answer(
        `I'm looking for a ${s.item}${s.gift === "gift" ? ` as a gift for ${s.recipient === "friend" ? "a friend" : "my " + s.recipient}` : ""}.`,
        `${s.gift === "gift" ? `${{ daughter: "딸", son: "아들", friend: "친구", family: "가족" }[s.recipient]}에게 선물할 ` : ""}${s.item === "hat" ? "모자" : s.item === "T-shirt" ? "티셔츠" : "UVA 티셔츠"}를 찾고 있어요.`,
      ),
      answer(
        `Do you have this ${s.item} in a ${s.size}${s.color === "any" ? "" : `, in ${s.color}`}?`,
        `이 ${s.item === "hat" ? "모자" : "티셔츠"} ${s.size === "small" ? "스몰" : s.size === "medium" ? "미디엄" : "라지"}${s.color === "any" ? "" : ` 사이즈에 ${{ navy: "네이비", white: "흰색", black: "검은색", pink: "분홍색" }[s.color]}`} 있나요?`,
      ),
    ],
  },
  hotel: {
    title: "편안한 머무름을 위한 부탁",
    fields: [
      field("hotelTask", "무엇을 하고 싶으세요?", [
        ["체크인하기", "checkin"],
        ["직원에게 부탁하기", "request"],
        ["문제 알리기", "problem"],
      ]),
      custom(
        "hotelName",
        "예약한 이름 (영문)",
        (s) => s.hotelTask === "checkin",
        "예: Kim",
      ),
      field(
        "nights",
        "몇 박 머무르시나요?",
        [
          ["1박", "one night"],
          ["2박", "two nights"],
          ["3박", "three nights"],
          ["일주일", "one week"],
        ],
        { when: (s) => s.hotelTask === "checkin" },
      ),
      field(
        "hotelItem",
        "필요한 것",
        [
          ["수건", "towels"],
          ["베개", "pillows"],
          ["담요", "blankets"],
        ],
        { when: (s) => s.hotelTask === "request" },
      ),
      field(
        "quantity",
        "몇 개 필요하세요?",
        [
          ["1개", "one"],
          ["2개", "two"],
          ["3개", "three"],
        ],
        { when: (s) => s.hotelTask === "request" },
      ),
      field(
        "hotelProblem",
        "어떤 문제가 있나요?",
        [
          ["와이파이가 안 돼요", "Wi-Fi"],
          ["에어컨이 안 돼요", "air conditioning"],
          ["객실 키가 안 돼요", "room key"],
        ],
        { when: (s) => s.hotelTask === "problem" },
      ),
    ],
    defaults: {
      hotelTask: "checkin",
      hotelName: "",
      nights: "two nights",
      hotelItem: "towels",
      quantity: "two",
      hotelProblem: "Wi-Fi",
    },
    generate: (s) =>
      s.hotelTask === "checkin"
        ? [
            answer(
              `Hi, I'd like to check in${s.hotelName.trim() ? `. My reservation is under ${s.hotelName.trim()}` : ""}.`,
              `체크인하고 싶어요.${s.hotelName.trim() ? ` ${s.hotelName.trim()} 이름으로 예약했어요.` : ""}`,
            ),
            answer(
              `I'll be staying for ${s.nights}.`,
              `${{ "one night": "1박", "two nights": "2박", "three nights": "3박", "one week": "일주일" }[s.nights]} 머무를 거예요.`,
            ),
          ]
        : s.hotelTask === "request"
          ? [
              answer(
                `Could I get ${s.quantity} extra ${s.quantity === "one" ? s.hotelItem.slice(0, -1) : s.hotelItem}, please?`,
                `${{ towels: "수건", pillows: "베개", blankets: "담요" }[s.hotelItem]} ${s.quantity === "one" ? 1 : s.quantity === "two" ? 2 : 3}개 더 주세요.`,
              ),
            ]
          : [
              answer(
                `My ${s.hotelProblem} isn't working. Could you help me, please?`,
                `${{ "Wi-Fi": "와이파이", "air conditioning": "에어컨", "room key": "객실 키" }[s.hotelProblem]}가 작동하지 않아요. 도와주실 수 있나요?`,
              ),
            ],
  },
  transport: {
    title: "목적지까지 편안하게",
    fields: [
      field("destination", "어디로 가시나요?", [
        ["이 주소", "this address"],
        ["공항", "the airport"],
        ["호텔", "my hotel"],
        ["기차역", "the train station"],
      ]),
      custom(
        "address",
        "주소 (알고 있을 때)",
        (s) => s.destination === "this address",
        "주소를 붙여 넣으세요",
      ),
      field("rideRequest", "함께 부탁할 말", [
        ["얼마나 걸리는지", "time"],
        ["여기서 세워 주세요", "stop"],
        ["짐을 도와주세요", "bags"],
        ["에어컨을 켜주세요", "air"],
      ]),
    ],
    defaults: { destination: "this address", address: "", rideRequest: "time" },
    generate: (s) => [
      answer(
        `Could you take me to ${s.destination === "this address" && s.address.trim() ? s.address.trim() : s.destination}, please?`,
        `${s.destination === "this address" ? s.address || "이 주소" : { "the airport": "공항", "my hotel": "제 호텔", "the train station": "기차역" }[s.destination]}로 가 주세요.`,
      ),
      answer(
        {
          time: "How long will it take to get there?",
          stop: "Could you stop here, please?",
          bags: "Could you help me with my bags, please?",
          air: "Could you turn on the air conditioning, please?",
        }[s.rideRequest],
        {
          time: "도착까지 얼마나 걸리나요?",
          stop: "여기에서 세워 주세요.",
          bags: "짐을 옮기는 것을 도와주세요.",
          air: "에어컨을 켜주세요.",
        }[s.rideRequest],
      ),
    ],
  },
  emergency: {
    title: "필요한 도움을 전하세요",
    fields: [
      field("helpType", "어떤 도움이 필요하세요?", [
        ["몸이 아파요", "doctor"],
        ["길을 잃었어요", "lost"],
        ["휴대폰을 잃어버렸어요", "phone"],
      ]),
      field("helpAction", "어떻게 도와드릴까요?", [
        ["도움을 요청할게요", "help"],
        ["딸에게 전화하고 싶어요", "daughter"],
        ["한국어 통역이 필요해요", "interpreter"],
      ]),
    ],
    defaults: { helpType: "doctor", helpAction: "help" },
    generate: (s) => [
      answer(
        {
          doctor: "I don't feel well. I need a doctor.",
          lost: "I'm lost.",
          phone: "I've lost my phone.",
        }[s.helpType],
        {
          doctor: "몸이 좋지 않아요. 의사가 필요해요.",
          lost: "길을 잃었어요.",
          phone: "휴대폰을 잃어버렸어요.",
        }[s.helpType],
      ),
      answer(
        {
          help: "Could you help me, please?",
          daughter: "Could you help me call my daughter, please?",
          interpreter: "I need a Korean interpreter, please.",
        }[s.helpAction],
        {
          help: "도와주실 수 있나요?",
          daughter: "딸에게 전화하는 것을 도와주세요.",
          interpreter: "한국어 통역이 필요해요.",
        }[s.helpAction],
      ),
    ],
  },
};
extraBuilders.souvenir = {
  ...extraBuilders.shopping,
  title: "소중한 사람에게 줄 선물",
};
