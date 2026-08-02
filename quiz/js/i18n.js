(() => {
  "use strict";

  const STORAGE_KEY = "bqLanguageV2";
  const supported = ["en", "es"];
  const requestedLanguage = new URLSearchParams(location.search).get("lang");
  if (supported.includes(requestedLanguage)) localStorage.setItem(STORAGE_KEY, requestedLanguage);
  const saved = localStorage.getItem(STORAGE_KEY);
  const language = supported.includes(requestedLanguage) ? requestedLanguage : (supported.includes(saved) ? saved : "en");
  const locale = language === "es" ? "es-ES" : "en-AU";

  const ES = {
    "The Ultimate Bible Challenge": "El Desafío Bíblico Definitivo",
    "Bible Quiz — The Ultimate Bible Challenge": "Quiz Bíblico — El Desafío Bíblico Definitivo",
    "Bible Quiz logo": "Logotipo de Quiz Bíblico",
    "Bible Quiz home": "Inicio de Quiz Bíblico",
    "Website header": "Encabezado del sitio web",
    "Quiz controls": "Controles del quiz",
    "Skip to main content": "Saltar al contenido principal",
    "Loading The Ultimate Bible Challenge": "Cargando El Desafío Bíblico Definitivo",
    "Loading your Bible quiz experience…": "Cargando tu experiencia de quiz bíblico…",
    "✦ 5,000+ verified questions": "✦ Más de 5.000 preguntas verificadas",
    "How well do you know the Bible?": "¿Cuánto conoces la Biblia?",
    "How well do you know the": "¿Cuánto conoces la",
    "Bible?": "Biblia?",
    "Build lasting Bible knowledge with personalised quizzes, a daily challenge, detailed explanations, achievements and progress tracking. Your current quiz remains available until you deliberately create a new one.": "Fortalece tus conocimientos bíblicos con cuestionarios personalizados, un desafío diario, explicaciones detalladas, logros y seguimiento del progreso. Tu cuestionario actual permanecerá disponible hasta que decidas crear uno nuevo.",
    "Play current quiz": "Jugar el cuestionario actual",
    "Create New Quiz": "Crear nuevo cuestionario",
    "Daily Challenge": "Desafío diario",
    "Practise missed questions": "Practicar preguntas falladas",
    "Question library": "Biblioteca de preguntas",
    "Guest": "Invitado",
    "Lamentations": "Lamentaciones",
    "Current quiz": "Cuestionario actual",
    "Best score": "Mejor puntuación",
    "Day streak": "Racha de días",
    "Your progress": "Tu progreso",
    "Knowledge dashboard": "Panel de conocimientos",
    "View quiz history": "Ver historial",
    "Total quizzes": "Cuestionarios totales",
    "Lifetime accuracy": "Precisión acumulada",
    "Old Testament mastery": "Dominio del Antiguo Testamento",
    "New Testament mastery": "Dominio del Nuevo Testamento",
    "Milestones": "Hitos",
    "Achievements": "Logros",
    "Score": "Puntuación",
    "Answer choices": "Opciones de respuesta",
    "Save for study": "Guardar para estudiar",
    "☆ Save for study": "☆ Guardar para estudiar",
    "★ Saved for study": "★ Guardado para estudiar",
    "Current streak:": "Racha actual:",
    "Next question": "Siguiente pregunta",
    "Challenge complete": "Desafío completado",
    "Final score": "Puntuación final",
    "Correct": "Correctas",
    "Incorrect": "Incorrectas",
    "Best streak": "Mejor racha",
    "Total time": "Tiempo total",
    "Retake current quiz": "Repetir el cuestionario actual",
    "Practise these mistakes": "Practicar estos errores",
    "Copy result": "Copiar resultado",
    "Return home": "Volver al inicio",
    "Answer review": "Revisión de respuestas",
    "5,000+ verified questions • Progress is stored privately in this browser.": "Más de 5.000 preguntas verificadas • El progreso se guarda de forma privada en este navegador.",
    "Backup & restore": "Copia de seguridad y restauración",
    "Privacy": "Privacidad",
    "Current attempt": "Intento actual",
    "Leave this quiz?": "¿Salir de este cuestionario?",
    "Your current quiz will remain saved so you can retake the same questions later. Your score and progress in this attempt will be lost.": "Tu cuestionario actual permanecerá guardado para que puedas repetir las mismas preguntas más adelante. La puntuación y el progreso de este intento se perderán.",
    "Continue Quiz": "Continuar cuestionario",
    "Leave and Return Home": "Salir y volver al inicio",
    "Continue quiz and close this dialog": "Continuar el cuestionario y cerrar este cuadro",
    "Exit quiz": "Salir del cuestionario",
    "Exit": "Salir",
    "Toggle sound": "Activar o desactivar sonido",
    "Turn sound off": "Desactivar sonido",
    "Turn sound on": "Activar sonido",
    "Quiz settings": "Configuración del cuestionario",
    "Open quiz settings": "Abrir configuración del cuestionario",
    "Personalise": "Personalizar",
    "Close settings": "Cerrar configuración",
    "Quiz focus": "Contenido del cuestionario",
    "Whole Bible — balanced": "Toda la Biblia — equilibrado",
    "Old Testament": "Antiguo Testamento",
    "New Testament": "Nuevo Testamento",
    "5,000+": "5.000+",
    "Old Testament only": "Solo Antiguo Testamento",
    "New Testament only": "Solo Nuevo Testamento",
    "Difficulty": "Dificultad",
    "Balanced — easy to hard": "Equilibrada — de fácil a difícil",
    "Easy only": "Solo fácil",
    "Medium only": "Solo intermedia",
    "Hard only": "Solo difícil",
    "Quiz length": "Duración del cuestionario",
    "10 questions": "10 preguntas",
    "20 questions": "20 preguntas",
    "30 questions": "30 preguntas",
    "50 questions": "50 preguntas",
    "Time per question": "Tiempo por pregunta",
    "No timer": "Sin temporizador",
    "10 seconds": "10 segundos",
    "15 seconds": "15 segundos",
    "20 seconds": "20 segundos",
    "30 seconds": "30 segundos",
    "Book": "Libro",
    "All books": "Todos los libros",
    "Category": "Categoría",
    "All categories": "Todas las categorías",
    "Shuffle current quiz": "Mezclar el cuestionario actual",
    "Retakes keep the same questions but can change their order.": "Las repeticiones conservan las mismas preguntas, pero pueden cambiar su orden.",
    "Hybrid cinematic gaming sound effects": "Efectos de sonido híbridos cinematográficos de juego",
    "Mastered impacts, orchestral rises, shimmer and game-style feedback.": "Impactos masterizados, crescendos orquestales, brillo y efectos de respuesta de estilo videojuego.",
    "Audio volume controls": "Controles de volumen",
    "Master volume": "Volumen general",
    "Effects volume": "Volumen de efectos",
    "Final-five countdown tension": "Tensión en los últimos cinco segundos",
    "Increasing ticks and bass pulses during the final five seconds.": "Tics y pulsos graves crecientes durante los últimos cinco segundos.",
    "Reduced interface motion": "Movimiento reducido de la interfaz",
    "Minimises movement beyond your system preference.": "Reduce al mínimo el movimiento, además de respetar la preferencia de tu sistema.",
    "These selections apply when you create a New Quiz. Retake Current Quiz always preserves the saved question set.": "Estas opciones se aplican al crear un nuevo cuestionario. Repetir el cuestionario actual siempre conserva el conjunto de preguntas guardado.",
    "Cancel": "Cancelar",
    "Save settings": "Guardar configuración",
    "Local profiles": "Perfiles locales",
    "Who is playing?": "¿Quién está jugando?",
    "Close profiles": "Cerrar perfiles",
    "Create a profile": "Crear un perfil",
    "Name": "Nombre",
    "Create": "Crear",
    "Profiles and progress are private to this browser. Use Backup & Restore to transfer them to another browser.": "Los perfiles y el progreso son privados de este navegador. Utiliza Copia de seguridad y restauración para trasladarlos a otro navegador.",
    "Learning analytics": "Análisis de aprendizaje",
    "Quiz history": "Historial de cuestionarios",
    "Close history": "Cerrar historial",
    "Progress controls": "Controles de progreso",
    "Close backup and restore": "Cerrar copia de seguridad y restauración",
    "Export profiles, progress, settings and bookmarks as a private JSON backup. Importing replaces matching local data only after validation.": "Exporta perfiles, progreso, configuración y marcadores como una copia privada en formato JSON. La importación sustituye los datos locales coincidentes únicamente después de validarlos.",
    "Export backup": "Exportar copia",
    "Import backup": "Importar copia",
    "Cloud synchronisation is not enabled. This website provides secure, user-controlled backup and restore without automatically transmitting data.": "La sincronización en la nube no está habilitada. Este sitio web ofrece copia de seguridad y restauración controladas por el usuario sin transmitir datos automáticamente.",
    "Close privacy information": "Cerrar información de privacidad",
    "This website stores quiz settings, profiles, history, achievements and bookmarks locally in your browser. It includes no advertising, third-party analytics or remote tracking. Results are copied to your clipboard only when you deliberately use the Copy result function.": "Este sitio web guarda localmente en tu navegador la configuración, los perfiles, el historial, los logros y los marcadores. No incluye publicidad, análisis de terceros ni seguimiento remoto. Los resultados solo se copian al portapapeles cuando utilizas deliberadamente la función Copiar resultado.",
    "JavaScript is required to run the interactive quiz.": "Se necesita JavaScript para ejecutar el cuestionario interactivo.",

    "First Steps": "Primeros pasos",
    "Complete your first quiz": "Completa tu primer cuestionario",
    "Perfect Score": "Puntuación perfecta",
    "Score 100% in a quiz": "Obtén un 100 % en un cuestionario",
    "Three-Day Streak": "Racha de tres días",
    "Study on three consecutive days": "Estudia durante tres días consecutivos",
    "Seven-Day Streak": "Racha de siete días",
    "Study on seven consecutive days": "Estudia durante siete días consecutivos",
    "Century Scholar": "Estudiante centenario",
    "Answer 100 questions correctly": "Responde correctamente 100 preguntas",
    "Thousand Answers": "Mil respuestas",
    "Answer 1,000 questions": "Responde 1.000 preguntas",
    "Old Testament Scholar": "Especialista del Antiguo Testamento",
    "Reach 80% Old Testament mastery": "Alcanza un 80 % de dominio del Antiguo Testamento",
    "New Testament Scholar": "Especialista del Nuevo Testamento",
    "Reach 80% New Testament mastery": "Alcanza un 80 % de dominio del Nuevo Testamento",
    "Easy": "Fácil",
    "Medium": "Intermedio",
    "Hard": "Difícil",
    "Books & Order": "Libros y orden",
    "Miracles & Signs": "Milagros y señales",
    "Parables": "Parábolas",
    "Prophets & Prophecy": "Profetas y profecía",
    "Kings & Leadership": "Reyes y liderazgo",
    "Jesus & the Gospels": "Jesús y los Evangelios",
    "Early Church & Apostles": "Iglesia primitiva y apóstoles",
    "Law, Covenant & Worship": "Ley, pacto y adoración",
    "Wisdom & Poetry": "Sabiduría y poesía",
    "Places & Geography": "Lugares y geografía",
    "People & Relationships": "Personas y relaciones",
    "Letters & Teaching": "Cartas y enseñanza",
    "General Knowledge": "Conocimientos generales",
    "General Bible": "Biblia en general",
    "Bible Quiz International — Website Edition": "Quiz Bíblico Internacional — Edición Web",
    "Daily reflection": "Reflexión diaria",
    "Today’s Bible focus": "Enfoque bíblico de hoy",
    "Today's Bible focus": "Enfoque bíblico de hoy",
    "Mark as studied": "Marcar como estudiado",
    "Quiz this theme": "Cuestionario sobre este tema",
    "Explore and learn": "Explora y aprende",
    "Beyond the quiz": "Más allá del cuestionario",
    "Interactive learning suite": "Suite de aprendizaje interactiva",
    "Bible Explorer": "Explorador bíblico",
    "Search people, books, places and references.": "Busca personas, libros, lugares y referencias.",
    "Bible Timeline": "Cronología bíblica",
    "Follow major events across the biblical narrative.": "Sigue los principales acontecimientos del relato bíblico.",
    "Interactive Bible Map": "Mapa bíblico interactivo",
    "Explore key places and journeys through a clear schematic map.": "Explora lugares y viajes clave mediante un mapa esquemático claro.",
    "Learning Mode": "Modo de aprendizaje",
    "Read concise topic lessons before testing your knowledge.": "Lee lecciones breves por tema antes de poner a prueba tus conocimientos.",
    "Weekly Challenge": "Desafío semanal",
    "A shared, repeatable challenge for family and friends.": "Un desafío compartido y repetible para familiares y amigos.",
    "Specialist collections": "Colecciones especializadas",
    "Choose a focused journey": "Elige un recorrido temático",
    "Personal learning insights": "Información personal de aprendizaje",
    "Evidence & context": "Evidencia y contexto",
    "◫ Evidence & context": "◫ Evidencia y contexto",
    "Search and discover": "Busca y descubre",
    "Search people, books, places, references or words": "Busca personas, libros, lugares, referencias o palabras",
    "Places and journeys": "Lugares y viajes",
    "Learn before you play": "Aprende antes de jugar",
    "Shared weekly event": "Actividad semanal compartida",
    "Explore this answer": "Explora esta respuesta",
    "Specialist collection": "Colección especializada",
    "Achievement unlocked": "Logro desbloqueado",
    "Continue": "Continuar",
    "Text size": "Tamaño del texto",
    "Standard": "Estándar",
    "Large": "Grande",
    "Extra large": "Extra grande",
    "Adaptive difficulty": "Dificultad adaptativa",
    "Adjusts the remaining questions to keep the challenge productive.": "Ajusta las preguntas restantes para mantener un desafío productivo.",
    "Visual learning illustrations": "Ilustraciones para el aprendizaje visual",
    "Shows a themed illustration with each question.": "Muestra una ilustración temática con cada pregunta.",
    "Enhanced evidence and context": "Evidencia y contexto ampliados",
    "Adds timeline, geography and literary context after each answer.": "Añade contexto cronológico, geográfico y literario después de cada respuesta.",
    "High-contrast mode": "Modo de alto contraste",
    "Strengthens boundaries and colour contrast.": "Refuerza los contornos y el contraste de color.",
    "Reading-friendly type": "Tipografía de lectura accesible",
    "Uses a highly legible typeface and wider spacing.": "Utiliza una tipografía muy legible y un espaciado más amplio.",
    "Left-handed answer layout": "Diseño de respuestas para zurdos",
    "Moves answer letters and controls for easier left-handed use.": "Mueve las letras y los controles para facilitar el uso con la mano izquierda.",
    "Advanced learning insights": "Análisis avanzado del aprendizaje",
    "Family leaderboard": "Clasificación familiar",
    "Daily Reader": "Lector diario",
    "Study the daily verse on seven days": "Estudia el enfoque diario durante siete días",
    "Weekly Challenger": "Participante semanal",
    "Complete a weekly challenge": "Completa un desafío semanal",
    "Bible Journey": "Recorrido bíblico",
    "Complete three learning lessons": "Completa tres lecciones de aprendizaje",
    "Collection Scholar": "Especialista en colecciones",
    "Complete five specialist collections": "Completa cinco colecciones especializadas",
    "Quick Thinker": "Pensador veloz",
    "Average under eight seconds across 50 answers": "Mantén un promedio inferior a ocho segundos en 50 respuestas",
    "Daily focus marked as studied": "Enfoque diario marcado como estudiado",
    "Adaptive level": "Nivel adaptativo",
    "Average response": "Tiempo medio de respuesta",
    "Across recent answers": "En respuestas recientes",
    "Complete a quiz to begin": "Completa un cuestionario para comenzar",
    "Weakest book": "Libro que necesita más práctica",
    "Strongest category": "Categoría más sólida",
    "Open explorer": "Abrir explorador",
    "Open timeline": "Abrir cronología",
    "Open map": "Abrir mapa",
    "Start learning": "Comenzar a aprender",
    "Open weekly challenge": "Abrir desafío semanal",
    "View collections": "Ver colecciones",
    "View advanced analytics": "Ver análisis avanzados",
    "View family leaderboard": "Ver clasificación familiar",
    "Search people, books, places and related questions.": "Busca personas, libros, lugares y preguntas relacionadas.",
    "Follow the traditional narrative sequence across major eras.": "Sigue la secuencia narrativa tradicional a través de las principales épocas.",
    "Interactive Maps": "Mapas interactivos",
    "Explore a schematic map of key biblical locations.": "Explora un mapa esquemático de lugares bíblicos clave.",
    "Read concise lessons before practising the topic.": "Lee lecciones breves antes de practicar el tema.",
    "A shared deterministic challenge with a friend code.": "Un desafío compartido y reproducible con un código para amigos.",
    "Shows a thematic illustration for every question.": "Muestra una ilustración temática para cada pregunta.",
    "Adds historical, literary, timeline and map context after each answer.": "Añade contexto histórico, literario, cronológico y geográfico después de cada respuesta.",
    "Strengthens borders, text and answer-state contrast.": "Refuerza los bordes, el texto y el contraste de los estados de respuesta.",
    "Uses a highly legible system typeface with extra spacing.": "Utiliza una tipografía del sistema muy legible con espaciado adicional.",
    "Moves answer letters and status markers to the right.": "Mueve las letras de respuesta y los indicadores de estado a la derecha.",
    "Journey through Scripture": "Recorrido por las Escrituras",
    "Close Bible Explorer": "Cerrar el Explorador bíblico",
    "Close Bible timeline": "Cerrar la cronología bíblica",
    "Close map": "Cerrar el mapa",
    "Close learning mode": "Cerrar el modo de aprendizaje",
    "Close weekly challenge": "Cerrar el desafío semanal",
    "Close evidence and context": "Cerrar evidencia y contexto",
    "Close collection": "Cerrar la colección",
    "Try Moses, Jerusalem, prayer or Acts 16": "Prueba Moisés, Jerusalén, oración o Hechos 16",
    "This timeline presents a broad traditional narrative sequence. Dates and the chronology of some ancient events are interpreted differently by scholars and faith traditions.": "Esta cronología presenta una secuencia narrativa tradicional amplia. Las fechas y la cronología de algunos acontecimientos antiguos se interpretan de manera diferente entre especialistas y tradiciones de fe.",
    "Whole Bible": "Toda la Biblia",
    "Schematic learning map — positions are approximate and are not intended for navigation or precise historical boundary reconstruction.": "Mapa esquemático de aprendizaje: las posiciones son aproximadas y no están destinadas a la navegación ni a reconstruir con precisión fronteras históricas.",
    "Evidence and context": "Evidencia y contexto",
    "Personal learning insights": "Información personal de aprendizaje",
    "Round I · Foundations": "Ronda I · Fundamentos",
    "Round II · People & Events": "Ronda II · Personas y acontecimientos",
    "Round III · Deeper Knowledge": "Ronda III · Conocimientos avanzados",
    "Practice Mode": "Modo de práctica",
    "Saved Quiz": "Cuestionario guardado",
    "Correct — excellent work": "Correcto — excelente trabajo",
    "Time is up": "Se acabó el tiempo",
    "Not quite": "No exactamente",
    "View results": "Ver resultados",
    "No answer": "Sin respuesta",
    "Review": "Revisar",
    "Your answer:": "Tu respuesta:",
    "Correct answer:": "Respuesta correcta:",
    "Bible reference:": "Referencia bíblica:",
    "Outstanding mastery": "Dominio extraordinario",
    "A perfect score. Your Bible knowledge is exceptional.": "Una puntuación perfecta. Tu conocimiento de la Biblia es excepcional.",
    "Excellent knowledge": "Excelente conocimiento",
    "You demonstrated a strong command of the Bible across this challenge.": "Demostraste un sólido conocimiento de la Biblia durante este desafío.",
    "Very well done": "Muy bien hecho",
    "A strong result with only a few areas to revisit.": "Un resultado sólido, con solo algunos aspectos que repasar.",
    "A solid foundation": "Una base sólida",
    "Review the passages below and return to strengthen your knowledge.": "Repasa los pasajes siguientes y vuelve para fortalecer tus conocimientos.",
    "Keep growing": "Sigue creciendo",
    "Every question is an opportunity to learn. Your missed questions are ready for practice.": "Cada pregunta es una oportunidad para aprender. Tus preguntas falladas están listas para practicarlas.",
    "Creating your personalised quiz…": "Creando tu cuestionario personalizado…",
    "No questions match those filters. Choose a broader book or category.": "Ninguna pregunta coincide con esos filtros. Elige un libro o una categoría más amplia.",
    "No missed questions are waiting for practice.": "No hay preguntas falladas pendientes de práctica.",
    "Those practice questions are no longer available.": "Esas preguntas de práctica ya no están disponibles.",
    "Settings saved": "Configuración guardada",
    "Backup restored successfully": "Copia de seguridad restaurada correctamente",
    "The selected backup could not be validated": "No se pudo validar la copia de seguridad seleccionada",
    "Invalid backup": "Copia de seguridad no válida",
    "Result copied to clipboard": "Resultado copiado al portapapeles",
    "Unable to copy result": "No se pudo copiar el resultado",
    "Quiz attempt ended. Your saved quiz is still available.": "El intento ha finalizado. Tu cuestionario guardado sigue disponible.",
    "No quizzes completed yet.": "Todavía no has completado ningún cuestionario.",
    "Recorded quizzes": "Cuestionarios registrados",
    "Current active profile": "Perfil activo actual",

    "Website language": "Idioma del sitio web",
    "Language": "Idioma",
    "First Steps": "Primeros pasos",
    "Complete your first quiz": "Completa tu primer cuestionario",
    "Perfect Score": "Puntuación perfecta",
    "Score 100% in a quiz": "Obtén un 100 % en un cuestionario",
    "Three-Day Streak": "Racha de tres días",
    "Study on three consecutive days": "Estudia durante tres días consecutivos",
    "Seven-Day Streak": "Racha de siete días",
    "Study on seven consecutive days": "Estudia durante siete días consecutivos",
    "Century Scholar": "Estudioso centenario",
    "Answer 100 questions correctly": "Responde correctamente 100 preguntas",
    "Thousand Answers": "Mil respuestas",
    "Answer 1,000 questions": "Responde 1.000 preguntas",
    "Old Testament Scholar": "Estudioso del Antiguo Testamento",
    "Reach 80% Old Testament mastery": "Alcanza un 80 % de dominio del Antiguo Testamento",
    "New Testament Scholar": "Estudioso del Nuevo Testamento",
    "Reach 80% New Testament mastery": "Alcanza un 80 % de dominio del Nuevo Testamento",
    "Books & Order": "Libros y orden",
    "Miracles & Signs": "Milagros y señales",
    "Parables": "Parábolas",
    "Prophets & Prophecy": "Profetas y profecía",
    "Kings & Leadership": "Reyes y liderazgo",
    "Jesus & the Gospels": "Jesús y los Evangelios",
    "Early Church & Apostles": "Iglesia primitiva y apóstoles",
    "Law, Covenant & Worship": "Ley, pacto y adoración",
    "Wisdom & Poetry": "Sabiduría y poesía",
    "Places & Geography": "Lugares y geografía",
    "People & Relationships": "Personas y relaciones",
    "Letters & Teaching": "Cartas y enseñanza",
    "General Knowledge": "Conocimientos generales",
    "General Bible": "Biblia en general",
    "Genesis": "Génesis", "Exodus": "Éxodo", "Leviticus": "Levítico", "Numbers": "Números", "Deuteronomy": "Deuteronomio", "Joshua": "Josué", "Judges": "Jueces", "Ruth": "Rut", "1 Kings": "1 Reyes", "2 Kings": "2 Reyes", "1 Chronicles": "1 Crónicas", "2 Chronicles": "2 Crónicas", "Ezra": "Esdras", "Nehemiah": "Nehemías", "Esther": "Ester", "Psalms": "Salmos", "Proverbs": "Proverbios", "Ecclesiastes": "Eclesiastés", "Song of Solomon": "Cantar de los Cantares", "Isaiah": "Isaías", "Jeremiah": "Jeremías", "Ezekiel": "Ezequiel", "Hosea": "Oseas", "Obadiah": "Abdías", "Jonah": "Jonás", "Micah": "Miqueas", "Nahum": "Nahúm", "Habakkuk": "Habacuc", "Zephaniah": "Sofonías", "Haggai": "Hageo", "Zechariah": "Zacarías", "Malachi": "Malaquías", "Matthew": "Mateo", "Mark": "Marcos", "Luke": "Lucas", "John": "Juan", "Acts": "Hechos", "Romans": "Romanos", "1 Corinthians": "1 Corintios", "2 Corinthians": "2 Corintios", "Galatians": "Gálatas", "Ephesians": "Efesios", "Philippians": "Filipenses", "Colossians": "Colosenses", "1 Thessalonians": "1 Tesalonicenses", "2 Thessalonians": "2 Tesalonicenses", "1 Timothy": "1 Timoteo", "2 Timothy": "2 Timoteo", "Titus": "Tito", "Philemon": "Filemón", "Hebrews": "Hebreos", "James": "Santiago", "1 Peter": "1 Pedro", "2 Peter": "2 Pedro", "1 John": "1 Juan", "2 John": "2 Juan", "3 John": "3 Juan", "Jude": "Judas", "Revelation": "Apocalipsis"
  };

  const attrNames = ["title", "aria-label", "placeholder", "alt"];

  function t(input) {
    const text = String(input ?? "");
    if (language !== "es" || !text) return text;
    if (Object.prototype.hasOwnProperty.call(ES, text)) return ES[text];

    let m;
    if ((m = text.match(/^(\d+) questions answered$/))) return `${m[1]} preguntas respondidas`;
    if ((m = text.match(/^(\d+) correct answers$/))) return `${m[1]} respuestas correctas`;
    if ((m = text.match(/^(\d+) unlocked$/))) return `${m[1]} desbloqueados`;
    if ((m = text.match(/^Question (\d+) of (\d+)$/))) return `Pregunta ${m[1]} de ${m[2]}`;
    if ((m = text.match(/^(\d+) seconds remaining$/))) return `Quedan ${m[1]} segundos`;
    if ((m = text.match(/^New (\d+)-question quiz created$/))) return `Se creó un nuevo cuestionario de ${m[1]} preguntas`;
    if ((m = text.match(/^Switched to (.+)$/))) return `Perfil cambiado a ${m[1]}`;
    if ((m = text.match(/^(\d+) quizzes$/))) return `${m[1]} cuestionarios`;
    if ((m = text.match(/^1 quiz$/))) return "1 cuestionario";
    if ((m = text.match(/^Best score (\d+)%$/))) return `Mejor puntuación ${m[1]} %`;
    if ((m = text.match(/^Page (\d+) of (\d+)$/))) return `Página ${m[1]} de ${m[2]}`;
    if ((m = text.match(/^New achievement(?:s)? unlocked$/))) return "Nuevos logros desbloqueados";
    if ((m = text.match(/^I scored (\d+)\/(\d+) \((\d+)%\) in The Ultimate Bible Challenge\.$/))) return `Obtuve ${m[1]}/${m[2]} (${m[3]} %) en El Desafío Bíblico Definitivo.`;

    return text;
  }

  function translateNode(node) {
    if (language !== "es" || !node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const original = node.nodeValue;
      const trimmed = original.trim();
      if (!trimmed) return;
      const translated = t(trimmed);
      if (translated !== trimmed) {
        const before = original.match(/^\s*/)?.[0] || "";
        const after = original.match(/\s*$/)?.[0] || "";
        node.nodeValue = `${before}${translated}${after}`;
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    attrNames.forEach((name) => {
      if (!node.hasAttribute(name)) return;
      const value = node.getAttribute(name);
      const translated = t(value);
      if (translated !== value) node.setAttribute(name, translated);
    });
    [...node.childNodes].forEach(translateNode);
  }

  function translateDocument() {
    if (language !== "es") return;
    document.documentElement.lang = "es";
    document.title = "Quiz Bíblico Internacional — Quiz Bíblico Interactivo";
    translateNode(document.body);
    document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]').forEach((meta) => {
      const value = meta.getAttribute("content") || "";
      const translated = value
        .replaceAll("The Ultimate Bible Challenge", "El Desafío Bíblico Definitivo")
        .replaceAll("5,000+ verified questions", "más de 5.000 preguntas verificadas")
        .replaceAll("5,000+ verified Bible questions", "más de 5.000 preguntas bíblicas verificadas")
        .replaceAll("Test and grow your Bible knowledge", "Pon a prueba y amplía tus conocimientos bíblicos")
        .replaceAll("Interactive Bible quiz", "Quiz bíblico interactivo");
      meta.setAttribute("content", translated);
    });
  }

  function setLanguage(next) {
    if (!supported.includes(next)) return;
    localStorage.setItem(STORAGE_KEY, next);
    location.reload();
  }

  function addLanguageControls() {
    const settingsGrid = document.querySelector("#settingsDialog .form-grid");
    if (settingsGrid && !document.getElementById("languageSelect")) {
      const label = document.createElement("label");
      label.className = "language-setting";
      label.innerHTML = `<span>${language === "es" ? "Idioma" : "Language"}</span><select id="languageSelect" aria-label="${language === "es" ? "Idioma del sitio web" : "Website language"}"><option value="en">English</option><option value="es">Español</option></select>`;
      settingsGrid.prepend(label);
      const select = label.querySelector("select");
      select.value = language;
      select.addEventListener("change", () => setLanguage(select.value));
    }

  }

  function showFirstLaunchLanguageGate() {
    if (saved || supported.includes(requestedLanguage)) return;
    const gate = document.createElement("div");
    gate.className = "language-gate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "languageGateTitle");
    gate.innerHTML = `
      <div class="language-gate-card">
        <img src="assets/logo-icon.png" alt="Bible Quiz logo">
        <span class="language-gate-kicker">Bible Quiz International</span>
        <h1 id="languageGateTitle">Choose your language<br><span>Elige tu idioma</span></h1>
        <p>Select the language for the complete website experience.<br>Selecciona el idioma para toda la experiencia del sitio web.</p>
        <div class="language-gate-actions">
          <button type="button" data-language="en"><strong>English</strong><small>Continue in English</small></button>
          <button type="button" data-language="es"><strong>Español</strong><small>Continuar en español</small></button>
        </div>
      </div>`;
    document.body.appendChild(gate);
    gate.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.language));
    });
    gate.querySelector("button")?.focus();
  }

  const originalConfirm = window.confirm.bind(window);
  const originalAlert = window.alert.bind(window);
  window.confirm = (message) => originalConfirm(t(message));
  window.alert = (message) => originalAlert(t(message));

  const observer = new MutationObserver((mutations) => {
    if (language !== "es") return;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(translateNode);
      if (mutation.type === "attributes") translateNode(mutation.target);
    });
  });

  window.BQI18n = {
    language,
    locale,
    isSpanish: language === "es",
    t,
    setLanguage,
    translateDocument,
    translateNode
  };

  document.addEventListener("DOMContentLoaded", () => {
    addLanguageControls();
    translateDocument();
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: attrNames });
    showFirstLaunchLanguageGate();
  });
})();
