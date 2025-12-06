// main.js
// نسخة B نظيفة ومبسّطة
// تعلّم الألمانية من الصفر – عدة مستويات + واجهة بعدة لغات
// ================================
// 🔊 إعداد صوت ألماني للموقع
// ================================
const synth = window.speechSynthesis;
let deVoice = null;

function initGermanVoice() {
  if (!synth) return;

  const voices = synth.getVoices();
  deVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('de'));
}

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = initGermanVoice;
  initGermanVoice();
}



// عناصر DOM الأساسية
const appEl = document.getElementById('app');
const levelLabelEl = document.getElementById('current-level-label');
const audioPlayer = new Audio();

// المستويات المدعومة
const SUPPORTED_LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];

// لغات الواجهة (لغة المتعلّم)
const SUPPORTED_MOTHER_LANGS = ['ar', 'en', 'ru', 'fa', 'af', 'uk', 'tr'];

// 🎨 نظام الثيم (فاتح / داكن)
const THEME_KEY = 'lingo_theme_v1';

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }
}

function updateThemeButtonIcon(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;
  // لو الثيم داكن نعرض شمس، لو فاتح نعرض قمر
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';

  applyTheme(next);
  updateThemeButtonIcon(next);
  localStorage.setItem(THEME_KEY, next);
}

function initTheme() {
  let saved = localStorage.getItem(THEME_KEY);
  if (saved !== 'dark' && saved !== 'light') {
    saved = 'light';
  }
  applyTheme(saved);
  // مهم: نربط الزر بعد ما يتكوّن الـ DOM
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.addEventListener('click', toggleTheme);
  }
  updateThemeButtonIcon(saved);
}


document.addEventListener('DOMContentLoaded', () => {
  
  // أول شيء: حمّل اللغة والمستوى المحفوظين
  if (typeof loadPrefs === 'function') {
    loadPrefs();
    

  }

  // تهيئة الثيم
  if (typeof initTheme === 'function') {
    initTheme();
  }

  // تهيئة صندوق تسجيل الدخول
  initAuthBox();

  // تهيئة زر الخروج + تحديث الشيب حسب المستخدم
  initLogoutButton();
  updateUserChip();
});



function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  updateThemeButtonIcon(next);
  localStorage.setItem(THEME_KEY, next);
}

function initTheme() {
  let saved = localStorage.getItem(THEME_KEY);
  if (saved !== 'dark' && saved !== 'light') {
    saved = 'light';
  }
  applyTheme(saved);
  updateThemeButtonIcon(saved);

  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.addEventListener('click', toggleTheme);
  }
}

