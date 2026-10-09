export const locations = [
{id:'airport',ko:'공항',en:'Airport',icon:'✈',color:'blue',desc:'여행의 시작도 편안하게'},
{id:'immigration',ko:'입국심사',en:'Immigration',icon:'▣',color:'purple',desc:'차분하게, 하나씩 대답해요'},
{id:'cafe',ko:'카페',en:'Café',icon:'☕',color:'peach',desc:'내 취향에 꼭 맞는 한 잔'},
{id:'restaurant',ko:'식당',en:'Restaurant',icon:'♧',color:'green',desc:'주문부터 계산까지 맛있게'},
{id:'shopping',ko:'쇼핑',en:'Shopping',icon:'♧',color:'pink',desc:'마음에 드는 것을 찾을 때'},
{id:'souvenir',ko:'기념품샵',en:'Souvenir shop',icon:'🎁',color:'yellow',desc:'소중한 사람을 위한 선물'},
{id:'hotel',ko:'호텔',en:'Hotel',icon:'⌂',color:'blue',desc:'내 집처럼 편안한 머무름'},
{id:'transport',ko:'택시 / Uber',en:'Transportation',icon:'🚕',color:'yellow',desc:'어디든 안심하고 이동해요'},
{id:'emergency',ko:'도움이 필요해요',en:'Help & emergency',icon:'♡',color:'pink',desc:'필요한 도움을 바로 전해요'}];
export const phrases = {
airport:[['Where is the baggage claim?','수하물 찾는 곳이 어디인가요?'],['Where is the restroom?','화장실이 어디인가요?'],['Where is the gate for this flight?','이 비행기 탑승구가 어디인가요?'],['My baggage hasn’t arrived.','제 짐이 아직 나오지 않았어요.']],
immigration:[["I'm visiting my daughter.",'딸을 만나러 왔어요.'],["I'll be here for two weeks.",'2주 동안 머물 거예요.'],["I'll be staying with my daughter.",'딸 집에서 머물 거예요.'],['I have a return ticket.','돌아가는 비행기 표가 있어요.'],["I'm traveling alone.",'혼자 여행하고 있어요.']],
cafe:[['Could I get some water, please?','물 좀 주시겠어요?'],['Could I get a lid, please?','뚜껑 좀 주시겠어요?'],['Where can I pick up my order?','주문한 음료를 어디서 받나요?']],
restaurant:[['Could we get the check, please?','계산서 주세요.'],["I'll pay by card.",'카드로 계산할게요.'],['Could we pay separately, please?','따로 계산할 수 있을까요?'],["We'll pay together.",'같이 계산할게요.'],['Could I get a receipt, please?','영수증 주세요.'],['Could I get a box for the leftovers, please?','남은 음식을 담을 포장 용기 주세요.']],
shopping:[['Where can I find T-shirts?','티셔츠는 어디에 있나요?'],['How much is this?','이거 얼마예요?'],['Do you have this in a different color?','다른 색상도 있나요?'],['Is this on sale?','이거 할인 중인가요?'],['Could I get a bag, please?','봉투 주세요.'],['Could I get a receipt, please?','영수증 주세요.'],["I'd like to return this, please.",'이걸 반품하고 싶어요.']],
souvenir:[["I'm looking for a UVA T-shirt as a gift.",'선물할 UVA 티셔츠를 찾고 있어요.'],['Do you have this in a medium?','이거 미디엄 사이즈 있나요?'],['Could you gift-wrap this, please?','선물 포장해 주실 수 있나요?'],['How much is this?','이거 얼마예요?']],
hotel:[["Hi, I'd like to check in. My reservation is under Kim.",'안녕하세요, 체크인하려고 해요. 김이라는 이름으로 예약했어요.'],['Could I get some extra towels, please?','수건을 더 받을 수 있을까요?'],['What time is check-out?','체크아웃은 몇 시인가요?'],['Could you help me with the Wi-Fi, please?','와이파이 연결을 도와주실 수 있나요?']],
transport:[['Could you take me to this address, please?','이 주소로 가 주세요.'],['Are you my Uber driver?','제가 부른 우버 기사님이신가요?'],['Could you stop here, please?','여기서 세워 주세요.'],['How long will it take to get there?','도착까지 얼마나 걸리나요?']],
emergency:[['Please help me.','도와주세요.'],['Please call 911.','911에 전화해 주세요.'],['I need a doctor.','의사가 필요해요.'],["I'm lost. Could you help me?",'길을 잃었어요. 도와주실 수 있나요?'],["I don't speak English. Could you speak slowly, please?",'영어를 잘 못해요. 천천히 말씀해 주세요.']]};
export const listening = {
airport:[['May I see your boarding pass?','탑승권을 보여주시겠어요?'],['Please place your bag on the belt.','가방을 벨트 위에 올려 주세요.']],
immigration:[['What is the purpose of your visit?','미국에 왜 오셨어요?'],['What brings you to the United States?','미국에 왜 오셨어요? (위 질문과 같은 뜻이에요)'],['How long will you be staying?','얼마나 머무르실 건가요?'],['Where will you be staying?','어디에서 머무르시나요?'],['Do you have a return ticket?','돌아가는 비행기 표가 있나요?'],['Are you traveling alone?','혼자 여행하시나요?'],['Who are you visiting?','누구를 만나러 오셨나요?']],
cafe:[['What size?','어떤 사이즈로 드릴까요?'],['Hot or iced?','따뜻하게 드릴까요, 차갑게 드릴까요?'],['What kind of milk?','어떤 우유로 드릴까요?'],['For here or to go?','매장에서 드시나요, 포장하시나요?'],['Anything else?','더 필요하신 건 있나요?'],['Can I get a name for the order?','주문하시는 분 성함이 어떻게 되세요?']],
restaurant:[['How many?','몇 분이세요?'],['Do you have a reservation?','예약하셨나요?'],['Can I get you started with something to drink?','먼저 음료 주문하시겠어요?'],['Are you ready to order?','주문하시겠어요?'],['How would you like that cooked?','어떻게 구워드릴까요?'],['How is everything?','음식 괜찮으세요?'],['Would you like a box?','포장 용기 드릴까요?'],['Together or separate?','같이 계산하시나요, 따로 계산하시나요?']],
shopping:[['Can I help you find anything?','찾으시는 물건이 있나요?'],['What size are you looking for?','어떤 사이즈를 찾으세요?'],['Would you like a receipt?','영수증 드릴까요?']],
souvenir:[['Is this a gift?','선물인가요?'],['Would you like a bag?','봉투 드릴까요?']],
hotel:[['Do you have a reservation?','예약하셨나요?'],['May I see your ID?','신분증을 보여주시겠어요?'],['How many nights will you be staying?','몇 박 머무르시나요?']],
transport:[['Where are you headed?','어디로 가시나요?'],['Is this your destination?','여기가 목적지인가요?']],
emergency:[['Are you okay?','괜찮으세요?'],['Do you need an ambulance?','구급차가 필요한가요?']]};
export const simulations = {
restaurant:[['Hi! How many?','안녕하세요! 몇 분이세요?',[['혼자예요','One, please.'],['두 명이에요','Two, please.'],['세 명이에요','Three, please.']]],['Do you have a reservation?','예약하셨나요?',[['네, 예약했어요','Yes, I have a reservation under Kim.'],['아니요, 안 했어요',"No, we don't."]]],['Can I get you something to drink?','음료를 가져다드릴까요?',[['물 주세요','Water, please.'],['아이스티 주세요','Iced tea, please.']]],['Are you ready to order?','주문하시겠어요?',[['네, 주문할게요',"Yes, I'd like the steak, please."],['조금 더 볼게요','Could we have a few more minutes, please?']]]],
cafe:[['Hi! What can I get for you?','무엇을 드릴까요?',[['라떼 주세요','Could I get a latte, please?'],['아메리카노 주세요','Could I get an Americano, please?']]],['Hot or iced?','따뜻하게, 차갑게?',[['아이스로 주세요','Iced, please.'],['따뜻하게 주세요','Hot, please.']]],['What size?','어떤 사이즈로 드릴까요?',[['미디엄 주세요','Medium, please.'],['라지 주세요','Large, please.']]],['For here or to go?','매장인가요, 포장인가요?',[['포장해 주세요','To go, please.'],['여기서 마실게요','For here, please.']]]],
immigration:[['What is the purpose of your visit?','미국에 왜 오셨어요?',[['딸을 만나러 왔어요',"I'm visiting my daughter."],['관광하러 왔어요',"I'm here for a vacation."]]],['How long will you be staying?','얼마나 머무르실 건가요?',[['2주요','Two weeks.'],['한 달이요','One month.']]],['Where will you be staying?','어디에서 머무르시나요?',[['딸 집이요',"I'll be staying with my daughter."],['호텔이요',"I'll be staying at a hotel."]]],['Do you have a return ticket?','돌아가는 표가 있나요?',[['네, 있어요','Yes, I have a return ticket.'],['아니요, 아직 없어요',"No, I don't have one yet."]]]],
hotel:[['Welcome! Do you have a reservation?','예약하셨나요?',[['네, 김 이름으로 예약했어요','Yes, my reservation is under Kim.'],['예약 없이 왔어요','No, do you have any rooms available?']]],['May I see your ID, please?','신분증을 보여주시겠어요?',[['여기 여권이에요','Here is my passport.']]],['Do you need anything else?','더 필요한 것이 있나요?',[['와이파이 비밀번호요','Could I get the Wi-Fi password, please?'],['괜찮아요, 감사합니다',"No, thank you. That's all."]]]],
shopping:[['Can I help you find anything?','찾으시는 물건이 있나요?',[['티셔츠를 찾고 있어요',"I'm looking for a T-shirt."],['그냥 둘러보고 있어요',"I'm just looking, thank you."]]],['What size?','어떤 사이즈요?',[['미디엄이요','Medium, please.'],['라지요','Large, please.']]],['Would you like a bag?','봉투 드릴까요?',[['네, 주세요','Yes, please.'],['괜찮아요','No, thank you.']]]]};
export function cafeSentence(v){const [drink,temp,size,milk,extra,place]=v; return `Could I get a ${size} ${temp === 'iced'?'iced ':''}${drink}${milk==='regular'?'':` with ${milk}`}${extra==='none'?'':`${milk==='regular'?' with':' and'} ${extra}`}${place==='to go'?' to go':' for here'}, please?`;}
