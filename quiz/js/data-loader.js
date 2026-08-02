(()=>{
  "use strict";
  const BOOKS=["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
  const loaded={en:{OT:Boolean(window.BQ_OT),NT:Boolean(window.BQ_NT)},es:{OT:Boolean(window.BQ_OT_ES),NT:Boolean(window.BQ_NT_ES)}};
  const language=()=>window.BQI18n?.language==="es"?"es":"en";
  function script(src){return new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`${window.BQI18n?.t("Unable to load")||"Unable to load"} ${src}`));document.head.appendChild(s)})}
  function sourceFor(type,lang){return lang==="es"?`data/questions-${type.toLowerCase()}-es.js`:`data/questions-${type.toLowerCase()}.js`}
  function bank(type,lang){if(lang==="es")return type==="OT"?(window.BQ_OT_ES||[]):(window.BQ_NT_ES||[]);return type==="OT"?(window.BQ_OT||[]):(window.BQ_NT||[])}
  async function load(types=["OT","NT"]){
    const lang=language();
    for(const type of types){if(!loaded[lang][type]){await script(sourceFor(type,lang));loaded[lang][type]=true}}
    return types.flatMap(type=>bank(type,lang)).map(enrich);
  }
  function book(q){if(q.book)return q.book;const hay=`${q.ref||""} ${q.q||""}`;for(const b of [...BOOKS].sort((a,b)=>b.length-a.length)){if(new RegExp(`(^|[^A-Za-z])${b.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}(?=$|[^A-Za-z])`,"i").test(hay))return b}return "General Bible"}
  function category(q){if(q.category)return q.category;const x=`${q.q} ${q.e} ${q.ref}`.toLowerCase();if(x.includes("book order")||x.includes("correct order")||x.includes("comes immediately")||x.includes("appears before"))return"Books & Order";if(/miracle|healed|healing|raised from the dead|sign/.test(x))return"Miracles & Signs";if(/parable/.test(x))return"Parables";if(/prophet|prophecy|prophes/.test(x))return"Prophets & Prophecy";if(/king|queen|reign|throne/.test(x))return"Kings & Leadership";if(/jesus|christ|messiah|gospel/.test(x))return"Jesus & the Gospels";if(/apostle|church|paul|peter|acts/.test(x))return"Early Church & Apostles";if(/law|commandment|covenant|tabernacle|temple|priest/.test(x))return"Law, Covenant & Worship";if(/psalm|proverb|wisdom|poet/.test(x))return"Wisdom & Poetry";if(/where|city|river|mount|island|land|country|sea/.test(x))return"Places & Geography";if(/who|whose|son|daughter|wife|husband|mother|father|brother|sister/.test(x))return"People & Relationships";if(/letter|epistle|wrote|author/.test(x))return"Letters & Teaching";return"General Knowledge"}
  function enrich(q){return q.book&&q.category?q:{...q,book:book(q),category:category(q)}}
  window.BQData={load,BOOKS,book,category,enrich,language};
})();