// ================ 🎧 قراءة الجملة بالألمانية ===================
function speakGerman(text) {
  if (!window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";

  // تحسينات الصوت
  utterance.rate = 0.97;       // سرعة ممتازة – لا بطيء ولا سريع
  utterance.pitch = 1.1;       // نبرة ألطف
  utterance.volume = 1;        // أعلى جودة

  // محاولة اختيار أفضل صوت ألماني متوفر
  const voices = speechSynthesis.getVoices();
  const germanVoice = voices.find(v =>
    v.lang.startsWith("de") &&
    (v.name.includes("Google") || v.name.includes("Microsoft") || v.name.includes("Deutsch"))
  );
  if (germanVoice) utterance.voice = germanVoice;

  // إيقاف أي كلام سابق قبل البدء
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}


// حالة التطبيق
let motherLang = 'ar';      // لغة الواجهة
let targetLang = 'de';      // اللغة المتعلَّمة (ثابتة: الألمانية)
let currentLevelKey = 'A1'; // المستوى الحالي
let lessonsData = null;     // بيانات دروس المستوى الحالي
let grammarData = null;     // بيانات قواعد المستوى الحالي
let coreVerbsData = null;   // 👈 بيانات جدول الأفعال الأساسية
let currentLessonId = null; // id الدرس الحالي
let currentLessonStep = 0;  // الشاشة الحالية داخل الدرس
let currentMode = 'lessons'; // 'lessons' أو 'grammar'
// وضع خاص لاختبار تحديد المستوى
let placementIndex = 0;
let placementCorrectByLevel = { A1: 0, A2: 0, B1: 0 };
let PLACEMENT_QUESTIONS = [];   // 👈 أسئلة اختبار تحديد المستوى لكل اللغات

let completedLessons = new Set(); // الدروس المنتهية (id أو _key)
// حالة امتحان نهاية المستوى (A2 / B1)
let currentExam = null;
let currentExamIndex = 0;
let currentExamCorrect = 0;

// 🎮 مستوى اللاعب (شيء للمتعة، غير A1/A2...)
// نخزّنه في localStorage عشان ما يروح
let userLevel = parseInt(localStorage.getItem('user_level') || '1');


function saveUserLevel() {
  localStorage.setItem('user_level', String(userLevel));
}


// ترتيب شاشات الدرس
const lessonStepsOrder = [
  'scene',
  'explanation',
  'phrases',
  'tip',
  'dialogue',
  'summary',
  'quiz',
  'writing'
];

// 🟢 نصوص الواجهة بحسب اللغة
const UI_STRINGS = {
  ar: {
    appName: 'تعلّم الألمانية من الصفر',
    appTagline: 'منصة لتعلّم الألمانية بخطوات بسيطة وممتعة',
    chooseMotherLangTitle: 'اختر لغتك الأم',
    chooseMotherLangText: 'هذه هي اللغة التي تريد أن تشرح لك بها المنصة.',
    startButton: 'ابدأ الدروس 🎯',
    grammarButton: 'قواعد المستوى الحالي 📘',
    coreVerbsButton: '📘 جدول الأفعال الأساسية',
    backToLevels: 'العودة لاختيار المستوى واللغة',
    backToLanding: 'العودة للصفحة الرئيسية',
    backToGrammarList: '⬅ رجوع إلى قائمة القواعد',
    backToLessonsList: '⬅ رجوع إلى قائمة الدروس',
        noLessonContent: 'لا توجد محتويات لهذا الدرس بعد.',

    lessonListIntro: 'ابدأ من أول درس في هذا المستوى، وكل خطوة تقرّبك من الطلاقة.',
        writing_no_content: 'لا يوجد تمرين كتابة مضاف لهذا الدرس بعد. ✍️',
    writing_label_input: '✍️ اكتب إجابتك هنا:',
    writing_placeholder: 'اكتب جملك بالألمانية هنا...',
    writing_check_btn: 'تحقّق من كتابتي ✅',
    writing_empty_warning: 'اكتب شيئًا أولًا ثم اضغط على زر التحقق 🙂',
    writing_thanks: 'شكرًا على كتابتك! قارن إجابتك مع النموذج وحاول تحسينها في المرة القادمة 💪',
    writing_example_title: '💡 نموذج إجابة ممكن:',

        // نصوص اختبار تحديد المستوى
    placementTitle: (cur, total) => `اختبار تحديد المستوى – سؤال ${cur} من ${total}`,
    placementSubtitle:
      'اختر الإجابة الصحيحة. الاختبار قصير ويساعدنا نقترح لك مستوى مناسب.',
    placementSkip: 'تخطّي الاختبار',

    grammarListIntro: 'كل قاعدة هنا عبارة عن درس صغير بخطوات تفاعلية.',
    levelLabel: (lvl) => (lvl ? `المستوى ${lvl}` : 'اختر المستوى'),
    grammarLevelLabel: (lvl) => `قواعد ${lvl}`,
    noLessonsForLevel: (lvl, code) =>
      `لا توجد دروس مسجلة لهذا المستوى (${lvl}) وللغة (${code}).`,
    noGrammarForLevel: (lvl, file) =>
      `لا توجد دروس قواعد مسجلة لهذا المستوى (${lvl}). تأكد من وجود الملف:\n${file}`,
    stepsTitles: {
      scene: '🪄 المشهد التفاعلي',
      explanation: '🧠 الشرح الذكي السريع',
      phrases: '😄 عبارات تضيف الذوق',
      tip: '💡 معلومة لغوية خفيفة',
      dialogue: '🗣️ حوار قصير',
      summary: '📦 ملخص سريع',
      quiz: '🎭 تدريب سريع (اختر الإجابة الصحيحة)',
      writing: '✍️ تمرين كتابة بسيط'
    },
    prev: '⬅ السابق',
    next: 'التالي ➜',
    toList: 'إلى قائمة الدروس',
    finishLesson: '✅ أنهيت هذا الدرس',
        lessonDoneTitle: 'أحسنت! أنهيت هذا الدرس ✅',
    lessonDoneBody: 'اضغط في أي مكان للعودة إلى قائمة الدروس.',
    examButtonLabel: (lvl) => `اختبار مستوى ${lvl}`,
    levelLockedTitle: 'المستوى مقفول 🔒',
    levelLockedBody: (required, blocked) =>
      `لا يمكنك المتابعة إلى مستوى ${blocked} قبل النجاح في امتحان مستوى ${required} بنسبة لا تقل عن 70٪.`,
    levelLockedHint1: (required) =>
      `اذهب إلى مستوى ${required}، ثم اضغط على زر «اختبار مستوى ${required}».`,
    levelLockedHint2: (required, blocked) =>
      `بعد الحصول على 70٪ أو أكثر، يمكنك فتح مستوى ${blocked}.`,
share_this_lesson: "🔗 شارك هذا الدرس",

    stepIndicator: (cur, total) => `شاشة ${cur} من ${total}`,
    lessonPrefix: 'الدرس',
    grammarPrefix: 'قاعدة',
    readyChip: '🔓 جاهز للتعلّم',
    lockedChip: '🔒 الدرس مقفول',
    levelChip: (lvl) => `مستوى: ${lvl}`,
    completed: '✅ مكتمل',
    grammarCompleted: '✅ تمّت',
    quizCorrect: 'إجابة صحيحة! 🎉',
    quizWrong: 'إجابة خاطئة، جرّب مرة أخرى. ❌',
    quizHintDefault: 'حاول التفكير أكثر.',
    showHint: 'تلميح 💡',
    showAnswer: 'أظهر الجواب ✅',
    audioLabel: '🔊'
  },
  en: {
    appName: 'Learn German from Zero',
    appTagline: 'A simple and fun way to learn German step by step',
    chooseMotherLangTitle: 'Choose your native language',
    chooseMotherLangText: 'This is the language you want the app to use for explanations.',
    startButton: 'Start lessons 🎯',
    grammarButton: 'Grammar for this level 📘',
    coreVerbsButton: '📘 Core verbs table',
    backToLevels: 'Back to level & language selection',
    backToLanding: 'Back to home',
    backToGrammarList: '⬅ Back to grammar list',
    backToLessonsList: '⬅ Back to lesson list',
        noLessonContent: 'There is no content for this lesson yet.',

    lessonListIntro: 'Start from the first lesson. Each small step brings you closer to fluency.',
        writing_no_content: 'There is no writing exercise for this lesson yet. ✍️',
    writing_label_input: '✍️ Write your answer here:',
    writing_placeholder: 'Write your sentences in German here...',
    writing_check_btn: 'Check my writing ✅',
    writing_empty_warning: 'Write something first, then press the check button 🙂',
    writing_thanks: 'Thank you for your writing! Compare your answer with the model and try to improve it next time 💪',
    writing_example_title: '💡 Example answer:',

        // Placement test texts
    placementTitle: (cur, total) => `Placement test – question ${cur} of ${total}`,
    placementSubtitle:
      'Choose the correct answer. This short test helps us suggest the right level for you.',
    placementSkip: 'Skip the test',

    grammarListIntro: 'Each grammar topic here is a small interactive lesson.',
    levelLabel: (lvl) => (lvl ? `Level ${lvl}` : 'Choose level'),
    grammarLevelLabel: (lvl) => `Grammar ${lvl}`,
    noLessonsForLevel: (lvl, code) =>
      `No lessons found for level ${lvl} and language ${code}.`,
    noGrammarForLevel: (lvl, file) =>
      `No grammar lessons found for level ${lvl}. Make sure the file exists:\n${file}`,
        auth_badge_step: "🚀 Step 1: Choose your name",
    auth_title: "Type your name or any nickname to save your progress",
    auth_subtitle: "This name will be used to save your lesson progress. Use the same name later to continue where you left off.",
    auth_placeholder: "e.g. AbbasHero, Noor, or SuperStar",
    auth_btn_register: "Start and save my progress ✅",
share_this_lesson: "🔗 Share this lesson",

    stepsTitles: {
      scene: '🪄 Interactive scene',
      explanation: '🧠 Smart explanation',
      phrases: '😄 Useful phrases',
      tip: '💡 Quick tip',
      dialogue: '🗣️ Short dialogue',
      summary: '📦 Quick summary',
      quiz: '🎭 Quick training (choose the correct answer)',
      writing: '✍️ Writing exercise'
    },
    prev: '⬅ Previous',
    next: 'Next ➜',
    toList: 'Back to list',
    finishLesson: '✅ I finished this lesson',
        lessonDoneTitle: 'Great job! You finished this lesson ✅',
    lessonDoneBody: 'Tap anywhere to go back to the lesson list.',
    examButtonLabel: (lvl) => `Level ${lvl} exam`,
    levelLockedTitle: 'Level locked 🔒',
    levelLockedBody: (required, blocked) =>
      `You can’t continue to level ${blocked} until you pass the level ${required} exam with at least 70%.`,
    levelLockedHint1: (required) =>
      `Go to level ${required} and click the “Level ${required} exam” button.`,
    levelLockedHint2: (required, blocked) =>
      `After you score 70% or higher, you can unlock level ${blocked}.`,

    stepIndicator: (cur, total) => `Screen ${cur} of ${total}`,
    lessonPrefix: 'Lesson',
    grammarPrefix: 'Grammar',
    readyChip: '🔓 Ready to learn',
    lockedChip: '🔒 Locked',
    levelChip: (lvl) => `Level: ${lvl}`,
    completed: '✅ Completed',
    grammarCompleted: '✅ Done',
    quizCorrect: 'Correct! 🎉',
    quizWrong: 'Wrong answer, try again. ❌',
    quizHintDefault: 'Think a bit more.',
    showHint: 'Hint 💡',
    showAnswer: 'Show answer ✅',
    audioLabel: '🔊'
  },
  ru: {
    appName: 'Немецкий с нуля',
    appTagline: 'Простая и увлекательная платформа для изучения немецкого',
    chooseMotherLangTitle: 'Выберите родной язык',
    chooseMotherLangText: 'Этот язык будет использоваться для объяснений.',
    startButton: 'Начать уроки 🎯',
    grammarButton: 'Грамматика этого уровня 📘',
    coreVerbsButton: '📘 Таблица основных глаголов',
    backToLevels: 'Назад к выбору уровня и языка',
    backToLanding: 'Назад на главную',
    backToGrammarList: '⬅ Назад к списку грамматики',
    backToLessonsList: '⬅ Назад к списку уроков',
        noLessonContent: 'Для этого урока пока нет содержания.',

    lessonListIntro: 'Начните с первого урока. Каждый шаг приближает вас к свободной речи.',
        writing_no_content: 'Для этого урока пока нет письменного задания. ✍️',
    writing_label_input: '✍️ Напиши свой ответ здесь:',
    writing_placeholder: 'Напиши свои предложения на немецком здесь...',
    writing_check_btn: 'Проверить мой текст ✅',
    writing_empty_warning: 'Сначала напиши что-нибудь, затем нажми кнопку проверки 🙂',
    writing_thanks: 'Спасибо за твой текст! Сравни свой ответ с примером и попробуй улучшиться в следующий раз 💪',
    writing_example_title: '💡 Возможный пример ответа:',

    grammarListIntro: 'Каждая тема грамматики — это маленький интерактивный урок.',
    levelLabel: (lvl) => (lvl ? `Уровень ${lvl}` : 'Выберите уровень'),
    grammarLevelLabel: (lvl) => `Грамматика ${lvl}`,
    noLessonsForLevel: (lvl, code) =>
      `Нет уроков для уровня ${lvl} и языка ${code}.`,
    noGrammarForLevel: (lvl, file) =>
      `Нет грамматических уроков для уровня ${lvl}. Проверьте файл:\n${file}`,
        auth_badge_step: "🚀 Шаг 1: Выбери имя",
    auth_title: "Введи своё имя или любой ник, чтобы сохранять прогресс",
    auth_subtitle: "Это имя будет использоваться для сохранения твоего прогресса в уроках. Позже ты сможешь войти с тем же именем и продолжить.",
    auth_placeholder: "например: AbbasHero, Noor или SuperStar",
    auth_btn_register: "Начать и сохранить прогресс ✅",
share_this_lesson: "🔗 Поделиться уроком",

    stepsTitles: {
      scene: '🪄 Ситуация',
      explanation: '🧠 Объяснение',
      phrases: '😄 Фразы',
      tip: '💡 Совет',
      dialogue: '🗣️ Диалог',
      summary: '📦 Краткое резюме',
      quiz: '🎭 Тренировка (выберите правильный ответ)',
      writing: '✍️ Письменное упражнение'
    },
    prev: '⬅ Назад',
    next: 'Далее ➜',
    toList: 'К списку',
    finishLesson: '✅ Я закончил урок',
        lessonDoneTitle: 'Молодец! Ты закончил(а) этот урок ✅',
    lessonDoneBody: 'Нажми в любом месте, чтобы вернуться к списку уроков.',
    examButtonLabel: (lvl) => `Тест уровня ${lvl}`,
    levelLockedTitle: 'Уровень заблокирован 🔒',
    levelLockedBody: (required, blocked) =>
      `Вы не можете перейти к уровню ${blocked}, пока не сдадите тест уровня ${required} как минимум на 70%.`,
    levelLockedHint1: (required) =>
      `Перейдите на уровень ${required} и нажмите кнопку «Тест уровня ${required}».`,
    levelLockedHint2: (required, blocked) =>
      `После того как наберёте 70% и больше, вы сможете открыть уровень ${blocked}.`,

    stepIndicator: (cur, total) => `Экран ${cur} из ${total}`,
    lessonPrefix: 'Урок',
    grammarPrefix: 'Грамматика',
    readyChip: '🔓 Готово к изучению',
    lockedChip: '🔒 Заблокировано',
    levelChip: (lvl) => `Уровень: ${lvl}`,
    completed: '✅ Завершено',
    grammarCompleted: '✅ Готово',
    quizCorrect: 'Правильно! 🎉',
    quizWrong: 'Неправильно, попробуйте ещё раз. ❌',
    quizHintDefault: 'Подумайте ещё немного.',
    showHint: 'Подсказка 💡',
    showAnswer: 'Показать ответ ✅',
    audioLabel: '🔊'
  },
  fa: {
    appName: 'یادگیری آلمانی از صفر',
    appTagline: 'پلتفرمی ساده و جذاب برای یادگیری آلمانی',
    chooseMotherLangTitle: 'زبان مادری خود را انتخاب کنید',
    chooseMotherLangText: 'این زبانی است که می‌خواهید توضیحات با آن باشد.',
    startButton: 'شروع درس‌ها 🎯',
    grammarButton: 'گرامر این سطح 📘',
coreVerbsButton: '📘 جدول فعل‌های پایه‌ای',

    backToLevels: 'بازگشت به انتخاب سطح و زبان',
    backToLanding: 'بازگشت به صفحه اصلی',
    backToGrammarList: '⬅ بازگشت به فهرست گرامر',
    backToLessonsList: '⬅ بازگشت به فهرست درس‌ها',
        noLessonContent: 'هنوز محتوایی برای این درس اضافه نشده است.',

    lessonListIntro: 'از اولین درس شروع کنید. هر قدم شما را به تسلط نزدیک‌تر می‌کند.',
        writing_no_content: 'هنوز تمرین نوشتاری برای این درس اضافه نشده است. ✍️',
    writing_label_input: '✍️ پاسخ خود را اینجا بنویس:',
    writing_placeholder: 'جمله‌های آلمانی خود را اینجا بنویس...',
    writing_check_btn: 'تصحیح نوشته من ✅',
    writing_empty_warning: 'اول چیزی بنویس، بعد دکمهٔ بررسی را بزن 🙂',
    writing_thanks: 'ممنون از نوشتۀ تو! جوابت را با نمونه مقایسه کن و دفعهٔ بعد بهترش کن 💪',
    writing_example_title: '💡 یک نمونهٔ ممکن از پاسخ:',

    grammarListIntro: 'هر مبحث گرامر یک درس تعاملی کوچک است.',
    levelLabel: (lvl) => (lvl ? `سطح ${lvl}` : 'سطح را انتخاب کنید'),
    grammarLevelLabel: (lvl) => `گرامر ${lvl}`,
    noLessonsForLevel: (lvl, code) =>
      `برای سطح ${lvl} و زبان ${code} درسی پیدا نشد.`,
    noGrammarForLevel: (lvl, file) =>
      `برای سطح ${lvl} گرامری ثبت نشده است. فایل را بررسی کنید:\n${file}`,
        auth_badge_step: "🚀 مرحله ۱: اسم خودت را انتخاب کن",
    auth_title: "اسم خودت یا هر نام مستعاری را برای ذخیرهٔ پیشرفتت بنویس",
    auth_subtitle: "این نام برای ذخیرهٔ پیشرفتت در درس‌ها استفاده می‌شود. بعداً می‌توانی با همین نام برگردی و از همان‌جا ادامه بدهی.",
    auth_placeholder: "مثلاً: AbbasHero، Noor یا SuperStar",
    auth_btn_register: "شروع و ذخیرهٔ پیشرفت ✅",
share_this_lesson: "🔗 این درس را به اشتراک بگذار",

    stepsTitles: {
      scene: '🪄 موقعیت تعاملی',
      explanation: '🧠 توضیح',
      phrases: '😄 عبارات',
      tip: '💡 نکته',
      dialogue: '🗣️ گفت‌وگو',
      summary: '📦 خلاصه',
      quiz: '🎭 تمرین (گزینه درست را انتخاب کنید)',
      writing: '✍️ تمرین نوشتن'
    },
    prev: '⬅ قبلی',
    next: 'بعدی ➜',
    toList: 'بازگشت به فهرست',
    finishLesson: '✅ این درس را تمام کردم',
        lessonDoneTitle: 'آفرین! این درس را تمام کردی ✅',
    lessonDoneBody: 'برای بازگشت به فهرست درس‌ها روی هرجایی کلیک کن.',
    examButtonLabel: (lvl) => `آزمون سطح ${lvl}`,
    levelLockedTitle: 'سطح قفل است 🔒',
    levelLockedBody: (required, blocked) =>
      `تا وقتی آزمون سطح ${required} را با حداقل ۷۰٪ نگذرانده‌ای، نمی‌توانی به سطح ${blocked} بروی.`,
    levelLockedHint1: (required) =>
      `به سطح ${required} برو و روی دکمه «آزمون سطح ${required}» کلیک کن.`,
    levelLockedHint2: (required, blocked) =>
      `بعد از گرفتن ۷۰٪ یا بیشتر، می‌توانی سطح ${blocked} را باز کنی.`,

    stepIndicator: (cur, total) => `صفحه ${cur} از ${total}`,
    lessonPrefix: 'درس',
    grammarPrefix: 'گرامر',
    readyChip: '🔓 آماده یادگیری',
    lockedChip: '🔒 قفل شده',
    levelChip: (lvl) => `سطح: ${lvl}`,
    completed: '✅ تکمیل شد',
    grammarCompleted: '✅ تمام شد',
    quizCorrect: 'درست! 🎉',
    quizWrong: 'اشتباه است، دوباره تلاش کن. ❌',
    quizHintDefault: 'کمی بیشتر فکر کن.',
    showHint: 'راهنما 💡',
    showAnswer: 'نمایش پاسخ ✅',
    audioLabel: '🔊'
  },
  af: {
    appName: 'جرمني له صفره زده کړه',
    appTagline: 'ساده او خوښونکی لاره د جرمن ژبې د زده کړې لپاره',
    chooseMotherLangTitle: 'خپله مورني ژبه وټاکئ',
    chooseMotherLangText: 'دا هغه ژبه ده چې تشریح به پرې وي.',
    startButton: 'درسونه پیل کړه 🎯',
    grammarButton: 'د دې کچې ګرامر 📘',
    coreVerbsButton: '📘 جدول فعل‌های اساسی',
    backToLevels: 'بیرته د کچې او ژبې انتخاب ته',
    backToLanding: 'بیرته لومړي مخ ته',
    backToGrammarList: '⬅ بیرته د ګرامر لیست ته',
    backToLessonsList: '⬅ بیرته د درسونو لیست ته',
    lessonListIntro: 'له لومړي درس څخه پیل کړه. هر ګام دې د روانې خبرې خواته وړي.',
    grammarListIntro: 'هره ګرامري موضوع دلته یو کوچنی تعاملي درس دی.',
    levelLabel: (lvl) => (lvl ? `کچه ${lvl}` : 'کچه وټاکه'),
    grammarLevelLabel: (lvl) => `ګرامر ${lvl}`,
    noLessonsForLevel: (lvl, code) =>
      `د کچې ${lvl} او ژبې ${code} لپاره درس ونه موندل شو.`,
    noGrammarForLevel: (lvl, file) =>
      `د کچې ${lvl} لپاره ګرامر نشته. فایل وګوره:\n${file}`,

    auth_badge_step: '🚀 لومړی ګام: خپل نوم وټاکه',
    auth_title: 'خپل نوم یا هر مستعار نوم ولیکه څو ستا پرمختګ وساتل شي',
    auth_subtitle:
      'دا نوم به د دې لپاره کارېږي چې د درسونو پرمخ تګ وساتل شي. وروسته بیا کولای شې په همدې نوم بېرته راشې او له هماغه ځایه دوام ورکړې.',
    auth_placeholder: 'لکه: AbbasHero، Noor یا SuperStar',
    auth_btn_register: 'پیل او زما پرمختګ خوندي کړه ✅',

    share_this_lesson: '🔗 دا لوست شریک کړه',

    stepsTitles: {
      scene: '🪄 صحنه',
      explanation: '🧠 تشریح',
      phrases: '😄 جملې',
      tip: '💡 اشاره',
      dialogue: '🗣️ مکالمه',
      summary: '📦 لنډیز',
      quiz: '🎭 تمرین (سم ځواب وټاکه)',
      writing: '✍️ د لیکلو تمرین'
    },

    prev: '⬅ شاته',
    next: 'بل ➜',
    toList: 'بیرته لیست ته',
    finishLesson: '✅ درس ختم شو',
    lessonDoneTitle: 'آفرین! دا درس دې پای ته ورساوه ✅',
    lessonDoneBody: 'د درسونو لیست ته د ستنېدو لپاره پر هر ځای کېکاږه.',

    examButtonLabel: (lvl) => `د ${lvl} کچې ازموینه`,
    levelLockedTitle: 'کچه تړل شوې ده 🔒',
    levelLockedBody: (required, blocked) =>
      `تر هغه چې د ${required} کچې ازموینه لږ تر لږه په ۷۰٪ سره پاس نه کړې، نشې تلای ${blocked} کچې ته.`,
    levelLockedHint1: (required) =>
      `د ${required} کچې مخ ته ولاړ شه او د «د ${required} کچې ازموینه» پر تڼۍ کېکاږه.`,
    levelLockedHint2: (required, blocked) =>
      `کله چې ۷۰٪ یا ډېر واخلي، نو کولای شې د ${blocked} کچه خلاصه کړې.`,

    stepIndicator: (cur, total) => `پاڼه ${cur} له ${total} څخه`,
    lessonPrefix: 'درس',
    grammarPrefix: 'ګرامر',
    readyChip: '🔓 د زده کړې لپاره تیار',
    lockedChip: '🔒 بند دی',
    levelChip: (lvl) => `کچه: ${lvl}`,
    completed: '✅ بشپړ شو',
    grammarCompleted: '✅ تمام شو',

    // 📌 ټکي د کویز لپاره
    quizCorrect: 'سم ځواب! 🎉',
    quizWrong: 'غلط دی، بیا هڅه وکړه. ❌',
    quizHintDefault: 'یو څه نور فکر وکړه.',
    showHint: 'اشاره 💡',
    showAnswer: 'ځواب ښکاره کړه ✅',
    audioLabel: '🔊',

    // 📌 ټکي د لیکلو تمرین لپاره
    writing_no_content: 'تر د دې لوست لپاره لا د لیکلو تمرین نه دی زیات شوی. ✍️',
    writing_label_input: '✍️ خپله ځواب همدلته ولیکه:',
    writing_placeholder: 'خپل جرمني جملې دلته ولیکه...',
    writing_check_btn: 'زما لیکنه وڅېړه ✅',
    writing_empty_warning: 'لومړی څه ولیکه، بیا د څېړلو تڼۍ کېکاږه 🙂',
    writing_thanks:
      'ستاسو د لیکنې لپاره مننه! خپل ځواب له بېلګې سره پرتله کړه او بل ځل یې لا ښه کړه 💪',
    writing_example_title: '💡 د یوې ممکنه ځواب بېلګه:'
  },

  uk: {
    appName: 'Німецька з нуля',
    appTagline: 'Проста та цікава платформа для вивчення німецької мови',
    chooseMotherLangTitle: 'Обери рідну мову',
    chooseMotherLangText: 'Це мова, якою будуть пояснення в застосунку.',
    startButton: 'Почати уроки 🎯',
    grammarButton: 'Граматика цього рівня 📘',
    coreVerbsButton: '📘 Таблиця основних дієслів',
    backToLevels: 'Назад до вибору рівня та мови',
    backToLanding: 'Назад на головну',
    backToGrammarList: '⬅ Назад до списку граматики',
    backToLessonsList: '⬅ Назад до списку уроків',
        noLessonContent: 'Для цього уроку ще немає матеріалу.',

    lessonListIntro: 'Почни з першого уроку. Кожен крок наближає тебе до вільної мови.',
        writing_no_content: 'Для цього уроку ще немає письмової вправи. ✍️',
    writing_label_input: '✍️ Напиши свою відповідь тут:',
    writing_placeholder: 'Напиши свої речення німецькою тут...',
    writing_check_btn: 'Перевірити моє письмо ✅',
    writing_empty_warning: 'Спочатку напиши щось, а потім натисни кнопку перевірки 🙂',
    writing_thanks: 'Дякуємо за твою відповідь! Порівняй її з прикладом і спробуй покращитися наступного разу 💪',
    writing_example_title: '💡 Можливий зразок відповіді:',

    grammarListIntro: 'Кожна тема граматики — це невеликий інтерактивний урок.',
    levelLabel: (lvl) => (lvl ? `Рівень ${lvl}` : 'Оберіть рівень'),
    grammarLevelLabel: (lvl) => `Граматика ${lvl}`,
    noLessonsForLevel: (lvl, code) =>
      `Немає уроків для рівня ${lvl} та мови ${code}.`,
    noGrammarForLevel: (lvl, file) =>
      `Немає граматичних уроків для рівня ${lvl}. Перевір файл:\n${file}`,
        auth_badge_step: "🚀 Крок 1: Обери ім’я",
    auth_title: "Введи своє ім’я або нікнейм, щоб зберігати прогрес",
    auth_subtitle: "Це ім’я буде використовуватись для збереження твого прогресу в уроках. Пізніше ти зможеш увійти з тим самим ім’ям і продовжити.",
    auth_placeholder: "наприклад: AbbasHero, Noor або SuperStar",
    auth_btn_register: "Почати та зберегти прогрес ✅",
share_this_lesson: "🔗 Поділитися цим уроком",

    stepsTitles: {
      scene: '🪄 Ситуація',
      explanation: '🧠 Пояснення',
      phrases: '😄 Корисні фрази',
      tip: '💡 Порада',
      dialogue: '🗣️ Діалог',
      summary: '📦 Короткий підсумок',
      quiz: '🎭 Тренування (обери правильну відповідь)',
      writing: '✍️ Письмова вправа'
    },
    prev: '⬅ Назад',
    next: 'Далі ➜',
    toList: 'До списку',
    finishLesson: '✅ Я завершив цей урок',
        lessonDoneTitle: 'Молодець! Ти завершив(ла) цей урок ✅',
    lessonDoneBody: 'Натисни будь-де, щоб повернутися до списку уроків.',
    examButtonLabel: (lvl) => `Тест рівня ${lvl}`,
    levelLockedTitle: 'Рівень заблоковано 🔒',
    levelLockedBody: (required, blocked) =>
      `Ви не можете перейти до рівня ${blocked}, доки не складете тест рівня ${required} з результатом не менше 70%.`,
    levelLockedHint1: (required) =>
      `Перейдіть на рівень ${required} та натисніть кнопку «Тест рівня ${required}».`,
    levelLockedHint2: (required, blocked) =>
      `Після того як наберете 70% або більше, ви зможете відкрити рівень ${blocked}.`,

    stepIndicator: (cur, total) => `Екран ${cur} з ${total}`,
    lessonPrefix: 'Урок',
    grammarPrefix: 'Граматика',
    readyChip: '🔓 Готово до вивчення',
    lockedChip: '🔒 Заблоковано',
    levelChip: (lvl) => `Рівень: ${lvl}`,
    completed: '✅ Завершено',
    grammarCompleted: '✅ Готово',
    quizCorrect: 'Правильно! 🎉',
    quizWrong: 'Неправильно, спробуй ще раз. ❌',
    quizHintDefault: 'Подумай ще трошки.',
    showHint: 'Підказка 💡',
    showAnswer: 'Показати відповідь ✅',
    audioLabel: '🔊'
  },
  tr: {
    appName: 'Sıfırdan Almanca Öğren',
    appTagline: 'Almancayı adım adım, eğlenceli bir şekilde öğren',
    chooseMotherLangTitle: 'Ana dilini seç',
    chooseMotherLangText: 'Açıklamalar bu dilde gösterilecek.',
    startButton: 'Derslere başla 🎯',
    grammarButton: 'Bu seviyenin grameri 📘',
    coreVerbsButton: '📘 Temel fiiller tablosu',
    backToLevels: 'Seviye ve dil seçimine geri dön',
    backToLanding: 'Ana sayfaya geri dön',
    backToGrammarList: '⬅ Gramer listesine geri dön',
    backToLessonsList: '⬅ Ders listesine geri dön',
        noLessonContent: 'Bu ders için henüz içerik eklenmedi.',

    lessonListIntro: 'Bu seviyenin ilk dersinden başla, her adım seni akıcılığa yaklaştırır.',
        writing_no_content: 'Bu ders için henüz yazma alıştırması eklenmedi. ✍️',
    writing_label_input: '✍️ Cevabını buraya yaz:',
    writing_placeholder: 'Cümlelerini burada Almanca olarak yaz...',
    writing_check_btn: 'Yazımı kontrol et ✅',
    writing_empty_warning: 'Önce bir şey yaz, sonra kontrol düğmesine bas 🙂',
    writing_thanks: 'Yazın için teşekkürler! Cevabını örnekle karşılaştır ve bir dahaki sefere daha iyi yazmaya çalış 💪',
    writing_example_title: '💡 Örnek bir cevap:',

    grammarListIntro: 'Her gramer konusu küçük bir interaktif derstir.',
    levelLabel: (lvl) => (lvl ? `Seviye ${lvl}` : 'Seviyeyi seç'),
    grammarLevelLabel: (lvl) => `Gramer ${lvl}`,
    noLessonsForLevel: (lvl, code) =>
      `Bu seviye (${lvl}) ve dil (${code}) için ders bulunamadı.`,
    noGrammarForLevel: (lvl, file) =>
      `Bu seviye (${lvl}) için gramer dersi yok. Dosyayı kontrol et:\n${file}`,
        auth_badge_step: "🚀 Adım 1: İsmini seç",
    auth_title: "İlerlemeni kaydetmek için adını veya bir takma ad yaz",
    auth_subtitle: "Bu isim, derslerdeki ilerlemeni kaydetmek için kullanılacak. Daha sonra aynı isimle girip kaldığın yerden devam edebilirsin.",
    auth_placeholder: "Örn: AbbasHero, Noor veya SuperStar",
    auth_btn_register: "Başla ve ilerlememi kaydet ✅",
share_this_lesson: "🔗 Bu dersi paylaş",

    stepsTitles: {
      scene: '🪄 Etkileşimli sahne',
      explanation: '🧠 Akıllı açıklama',
      phrases: '😄 Faydalı ifadeler',
      tip: '💡 Hızlı ipucu',
      dialogue: '🗣️ Kısa diyalog',
      summary: '📦 Kısa özet',
      quiz: '🎭 Hızlı alıştırma (doğru cevabı seç)',
      writing: '✍️ Yazma alıştırması'
    },
    prev: '⬅ Geri',
    next: 'İleri ➜',
    toList: 'Listeye geri dön',
    finishLesson: '✅ Bu dersi bitirdim',
        lessonDoneTitle: 'Aferin! Bu dersi bitirdin ✅',
    lessonDoneBody: 'Ders listesine dönmek için herhangi bir yere tıkla.',
    examButtonLabel: (lvl) => `${lvl} seviye testi`,
    levelLockedTitle: 'Seviye kilitli 🔒',
    levelLockedBody: (required, blocked) =>
      `${blocked} seviyesine geçmeden önce, en az %70 ile ${required} seviye testini geçmen gerekiyor.`,
    levelLockedHint1: (required) =>
      `${required} seviyesine git ve “${required} seviye testi” butonuna tıkla.`,
    levelLockedHint2: (required, blocked) =>
      `%70 veya üzeri aldıktan sonra ${blocked} seviyesini açabilirsin.`,

    stepIndicator: (cur, total) => `Ekran ${cur} / ${total}`,
    lessonPrefix: 'Ders',
    grammarPrefix: 'Gramer',
    readyChip: '🔓 Öğrenmeye hazır',
    lockedChip: '🔒 Kilitli',
    levelChip: (lvl) => `Seviye: ${lvl}`,
    completed: '✅ Tamamlandı',
    grammarCompleted: '✅ Bitti',
    quizCorrect: 'Doğru! 🎉',
    quizWrong: 'Yanlış cevap, tekrar dene. ❌',
    quizHintDefault: 'Biraz daha düşün.',
    showHint: 'İpucu 💡',
    showAnswer: 'Cevabı göster ✅',
    audioLabel: '🔊'
  }
};


// 🟢 دوال مساعدة بسيطة

function getStrings() {
  return UI_STRINGS[motherLang] || UI_STRINGS.ar;
}

// استبدال اسمك لو حابب (عباس → Noa)
function replaceName(text) {
  if (!text) return text;
  return text.replace(/Abbas/g, 'Noa').replace(/عباس/g, 'Noa');
}

// إبراز الكلمات الألمانية
function highlightGermanInText(text) {
  if (!text) return text;
  const t = replaceName(text);
  const germanRegex = /([A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß0-9'’`´\-]*)/g;
  return t.replace(germanRegex, '<span class="de-text">$1</span>');
}

// تحويل جملة ألمانية إلى اسم ملف صوت
function germanToAudioFilename(text) {
  if (!text) return null;
  let s = text.toLowerCase();
  s = s
    .replace(/[.!?،؟]/g, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  if (!s) return null;
  return `assets/audio/${s}.mp3`;
}

function playAudio(src) {
  if (!src) return;
  audioPlayer.src = src;
  audioPlayer.play().catch(() => {});
}

function setupAudioButtons() {
  const buttons = document.querySelectorAll('.audio-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-audio');
      if (src) playAudio(src);
    });
  });
}

