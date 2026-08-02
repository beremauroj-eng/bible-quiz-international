(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const isEs = () => window.BQI18n?.language === "es";
  const L = (en, es) => (isEs() ? es : en);
  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  let bankCache = null;
  let currentQuestion = null;
  let currentContextQuestions = [];
  let currentLesson = null;

  const BOOK_META = {
    Genesis:{era:"Beginnings and the patriarchs",eraEs:"Comienzos y patriarcas",context:"Origins, covenant promises and the family narratives of Abraham, Isaac, Jacob and Joseph.",contextEs:"Orígenes, promesas del pacto y relatos familiares de Abraham, Isaac, Jacob y José.",place:"Ancient Near East",placeEs:"Antiguo Cercano Oriente",symbol:"stars"},
    Exodus:{era:"Exodus and wilderness",eraEs:"Éxodo y desierto",context:"Israel’s departure from Egypt, the wilderness journey, covenant law and the tabernacle.",contextEs:"La salida de Israel de Egipto, el viaje por el desierto, la ley del pacto y el tabernáculo.",place:"Egypt and Sinai",placeEs:"Egipto y Sinaí",symbol:"mountain"},
    Leviticus:{era:"Wilderness covenant",eraEs:"Pacto en el desierto",context:"Priestly worship, holiness, sacrifices and community life within the covenant.",contextEs:"Culto sacerdotal, santidad, sacrificios y vida comunitaria dentro del pacto.",place:"Sinai wilderness",placeEs:"Desierto del Sinaí",symbol:"temple"},
    Numbers:{era:"Wilderness journey",eraEs:"Viaje por el desierto",context:"The wilderness generation, censuses, journeys and preparation to enter the land.",contextEs:"La generación del desierto, censos, viajes y preparación para entrar en la tierra.",place:"Sinai to Moab",placeEs:"Del Sinaí a Moab",symbol:"desert"},
    Deuteronomy:{era:"Plains of Moab",eraEs:"Llanuras de Moab",context:"Moses’ final speeches reviewing the covenant before Israel enters the land.",contextEs:"Discursos finales de Moisés que repasan el pacto antes de que Israel entre en la tierra.",place:"Moab",placeEs:"Moab",symbol:"scroll"},
    Joshua:{era:"Settlement in the land",eraEs:"Asentamiento en la tierra",context:"Entry into Canaan, major campaigns and the allocation of tribal territories.",contextEs:"Entrada en Canaán, campañas principales y distribución de territorios tribales.",place:"Canaan",placeEs:"Canaán",symbol:"map"},
    Judges:{era:"Period of the judges",eraEs:"Época de los jueces",context:"Cycles of oppression, deliverance and leadership before the monarchy.",contextEs:"Ciclos de opresión, liberación y liderazgo antes de la monarquía.",place:"Canaan",placeEs:"Canaán",symbol:"shield"},
    Ruth:{era:"Period of the judges",eraEs:"Época de los jueces",context:"A family story of loyalty, provision and belonging set around Bethlehem.",contextEs:"Relato familiar de lealtad, provisión y pertenencia ambientado en Belén.",place:"Moab and Bethlehem",placeEs:"Moab y Belén",symbol:"wheat"},
    "1 Samuel":{era:"Rise of the monarchy",eraEs:"Surgimiento de la monarquía",context:"Samuel’s leadership, Saul’s kingship and David’s emergence.",contextEs:"Liderazgo de Samuel, reinado de Saúl y surgimiento de David.",place:"Israel",placeEs:"Israel",symbol:"crown"},
    "2 Samuel":{era:"Reign of David",eraEs:"Reinado de David",context:"David’s reign, Jerusalem as royal centre and the strengths and failures of his household.",contextEs:"Reinado de David, Jerusalén como centro real y fortalezas y fallos de su casa.",place:"Jerusalem and Israel",placeEs:"Jerusalén e Israel",symbol:"crown"},
    "1 Kings":{era:"United and divided monarchy",eraEs:"Monarquía unida y dividida",context:"Solomon, the temple and the division of the kingdom, followed by prophetic confrontation.",contextEs:"Salomón, el templo y la división del reino, seguidos por confrontación profética.",place:"Israel and Judah",placeEs:"Israel y Judá",symbol:"temple"},
    "2 Kings":{era:"Divided monarchy and exile",eraEs:"Monarquía dividida y exilio",context:"The later kingdoms, prophetic ministries and the falls of Samaria and Jerusalem.",contextEs:"Los reinos posteriores, ministerios proféticos y las caídas de Samaria y Jerusalén.",place:"Israel, Judah and exile",placeEs:"Israel, Judá y exilio",symbol:"city"},
    "1 Chronicles":{era:"Davidic history",eraEs:"Historia davídica",context:"Genealogies and a retelling centred on David, worship and preparation for the temple.",contextEs:"Genealogías y un relato centrado en David, el culto y la preparación para el templo.",place:"Jerusalem",placeEs:"Jerusalén",symbol:"harp"},
    "2 Chronicles":{era:"Judah and the temple",eraEs:"Judá y el templo",context:"The kings of Judah, temple worship, reform and exile.",contextEs:"Los reyes de Judá, el culto del templo, reforma y exilio.",place:"Judah and Jerusalem",placeEs:"Judá y Jerusalén",symbol:"temple"},
    Ezra:{era:"Return from exile",eraEs:"Regreso del exilio",context:"Return to Jerusalem, rebuilding the temple and restoring community worship.",contextEs:"Regreso a Jerusalén, reconstrucción del templo y restauración del culto comunitario.",place:"Babylon and Jerusalem",placeEs:"Babilonia y Jerusalén",symbol:"city"},
    Nehemiah:{era:"Restoration of Jerusalem",eraEs:"Restauración de Jerusalén",context:"Rebuilding Jerusalem’s walls and renewing communal commitments.",contextEs:"Reconstrucción de las murallas de Jerusalén y renovación de compromisos comunitarios.",place:"Jerusalem",placeEs:"Jerusalén",symbol:"wall"},
    Esther:{era:"Jewish life in Persia",eraEs:"Vida judía en Persia",context:"Jewish life within the Persian Empire and a story of courage and deliverance.",contextEs:"Vida judía dentro del Imperio persa y un relato de valentía y liberación.",place:"Susa, Persia",placeEs:"Susa, Persia",symbol:"crown"},
    Job:{era:"Wisdom literature",eraEs:"Literatura sapiencial",context:"Poetic dialogue about suffering, integrity, human limits and divine wisdom.",contextEs:"Diálogo poético sobre sufrimiento, integridad, límites humanos y sabiduría divina.",place:"Land of Uz",placeEs:"Tierra de Uz",symbol:"storm"},
    Psalms:{era:"Worship across Israel’s history",eraEs:"Culto a lo largo de la historia de Israel",context:"Songs and prayers of praise, lament, thanksgiving, trust and royal hope.",contextEs:"Cánticos y oraciones de alabanza, lamento, gratitud, confianza y esperanza real.",place:"Israel and Jerusalem",placeEs:"Israel y Jerusalén",symbol:"harp"},
    Proverbs:{era:"Wisdom tradition",eraEs:"Tradición sapiencial",context:"Short teachings about wise speech, work, relationships, justice and reverence for God.",contextEs:"Enseñanzas breves sobre habla sabia, trabajo, relaciones, justicia y reverencia a Dios.",place:"Israel",placeEs:"Israel",symbol:"lamp"},
    Ecclesiastes:{era:"Wisdom reflection",eraEs:"Reflexión sapiencial",context:"Reflection on work, time, mortality, joy and the limits of human achievement.",contextEs:"Reflexión sobre trabajo, tiempo, mortalidad, alegría y límites del logro humano.",place:"Jerusalem setting",placeEs:"Ambientación en Jerusalén",symbol:"sun"},
    "Song of Solomon":{era:"Hebrew poetry",eraEs:"Poesía hebrea",context:"Poetic celebration of love, desire and mutual admiration.",contextEs:"Celebración poética del amor, el deseo y la admiración mutua.",place:"Israelite poetic setting",placeEs:"Ambientación poética israelita",symbol:"flower"},
    Isaiah:{era:"Eighth-century prophetic ministry",eraEs:"Ministerio profético del siglo VIII a. C.",context:"Judgment, hope, holiness, kingship and restoration in relation to Judah and the nations.",contextEs:"Juicio, esperanza, santidad, realeza y restauración en relación con Judá y las naciones.",place:"Judah and Jerusalem",placeEs:"Judá y Jerusalén",symbol:"scroll"},
    Jeremiah:{era:"Final decades of Judah",eraEs:"Últimas décadas de Judá",context:"Warnings before Jerusalem’s fall, personal lament and promises of restoration.",contextEs:"Advertencias antes de la caída de Jerusalén, lamento personal y promesas de restauración.",place:"Judah and Jerusalem",placeEs:"Judá y Jerusalén",symbol:"scroll"},
    Lamentations:{era:"Fall of Jerusalem",eraEs:"Caída de Jerusalén",context:"Poetic grief over Jerusalem’s destruction and continued appeal for mercy.",contextEs:"Dolor poético por la destrucción de Jerusalén y continua petición de misericordia.",place:"Jerusalem",placeEs:"Jerusalén",symbol:"city"},
    Ezekiel:{era:"Exile in Babylon",eraEs:"Exilio en Babilonia",context:"Prophetic visions among the exiles concerning responsibility, judgment, restoration and renewed worship.",contextEs:"Visiones proféticas entre los exiliados sobre responsabilidad, juicio, restauración y culto renovado.",place:"Babylonia",placeEs:"Babilonia",symbol:"wheel"},
    Daniel:{era:"Exile and imperial courts",eraEs:"Exilio y cortes imperiales",context:"Faithfulness in foreign courts and symbolic visions concerning kingdoms and divine rule.",contextEs:"Fidelidad en cortes extranjeras y visiones simbólicas sobre reinos y gobierno divino.",place:"Babylon and Persia",placeEs:"Babilonia y Persia",symbol:"lion"},
    Hosea:{era:"Northern kingdom prophets",eraEs:"Profetas del reino del norte",context:"Covenant unfaithfulness, judgment and persistent love addressed to Israel.",contextEs:"Infidelidad al pacto, juicio y amor persistente dirigidos a Israel.",place:"Northern kingdom of Israel",placeEs:"Reino del norte de Israel",symbol:"heart"},
    Joel:{era:"Prophetic call to return",eraEs:"Llamamiento profético a regresar",context:"A devastating locust crisis, communal repentance and hope for the outpouring of the Spirit.",contextEs:"Una devastadora crisis de langostas, arrepentimiento comunitario y esperanza del derramamiento del Espíritu.",place:"Judah",placeEs:"Judá",symbol:"locust"},
    Amos:{era:"Eighth-century Israel",eraEs:"Israel del siglo VIII a. C.",context:"Justice, worship and accountability during a period of prosperity and inequality.",contextEs:"Justicia, culto y responsabilidad durante un periodo de prosperidad y desigualdad.",place:"Israel",placeEs:"Israel",symbol:"scales"},
    Obadiah:{era:"Prophetic oracle against Edom",eraEs:"Oráculo profético contra Edom",context:"A short oracle concerning Edom, violence and the reversal of pride.",contextEs:"Oráculo breve sobre Edom, violencia y reversión del orgullo.",place:"Edom and Judah",placeEs:"Edom y Judá",symbol:"mountain"},
    Jonah:{era:"Prophetic narrative",eraEs:"Relato profético",context:"A reluctant prophet, Nineveh’s response and a lesson about mercy.",contextEs:"Un profeta reacio, la respuesta de Nínive y una lección sobre misericordia.",place:"Mediterranean and Nineveh",placeEs:"Mediterráneo y Nínive",symbol:"fish"},
    Micah:{era:"Eighth-century Judah",eraEs:"Judá del siglo VIII a. C.",context:"Justice, leadership, judgment and hope for restoration.",contextEs:"Justicia, liderazgo, juicio y esperanza de restauración.",place:"Judah and Samaria",placeEs:"Judá y Samaria",symbol:"scales"},
    Nahum:{era:"Oracle concerning Nineveh",eraEs:"Oráculo sobre Nínive",context:"Poetic announcement of Nineveh’s fall and the end of Assyrian oppression.",contextEs:"Anuncio poético de la caída de Nínive y el fin de la opresión asiria.",place:"Nineveh",placeEs:"Nínive",symbol:"city"},
    Habakkuk:{era:"Late kingdom of Judah",eraEs:"Última etapa del reino de Judá",context:"Dialogue about violence, justice, imperial power and faithful endurance.",contextEs:"Diálogo sobre violencia, justicia, poder imperial y perseverancia fiel.",place:"Judah",placeEs:"Judá",symbol:"watchtower"},
    Zephaniah:{era:"Reign of Josiah",eraEs:"Reinado de Josías",context:"Warning, purification and hope connected with the day of the Lord.",contextEs:"Advertencia, purificación y esperanza vinculadas con el día del Señor.",place:"Judah and Jerusalem",placeEs:"Judá y Jerusalén",symbol:"trumpet"},
    Haggai:{era:"Post-exilic rebuilding",eraEs:"Reconstrucción posexílica",context:"Encouragement to rebuild the temple after the return from exile.",contextEs:"Ánimo para reconstruir el templo después del regreso del exilio.",place:"Jerusalem",placeEs:"Jerusalén",symbol:"temple"},
    Zechariah:{era:"Post-exilic restoration",eraEs:"Restauración posexílica",context:"Night visions, renewed community life and future hope after exile.",contextEs:"Visiones nocturnas, vida comunitaria renovada y esperanza futura después del exilio.",place:"Jerusalem",placeEs:"Jerusalén",symbol:"lamp"},
    Malachi:{era:"Post-exilic community",eraEs:"Comunidad posexílica",context:"Priestly responsibility, covenant faithfulness and anticipation of a coming messenger.",contextEs:"Responsabilidad sacerdotal, fidelidad al pacto y expectativa de un mensajero venidero.",place:"Judah",placeEs:"Judá",symbol:"scroll"},
    Matthew:{era:"Life and ministry of Jesus",eraEs:"Vida y ministerio de Jesús",context:"A Gospel presenting Jesus’ teaching, deeds, death and resurrection with frequent links to Israel’s Scriptures.",contextEs:"Evangelio que presenta las enseñanzas, obras, muerte y resurrección de Jesús con frecuentes vínculos a las Escrituras de Israel.",place:"Galilee and Judea",placeEs:"Galilea y Judea",symbol:"star"},
    Mark:{era:"Life and ministry of Jesus",eraEs:"Vida y ministerio de Jesús",context:"A fast-moving Gospel focused on Jesus’ actions, teaching, suffering and resurrection.",contextEs:"Evangelio dinámico centrado en las acciones, enseñanzas, sufrimiento y resurrección de Jesús.",place:"Galilee and Judea",placeEs:"Galilea y Judea",symbol:"road"},
    Luke:{era:"Life and ministry of Jesus",eraEs:"Vida y ministerio de Jesús",context:"An orderly Gospel account highlighting prayer, compassion, outsiders and the journey to Jerusalem.",contextEs:"Relato evangélico ordenado que destaca oración, compasión, personas marginadas y el viaje a Jerusalén.",place:"Galilee, Samaria and Judea",placeEs:"Galilea, Samaria y Judea",symbol:"scroll"},
    John:{era:"Life and ministry of Jesus",eraEs:"Vida y ministerio de Jesús",context:"A reflective Gospel organised around signs, conversations and extended teaching.",contextEs:"Evangelio reflexivo organizado alrededor de señales, conversaciones y enseñanzas extensas.",place:"Galilee and Judea",placeEs:"Galilea y Judea",symbol:"light"},
    Acts:{era:"Early church and mission",eraEs:"Iglesia primitiva y misión",context:"The movement from Jerusalem through the eastern Mediterranean to Rome, featuring Peter, Paul and diverse communities.",contextEs:"El movimiento desde Jerusalén por el Mediterráneo oriental hasta Roma, con Pedro, Pablo y comunidades diversas.",place:"Jerusalem to Rome",placeEs:"De Jerusalén a Roma",symbol:"ship"},
    Romans:{era:"Early Christian letters",eraEs:"Cartas cristianas primitivas",context:"Paul’s extended explanation of the gospel, faith, transformed life and unity among believers in Rome.",contextEs:"Explicación extensa de Pablo sobre el evangelio, la fe, la vida transformada y la unidad entre creyentes de Roma.",place:"Rome",placeEs:"Roma",symbol:"letter"},
    "1 Corinthians":{era:"Paul’s mission and letters",eraEs:"Misión y cartas de Pablo",context:"Pastoral responses to division, worship, ethics, spiritual gifts and resurrection in Corinth.",contextEs:"Respuestas pastorales a división, culto, ética, dones espirituales y resurrección en Corinto.",place:"Corinth",placeEs:"Corinto",symbol:"letter"},
    "2 Corinthians":{era:"Paul’s mission and letters",eraEs:"Misión y cartas de Pablo",context:"Paul discusses ministry, reconciliation, generosity, weakness and his relationship with Corinth.",contextEs:"Pablo trata ministerio, reconciliación, generosidad, debilidad y su relación con Corinto.",place:"Corinth",placeEs:"Corinto",symbol:"letter"},
    Galatians:{era:"Paul’s mission and letters",eraEs:"Misión y cartas de Pablo",context:"Freedom, faith, identity and life by the Spirit among communities in Galatia.",contextEs:"Libertad, fe, identidad y vida por el Espíritu entre comunidades de Galacia.",place:"Galatia",placeEs:"Galacia",symbol:"letter"},
    Ephesians:{era:"Early Christian letters",eraEs:"Cartas cristianas primitivas",context:"Unity, new identity, ethical living and the imagery of the church as one body.",contextEs:"Unidad, nueva identidad, vida ética e imagen de la iglesia como un solo cuerpo.",place:"Ephesus and surrounding churches",placeEs:"Éfeso e iglesias cercanas",symbol:"letter"},
    Philippians:{era:"Paul’s imprisonment letters",eraEs:"Cartas de Pablo desde prisión",context:"Joy, partnership, humility and perseverance in correspondence with Philippi.",contextEs:"Alegría, colaboración, humildad y perseverancia en la correspondencia con Filipos.",place:"Philippi",placeEs:"Filipos",symbol:"letter"},
    Colossians:{era:"Early Christian letters",eraEs:"Cartas cristianas primitivas",context:"The supremacy of Christ, new life and practical relationships in the Colossian community.",contextEs:"La supremacía de Cristo, nueva vida y relaciones prácticas en la comunidad de Colosas.",place:"Colossae",placeEs:"Colosas",symbol:"letter"},
    "1 Thessalonians":{era:"Paul’s earliest mission letters",eraEs:"Primeras cartas misioneras de Pablo",context:"Encouragement, holy living, hope and questions about Christ’s return.",contextEs:"Ánimo, vida santa, esperanza y preguntas sobre el regreso de Cristo.",place:"Thessalonica",placeEs:"Tesalónica",symbol:"letter"},
    "2 Thessalonians":{era:"Paul’s mission letters",eraEs:"Cartas misioneras de Pablo",context:"Perseverance, responsible living and clarification concerning the day of the Lord.",contextEs:"Perseverancia, vida responsable y aclaración sobre el día del Señor.",place:"Thessalonica",placeEs:"Tesalónica",symbol:"letter"},
    "1 Timothy":{era:"Pastoral letters",eraEs:"Cartas pastorales",context:"Guidance about teaching, worship, leadership and care within the community.",contextEs:"Orientación sobre enseñanza, culto, liderazgo y cuidado dentro de la comunidad.",place:"Ephesus setting",placeEs:"Ambientación en Éfeso",symbol:"letter"},
    "2 Timothy":{era:"Pastoral letters",eraEs:"Cartas pastorales",context:"Personal encouragement to remain faithful, endure hardship and handle teaching carefully.",contextEs:"Ánimo personal para permanecer fiel, soportar dificultades y tratar cuidadosamente la enseñanza.",place:"Roman imprisonment setting",placeEs:"Ambientación de prisión romana",symbol:"letter"},
    Titus:{era:"Pastoral letters",eraEs:"Cartas pastorales",context:"Community organisation, sound teaching and good works in Crete.",contextEs:"Organización comunitaria, enseñanza sana y buenas obras en Creta.",place:"Crete",placeEs:"Creta",symbol:"letter"},
    Philemon:{era:"Paul’s personal letters",eraEs:"Cartas personales de Pablo",context:"A brief appeal concerning Onesimus, reconciliation and receiving another person as family.",contextEs:"Breve petición sobre Onésimo, reconciliación y recibir a otra persona como familia.",place:"Roman world",placeEs:"Mundo romano",symbol:"letter"},
    Hebrews:{era:"Early Christian teaching",eraEs:"Enseñanza cristiana primitiva",context:"A sustained comparison of covenant, priesthood, sacrifice, faith and perseverance.",contextEs:"Comparación sostenida de pacto, sacerdocio, sacrificio, fe y perseverancia.",place:"Unspecified audience",placeEs:"Audiencia no especificada",symbol:"temple"},
    James:{era:"Early Christian teaching",eraEs:"Enseñanza cristiana primitiva",context:"Practical wisdom about trials, speech, partiality, action and prayer.",contextEs:"Sabiduría práctica sobre pruebas, habla, favoritismo, acción y oración.",place:"Diaspora communities",placeEs:"Comunidades de la diáspora",symbol:"letter"},
    "1 Peter":{era:"Early Christian letters",eraEs:"Cartas cristianas primitivas",context:"Hope, holy conduct and endurance for communities facing social pressure.",contextEs:"Esperanza, conducta santa y perseverancia para comunidades bajo presión social.",place:"Asia Minor",placeEs:"Asia Menor",symbol:"letter"},
    "2 Peter":{era:"Early Christian letters",eraEs:"Cartas cristianas primitivas",context:"Growth in character, discernment and confidence in divine promise.",contextEs:"Crecimiento del carácter, discernimiento y confianza en la promesa divina.",place:"Early Christian communities",placeEs:"Comunidades cristianas primitivas",symbol:"letter"},
    "1 John":{era:"Johannine communities",eraEs:"Comunidades joánicas",context:"Assurance, love, truth, obedience and discernment within Christian community.",contextEs:"Seguridad, amor, verdad, obediencia y discernimiento dentro de la comunidad cristiana.",place:"Early Christian communities",placeEs:"Comunidades cristianas primitivas",symbol:"light"},
    "2 John":{era:"Johannine communities",eraEs:"Comunidades joánicas",context:"A brief message about truth, love, hospitality and discernment.",contextEs:"Mensaje breve sobre verdad, amor, hospitalidad y discernimiento.",place:"Early Christian community",placeEs:"Comunidad cristiana primitiva",symbol:"letter"},
    "3 John":{era:"Johannine communities",eraEs:"Comunidades joánicas",context:"A personal letter about hospitality, leadership and faithful service.",contextEs:"Carta personal sobre hospitalidad, liderazgo y servicio fiel.",place:"Early Christian community",placeEs:"Comunidad cristiana primitiva",symbol:"letter"},
    Jude:{era:"Early Christian teaching",eraEs:"Enseñanza cristiana primitiva",context:"A short appeal for discernment and faithful perseverance amid harmful teaching.",contextEs:"Breve exhortación al discernimiento y perseverancia fiel ante enseñanzas dañinas.",place:"Early Christian communities",placeEs:"Comunidades cristianas primitivas",symbol:"letter"},
    Revelation:{era:"Apocalyptic vision",eraEs:"Visión apocalíptica",context:"Symbolic visions addressed to seven churches, combining worship, warning, endurance and hope.",contextEs:"Visiones simbólicas dirigidas a siete iglesias, que combinan culto, advertencia, perseverancia y esperanza.",place:"Patmos and Asia Minor",placeEs:"Patmos y Asia Menor",symbol:"stars"}
  };

  const TIMELINE = [
    {id:"beginnings",icon:"✦",title:"Beginnings",titleEs:"Comienzos",range:"Genesis 1–11",body:"Creation, early humanity, the flood narrative and the nations.",bodyEs:"Creación, humanidad primitiva, relato del diluvio y las naciones.",type:"OT"},
    {id:"patriarchs",icon:"⛺",title:"Patriarchs",titleEs:"Patriarcas",range:"Genesis 12–50",body:"Abraham, Sarah, Isaac, Rebekah, Jacob, Leah, Rachel, Joseph and their families.",bodyEs:"Abraham, Sara, Isaac, Rebeca, Jacob, Lea, Raquel, José y sus familias.",type:"OT"},
    {id:"exodus",icon:"🌊",title:"Exodus and wilderness",titleEs:"Éxodo y desierto",range:"Exodus–Deuteronomy",body:"Deliverance from Egypt, Sinai, covenant law and the journey toward the land.",bodyEs:"Liberación de Egipto, Sinaí, ley del pacto y viaje hacia la tierra.",type:"OT"},
    {id:"settlement",icon:"🧭",title:"Settlement and judges",titleEs:"Asentamiento y jueces",range:"Joshua–Ruth",body:"Entry into the land, tribal settlement and the period of local deliverers.",bodyEs:"Entrada en la tierra, asentamiento tribal y época de libertadores locales.",type:"OT"},
    {id:"monarchy",icon:"♛",title:"United monarchy",titleEs:"Monarquía unida",range:"1 Samuel–1 Kings 11",body:"Samuel, Saul, David, Solomon and the establishment of Jerusalem and the temple.",bodyEs:"Samuel, Saúl, David, Salomón y establecimiento de Jerusalén y el templo.",type:"OT"},
    {id:"kingdoms",icon:"🏛",title:"Divided kingdoms",titleEs:"Reinos divididos",range:"1 Kings 12–2 Kings",body:"Israel and Judah, prophetic ministries, reform, conflict and eventual exile.",bodyEs:"Israel y Judá, ministerios proféticos, reforma, conflicto y exilio final.",type:"OT"},
    {id:"exile",icon:"🌒",title:"Exile",titleEs:"Exilio",range:"Ezekiel, Daniel and related texts",body:"Life under foreign empires, prophetic reflection and hope for restoration.",bodyEs:"Vida bajo imperios extranjeros, reflexión profética y esperanza de restauración.",type:"OT"},
    {id:"return",icon:"🧱",title:"Return and restoration",titleEs:"Regreso y restauración",range:"Ezra–Nehemiah; post-exilic prophets",body:"Return to Judah, rebuilding the temple and walls, and renewing community life.",bodyEs:"Regreso a Judá, reconstrucción del templo y las murallas, y renovación de la vida comunitaria.",type:"OT"},
    {id:"jesus",icon:"★",title:"Life and ministry of Jesus",titleEs:"Vida y ministerio de Jesús",range:"Matthew–John",body:"Birth narratives, teaching, signs, journeys, death and resurrection.",bodyEs:"Relatos del nacimiento, enseñanza, señales, viajes, muerte y resurrección.",type:"NT"},
    {id:"church",icon:"🔥",title:"Early church",titleEs:"Iglesia primitiva",range:"Acts 1–12",body:"Jerusalem, Pentecost, community growth and the mission associated especially with Peter.",bodyEs:"Jerusalén, Pentecostés, crecimiento comunitario y misión asociada especialmente con Pedro.",type:"NT"},
    {id:"mission",icon:"⛵",title:"Mission across the Roman world",titleEs:"Misión por el mundo romano",range:"Acts 13–28",body:"Paul’s journeys, diverse urban churches and the movement of the message toward Rome.",bodyEs:"Viajes de Pablo, diversas iglesias urbanas y avance del mensaje hacia Roma.",type:"NT"},
    {id:"letters",icon:"✉",title:"Letters and teaching",titleEs:"Cartas y enseñanza",range:"Romans–Jude",body:"Pastoral, theological and practical instruction to churches and individuals.",bodyEs:"Instrucción pastoral, teológica y práctica a iglesias y personas.",type:"NT"},
    {id:"revelation",icon:"✧",title:"Apocalyptic hope",titleEs:"Esperanza apocalíptica",range:"Revelation",body:"Symbolic visions of worship, conflict, endurance, judgment and renewal.",bodyEs:"Visiones simbólicas de culto, conflicto, perseverancia, juicio y renovación.",type:"NT"}
  ];

  const LOCATIONS = [
    {id:"egypt",name:"Egypt",nameEs:"Egipto",x:15,y:76,desc:"The setting for Joseph’s rise and the Exodus narrative.",descEs:"Escenario del ascenso de José y del relato del Éxodo.",refs:"Genesis 37–50; Exodus 1–15"},
    {id:"sinai",name:"Sinai",nameEs:"Sinaí",x:34,y:78,desc:"The wilderness region associated with covenant law and the tabernacle.",descEs:"Región desértica asociada con la ley del pacto y el tabernáculo.",refs:"Exodus 19–40"},
    {id:"jerusalem",name:"Jerusalem",nameEs:"Jerusalén",x:48,y:52,desc:"Royal city, temple centre and a major setting in the Gospels and Acts.",descEs:"Ciudad real, centro del templo y escenario principal de los Evangelios y Hechos.",refs:"2 Samuel 5; Psalms; Luke 19–24; Acts 1–7"},
    {id:"bethlehem",name:"Bethlehem",nameEs:"Belén",x:47,y:58,desc:"Associated with Ruth, David and the birth narratives of Jesus.",descEs:"Asociada con Rut, David y los relatos del nacimiento de Jesús.",refs:"Ruth 1–4; 1 Samuel 16; Matthew 2; Luke 2"},
    {id:"jericho",name:"Jericho",nameEs:"Jericó",x:53,y:54,desc:"A city near the Jordan Valley appearing in Joshua and the Gospels.",descEs:"Ciudad cercana al valle del Jordán que aparece en Josué y los Evangelios.",refs:"Joshua 6; Luke 10:30; 19:1"},
    {id:"nazareth",name:"Nazareth",nameEs:"Nazaret",x:50,y:35,desc:"The Galilean town associated with Jesus’ upbringing.",descEs:"Población galilea asociada con la crianza de Jesús.",refs:"Matthew 2:23; Luke 1:26; 4:16"},
    {id:"galilee",name:"Sea of Galilee",nameEs:"Mar de Galilea",x:54,y:31,desc:"A central setting for teaching, fishing and many Gospel events.",descEs:"Escenario central de enseñanza, pesca y muchos acontecimientos evangélicos.",refs:"Matthew 4; Mark 4–6; John 6"},
    {id:"damascus",name:"Damascus",nameEs:"Damasco",x:65,y:26,desc:"Ancient Syrian city associated with Saul’s encounter and early ministry.",descEs:"Antigua ciudad siria asociada con el encuentro de Saulo y su ministerio inicial.",refs:"Acts 9"},
    {id:"nineveh",name:"Nineveh",nameEs:"Nínive",x:79,y:30,desc:"Assyrian city central to Jonah and Nahum.",descEs:"Ciudad asiria central en Jonás y Nahúm.",refs:"Jonah; Nahum"},
    {id:"babylon",name:"Babylon",nameEs:"Babilonia",x:86,y:52,desc:"Imperial centre associated with exile narratives and prophetic imagery.",descEs:"Centro imperial asociado con relatos del exilio e imágenes proféticas.",refs:"2 Kings 24–25; Daniel 1–5; Ezekiel"},
    {id:"ephesus",name:"Ephesus",nameEs:"Éfeso",x:35,y:20,desc:"Important city in Paul’s mission and one of the seven churches in Revelation.",descEs:"Ciudad importante en la misión de Pablo y una de las siete iglesias de Apocalipsis.",refs:"Acts 18–20; Ephesians; Revelation 2:1–7"},
    {id:"corinth",name:"Corinth",nameEs:"Corinto",x:26,y:29,desc:"Greek city where Paul worked and to which two New Testament letters are addressed.",descEs:"Ciudad griega donde trabajó Pablo y a la que se dirigen dos cartas del Nuevo Testamento.",refs:"Acts 18; 1–2 Corinthians"},
    {id:"rome",name:"Rome",nameEs:"Roma",x:7,y:15,desc:"Imperial capital and the destination at the close of Acts.",descEs:"Capital imperial y destino al final de Hechos.",refs:"Romans; Acts 28"},
    {id:"patmos",name:"Patmos",nameEs:"Patmos",x:39,y:28,desc:"Island named as the setting of John’s visions in Revelation.",descEs:"Isla mencionada como escenario de las visiones de Juan en Apocalipsis.",refs:"Revelation 1:9"}
  ];

  const PEOPLE = [
    {name:"Abraham",nameEs:"Abraham",role:"Patriarch",roleEs:"Patriarca",books:"Genesis",summary:"A central figure in the covenant narratives and ancestor of a wide family line.",summaryEs:"Figura central de los relatos del pacto y antepasado de una amplia línea familiar."},
    {name:"Sarah",nameEs:"Sara",role:"Matriarch",roleEs:"Matriarca",books:"Genesis",summary:"Wife of Abraham and mother of Isaac within the promise narratives.",summaryEs:"Esposa de Abraham y madre de Isaac dentro de los relatos de la promesa."},
    {name:"Moses",nameEs:"Moisés",role:"Leader and lawgiver",roleEs:"Líder y legislador",books:"Exodus–Deuteronomy",summary:"Leads Israel from Egypt, mediates the covenant and guides the wilderness journey.",summaryEs:"Conduce a Israel fuera de Egipto, media el pacto y guía el viaje por el desierto."},
    {name:"Ruth",nameEs:"Rut",role:"Moabite woman in Israel’s story",roleEs:"Mujer moabita en la historia de Israel",books:"Ruth",summary:"Remembered for loyalty to Naomi and her place in the family line of David.",summaryEs:"Recordada por su lealtad a Noemí y su lugar en la línea familiar de David."},
    {name:"David",nameEs:"David",role:"King and psalm-associated figure",roleEs:"Rey y figura asociada con los salmos",books:"1 Samuel–1 Kings; Psalms",summary:"From shepherd and warrior to king in Jerusalem, with a complex personal and political story.",summaryEs:"De pastor y guerrero a rey en Jerusalén, con una historia personal y política compleja."},
    {name:"Esther",nameEs:"Ester",role:"Queen in Persia",roleEs:"Reina en Persia",books:"Esther",summary:"Uses courage and influence within the Persian court to protect her people.",summaryEs:"Usa valentía e influencia en la corte persa para proteger a su pueblo."},
    {name:"Daniel",nameEs:"Daniel",role:"Exile and court official",roleEs:"Exiliado y funcionario de corte",books:"Daniel",summary:"Known for faithfulness in imperial courts and for symbolic visions.",summaryEs:"Conocido por su fidelidad en cortes imperiales y por visiones simbólicas."},
    {name:"Mary",nameEs:"María",role:"Mother of Jesus",roleEs:"Madre de Jesús",books:"Matthew; Luke; John; Acts",summary:"Prominent in the birth narratives and present at key moments in the Gospel story.",summaryEs:"Destacada en los relatos del nacimiento y presente en momentos clave del relato evangélico."},
    {name:"Peter",nameEs:"Pedro",role:"Apostle",roleEs:"Apóstol",books:"Gospels; Acts; 1–2 Peter",summary:"A leading disciple in the Gospels and an important witness in early Acts.",summaryEs:"Discípulo destacado en los Evangelios y testigo importante en los primeros capítulos de Hechos."},
    {name:"Paul",nameEs:"Pablo",role:"Missionary and letter writer",roleEs:"Misionero y autor de cartas",books:"Acts; Romans–Philemon",summary:"Travels across the Roman world, establishes communities and writes influential letters.",summaryEs:"Viaja por el mundo romano, establece comunidades y escribe cartas influyentes."},
    {name:"Priscilla",nameEs:"Priscila",role:"Teacher and ministry partner",roleEs:"Maestra y colaboradora ministerial",books:"Acts; Romans; 1 Corinthians; 2 Timothy",summary:"Works with Aquila and Paul and helps explain the way of God to Apollos.",summaryEs:"Trabaja con Aquila y Pablo y ayuda a explicar el camino de Dios a Apolos."},
    {name:"Lydia",nameEs:"Lidia",role:"Businesswoman and host",roleEs:"Comerciante y anfitriona",books:"Acts",summary:"A dealer in purple cloth in Philippi who welcomes Paul’s group into her home.",summaryEs:"Comerciante de púrpura en Filipos que recibe al grupo de Pablo en su casa."}
  ];

  const VERSES = [
    ["Genesis 1:31","Creation is presented as good and worthy of careful stewardship.","La creación se presenta como buena y digna de cuidado responsable."],
    ["Genesis 12:2","The call of Abraham connects blessing with becoming a blessing to others.","El llamado de Abraham conecta la bendición con ser una bendición para otros."],
    ["Exodus 14:14","In a moment of fear, Israel is called to trust rather than panic.","En un momento de temor, Israel es llamado a confiar en vez de entrar en pánico."],
    ["Deuteronomy 6:5","Wholehearted love for God involves heart, life and strength.","El amor a Dios de todo corazón abarca corazón, vida y fuerzas."],
    ["Joshua 1:9","Courage is linked with confidence in God’s presence.","El valor se vincula con la confianza en la presencia de Dios."],
    ["Ruth 1:16","Ruth expresses extraordinary loyalty, belonging and commitment.","Rut expresa lealtad, pertenencia y compromiso extraordinarios."],
    ["1 Samuel 16:7","The narrative contrasts outward appearance with the inner person.","El relato contrasta la apariencia exterior con la persona interior."],
    ["Psalm 23:1","The shepherd image communicates guidance, care and provision.","La imagen del pastor comunica guía, cuidado y provisión."],
    ["Psalm 46:1","God is described as refuge and strength in times of trouble.","Dios es descrito como refugio y fortaleza en tiempos de dificultad."],
    ["Psalm 119:105","God’s word is pictured as light for the next step on a path.","La palabra de Dios se representa como luz para el siguiente paso del camino."],
    ["Proverbs 3:5–6","Wisdom includes trust, humility and acknowledging God in one’s direction.","La sabiduría incluye confianza, humildad y reconocer a Dios al orientar la vida."],
    ["Proverbs 15:1","A gentle response can reduce conflict, while harsh speech intensifies it.","Una respuesta amable puede reducir el conflicto, mientras que el habla dura lo intensifica."],
    ["Ecclesiastes 3:1","Human life contains changing seasons and appropriate times for different actions.","La vida humana contiene estaciones cambiantes y tiempos apropiados para distintas acciones."],
    ["Isaiah 40:31","Hope in God is associated with renewed strength and endurance.","La esperanza en Dios se asocia con fuerza renovada y perseverancia."],
    ["Micah 6:8","The prophetic summary joins justice, mercy and humble walking with God.","El resumen profético une justicia, misericordia y caminar humildemente con Dios."],
    ["Matthew 5:9","Peacemakers are honoured within Jesus’ teaching.","Los pacificadores son honrados dentro de la enseñanza de Jesús."],
    ["Matthew 6:34","Jesus directs attention away from tomorrow’s anxiety toward today’s responsibilities.","Jesús dirige la atención de la ansiedad por mañana hacia las responsabilidades de hoy."],
    ["Matthew 7:12","Treating others as one wishes to be treated summarises a broad ethical principle.","Tratar a los demás como uno desea ser tratado resume un amplio principio ético."],
    ["Matthew 11:28","Jesus invites burdened people to come to him for rest.","Jesús invita a las personas cargadas a acudir a él para hallar descanso."],
    ["Mark 10:45","Leadership is framed through service rather than domination.","El liderazgo se presenta mediante el servicio en vez de la dominación."],
    ["Luke 6:31","The call to treat others well is stated in direct, memorable language.","El llamado a tratar bien a los demás se expresa con lenguaje directo y memorable."],
    ["Luke 10:27","Love of God and neighbour stands at the centre of faithful life.","El amor a Dios y al prójimo ocupa el centro de una vida fiel."],
    ["John 8:12","Light is used as an image of direction, life and freedom from darkness.","La luz se usa como imagen de dirección, vida y libertad de la oscuridad."],
    ["John 13:34","Jesus places self-giving love at the centre of discipleship.","Jesús coloca el amor entregado en el centro del discipulado."],
    ["Acts 20:35","Generosity is presented as a source of blessing.","La generosidad se presenta como fuente de bendición."],
    ["Romans 12:18","Peace is to be pursued as far as it depends on the individual.","La paz debe buscarse en cuanto dependa de cada persona."],
    ["1 Corinthians 13:4–7","Love is described through patience, kindness, endurance and refusal to keep score of wrongs.","El amor se describe mediante paciencia, bondad, perseverancia y rechazo a llevar cuenta de las faltas."],
    ["Galatians 5:22–23","The fruit of the Spirit describes a pattern of mature character.","El fruto del Espíritu describe un modelo de carácter maduro."],
    ["Philippians 4:6–7","Prayer, gratitude and peace are joined in response to anxiety.","Oración, gratitud y paz se unen como respuesta a la ansiedad."],
    ["Colossians 3:13","Forgiveness is connected with patience toward one another.","El perdón se conecta con la paciencia mutua."],
    ["James 1:19","Listening quickly, speaking carefully and slowing anger form practical wisdom.","Escuchar pronto, hablar con cuidado y frenar la ira forman una sabiduría práctica."],
    ["1 Peter 3:15","Hope is to be explained with gentleness and respect.","La esperanza debe explicarse con amabilidad y respeto."]
  ];

  const LESSONS = [
    {id:"story",icon:"📖",title:"The Bible’s big story",titleEs:"La gran historia bíblica",summary:"Trace the movement from beginnings and covenant to kingdom, exile, Jesus, mission and renewal.",summaryEs:"Sigue el recorrido desde los comienzos y el pacto hasta el reino, exilio, Jesús, misión y renovación.",facts:["The Bible is a library of books rather than a single literary genre.","Narrative, poetry, wisdom, prophecy, Gospel, letters and apocalyptic writing communicate in different ways.","Major themes develop across many books and historical settings.","Good interpretation considers immediate context before broader connections.","The quiz identifies the biblical reference so learners can verify each answer."],factsEs:["La Biblia es una biblioteca de libros, no un único género literario.","Narrativa, poesía, sabiduría, profecía, Evangelio, cartas y literatura apocalíptica comunican de maneras distintas.","Los grandes temas se desarrollan a través de muchos libros y contextos históricos.","Una buena interpretación considera el contexto inmediato antes de conexiones más amplias.","El quiz identifica la referencia bíblica para que el estudiante pueda verificar cada respuesta."],filter:q=>true},
    {id:"people",icon:"👥",title:"People and relationships",titleEs:"Personas y relaciones",summary:"Learn family lines, friendships, leadership relationships and the choices made by major figures.",summaryEs:"Aprende líneas familiares, amistades, relaciones de liderazgo y decisiones de figuras principales.",facts:["Biblical people are often presented with both strengths and failures.","Family relationships shape many narratives in Genesis, Samuel and Kings.","Women and men participate in leadership, courage, hospitality and teaching.","Names can vary slightly between English and Spanish traditions.","Pay attention to who speaks, who acts and who is affected."],factsEs:["Las personas bíblicas suelen presentarse con fortalezas y fallos.","Las relaciones familiares moldean muchos relatos de Génesis, Samuel y Reyes.","Mujeres y hombres participan en liderazgo, valentía, hospitalidad y enseñanza.","Los nombres pueden variar ligeramente entre tradiciones inglesas y españolas.","Presta atención a quién habla, quién actúa y quién resulta afectado."],filter:q=>q.category==="People & Relationships" || /who|whose|mother|father|wife|husband|son|daughter|quién|madre|padre|esposa|esposo|hijo|hija/i.test(`${q.q} ${q.e}`)},
    {id:"places",icon:"🗺",title:"Places and geography",titleEs:"Lugares y geografía",summary:"Connect events with regions, cities, roads, rivers, seas and empires.",summaryEs:"Conecta acontecimientos con regiones, ciudades, caminos, ríos, mares e imperios.",facts:["Jerusalem is central to monarchy, temple worship, the Gospels and Acts.","Galilee and Judea are major regions in the Gospel narratives.","Paul’s journeys connect cities across the eastern Mediterranean.","Exile places Israel and Judah within Assyrian and Babylonian imperial settings.","Maps are learning aids; distances and borders changed across periods."],factsEs:["Jerusalén es central para la monarquía, el culto del templo, los Evangelios y Hechos.","Galilea y Judea son regiones principales en los relatos evangélicos.","Los viajes de Pablo conectan ciudades del Mediterráneo oriental.","El exilio sitúa a Israel y Judá dentro de contextos imperiales asirios y babilónicos.","Los mapas son ayudas de aprendizaje; distancias y fronteras cambiaron según la época."],filter:q=>q.category==="Places & Geography" || /where|city|river|sea|mount|island|land|dónde|ciudad|río|mar|monte|isla|tierra/i.test(`${q.q} ${q.e}`)},
    {id:"jesus",icon:"★",title:"Jesus and the Gospels",titleEs:"Jesús y los Evangelios",summary:"Compare Gospel settings, signs, parables, disciples and the journey toward Jerusalem.",summaryEs:"Compara escenarios evangélicos, señales, parábolas, discípulos y el viaje hacia Jerusalén.",facts:["Each Gospel arranges material with its own emphases and literary design.","Many events appear in more than one Gospel, sometimes with different selected details.","Parables use memorable images to invite reflection and response.","Geography often supports the movement of a Gospel narrative.","Translation-neutral questions focus on shared narrative facts and references."],factsEs:["Cada Evangelio organiza el material con sus propios énfasis y diseño literario.","Muchos acontecimientos aparecen en más de un Evangelio, a veces con distintos detalles seleccionados.","Las parábolas usan imágenes memorables para invitar a reflexión y respuesta.","La geografía suele apoyar el movimiento del relato evangélico.","Las preguntas neutrales entre traducciones se centran en hechos narrativos y referencias compartidas."],filter:q=>q.category==="Jesus & the Gospels" || /Jesus|Jesús|Gospel|Evangelio/i.test(`${q.q} ${q.e}`)},
    {id:"church",icon:"🔥",title:"Acts and the early church",titleEs:"Hechos y la iglesia primitiva",summary:"Follow the movement from Jerusalem to Judea, Samaria and the wider Roman world.",summaryEs:"Sigue el movimiento desde Jerusalén hacia Judea, Samaria y el mundo romano más amplio.",facts:["Acts begins in Jerusalem and ends with Paul in Rome.","Speeches, journeys, community life and opposition shape the narrative.","Peter is prominent in the earlier chapters and Paul in the later chapters.","Women, households and travelling coworkers are important to the mission.","The letters provide additional windows into early Christian communities."],factsEs:["Hechos comienza en Jerusalén y termina con Pablo en Roma.","Discursos, viajes, vida comunitaria y oposición moldean el relato.","Pedro destaca en los primeros capítulos y Pablo en los posteriores.","Mujeres, hogares y colaboradores viajeros son importantes para la misión.","Las cartas ofrecen ventanas adicionales a las primeras comunidades cristianas."],filter:q=>q.book==="Acts" || q.category==="Early Church & Apostles"},
    {id:"wisdom",icon:"🪔",title:"Wisdom and poetry",titleEs:"Sabiduría y poesía",summary:"Recognise poetic imagery, parallel lines, proverbs, lament, praise and reflective wisdom.",summaryEs:"Reconoce imágenes poéticas, líneas paralelas, proverbios, lamento, alabanza y sabiduría reflexiva.",facts:["Poetry communicates through images, repetition and parallel ideas.","A proverb normally expresses practical wisdom rather than a mechanical guarantee.","Psalms include praise, lament, thanksgiving, confession and royal themes.","Job and Ecclesiastes explore difficult questions rather than offering simplistic answers.","Literary form matters when interpreting a verse."],factsEs:["La poesía comunica mediante imágenes, repetición e ideas paralelas.","Un proverbio normalmente expresa sabiduría práctica, no una garantía mecánica.","Los Salmos incluyen alabanza, lamento, gratitud, confesión y temas reales.","Job y Eclesiastés exploran preguntas difíciles en vez de ofrecer respuestas simplistas.","La forma literaria importa al interpretar un versículo."],filter:q=>q.category==="Wisdom & Poetry" || ["Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon"].includes(q.book)}
  ];

  const COLLECTIONS = [
    {id:"women",icon:"🌿",title:"Women of the Bible",titleEs:"Mujeres de la Biblia",desc:"Courage, leadership, family, faith and service.",descEs:"Valentía, liderazgo, familia, fe y servicio.",match:q=>/Sarah|Rebekah|Rachel|Leah|Miriam|Deborah|Ruth|Naomi|Hannah|Abigail|Esther|Mary|Martha|Elizabeth|Lydia|Priscilla|Phoebe|Sara|Rebeca|Raquel|Lea|María|Marta|Elisabet|Lidia|Priscila|Febe/i.test(`${q.q} ${q.e} ${q.a.join(" ")}`)},
    {id:"miracles",icon:"✦",title:"Miracles of Jesus",titleEs:"Milagros de Jesús",desc:"Signs, healings, provision and restoration in the Gospels.",descEs:"Señales, sanidades, provisión y restauración en los Evangelios.",match:q=>q.category==="Miracles & Signs" && /Jesus|Jesús|Gospel|Evangelio|Matthew|Mark|Luke|John|Mateo|Marcos|Lucas|Juan/i.test(`${q.q} ${q.e} ${q.ref}`)},
    {id:"paul",icon:"⛵",title:"Life and journeys of Paul",titleEs:"Vida y viajes de Pablo",desc:"Conversion, coworkers, cities, letters and mission.",descEs:"Conversión, colaboradores, ciudades, cartas y misión.",match:q=>/Paul|Saul|Pablo|Saulo/i.test(`${q.q} ${q.e} ${q.a.join(" ")}`)},
    {id:"kings",icon:"♛",title:"Kings of Israel and Judah",titleEs:"Reyes de Israel y Judá",desc:"Saul, David, Solomon and the divided kingdoms.",descEs:"Saúl, David, Salomón y los reinos divididos.",match:q=>q.category==="Kings & Leadership" || /king|queen|reign|throne|rey|reina|reinado|trono/i.test(`${q.q} ${q.e}`)},
    {id:"prophets",icon:"📜",title:"Prophets and prophecy",titleEs:"Profetas y profecía",desc:"Messages, signs, call narratives and historical settings.",descEs:"Mensajes, señales, relatos de llamado y contextos históricos.",match:q=>q.category==="Prophets & Prophecy"},
    {id:"geography",icon:"🗺",title:"Bible geography",titleEs:"Geografía bíblica",desc:"Cities, rivers, seas, islands, roads and regions.",descEs:"Ciudades, ríos, mares, islas, caminos y regiones.",match:q=>q.category==="Places & Geography"},
    {id:"parables",icon:"🌾",title:"Parables",titleEs:"Parábolas",desc:"Images and stories used in Jesus’ teaching.",descEs:"Imágenes y relatos usados en la enseñanza de Jesús.",match:q=>q.category==="Parables" || /parable|parábola/i.test(`${q.q} ${q.e}`)},
    {id:"beatitudes",icon:"☀",title:"Beatitudes and Sermon on the Mount",titleEs:"Bienaventuranzas y Sermón del Monte",desc:"Teachings from Matthew 5–7 and related passages.",descEs:"Enseñanzas de Mateo 5–7 y pasajes relacionados.",match:q=>/Matthew 5|Matthew 6|Matthew 7|Mateo 5|Mateo 6|Mateo 7|Beatitude|bienaventuran/i.test(`${q.q} ${q.e} ${q.ref}`)},
    {id:"nativity",icon:"★",title:"Birth narratives",titleEs:"Relatos del nacimiento",desc:"Announcements, journeys, Bethlehem and the early years of Jesus.",descEs:"Anuncios, viajes, Belén y primeros años de Jesús.",match:q=>/birth|born|Bethlehem|magi|shepherd|Gabriel|nativity|nacimiento|nació|Belén|magos|pastores/i.test(`${q.q} ${q.e} ${q.a.join(" ")} ${q.ref}`)},
    {id:"resurrection",icon:"🌅",title:"Death and resurrection narratives",titleEs:"Relatos de muerte y resurrección",desc:"Final week, trial, death, burial and resurrection accounts.",descEs:"Última semana, juicio, muerte, sepultura y relatos de resurrección.",match:q=>/resurrection|rose|tomb|crucif|burial|risen|resurre|resucit|tumba|sepultura/i.test(`${q.q} ${q.e} ${q.a.join(" ")}`)},
    {id:"pentecost",icon:"🔥",title:"Pentecost and the early church",titleEs:"Pentecostés y la iglesia primitiva",desc:"Acts, the Spirit, witness, community and mission.",descEs:"Hechos, el Espíritu, testimonio, comunidad y misión.",match:q=>/Pentecost|Acts 2|Holy Spirit|Spirit descended|Pentecostés|Hechos 2|Espíritu Santo|descendió el Espíritu/i.test(`${q.q} ${q.e} ${q.ref}`) || (q.book==="Acts" && q.r<=2)}
  ];

  function getProfile(){ return window.BQApp?.getProfile?.(); }
  function saveProfile(){ window.BQApp?.saveProfiles?.(); }
  async function bank(){ if(!bankCache) bankCache = await window.BQData.load(["OT","NT"]); return bankCache; }

  function insertExperienceShell(){
    const dashboard = document.querySelector("#welcomeScreen .dashboard");
    if(!dashboard || $("dailyVerseSection")) return;
    const html = `
      <section id="dailyVerseSection" class="experience-section daily-verse-section" aria-labelledby="dailyVerseTitle">
        <div class="daily-verse-art" aria-hidden="true"><span>☀</span><i></i><i></i><i></i></div>
        <div class="daily-verse-copy">
          <span class="section-kicker">Daily reflection</span>
          <h2 id="dailyVerseTitle">Today’s Bible focus</h2>
          <strong id="dailyVerseReference"></strong>
          <p id="dailyVerseInsight"></p>
          <div class="daily-verse-actions"><button id="verseStudiedBtn" type="button" class="primary-btn">Mark as studied</button><button id="verseQuizBtn" type="button" class="secondary-btn">Quiz this theme</button></div>
        </div>
      </section>
      <section id="exploreLearnSection" class="experience-section" aria-labelledby="exploreLearnTitle">
        <div class="section-heading"><div><span class="section-kicker">Explore and learn</span><h2 id="exploreLearnTitle">Beyond the quiz</h2></div><span class="count-pill">Interactive learning suite</span></div>
        <div class="experience-grid">
          <button type="button" class="experience-card" data-open-experience="explorer"><span class="experience-icon">⌕</span><strong>Bible Explorer</strong><small>Search people, books, places and related questions.</small></button>
          <button type="button" class="experience-card" data-open-experience="timeline"><span class="experience-icon">↝</span><strong>Bible Timeline</strong><small>Follow the traditional narrative sequence across major eras.</small></button>
          <button type="button" class="experience-card" data-open-experience="maps"><span class="experience-icon">⌖</span><strong>Interactive Maps</strong><small>Explore a schematic map of key biblical locations.</small></button>
          <button type="button" class="experience-card" data-open-experience="learning"><span class="experience-icon">◫</span><strong>Learning Mode</strong><small>Read concise lessons before practising the topic.</small></button>
          <button type="button" class="experience-card featured" data-open-experience="weekly"><span class="experience-icon">◎</span><strong>Weekly Challenge</strong><small>A shared deterministic challenge with a friend code.</small></button>
        </div>
      </section>
      <section id="collectionSection" class="experience-section" aria-labelledby="collectionTitle">
        <div class="section-heading"><div><span class="section-kicker">Specialist collections</span><h2 id="collectionTitle">Choose a focused journey</h2></div><span id="collectionCount" class="count-pill"></span></div>
        <div id="collectionGrid" class="collection-grid"></div>
      </section>`;
    dashboard.insertAdjacentHTML("beforebegin", html);

    dashboard.querySelector(".dashboard-grid")?.insertAdjacentHTML("afterend", `
      <div id="learningInsightGrid" class="learning-insight-grid" aria-label="Personal learning insights"></div>`);

    const questionPanel = document.querySelector(".question-panel");
    questionPanel?.insertAdjacentHTML("afterbegin", `<div id="questionVisual" class="question-visual" aria-hidden="true"></div>`);
    $("bookmarkBtn")?.insertAdjacentHTML("beforebegin", `<button class="context-btn" id="contextBtn" type="button">◫ Evidence & context</button>`);

    document.body.insertAdjacentHTML("beforeend", dialogsHtml());
    document.body.insertAdjacentHTML("afterbegin", `<div class="ambient-particles" aria-hidden="true">${Array.from({length:20},(_,i)=>`<i style="--x:${(i*37)%100}%;--y:${(i*53)%100}%;--d:${6+(i%7)}s;--delay:-${i*.7}s"></i>`).join("")}</div>`);

    const settingsGrid = document.querySelector("#settingsDialog .form-grid");
    if(settingsGrid && !$("textScaleSelect")) settingsGrid.insertAdjacentHTML("beforeend", `
      <label>Text size<select id="textScaleSelect"><option value="100">Standard</option><option value="115">Large</option><option value="130">Extra large</option></select></label>`);
    const switchList = document.querySelector("#settingsDialog .switch-list");
    if(switchList && !$("adaptiveToggle")) switchList.insertAdjacentHTML("beforeend", `
      <label class="switch-row"><span><strong>Adaptive difficulty</strong><small>Adjusts the remaining questions to keep the challenge productive.</small></span><input id="adaptiveToggle" type="checkbox" role="switch"></label>
      <label class="switch-row"><span><strong>Visual learning illustrations</strong><small>Shows a thematic illustration for every question.</small></span><input id="visualLearningToggle" type="checkbox" role="switch"></label>
      <label class="switch-row"><span><strong>Enhanced evidence and context</strong><small>Adds historical, literary, timeline and map context after each answer.</small></span><input id="enhancedContextToggle" type="checkbox" role="switch"></label>
      <label class="switch-row"><span><strong>High-contrast mode</strong><small>Strengthens borders, text and answer-state contrast.</small></span><input id="highContrastToggle" type="checkbox" role="switch"></label>
      <label class="switch-row"><span><strong>Reading-friendly type</strong><small>Uses a highly legible system typeface with extra spacing.</small></span><input id="dyslexiaToggle" type="checkbox" role="switch"></label>
      <label class="switch-row"><span><strong>Left-handed answer layout</strong><small>Moves answer letters and status markers to the right.</small></span><input id="leftHandedToggle" type="checkbox" role="switch"></label>`);

    const historyCard = $("historyDialog")?.querySelector(".dialog-card");
    if(historyCard && !$("advancedAnalytics")) historyCard.insertAdjacentHTML("beforeend", `<section id="advancedAnalytics" class="advanced-analytics" aria-labelledby="advancedAnalyticsTitle"><h3 id="advancedAnalyticsTitle">Advanced learning insights</h3><div id="analyticsContent"></div></section>`);

    const profileCard = $("profileDialog")?.querySelector(".dialog-card");
    if(profileCard && !$("familyLeaderboard")) profileCard.insertAdjacentHTML("beforeend", `<section class="family-leaderboard" aria-labelledby="familyLeaderboardTitle"><h3 id="familyLeaderboardTitle">Family leaderboard</h3><div id="familyLeaderboard"></div></section>`);
  }

  function dialogsHtml(){
    return `
    <dialog id="explorerDialog" class="app-dialog experience-dialog wide-dialog" aria-labelledby="explorerTitle"><div class="dialog-card">
      <div class="dialog-head"><div><span class="section-kicker">Search and discover</span><h2 id="explorerTitle">Bible Explorer</h2></div><button class="close-btn" data-close-dialog="explorerDialog" aria-label="Close Bible Explorer">×</button></div>
      <label class="explorer-search"><span>Search people, books, places, references or words</span><input id="explorerSearch" type="search" placeholder="Try Moses, Jerusalem, prayer or Acts 16"></label>
      <div id="explorerQuickLinks" class="explorer-quick-links"></div><div id="explorerResults" class="explorer-results"></div>
    </div></dialog>
    <dialog id="timelineDialog" class="app-dialog experience-dialog wide-dialog" aria-labelledby="timelineTitle"><div class="dialog-card">
      <div class="dialog-head"><div><span class="section-kicker">Journey through Scripture</span><h2 id="timelineTitle">Bible Timeline</h2></div><button class="close-btn" data-close-dialog="timelineDialog" aria-label="Close Bible timeline">×</button></div>
      <p class="context-note">This timeline presents a broad traditional narrative sequence. Dates and the chronology of some ancient events are interpreted differently by scholars and faith traditions.</p>
      <div class="timeline-filters"><button class="secondary-btn active" data-timeline-filter="all">Whole Bible</button><button class="secondary-btn" data-timeline-filter="OT">Old Testament</button><button class="secondary-btn" data-timeline-filter="NT">New Testament</button></div>
      <div id="timelineTrack" class="timeline-track"></div>
    </div></dialog>
    <dialog id="mapsDialog" class="app-dialog experience-dialog wide-dialog" aria-labelledby="mapsTitle"><div class="dialog-card">
      <div class="dialog-head"><div><span class="section-kicker">Places and journeys</span><h2 id="mapsTitle">Interactive Bible Map</h2></div><button class="close-btn" data-close-dialog="mapsDialog" aria-label="Close map">×</button></div>
      <p class="context-note">Schematic learning map — positions are approximate and are not intended for navigation or precise historical boundary reconstruction.</p>
      <div class="map-layout"><div id="bibleMap" class="bible-map"></div><aside id="mapDetail" class="map-detail"></aside></div>
    </div></dialog>
    <dialog id="learningDialog" class="app-dialog experience-dialog wide-dialog" aria-labelledby="learningTitle"><div class="dialog-card">
      <div class="dialog-head"><div><span class="section-kicker">Learn before you play</span><h2 id="learningTitle">Learning Mode</h2></div><button class="close-btn" data-close-dialog="learningDialog" aria-label="Close learning mode">×</button></div>
      <div id="lessonGrid" class="lesson-grid"></div><article id="lessonDetail" class="lesson-detail" hidden></article>
    </div></dialog>
    <dialog id="weeklyDialog" class="app-dialog experience-dialog" aria-labelledby="weeklyTitle"><div class="dialog-card">
      <div class="dialog-head"><div><span class="section-kicker">Shared weekly event</span><h2 id="weeklyTitle">Weekly Challenge</h2></div><button class="close-btn" data-close-dialog="weeklyDialog" aria-label="Close weekly challenge">×</button></div>
      <div id="weeklyChallengeContent"></div>
    </div></dialog>
    <dialog id="contextDialog" class="app-dialog experience-dialog wide-dialog" aria-labelledby="contextTitle"><div class="dialog-card">
      <div class="dialog-head"><div><span class="section-kicker">Evidence and context</span><h2 id="contextTitle">Explore this answer</h2></div><button class="close-btn" data-close-dialog="contextDialog" aria-label="Close evidence and context">×</button></div>
      <div id="contextContent"></div>
    </div></dialog>
    <dialog id="collectionDialog" class="app-dialog experience-dialog" aria-labelledby="collectionDialogTitle"><div class="dialog-card">
      <div class="dialog-head"><div><span class="section-kicker">Specialist collection</span><h2 id="collectionDialogTitle"></h2></div><button class="close-btn" data-close-dialog="collectionDialog" aria-label="Close collection">×</button></div>
      <div id="collectionDialogContent"></div>
    </div></dialog>
    <div id="achievementCeremony" class="achievement-ceremony" hidden role="dialog" aria-modal="true" aria-labelledby="achievementCeremonyTitle"><div class="achievement-ceremony-card"><span class="achievement-rays" aria-hidden="true"></span><span class="ceremony-icon">🏆</span><small>Achievement unlocked</small><h2 id="achievementCeremonyTitle"></h2><p id="achievementCeremonyText"></p><button id="closeCeremonyBtn" class="primary-btn" type="button">Continue</button></div></div>`;
  }

  function bindExperienceEvents(){
    document.querySelectorAll("[data-open-experience]").forEach(button=>button.addEventListener("click",()=>openExperience(button.dataset.openExperience)));
    document.querySelectorAll("[data-close-dialog]").forEach(button=>button.addEventListener("click",()=>$(button.dataset.closeDialog)?.close()));
    $("verseStudiedBtn")?.addEventListener("click",markVerseStudied);
    $("verseQuizBtn")?.addEventListener("click",()=>startVerseQuiz());
    $("contextBtn")?.addEventListener("click",openCurrentContext);
    $("explorerSearch")?.addEventListener("input",event=>renderExplorer(event.target.value));
    document.querySelectorAll("[data-timeline-filter]").forEach(button=>button.addEventListener("click",()=>{
      document.querySelectorAll("[data-timeline-filter]").forEach(b=>b.classList.toggle("active",b===button)); renderTimeline(button.dataset.timelineFilter);
    }));
    $("closeCeremonyBtn")?.addEventListener("click",()=>$("achievementCeremony").hidden=true);
    $("profileBtn")?.addEventListener("click",()=>setTimeout(renderFamilyLeaderboard,20));
    $("historyBtn")?.addEventListener("click",()=>setTimeout(renderAnalytics,20));
    $("settingsBtn")?.addEventListener("click",()=>setTimeout(syncExperienceSettings,10));
    $("collectionGrid")?.addEventListener("click",event=>{
      const card=event.target.closest("[data-collection]"); if(card) openCollection(card.dataset.collection);
    });
    $("lessonGrid")?.addEventListener("click",event=>{
      const card=event.target.closest("[data-lesson]"); if(card) showLesson(card.dataset.lesson);
    });
    $("lessonDetail")?.addEventListener("click",event=>{
      if(event.target.closest("[data-start-lesson-quiz]")) startLessonQuiz(currentLesson);
      if(event.target.closest("[data-back-lessons]")) {$("lessonDetail").hidden=true;$("lessonGrid").hidden=false;}
    });
    $("mapDetail")?.addEventListener("click",event=>{
      const button=event.target.closest("[data-map-quiz]"); if(button) startLocationQuiz(button.dataset.mapQuiz);
    });
    $("contextContent")?.addEventListener("click",event=>{
      if(event.target.closest("[data-related-practice]")) startRelatedPractice();
    });
    $("collectionDialogContent")?.addEventListener("click",event=>{
      const button=event.target.closest("[data-start-collection]"); if(button) startCollection(button.dataset.startCollection);
    });
    $("weeklyChallengeContent")?.addEventListener("click",event=>{
      if(event.target.closest("[data-start-weekly]")) startWeeklyChallenge();
      if(event.target.closest("[data-share-weekly]")) shareWeeklyChallenge();
      if(event.target.closest("[data-copy-code]")) copyWeeklyCode();
    });
    document.addEventListener("bq:question",event=>{currentQuestion=event.detail.question;renderQuestionVisual(currentQuestion);});
    document.addEventListener("bq:answer",event=>{
      currentQuestion=event.detail.question;
      if(getProfile()?.settings?.enhancedContext) $("contextBtn")?.classList.add("attention");
    });
    document.addEventListener("bq:finish",event=>{
      renderCollections(); renderAnalytics();
      if(event.detail.newAchievements?.length) setTimeout(()=>showAchievementCeremony(event.detail.newAchievements),1000);
    });
    document.addEventListener("bq:home",()=>{applyExperienceSettings();renderDailyVerse();renderInsights();renderCollections();enrichAchievements();});
  }

  function syncExperienceSettings(){
    const settings=getProfile()?.settings||{};
    const map={adaptiveToggle:"adaptiveDifficulty",visualLearningToggle:"visualLearning",enhancedContextToggle:"enhancedContext",highContrastToggle:"highContrast",dyslexiaToggle:"dyslexiaFriendly",leftHandedToggle:"leftHanded"};
    Object.entries(map).forEach(([id,key])=>{if($(id)) $(id).checked=Boolean(settings[key]);});
    if($("textScaleSelect")) $("textScaleSelect").value=String(settings.textScale||100);
  }

  function applyExperienceSettings(){
    const s=getProfile()?.settings||{};
    document.body.classList.toggle("high-contrast",Boolean(s.highContrast));
    document.body.classList.toggle("dyslexia-friendly",Boolean(s.dyslexiaFriendly));
    document.body.classList.toggle("left-handed",Boolean(s.leftHanded));
    document.body.classList.toggle("visual-learning-off",s.visualLearning===false);
    document.documentElement.style.setProperty("--user-text-scale",String((Number(s.textScale)||100)/100));
  }

  function renderDailyVerse(){
    const index=Math.abs(dayOfYear(new Date()))%VERSES.length;
    const [ref,en,es]=VERSES[index];
    $("dailyVerseReference").textContent=ref;
    $("dailyVerseInsight").textContent=isEs()?es:en;
    const studied=(getProfile()?.stats?.verseDays||[]).includes(localDateKey());
    $("verseStudiedBtn").textContent=studied?L("Studied today ✓","Estudiado hoy ✓"):L("Mark as studied","Marcar como estudiado");
    $("verseStudiedBtn").disabled=studied;
  }

  function dayOfYear(date){const start=new Date(date.getFullYear(),0,0);return Math.floor((date-start)/86400000);}
  function localDateKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;}

  function markVerseStudied(){
    const profile=getProfile(); if(!profile) return;
    const key=localDateKey(); profile.stats.verseDays=[...new Set([...(profile.stats.verseDays||[]),key])].slice(-366);
    if(profile.stats.verseDays.length>=7 && !profile.stats.achievements.includes("reader7")) profile.stats.achievements.push("reader7");
    saveProfile(); window.BQApp.renderHome(); renderDailyVerse();
    window.BQApp.toast(L("Daily focus marked as studied","Enfoque diario marcado como estudiado"));
    if(profile.stats.achievements.includes("reader7")) showAchievementCeremony(["reader7"]);
  }

  async function startVerseQuiz(){
    const ref=$("dailyVerseReference")?.textContent||"";
    const bookName=ref.replace(/^([1-3]\s)?([A-Za-z]+).*/,m=>m).split(/\s(?=\d)/)[0];
    const all=await bank();
    let pool=all.filter(q=>q.book===bookName || q.ref.includes(bookName));
    if(pool.length<10) pool=all;
    const selected=window.BQApp.shuffle(pool).slice(0,10);
    $("dailyVerseSection")?.scrollIntoView({block:"start"});
    window.BQApp.startCustomQuiz("daily-theme",selected,ref);
  }

  function renderInsights(){
    const target=$("learningInsightGrid"); const stats=getProfile()?.stats; if(!target||!stats) return;
    const response=stats.responseTimes||[]; const avg=response.length?response.reduce((a,b)=>a+b,0)/response.length:0;
    const weak=rankStats(stats.byBook,"weak")[0]; const strong=rankStats(stats.byCategory,"strong")[0];
    const level=learnerLevel(stats.totalAnswered,stats.totalCorrect);
    target.innerHTML=`
      <article class="insight-card"><span>Adaptive level</span><strong>${escapeHtml(level.name)}</strong><small>${escapeHtml(level.detail)}</small><div class="mini-track"><i style="width:${level.progress}%"></i></div></article>
      <article class="insight-card"><span>Average response</span><strong>${avg?avg.toFixed(1)+"s":"—"}</strong><small>${response.length?L("Across recent answers","En respuestas recientes"):L("Complete a quiz to begin","Completa un quiz para comenzar")}</small></article>
      <article class="insight-card"><span>Focus next</span><strong>${escapeHtml(weak?.name||L("Build your baseline","Crea tu punto de partida"))}</strong><small>${weak?`${weak.accuracy}% · ${weak.a} ${L("answers","respuestas")}`:L("Your weakest books will appear here","Tus libros más débiles aparecerán aquí")}</small></article>
      <article class="insight-card"><span>Current strength</span><strong>${escapeHtml(strong?.name||L("Not enough data yet","Aún no hay datos suficientes"))}</strong><small>${strong?`${strong.accuracy}% · ${strong.a} ${L("answers","respuestas")}`:L("Accuracy by category will appear here","La precisión por categoría aparecerá aquí")}</small></article>`;
  }

  function learnerLevel(answered,correct){
    const accuracy=answered?Math.round(correct/answered*100):0;
    if(answered>=2000)return{name:L("Master Scholar","Maestro bíblico"),detail:`${accuracy}% ${L("lifetime accuracy","precisión acumulada")}`,progress:100};
    if(answered>=1000)return{name:L("Advanced Scholar","Estudiante avanzado"),detail:`${2000-answered} ${L("answers to Master Scholar","respuestas para Maestro bíblico")}`,progress:Math.round((answered-1000)/10)};
    if(answered>=500)return{name:L("Deepening Scholar","Estudiante en profundización"),detail:`${1000-answered} ${L("answers to Advanced","respuestas para Avanzado")}`,progress:Math.round((answered-500)/5)};
    if(answered>=100)return{name:L("Growing Scholar","Estudiante en crecimiento"),detail:`${500-answered} ${L("answers to Deepening","respuestas para Profundización")}`,progress:Math.round((answered-100)/4)};
    return{name:L("Foundation Builder","Constructor de fundamentos"),detail:`${100-answered} ${L("answers to Growing Scholar","respuestas para Estudiante en crecimiento")}`,progress:Math.min(100,answered)};
  }

  function rankStats(source,mode){
    return Object.entries(source||{}).filter(([,v])=>Number(v.a)>=3).map(([name,v])=>({name,a:v.a,c:v.c,accuracy:Math.round(v.c/v.a*100),seconds:v.seconds||0})).sort((a,b)=>mode==="strong"?b.accuracy-a.accuracy:a.accuracy-b.accuracy);
  }

  function renderCollections(){
    const target=$("collectionGrid"); if(!target) return;
    const progress=getProfile()?.stats?.collectionProgress||{};
    target.innerHTML=COLLECTIONS.map(c=>{
      const p=progress[c.id];
      return `<button type="button" class="collection-card" data-collection="${c.id}"><span class="collection-icon">${c.icon}</span><span><strong>${escapeHtml(isEs()?c.titleEs:c.title)}</strong><small>${escapeHtml(isEs()?c.descEs:c.desc)}</small>${p?`<em>${L("Best","Mejor")}: ${p.best}% · ${p.plays} ${L("plays","intentos")}</em>`:""}</span><i aria-hidden="true">→</i></button>`;
    }).join("");
    $("collectionCount").textContent=`${Object.keys(progress).length}/${COLLECTIONS.length} ${L("explored","exploradas")}`;
  }

  async function openCollection(id){
    const c=COLLECTIONS.find(x=>x.id===id); if(!c)return;
    const all=await bank(); const matches=all.filter(c.match);
    $("collectionDialogTitle").textContent=isEs()?c.titleEs:c.title;
    $("collectionDialogContent").innerHTML=`<div class="collection-dialog-hero"><span>${c.icon}</span><p>${escapeHtml(isEs()?c.descEs:c.desc)}</p></div><div class="collection-dialog-stats"><strong>${matches.length}</strong><span>${L("matching verified questions","preguntas verificadas relacionadas")}</span></div><label>${L("Challenge length","Duración del desafío")}<select id="collectionLength"><option value="10">10</option><option value="20">20</option><option value="30">30</option></select></label><button class="primary-btn full-btn" data-start-collection="${c.id}">${L("Start collection quiz","Comenzar quiz de la colección")}</button>`;
    $("collectionDialog").showModal();
  }

  async function startCollection(id){
    const c=COLLECTIONS.find(x=>x.id===id); if(!c)return;
    const all=await bank(); const matches=all.filter(c.match); const length=Number($("collectionLength")?.value||10);
    const rng=window.BQApp.seededRandom(`${id}-${localDateKey()}`); const selected=shuffleWith(matches,rng).slice(0,Math.min(length,matches.length));
    if(selected.length<5){window.BQApp.toast(L("Not enough questions are available for this collection","No hay suficientes preguntas para esta colección"));return;}
    $("collectionDialog").close(); window.BQApp.startCustomQuiz(`collection:${id}`,selected,id);
  }

  function shuffleWith(values,rng){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

  async function openExperience(type){
    if(type==="explorer"){renderExplorer("");$("explorerDialog").showModal();$("explorerSearch")?.focus();}
    if(type==="timeline"){renderTimeline("all");$("timelineDialog").showModal();}
    if(type==="maps"){renderMap();$("mapsDialog").showModal();}
    if(type==="learning"){renderLessons();$("learningDialog").showModal();}
    if(type==="weekly"){renderWeekly();$("weeklyDialog").showModal();}
  }

  async function renderExplorer(query){
    const target=$("explorerResults"); if(!target)return;
    const all=await bank(); const q=normalise(query.trim());
    const books=Object.keys(BOOK_META).filter(name=>!q||normalise(name).includes(q)||normalise(isEs()?translateBook(name):name).includes(q)).slice(0,12);
    const people=PEOPLE.filter(p=>!q||normalise(`${p.name} ${p.nameEs} ${p.role} ${p.roleEs} ${p.summary} ${p.summaryEs}`).includes(q)).slice(0,8);
    const places=LOCATIONS.filter(p=>!q||normalise(`${p.name} ${p.nameEs} ${p.desc} ${p.descEs}`).includes(q)).slice(0,8);
    const questions=q?all.filter(item=>normalise(`${item.q} ${item.e} ${item.ref} ${item.book} ${item.a.join(" ")}`).includes(q)).slice(0,12):[];
    $("explorerQuickLinks").innerHTML=["Moses","Jerusalem","Paul","Psalms","Prayer","Parables"].map(x=>`<button type="button" data-explorer-term="${x}">${isEs()?({Moses:"Moisés",Jerusalem:"Jerusalén",Paul:"Pablo",Psalms:"Salmos",Prayer:"Oración",Parables:"Parábolas"}[x]):x}</button>`).join("");
    $("explorerQuickLinks").querySelectorAll("[data-explorer-term]").forEach(button=>button.addEventListener("click",()=>{$("explorerSearch").value=button.textContent;renderExplorer(button.textContent);}));
    target.innerHTML=`
      ${books.length?`<section><h3>${L("Books","Libros")}</h3><div class="explorer-card-grid">${books.map(name=>explorerBookCard(name,all)).join("")}</div></section>`:""}
      ${people.length?`<section><h3>${L("People","Personas")}</h3><div class="explorer-card-grid">${people.map(p=>`<article class="explorer-card"><span>👤</span><strong>${escapeHtml(isEs()?p.nameEs:p.name)}</strong><small>${escapeHtml(isEs()?p.roleEs:p.role)}</small><p>${escapeHtml(isEs()?p.summaryEs:p.summary)}</p></article>`).join("")}</div></section>`:""}
      ${places.length?`<section><h3>${L("Places","Lugares")}</h3><div class="explorer-card-grid">${places.map(p=>`<button class="explorer-card" data-explorer-place="${p.id}"><span>⌖</span><strong>${escapeHtml(isEs()?p.nameEs:p.name)}</strong><small>${escapeHtml(p.refs)}</small><p>${escapeHtml(isEs()?p.descEs:p.desc)}</p></button>`).join("")}</div></section>`:""}
      ${questions.length?`<section><h3>${L("Related quiz questions","Preguntas relacionadas")}</h3><div class="explorer-question-list">${questions.map(item=>`<article><span>${escapeHtml(item.book)}</span><strong>${escapeHtml(item.q)}</strong><small>${escapeHtml(item.ref)}</small></article>`).join("")}</div></section>`:""}
      ${!books.length&&!people.length&&!places.length&&!questions.length?`<div class="empty-state"><strong>${L("No results yet","Aún no hay resultados")}</strong><p>${L("Try a book, person, place, reference or theme.","Prueba con un libro, persona, lugar, referencia o tema.")}</p></div>`:""}`;
    target.querySelectorAll("[data-explorer-place]").forEach(button=>button.addEventListener("click",()=>{ $("explorerDialog").close(); renderMap(button.dataset.explorerPlace); $("mapsDialog").showModal(); }));
  }

  function explorerBookCard(name,all){
    const meta=BOOK_META[name]; const count=all.filter(q=>q.book===name).length;
    return `<article class="explorer-card"><span>${symbolEmoji(meta.symbol)}</span><strong>${escapeHtml(isEs()?translateBook(name):name)}</strong><small>${count} ${L("quiz questions","preguntas")}</small><p>${escapeHtml(isEs()?meta.contextEs:meta.context)}</p></article>`;
  }

  function normalise(value){return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}

  function renderTimeline(filter="all"){
    const target=$("timelineTrack"); if(!target)return;
    const items=TIMELINE.filter(x=>filter==="all"||x.type===filter);
    target.innerHTML=items.map((x,i)=>`<article class="timeline-item"><span class="timeline-index">${i+1}</span><span class="timeline-icon">${x.icon}</span><div><small>${escapeHtml(x.range)}</small><h3>${escapeHtml(isEs()?x.titleEs:x.title)}</h3><p>${escapeHtml(isEs()?x.bodyEs:x.body)}</p></div></article>`).join("");
  }

  function renderMap(selectedId="jerusalem"){
    const target=$("bibleMap"); if(!target)return;
    target.innerHTML=`<svg viewBox="0 0 100 90" role="img" aria-label="Schematic Bible lands map"><defs><linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#223b67"/><stop offset="1" stop-color="#0d1c36"/></linearGradient><linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8d7545"/><stop offset="1" stop-color="#3f4a35"/></linearGradient></defs><rect width="100" height="90" rx="5" fill="url(#sea)"/><path d="M5 0h95v90H93C86 72 90 59 80 52c-10-7-14-4-19-12-7-11-2-18-13-25C39 9 29 17 19 10 13 6 10 3 5 0Z" fill="url(#land)" opacity=".95"/><path d="M42 0c-1 13 2 21 9 29 7 7 4 15 0 23-5 11-3 22 2 38" fill="none" stroke="#6fa9d8" stroke-width="1" opacity=".65"/><path d="M52 28c5 1 8 5 7 9-1 3-5 5-8 4-4-1-6-5-5-8 1-3 3-5 6-5Z" fill="#6fa9d8" opacity=".75"/><g class="map-routes" opacity=".48"><path d="M48 52 54 31 65 26"/><path d="M48 52 35 20 26 29 7 15"/><path d="M34 78 48 52 79 30 86 52"/></g>${LOCATIONS.map(p=>`<g class="map-pin ${p.id===selectedId?"selected":""}" data-map-location="${p.id}" tabindex="0" role="button" aria-label="${escapeHtml(isEs()?p.nameEs:p.name)}"><circle cx="${p.x}" cy="${p.y}" r="2.3"/><circle cx="${p.x}" cy="${p.y}" r="4.7" class="pulse"/><text x="${p.x+2.8}" y="${p.y-2.2}">${escapeHtml(isEs()?p.nameEs:p.name)}</text></g>`).join("")}</svg>`;
    target.querySelectorAll("[data-map-location]").forEach(pin=>{
      const activate=()=>{target.querySelectorAll(".map-pin").forEach(x=>x.classList.remove("selected"));pin.classList.add("selected");renderMapDetail(pin.dataset.mapLocation);};
      pin.addEventListener("click",activate); pin.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();activate();}});
    });
    renderMapDetail(selectedId);
  }

  function renderMapDetail(id){
    const p=LOCATIONS.find(x=>x.id===id)||LOCATIONS[0];
    $("mapDetail").innerHTML=`<span class="map-detail-icon">⌖</span><h3>${escapeHtml(isEs()?p.nameEs:p.name)}</h3><p>${escapeHtml(isEs()?p.descEs:p.desc)}</p><strong>${L("Key references","Referencias clave")}</strong><small>${escapeHtml(p.refs)}</small><button class="primary-btn" data-map-quiz="${p.id}">${L("Practise questions about this place","Practicar preguntas sobre este lugar")}</button>`;
  }

  async function startLocationQuiz(id){
    const place=LOCATIONS.find(x=>x.id===id); if(!place)return;
    const terms=[place.name,place.nameEs].map(normalise); const all=await bank(); const pool=all.filter(q=>terms.some(t=>normalise(`${q.q} ${q.e} ${q.ref} ${q.a.join(" ")}`).includes(t)));
    const fallback=all.filter(q=>q.category==="Places & Geography"); const selected=window.BQApp.shuffle(pool.length>=10?pool:fallback).slice(0,10);
    $("mapsDialog").close(); window.BQApp.startCustomQuiz("map",selected,id);
  }

  function renderLessons(){
    $("lessonGrid").hidden=false;$("lessonDetail").hidden=true;
    $("lessonGrid").innerHTML=LESSONS.map(l=>`<button type="button" class="lesson-card" data-lesson="${l.id}"><span>${l.icon}</span><strong>${escapeHtml(isEs()?l.titleEs:l.title)}</strong><p>${escapeHtml(isEs()?l.summaryEs:l.summary)}</p><i>→</i></button>`).join("");
  }

  function showLesson(id){
    const lesson=LESSONS.find(x=>x.id===id); if(!lesson)return; currentLesson=lesson;
    const facts=isEs()?lesson.factsEs:lesson.facts;
    $("lessonGrid").hidden=true;$("lessonDetail").hidden=false;
    $("lessonDetail").innerHTML=`<button class="text-btn" data-back-lessons>← ${L("All lessons","Todas las lecciones")}</button><span class="lesson-hero-icon">${lesson.icon}</span><h3>${escapeHtml(isEs()?lesson.titleEs:lesson.title)}</h3><p class="lesson-summary">${escapeHtml(isEs()?lesson.summaryEs:lesson.summary)}</p><ol class="lesson-facts">${facts.map(f=>`<li>${escapeHtml(f)}</li>`).join("")}</ol><div class="lesson-check"><strong>${L("Ready to practise?","¿Listo para practicar?")}</strong><p>${L("A ten-question quiz will reinforce this lesson.","Un quiz de diez preguntas reforzará esta lección.")}</p></div><button class="primary-btn full-btn" data-start-lesson-quiz>${L("Start lesson quiz","Comenzar quiz de la lección")}</button>`;
  }

  async function startLessonQuiz(lesson){
    if(!lesson)return; const all=await bank(); let pool=all.filter(lesson.filter); if(pool.length<10)pool=all;
    const profile=getProfile(); profile.stats.lessonsCompleted=[...new Set([...(profile.stats.lessonsCompleted||[]),lesson.id])];
    if(profile.stats.lessonsCompleted.length>=3&&!profile.stats.achievements.includes("journey"))profile.stats.achievements.push("journey");
    saveProfile(); $("learningDialog").close(); window.BQApp.startCustomQuiz(`lesson:${lesson.id}`,window.BQApp.shuffle(pool).slice(0,10),lesson.id);
  }

  function getWeekInfo(date=new Date()){
    const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())); const day=d.getUTCDay()||7; d.setUTCDate(d.getUTCDate()+4-day); const yearStart=new Date(Date.UTC(d.getUTCFullYear(),0,1)); const week=Math.ceil((((d-yearStart)/86400000)+1)/7); return{year:d.getUTCFullYear(),week,key:`${d.getUTCFullYear()}-W${String(week).padStart(2,"0")}`};
  }

  function weeklyLink(){
    const info=getWeekInfo(); try{const url=new URL(location.href);url.search="";url.hash="";url.searchParams.set("challenge","weekly");url.searchParams.set("week",info.key);return url.href;}catch(_){return location.href;}
  }

  function renderWeekly(){
    const info=getWeekInfo(); const score=getProfile()?.stats?.weeklyScores?.[info.key];
    $("weeklyChallengeContent").innerHTML=`<div class="weekly-emblem"><span>◎</span><strong>${L("Week","Semana")} ${info.week}</strong><small>${info.year}</small></div><p>${L("Every player receives the same 15 questions for this calendar week. Your best score is saved locally.","Cada jugador recibe las mismas 15 preguntas durante esta semana. Tu mejor puntuación se guarda localmente.")}</p>${score!==undefined?`<div class="weekly-best"><span>${L("Your best","Tu mejor")}</span><strong>${score}%</strong></div>`:""}<code id="weeklyCode">${escapeHtml(info.key)}</code><p class="form-note">${L("Copy the challenge link or code to invite a friend to the same weekly quiz.","Copia el enlace o el código del desafío para invitar a un amigo al mismo quiz semanal.")}</p><div class="dialog-actions"><button class="primary-btn" data-start-weekly>${L("Start weekly challenge","Comenzar desafío semanal")}</button><button class="secondary-btn" data-share-weekly>${L("Copy challenge link","Copiar enlace del desafío")}</button><button class="secondary-btn" data-copy-code>${L("Copy code","Copiar código")}</button></div>`;
  }

  async function startWeeklyChallenge(){
    const info=getWeekInfo(); const all=await bank(); const selected=window.BQApp.selectQuestions(all,{focus:"all",difficulty:"balanced",adaptiveDifficulty:false,length:15,book:"all",category:"all"},[],window.BQApp.seededRandom(`weekly-${info.key}`));
    $("weeklyDialog")?.close(); window.BQApp.startCustomQuiz("weekly",selected,info.key);
  }

  async function shareWeeklyChallenge(){
    const info=getWeekInfo(); const text=L(`Join my Bible Quiz weekly challenge ${info.key}.`,`Únete a mi desafío semanal de Quiz Bíblico ${info.key}.`); const url=weeklyLink();
    try{await navigator.clipboard.writeText(`${text} ${url}`);window.BQApp.toast(L("Challenge link copied","Enlace del desafío copiado"));}catch(_){window.BQApp.toast(L("Unable to copy challenge link","No se pudo copiar el enlace del desafío"));}
  }
  async function copyWeeklyCode(){try{await navigator.clipboard.writeText($("weeklyCode").textContent);window.BQApp.toast(L("Challenge code copied","Código del desafío copiado"));}catch(_){}}

  function renderQuestionVisual(question){
    const target=$("questionVisual"); if(!target||!question)return;
    const theme=visualTheme(question); target.dataset.theme=theme; target.innerHTML=visualSvg(theme,question);
  }

  function visualTheme(q){
    const text=normalise(`${q.q} ${q.e} ${q.ref} ${q.book} ${q.category}`);
    if(/ark|arca|flood|diluvio/.test(text))return"ark";
    if(/lion|leon|daniel/.test(text))return"lion";
    if(/sea|water|river|mar|agua|rio|boat|ship|barco|nave/.test(text))return"sea";
    if(/king|queen|crown|rey|reina|corona|david|solomon|salomon|esther|ester/.test(text))return"crown";
    if(/temple|tabernacle|priest|templo|tabernaculo|sacerdote/.test(text))return"temple";
    if(/prophet|prophecy|letter|wrote|profeta|profecia|carta|escribio/.test(text))return"scroll";
    if(/birth|bethlehem|star|nacimiento|belen|estrella/.test(text))return"star";
    if(/mount|sinai|mountain|monte|sinaí|sinai/.test(text))return"mountain";
    if(q.category==="Places & Geography")return"map";
    if(q.category==="Wisdom & Poetry")return"lamp";
    if(q.t==="NT")return"light";
    return"book";
  }

  function visualSvg(theme,q){
    const label=escapeHtml(isEs()?translateBook(q.book):q.book);
    const paths={
      ark:'<path d="M34 56h52l-7 13H43z"/><path d="M45 52V36h29v16M55 36V27h12v9"/><path class="wave" d="M25 74c8-7 16 7 24 0s16 7 24 0 16 7 24 0"/>',
      lion:'<circle cx="60" cy="48" r="22"/><circle class="soft" cx="60" cy="48" r="30"/><path d="M50 48h2m16 0h2M53 59c5 4 9 4 14 0M45 37l-9-9m39 9 9-9"/>',
      sea:'<path class="wave" d="M18 65c12-10 20 10 32 0s20 10 32 0 20 10 32 0"/><path d="M42 55h39l-7 11H49zM61 55V30l18 15H61"/><circle class="soft" cx="30" cy="27" r="7"/>',
      crown:'<path d="M36 64h49l5-30-15 12-14-20-14 20-16-12z"/><path class="soft" d="M38 72h45"/><circle cx="31" cy="32" r="3"/><circle cx="61" cy="23" r="3"/><circle cx="91" cy="32" r="3"/>',
      temple:'<path d="M31 68h59M38 60h45M42 38h37v22H42zM36 38l25-16 24 16z"/><path class="soft" d="M49 42v17m12-17v17m12-17v17"/>',
      scroll:'<path d="M40 29h43v42H40c-8 0-8-11 0-11h39M40 29c-8 0-8 11 0 11h35"/><path class="soft" d="M49 47h23M49 55h18"/>',
      star:'<path d="m60 20 6 17 18 1-14 11 5 18-15-10-15 10 5-18-14-11 18-1z"/><path class="soft" d="M60 8v8M30 24l8 5m52-5-8 5"/>',
      mountain:'<path d="M20 72 48 31l13 19 12-17 28 39z"/><path class="soft" d="m43 39 6 8 5-6m14 0 5 7 5-6"/>',
      map:'<path d="m27 31 22-8 23 8 22-8v48l-22 8-23-8-22 8zM49 23v48m23-40v48"/><circle cx="71" cy="47" r="5"/><path class="soft" d="M71 52v10"/>',
      lamp:'<path d="M39 67h44M45 59h32l-5-22H50zM57 37c-7-9 2-15 4-22 9 10 8 17 1 22"/><path class="soft" d="M53 48h17"/>',
      light:'<circle cx="60" cy="47" r="18"/><path class="soft" d="M60 14v11M60 69v12M27 47h12M81 47h12M37 24l8 8m30 30 8 8M83 24l-8 8M45 62l-8 8"/>',
      book:'<path d="M25 34c15-7 25-5 35 3v37c-10-8-20-10-35-3zM95 34c-15-7-25-5-35 3v37c10-8 20-10 35-3z"/><path class="soft" d="M60 37v37M34 45c8-3 14-2 19 1m-19 9c8-3 14-2 19 1m33-11c-8-3-14-2-19 1m19 9c-8-3-14-2-19 1"/>'
    };
    return `<svg viewBox="0 0 120 92" role="img" aria-label="${label} thematic illustration"><g>${paths[theme]||paths.book}</g></svg><span>${label}</span>`;
  }

  function symbolEmoji(symbol){return{stars:"✦",mountain:"⛰",temple:"🏛",desert:"◌",scroll:"📜",map:"🗺",shield:"🛡",wheat:"🌾",crown:"♛",city:"🏙",harp:"♫",wall:"▦",storm:"☁",lamp:"🪔",sun:"☀",flower:"❀",wheel:"◎",lion:"🦁",heart:"♡",locust:"⌁",scales:"⚖",fish:"🐟",watchtower:"♜",trumpet:"♬",star:"★",road:"↝",light:"☀",ship:"⛵",letter:"✉"}[symbol]||"📖";}

  async function openCurrentContext(){
    if(!currentQuestion)return; const all=await bank(); const q=currentQuestion; const meta=BOOK_META[q.book]||{era:q.t==="OT"?"Old Testament context":"New Testament context",eraEs:q.t==="OT"?"Contexto del Antiguo Testamento":"Contexto del Nuevo Testamento",context:"This question is anchored in its immediate biblical reference.",contextEs:"Esta pregunta se fundamenta en su referencia bíblica inmediata.",place:"Biblical world",placeEs:"Mundo bíblico",symbol:"book"};
    const text=normalise(`${q.q} ${q.e} ${q.ref} ${q.a.join(" ")}`); const places=LOCATIONS.filter(p=>text.includes(normalise(p.name))||text.includes(normalise(p.nameEs))).slice(0,3);
    currentContextQuestions=all.filter(item=>item.id!==q.id&&(item.book===q.book||item.category===q.category)).slice(0,30);
    const refs=currentContextQuestions.slice(0,4).map(item=>item.ref);
    $("contextContent").innerHTML=`
      <div class="context-hero"><span>${symbolEmoji(meta.symbol)}</span><div><small>${escapeHtml(q.book)} · ${escapeHtml(q.category||"")}</small><h3>${escapeHtml(q.q)}</h3><strong>${escapeHtml(q.ref)}</strong></div></div>
      <div class="context-grid">
        <article><span>⌛</span><h4>${L("Timeline setting","Marco cronológico")}</h4><p>${escapeHtml(isEs()?meta.eraEs:meta.era)}</p></article>
        <article><span>⌖</span><h4>${L("Geographic setting","Marco geográfico")}</h4><p>${escapeHtml(places.length?places.map(p=>isEs()?p.nameEs:p.name).join(", "):(isEs()?meta.placeEs:meta.place))}</p></article>
        <article><span>◫</span><h4>${L("Literary context","Contexto literario")}</h4><p>${escapeHtml(isEs()?meta.contextEs:meta.context)}</p></article>
        <article><span>✓</span><h4>${L("Textual evidence","Evidencia textual")}</h4><p>${L("The answer is supported by the cited biblical reference and does not require a denominational doctrine.","La respuesta está respaldada por la referencia bíblica citada y no requiere una doctrina denominacional.")}</p></article>
      </div>
      <section class="deep-explanation"><h3>${L("Explain this answer","Explicar esta respuesta")}</h3><p>${escapeHtml(q.e)}</p><p>${L("Read the verses immediately before and after the reference to see the question within its narrative or argument.","Lee los versículos inmediatamente anteriores y posteriores a la referencia para ver la pregunta dentro de su relato o argumento.")}</p></section>
      <section class="cross-reference-box"><h3>${L("Related references in the quiz library","Referencias relacionadas en la biblioteca")}</h3><div>${refs.length?refs.map(r=>`<span>${escapeHtml(r)}</span>`).join(""):`<span>${escapeHtml(q.ref)}</span>`}</div></section>
      <div class="context-actions"><button class="primary-btn" data-related-practice>${L("Practise related questions","Practicar preguntas relacionadas")}</button></div>`;
    $("contextDialog").showModal(); $("contextBtn")?.classList.remove("attention");
  }

  function startRelatedPractice(){
    if(!currentContextQuestions.length)return; $("contextDialog").close(); window.BQApp.startCustomQuiz("context",window.BQApp.shuffle(currentContextQuestions).slice(0,10),currentQuestion?.book||"");
  }

  function renderAnalytics(){
    const target=$("analyticsContent"); const stats=getProfile()?.stats; if(!target||!stats)return;
    const response=stats.responseTimes||[]; const avg=response.length?response.reduce((a,b)=>a+b,0)/response.length:0;
    const weakBooks=rankStats(stats.byBook,"weak").slice(0,5); const strongCats=rankStats(stats.byCategory,"strong").slice(0,5);
    const difficulty=["Easy","Medium","Hard"].map(k=>({name:L(k,k==="Easy"?"Fácil":k==="Medium"?"Intermedio":"Difícil"),...(stats.byDifficulty[k]||{a:0,c:0})}));
    const history=(stats.history||[]).slice(0,10).reverse();
    target.innerHTML=`
      <div class="analytics-kpis"><article><span>${L("Average response","Respuesta media")}</span><strong>${avg?avg.toFixed(1)+"s":"—"}</strong></article><article><span>${L("Longest study streak","Mayor racha de estudio")}</span><strong>${stats.longestStudyStreak||0}</strong></article><article><span>${L("Questions bookmarked","Preguntas guardadas")}</span><strong>${stats.bookmarks?.length||0}</strong></article><article><span>${L("Lessons completed","Lecciones completadas")}</span><strong>${stats.lessonsCompleted?.length||0}</strong></article></div>
      <div class="analytics-columns">
        <section><h4>${L("Accuracy by difficulty","Precisión por dificultad")}</h4>${difficulty.map(x=>barRow(x.name,x.a?Math.round(x.c/x.a*100):0,x.a)).join("")}</section>
        <section><h4>${L("Accuracy by testament","Precisión por testamento")}</h4>${barRow(L("Old Testament","Antiguo Testamento"),stats.byTestament.OT.a?Math.round(stats.byTestament.OT.c/stats.byTestament.OT.a*100):0,stats.byTestament.OT.a)}${barRow(L("New Testament","Nuevo Testamento"),stats.byTestament.NT.a?Math.round(stats.byTestament.NT.c/stats.byTestament.NT.a*100):0,stats.byTestament.NT.a)}</section>
      </div>
      <section class="score-trend"><h4>${L("Recent score trend","Tendencia de puntuaciones recientes")}</h4>${sparkline(history.map(x=>x.score))}</section>
      <div class="analytics-columns"><section><h4>${L("Books to revisit","Libros para repasar")}</h4>${weakBooks.length?weakBooks.map(x=>barRow(x.name,x.accuracy,x.a)).join(""):`<p>${L("Complete more quizzes to identify patterns.","Completa más cuestionarios para identificar patrones.")}</p>`}</section><section><h4>${L("Strongest categories","Categorías más fuertes")}</h4>${strongCats.length?strongCats.map(x=>barRow(x.name,x.accuracy,x.a)).join(""):`<p>${L("Complete more quizzes to identify strengths.","Completa más cuestionarios para identificar fortalezas.")}</p>`}</section></div>`;
  }

  function barRow(name,percent,count){return`<div class="analytics-bar-row"><div><span>${escapeHtml(name)}</span><small>${count} ${L("answers","respuestas")}</small></div><strong>${percent}%</strong><div class="analytics-bar"><i style="width:${percent}%"></i></div></div>`;}
  function sparkline(values){if(!values.length)return`<p>${L("No completed quizzes yet.","Aún no hay cuestionarios completados.")}</p>`;const w=600,h=150,pad=12;const pts=values.map((v,i)=>`${pad+(i*(w-pad*2)/Math.max(1,values.length-1))},${h-pad-(v/100*(h-pad*2))}`).join(" ");return`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Recent quiz score chart"><path d="M${pad} ${h-pad}H${w-pad}"/><polyline points="${pts}"/><g>${values.map((v,i)=>{const x=pad+(i*(w-pad*2)/Math.max(1,values.length-1)),y=h-pad-(v/100*(h-pad*2));return`<circle cx="${x}" cy="${y}" r="5"><title>${v}%</title></circle>`}).join("")}</g></svg>`;}

  function renderFamilyLeaderboard(){
    const target=$("familyLeaderboard"); const profiles=window.BQApp?.getProfiles?.()?.items; if(!target||!profiles)return;
    const rows=Object.values(profiles).map((p,i)=>{const s=p.stats||{};const acc=s.totalAnswered?Math.round(s.totalCorrect/s.totalAnswered*100):0;return{...p,acc,quizzes:s.totalQuizzes||0,best:s.bestScore||0,avatar:["👤","🧭","📖","✦","🌿","🕊"][i%6]};}).sort((a,b)=>b.best-a.best||b.acc-a.acc||b.quizzes-a.quizzes);
    target.innerHTML=rows.map((p,i)=>`<article class="leaderboard-row ${p.id===getProfile()?.id?"current":""}"><span class="rank">${i+1}</span><span class="avatar">${p.avatar}</span><div><strong>${escapeHtml(p.name)}</strong><small>${p.quizzes} ${L("quizzes","cuestionarios")} · ${p.acc}% ${L("accuracy","precisión")}</small></div><strong>${p.best}%</strong></article>`).join("");
  }

  function enrichAchievements(){
    const cards=[...document.querySelectorAll(".achievement-card")]; const stats=getProfile()?.stats; if(!stats)return;
    cards.forEach(card=>{if(card.querySelector(".achievement-state"))return;const unlocked=card.classList.contains("unlocked");card.insertAdjacentHTML("beforeend",`<span class="achievement-state">${unlocked?L("Unlocked","Desbloqueado"):L("In progress","En progreso")}</span>`);});
  }

  function showAchievementCeremony(ids){
    const names={reader7:["Daily Reader","Lector diario"],weekly:["Weekly Challenger","Desafiante semanal"],journey:["Bible Journey","Viaje bíblico"],collector:["Collection Scholar","Estudiante de colecciones"],speed:["Quick Thinker","Pensador rápido"],first:["First Steps","Primeros pasos"],perfect:["Perfect Score","Puntuación perfecta"],streak3:["Three-Day Streak","Racha de tres días"],streak7:["Seven-Day Streak","Racha de siete días"],hundred:["Century Scholar","Estudiante centenario"],thousand:["Thousand Answers","Mil respuestas"],ot:["Old Testament Scholar","Especialista del Antiguo Testamento"],nt:["New Testament Scholar","Especialista del Nuevo Testamento"]};
    const list=ids.map(id=>names[id]?.[isEs()?1:0]||id); $("achievementCeremonyTitle").textContent=list.join(" · "); $("achievementCeremonyText").textContent=L("Your learning journey has reached a new milestone.","Tu recorrido de aprendizaje ha alcanzado un nuevo hito."); $("achievementCeremony").hidden=false;
  }

  function translateBook(name){return({Genesis:"Génesis",Exodus:"Éxodo",Leviticus:"Levítico",Numbers:"Números",Deuteronomy:"Deuteronomio",Joshua:"Josué",Judges:"Jueces",Ruth:"Rut","1 Samuel":"1 Samuel","2 Samuel":"2 Samuel","1 Kings":"1 Reyes","2 Kings":"2 Reyes","1 Chronicles":"1 Crónicas","2 Chronicles":"2 Crónicas",Ezra:"Esdras",Nehemiah:"Nehemías",Esther:"Ester",Job:"Job",Psalms:"Salmos",Proverbs:"Proverbios",Ecclesiastes:"Eclesiastés","Song of Solomon":"Cantar de los Cantares",Isaiah:"Isaías",Jeremiah:"Jeremías",Lamentations:"Lamentaciones",Ezekiel:"Ezequiel",Daniel:"Daniel",Hosea:"Oseas",Joel:"Joel",Amos:"Amós",Obadiah:"Abdías",Jonah:"Jonás",Micah:"Miqueas",Nahum:"Nahúm",Habakkuk:"Habacuc",Zephaniah:"Sofonías",Haggai:"Hageo",Zechariah:"Zacarías",Malachi:"Malaquías",Matthew:"Mateo",Mark:"Marcos",Luke:"Lucas",John:"Juan",Acts:"Hechos",Romans:"Romanos","1 Corinthians":"1 Corintios","2 Corinthians":"2 Corintios",Galatians:"Gálatas",Ephesians:"Efesios",Philippians:"Filipenses",Colossians:"Colosenses","1 Thessalonians":"1 Tesalonicenses","2 Thessalonians":"2 Tesalonicenses","1 Timothy":"1 Timoteo","2 Timothy":"2 Timoteo",Titus:"Tito",Philemon:"Filemón",Hebrews:"Hebreos",James:"Santiago","1 Peter":"1 Pedro","2 Peter":"2 Pedro","1 John":"1 Juan","2 John":"2 Juan","3 John":"3 Juan",Jude:"Judas",Revelation:"Apocalipsis"})[name]||name;}

  async function handleChallengeLink(){
    const params=new URLSearchParams(location.search); if(params.get("challenge")!=="weekly")return;
    setTimeout(()=>{renderWeekly();$("weeklyDialog")?.showModal();},750);
  }

  function initialise(){
    insertExperienceShell(); bindExperienceEvents(); applyExperienceSettings(); syncExperienceSettings(); renderDailyVerse(); renderInsights(); renderCollections(); renderLessons(); renderTimeline(); renderMap(); renderFamilyLeaderboard(); renderAnalytics(); enrichAchievements(); handleChallengeLink();
    if(currentQuestion)renderQuestionVisual(currentQuestion);
  }

  document.addEventListener("DOMContentLoaded",()=>setTimeout(initialise,0));
})();
