const analyzeBtn = document.getElementById("analyzeBtn");
const fileInput = document.getElementById("chatFile");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const summaryCardsEl = document.getElementById("summaryCards");
const participantStatsEl = document.getElementById("participantStats");
const topWordsEl = document.getElementById("topWords");
const sentimentInsightsEl = document.getElementById("sentimentInsights");
const topBigramsEl = document.getElementById("topBigrams");
const topTrigramsEl = document.getElementById("topTrigrams");
const personTopWordsEl = document.getElementById("personTopWords");
const messageBarsEl = document.getElementById("messageBars");
const dailyChartEl = document.getElementById("dailyChart");
const chartSummaryEl = document.getElementById("chartSummary");
const monthlyBarsEl = document.getElementById("monthlyBars");

const stopWords = new Set([
  "il", "lo", "la", "i", "gli", "le", "un", "una", "di", "a", "da", "in", "con", "su",
  "per", "tra", "fra", "e", "o", "ma", "se", "non", "che", "mi", "ti", "ci", "vi", "si",
  "io", "tu", "lui", "lei", "noi", "voi", "loro", "del", "della", "delle", "dei", "degli",
  "the", "and", "or", "to", "of", "in", "is", "are", "was", "were", "for", "on", "it", "that",
  "media", "omessi", "vcf", "allegato", "file",
]);

const positiveWords = new Set([
  "bene", "ottimo", "fantastico", "felice", "amore", "grazie", "bravo", "yes", "great", "good", "awesome", "love",
  "sereno", "felicissimo", "contento", "contenta", "perfetto", "perfetta", "ok", "top", "splendido", "splendida",
]);

const negativeWords = new Set([
  "male", "brutto", "terribile", "triste", "odio", "problema", "scusa", "bad", "hate", "angry", "awful", "sad",
  "ansia", "paura", "stress", "nervoso", "nervosa", "deluso", "delusa", "disastro", "pessimo", "pessima",
]);

const sentimentLexicon = new Map([
  ["bene", 1.2], ["ottimo", 1.8], ["fantastico", 2.0], ["felice", 1.7], ["amore", 1.8], ["grazie", 0.8],
  ["bravo", 1.2], ["sereno", 1.2], ["contento", 1.4], ["contenta", 1.4], ["perfetto", 1.5], ["perfetta", 1.5],
  ["great", 1.8], ["good", 1.2], ["awesome", 2.0], ["love", 1.8], ["ok", 0.3],
  ["male", -1.3], ["brutto", -1.5], ["terribile", -2.0], ["triste", -1.6], ["odio", -2.0], ["problema", -1.2],
  ["ansia", -1.3], ["paura", -1.2], ["stress", -1.4], ["nervoso", -1.3], ["nervosa", -1.3], ["disastro", -2.0],
  ["pessimo", -1.8], ["pessima", -1.8], ["bad", -1.3], ["hate", -2.0], ["angry", -1.5], ["awful", -1.8], ["sad", -1.6],
]);

const negationWords = new Set(["non", "mai", "nessuno", "nessuna", "niente", "not", "never"]);
const intensifierWords = new Set(["molto", "davvero", "super", "veramente", "troppo", "assolutamente", "so", "really"]);
const downtonerWords = new Set(["poco", "abbastanza", "quasi", "unpo", "somewhat", "kinda", "kindof"]);

const positiveEmojiPattern = /😀|😁|😂|🤣|😊|😍|😘|🥰|🤗|👍|💪|🎉|❤️|❤|✨/g;
const negativeEmojiPattern = /😞|😔|😢|😭|😡|😠|🤬|👎|💔|😣|😫|😓/g;

analyzeBtn.addEventListener("click", async () => {
  const file = fileInput.files?.[0];
  if (!file) {
    setStatus("Seleziona prima un file .txt esportato da WhatsApp.", true);
    return;
  }

  try {
    setStatus("Lettura file in corso...");
    const text = await file.text();
    const messages = parseWhatsAppText(text);

    if (!messages.length) {
      setStatus("Nessun messaggio riconosciuto. Verifica il formato del file.", true);
      resultsEl.classList.add("hidden");
      return;
    }

    setStatus(`Analizzati ${messages.length} messaggi.`);
    renderResults(analyzeMessages(messages));
  } catch (error) {
    setStatus("Errore durante l'analisi del file.", true);
    console.error(error);
  }
});

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#b42318" : "var(--muted)";
}