// 🎉 كونفيتي صغير
function triggerConfetti() {
  const overlay = document.createElement('div');
  overlay.className = 'confetti-overlay';

  const colors = ['#22c55e', '#3b82f6', '#f97316', '#e11d48', '#a855f7', '#10b981'];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.top = Math.random() * 20 + 'vh';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (0.8 + Math.random() * 0.9).toFixed(2) + 's';
    overlay.appendChild(piece);
  }

  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 1500);
}

// 🟢 تخزين / تحميل التقدّم والتفضيلات
function loadProgress() {
  // إذا عندك نظام مستخدمين: نجيب التقدّم من المستخدم الحالي
  const current = loadCurrentUser && loadCurrentUser();
  if (current) {
    const progress = getCurrentUserProgress();
    if (Array.isArray(progress)) {
      completedLessons = new Set(progress);
    }
    return;
  }

  // نسخة احتياطية قديمة (لو ما في مستخدم)
  try {
    const raw = localStorage.getItem('lingo_progress_v1');
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data.completed)) {
        completedLessons = new Set(data.completed);
      }
    }
  } catch (e) {
    console.warn('Error loading progress', e);
  }
}

function saveProgress() {
  const arr = Array.from(completedLessons);

  // لو في مستخدم → نحفظ تقدّمه
  if (currentUser && typeof saveCurrentUserProgress === 'function') {
    saveCurrentUserProgress(arr);
  } else {
    // لو لسه ما في نظام مستخدمين، نخزّنها بالطريقة القديمة
    const data = { completed: arr };
    localStorage.setItem('lingo_progress_v1', JSON.stringify(data));
  }
}









function savePrefs() {
  const data = {
    mother: motherLang,
    level: currentLevelKey
  };
  localStorage.setItem('lingo_prefs_v1', JSON.stringify(data));
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem('lingo_prefs_v1');
    if (raw) {
      const data = JSON.parse(raw);

      // لغة الواجهة من ملف التفضيلات القديم
      if (data.mother && SUPPORTED_MOTHER_LANGS.includes(data.mother)) {
        motherLang = data.mother;
      }

      // المستوى الحالي
      if (data.level && SUPPORTED_LEVELS.includes(data.level)) {
        currentLevelKey = data.level;
      }
    }

    // توافقًا مع النافذة المنبثقة: لو في motherLang منفصلة نستخدمها
    const fromModal = localStorage.getItem('motherLang');
    if (fromModal && SUPPORTED_MOTHER_LANGS.includes(fromModal)) {
      motherLang = fromModal;
    }
  } catch (e) {
    console.warn('خطأ في تحميل التفضيلات', e);
  }
}
// 🌍 UI Translations for ALL supported languages
// Languages: ar, en, uk, ru, tr, fa, af

const UI_TRANSLATIONS = {
  // ====== TOP NAVIGATION ======
  menu_home: {
    ar: "الرئيسية",
    en: "Home",
    uk: "Головна",
    ru: "Главная",
    tr: "Ana Sayfa",
    fa: "صفحه اصلی",
    af: "اصلي پاڼه",
  },
  menu_about: {
    // About Deutsch Hero
    ar: "عن Deutsch Hero",
    en: "About Deutsch Hero",
    uk: "Про Deutsch Hero",
    ru: "О Deutsch Hero",
    tr: "Deutsch Hero hakkında",
    fa: "درباره Deutsch Hero",
    af: "د Deutsch Hero په اړه",
  },
  menu_contact: {
    // Contact us
    ar: "اتصل بنا",
    en: "Contact us",
    uk: "Зв’язатися з нами",
    ru: "Связаться с нами",
    tr: "Bizimle iletişime geçin",
    fa: "تماس با ما",
    af: "له موږ سره اړیکه ونیسئ",
  },
    logout_btn: {
    ar: "خروج",
    en: "Log out",
    uk: "Вийти",
    ru: "Выйти",
    tr: "Çıkış",
    fa: "خروج",
    af: "وتلل",
  },

  menu_privacy: {
    // Privacy Policy
    ar: "سياسة الخصوصية",
    en: "Privacy Policy",
    uk: "Політика конфіденційності",
    ru: "Политика конфиденциальности",
    tr: "Gizlilik Politikası",
    fa: "سیاست حریم خصوصی",
    af: "د محرميت پاليسي",
  },
  menu_terms: {
    // Terms & Conditions
    ar: "الشروط والأحكام",
    en: "Terms & Conditions",
    uk: "Умови та положення",
    ru: "Правила и условия",
    tr: "Şartlar ve koşullar",
    fa: "شرایط و ضوابط",
    af: "شرایط او مقررات",
  },

  // ====== MAIN TITLE (LANDING) ======
  title_main: {
    ar: "تعلّم الألمانية من الصفر 🇩🇪",
    en: "Learn German from Zero 🇩🇪",
    uk: "Німецька з нуля 🇩🇪",
    ru: "Немецкий с нуля 🇩🇪",
    tr: "Sıfırdan Almanca 🇩🇪",
    fa: "آلمانی از صفر 🇩🇪",
    af: "الماني له صفره 🇩🇪",
  },

  // ====== AUTH / LOGIN BOX ======
  auth_title: {
    ar: "تسجيل الدخول / إنشاء حساب",
    en: "Login / Create account",
    uk: "Увійти / Створити акаунт",
    ru: "Вход / Создать аккаунт",
    tr: "Giriş / Hesap oluştur",
    fa: "ورود / ایجاد حساب",
    af: "ننوتل / اکاونټ جوړول",
  },
  auth_subtitle: {
    ar: "اختر اسم مستخدم واحد فقط بدون كلمة سر 👇",
    en: "Choose a single username – no password needed 👇",
    uk: "Виберіть одне ім’я користувача – без пароля 👇",
    ru: "Выберите одно имя пользователя — пароль не нужен 👇",
    tr: "Tek bir kullanıcı adı seç – şifre yok 👇",
    fa: "یک نام کاربری واحد انتخاب کن – بدون رمز 👇",
    af: "یوازې یو یوزر نوم وټاکه – پاسورډ ته اړتیا نشته 👇",
  },
  auth_placeholder: {
    ar: "مثال: NoasHero",
    en: "e.g. NoaHero",
    uk: "наприклад: NoaHero",
    ru: "например: NoaHero",
    tr: "örn: NoaHero",
    fa: "مثلاً: NoaHero",
    af: "لکه: NoaHero",
  },
  auth_btn_register: {
    ar: "إنشاء حساب",
    en: "Create account",
    uk: "Створити акаунт",
    ru: "Создать аккаунт",
    tr: "Hesap oluştur",
    fa: "ایجاد حساب",
    af: "اکاونټ جوړول",
  },
  auth_btn_login: {
    ar: "تسجيل دخول",
    en: "Login",
    uk: "Увійти",
    ru: "Войти",
    tr: "Giriş yap",
    fa: "ورود",
    af: "ننوتل",
  },

  // ====== PLACEMENT TEST (CARD ON LANDING) ======
  level_test_title: {
    ar: "اختبار تحديد المستوى (اختياري)",
    en: "Placement test (optional)",
    uk: "Тест визначення рівня (необов’язковий)",
    ru: "Тест на определение уровня (необязательно)",
    tr: "Seviye belirleme testi (opsiyonel)",
    fa: "آزمون تعیین سطح (اختیاری)",
    af: "د کچې معلومولو ازموینه (اختیاري)",
  },
  level_test_desc: {
    ar: "يمكنك حل أسئلة بسيطة ليقترح لك الموقع المستوى المناسب للبدء (A1 / A2 / B1).",
    en: "Answer a few simple questions and we’ll suggest the right level for you (A1 / A2 / B1).",
    uk: "Відповідайте на кілька простих запитань, і ми підкажемо вам відповідний рівень (A1 / A2 / B1).",
    ru: "Ответьте на несколько простых вопросов — и мы предложим подходящий уровень (A1 / A2 / B1).",
    tr: "Birkaç basit soruya cevap ver, senin için uygun seviyeyi önerelim (A1 / A2 / B1).",
    fa: "به چند سؤال ساده پاسخ بده تا سطح مناسب برایت پیشنهاد شود (A1 / A2 / B1).",
    af: "یو څو ساده پوښتنو ته ځواب ورکړئ څو ستاسو لپاره مناسبه کچه (A1 / A2 / B1) وټاکل شي.",
  },
  btn_take_test: {
    ar: "ابدأ الاختبار الآن 🎯",
    en: "Start the test now 🎯",
    uk: "Почати тест зараз 🎯",
    ru: "Начать тест сейчас 🎯",
    tr: "Teste şimdi başla 🎯",
    fa: "آزمون را همین حالا شروع کن 🎯",
    af: "اوس ازموینه پیل کړه 🎯",
  },

   // ====== RESET APP BUTTON (FOOTER) ======
  reset_app_btn: {
    ar: "🔄 إعادة ضبط الموقع",
    en: "🔄 Reset app",
    uk: "🔄 Скинути застосунок",
    ru: "🔄 Сбросить приложение",
    tr: "🔄 Uygulamayı sıfırla",
    fa: "🔄 ریست کردن برنامه",
    af: "🔄 اپلیکیشن ریست کړه",
  },

  // رسالة التأكيد عند إعادة الضبط
  reset_app_confirm: {
    ar: "هل تريد حقًا إعادة ضبط الموقع وحذف كل التفضيلات والتقدم؟",
    en: "Do you really want to reset the app and delete all preferences and progress?",
    uk: "Ви дійсно хочете скинути застосунок і видалити всі налаштування та прогрес?",
    ru: "Вы действительно хотите сбросить приложение и удалить все настройки и прогресс?",
    tr: "Uygulamayı sıfırlayıp tüm tercihleri ve ilerlemeyi silmek istiyor musun?",
    fa: "واقعاً می‌خواهی برنامه را ریست کنی و همه تنظیمات و پیشرفت را حذف کنی؟",
    af: "رښتيا غواړې اپلیکیشن ریست کړې او ټول تنظیمات او پرمختګ پاک کړې؟",
  },


  // ====== FOOTER TEXT ======
  footer_text: {
    ar: "تعلّم الألمانية خطوة بخطوة 💛",
    en: "Learn German step by step 💛",
    uk: "Вивчай німецьку крок за кроком 💛",
    ru: "Изучай немецкий шаг за шагом 💛",
    tr: "Almancayı adım adım öğren 💛",
    fa: "آلمانی را قدم‌به‌قدم یاد بگیر 💛",
    af: "جرمني ژبه ګام په ګام زده کړه 💛",
  },

  // ====== PLACEMENT BANNER (SMALL CARD) ======
  placement_banner_title: {
    ar: "اختبار تحديد المستوى (اختياري)",
    en: "Placement test (optional)",
    uk: "Тест визначення рівня (необов’язковий)",
    ru: "Тест на определение уровня (необязательно)",
    tr: "Seviye belirleme testi (opsiyonel)",
    fa: "آزمون تعیین سطح (اختیاری)",
    af: "د کچې معلومولو ازموینه (اختیاري)",
  },
  placement_banner_desc: {
    ar: "يمكنك حل ٩ أسئلة سريعة ليقترح لك الموقع المستوى المناسب للبدء.",
    en: "Answer 9 quick questions and we’ll suggest the best level to start.",
    uk: "Відповідайте на 9 швидких запитань, і ми порадимо найкращий рівень для старту.",
    ru: "Ответьте на 9 быстрых вопросов — и мы предложим лучший уровень для начала.",
    tr: "9 kısa soruya cevap ver, senin için en iyi başlangıç seviyesini önerelim.",
    fa: "با پاسخ به ۹ سؤال کوتاه، سطح مناسب شروع را به تو پیشنهاد می‌دهیم.",
    af: "۹ چټکو پوښتنو ته ځواب ورکړئ، موږ به ستاسو لپاره غوره پیل کچه وړاندیز کړو.",
  },
  placement_banner_start: {
    ar: "ابدأ الاختبار الآن 🎯",
    en: "Start test now 🎯",
    uk: "Почати тест 🎯",
    ru: "Начать тест 🎯",
    tr: "Teste başla 🎯",
    fa: "شروع آزمون 🎯",
    af: "ازموینه پیل کړه 🎯",
  },
  placement_banner_later: {
    ar: "لاحقاً",
    en: "Later",
    uk: "Пізніше",
    ru: "Позже",
    tr: "Daha sonra",
    fa: "بعداً",
    af: "وروسته",
  },

  // ====== ABOUT PAGE ======
  about_title: {
    ar: "عن Deutsch Hero",
    en: "About Deutsch Hero",
    uk: "Про Deutsch Hero",
    ru: "О Deutsch Hero",
    tr: "Deutsch Hero hakkında",
    fa: "درباره Deutsch Hero",
    af: "د Deutsch Hero په اړه",
  },
  about_intro: {
    ar: "Deutsch Hero منصة بسيطة وممتعة لمساعدتك على تعلّم الألمانية خطوة بخطوة، من المستوى المبتدئ حتى مواقف الحياة اليومية والعمل.",
    en: "Deutsch Hero is a simple, fun platform that helps you learn German step by step – from complete beginner to everyday and work situations.",
    uk: "Deutsch Hero — це проста й цікава платформа, яка допомагає вивчати німецьку крок за кроком: від початкового рівня до повсякденного спілкування та роботи.",
    ru: "Deutsch Hero — это простая и увлекательная платформа, которая помогает изучать немецкий шаг за шагом — от начального уровня до повседневного общения и работы.",
    tr: "Deutsch Hero, Almancayı adım adım öğrenmen için basit ve eğlenceli bir platformdur; sıfırdan günlük hayat ve iş için gerekli seviyeye kadar.",
    fa: "Deutsch Hero یک پلتفرم ساده و سرگرم‌کننده است که به تو کمک می‌کند آلمانی را قدم‌به‌قدم یاد بگیری؛ از سطح مبتدی تا موقعیت‌های روزمره و شغلی.",
    af: "Deutsch Hero یوه ساده او خوښونکې پلیټفارم ده چې درسره مرسته کوي جرمني ژبه ګام په ګام زده کړې، له صفره تر ورځني ژوند او کار پورې.",
  },
  about_section_mission_title: {
    ar: "مهمتنا",
    en: "Our mission",
    uk: "Наша місія",
    ru: "Наша миссия",
    tr: "Misyonumuz",
    fa: "ماموریت ما",
    af: "زموږ موخه",
  },
  about_section_mission_body: {
    ar: "نريد أن نجعل تعلّم الألمانية متاحًا للجميع، خاصةً للناطقين بالعربية واللغات المجاورة، بدون تعقيد الكتب الثقيلة أو الدورات المملة.",
    en: "We want to make learning German accessible to everyone – especially Arabic speakers and neighboring languages – without heavy textbooks or boring courses.",
    uk: "Ми хочемо зробити вивчення німецької доступним для всіх, особливо для носіїв арабської та сусідніх мов, без важких підручників і нудних курсів.",
    ru: "Мы хотим сделать изучение немецкого доступным для всех, особенно для носителей арабского и соседних языков, без тяжёлых учебников и скучных курсов.",
    tr: "Özellikle Arapça ve çevre dilleri konuşanlar için, ağır kitaplar ve sıkıcı kurslar olmadan Almanca öğrenmeyi herkes için ulaşılabilir yapmak istiyoruz.",
    fa: "ما می‌خواهیم یادگیری آلمانی برای همه در دسترس باشد، مخصوصاً فارسی‌زبانان و همسایه‌ها، بدون کتاب‌های سنگین و دوره‌های خسته‌کننده.",
    af: "موږ غواړو د جرمني زده کړه د ټولو لپاره اسانه کړو، په ځانګړې توګه د عربي او ګاونډیو ژبو ویونکو لپاره، پرته له درنو کتابونو او ستړي کوونکو کورسونو.",
  },
  about_section_how_title: {
    ar: "كيف يعمل Deutsch Hero؟",
    en: "How does Deutsch Hero work?",
    uk: "Як працює Deutsch Hero?",
    ru: "Как работает Deutsch Hero?",
    tr: "Deutsch Hero nasıl çalışır?",
    fa: "Deutsch Hero چطور کار می‌کند؟",
    af: "Deutsch Hero څنګه کار کوي؟",
  },
  about_section_how_body: {
    ar: "تتقدّم عبر دروس قصيرة تفاعلية، مع أمثلة واقعية، صوتيات، وتدريبات خفيفة. يمكنك اختيار لغتك الأم لشرح القواعد والمعاني، بينما تبقى الألمانية هي البطل الرئيسي دائمًا.",
    en: "You progress through short interactive lessons with real-life examples, audio, and light exercises. You choose your native language for explanations, while German stays the main hero.",
    uk: "Ви проходите короткі інтерактивні уроки з прикладами з реального життя, аудіо та легкими вправами. Ви обираєте рідну мову для пояснень, а німецька залишається головним героєм.",
    ru: "Вы проходите короткие интерактивные уроки с примерами из реальной жизни, аудио и простыми упражнениями. Вы выбираете родной язык для объяснений, а немецкий остаётся главным героем.",
    tr: "Gerçek yaşam örnekleri, sesler ve hafif alıştırmalar içeren kısa, etkileşimli derslerle ilerlersin. Açıklamalar için anadilini seçersin; Almanca ise her zaman başroldedir.",
    fa: "با درس‌های کوتاه و تعاملی همراه با مثال‌های واقعی، صوت و تمرین‌های سبک پیش می‌روی. زبان مادری‌ات را برای توضیحات انتخاب می‌کنی و آلمانی همیشه قهرمان اصلی می‌ماند.",
    af: "ته د لنډو متقابلو درسونو له لارې مخ ته ځې، د واقعي ژوند مثالونو، غږیزو فایلونو او اسانو تمرینونو سره. د تشريح لپاره خپله مورنۍ ژبه ټاکې، او جرمني تل اصلي اتل پاتې کېږي.",
  },

  // ====== CONTACT PAGE ======
  contact_title: {
    ar: "اتصل بفريق Deutsch Hero",
    en: "Contact the Deutsch Hero team",
    uk: "Зв’яжіться з командою Deutsch Hero",
    ru: "Свяжитесь с командой Deutsch Hero",
    tr: "Deutsch Hero ekibiyle iletişime geçin",
    fa: "با تیم Deutsch Hero در تماس باش",
    af: "د Deutsch Hero له ټیم سره اړیکه ونیسئ",
  },
  contact_intro: {
    ar: "هل لديك اقتراح، ملاحظة، أو مشكلة تقنية في الموقع؟ يسعدنا أن نسمع منك.",
    en: "Got a suggestion, feedback, or a technical issue with the site? We’d be happy to hear from you.",
    uk: "Маєте пропозицію, відгук або технічну проблему з сайтом? Ми будемо раді почути вас.",
    ru: "Есть предложение, отзыв или техническая проблема с сайтом? Мы будем рады вам помочь.",
    tr: "Bir önerin, geri bildirimin veya siteyle ilgili teknik bir sorunun mu var? Sizden haber almaktan mutluluk duyarız.",
    fa: "پیشنهاد، بازخورد یا مشکلی فنی با سایت داری؟ خوشحال می‌شویم ازت بشنویم.",
    af: "ستاسو وړاندیز، نظر یا تخنیکي ستونزه لرئ؟ موږ خوښ یو چې له تاسو څخه واورو.",
  },
  contact_email_label: {
    ar: "يمكنك مراسلتنا على البريد التالي:",
    en: "You can reach us via email at:",
    uk: "Ви можете написати нам на електронну адресу:",
    ru: "Вы можете связаться с нами по эл. почте:",
    tr: "Bize şu e-posta adresinden ulaşabilirsin:",
    fa: "می‌توانی از طریق این ایمیل با ما در تماس باشی:",
    af: "تاسو کولای شئ د لاندې برېښنالیک له لارې له موږ سره اړیکه ونیسئ:",
  },
  contact_form_hint: {
    ar: "نحن نقرأ جميع الرسائل، لكن قد نحتاج لبعض الوقت للرد 😊",
    en: "We read all messages, but it might take us some time to reply 😊",
    uk: "Ми читаємо всі повідомлення, але відповідь може зайняти трохи часу 😊",
    ru: "Мы читаем все сообщения, но ответ может занять некоторое время 😊",
    tr: "Tüm mesajları okuyoruz, ancak yanıt vermemiz biraz zaman alabilir 😊",
    fa: "همه‌ی پیام‌ها را می‌خوانیم، اما شاید کمی زمان ببرد تا جواب بدهیم 😊",
    af: "موږ ټول پیغامونه لولو، خو ښایي ځواب ته لږ وخت ونیسي 😊",
  },

  // ====== PRIVACY PAGE ======
  privacy_title: {
    ar: "سياسة الخصوصية",
    en: "Privacy Policy",
    uk: "Політика конфіденційності",
    ru: "Политика конфиденциальности",
    tr: "Gizlilik Politikası",
    fa: "سیاست حریم خصوصی",
    af: "د محرميت پاليسي",
  },
  privacy_intro: {
    ar: "نحن نحترم خصوصيتك. نستخدم أقل قدر ممكن من البيانات لتشغيل الموقع وتحسين تجربة التعلّم.",
    en: "We respect your privacy. We only use the minimum amount of data needed to run the site and improve your learning experience.",
    uk: "Ми поважаємо вашу приватність. Ми використовуємо мінімум даних, необхідних для роботи сайту та покращення вашого навчального досвіду.",
    ru: "Мы уважаем вашу конфиденциальность. Мы используем только минимум данных, необходимых для работы сайта и улучшения вашего обучения.",
    tr: "Gizliliğinize saygı duyuyoruz. Siteyi çalıştırmak ve öğrenme deneyimini iyileştirmek için yalnızca minimum veriyi kullanıyoruz.",
    fa: "به حریم خصوصی تو احترام می‌گذاریم. فقط حداقل داده‌ی لازم را برای اجرای سایت و بهتر کردن تجربه‌ی یادگیری استفاده می‌کنیم.",
    af: "موږ ستاسې محرمیت ته درناوی لرو. یوازې لږ تر لږه هغه معلومات کاروو چې د سایټ د چلولو او د زده کړې د تجربې د ښه کولو لپاره اړین دي.",
  },
  privacy_data_title: {
    ar: "ما هي البيانات التي نخزّنها؟",
    en: "What data do we store?",
    uk: "Які дані ми зберігаємо?",
    ru: "Какие данные мы сохраняем?",
    tr: "Hangi verileri saklıyoruz?",
    fa: "چه داده‌هایی را ذخیره می‌کنیم؟",
    af: "کوم معلومات موږ ساتو؟",
  },
  privacy_data_body: {
    ar: "قد نقوم بتخزين اسم المستخدم الذي تختاره، مستوى اللغة الذي وصلت إليه، وبعض الإعدادات المفضلة في متصفحك (localStorage). لا نطلب كلمة سر، ولا نستخدم بياناتك للبيع أو للإعلانات المستهدفة.",
    en: "We may store the username you choose, your current level, and some of your preferences in your browser (localStorage). We do not ask for a password, and we do not sell your data or use it for targeted ads.",
    uk: "Ми можемо зберігати обране вами ім’я користувача, ваш поточний рівень та деякі налаштування в браузері (localStorage). Ми не запитуємо пароль і не продаємо ваші дані та не використовуємо їх для таргетованої реклами.",
    ru: "Мы можем сохранять выбранное вами имя пользователя, ваш текущий уровень и некоторые настройки в браузере (localStorage). Мы не запрашиваем пароль, не продаём ваши данные и не используем их для таргетированной рекламы.",
    tr: "Seçtiğin kullanıcı adını, mevcut seviyeni ve bazı tercihlerini tarayıcında (localStorage) saklayabiliriz. Şifre istemiyoruz, verilerini satmıyor veya hedefli reklam için kullanmıyoruz.",
    fa: "ممکن است نام کاربری انتخابی‌ات، سطح فعلی‌ات و برخی تنظیماتت را در مرورگر (localStorage) ذخیره کنیم. ما رمز عبور نمی‌خواهیم، داده‌هایت را نمی‌فروشیم و برای تبلیغات هدفمند استفاده نمی‌کنیم.",
    af: "موږ ښایي هغه یوزر نوم، اوسنی کچه او ځینې خوښې شوي تنظیمات ستاسې په براوزر (localStorage) کې وساتو. موږ پاسورډ نه غواړو، ستاسو معلومات نه پلورو او نه یې د هدفمند تبلیغ لپاره کاروو.",
  },
  privacy_cookies_title: {
    ar: "ملفات تعريف الارتباط (Cookies)",
    en: "Cookies",
    uk: "Cookies-файли",
    ru: "Cookies",
    tr: "Çerezler (Cookies)",
    fa: "کوکی‌ها (Cookies)",
    af: "کوکيز (Cookies)",
  },
  privacy_cookies_body: {
    ar: "قد نستخدم أدوات تحليل بسيطة لمعرفة أي الصفحات تُستخدم أكثر لتحسين الموقع. يمكنك دائماً حذف بيانات التصفح من إعدادات متصفحك.",
    en: "We may use simple analytics to see which pages are used the most and to improve the site. You can always clear your browsing data from your browser settings.",
    uk: "Ми можемо використовувати просту аналітику, щоб бачити, які сторінки використовуються найчастіше, та покращувати сайт. Ви завжди можете очистити дані перегляду в налаштуваннях браузера.",
    ru: "Мы можем использовать простую аналитику, чтобы видеть, какие страницы используются чаще всего, и улучшать сайт. Вы всегда можете очистить данные просмотра в настройках браузера.",
    tr: "En çok hangi sayfaların kullanıldığını görmek ve siteyi geliştirmek için basit analiz araçları kullanabiliriz. İstersen her zaman tarayıcı ayarlarından gezinme verilerini silebilirsin.",
    fa: "ممکن است از ابزارهای تحلیلی ساده استفاده کنیم تا ببینیم کدام صفحات بیشتر استفاده می‌شوند و سایت را بهتر کنیم. همیشه می‌توانی داده‌های مرور را از تنظیمات مرورگرت پاک کنی.",
    af: "موږ ښایي د ساده انالیتیک وسیلې وکاروو څو وګورو کوم مخونه زیات کارول کېږي او سایټ ښه کړو. تاسې هر وخت کولای شئ د براوزر له تنظیماتو نه خپلې د لټون معلومات پاک کړئ.",
  },
  privacy_contact_title: {
    ar: "الأسئلة المتعلقة بالخصوصية",
    en: "Privacy questions",
    uk: "Питання щодо приватності",
    ru: "Вопросы по конфиденциальности",
    tr: "Gizlilikle ilgili sorular",
    fa: "سؤالات مربوط به حریم خصوصی",
    af: "د محرمیت اړوند پوښتنې",
  },
  privacy_contact_body: {
    ar: "إذا كانت لديك أي أسئلة حول طريقة تعاملنا مع بياناتك، يمكنك التواصل معنا عبر صفحة التواصل.",
    en: "If you have any questions about how we handle your data, you can contact us via the contact page.",
    uk: "Якщо у вас є запитання щодо того, як ми обробляємо ваші дані, ви можете зв’язатися з нами через сторінку контакту.",
    ru: "Если у вас есть вопросы о том, как мы обрабатываем ваши данные, вы можете связаться с нами через страницу контактов.",
    tr: "Verilerini nasıl işlediğimizle ilgili herhangi bir sorunun varsa, iletişim sayfası üzerinden bize ulaşabilirsin.",
    fa: "اگر درباره نحوه‌ی پردازش داده‌هایت سؤالی داری، می‌توانی از طریق صفحه‌ی تماس با ما در ارتباط باشی.",
    af: "که تاسې د خپلو معلوماتو د کارولو په اړه کومه پوښتنه لرئ، کولای شئ د اړیکې له مخ څخه له موږ سره اړیکه ونیسئ.",
  },

  // ====== TERMS PAGE ======
  terms_title: {
    ar: "الشروط والأحكام",
    en: "Terms & Conditions",
    uk: "Умови та положення",
    ru: "Правила и условия",
    tr: "Şartlar ve koşullar",
    fa: "شرایط و ضوابط",
    af: "شرایط او مقررات",
  },
  terms_intro: {
    ar: "باستخدامك لموقع Deutsch Hero، فإنك توافق على استخدامه بشكل مسؤول ومحترم، ووفقًا لهذه الشروط المختصرة.",
    en: "By using Deutsch Hero, you agree to use the site in a responsible and respectful way, according to these brief terms.",
    uk: "Користуючись Deutsch Hero, ви погоджуєтеся використовувати сайт відповідально та з повагою згідно з цими короткими умовами.",
    ru: "Используя Deutsch Hero, вы соглашаетесь пользоваться сайтом ответственно и с уважением, в соответствии с этими краткими условиями.",
    tr: "Deutsch Hero’yu kullanarak, siteyi bu kısa şartlara uygun, sorumlu ve saygılı şekilde kullanmayı kabul etmiş olursun.",
    fa: "با استفاده از Deutsch Hero، تو می‌پذیری که سایت را مطابق با این شرایط کوتاه، به‌شکل مسئولانه و محترمانه استفاده کنی.",
    af: "کله چې Deutsch Hero کاروئ، نو تاسې منئ چې سایټ په مسؤلانه او د درناوي سره د دې لنډو شرطونو له مخې وکاروئ.",
  },
  terms_usage_title: {
    ar: "١. الاستخدام المسموح",
    en: "1. Allowed use",
    uk: "1. Дозволене використання",
    ru: "1. Разрешённое использование",
    tr: "1. İzin verilen kullanım",
    fa: "۱. استفاده مجاز",
    af: "۱. اجازه شوې کارونه",
  },
  terms_usage_body: {
    ar: "الموقع مخصص للاستخدام الشخصي وتعلّم اللغة فقط. يُمنع إساءة استخدام المحتوى، أو نسخه وإعادة نشره بشكل تجاري دون إذن.",
    en: "The site is intended for personal use and language learning only. Misusing the content, or copying and redistributing it commercially without permission, is not allowed.",
    uk: "Сайт призначений лише для особистого користування та вивчення мови. Заборонено неправомірно використовувати контент або комерційно його поширювати без дозволу.",
    ru: "Сайт предназначен только для личного использования и изучения языка. Запрещено неправомерно использовать контент или коммерчески распространять его без разрешения.",
    tr: "Site yalnızca kişisel kullanım ve dil öğrenimi içindir. İçeriği kötüye kullanmak veya izinsiz şekilde ticari olarak kopyalayıp dağıtmak yasaktır.",
    fa: "این سایت فقط برای استفاده‌ی شخصی و یادگیری زبان است. سوءاستفاده از محتوا یا کپی و توزیع تجاری آن بدون اجازه مجاز نیست.",
    af: "سایټ یوازې د شخصي کارونې او د ژبې د زده کړې لپاره دی. د منځپانګې ناوړه کارول یا بې اجازې تجارتي نقل او نشر یې منع دی.",
  },
  terms_content_title: {
    ar: "٢. المحتوى والتغييرات",
    en: "2. Content and changes",
    uk: "2. Контент і зміни",
    ru: "2. Контент и изменения",
    tr: "2. İçerik ve değişiklikler",
    fa: "۲. محتوا و تغییرات",
    af: "۲. منځپانګه او بدلونونه",
  },
  terms_content_body: {
    ar: "قد نقوم بتحديث أو تعديل الدروس والمحتوى في أي وقت لتحسين جودة التعلّم. لا نضمن خلو المحتوى من الأخطاء بشكل كامل، لكننا نحاول تحسينه باستمرار.",
    en: "We may update or change lessons and content at any time to improve the learning experience. We cannot guarantee that all content is error-free, but we continuously try to improve it.",
    uk: "Ми можемо оновлювати або змінювати уроки й контент у будь-який час, щоб покращити навчальний досвід. Ми не можемо гарантувати повну відсутність помилок, але постійно намагаємося все вдосконалювати.",
    ru: "Мы можем обновлять или менять уроки и контент в любое время, чтобы улучшить качество обучения. Мы не можем гарантировать полное отсутствие ошибок, но постоянно стараемся всё улучшать.",
    tr: "Dersleri ve içeriği, öğrenme deneyimini geliştirmek için istediğimiz zaman güncelleyebilir veya değiştirebiliriz. Tüm içerik için %100 hatasızlık garantisi veremeyiz ama sürekli iyileştirmeye çalışıyoruz.",
    fa: "ممکن است هر زمان برای بهتر کردن تجربه‌ی یادگیری، درس‌ها و محتوا را به‌روزرسانی یا اصلاح کنیم. نمی‌توانیم تضمین کنیم همه‌ی محتوا کاملاً بدون خطاست، اما مدام در تلاش برای بهتر کردن آن هستیم.",
    af: "موږ ښایي هر وخت درسونه او منځپانګه نوې یا بدله کړو څو د زده کړې تجربه ښه شي. نشو تضمینولای چې ټول منځپانګه له تېروتنو پاکه وي، خو تل د ښه کولو لپاره کار کوو.",
  },
  terms_changes_title: {
    ar: "٣. تحديث هذه الشروط",
    en: "3. Updates to these terms",
    uk: "3. Оновлення цих умов",
    ru: "3. Обновление этих условий",
    tr: "3. Bu şartların güncellenmesi",
    fa: "۳. به‌روزرسانی این شرایط",
    af: "۳. د دې شرطونو تازه کول",
  },
  terms_changes_body: {
    ar: "قد نقوم بتعديل هذه الشروط من حين لآخر. استمرارك في استخدام الموقع بعد أي تحديث يعني موافقتك على الشروط الجديدة.",
    en: "We may update these terms from time to time. Continuing to use the site after any update means you accept the new terms.",
    uk: "Ми можемо час від часу змінювати ці умови. Якщо ви продовжуєте користуватися сайтом після оновлення, це означає, що ви погоджуєтесь із новими умовами.",
    ru: "Мы можем время от времени обновлять эти условия. Продолжая пользоваться сайтом после обновления, вы соглашаетесь с новыми условиями.",
    tr: "Bu şartları zaman zaman güncelleyebiliriz. Sitede kalmaya devam etmen, yeni şartları kabul ettiğin anlamına gelir.",
    fa: "ممکن است هر از گاهی این شرایط را به‌روزرسانی کنیم. ادامه‌ی استفاده‌ی تو از سایت بعد از هر به‌روزرسانی یعنی با شرایط جدید موافقی.",
    af: "موږ کېدای شي ځینې وختونه دا شرایط تازه کړو. له هر بدلون وروسته که له سایټ څخه کار ته دوام ورکوئ، نو دا مانا لري چې له نويو شرطونو سره موافق یاست.",
  },
};