function parseWhatsAppText(text) {
  const lines = text.split(/\r?\n/);
  const messages = [];

  // Formati comuni WhatsApp export, es.:
  // 12/02/24, 21:47 - Nome: Messaggio
  // [12/02/2024, 21:47:10] Nome: Messaggio
  const timePattern = "(\\d{1,2}:\\d{2}(?::\\d{2})?(?:\\s?[APMapm]{2})?)";
  const patternA = new RegExp(`^(\\d{1,2}[\\/\\.-]\\d{1,2}[\\/\\.-]\\d{2,4}),?\\s+${timePattern}\\s+-\\s+([^:]+):\\s([\\s\\S]*)$`);
  const patternB = new RegExp(`^\\[(\\d{1,2}[\\/\\.-]\\d{1,2}[\\/\\.-]\\d{2,4}),\\s+${timePattern}\\]\\s+([^:]+):\\s([\\s\\S]*)$`);
  const systemPatternA = new RegExp(`^(\\d{1,2}[\\/\\.-]\\d{1,2}[\\/\\.-]\\d{2,4}),?\\s+${timePattern}\\s+-\\s+[\\s\\S]+$`);
  const systemPatternB = new RegExp(`^\\[(\\d{1,2}[\\/\\.-]\\d{1,2}[\\/\\.-]\\d{2,4}),\\s+${timePattern}\\]\\s+[\\s\\S]+$`);

  let current = null;

  for (const line of lines) {
    const m = line.match(patternA) || line.match(patternB);
    if (m) {
      if (current) messages.push(current);
      const [, datePart, timePart, sender, content] = m;
      current = {
        date: parseDateTime(datePart, timePart),
        sender: sender.trim(),
        text: content.trim(),
      };
    } else if (line.match(systemPatternA) || line.match(systemPatternB)) {
      if (current) {
        messages.push(current);
        current = null;
      }
    } else if (current) {
      current.text += `\n${line}`;
    }
  }

  if (current) messages.push(current);
  return messages.filter((m) => m.date instanceof Date && !Number.isNaN(m.date.getTime()));
}

function parseDateTime(datePart, timePart) {
  const sep = datePart.includes("/") ? "/" : datePart.includes(".") ? "." : "-";
  const parts = datePart.split(sep).map((v) => Number(v));
  if (parts.length !== 3) return new Date("invalid");

  let day = parts[0];
  let month = parts[1] - 1;
  let year = parts[2];
  if (year < 100) year += 2000;

  let normalizedTime = timePart.trim().toUpperCase();
  const hasAmPm = normalizedTime.endsWith("AM") || normalizedTime.endsWith("PM");
  let amPm = "";
  if (hasAmPm) {
    amPm = normalizedTime.slice(-2);
    normalizedTime = normalizedTime.slice(0, -2).trim();
  }

  let [hh = 0, mm = 0, ss = 0] = normalizedTime.split(":").map((v) => Number(v));
  if (hasAmPm) {
    if (amPm === "PM" && hh < 12) hh += 12;
    if (amPm === "AM" && hh === 12) hh = 0;
  }

  return new Date(year, month, day, hh, mm, ss);
}