function applyUiLanguage() {
  const strings = getStrings();

  // عنوان التبويب واسم الشعار (لو موجودين في الصفحة)
  document.title = strings.appName;
  const logoTextEl = document.querySelector('.logo-text');
  if (logoTextEl) logoTextEl.textContent = strings.appName;

  // نص الفوتر (الوصف القصير)
  const footerSpan = document.querySelector('.app-footer-text');
  if (footerSpan) footerSpan.textContent = strings.appTagline;

  // شارة المستوى في الهيدر (موجودة فقط في الصفحة الرئيسية)
  if (typeof levelLabelEl !== "undefined" && levelLabelEl) {
    levelLabelEl.textContent = strings.levelLabel(currentLevelKey);
  }

  // اتجاه الصفحة حسب اللغة
  const rtlLangs = ['ar', 'fa', 'af'];
  document.documentElement.lang = motherLang || 'ar';
  document.documentElement.dir = rtlLangs.includes(motherLang) ? 'rtl' : 'ltr';

  // اختيار لغة الترجمة
  const supportedUiLangs = ['ar', 'en', 'uk', 'ru', 'tr', 'fa', 'af'];
  const langKey = supportedUiLangs.includes(motherLang) ? motherLang : 'ar';

  // ترجمة كل العناصر التي تحمل data-i18n (الصفحة الرئيسية وبعض العناصر الأخرى)
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const dict = UI_TRANSLATIONS[key];
    if (!dict) return;

    const value = dict[langKey] || dict.ar || '';

    // لو كان input أو textarea → نضعها كـ placeholder
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = value;
    } else {
      el.textContent = value;
    }
  });

  // ✅ إصلاح أزرار: الرئيسية / من نحن / تواصل معنا / الخصوصية / الشروط
  // حتى في الصفحات الثابتة (about / contact / privacy / terms) التي ليس فيها data-i18n
  const navLinks = document.querySelectorAll('.main-nav .nav-link');
  if (navLinks.length && typeof UI_TRANSLATIONS !== 'undefined') {
    navLinks.forEach((link) => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      let key = null;

      if (
        href === '' ||
        href === '#' ||
        href.endsWith('index.html')
      ) {
        key = 'menu_home';
      } else if (href.includes('about.html')) {
        key = 'menu_about';
      } else if (href.includes('contact.html')) {
        key = 'menu_contact';
      } else if (href.includes('privacy.html')) {
        key = 'menu_privacy';
      } else if (href.includes('terms.html')) {
        key = 'menu_terms';
      }

      if (key && UI_TRANSLATIONS[key]) {
        const dict = UI_TRANSLATIONS[key];
        const value = dict[langKey] || dict.ar || '';
        if (value) {
          link.textContent = value;
        }
      }
    });
  }
}




// 🟢 بناء أسماء ملفات JSON
function buildLessonsFilename(target, mother, level) {
  return `data/lessons-${target}-${mother}-${level}.json`.toLowerCase();
}
function buildLegacyLessonsFilename(target, mother) {
  return `data/lessons-${target}-${mother}.json`.toLowerCase();
}
function buildGrammarFilename(target, mother, level) {
  return `data/grammar-${target}-${mother}-${level}.json`.toLowerCase();
}

// ملف امتحان نهاية المستوى (A2 / B1)
function buildExamFilename(target, mother, level) {
  return `data/exam-${target}-${mother}-${level}.json`.toLowerCase();
}


// 🟢 تطبيع JSON الدروس
function normalizeLessonsJson(raw) {
  if (!raw) return null;

  if (raw.levels) {
    const lvl = raw.levels[currentLevelKey] || Object.values(raw.levels)[0];
    if (!lvl) return null;
    return {
      level: currentLevelKey,
      title: lvl.title || getStrings().levelLabel(currentLevelKey),
      lessons: Array.isArray(lvl.lessons) ? lvl.lessons : []
    };
  }

  if (Array.isArray(raw.lessons)) {
    return {
      level: raw.level || currentLevelKey,
      title: raw.title || getStrings().levelLabel(currentLevelKey),
      lessons: raw.lessons
    };
  }

  if (Array.isArray(raw)) {
    return {
      level: currentLevelKey,
      title: getStrings().levelLabel(currentLevelKey),
      lessons: raw
    };
  }

  return null;
}

// 🟢 تطبيع JSON القواعد
function normalizeGrammarJson(raw) {
  const strings = getStrings();
  if (!raw) {
    return {
      level: currentLevelKey,
      title: strings.grammarLevelLabel(currentLevelKey),
      lessons: []
    };
  }

  if (Array.isArray(raw.grammar)) {
    return {
      level: raw.level || currentLevelKey,
      title: raw.title || strings.grammarLevelLabel(currentLevelKey),
      lessons: raw.grammar
    };
  }

  if (Array.isArray(raw.lessons)) {
    return {
      level: raw.level || currentLevelKey,
      title: raw.title || strings.grammarLevelLabel(currentLevelKey),
      lessons: raw.lessons
    };
  }

  if (Array.isArray(raw.items)) {
    return {
      level: raw.level || currentLevelKey,
      title: raw.title || strings.grammarLevelLabel(currentLevelKey),
      lessons: raw.items
    };
  }

  if (Array.isArray(raw)) {
    return {
      level: currentLevelKey,
      title: strings.grammarLevelLabel(currentLevelKey),
      lessons: raw
    };
  }

  return {
    level: currentLevelKey,
    title: raw.title || strings.grammarLevelLabel(currentLevelKey),
    lessons: []
  };
}

// 🟢 تحميل الدروس
async function loadLessons() {
  const fileMain = buildLessonsFilename(targetLang, motherLang, currentLevelKey);
  let res;
  try {
    res = await fetch(fileMain);
  } catch (e) {
    console.warn('Fetch error (lessons):', e);
    lessonsData = null;
    return;
  }

  if (!res.ok && currentLevelKey === 'A1') {
    const legacy = buildLegacyLessonsFilename(targetLang, motherLang);
    try {
      res = await fetch(legacy);
    } catch (e) {
      console.warn('Legacy fetch error:', e);
      lessonsData = null;
      return;
    }
  }

  if (!res.ok) {
    console.warn('لم يتم العثور على ملف الدروس:', fileMain);
    lessonsData = null;
    return;
  }

  const txt = await res.text();
  try {
    const raw = JSON.parse(txt);
    lessonsData = normalizeLessonsJson(raw);
  } catch (e) {
    console.error('خطأ عند تحليل ملف الدروس:', e);
    lessonsData = null;
  }
}

// 🟢 تحميل القواعد
async function loadGrammar() {
  const file = buildGrammarFilename(targetLang, motherLang, currentLevelKey);
  try {
    const res = await fetch(file);
    if (!res.ok) {
      console.warn('لم يتم العثور على ملف القواعد:', file);
      grammarData = normalizeGrammarJson(null);
      return;
    }
    const txt = await res.text();
    const raw = JSON.parse(txt);
    grammarData = normalizeGrammarJson(raw);
  } catch (e) {
    console.error('خطأ في تحميل ملف القواعد:', e);
    grammarData = normalizeGrammarJson(null);
  }
}



// =======================
// 🎓 امتحان نهاية المستوى (A2 / B1)
// =======================

async function loadExamForLevel(levelKey) {
  const file = buildExamFilename(targetLang, motherLang, levelKey);
  try {
    const res = await fetch(file);
    if (!res.ok) {
      throw new Error('لم يتم العثور على ملف الامتحان: ' + file);
    }
    const txt = await res.text();
    const raw = JSON.parse(txt);
    if (!raw || !Array.isArray(raw.questions)) {
      throw new Error('تنسيق ملف الامتحان غير متوقَّع: ' + file);
    }
    return raw;
  } catch (e) {
    console.error('خطأ في تحميل ملف الامتحان:', e);
    throw e;
  }
}
// ترجع عدد معيّن من العناصر العشوائية من مصفوفة
function getRandomSubset(array, count) {
  const copy = array.slice(); // ننسخ المصفوفة الأصلية
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

async function startLevelExam(levelKey) {
  try {
    const examData = await loadExamForLevel(levelKey);

    // كل الأسئلة من ملف JSON
    const allQuestions = Array.isArray(examData.questions)
      ? examData.questions
      : [];

    // نختار 10 أسئلة عشوائية فقط
    const selectedQuestions = getRandomSubset(allQuestions, 10);

    // نخزن نسخة الامتحان مع الأسئلة المختارة فقط
    currentExam = {
      ...examData,
      questions: selectedQuestions
    };

    currentExamIndex = 0;
    currentExamCorrect = 0;
    currentMode = 'exam';
    renderExamQuestion();
  } catch (e) {
    console.error('خطأ في تحميل/بدء الامتحان:', e);
    const strings = getStrings();
    appEl.innerHTML = `
      <div class="card view-fade-in">
        <h2 class="card-title">امتحان هذا المستوى غير متوفر</h2>
        <p class="card-subtitle">
          تعذّر تحميل ملف الامتحان لهذا المستوى (${levelKey}). تأكد من وجود الملف داخل مجلد <code>data</code>.
        </p>
        <button id="exam-back" class="btn btn-ghost">
          ${strings.backToLevels}
        </button>
      </div>
      

    `;
    const backBtn = document.getElementById('exam-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        renderLevelView();
      });
    }
  }
}

function renderExamQuestion() {
  if (!currentExam || !Array.isArray(currentExam.questions)) {
    renderLevelView();
    return;
  }

  const strings = getStrings();
  const questions = currentExam.questions;
  const total = questions.length;
  const q = questions[currentExamIndex];

  if (!q) {
    finishLevelExam();
    return;
  }

  const qNumber = currentExamIndex + 1;

  // 🔹 عنوان الامتحان حسب اللغة المختارة
  const levelKey = currentExam.level || currentLevelKey || '';
  const examTitle =
    typeof strings.examButtonLabel === 'function'
      ? strings.examButtonLabel(levelKey)
      : (currentExam.title_ar || `امتحان مستوى ${levelKey}`);

  // 🔹 الجملة تحت العنوان (رقم السؤال من عدد الأسئلة) حسب اللغة
  const subtitle =
    typeof strings.stepIndicator === 'function'
      ? strings.stepIndicator(qNumber, total)
      : `سؤال ${qNumber} من ${total}`;

  // 🔹 نصوص صح/خطأ متعددة اللغات
  const correctMsg = strings.quizCorrect || 'إجابة صحيحة 🎉';
  const wrongMsg =
    strings.quizWrong ||
    'إجابة خاطئة، راجع هذا الموضوع في الدروس ثم جرّب مرة أخرى.';

  appEl.innerHTML = `
    <div class="card view-fade-in quiz-card exam-card">
      <h2 class="card-title">
        ${examTitle}
      </h2>
      <p class="card-subtitle">
        ${subtitle}
      </p>

      <div class="exam-question-block">
        ${
          q.question_de
            ? `<div class="exam-question-de">${q.question_de}</div>`
            : ''
        }
        ${
          q.question_ar
            ? `<div class="scene-text" style="margin-top:0.5rem;">${q.question_ar}</div>`
            : ''
        }
      </div>

      <div class="quiz-options" style="margin-top:0.75rem;">
        ${
          (q.options || [])
            .map(
              (opt, index) => `
          <button
            class="btn btn-secondary btn-small quiz-option-btn"
            data-index="${index}"
          >
            ${opt}
          </button>
        `
            )
            .join('')
        }
      </div>

      <div id="exam-feedback" class="quiz-feedback" style="margin-top:0.75rem;"></div>

      <div style="margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
        <button id="exam-cancel" class="btn btn-ghost btn-small">
          ${strings.backToLevels}
        </button>
      </div>
    </div>
  `;

  const cardEl = document.querySelector('.exam-card');
  const btns = document.querySelectorAll('.quiz-option-btn');
  const feedbackEl = document.getElementById('exam-feedback');
  const cancelBtn = document.getElementById('exam-cancel');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-index'));
      btns.forEach((b) => (b.disabled = true));

      // ننضف أي حالة سابقة
      if (feedbackEl) {
        feedbackEl.innerHTML = '';
        feedbackEl.className = 'quiz-feedback';
      }
      if (cardEl) {
        cardEl.classList.remove('quiz-correct-flash', 'quiz-wrong-flash');
      }

      const correctIndex = q.answer;

      if (idx === correctIndex) {
        // ✅ اختيار صحيح
        btn.classList.add('correct');

        if (feedbackEl) {
          feedbackEl.innerHTML = `
            <div class="feedback-chip feedback-chip-correct">
              <span class="feedback-icon">✅</span>
              <span>${correctMsg}</span>
            </div>
          `;
          feedbackEl.classList.add('correct');
        }

        if (cardEl) {
          cardEl.classList.add('quiz-correct-flash');
        }

        currentExamCorrect += 1;
        triggerConfetti();
      } else {
        // ❌ اختيار خاطئ
        btn.classList.add('wrong');

        // إظهار الجواب الصحيح بلطف
        const correctBtn = Array.from(btns).find(
          (b) => Number(b.getAttribute('data-index')) === correctIndex
        );
        if (correctBtn) {
          correctBtn.classList.add('correct');
        }

        if (feedbackEl) {
          feedbackEl.innerHTML = `
            <div class="feedback-chip feedback-chip-wrong">
              <span class="feedback-icon">❌</span>
              <span>${wrongMsg}</span>
            </div>
          `;
          feedbackEl.classList.add('wrong');
        }

        if (cardEl) {
          cardEl.classList.add('quiz-wrong-flash');
        }
      }

      // ننتقل للسؤال اللي بعده بعد لحظة قصيرة
      setTimeout(() => {
        currentExamIndex += 1;
        renderExamQuestion();
      }, 1100);
    });
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      renderLevelView();
    });
  }
}



function finishLevelExam() {
  const strings = getStrings();

  if (!currentExam || !Array.isArray(currentExam.questions)) {
    renderLevelView();
    return;
  }

  const total = currentExam.questions.length;
  const correct = currentExamCorrect;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  const levelKey = currentExam.level || currentLevelKey;
  const storageKey = `exam-result-${levelKey}`;

  // نخزن النتيجة في localStorage
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      correct,
      total,
      percent,
      time: Date.now()
    })
  );

  appEl.innerHTML = `
    <div class="card view-fade-in">
      <h2 class="card-title">نتيجة امتحان مستوى ${levelKey}</h2>
      <p class="card-subtitle">
        أجبت إجابة صحيحة على ${correct} من أصل ${total} سؤال (${percent}%)
      </p>

      <div class="scene-text" style="margin-top:0.75rem;">
        ${
          percent >= 70
            ? '🎉 أحسنت! يمكنك الانتقال للمستوى التالي أو متابعة مراجعة هذا المستوى.'
            : 'النتيجة أقل من 70٪. تحتاج إلى مراجعة بعض الدروس ثم إعادة الامتحان قبل الانتقال للمستوى التالي.'
        }
      </div>

      <div style="margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
        <button id="exam-repeat" class="btn btn-secondary btn-small">
          إعادة الامتحان
        </button>
        <button id="exam-back-level" class="btn btn-ghost btn-small">
          العودة لدروس مستوى ${levelKey}
        </button>
      </div>
    </div>
  `;

  const repeatBtn = document.getElementById('exam-repeat');
  const backBtn = document.getElementById('exam-back-level');

  if (repeatBtn) {
    repeatBtn.addEventListener('click', () => {
      currentExamIndex = 0;
      currentExamCorrect = 0;
      renderExamQuestion();
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      renderLevelView();
    });
  }
}

// تجيب نتيجة الامتحان من localStorage لمستوى معيّن
function getExamResult(levelKey) {
  const raw = localStorage.getItem(`exam-result-${levelKey}`);
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (!obj || typeof obj.percent !== 'number') return null;
    return obj;
  } catch (e) {
    return null;
  }
}

// تعرض رسالة أن المستوى مقفول بسبب عدم النجاح في الامتحان السابق
function showExamGateMessage(requiredLevel, blockedLevel) {
  const strings = getStrings();

  const title = strings.levelLockedTitle || 'Level locked 🔒';
  const body = strings.levelLockedBody
    ? strings.levelLockedBody(requiredLevel, blockedLevel)
    : `You can’t continue to level ${blockedLevel} until you pass the level ${requiredLevel} exam with at least 70%.`;

  const hint1 = strings.levelLockedHint1
    ? strings.levelLockedHint1(requiredLevel)
    : `Go to level ${requiredLevel} and click the level exam button.`;

  const hint2 = strings.levelLockedHint2
    ? strings.levelLockedHint2(requiredLevel, blockedLevel)
    : `After you score 70% or more, you can unlock level ${blockedLevel}.`;

  appEl.innerHTML = `
    <div class="card view-fade-in">
      <h2 class="card-title">${title}</h2>
      <p class="card-subtitle">
        ${body}
      </p>
      <div class="scene-text" style="margin-top:0.75rem;">
        <p>${hint1}</p>
        <p>${hint2}</p>
      </div>
      <button id="gate-back" class="btn btn-ghost btn-small">
        ${strings.backToLanding}
      </button>
    </div>
  `;

  const backBtn = document.getElementById('gate-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      renderLanding();
    });
  }
}


// =======================
// 🎛 Theme Switcher
// =======================
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("app-theme", next);
}

// =======================
// 🎨 Theme Loader
// =======================
function initTheme() {
  const saved = localStorage.getItem("app-theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
}
initTheme();

// 🟢 صفحة البداية (اختيار اللغة + المستوى)
function renderLanding() {
  applyUiLanguage();
  const strings = getStrings();

  appEl.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card landing-container view-fade-in';

  const levelOptions = SUPPORTED_LEVELS
    .map(
      (lvl) => `
        <option value="${lvl}" ${lvl === currentLevelKey ? 'selected' : ''}>
          ${lvl}
        </option>
      `
    )
    .join('');

  card.innerHTML = `
    <div class="landing-emoji">🗣️✨</div>
    <h1 class="landing-title">
      ${strings.appName}
      <span class="landing-highlight">${strings.appTagline}</span>
    </h1>

    <div class="landing-options">
      <div>
        <div class="label">${strings.chooseMotherLangTitle}</div>
        <select id="mother-lang-select" class="select">
          <option value="ar"${motherLang === 'ar' ? ' selected' : ''}>العربية</option>
          <option value="en"${motherLang === 'en' ? ' selected' : ''}>English</option>
          <option value="ru"${motherLang === 'ru' ? ' selected' : ''}>Русский</option>
          <option value="fa"${motherLang === 'fa' ? ' selected' : ''}>فارسی</option>
          <option value="af"${motherLang === 'af' ? ' selected' : ''}>افغانية</option>
          <option value="uk"${motherLang === 'uk' ? ' selected' : ''}>Українська</option>
          <option value="tr"${motherLang === 'tr' ? ' selected' : ''}>Türkçe</option>
        </select>
      </div>

      <div>
        <div class="label">Deutsch</div>
        <select id="target-lang-select" class="select" disabled>
          <option value="de">Deutsch (German)</option>
        </select>
      </div>

      <div>
        <div class="label">${strings.levelLabel('')}</div>
        <select id="level-select" class="select">
          ${levelOptions}
        </select>
      </div>

      <button id="start-btn" class="btn btn-primary">
        ${strings.startButton}
      </button>
    </div>

    <div style="margin-top:1rem; display:flex; justify-content:center; gap:0.5rem; flex-wrap:wrap;">
      <button id="open-grammar" class="btn btn-secondary">
        ${strings.grammarButton}
      </button>
    </div>
  `;

  appEl.appendChild(card);
    // عرض دعوة لاختبار تحديد المستوى في أوّل زيارة
  showPlacementInvite();


  const motherSelect = document.getElementById('mother-lang-select');
  motherSelect.addEventListener('change', () => {
    motherLang = motherSelect.value;
    savePrefs();
    applyUiLanguage();
    renderLanding();
  });

   document.getElementById('start-btn').addEventListener('click', async () => {
    motherLang = motherSelect.value;
    targetLang = 'de';
    const requestedLevel = document.getElementById('level-select').value;

    // 🔒 منطق القفل:
    // مستوى B1 مقفول إذا ما نجح في امتحان A2 بنسبة 70٪ أو أكثر
    if (false) {
      const a2Result = getExamResult('A2');
      if (!a2Result || a2Result.percent < 70) {
        showExamGateMessage('A2', 'B1');
        return;
      }
    }

    // (اختياري) لو حابب تقفل B2 على نتيجة B1
    if (false) {
      const b1Result = getExamResult('B1');
      if (!b1Result || b1Result.percent < 70) {
        showExamGateMessage('B1', 'B2');
        return;
      }
    }

    currentLevelKey = requestedLevel;
    currentMode = 'lessons';
    savePrefs();
    applyUiLanguage();
    await loadLessons();
    renderLevelView();
  });


  document.getElementById('open-grammar').addEventListener('click', async () => {
    motherLang = motherSelect.value;
    targetLang = 'de';
    currentLevelKey = document.getElementById('level-select').value;
    currentMode = 'grammar';
    savePrefs();
    applyUiLanguage();
    await loadGrammar();
    renderGrammarLevelView();
  });
}

// 🟢 عرض قائمة دروس المستوى
function renderLevelView() {
  applyUiLanguage();
  const strings = getStrings();

  if (!lessonsData || !lessonsData.lessons || lessonsData.lessons.length === 0) {
    const code = `${targetLang}-${motherLang}`;
    appEl.innerHTML = `
      <div class="card">
        <h3>${strings.noLessonsForLevel(currentLevelKey, code)}</h3>
        <button class="btn btn-ghost" id="back-to-landing-empty">
          ${strings.backToLanding}
          <div class="share-container">
  <button class="btn-share" id="share-lesson" data-i18n="share_this_lesson">
    🔗 Share this lesson
  </button>
</div>

        </button>
      </div>
      <div class="share-container">
  <button class="btn-share" id="share-lesson" data-i18n="share_this_lesson"></button>
</div>

    `;
    const backBtn = document.getElementById('back-to-landing-empty');
    backBtn.addEventListener('click', () => renderLanding());
    levelLabelEl.textContent = strings.levelLabel(currentLevelKey);
    return;
  }

  const level = lessonsData;
  levelLabelEl.textContent = level.title || strings.levelLabel(currentLevelKey);

  const lessons = level.lessons;

  // نثبت مفتاح لكل درس
  lessons.forEach((lesson, index) => {
    if (!lesson._key) {
      lesson._key = lesson.id || `${currentLevelKey}-lesson-${index}`;
    }
  });

  const completedCount = lessons.filter((l) => completedLessons.has(l._key)).length;

  appEl.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card view-fade-in';

  const levelTabsHtml = SUPPORTED_LEVELS
    .map((lvl) => {
      const active = lvl === currentLevelKey ? 'level-tab-active' : '';
      return `
        <button class="level-tab ${active}" data-level="${lvl}">
          ${lvl}
        </button>
      `;
    })
    .join('');

  card.innerHTML = `
    <div class="level-header">
      <div>
        <div class="level-title">${replaceName(
          level.title || strings.levelLabel(currentLevelKey)
        )}</div>
        <div class="landing-text">
          ${strings.lessonListIntro}
        </div>
        <div class="level-tabs">
          ${levelTabsHtml}
        </div>
      </div>
      <div class="progress-badge">
        ${completedCount} / ${lessons.length}
      </div>
    </div>

        <div class="lessons-grid" id="lessons-grid"></div>

    


<div style="margin-top:1rem; display:flex; justify-content:flex-start; gap:0.5rem; flex-wrap:wrap;">
  <button id="back-to-landing" class="btn btn-ghost btn-small">
    ${strings.backToLevels}
  </button>

  <button id="open-grammar-from-level" class="btn btn-secondary btn-small">
    ${strings.grammarButton}
  </button>

 

  <button
    id="open-exam-current-level"
    class="btn btn-primary btn-small"
    style="display:none;"
  >
    ${strings.examButtonLabel(currentLevelKey)}
  </button>
</div>


  `;

  appEl.appendChild(card);

  // تفعيل زر امتحان المستوى فقط لـ A2 و B1
  const examBtn = document.getElementById('open-exam-current-level');
  if (examBtn) {
    if (currentLevelKey === 'A2' || currentLevelKey === 'B1') {
      examBtn.style.display = 'inline-flex';
      examBtn.addEventListener('click', () => {
        startLevelExam(currentLevelKey);
      });
    }
  }

  const grid = document.getElementById('lessons-grid');

  lessons.forEach((lesson, index) => {
    const isCompleted = completedLessons.has(lesson._key);

    const lessonEl = document.createElement('div');
    lessonEl.className = 'lesson-card';

    let statusHtml = '';
    if (isCompleted) {
      statusHtml = `<span class="lesson-badge-completed">${strings.completed}</span>`;
    } else {
      statusHtml = `<span class="lesson-chip">${strings.readyChip}</span>`;
    }

    lessonEl.innerHTML = `
      <div class="lesson-title">
        ${strings.lessonPrefix} ${index + 1}: ${replaceName(
      lesson.title?.ar || lesson.title?.de || ''
    )}
      </div>
      <div class="lesson-subtitle">
        ${replaceName(lesson.title?.de || '')}
      </div>
      <div class="lesson-chip-row">
        ${statusHtml}
        <span class="lesson-chip">
          ${strings.levelChip(currentLevelKey)}
        </span>
      </div>
    `;

    lessonEl.addEventListener('click', () => {
      currentMode = 'lessons';
      currentLessonId = lesson._key;
      currentLessonStep = 0;
      renderLessonPage(lesson);
    });

    grid.appendChild(lessonEl);
  });

  document.getElementById('back-to-landing').addEventListener('click', () => {
    renderLanding();
  });

  document
    .getElementById('open-grammar-from-level')
    .addEventListener('click', async () => {
      currentMode = 'grammar';
      await loadGrammar();
      renderGrammarLevelView();
    });

  document.querySelectorAll('.level-tab').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const lvl = btn.getAttribute('data-level');
      if (lvl && lvl !== currentLevelKey) {
        currentLevelKey = lvl;
        savePrefs();
        await loadLessons();
        renderLevelView();
      }
    });
  });
}







// 🟢 قائمة دروس القواعد
function renderGrammarLevelView() {
  applyUiLanguage();
  const strings = getStrings();
  const fileName = buildGrammarFilename(targetLang, motherLang, currentLevelKey);

  if (
    !grammarData ||
    !Array.isArray(grammarData.lessons) ||
    grammarData.lessons.length === 0
  ) {
    appEl.innerHTML = `
      <div class="card">
        <h3>${strings.noGrammarForLevel(currentLevelKey, fileName)}</h3>
        <button class="btn btn-ghost" id="back-to-landing-empty-gram">
          ${strings.backToLanding}
        </button>
      </div>
    `;
    document
      .getElementById('back-to-landing-empty-gram')
      .addEventListener('click', () => renderLanding());
    levelLabelEl.textContent = strings.grammarLevelLabel(currentLevelKey);
    return;
  }

  const levelTitle =
    grammarData.title || strings.grammarLevelLabel(currentLevelKey);
  const lessons = grammarData.lessons;
  levelLabelEl.textContent = levelTitle;

  // تثبيت مفتاح لكل قاعدة
  lessons.forEach((lesson, index) => {
    if (!lesson._key) {
      lesson._key = lesson.id || `${currentLevelKey}-grammar-${index}`;
    }
  });

  appEl.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card view-fade-in';

  const levelTabsHtml = SUPPORTED_LEVELS
    .map((lvl) => {
      const active = lvl === currentLevelKey ? 'level-tab-active' : '';
      return `
        <button class="level-tab ${active}" data-level="${lvl}">
          ${lvl}
        </button>
      `;
    })
    .join('');

  card.innerHTML = `
    <div class="level-header">
      <div>
        <div class="level-title">${replaceName(levelTitle)}</div>
        <div class="landing-text">
          ${strings.grammarListIntro}
        </div>
        <div class="level-tabs">
          ${levelTabsHtml}
        </div>
      </div>
      <div class="progress-badge">
        ${lessons.length}
      </div>
    </div>

    <div class="lessons-grid" id="grammar-lessons-grid"></div>

    <div style="margin-top:1rem; display:flex; justify-content:flex-start; gap:0.5rem; flex-wrap:wrap;">
      <button id="back-to-landing-from-grammar" class="btn btn-ghost btn-small">
        ${strings.backToLanding}
      </button>
    </div>
  `;

  appEl.appendChild(card);

  const grid = document.getElementById('grammar-lessons-grid');

  lessons.forEach((lesson, index) => {
    const isCompleted = completedLessons.has(lesson._key);

    const lessonEl = document.createElement('div');
    lessonEl.className = 'lesson-card';

    // 🎯 إبراز الدرس المنتهي
if (isCompleted) {
  lessonEl.classList.add('completed');
}

// 🎯 إبراز الدرس الحالي (آخر درس فتحه المستخدم)
const lastOpened = localStorage.getItem("lastOpenedLesson");
if (lastOpened && lastOpened === lesson._key) {
  lessonEl.classList.add('current');
}


    let statusHtml = '';
    if (isCompleted) {
      statusHtml = `<span class="lesson-badge-completed">${strings.grammarCompleted}</span>`;
    } else {
      statusHtml = `<span class="lesson-chip">${strings.readyChip}</span>`;
    }

    lessonEl.innerHTML = `
      <div class="lesson-title">
        ${strings.grammarPrefix} ${index + 1}: ${replaceName(
      lesson.title?.ar || lesson.title?.de || ''
    )}
      </div>
      <div class="lesson-subtitle">${replaceName(lesson.title?.de || '')}</div>
      <div class="lesson-chip-row">
        ${statusHtml}
        <span class="lesson-chip">${strings.levelChip(currentLevelKey)}</span>
      </div>
    `;

    lessonEl.addEventListener('click', () => {
      currentMode = 'grammar';
      currentLessonId = lesson._key;
      currentLessonStep = 0;
      localStorage.setItem("lastOpenedLesson", lesson._key);

      renderLessonPage(lesson);
    });

    grid.appendChild(lessonEl);
  });

  document
    .getElementById('back-to-landing-from-grammar')
    .addEventListener('click', () => {
      renderLanding();
    });

  document.querySelectorAll('.level-tab').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const lvl = btn.getAttribute('data-level');
      if (lvl && lvl !== currentLevelKey) {
        currentLevelKey = lvl;
        savePrefs();
        await loadGrammar();
        renderGrammarLevelView();
      }
    });
  });
}




// 🟢 توليد محتوى كل خطوة
function renderStepContent(lesson, stepKey, strings) {

    // 🔤 اختيار الترجمة حسب لغة المستخدم (ar, en, uk, ru, tr, fa, af)
  const getNativeText = (obj) => {
    if (!obj || typeof obj !== 'object') return '';

    // أولاً: لغة الواجهة المختارة
    if (motherLang && obj[motherLang]) {
      return replaceName(obj[motherLang]);
    }

    // ثانياً: fallback لو لغتك غير موجودة
    const fallbackOrder = ['ar', 'en', 'uk', 'ru', 'tr', 'fa', 'af'];
    for (const lang of fallbackOrder) {
      if (obj[lang]) {
        return replaceName(obj[lang]);
      }
    }

    return '';
  };

  // 1) المشهد التفاعلي
  if (stepKey === 'scene') {
    const raw = lesson.interactiveScene || '';
    if (!raw.trim()) {
      return `<p class="scene-text">لا يوجد مشهد تفاعلي مضاف لهذا الدرس بعد. ✨</p>`;
    }

    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const hasArabic = (s) => /[\u0600-\u06FF]/.test(s);
    const hasLatin = (s) => /[A-Za-zÄÖÜäöüß]/.test(s);

    const htmlParts = [];

    for (let i = 0; i < lines.length; i++) {
      const line = replaceName(lines[i]);

      // عنوان صغير في المشهد
      if (
        line.startsWith('🎬') ||
        line.startsWith('🌅') ||
        line.startsWith('🌙') ||
        line.startsWith('🏙') ||
        line.endsWith('...') ||
        line.endsWith(':')
      ) {
        htmlParts.push(`
          <p class="scene-subtitle">
            ${highlightGermanInText(line)}
          </p>
        `);
        continue;
      }

      // سطر ألماني وبعده مباشرة ترجمة عربية
      const next = lines[i + 1] ? replaceName(lines[i + 1]) : null;
      if (hasLatin(line) && next && hasArabic(next) && !hasLatin(next)) {
        const deSentence = line;
        const arSentence = next;
        const audioSrc = germanToAudioFilename(deSentence);

        htmlParts.push(`
          <div class="scene-row">
            <div class="scene-row-de">
              <button class="btn btn-ghost btn-small audio-btn scene-audio-btn" data-audio="${audioSrc}">
                ${strings.audioLabel}
              </button>
              <span class="de-text">${highlightGermanInText(deSentence)}</span>
            </div>
            <div class="scene-row-ar">
              ${arSentence}
            </div>
          </div>
        `);
        i++; // استخدمنا السطر التالي
        continue;
      }

      // أي سطر عادي
      htmlParts.push(`
        <p class="scene-body-text">
          ${highlightGermanInText(line)}
        </p>
      `);
    }

    return htmlParts.join('');
  }

  // 2) الشرح الذكي السريع
  if (stepKey === 'explanation') {
    const items = Array.isArray(lesson.explanation) ? lesson.explanation : [];
    if (!items.length) {
      return `<p class="expl-body-text">لا يوجد شرح مضاف بعد لهذا الدرس. 🧠</p>`;
    }

    return items
      .map((item) => {
        const titleDe = replaceName(item.de || '');
        const body = getNativeText(item);

        const audioSrc = germanToAudioFilename(titleDe);
        return `
          <div class="expl-block">
            <p class="expl-title-line">
              <button class="btn btn-ghost btn-small audio-btn expl-audio-btn" data-audio="${audioSrc}">
                ${strings.audioLabel}
              </button>
              <span class="de-text expl-title-de">${highlightGermanInText(titleDe)}</span>
            </p>
            <p class="expl-body-text">
              ${body}
            </p>
          </div>
        `;
      })
      .join('');
  }

  // 3) جدول العبارات
  if (stepKey === 'phrases') {
    const rows = Array.isArray(lesson.phrasesTable) ? lesson.phrasesTable : [];
    if (!rows.length) {
      return `<p class="expl-body-text">لا توجد عبارات مضافة بعد لهذا الدرس. 😄</p>`;
    }

    const body = rows
      .map((row) => {
        const deText = replaceName(row.de || '');
        const nativeText = getNativeText(row);

        const audioSrc = germanToAudioFilename(deText);
        return `
          <tr>
            <td>
              <button class="btn btn-ghost btn-small audio-btn" data-audio="${audioSrc}">
                ${strings.audioLabel}
              </button>
              <span class="de-text">${highlightGermanInText(deText)}</span>
            </td>
            <td>${nativeText}</td>
          </tr>
        `;
      })
      .join('');

    return `
      <table class="phrases-table">
        <thead>
          <tr>
            <th>Deutsch</th>
            <th>${motherLang === 'en' ? 'Translation' : 'الترجمة'}</th>
          </tr>
        </thead>
        <tbody>
          ${body}
        </tbody>
      </table>
    `;
  }

  // 4) المعلومة اللغوية
  if (stepKey === 'tip') {
    const raw = lesson.tip || '';
    if (!raw.trim()) {
      return `<p class="expl-body-text">لا توجد ملاحظة لغوية مضافة بعد. 💡</p>`;
    }
    const lines = raw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return lines
      .map(
        (line) => `
        <p class="expl-body-text">
          ${highlightGermanInText(line)}
        </p>
      `
      )
      .join('');
  }

  // 5) الحوار
  if (stepKey === 'dialogue') {
    const lines = Array.isArray(lesson.dialogue) ? lesson.dialogue : [];
    if (!lines.length) {
      return `<p class="expl-body-text">لا يوجد حوار مضاف بعد لهذا الدرس. 🗣️</p>`;
    }

    return lines
      .map((line) => {
        const deText = replaceName(line.de || '');
        const nativeText = getNativeText(line);

        const speaker = line.speaker || '';
        const audioSrc = germanToAudioFilename(deText);
        return `
          <div class="dialogue-line">
            <span class="dialogue-speaker">${speaker}</span>
            <span>
              <button class="btn btn-ghost btn-small audio-btn" data-audio="${audioSrc}">
                ${strings.audioLabel}
              </button>
              <span class="de-text">${highlightGermanInText(deText)}</span> — ${nativeText}
            </span>
          </div>
        `;
      })
      .join('');
  }

  // 6) الملخص
  if (stepKey === 'summary') {
    const items = Array.isArray(lesson.summary) ? lesson.summary : [];
    if (!items.length) {
      return `<p class="expl-body-text">لا يوجد ملخص مضاف بعد لهذا الدرس. 📦</p>`;
    }

    return items
      .map((item) => {
        const deText = replaceName(item.de || '');
        const nativeText = getNativeText(item);

        const audioSrc = germanToAudioFilename(deText);
        return `
          <div class="summary-block">
            ${
              deText
                ? `<div class="summary-head">
                     <button class="btn btn-ghost btn-small audio-btn" data-audio="${audioSrc}">
                       ${strings.audioLabel}
                     </button>
                     <span class="de-text">${highlightGermanInText(deText)}</span>
                   </div>`
                : ''
            }
            <div class="summary-body">
              ${nativeText}
            </div>
          </div>
        `;
      })
      .join('');
  }

    // 7) الكويز
  if (stepKey === 'quiz') {
    const quizList = Array.isArray(lesson.quiz) ? lesson.quiz : [];
    if (!quizList.length) {
      return `<p class="expl-body-text">لا يوجد تدريب مضاف لهذا الدرس بعد. 🎭</p>`;
    }

    const cardsHtml = quizList
      .map((q, qIndex) => {
        const optionsHtml = (q.options || [])
          .map(
            (opt, optIndex) => `
            <button
              class="btn btn-secondary btn-small quiz-option-btn"
              data-q-index="${qIndex}"
              data-opt-index="${optIndex}"
            >
              ${replaceName(opt)}
            </button>
          `
          )
          .join('');

        const hintText = replaceName(
          q.hint || strings.quizHintDefault || ''
        );

        return `
          <div class="quiz-card" data-q-index="${qIndex}">
            <div class="quiz-question-text">
              ${qIndex + 1}️⃣ ${replaceName(q.question || '')}
            </div>
            <div class="quiz-options">
              ${optionsHtml}
            </div>

            <div class="quiz-hint-row">
              <button
                class="btn btn-ghost btn-small quiz-hint-btn"
                data-q-index="${qIndex}"
              >
                ${strings.showHint}
              </button>
            </div>

            <div class="quiz-hint-text" id="quiz-hint-${qIndex}" hidden>
              ${hintText}
            </div>

            <div class="quiz-feedback" id="quiz-feedback-${qIndex}"></div>
          </div>
        `;
      })
      .join('');

    return `
      <div class="quiz-list">
        ${cardsHtml}
      </div>
      <div style="margin-top:0.8rem;">
        <button id="finish-lesson" class="btn btn-primary">
          ${strings.finishLesson}
        </button>
      </div>
    `;
  }


// 8) تمرين الكتابة
  if (stepKey === 'writing') {
    const we = lesson.writingExercise;
    if (!we) {
      return `<p class="expl-body-text">${strings.writing_no_content}</p>`;
    }

    const instrDe = replaceName(we.instruction_de || '');
    const instrNative = replaceName(we.instruction_ar || '');
    const example = replaceName(we.exampleAnswer || '');

    return `
      <div class="writing-exercise">
        <p class="scene-text">
          <strong>📌 Aufgabe (Deutsch):</strong><br>
          ${highlightGermanInText(instrDe)}
        </p>
        <p class="scene-text">
          <strong>📌 الشرح بالعربية:</strong><br>
          ${instrNative}
        </p>

        <label for="writing-input" class="label" style="margin-top:0.75rem; display:block;">
          ${strings.writing_label_input}
        </label>
        <textarea
          id="writing-input"
          class="textarea"
          rows="5"
          style="width:100%; margin-top:0.25rem;"
          placeholder="${strings.writing_placeholder}"
        ></textarea>

        <div style="margin-top:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button id="check-writing" class="btn btn-primary btn-small">
            ${strings.writing_check_btn}
          </button>
        </div>

        <div id="writing-feedback" class="quiz-feedback" style="margin-top:0.75rem;"></div>

        <div id="writing-example" class="card" style="margin-top:0.75rem; display:none;">
          <div class="section-heading" style="margin-bottom:0.4rem;">
            ${strings.writing_example_title}
          </div>
          <p>${highlightGermanInText(example)}</p>
        </div>
      </div>
    `;
  }

  // احتياط
  return `<p>لا توجد محتويات لهذه الخطوة بعد.</p>`;
}