function analyzeMessages(messages) {
  const totalMessages = messages.length;
  const participants = new Map();
  const wordFreq = new Map();
  const bigramFreq = new Map();
  const trigramFreq = new Map();
  const wordsByParticipant = new Map();
  const dailyCounts = new Map();
  const monthlyCounts = new Map();
  const monthlySentiment = new Map();

  let totalWords = 0;
  let nonTextualMessages = 0;
  let overallBasicSum = 0;
  let overallAdvancedSum = 0;
  let overallEmotionalitySum = 0;
  const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };

  for (let i = 0; i < messages.length; i += 1) {
    const msg = messages[i];
    const dayKey = toDayKey(msg.date);
    const monthKey = toMonthKey(msg.date);

    dailyCounts.set(dayKey, (dailyCounts.get(dayKey) || 0) + 1);
    monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) || 0) + 1);

    if (!participants.has(msg.sender)) {
      participants.set(msg.sender, {
        count: 0,
        textualCount: 0,
        words: 0,
        sentimentBasic: 0,
        sentimentAdvanced: 0,
        sentimentAbs: 0,
        positiveCount: 0,
        neutralCount: 0,
        negativeCount: 0,
        responseMinutes: [],
      });
    }
    if (!wordsByParticipant.has(msg.sender)) {
      wordsByParticipant.set(msg.sender, new Map());
    }

    const tokens = isLexicalMessage(msg.text) ? tokenize(msg.text) : [];
    const item = participants.get(msg.sender);
    item.count += 1;
    if (!tokens.length) nonTextualMessages += 1;

    const lexicalTokens = tokens.filter((w) => !stopWords.has(w) && w.length > 2);
    totalWords += lexicalTokens.length;
    item.words += lexicalTokens.length;

    for (const w of lexicalTokens) {
      wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
      const personFreq = wordsByParticipant.get(msg.sender);
      personFreq.set(w, (personFreq.get(w) || 0) + 1);
    }

    for (let j = 0; j < tokens.length - 1; j += 1) {
      const w1 = tokens[j];
      const w2 = tokens[j + 1];
      if (isNgramToken(w1) && isNgramToken(w2)) {
        const bigram = `${w1} ${w2}`;
        bigramFreq.set(bigram, (bigramFreq.get(bigram) || 0) + 1);
      }
    }

    for (let j = 0; j < tokens.length - 2; j += 1) {
      const w1 = tokens[j];
      const w2 = tokens[j + 1];
      const w3 = tokens[j + 2];
      if (isNgramToken(w1) && isNgramToken(w2) && isNgramToken(w3)) {
        const trigram = `${w1} ${w2} ${w3}`;
        trigramFreq.set(trigram, (trigramFreq.get(trigram) || 0) + 1);
      }
    }

    if (tokens.length) {
      const basicScore = sentimentScoreBasic(tokens);
      const advancedScore = sentimentScoreAdvanced(tokens, msg.text);
      const category = classifySentiment(advancedScore);
      const monthlyItem = monthlySentiment.get(monthKey) || { sum: 0, count: 0 };
      monthlyItem.sum += advancedScore;
      monthlyItem.count += 1;
      monthlySentiment.set(monthKey, monthlyItem);

      item.textualCount += 1;
      overallBasicSum += basicScore;
      overallAdvancedSum += advancedScore;
      overallEmotionalitySum += Math.abs(advancedScore);
      sentimentBreakdown[category] += 1;

      item.sentimentBasic += basicScore;
      item.sentimentAdvanced += advancedScore;
      item.sentimentAbs += Math.abs(advancedScore);
      if (category === "positive") item.positiveCount += 1;
      if (category === "neutral") item.neutralCount += 1;
      if (category === "negative") item.negativeCount += 1;
    }

    const prev = messages[i - 1];
    if (prev && prev.sender !== msg.sender) {
      const diffMin = (msg.date.getTime() - prev.date.getTime()) / 60000;
      if (diffMin >= 0 && diffMin < 24 * 60) {
        item.responseMinutes.push(diffMin);
      }
    }
  }

  const firstDate = messages[0].date;
  const lastDate = messages[messages.length - 1].date;
  const textualMessages = Math.max(1, totalMessages - nonTextualMessages);

  const participantsStats = [...participants.entries()].map(([name, data]) => {
    const avgWords = data.count ? data.words / data.count : 0;
    const avgResp = average(data.responseMinutes);
    const sentimentBasicAvg = data.textualCount ? data.sentimentBasic / data.textualCount : 0;
    const sentimentAdvancedAvg = data.textualCount ? data.sentimentAdvanced / data.textualCount : 0;
    const positivity = percentage(data.positiveCount, data.textualCount);
    const neutrality = percentage(data.neutralCount, data.textualCount);
    const negativity = percentage(data.negativeCount, data.textualCount);

    return {
      name,
      ...data,
      avgWords,
      avgResp,
      sentimentBasicAvg,
      sentimentAdvancedAvg,
      sentimentEmotionality: data.textualCount ? data.sentimentAbs / data.textualCount : 0,
      positivity,
      neutrality,
      negativity,
    };
  });

  return {
    totalMessages,
    totalWords,
    nonTextualMessages,
    avgWordsPerMessage: totalWords / totalMessages,
    participantsStats,
    topWords: toTopList(wordFreq, 20),
    topBigrams: toTopList(bigramFreq, 20),
    topTrigrams: toTopList(trigramFreq, 20),
    topWordsByParticipant: toTopWordsByParticipant(wordsByParticipant, 12),
    dailySeries: toDailySeries(dailyCounts),
    monthlySeries: toMonthlySeries(monthlyCounts),
    monthlySentimentSeries: toMonthlySentimentSeries(monthlySentiment),
    firstDate,
    lastDate,
    overallSentimentBasic: overallBasicSum / textualMessages,
    overallSentimentAdvanced: overallAdvancedSum / textualMessages,
    sentimentEmotionality: overallEmotionalitySum / textualMessages,
    sentimentBreakdown,
    sentimentSignalRatio: (sentimentBreakdown.positive + sentimentBreakdown.negative) / textualMessages,
  };
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[\u200e\u200f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function isLexicalMessage(text) {
  const normalized = text
    .toLowerCase()
    .replace(/[\u200e\u200f]/g, "")
    .replace(/[<>]/g, "")
    .trim();

  if (!normalized) return false;
  const nonLexicalPatterns = [
    /^(media|sticker|gif|video|immagine|documento|audio) omess[oa]$/i,
    /^posizione in tempo reale condivisa$/i,
    /^messaggio eliminato$/i,
    /^hai eliminato questo messaggio[.!?]*$/i,
    /^this message was deleted[.!?]*$/i,
    /^video note omitted[.!?]*$/i,
    /^file allegato/i,
    /vcf[\s\S]*file\s+allegato/i,
    /^chiamata (audio|video)/i,
  ];

  return !nonLexicalPatterns.some((pattern) => pattern.test(normalized));
}

function isNgramToken(token) {
  return token.length > 2 && !stopWords.has(token) && !/^\d+$/.test(token);
}

function sentimentScoreBasic(tokens) {
  if (!tokens.length) return 0;
  let score = 0;
  for (const w of tokens) {
    if (positiveWords.has(w)) score += 1;
    if (negativeWords.has(w)) score -= 1;
  }
  return score / Math.max(1, Math.sqrt(tokens.length));
}

function sentimentScoreAdvanced(tokens, rawText) {
  if (!tokens.length) return 0;

  let score = 0;
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    let weight = sentimentLexicon.get(token) || 0;
    if (!weight) continue;

    const prev = tokens[i - 1] || "";
    const prev2 = tokens[i - 2] || "";

    if (negationWords.has(prev) || negationWords.has(prev2)) {
      weight *= -0.85;
    }
    if (intensifierWords.has(prev)) {
      weight *= 1.35;
    }
    if (downtonerWords.has(prev)) {
      weight *= 0.7;
    }

    score += weight;
  }

  const raw = rawText.toLowerCase();
  const positiveEmojiCount = countMatches(positiveEmojiPattern, raw);
  const negativeEmojiCount = countMatches(negativeEmojiPattern, raw);
  score += positiveEmojiCount * 0.9;
  score -= negativeEmojiCount * 0.9;

  const exclamations = Math.min(3, (raw.match(/!/g) || []).length);
  if (score !== 0) {
    score *= 1 + exclamations * 0.08;
  }

  return score / Math.max(1, Math.sqrt(tokens.length));
}