// 🟢 فحص إجابات الكويز
function setupQuizHandlers(lesson, strings) {
  const quizList = Array.isArray(lesson.quiz) ? lesson.quiz : [];

  // 🔹 تفاعل أزرار الكويز مع أنيميشن صحيحة/خاطئة
  document.querySelectorAll('.quiz-option-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const qIndex = Number(btn.dataset.qIndex);
      const optIndex = Number(btn.dataset.optIndex);
      const question = quizList[qIndex];

      const correctIndex = question.answer;
      const cardEl = btn.closest('.quiz-card');
      const feedbackEl = document.getElementById(`quiz-feedback-${qIndex}`);
      const allBtns = cardEl
        ? cardEl.querySelectorAll('.quiz-option-btn')
        : btn.closest('.quiz-options').querySelectorAll('.quiz-option-btn');

      // نوقف الأزرار مؤقتًا أثناء الأنيميشن
      allBtns.forEach((b) => {
        b.disabled = true;
      });

      const isCorrect = optIndex === correctIndex;

      if (feedbackEl) {
        feedbackEl.textContent = isCorrect
          ? strings.quizCorrect
          : strings.quizWrong;
        feedbackEl.classList.remove('correct', 'wrong');
        feedbackEl.classList.add(isCorrect ? 'correct' : 'wrong');
      }

      if (isCorrect) {
        btn.classList.add('correct');

        if (cardEl) {
          cardEl.classList.add('quiz-correct-flash');
        }
        document.body.classList.add('screen-correct-flash');

        triggerConfetti();

        setTimeout(() => {
          if (cardEl) {
            cardEl.classList.remove('quiz-correct-flash');
          }
          document.body.classList.remove('screen-correct-flash');
          if (feedbackEl) {
            feedbackEl.textContent = '';
          }
        }, 900);
      } else {
        btn.classList.add('wrong');

        if (cardEl) {
          cardEl.classList.add('quiz-wrong-flash', 'shake');
        }
        document.body.classList.add('screen-wrong-flash');

        setTimeout(() => {
          if (cardEl) {
            cardEl.classList.remove('quiz-wrong-flash', 'shake');
          }
          document.body.classList.remove('screen-wrong-flash');
          if (feedbackEl) {
            feedbackEl.textContent = '';
          }

          // إعادة تفعيل الأزرار للمحاولة مرة أخرى
          allBtns.forEach((b) => {
            b.disabled = false;
            b.classList.remove('wrong');
          });
        }, 650);
      }
    });
  });

  // 🔹 زر التلميح لكل سؤال
  document.querySelectorAll('.quiz-hint-btn').forEach((hintBtn) => {
    hintBtn.addEventListener('click', () => {
      const qIndex = Number(hintBtn.dataset.qIndex);
      const hintEl = document.getElementById(`quiz-hint-${qIndex}`);
      if (!hintEl) return;

      const isHidden = hintEl.hasAttribute('hidden');
      if (isHidden) {
        hintEl.removeAttribute('hidden');
      } else {
        hintEl.setAttribute('hidden', 'true');
      }
    });
  });


  const finishBtn = document.getElementById('finish-lesson');
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      const key = lesson._key || lesson.id;
      if (key) {
        completedLessons.add(key);
        saveProgress();
      }

            // شاشة لطيفة صغيرة (متعددة اللغات)
      const overlay = document.createElement('div');
      overlay.className = 'lesson-complete-overlay';

      const strings = getStrings();
      const title = strings.lessonDoneTitle || '🎉 Lesson finished!';
      const body  = strings.lessonDoneBody  || 'Tap anywhere to go back to the lesson list.';

      overlay.innerHTML = `
        <div class="lesson-complete-card">
          <div class="lesson-complete-emoji">🎉</div>
          <h3>${title}</h3>
          <p>${body}</p>
        </div>
      `;
      document.body.appendChild(overlay);

      triggerConfetti();

      overlay.addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
          overlay.remove();
          goBackToCurrentLevelView();
        }, 250);
      });
    });
  }
}

function setupWritingHandlers(strings) {
  const btn = document.getElementById('check-writing');
  const input = document.getElementById('writing-input');
  const feedbackEl = document.getElementById('writing-feedback');
  const exampleBox = document.getElementById('writing-example');

  if (!btn || !input || !feedbackEl) return;

  btn.addEventListener('click', () => {
    const text = (input.value || '').trim();

    if (!text) {
      feedbackEl.textContent =
        strings.writing_empty_warning ||
        'اكتب شيئًا أولًا ثم اضغط على زر التحقق 🙂';
      feedbackEl.className = 'quiz-feedback wrong';
      if (exampleBox) exampleBox.style.display = 'none';
      return;
    }

    feedbackEl.textContent =
      strings.writing_thanks ||
      'شكرًا على كتابتك! قارن إجابتك مع النموذج وحاول تحسينها في المرة القادمة 💪';
    feedbackEl.className = 'quiz-feedback correct';

    if (exampleBox) {
      exampleBox.style.display = 'block';
    }
  });
}

// 🟢 الرجوع إلى قائمة الدروس / القواعد بحسب الوضع الحالي
function goBackToCurrentLevelView() {
  // لو كنت داخل درس قواعد
  if (currentMode === 'grammar') {
    renderGrammarLevelView();
  } else {
    // الوضع العادي: دروس المستوى
    currentMode = 'lessons';
    renderLevelView();
  }
}



// 🟢 صفحة الدرس (شاشة واحدة لكل خطوة)
function renderLessonPage(lesson) {
  applyUiLanguage();
  const strings = getStrings();

  // نحدد الخطوات التي لها محتوى فعلي
  const stepsForThisLesson = lessonStepsOrder.filter((stepKey) => {
    if (stepKey === 'scene') return !!(lesson.interactiveScene && lesson.interactiveScene.trim());
    if (stepKey === 'explanation') return Array.isArray(lesson.explanation) && lesson.explanation.length;
    if (stepKey === 'phrases') return Array.isArray(lesson.phrasesTable) && lesson.phrasesTable.length;
    if (stepKey === 'tip') return !!(lesson.tip && lesson.tip.trim());
    if (stepKey === 'dialogue') return Array.isArray(lesson.dialogue) && lesson.dialogue.length;
    if (stepKey === 'summary') return Array.isArray(lesson.summary) && lesson.summary.length;
    if (stepKey === 'quiz') return Array.isArray(lesson.quiz) && lesson.quiz.length;
    if (stepKey === 'writing') return !!lesson.writingExercise;
    return false;
  });

  if (!stepsForThisLesson.length) {
    appEl.innerHTML = `
      <div class="card">
       <h3>${strings.noLessonContent}</h3>
        <button class="btn btn-ghost" id="back-empty-lesson">${strings.backToLessonsList}</button>
      </div>
    `;
    document.getElementById('back-empty-lesson').addEventListener('click', () => {
      goBackToCurrentLevelView();
    });
    return;
  }

  if (currentLessonStep >= stepsForThisLesson.length) {
    currentLessonStep = stepsForThisLesson.length - 1;
  }

  const stepKey = stepsForThisLesson[currentLessonStep];
  const stepTitle = strings.stepsTitles[stepKey] || '';

  appEl.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'card view-fade-in';

  const headerDiv = document.createElement('div');
  headerDiv.className = 'lesson-header';

  headerDiv.innerHTML = `
    <div class="lesson-header-top">
      <button id="back-to-level" class="btn btn-ghost btn-small">
        ${currentMode === 'grammar' ? strings.backToGrammarList : strings.backToLessonsList}
      </button>
    </div>
    <h1 class="section-heading">${replaceName(lesson.title?.ar || lesson.title?.de || '')}</h1>
    <p class="lesson-subtitle">${replaceName(lesson.title?.de || '')}</p>
  `;

  wrapper.appendChild(headerDiv);

    const stepCard = document.createElement('div');
  stepCard.className = 'lesson-step-card';
  stepCard.innerHTML = `
    <h2 class="section-heading">${stepTitle}</h2>
    ${renderStepContent(lesson, stepKey, strings)}
  `;
  wrapper.appendChild(stepCard);

  // 🔗 شريط مشاركة الدرس
  const shareBar = document.createElement('div');
  shareBar.className = 'lesson-share-bar';
  shareBar.innerHTML = `
    <button id="share-lesson-btn" class="btn btn-secondary btn-small">
      ${strings.share_this_lesson}
    </button>
  `;
  wrapper.appendChild(shareBar);

  const navBar = document.createElement('div');

  navBar.className = 'lesson-nav-bar';
  navBar.innerHTML = `
    <span class="step-indicator">
      ${strings.stepIndicator(currentLessonStep + 1, stepsForThisLesson.length)}
    </span>
    <div class="lesson-nav-buttons" style="display:flex; gap:0.5rem; flex-wrap:wrap;">
      <button id="step-prev" class="btn btn-ghost btn-small" ${
        currentLessonStep === 0 ? 'disabled' : ''
      }>
        ${strings.prev}
      </button>
      <button id="step-next" class="btn btn-primary btn-small">
        ${
          currentLessonStep === stepsForThisLesson.length - 1
            ? strings.toList
            : strings.next
        }
      </button>
    </div>
  `;
  wrapper.appendChild(navBar);

  appEl.appendChild(wrapper);

  // أحداث الأزرار
  document.getElementById('back-to-level').addEventListener('click', () => {
    goBackToCurrentLevelView();
  });

  const prevBtn = document.getElementById('step-prev');
  const nextBtn = document.getElementById('step-next');
  const shareBtn = document.getElementById('share-lesson-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentLessonStep > 0) {
        currentLessonStep--;
        renderLessonPage(lesson);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentLessonStep < stepsForThisLesson.length - 1) {
        currentLessonStep++;
        renderLessonPage(lesson);
      } else {
        goBackToCurrentLevelView();
      }
    });
  }
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const url = window.location.href;
      const title = replaceName(lesson.title?.de || lesson.title?.ar || 'German lesson');
      const text = strings.share_this_lesson || '';

      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
        } catch (e) {
          // المستخدم أغلق نافذة المشاركة
        }
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(url);
          alert('Link copied to clipboard 📋\n' + url);
        } catch (e) {
          alert(url);
        }
      } else {
        alert(url);
      }
    });
  }

  // أزرار الصوت
  setupAudioButtons();

  // إعداد الكويز
  if (stepKey === 'quiz') {
    setupQuizHandlers(lesson, strings);
  }

  // إعداد تمرين الكتابة
  if (stepKey === 'writing') {
    setupWritingHandlers(strings);
  }
}
// =========================
// 🎮 LEVEL UP SCREEN
// =========================
function showLevelUpScreen(levelNumber, reason = 'exam') {
  const overlay = document.createElement('div');
  overlay.className = 'levelup-overlay';

  overlay.innerHTML = `
    <div class="levelup-card">
      <div class="levelup-glow"></div>
      <div class="levelup-title">LEVEL UP</div>
      <div class="levelup-number">Lv. ${levelNumber}</div>
      <p class="levelup-text">
        🎉 رائع! تقدّمت مستوى جديد في رحلتك مع الألمانية. استمر بهذا الحماس!
      </p>
      <button class="btn btn-primary levelup-btn" id="levelup-continue-btn">
        المتابعة 🚀
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  const btn = document.getElementById('levelup-continue-btn');
  btn.addEventListener('click', () => {
    overlay.classList.add('levelup-hide');
    setTimeout(() => overlay.remove(), 240);
  });
}

function levelUp(reason = 'exam') {
  userLevel++;
  saveUserLevel();
  showLevelUpScreen(userLevel, reason);
}


// =======================
// 🎯 منطق اختبار تحديد المستوى
// =======================

async function startPlacementTest() {
  applyUiLanguage();
  const strings = getStrings();

  currentMode = 'placement';
  placementIndex = 0;
  placementCorrectByLevel = { A1: 0, A2: 0, B1: 0 };

  // 🔁 حمّل أسئلة الاختبار من ملف JSON المناسب للغة الواجهة
  await loadPlacementQuestionsForLang(motherLang);

  // لو ما في أسئلة (ملف ناقص أو خطأ)، نرجع للصفحة الرئيسية
  if (!PLACEMENT_QUESTIONS.length) {
    alert('لا توجد أسئلة لاختبار المستوى لهذه اللغة حتى الآن.');
    currentMode = 'lessons';
    renderLanding();
    return;
  }

  renderPlacementQuestion();
}


async function loadPlacementQuestionsForLang(lang) {
  const API_BASE = 'https://abbas-first-backend.vercel.app/api';

  const fileMap = {
    ar: `${API_BASE}/placement-de-ar`,          // العربي من الباك إند
    en: 'data/placement-de-en.json',
    uk: 'data/placement-de-uk.json',
    ru: 'data/placement-de-ru.json',
    fa: 'data/placement-de-fa.json',
    af: 'data/placement-de-af.json',
    tr: 'data/placement-de-tr.json'
  };

  const file = fileMap[lang] || fileMap.en;

  console.log('[placement] lang =', lang);
  console.log('[placement] file  =', file);

  try {
    const response = await fetch(file);
    console.log('[placement] status =', response.status);

    if (!response.ok) {
      console.error('❌ تعذّر تحميل ملف تحديد المستوى:', file, response.status);
      PLACEMENT_QUESTIONS = [];
      return;
    }

    const raw = await response.json();
    console.log('[placement] raw from server =', raw);

    let questions;

    // إذا الـ API رجّع { questions: [...] }
    if (Array.isArray(raw.questions)) {
      questions = raw.questions;
    }
    // إذا الرجعة كانت مصفوفة مباشرة
    else if (Array.isArray(raw)) {
      questions = raw;
    }
    else {
      console.warn('[placement] شكل البيانات غير متوقّع:', raw);
      questions = [];
    }

    PLACEMENT_QUESTIONS = questions
      .map((q) => {
        let text = q.question;

        if (!text) {
          if (lang === 'ru') {
            text = q.question_ru || q.question_de || '';
          } else if (lang === 'uk') {
            text = q.question_uk || q.question_de || '';
          }
        }

        return {
          id: q.id,
          level: q.level || q.level_code || 'A1',
          question: text,
          options: q.options || [],
          answer: q.answer
        };
      })
      .filter(q => q.question && q.options.length > 0);

    console.log('[placement] loaded questions =', PLACEMENT_QUESTIONS.length);

  } catch (err) {
    console.error('❌ خطأ في تحميل ملف تحديد المستوى:', err);
    PLACEMENT_QUESTIONS = [];
  }
}


function renderPlacementQuestion() {
  const q = PLACEMENT_QUESTIONS[placementIndex];

  // إذا خلصنا كل الأسئلة → نعرض النتيجة
  if (!q) {
    finishPlacementTest();
    return;
  }

  applyUiLanguage();
  const strings = getStrings();

  const total = PLACEMENT_QUESTIONS.length;
  const currentNumber = placementIndex + 1;
    // نص السؤال حسب شكل الـ JSON
  const questionText =
    q.question ||                          // للملفات اللي فيها "question"
    q[`question_${motherLang}`] ||         // مثل question_uk أو question_ru
    q.question_de ||                       // احتياط: نعرض الألماني
    '';


  // العنوان والوصف حسب اللغة
  const title =
    strings.placementTitle
      ? (typeof strings.placementTitle === 'function'
          ? strings.placementTitle(currentNumber, total)
          : strings.placementTitle)
      : `Placement test – question ${currentNumber} of ${total}`;

  const subtitle =
    strings.placementSubtitle ||
    'Choose the correct answer. This short test helps us suggest the right level for you.';

  const skipLabel = strings.placementSkip || 'Skip the test';

  appEl.innerHTML = `
    <div class="card view-fade-in">
      <h2 class="card-title">${title}</h2>
      <p class="card-subtitle">
        ${subtitle}
      </p>

      <div class="placement-question">
       <p class="scene-text" style="margin-bottom:0.75rem;">
  ${questionText}
</p>

        <div class="quiz-options-column">
          ${q.options
            .map(
              (opt, index) => `
            <button
              class="btn btn-ghost quiz-option-btn"
              data-index="${index}"
            >
              ${opt}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <div id="placement-feedback" class="quiz-feedback" style="margin-top:0.75rem;"></div>

      <div style="margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
        <button id="placement-skip" class="btn btn-ghost btn-small">
          ${skipLabel}
        </button>
      </div>
    </div>
  `;

  const optionButtons = document.querySelectorAll('.quiz-option-btn');
  const feedbackEl = document.getElementById('placement-feedback');
  const skipBtn = document.getElementById('placement-skip');

  optionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-index'));

      // قفل الأزرار
      optionButtons.forEach((b) => (b.disabled = true));

      const isCorrect = idx === q.answer;

      if (isCorrect) {
        btn.classList.add('correct');
        feedbackEl.textContent =
          strings.quizCorrect || 'Correct answer 🎉';
        // نزيد عدّاد المستوى تبع السؤال
        placementCorrectByLevel[q.level] =
          (placementCorrectByLevel[q.level] || 0) + 1;
      } else {
        btn.classList.add('wrong');
        feedbackEl.textContent =
          strings.quizWrong ||
          'Wrong answer, no problem 🙂 let\'s continue.';
      }

      // نروح للسؤال اللي بعده بعد شوية
      setTimeout(() => {
        placementIndex += 1;
        renderPlacementQuestion();
      }, 900);
    });
  });

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      // اعتبرنا الاختبار متخطّى
      localStorage.setItem('placement_done', '1');
      renderLanding();
    });
  }
}


function finishPlacementTest() {
  applyUiLanguage();
  const strings = getStrings();

  const { A1, A2, B1 } = placementCorrectByLevel;

  // منطق بسيط للتوصية:
  // إذا جاوب صح على 2 أو أكثر من B1 → نرشّح B1
  // غير هيك إذا 2+ من A2 → نرشّح A2
  // غير هيك → A1
  let recommended = 'A1';
  if (B1 >= 2) {
    recommended = 'B1';
  } else if (A2 >= 2) {
    recommended = 'A2';
  } else {
    recommended = 'A1';
  }

  currentLevelKey = recommended;
  savePrefs();
  localStorage.setItem('placement_done', '1');
  localStorage.setItem('placement_level', recommended);

  appEl.innerHTML = `
    <div class="card view-fade-in">
      <h2 class="card-title">نتيجة اختبار تحديد المستوى 🎯</h2>
      <p class="card-subtitle">
        بناءً على إجاباتك، المستوى المقترح للبدء هو:
      </p>

      <div style="margin:1rem 0; font-size:1.2rem; font-weight:700;">
        المستوى المقترح: <span style="font-size:1.4rem;">${recommended}</span>
      </div>

      <div class="scene-text" style="margin-bottom:1rem;">
        <p>تفاصيل سريعة:</p>
        <ul>
          <li>A1 – إجابات صحيحة: ${A1}</li>
          <li>A2 – إجابات صحيحة: ${A2}</li>
          <li>B1 – إجابات صحيحة: ${B1}</li>
        </ul>
      </div>

      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <button id="placement-start-level" class="btn btn-primary">
          ابدأ من مستوى ${recommended}
        </button>
        <button id="placement-back-home" class="btn btn-ghost">
          العودة للصفحة الرئيسية
        </button>
      </div>
    </div>
  `;

  const startLevelBtn = document.getElementById('placement-start-level');
  const backHomeBtn = document.getElementById('placement-back-home');

  if (startLevelBtn) {
    startLevelBtn.addEventListener('click', async () => {
      await loadLessons();
      renderLevelView();
    });
  }

  if (backHomeBtn) {
    backHomeBtn.addEventListener('click', () => {
      renderLanding();
    });
  }
}

// بطاقة لطيفة تظهر في أول زيارة تقترح اختبار تحديد المستوى
function showPlacementInvite() {
  // إذا أصلاً في اختبار تحديد مستوى من قبل → لا تعرض شيء
  const done = localStorage.getItem('placement_done') === '1';
  if (done) return;

  const banner = document.createElement('div');
  banner.className = 'card view-fade-in';
  banner.style.marginBottom = '1rem';

  const langKey = (['ar', 'en', 'uk', 'ru', 'tr', 'fa', 'af'].includes(motherLang))
    ? motherLang
    : 'ar';

  const t = (key) => {
    const dict = UI_TRANSLATIONS[key];
    if (!dict) return '';
    return dict[langKey] || dict.ar || '';
  };

  banner.innerHTML = `
    <h2 class="card-title">${t('placement_banner_title')}</h2>
    <p class="card-subtitle">
      ${t('placement_banner_desc')}
    </p>
    <div style="margin-top:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
      <button id="placement-start-now" class="btn btn-primary btn-small">
        ${t('placement_banner_start')}
      </button>
      <button id="placement-later" class="btn btn-ghost btn-small">
        ${t('placement_banner_later')}
      </button>
    </div>
  `;

  // نضيفها في أعلى الـ app
  if (appEl.firstChild) {
    appEl.insertBefore(banner, appEl.firstChild);
  } else {
    appEl.appendChild(banner);
  }

  document
    .getElementById('placement-start-now')
    .addEventListener('click', () => {
      localStorage.setItem('placement_done', '1');
      startPlacementTest();
      banner.remove();
    });

  document
    .getElementById('placement-later')
    .addEventListener('click', () => {
      localStorage.setItem('placement_done', '1');
      banner.remove();
    });
}


// 🟢 تشغيل التطبيق
document.addEventListener('DOMContentLoaded', () => {
  // لو عندك تهيئة ثيم/أصوات/إلخ… خَلّيها هون:
  if (typeof initTheme === 'function') {
    initTheme();
  }

  // بعد التهيئات، منادي auth
  initAuthBox();
});


// ================ 🔊 تفعيل أزرار الصوت في كل الصفحات ===================
document.addEventListener('click', (event) => {
  // أي زر عنده كلاس audio-btn
  const btn = event.target.closest('.audio-btn, .scene-audio-btn, .expl-audio-btn');
  if (!btn) return;

  // نحاول نلاقي أقرب حاوية للجملة
  let container = btn.closest('.scene-row, .expl-row, .expl-line, .expl-block, .exam-question-block, .quiz-card');

  // لو ما لقينا، نستخدم الأب المباشر
  if (!container) container = btn.parentElement;

  // نبحث عن الجملة الألمانية داخل الحاوية
  const deElement =
    container.querySelector('.scene-row-de') ||
    container.querySelector('.expl-row-de') ||
    container.querySelector('.de-text') ||
    container.querySelector('.exam-question-de');

  if (!deElement) return;

  const text = deElement.textContent.trim();
  if (!text) return;

  speakGerman(text);
});
// ============================
// 👤 إدارة المستخدمين + التقدم (بدون سيرفر)
// ============================

// مفاتيح التخزين في المتصفح
const LS_USERS_KEY = 'lingo_users_v1';
const LS_CURRENT_USER_KEY = 'lingo_current_user_v1';

// المستخدم الحالي (اسمه فقط)
let currentUser = null;

// تحميل كل المستخدمين من localStorage
function loadAllUsers() {
  try {
    const raw = localStorage.getItem(LS_USERS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data;
    return [];
  } catch (e) {
    console.warn('خطأ في قراءة المستخدمين', e);
    return [];
  }
}

// حفظ كل المستخدمين في localStorage
function saveAllUsers(users) {
  try {
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('خطأ في حفظ المستخدمين', e);
  }
}

// البحث عن مستخدم بالاسم (بدون حساسية حروف كبيرة/صغيرة)
function findUserByName(username) {
  const users = loadAllUsers();
  return users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

// إنشاء مستخدم جديد
function createUser(username) {
  const clean = username.trim();
  if (!clean) {
    return { success: false, message: 'اكتب اسم مستخدم.' };
  }

  const users = loadAllUsers();
  const exists = users.find(
    (u) => u.username.toLowerCase() === clean.toLowerCase()
  );

  if (exists) {
    return { success: false, message: 'هذا الاسم مستخدم بالفعل، جرّب غيره.' };
  }

  const newUser = {
    username: clean,
    completedLessons: [] // هون رح نخزن الدروس المنتهية
  };

  users.push(newUser);
  saveAllUsers(users);

  return { success: true, user: newUser };
}

// تسجيل الدخول
function loginLocalUser(username) {
  const clean = username.trim();
  if (!clean) {
    return { success: false, message: 'اكتب اسم مستخدم.' };
  }

  const user = findUserByName(clean);
  if (!user) {
    return { success: false, message: 'لا يوجد مستخدم بهذا الاسم.' };
  }

  return { success: true, user };
}

// حفظ/تحميل المستخدم الحالي في localStorage
function saveCurrentUser(username) {
  currentUser = username;
  localStorage.setItem(LS_CURRENT_USER_KEY, username);
}

function loadCurrentUser() {
  const saved = localStorage.getItem(LS_CURRENT_USER_KEY);
  if (saved && saved.trim()) {
    currentUser = saved.trim();
    return currentUser;
  }
  return null;
}

// جلب التقدم للمستخدم الحالي (مصفوفة IDs)
function getCurrentUserProgress() {
  if (!currentUser) return [];
  const user = findUserByName(currentUser);
  if (!user) return [];
  return user.completedLessons || [];
}

// حفظ التقدم للمستخدم الحالي
function saveCurrentUserProgress(completedLessonIds) {
  if (!currentUser) return;
  const users = loadAllUsers();
  const idx = users.findIndex(
    (u) => u.username.toLowerCase() === currentUser.toLowerCase()
  );
  if (idx === -1) return;

  // إزالة التكرار
  const unique = Array.from(new Set(completedLessonIds));
  users[idx].completedLessons = unique;
  saveAllUsers(users);
}
// ============================
// 🧾 تهيئة واجهة تسجيل الدخول
// ============================

// ============================
// 🧾 تهيئة واجهة اختيار الاسم / الحساب
// ============================

function initAuthBox() {
  const box   = document.getElementById('auth-box');
  const inp   = document.getElementById('auth-username');
  const msgEl = document.getElementById('auth-message');
  const btnReg = document.getElementById('btn-register');

  if (!box || !inp || !msgEl || !btnReg) return;

  function showMessage(text, isError = true) {
    msgEl.textContent = text || '';
    msgEl.style.color = isError ? '#b91c1c' : '#15803d';
  }

  // لو في مستخدم محفوظ سابقاً → ندخل مباشرةً
  const existing = loadCurrentUser();
  if (existing) {
    box.style.display = 'none';
    const progress = getCurrentUserProgress();
    if (Array.isArray(progress)) {
      if (typeof completedLessons !== 'undefined') {
        completedLessons = new Set(progress);
      }
    }
    if (typeof renderLanding === 'function') {
      renderLanding();
    }
    return;
  }

  // ما في مستخدم → نظهر صندوق الاسم
  box.style.display = 'block';

  async function handleStart() {
    const name = (inp.value || '').trim();
    if (!name) {
      showMessage('اكتب اسمك أو أي اسم تختاره لحفظ تقدمك.', true);
      return;
    }

    // 1) نحاول أولاً تسجيل الدخول لو الاسم موجود
    let result = loginLocalUser(name);
    if (result.success) {
      // تسجيل دخول
      saveCurrentUser(result.user.username);
      updateUserChip();
      if (typeof completedLessons !== 'undefined') {
        completedLessons = new Set(result.user.completedLessons || []);
      }
      showMessage('مرحباً بعودتك ✅', false);
    } else {
      // 2) لو ما في مستخدم → ننشئ حساب جديد
      result = createUser(name);
      if (!result.success) {
        showMessage(result.message, true);
        return;
      }
      saveCurrentUser(result.user.username);
      if (typeof completedLessons !== 'undefined') {
        completedLessons = new Set([]);
      }
      updateUserChip();
      showMessage('تم حفظ اسمك والبدء الآن ✅', false);
    }

    box.style.display = 'none';
    if (typeof renderLanding === 'function') {
      renderLanding();
    }
  }

  btnReg.addEventListener('click', handleStart);
}


// ============================
// 🎭 عرض اسم المستخدم + زر الخروج
// ============================

function updateUserChip() {
  const chip = document.getElementById('user-chip');
  const nameEl = document.getElementById('user-chip-name');

  if (!chip || !nameEl) return;

  if (!currentUser) {
    chip.style.display = 'none';
  } else {
    nameEl.textContent = currentUser;
    chip.style.display = 'flex';
  }
}

function initLogoutButton() {
  const btn = document.getElementById('user-logout-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // مسح المستخدم الحالي
    localStorage.removeItem(LS_CURRENT_USER_KEY);
    currentUser = null;

    // نفضّي التقدّم كمان (اختياري، بس هيك التقدّم ما يضل لاسم قديم)
    if (typeof completedLessons !== 'undefined') {
      completedLessons = new Set();
      saveProgress();
    }

    // نخفي الشيب ونرجّع صندوق تسجيل الدخول
    updateUserChip();

    const authBox = document.getElementById('auth-box');
    if (authBox) {
      authBox.style.display = 'block';
    }

    // ممكن نرجّع للواجهة الأساسية لو حابب
    if (typeof renderLanding === 'function') {
      renderLanding();
    }
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('sw.js')   // بدون / بالأول أسهل محلياً
      .then(reg => {
        console.log('Service worker registered:', reg.scope);
      })
      .catch(err => {
        console.error('Service worker registration failed:', err);
      });
  });
}

// ===== Language selection popup logic =====

// اللغات المدعومة في الموقع
// SUPPORTED_MOTHER_LANGS تم تعريفها سابقًا في أعلى الملف — نعيد استخدامها بدل إعادة الإعلان هنا.

// ترجمات جملة "اختر لغتك الأم"
const langTitleTexts = {
  en: "Choose your native language",
  ar: "اختر لغتك الأم",
  uk: "Оберіть рідну мову",
  ru: "Выберите ваш родной язык",
  fa: "زبان مادری خود را انتخاب کنید",
  tr: "Ana dilinizi seçin",
  af: "زبان مادری خود را انتخاب کنید" // درى/افغانى
};

const langSubtitleTexts = {
  en: "You can change this later in the settings.",
  ar: "يمكنك تغيير هذا الخيار لاحقًا من الإعدادات.",
  uk: "Ви зможете змінити цю мову пізніше в налаштуваннях.",
  ru: "Вы сможете изменить язык позже в настройках.",
  fa: "می‌توانید بعداً این زبان را از تنظیمات تغییر دهید.",
  tr: "Bu dili daha sonra ayarlardan değiştirebilirsiniz.",
  af: "می‌توانید بعداً این زبان را از تنظیمات تغییر دهید."
};

// تحديد اللغة المناسبة للواجهة (لغة النافذة نفسها)
function detectUiLanguage() {
  const browserLang =
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    "en";

  const short = browserLang.toLowerCase().slice(0, 2);

  // تحويل بعض الحالات الخاصة إلى لغاتنا
  if (short === "uk") return "uk";      // Ukrainian
  if (short === "ru") return "ru";
  if (short === "ar") return "ar";
  if (short === "fa") return "fa";
  if (short === "tr") return "tr";
  if (short === "ps") return "af";      // Pashto
  if (browserLang.toLowerCase().startsWith("fa-af")) return "af";

  // افتراضي
  return "en";
}

function showLanguageModalIfNeeded() {
  const modal = document.getElementById("language-modal");
  if (!modal) return;

  function hideModal() {
    modal.classList.remove("lang-modal--visible");
    modal.classList.add("fade-out");
    setTimeout(() => {
      modal.style.display = "none";
    }, 250);
  }

  // نقرأ من المفتاحين القديم والجديد
  let alreadyChosen = localStorage.getItem("motherLang");

  try {
    const raw = localStorage.getItem("lingo_prefs_v1");
    if (!alreadyChosen && raw) {
      const data = JSON.parse(raw);
      if (data && data.mother) alreadyChosen = data.mother;
    }
  } catch (e) {
    console.warn("خطأ في قراءة التفضيلات القديمة", e);
  }

  // لو في لغة محفوظة وصحيحة → استخدمها وخبّي النافذة
  if (alreadyChosen && SUPPORTED_MOTHER_LANGS.includes(alreadyChosen)) {
    motherLang = alreadyChosen;
    document.documentElement.setAttribute("data-mother-lang", motherLang);
    if (typeof applyUiLanguage === "function") applyUiLanguage();
    if (typeof renderLanding === "function") renderLanding();
    hideModal();
    return;
  }

  // نحدد لغة واجهة النافذة
  const uiLang = detectUiLanguage();
  const titleEl = document.getElementById("language-modal-title");
  const subtitleEl = document.getElementById("language-modal-subtitle");

  titleEl.textContent = langTitleTexts[uiLang] || langTitleTexts.en;
  subtitleEl.textContent = langSubtitleTexts[uiLang] || langSubtitleTexts.en;

  modal.classList.add("lang-modal--visible");

  modal.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const chosen = btn.dataset.lang;
      if (!chosen) return;

      try {
        motherLang = chosen;
        localStorage.setItem("motherLang", chosen);
        if (typeof savePrefs === "function") savePrefs();
        document.documentElement.setAttribute("data-mother-lang", chosen);
        if (typeof applyUiLanguage === "function") applyUiLanguage();
        if (typeof renderLanding === "function") renderLanding();
      } catch (e) {
        console.error("خطأ أثناء تغيير اللغة:", e);
      }

      hideModal();
    });
  });
}


// 🧹 دالة إعادة ضبط الموقع بالكامل (متعددة اللغات)
function resetAppData() {
  // نحدد لغة الرسالة بناءً على لغة الواجهة الحالية
  const langKey = (['ar', 'en', 'uk', 'ru', 'tr', 'fa', 'af'].includes(motherLang))
    ? motherLang
    : 'ar';

  let message = "Do you really want to reset the app and delete all preferences and progress?";
  if (UI_TRANSLATIONS.reset_app_confirm) {
    const dict = UI_TRANSLATIONS.reset_app_confirm;
    message = dict[langKey] || dict.ar || message;
  }

  const sure = confirm(message);
  if (!sure) return;

  try {
    // مسح كل بيانات الموقع المخزّنة
    localStorage.clear();
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }
  } catch (e) {
    console.warn("تعذر مسح التخزين:", e);
  }

  // إعادة تحميل الصفحة من جديد
  location.reload();
}


// نطلق الكود بعد تحميل الصفحة
document.addEventListener("DOMContentLoaded", showLanguageModalIfNeeded);
// ربط زر إعادة الضبط بعد تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("reset-app-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAppData);
  }
});

document.addEventListener("click", function (e) {
  if (e.target.id === "share-lesson") {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: "German Lesson",
        text: "Check out this lesson!",
        url: url,
      });
    } else {
      const shareUrl =
        "https://wa.me/?text=" +
        encodeURIComponent("Check this lesson: " + url);

      window.open(shareUrl, "_blank");
    }
  }
});