function countMatches(pattern, text) {
  const match = text.match(pattern);
  return match ? match.length : 0;
}

function classifySentiment(score) {
  if (score >= 0.12) return "positive";
  if (score <= -0.12) return "negative";
  return "neutral";
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function percentage(value, total) {
  if (!total) return 0;
  return (value / total) * 100;
}

function toTopList(freqMap, limit) {
  return [...freqMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([text, count]) => ({ text, count }));
}

function toTopWordsByParticipant(wordsByParticipant, limit) {
  return [...wordsByParticipant.entries()]
    .map(([name, map]) => ({
      name,
      items: toTopList(map, limit),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function toDayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toMonthKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function toDailySeries(dailyCounts) {
  const keys = [...dailyCounts.keys()].sort();
  if (!keys.length) return [];

  const start = parseDayKey(keys[0]);
  const end = parseDayKey(keys[keys.length - 1]);
  const series = [];

  for (let d = new Date(start.getTime()); d <= end; d.setDate(d.getDate() + 1)) {
    const key = toDayKey(d);
    series.push({
      key,
      date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      count: dailyCounts.get(key) || 0,
    });
  }

  return series;
}

function parseDayKey(dayKey) {
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toMonthlySeries(monthlyCounts) {
  return [...monthlyCounts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([monthKey, count]) => ({ monthKey, count }));
}

function toMonthlySentimentSeries(monthlySentiment) {
  return [...monthlySentiment.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([monthKey, item]) => ({
      monthKey,
      avg: item.count ? item.sum / item.count : 0,
      count: item.count,
    }));
}

function renderResults(data) {
  resultsEl.classList.remove("hidden");

  summaryCardsEl.innerHTML = "";
  const summary = [
    ["Messaggi", data.totalMessages],
    ["Msg testuali", data.totalMessages - data.nonTextualMessages],
    ["Partecipanti", data.participantsStats.length],
    ["Parole", data.totalWords],
    ["Media parole/msg", data.avgWordsPerMessage.toFixed(1)],
    ["Sent. euristico", formatSentiment(data.overallSentimentBasic)],
    ["Sent. avanzato", formatSentiment(data.overallSentimentAdvanced)],
    ["Periodo", `${formatDate(data.firstDate)} - ${formatDate(data.lastDate)}`],
  ];

  for (const [label, value] of summary) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<div class="label">${label}</div><div class="value">${value}</div>`;
    summaryCardsEl.appendChild(card);
  }

  participantStatsEl.innerHTML = "";
  for (const p of data.participantsStats.sort((a, b) => b.count - a.count)) {
    const row = document.createElement("div");
    row.className = "participant-row";
    row.innerHTML = `
      <div class="participant-name">${escapeHtml(p.name)}</div>
      <div class="participant-meta">
        ${p.count} msg | ${p.avgWords.toFixed(1)} parole/msg | risposta media ${p.avgResp ? `${p.avgResp.toFixed(1)} min` : "n/d"} | sent. ${formatSentiment(p.sentimentAdvancedAvg)}
      </div>
      <div class="participant-meta">
        mood: +${p.positivity.toFixed(1)}% / =${p.neutrality.toFixed(1)}% / -${p.negativity.toFixed(1)}%
      </div>
    `;
    participantStatsEl.appendChild(row);
  }

  renderSentimentInsights(data);
  renderSimpleList(topWordsEl, data.topWords);
  renderSimpleList(topBigramsEl, data.topBigrams);
  renderSimpleList(topTrigramsEl, data.topTrigrams);
  renderTopWordsByPerson(data.topWordsByParticipant);
  renderMessageDistribution(data.participantsStats);
  renderTimeCharts(data.dailySeries, data.monthlySeries);
}

function renderSentimentInsights(data) {
  if (!sentimentInsightsEl) return;

  const textualMessages = Math.max(1, data.totalMessages - data.nonTextualMessages);
  const pos = data.sentimentBreakdown.positive;
  const neu = data.sentimentBreakdown.neutral;
  const neg = data.sentimentBreakdown.negative;
  const posPct = percentage(pos, textualMessages);
  const neuPct = percentage(neu, textualMessages);
  const negPct = percentage(neg, textualMessages);

  const rows = [
    ["Sentiment medio chat (euristico)", formatSentiment(data.overallSentimentBasic)],
    ["Sentiment medio chat (avanzato)", formatSentiment(data.overallSentimentAdvanced)],
    ["Messaggi positivi / neutri / negativi", `${pos} / ${neu} / ${neg}`],
    ["Distribuzione %", `${posPct.toFixed(1)}% / ${neuPct.toFixed(1)}% / ${negPct.toFixed(1)}%`],
    ["Intensita emotiva media", data.sentimentEmotionality.toFixed(3)],
    ["Segnale utile", `${(data.sentimentSignalRatio * 100).toFixed(1)}% (messaggi non neutri)`],
  ];

  const rowsHtml = rows.map(([label, value]) => `
      <div class="insight-row">
        <div class="insight-label">${escapeHtml(label)}</div>
        <div class="insight-value">${escapeHtml(value)}</div>
      </div>
    `).join("");

  sentimentInsightsEl.innerHTML = `
    <p class="sentiment-explainer">
      La sentiment analysis stima il tono emotivo dei messaggi: il modello euristico conta parole positive/negative, quello avanzato aggiunge negazioni, intensificatori ed emoji.
    </p>
    ${renderMonthlySentimentMiniChart(data.monthlySentimentSeries)}
    <div class="sentiment-legend">
      <div class="legend-item"><strong>Positivi</strong><br>${pos} (${posPct.toFixed(1)}%)</div>
      <div class="legend-item"><strong>Neutri</strong><br>${neu} (${neuPct.toFixed(1)}%)</div>
      <div class="legend-item"><strong>Negativi</strong><br>${neg} (${negPct.toFixed(1)}%)</div>
    </div>
    <div class="sentiment-stack" role="img" aria-label="Distribuzione sentiment positiva neutra negativa">
      <div class="sentiment-segment positive" style="width:${posPct.toFixed(2)}%"></div>
      <div class="sentiment-segment neutral" style="width:${neuPct.toFixed(2)}%"></div>
      <div class="sentiment-segment negative" style="width:${negPct.toFixed(2)}%"></div>
    </div>
    ${rowsHtml}
  `;
}

function renderMonthlySentimentMiniChart(series) {
  if (!series?.length) return "";
  const maxAbs = Math.max(...series.map((item) => Math.abs(item.avg)), 0.12);

  const rows = series.map((item) => {
    const width = Math.min(50, (Math.abs(item.avg) / maxAbs) * 50);
    const sideClass = item.avg >= 0 ? "positive" : "negative";
    const bar = width > 0
      ? `<div class="sent-mini-bar ${sideClass}" style="width:${width.toFixed(2)}%"></div>`
      : "";
    const value = `${item.avg >= 0 ? "+" : ""}${item.avg.toFixed(3)}`;

    return `
      <div class="sent-mini-row">
        <div class="sent-mini-label">${escapeHtml(formatMonth(item.monthKey))}</div>
        <div class="sent-mini-track">
          <div class="sent-mini-zero"></div>
          ${bar}
        </div>
        <div class="sent-mini-value ${sideClass}">${value}</div>
      </div>
    `;
  }).join("");

  return `
    <div class="sent-mini-block">
      <div class="insight-label">Trend sentiment mensile (avanzato)</div>
      ${rows}
    </div>
  `;
}

function renderSimpleList(element, items) {
  element.innerHTML = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = `${item.text}: ${item.count}`;
    element.appendChild(li);
  }
}

function renderTopWordsByPerson(personEntries) {
  personTopWordsEl.innerHTML = "";
  for (const entry of personEntries) {
    const card = document.createElement("div");
    card.className = "person-card";
    const wordsHtml = entry.items
      .map((item) => `<li>${escapeHtml(item.text)} (${item.count})</li>`)
      .join("");

    card.innerHTML = `
      <div class="participant-name">${escapeHtml(entry.name)}</div>
      <ul class="chips">${wordsHtml || "<li>n/d</li>"}</ul>
    `;
    personTopWordsEl.appendChild(card);
  }
}

function renderMessageDistribution(participantsStats) {
  messageBarsEl.innerHTML = "";
  const sorted = [...participantsStats].sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...sorted.map((p) => p.count), 1);

  for (const p of sorted) {
    const row = document.createElement("div");
    row.className = "bar-row";
    const width = Math.max(5, (p.count / maxCount) * 100);
    row.innerHTML = `
      <div>${escapeHtml(p.name)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
      <div>${p.count}</div>
    `;
    messageBarsEl.appendChild(row);
  }
}

function renderTimeCharts(dailySeries, monthlySeries) {
  const buckets = bucketDailySeries(dailySeries, 120);
  const resolution = buckets[0]?.days || 1;
  chartSummaryEl.textContent = `Serie giornaliera: ${dailySeries.length} giorni. Visualizzazione compressa a ${buckets.length} punti (${resolution} giorno/i per punto).`;

  dailyChartEl.innerHTML = buildLineChartSvg(buckets);

  monthlyBarsEl.innerHTML = "";
  const maxCount = Math.max(...monthlySeries.map((m) => m.count), 1);
  for (const m of monthlySeries) {
    const row = document.createElement("div");
    row.className = "bar-row";
    const width = Math.max(4, (m.count / maxCount) * 100);
    row.innerHTML = `
      <div>${formatMonth(m.monthKey)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
      <div>${m.count}</div>
    `;
    monthlyBarsEl.appendChild(row);
  }
}

function bucketDailySeries(series, maxPoints) {
  if (series.length <= maxPoints) {
    return series.map((d) => ({
      label: formatDate(d.date),
      count: d.count,
      days: 1,
    }));
  }

  const chunkSize = Math.ceil(series.length / maxPoints);
  const buckets = [];

  for (let i = 0; i < series.length; i += chunkSize) {
    const chunk = series.slice(i, i + chunkSize);
    const start = chunk[0].date;
    const end = chunk[chunk.length - 1].date;
    const label = chunk.length === 1
      ? formatDate(start)
      : `${formatDate(start)} - ${formatDate(end)}`;

    buckets.push({
      label,
      count: chunk.reduce((sum, day) => sum + day.count, 0),
      days: chunk.length,
    });
  }

  return buckets;
}

function buildLineChartSvg(pointsData) {
  if (!pointsData.length) {
    return "<p class='participant-meta'>Nessun dato disponibile.</p>";
  }

  const width = 980;
  const height = 300;
  const padding = { top: 18, right: 16, bottom: 34, left: 42 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...pointsData.map((p) => p.count), 1);

  const points = pointsData.map((item, idx) => {
    const x = padding.left + ((plotWidth * idx) / Math.max(pointsData.length - 1, 1));
    const y = padding.top + (1 - item.count / maxValue) * plotHeight;
    return { x, y, label: item.label };
  });

  const linePath = points.map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L${(padding.left + plotWidth).toFixed(2)},${(padding.top + plotHeight).toFixed(2)} L${padding.left.toFixed(2)},${(padding.top + plotHeight).toFixed(2)} Z`;

  const yGrid = [0.25, 0.5, 0.75, 1].map((ratio) => {
    const value = Math.round(maxValue * ratio);
    const y = padding.top + (1 - ratio) * plotHeight;
    return `
      <line x1="${padding.left}" y1="${y.toFixed(2)}" x2="${(padding.left + plotWidth).toFixed(2)}" y2="${y.toFixed(2)}" stroke="#e8efff" stroke-width="1" />
      <text x="6" y="${(y + 4).toFixed(2)}" fill="#4f6289" font-size="11">${value}</text>
    `;
  }).join("");

  const firstLabel = pointsData[0].label;
  const midLabel = pointsData[Math.floor(pointsData.length / 2)].label;
  const lastLabel = pointsData[pointsData.length - 1].label;

  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Andamento messaggi nel tempo">
      <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />
      ${yGrid}
      <path d="${areaPath}" fill="rgba(20, 130, 207, 0.12)" />
      <path d="${linePath}" fill="none" stroke="#1482cf" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <line x1="${padding.left}" y1="${(padding.top + plotHeight).toFixed(2)}" x2="${(padding.left + plotWidth).toFixed(2)}" y2="${(padding.top + plotHeight).toFixed(2)}" stroke="#ccd9f7" stroke-width="1" />
      <text x="${padding.left}" y="${height - 8}" fill="#4f6289" font-size="11">${escapeHtml(firstLabel)}</text>
      <text x="${(padding.left + plotWidth / 2 - 42).toFixed(2)}" y="${height - 8}" fill="#4f6289" font-size="11">${escapeHtml(midLabel)}</text>
      <text x="${(padding.left + plotWidth - 88).toFixed(2)}" y="${height - 8}" fill="#4f6289" font-size="11">${escapeHtml(lastLabel)}</text>
    </svg>
  `;
}

function formatSentiment(value) {
  if (value > 0.12) return `positivo (${value.toFixed(3)})`;
  if (value < -0.12) return `negativo (${value.toFixed(3)})`;
  return `neutro (${value.toFixed(3)})`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("it-IT", {
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
