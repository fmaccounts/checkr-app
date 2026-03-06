import { useState, useEffect, useRef } from "react";

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const STORAGE_KEY    = "checkr_garage_v5";
const ONBOARD_KEY    = "checkr_onboard_v5";
const loadGarage     = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };
const saveGarage     = (g)  => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(g)); } catch {} };
const loadOnboard    = () => { try { return JSON.parse(localStorage.getItem(ONBOARD_KEY)) || null; } catch { return null; } };
const saveOnboard    = (o)  => { try { localStorage.setItem(ONBOARD_KEY, JSON.stringify(o)); } catch {} };

// ─── I18N ─────────────────────────────────────────────────────────────────────
const T = {
  de: {
    appTagline: "Kein Risiko. Nur Klarheit.",
    appSub: "CHECKR begleitet dich durch den Kauf — von der ersten Anzeige bis zur Unterschrift.",
    startBtn: "Kaufprozess starten",
    myAutos: "Meine Autos",
    howTitle: "So funktioniert's",
    how: [
      "Fahrzeug eingeben — wir laden passende Schwachstellen.",
      "Jede Phase Schritt für Schritt — oder überspringen.",
      "Automatische Auswertung: Alles gut / Mit Vorsicht / Nicht kaufen.",
      "Auto speichern und mehrere Autos vergleichen.",
    ],
    disclaimer: "CHECKR ersetzt keine professionelle Begutachtung. Alle Checks sind unverbindlich.",
    onboardLang: "Sprache wählen",
    onboardName: "Wie soll ich dich nennen?",
    onboardNamePlaceholder: "Dein Name",
    onboardNameHint: "So mache ich die Checks persönlicher.",
    onboardStart: "Los geht's",
    phasePopupCta: "Verstanden — los geht's",
    phasePopups: {
      inserat:     (n) => `Hey ${n}, bevor du zum Auto fährst, prüfen wir gemeinsam das Inserat. Viele Probleme erkennst du schon hier.`,
      kontakt:     (n) => `${n}, jetzt geht es um den ersten Kontakt mit dem Verkäufer. Wie jemand auf Fragen reagiert, sagt mehr als die Antworten selbst.`,
      haendler:    (n) => `${n}, diese Phase ist nur relevant wenn du bei einem gewerblichen Händler kaufst. Privatverkäufer können sie überspringen.`,
      besichtigung:(n) => `Jetzt stehst du beim Auto, ${n}. Nimm dir Zeit — kein seriöser Verkäufer macht echten Druck. Schaue systematisch durch.`,
      probefahrt:  (n) => `${n}, jetzt kommt die Probefahrt. Mindestens 20 Minuten, konzentriert fahren — kein Gespräch. Erst warm zeigen sich echte Probleme.`,
      dokumente:   (n) => `${n}, die Papiere erzählen die Geschichte des Autos. Was nicht belegt ist, existiert nicht.`,
      kaufvertrag: (n) => `Letzte Phase, ${n}. Nach der Unterschrift gelten andere Regeln. Nimm dir Zeit — du darfst den Vertrag mitnehmen und später unterschreiben.`,
    },
    verdictLabels: { stop:"Nicht kaufen", warn:"Mit Vorsicht", go:"Positiv" },
    verdictDesc: {
      stop: "Mindestens ein Abbruchgrund gefunden. Externe Begutachtung verlangen oder zum nächsten Auto.",
      warnIncomplete: "Du hast weniger als die Hälfte der Punkte geprüft. Das reicht nicht für ein verlässliches Urteil.",
      warn: "Auffällige Punkte gefunden. Klären, schriftlich festhalten oder Preisreduktion verlangen.",
      go:   "Mindestens die Hälfte aller Punkte geprüft — keine Auffälligkeiten. Kaufvertrag sorgfältig lesen.",
    },
    compareTitle: "Vergleich",
    compareRec: (n) => `Unsere Empfehlung für dich, ${n}:`,
    compareRecBest: (name) => `${name} schneidet am besten ab.`,
    compareRecWarn: "Keines der Autos ist ohne Vorbehalt empfehlenswert.",
    ansOk: "Alles gut", ansNote: "Auffällig", ansStop: "Kritisch", ansSkip: "—",
    nothingChecked: "Nichts geprüft",
    nothingCheckedDesc: (n) => `Du hast in dieser Phase keinen Punkt bewertet, ${n}. Bist du sicher, dass du alle Punkte überspringen möchtest?`,
    nothingCheckedHint: "Nicht geprüfte Punkte fliessen nicht in die Auswertung ein.",
    backCheck: "Zurück — Punkte prüfen",
    saveBtn: "Speichern & nächstes Auto prüfen",
    newAuto: "Neues Auto",
    compare: "Vergleichen",
    nextStep: "Nächster Schritt",
    actionPoints: "Jetzt klären",
    allStopsLabel: "Kritischs",
    allNotesLabel: "Auffällige Punkte",
  },
  fr: {
    appTagline: "Pas de risque. Juste la clarté.",
    appSub: "CHECKR t'accompagne de la première annonce jusqu'à la signature.",
    startBtn: "Démarrer l'achat",
    myAutos: "Mes voitures",
    howTitle: "Comment ça marche",
    how: [
      "Entrer le véhicule — nous chargeons les faiblesses connues.",
      "Chaque étape une à une — ou sauter.",
      "Verdict automatique: Tout va / Prudence / Ne pas acheter.",
      "Sauvegarder et comparer plusieurs voitures.",
    ],
    disclaimer: "CHECKR ne remplace pas une expertise professionnelle. Tous les contrôles sont sans engagement.",
    onboardLang: "Choisir la langue",
    onboardName: "Comment dois-je t'appeler?",
    onboardNamePlaceholder: "Ton prénom",
    onboardNameHint: "Pour rendre les contrôles plus personnels.",
    onboardStart: "C'est parti",
    phasePopupCta: "Compris — allons-y",
    phasePopups: {
      inserat:     (n) => `Hey ${n}, avant de te déplacer, nous analysons ensemble l'annonce. Beaucoup de problèmes sont déjà visibles ici.`,
      kontakt:     (n) => `${n}, il s'agit maintenant du premier contact avec le vendeur. La façon dont quelqu'un répond dit plus que les réponses elles-mêmes.`,
      haendler:    (n) => `${n}, cette phase ne concerne que les vendeurs professionnels. Les particuliers peuvent la passer.`,
      besichtigung:(n) => `Tu es maintenant devant la voiture, ${n}. Prends ton temps — aucun vendeur sérieux ne fait pression. Regarde méthodiquement.`,
      probefahrt:  (n) => `${n}, voici l'essai. Au moins 20 minutes, conduite concentrée — pas de conversation. Les vrais problèmes n'apparaissent qu'à chaud.`,
      dokumente:   (n) => `${n}, les papiers racontent l'histoire de la voiture. Ce qui n'est pas documenté n'existe pas.`,
      kaufvertrag: (n) => `Dernière étape, ${n}. Après la signature, les règles changent. Prends ton temps — tu peux emporter le contrat.`,
    },
    verdictLabels: { stop:"Ne pas acheter", warn:"Avec prudence", go:"Positif" },
    verdictDesc: {
      stop: "Au moins un motif d'arrêt trouvé. Demander une expertise ou passer au prochain véhicule.",
      warnIncomplete: "Tu as vérifié moins de la moitié des points. Ce n'est pas suffisant pour un verdict fiable.",
      warn: "Points suspects trouvés. À clarifier, noter par écrit ou demander une réduction de prix.",
      go:   "Au moins la moitié des points vérifiés — aucune anomalie. Lire attentivement le contrat.",
    },
    compareTitle: "Comparaison",
    compareRec: (n) => `Notre recommandation pour toi, ${n}:`,
    compareRecBest: (name) => `${name} s'en sort le mieux.`,
    compareRecWarn: "Aucune des voitures n'est recommandable sans réserve.",
    ansOk: "Tout va", ansNote: "Suspect", ansStop: "Critique", ansSkip: "—",
    nothingChecked: "Rien vérifié",
    nothingCheckedDesc: (n) => `Tu n'as évalué aucun point dans cette phase, ${n}. Es-tu sûr de vouloir tout sauter?`,
    nothingCheckedHint: "Les points non vérifiés ne sont pas pris en compte dans l'évaluation.",
    backCheck: "Retour — vérifier les points",
    saveBtn: "Sauvegarder & vérifier la prochaine voiture",
    newAuto: "Nouvelle voiture",
    compare: "Comparer",
    nextStep: "Prochaine étape",
    actionPoints: "À clarifier maintenant",
    allStopsLabel: "Tous les motifs d'arrêt",
    allNotesLabel: "Points suspects",
  },
  en: {
    appTagline: "No risk. Just clarity.",
    appSub: "CHECKR guides you through the purchase — from the first listing to signing.",
    startBtn: "Start buying process",
    myAutos: "My cars",
    howTitle: "How it works",
    how: [
      "Enter vehicle — we load known weak points.",
      "Work through each phase — or skip.",
      "Automatic verdict: All good / Caution / Don't buy.",
      "Save and compare multiple cars.",
    ],
    disclaimer: "CHECKR does not replace a professional inspection. All checks are non-binding.",
    onboardLang: "Choose language",
    onboardName: "What should I call you?",
    onboardNamePlaceholder: "Your name",
    onboardNameHint: "This makes the checks feel more personal.",
    onboardStart: "Let's go",
    phasePopupCta: "Got it — let's go",
    phasePopups: {
      inserat:     (n) => `Hey ${n}, before you drive there, let's check the listing together. Many problems are already visible here.`,
      kontakt:     (n) => `${n}, this is about the first contact with the seller. How someone responds says more than the answers themselves.`,
      haendler:    (n) => `${n}, this phase only applies to commercial dealers. Private sellers can skip it.`,
      besichtigung:(n) => `You're standing at the car now, ${n}. Take your time — no serious seller will rush you. Check systematically.`,
      probefahrt:  (n) => `${n}, now comes the test drive. At least 20 minutes, focused driving — no talking. Real problems only show up when warm.`,
      dokumente:   (n) => `${n}, the paperwork tells the car's story. What isn't documented doesn't exist.`,
      kaufvertrag: (n) => `Last phase, ${n}. After signing, different rules apply. Take your time — you can take the contract with you.`,
    },
    verdictLabels: { stop:"Don't buy", warn:"With caution", go:"Positive" },
    verdictDesc: {
      stop: "At least one deal-breaker found. Request expert inspection or move on.",
      warnIncomplete: "You checked less than half the points. Not enough for a reliable verdict.",
      warn: "Suspicious points found. Clarify, document in writing or request price reduction.",
      go:   "At least half of all points checked — no issues. Read the contract carefully.",
    },
    compareTitle: "Comparison",
    compareRec: (n) => `Our recommendation for you, ${n}:`,
    compareRecBest: (name) => `${name} comes out on top.`,
    compareRecWarn: "None of the cars is recommendable without reservations.",
    ansOk: "All good", ansNote: "Suspicious", ansStop: "Critical", ansSkip: "—",
    nothingChecked: "Nothing checked",
    nothingCheckedDesc: (n) => `You didn't rate a single point in this phase, ${n}. Are you sure you want to skip everything?`,
    nothingCheckedHint: "Unchecked points don't count in the evaluation.",
    backCheck: "Back — check points",
    saveBtn: "Save & check next car",
    newAuto: "New car",
    compare: "Compare",
    nextStep: "Next step",
    actionPoints: "Clarify now",
    allStopsLabel: "All deal-breakers",
    allNotesLabel: "Suspicious points",
  },
};

// ─── MODEL DATABASE ───────────────────────────────────────────────────────────
const MODELS = {
  // ── VW ────────────────────────────────────────────────────────────────────
  "VW": {
    "Golf 7": { years:"2012–2020", weaknesses:["DSG-Ruckeln kalt","TSI Steuerkette","AdBlue-System"],
      besichtigung:[
        {id:"m1",label:"Unterboden: kein Rost an Schwellern oder Längsträgern?",crit:false},
        {id:"m2",label:"Innenraum: Klimaanlage kühlt, kein muffiger Geruch?",crit:false},
        {id:"m3",label:"Motorraum: keine Öl- oder Kühlmittelleckagen sichtbar?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"DSG kalt: Ruckeln beim Anfahren bei 10–30 km/h?",crit:true},
        {id:"m5",label:"TSI kalt: Rasseln beim Start in den ersten Sekunden?",crit:true},
        {id:"m6",label:"AdBlue-Warnleuchte an oder Fehlermeldung im Cockpit?",crit:true},
      ],
    },
    "Golf 8": { years:"2020–heute", weaknesses:["Software-Bugs","Touchscreen-Ausfälle","DSG-Ruckeln"],
      besichtigung:[
        {id:"m1",label:"Infotainment: bootet korrekt, keine Abstürze beim Start?",crit:true},
        {id:"m2",label:"Klimasteuerung via Touch: alle Zonen und Funktionen reagieren?",crit:false},
        {id:"m3",label:"Assistenzsysteme: alle Kameras und Sensoren im Menü vorhanden?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"Infotainment während Fahrt: kein Absturz oder Blackout?",crit:true},
        {id:"m5",label:"DSG-Schaltung: weich, kein Ruckeln bei 20–40 km/h?",crit:true},
        {id:"m6",label:"Spurhalte- und Notbremsassistent: kein Fehler-Symbol?",crit:false},
      ],
    },
    "Polo (AW)": { years:"2017–heute", weaknesses:["TSI Steuerkette EA211","DSG-Ruckeln","Lackqualität"],
      besichtigung:[
        {id:"m1",label:"Lack: Kratzer, Dellen oder Farbabweichungen an Stossstangen?",crit:false},
        {id:"m2",label:"Innenraum: Sitzbezüge und Lenkrad — Verschleiß passt zum km-Stand?",crit:false},
        {id:"m3",label:"Motorraum: Öl sauber, keine Leckagespuren?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"TSI kalt: Rasselgeräusch beim Kaltstart (Steuerkette)?",crit:true},
        {id:"m5",label:"DSG 7-Gang: Ruckeln beim Anfahren unter 30 km/h?",crit:true},
        {id:"m6",label:"Lenkung: geradeaus ohne Ziehen, kein Flattern?",crit:false},
      ],
    },
    "T-Roc": { years:"2017–heute", weaknesses:["DSG-Ruckeln","Panoramadach Abdichtung","Infotainment-Bugs"],
      besichtigung:[
        {id:"m1",label:"Panoramadach (falls vorhanden): Dichtungen intakt, kein Wasserfleck?",crit:true},
        {id:"m2",label:"Innenraum: keine Feuchtigkeitsspuren an Himmel oder Fenstern?",crit:true},
        {id:"m3",label:"Infotainment: bootet ohne Fehler, alle Funktionen aktiv?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"DSG: kein Ruckeln beim Anfahren oder Gangwechsel?",crit:true},
        {id:"m5",label:"4Motion (falls vorhanden): keine Vibrationen bei Kurvenfahrt?",crit:false},
        {id:"m6",label:"Klimaanlage: kühlt gleichmässig auf beiden Seiten?",crit:false},
      ],
    },
  },

  // ── TOYOTA ────────────────────────────────────────────────────────────────
  "Toyota": {
    "Yaris (XP210)": { years:"2020–heute", weaknesses:["Hybrid-Akku Langzeitverschleiß","Software-Updates nötig"],
      besichtigung:[
        {id:"m1",label:"Hybrid: kein Warnlicht, Ready-Anzeige erscheint normal?",crit:true},
        {id:"m2",label:"Karosserie: kein Rost, keine unreparierten Schäden?",crit:false},
        {id:"m3",label:"Innenraum: Touchscreen reagiert, keine eingefrorenen Menüs?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"Hybrid: weicher, ruckfreier Übergang zwischen Motor und E-Antrieb?",crit:false},
        {id:"m5",label:"Rekuperation: Bremspedal fühlt sich gleichmässig an, kein Pulsieren?",crit:false},
        {id:"m6",label:"Klimaanlage: kühlt zügig, kein muffiger Geruch beim Einschalten?",crit:false},
      ],
    },
    "Corolla (E210)": { years:"2019–heute", weaknesses:["Hybrid-Stufenlosgetriebe Geräusch","Lackqualität","12V-Batterie"],
      besichtigung:[
        {id:"m1",label:"Hybrid: Warnleuchten aus, Ladestand der Hybridbatterie angezeigt?",crit:true},
        {id:"m2",label:"Lack: keine Abplatzer oder Rost an Türunterkanten?",crit:false},
        {id:"m3",label:"12V-Batterie: Baujahr prüfen — älter als 4 Jahre?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"CVT-Getriebe: kein aufheulendes Geräusch bei Beschleunigung?",crit:true},
        {id:"m5",label:"Hybrid bei Vollgas: gleichmässige Leistungsentfaltung ohne Aussetzer?",crit:false},
        {id:"m6",label:"Bremsen: gleichmässig, kein Vibrieren oder Ziehen?",crit:false},
      ],
    },
  },

  // ── DACIA ─────────────────────────────────────────────────────────────────
  "Dacia": {
    "Sandero (3. Gen)": { years:"2021–heute", weaknesses:["Innenraum-Verarbeitungsqualität","Reifengeräusche","Basisausstattung"],
      besichtigung:[
        {id:"m1",label:"Karosserie: Spaltmaße gleichmässig, kein Verzug an Türen?",crit:false},
        {id:"m2",label:"Innenraum: alle Kunststoffteile fest, keine losen Verkleidungen?",crit:false},
        {id:"m3",label:"Motorraum: sauber, keine Leckagen, Ölstand korrekt?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"Motor: ruhiger Leerlauf, kein Ruckeln oder Aussetzer?",crit:false},
        {id:"m5",label:"Fahrgeräusch: starke Reifen- oder Windgeräusche über 80 km/h?",crit:false},
        {id:"m6",label:"Schaltgetriebe: alle Gänge einlegbar, kein Knirschen?",crit:false},
      ],
    },
  },

  // ── PEUGEOT ───────────────────────────────────────────────────────────────
  "Peugeot": {
    "208 (2. Gen)": { years:"2019–heute", weaknesses:["i-Cockpit Sicht","EAT8-Getriebe Ruckeln","Elektroversion Reichweite"],
      besichtigung:[
        {id:"m1",label:"i-Cockpit: Instrumente hinter dem Lenkrad vollständig sichtbar?",crit:true},
        {id:"m2",label:"Lack und Stossstangen: keine Abplatzer oder Farbunterschiede?",crit:false},
        {id:"m3",label:"e-208: Ladestand, Reichweitenanzeige und Ladekabel vorhanden?",crit:true},
      ],
      probefahrt:[
        {id:"m4",label:"EAT8-Automat: kein Ruckeln oder Zögern beim Anfahren?",crit:true},
        {id:"m5",label:"Lenkung: direkt und präzise, kein Spiel im Geradeauslauf?",crit:false},
        {id:"m6",label:"e-208: Rekuperation aktiv, Wärmepumpe (falls vorhanden) funktioniert?",crit:false},
      ],
    },
  },

  // ── RENAULT ───────────────────────────────────────────────────────────────
  "Renault": {
    "Clio (5. Gen)": { years:"2019–heute", weaknesses:["EDC-Doppelkupplung Ruckeln","Multimedia-Bugs","Rost Unterboden"],
      besichtigung:[
        {id:"m1",label:"Unterboden: kein Rost an Schwellern oder Hinterachsträger?",crit:false},
        {id:"m2",label:"Multimedia: Easy Link System startet korrekt, kein Einfrieren?",crit:false},
        {id:"m3",label:"Innenraum: Sitze und Verkleidungen ohne auffälligen Verschleiß?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"EDC-Doppelkupplung: kein Ruckeln oder Zögern bei 20–50 km/h?",crit:true},
        {id:"m5",label:"Motor: gleichmässiger Leerlauf, kein Vibrieren im Stand?",crit:false},
        {id:"m6",label:"E-Tech Hybrid (falls vorhanden): weicher Wechsel Motor/Elektro?",crit:false},
      ],
    },
    "Megane (4. Gen)": { years:"2016–2022", weaknesses:["EDC-Getriebe","Rost Unterboden","Infotainment-Abstürze"],
      besichtigung:[
        {id:"m1",label:"Unterboden: Rost an Schwellern und Querträgern?",crit:true},
        {id:"m2",label:"Karosserie: Spaltmaße gleichmässig, keine Unfallspuren?",crit:false},
        {id:"m3",label:"Innenraum: R-Link Multimedia funktioniert, keine Abstürze?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"EDC-Getriebe: kein Ruckeln beim Anfahren oder bei Tempowechsel?",crit:true},
        {id:"m5",label:"Fahrwerk: kein Poltern oder Klappern bei Bodenwellen?",crit:false},
        {id:"m6",label:"Bremsen: gleichmässig, kein Ziehen zur Seite?",crit:false},
      ],
    },
  },

  // ── SKODA ─────────────────────────────────────────────────────────────────
  "Skoda": {
    "Octavia (4. Gen)": { years:"2020–heute", weaknesses:["TSI Steuerkette EA211 Evo","DSG-Ruckeln","Touchscreen-Bedienung"],
      besichtigung:[
        {id:"m1",label:"Infotainment: bootet ohne Fehler, alle Apps reagieren?",crit:false},
        {id:"m2",label:"Motorraum: Ölstand korrekt, keine Leckagen sichtbar?",crit:false},
        {id:"m3",label:"Karosserie: gleichmässige Spaltmaße rundum?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"TSI kalt: Rasselgeräusch beim Start (Steuerkette EA211 Evo)?",crit:true},
        {id:"m5",label:"DSG: kein Ruckeln bei 15–40 km/h im Stadtverkehr?",crit:true},
        {id:"m6",label:"Fahrwerk: ruhig und ohne Klappern auf schlechten Strassen?",crit:false},
      ],
    },
    "Karoq": { years:"2017–heute", weaknesses:["DSG-Ruckeln","Panoramadach Undichtigkeit","Rost Hinterachse"],
      besichtigung:[
        {id:"m1",label:"Panoramadach: Dichtungen intakt, keine Wasserflecken am Himmel?",crit:true},
        {id:"m2",label:"Hinterachse: Rost an Trägern sichtbar (häufige Stelle)?",crit:true},
        {id:"m3",label:"Innenraum: kein Feuchtigkeitsgeruch, alle Schalter funktionieren?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"DSG: kein Ruckeln beim Anfahren und bei niedrigem Tempo?",crit:true},
        {id:"m5",label:"4x4 (falls vorhanden): keine Vibrationen bei Kurvenfahrt?",crit:false},
        {id:"m6",label:"Motor: gleichmässige Leistung, kein Aussetzer unter Last?",crit:false},
      ],
    },
  },

  // ── FORD ──────────────────────────────────────────────────────────────────
  "Ford": {
    "Puma": { years:"2019–heute", weaknesses:["EcoBoost 3-Zylinder Vibrationen","MegaBox Dichtigkeit","Fahrgeräusche"],
      besichtigung:[
        {id:"m1",label:"MegaBox (Kofferraum-Unterraum): trocken, kein Feuchtigkeitsgeruch?",crit:true},
        {id:"m2",label:"Motorraum: EcoBoost 3-Zyl. Öl sauber, kein Leck?",crit:false},
        {id:"m3",label:"Innenraum: SYNC-Infotainment bootet und reagiert?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"EcoBoost 3-Zylinder: Vibrationen im Leerlauf spürbar?",crit:true},
        {id:"m5",label:"Fahrgeräusch: starke Wind- oder Abrollgeräusche über 100 km/h?",crit:false},
        {id:"m6",label:"Lenkung: präzise, kein Flattern oder Ziehen?",crit:false},
      ],
    },
    "Kuga (3. Gen)": { years:"2019–heute", weaknesses:["PHEV Brandrisiko frühe Modelle","EcoBoost Kühlmittelverlust","Softwareprobleme"],
      besichtigung:[
        {id:"m1",label:"PHEV (Plug-in): Baujahr 2020? Rückruf-Status prüfen — Brandrisiko!",crit:true},
        {id:"m2",label:"Kühlmittelstand: korrekt, keine Leckagen oder weisser Belag?",crit:true},
        {id:"m3",label:"Ladeport PHEV: Stecker passt, Anzeige im Cockpit korrekt?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"PHEV: E-Modus aktiv, Reichweitenanzeige plausibel?",crit:false},
        {id:"m5",label:"Motor: kein Ruckeln, kein Kühlmittelgeruch aus Lüftung?",crit:true},
        {id:"m6",label:"Getriebe: weiche Schaltpunkte, keine Schläge?",crit:false},
      ],
    },
  },

  // ── OPEL ──────────────────────────────────────────────────────────────────
  "Opel": {
    "Corsa F": { years:"2019–heute", weaknesses:["EAT8-Ruckeln","Elektrik-Bugs","Lackqualität"],
      besichtigung:[
        {id:"m1",label:"Lack: Kratzer und Abplatzer besonders an Türkanten und Schwellern?",crit:false},
        {id:"m2",label:"Infotainment: Multimedia-System startet korrekt?",crit:false},
        {id:"m3",label:"Innenraum: alle elektrischen Fensterheber und Spiegel funktionieren?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"EAT8-Automat: kein Ruckeln beim Anfahren oder Verzögern?",crit:true},
        {id:"m5",label:"Motor: ruhiger Leerlauf, keine Aussetzer beim Gasgeben?",crit:false},
        {id:"m6",label:"Lenkung: geradeaus ohne Ziehen, keine ungewöhnlichen Geräusche?",crit:false},
      ],
    },
  },

  // ── HYUNDAI ───────────────────────────────────────────────────────────────
  "Hyundai": {
    "Tucson (4. Gen)": { years:"2020–heute", weaknesses:["HTRAC 4WD Software","48V-Mild-Hybrid Geräusche","Panoramadach"],
      besichtigung:[
        {id:"m1",label:"Panoramadach: Dichtungen intakt, kein Knarren oder Wasserfleck?",crit:true},
        {id:"m2",label:"Karosserie: Spaltmaße gleichmässig, keine Farbabweichungen?",crit:false},
        {id:"m3",label:"Innenraum: alle Touchflächen und digitales Cockpit fehlerfrei?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"48V-Mild-Hybrid: kein Ruckeln beim Übergang Start/Stopp?",crit:false},
        {id:"m5",label:"HTRAC 4WD: keine Vibrationen bei Kurvenfahrt auf Trockenheit?",crit:true},
        {id:"m6",label:"Fahrwerk: ruhig über Bodenwellen, kein Poltern vorne?",crit:false},
      ],
    },
    "i20 (3. Gen)": { years:"2020–heute", weaknesses:["48V-Mildhybrid-Geräusche","Infotainment-Bugs","Verarbeitungsqualität"],
      besichtigung:[
        {id:"m1",label:"Innenraum: Kunststoffverkleidungen fest, kein Knarren?",crit:false},
        {id:"m2",label:"Infotainment: Bluelink-System startet, alle Funktionen abrufbar?",crit:false},
        {id:"m3",label:"Karosserie: Spaltmaße und Lack ohne Auffälligkeiten?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"48V-Start: kein Ruckeln oder Schlag beim automatischen Motorstart?",crit:true},
        {id:"m5",label:"Motor: gleichmässige Leistung, kein Vibrieren im Leerlauf?",crit:false},
        {id:"m6",label:"Bremsen: gleichmässig, kein Pulsieren oder Geräusch?",crit:false},
      ],
    },
  },

  // ── KIA ───────────────────────────────────────────────────────────────────
  "Kia": {
    "Sportage (5. Gen)": { years:"2021–heute", weaknesses:["PHEV Softwareprobleme","DCT-Ruckeln","Panoramadach"],
      besichtigung:[
        {id:"m1",label:"Panoramadach: Dichtungen intakt, kein Knarren?",crit:true},
        {id:"m2",label:"PHEV: Ladestandanzeige plausibel, Rückruf-Status geprüft?",crit:true},
        {id:"m3",label:"Infotainment: 12.3-Zoll-Display fehlerfrei, kein Einfrieren?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"DCT-Getriebe: kein Ruckeln beim Anfahren oder Rangieren?",crit:true},
        {id:"m5",label:"AWD (falls vorhanden): keine Vibrationen bei Kurvenfahrt?",crit:false},
        {id:"m6",label:"Motor: gleichmässig unter Last, kein Turbo-Aussetzer?",crit:false},
      ],
    },
  },

  // ── SEAT/CUPRA ────────────────────────────────────────────────────────────
  "Seat / Cupra": {
    "Arona": { years:"2017–heute", weaknesses:["DSG-Ruckeln","TSI Steuerkette","Infotainment"],
      besichtigung:[
        {id:"m1",label:"Motorraum: Ölstand korrekt, keine Leckagen?",crit:false},
        {id:"m2",label:"Innenraum: Infotainment startet, alle Tasten reagieren?",crit:false},
        {id:"m3",label:"Lack: keine Abplatzer oder Roststellen an Schwellern?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"DSG kalt: Ruckeln oder Zögern beim Anfahren?",crit:true},
        {id:"m5",label:"TSI kalt: Rasseln in den ersten Sekunden nach Start?",crit:true},
        {id:"m6",label:"Lenkung: direkt, kein Ziehen oder Flattern?",crit:false},
      ],
    },
    "Cupra Formentor": { years:"2020–heute", weaknesses:["DSG-Ruckeln","Sportsitze Verschleiß","Software-Updates"],
      besichtigung:[
        {id:"m1",label:"Sportsitze: Bolstern und Seitenführung — Verschleiß zum km-Stand?",crit:false},
        {id:"m2",label:"Infotainment: CUPRA-System ohne Fehler und Abstürze?",crit:false},
        {id:"m3",label:"Motorraum: 2.0 TSI sauber, keine Leckagen?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"DSG: kein Ruckeln bei stadtüblichen Geschwindigkeiten?",crit:true},
        {id:"m5",label:"4Drive AWD: keine Vibrationen oder Geräusche bei Kurvenfahrt?",crit:false},
        {id:"m6",label:"Bremsen: standfest, kein Fading nach mehreren Vollbremsungen?",crit:false},
      ],
    },
  },

  // ── MERCEDES ──────────────────────────────────────────────────────────────
  "Mercedes": {
    "A-Klasse (W177)": { years:"2018–heute", weaknesses:["MBUX-Software-Bugs","7G-DCT Ruckeln","Kühlmittelverlust"],
      besichtigung:[
        {id:"m1",label:"MBUX-Display: bootet ohne Fehler, beide Screens aktiv?",crit:true},
        {id:"m2",label:"Kühlmittelstand: korrekt, kein weisser Belag am Ausgleichsbehälter?",crit:true},
        {id:"m3",label:"Innenraum: Ambientebeleuchtung und alle Assistenz-Tasten?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"7G-DCT: kein Ruckeln beim Anfahren oder bei 30–60 km/h?",crit:true},
        {id:"m5",label:"Motor: keine Überhitzung, Temperatur stabil nach 20 Min.?",crit:true},
        {id:"m6",label:"Fahrwerk: kein Poltern, ruhig über Kopfsteinpflaster?",crit:false},
      ],
    },
    "C-Klasse (W205)": { years:"2014–2021", weaknesses:["9G-Tronic Ruckeln","Airmatic Kompressor","Rost Türunterkanten"],
      besichtigung:[
        {id:"m1",label:"Türunterkanten: Rost (typische W205-Schwachstelle)?",crit:false},
        {id:"m2",label:"Airmatic: Fahrzeug steht gleichmässig auf allen 4 Ecken?",crit:true},
        {id:"m3",label:"Motorraum: keine Öl- oder Kühlmittelleckagen?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"9G-Tronic: Ruckeln oder Schläge bei 40–60 km/h?",crit:true},
        {id:"m5",label:"Airmatic: Fahrzeug hebt sich gleichmässig beim Start?",crit:true},
        {id:"m6",label:"Fahrwerk: kein Klappern oder Poltern bei Bodenwellen?",crit:false},
      ],
    },
  },

  // ── BMW ───────────────────────────────────────────────────────────────────
  "BMW": {
    "3er (F30)": { years:"2012–2019", weaknesses:["N20 Steuerkette","Elektro-Wasserpumpe","Hochdruckpumpe"],
      besichtigung:[
        {id:"m1",label:"Kühlmittel: Temperaturanzeige stabil, keine Leckagen?",crit:false},
        {id:"m2",label:"iDrive: kein Neustart oder Abstürze beim Einschalten?",crit:false},
        {id:"m3",label:"Motorraum: keine Öl- oder Kühlmittelspuren?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"N20-Steuerkette: Rasseln beim Kaltstart?",crit:true},
        {id:"m5",label:"Elektro-Wasserpumpe: Temperatur stabil auf langer Fahrt?",crit:true},
        {id:"m6",label:"Hochdruckpumpe: Startprobleme oder Leistungseinbruch unter Last?",crit:true},
      ],
    },
    "M3 (E46)": { years:"2000–2006", weaknesses:["Subframe-Risse","VANOS kalt","SMG-Pumpe"],
      besichtigung:[
        {id:"m1",label:"Subframe: Risse an den 4 Anbindungspunkten unter dem Auto?",crit:true},
        {id:"m2",label:"Hinterradhaus innen: Rost an typischer Naht-Stelle?",crit:false},
        {id:"m3",label:"Kühlwasser: Farbe OK, kein Öleintrag?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"Kaltstart: Rasselgeräusch in den ersten 10 Sekunden?",crit:true},
        {id:"m5",label:"SMG: Warnleuchte, langsame oder harte Schaltung?",crit:true},
        {id:"m6",label:"Brummen bei konstant 80–120 km/h?",crit:false},
      ],
    },
  },

  // ── AUDI ──────────────────────────────────────────────────────────────────
  "Audi": {
    "A4 (B8/B9)": { years:"2008–2022", weaknesses:["Multitronic CVT","TFSI Ölverbrauch","S-tronic Kupplung"],
      besichtigung:[
        {id:"m1",label:"Unterboden: Rost an Querträgern oder Schwellern?",crit:false},
        {id:"m2",label:"Kühlmittel: Farbe OK, kein Öleintrag sichtbar?",crit:false},
        {id:"m3",label:"Motorraum: sauber, keine Leckagespuren?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"Multitronic CVT: ruckelt, schlägt oder schlupft?",crit:true},
        {id:"m5",label:"TFSI: Ölverbrauch laut Protokoll auffällig hoch (>0.5L/1000km)?",crit:true},
        {id:"m6",label:"S-tronic: Rucken unter 30 km/h bei kaltem Motor?",crit:false},
      ],
    },
    "A6 (C7/C8)": { years:"2011–heute", weaknesses:["Luftfederung","S-tronic Kupplung","Mild-Hybrid-Batterie"],
      besichtigung:[
        {id:"m1",label:"Luftfederung: Fahrzeug steht gerade auf allen 4 Ecken?",crit:true},
        {id:"m2",label:"Lack: keine Übergänge oder Neulack-Stellen sichtbar?",crit:false},
        {id:"m3",label:"MMI: bootet fehlerfrei, Navigation und Kamera aktiv?",crit:false},
      ],
      probefahrt:[
        {id:"m4",label:"S-tronic: Rucken bei 10–30 km/h?",crit:true},
        {id:"m5",label:"Luftfederung: Fahrzeug hebt sich gleichmässig beim Start?",crit:true},
        {id:"m6",label:"Motor: gleichmässig, kein Ruckeln, kein Rauch?",crit:false},
      ],
    },
  },

  // ── PORSCHE ───────────────────────────────────────────────────────────────
  "Porsche": {
    "911 (997)": { years:"2004–2012", weaknesses:["IMS-Lager","RMS Ölaustritt","Ölverbrauch"],
      besichtigung:[
        {id:"m1",label:"IMS-Lager: Ölanalyse-Nachweis oder Austausch-Beleg vorhanden?",crit:true},
        {id:"m2",label:"Ölspuren an Hinterachse oder Getriebeübergang sichtbar?",crit:true},
        {id:"m3",label:"Ölstand prüfen — passt zum angegebenen Verbrauch?",crit:true},
        {id:"m4",label:"Cabrio: Verdeckkasten trocken, kein Schimmel?",crit:false},
      ],
      probefahrt:[
        {id:"m5",label:"Kupplung: kein Schleifen, kein Rucken beim Anfahren?",crit:false},
        {id:"m6",label:"Bremsen: kein Ziehen zur Seite, kein Pulsieren?",crit:false},
        {id:"m7",label:"Motorgeräusch bei Volllast gleichmässig, kein Klopfen?",crit:false},
      ],
    },
  },
};

const GENERIC = {
  besichtigung:[
    {id:"g1",label:"Spaltmaße: rundum gleichmässig, kein Unfallverdacht?",crit:false},
    {id:"g2",label:"Lack: keine Farbabweichungen zwischen Teilen?",crit:false},
    {id:"g3",label:"Unterboden: kein Rost an Schwellern?",crit:false},
    {id:"g4",label:"Motorraum: kein Ölaustritt, alles ordentlich?",crit:false},
    {id:"g5",label:"Innenraum: kein Feuchtigkeitsgeruch, alle Funktionen?",crit:false},
  ],
  probefahrt:[
    {id:"g6",label:"Motor kalt: gleichmässiger Leerlauf, keine Geräusche?",crit:false},
    {id:"g7",label:"Getriebe: weiche Schaltpunkte, kein Rucken?",crit:false},
    {id:"g8",label:"Bremsen: gleichmässig, kein Ziehen zur Seite?",crit:false},
    {id:"g9",label:"Lenkung: geradeaus ohne Ziehen?",crit:false},
  ],
};

// ─── PHASE DATA ───────────────────────────────────────────────────────────────
const BASE_PHASES = [
  {
    id:"inserat", label:"Inserat", short:"Bevor du hinfährst",
    intro:"Schau dir das Inserat kritisch an. Viele Probleme erkennst du schon hier — bevor du überhaupt zum Auto fährst.",
    groups:[
      { label:"Preis & Angebot", flags:[
        {id:"i1",crit:true, text:"Preis mehr als 20% unter vergleichbaren Angeboten",tip:"Entweder Lockvogel-Angebot oder das Auto hat ein ernstes, nicht genanntes Problem. Vergleich auf AutoScout24 oder mobile.de."},
        {id:"i2",crit:false,text:"Behauptungen ohne Nachweis: unfallfrei, frisch ab Service, 1 Vorbesitzer",tip:"Alles was nicht belegt ist, zählt nicht. Service-Protokoll, Unfallfreiheit-Bestätigung und Anzahl Vorbesitzer im Fahrzeugausweis beim Termin verlangen."},
        
      ]},
      { label:"Fotos & Inhalt", flags:[
        {id:"i4",crit:true, text:"Fotos bei schlechtem Licht, in Halle oder unscharf",tip:"Dunkle oder unscharfe Fotos verbergen Dellen, Rost und Lackschäden. Immer auf klare Tageslichtfotos bestehen."},
        {id:"i5",crit:false,text:"Keine Fotos vom Innenraum, Motorraum oder Unterboden",tip:"Wer einen guten Zustand hat, zeigt ihn. Fehlende Fotos sind kein Versehen."},
        
      ]},
      { label:"Verkäufer", flags:[
        {id:"i7",crit:true, text:"Privat-Inserat wirkt wie professioneller Händler",tip:"Mehrere Inserate, professionelle Fotos, Händlersprache — aber als Privat deklariert. Gewerblich als Privat verkaufen ist illegal. Du verlierst Gewährleistungsrechte."},
        
      ]},
    ]
  },
  {
    id:"kontakt", label:"Erstkontakt", short:"Vor dem Termin",
    intro:"Das erste Gespräch — ob per Telefon, WhatsApp oder Mail — sagt viel über den Verkäufer. Hör genau hin.",
    groups:[
      { label:"Druck & Taktik", flags:[
        {id:"k1",crit:true, text:"Zeitdruck: andere Interessenten, nur heute verfügbar",tip:"Klassische Drucktaktik. Seriöse Verkäufer lassen dir Zeit. Unter Druck entscheidet man schlecht."},
        {id:"k2",crit:true, text:"Anzahlung oder Reservierung vor Besichtigung verlangt",tip:"Niemals Geld überweisen bevor du das Auto live gesehen hast. Das ist die häufigste Betrugsmasche."},
        
      ]},
      { label:"Auskunft & Identität", flags:[
        {id:"k4",crit:true, text:"Ausweichende Antworten auf direkte Fragen zum Zustand",tip:"Wer das Auto kennt und nichts zu verbergen hat, antwortet klar. Wer ausweicht, weiß etwas."},
        {id:"k5",crit:true, text:"Probefahrt abgelehnt oder auf wenige Minuten begrenzt",tip:"Ohne freie Probefahrt — mindestens 20 Minuten, gerne mit Autobahn — kein Kauf."},
        
      ]},
    ]
  },
  {
    id:"haendler", label:"Händler", short:"Nur bei Händlerkauf",
    intro:"Nur relevant wenn du bei einem gewerblichen Händler kaufst. Privatverkäufer überspringen.",
    optional: true,
    groups:[
      { label:"Seriosität", flags:[
        {id:"h1",crit:true, text:"Kein festes Ladenlokal — nur Parkplatz oder Hinterhof",tip:"Ohne feste Adresse ist der Händler im Streitfall kaum greifbar. Immer auf einem echten Geschäftslokal bestehen."},
        {id:"h2",crit:true, text:"Keine UID-Nummer nennbar oder im Handelsregister auffindbar",tip:"Schweiz: uid.admin.ch. Deutschland: Handelsregister. Nicht eingetragen = Graumarkt."},
        {id:"h3",crit:false,text:"Viele 5-Sterne Bewertungen ohne Text, Datum oder Variation",tip:"Gefälschte Bewertungen. Ältere Einträge mit echtem Text lesen. Negative Bewertungen zeigen oft das wahre Bild."},
      ]},
      { label:"Verkaufstaktik", flags:[
        
        
      ]},
    ]
  },
  {
    id:"besichtigung", label:"Besichtigung", short:"Du stehst beim Auto",
    intro:"Nimm dir mindestens 30 Minuten. Schaue systematisch: aussen → unten → Motorraum → innen. Kein Zeitdruck akzeptieren.",
    groups:[
      { label:"Situation", flags:[
        {id:"b1",crit:true, text:"Motor läuft bereits beim Ankommen",tip:"Beim Kaltstart hört man viele Probleme, die danach verschwinden. Darauf bestehen, dass der Motor kalt ist — sonst neu terminieren."},
        
        
      ]},
      { label:"Karosserie & Lack", flags:[
        {id:"b4",crit:true, text:"Spaltmaße oder Farbton ungleichmässig an Karosserie-Teilen",tip:"Spalt an Türen und Kotflügeln sollte überall gleich breit sein. Farbunterschiede im Tageslicht = Unfallreparatur. Beides aus verschiedenen Winkeln prüfen."},
        
        {id:"b6",crit:false,text:"Rost an Schwellern, Radkästen oder Türunterkanten",tip:"Oberflächenrost ist verhandelbar. Durchrostung an tragenden Teilen ist ein ernstes Problem — das Auto besteht dann keine Hauptuntersuchung."},
      ]},
      { label:"Reifen", flags:[
        
        {id:"b8",crit:true, text:"Reifenalter über 6 Jahre — unabhängig vom Profil",tip:"Auf der Reifenflanke gibt es 4 Ziffern: die ersten 2 = Woche, die letzten 2 = Jahr. Beispiel: 2319 = 23. Woche 2019. Alte Reifen verhärten und verlieren Grip."},
        
      ]},
      { label:"Bremsen", flags:[
        
        
      ]},
      { label:"Unterboden & Motorraum", flags:[
        
        {id:"b13",crit:true, text:"Öl- oder Kühlwasserspuren im Motorraum",tip:"Ein Ölfleck ist oft harmlos. Ein nasser Motorraum oder weisser Belag beim Kühlwasser ist ernst. Deutet auf Leckagen hin."},
        
      ]},
      { label:"Innenraum", flags:[
        
        {id:"b16",crit:true, text:"Verschleiß passt nicht zum Kilometerstand",tip:"Fahrerpedal, Lenkrad und Fahrersitz zeigen den wahren Kilometerstand. Stark abgenutzt bei wenig km = Tachobetrug."},
        
      ]},
    ]
  },
  {
    id:"probefahrt", label:"Probefahrt", short:"Du fährst das Auto",
    intro:"Mindestens 20 Minuten. Autobahn wenn möglich. Konzentriert fahren — kein Gespräch. Erst wenn der Motor warm ist, zeigen sich viele Probleme.",
    groups:[
      { label:"Bedingungen", flags:[
        {id:"p1",crit:true, text:"Probefahrt unter 15 Minuten oder Route vorgegeben",tip:"Motor- und Getriebeprobleme zeigen sich erst nach 15–20 Minuten. Eigene Strecke mit Autobahn, Stadtverkehr und mindestens einem Stopp verlangen."},
        {id:"p2",crit:true, text:"Warnleuchten gehen kurz an und erlöschen dann",tip:"Wenn eine Warnleuchte kurz aufleuchtet und dann verschwindet, wurde der Fehler vor der Besichtigung gelöscht. Er kommt zurück."},
      ]},
      { label:"Motor & Getriebe", flags:[
        {id:"p3",crit:true, text:"Klopfen, Nageln oder Rasseln beim Kaltstart",tip:"Klopfen und Nageln beim Start deutet auf Verschleiß im Motor hin — oft an Steuerkette oder Ventilen. Nicht ignorieren."},
        {id:"p4",crit:true, text:"Leistungsabfall, Ruckeln oder Aussetzer beim Gasgeben",tip:"Kann an Zündkerzen, Einspritzung oder dem Turbo liegen. Kosten: CHF 200–3'000 je nach Ursache."},
        {id:"p5",crit:true, text:"Automatik oder Doppelkupplungsgetriebe ruckelt oder schlägt",tip:"Ruckeln beim Anfahren oder Gangwechsel ist bei manchen Modellen ein bekanntes Problem. Bei anderen bedeutet es teure Reparatur."},
        
        
      ]},
      { label:"Fahrwerk & Bremsen", flags:[
        {id:"p8",crit:true, text:"Beim Bremsen: Fahrzeug zieht zur Seite oder pulsiert",tip:"Ziehen = ein Bremssattel klemmt oder Beläge ungleich. Pulsieren = verbogene Bremsscheibe. Beides muss repariert werden."},
        
        
      ]},
    ]
  },
  {
    id:"dokumente", label:"Dokumente", short:"Papiere und Geschichte",
    intro:"Was nicht belegt ist, existiert nicht. Nimm dir Zeit für die Papiere — sie erzählen die Geschichte des Autos.",
    groups:[
      { label:"Fahrzeugpapiere", flags:[
        {id:"d1",crit:true, text:"Fahrzeugbrief fehlt, liegt bei einer Bank oder Leasing-Gesellschaft",tip:"Ohne Fahrzeugbrief kein Kauf. Brief bei Bank = Auto noch kreditfinanziert. Du kaufst die Schulden mit. Schriftlich bestätigen lassen dass keine Belastungen bestehen."},
        {id:"d2",crit:false,text:"Hauptuntersuchung läuft in den nächsten 3 Monaten ab",tip:"Bald fällige Prüfung kann Mängel offenbaren. Frische Prüfung verlangen oder den Preis entsprechend reduzieren."},
      ]},
      { label:"Servicehistorie", flags:[
        {id:"d3",crit:true, text:"Serviceheft fehlt oder hat Lücken von über 2 Jahren",tip:"Lücken bedeuten unbekannte Geschichte. Stempel ohne lesbaren Werkstattnamen sind nichts wert."},
        {id:"d4",crit:true, text:"Kilometerstand im Heft und am Tacho stimmen nicht überein",tip:"Die Stände im Serviceheft müssen chronologisch ansteigen. Jede Abweichung ist ein Abbruchgrund."},
        
      ]},
      { label:"Vorgeschichte", flags:[
        {id:"d6",crit:true, text:"War das Auto als Taxi, Mietwagen oder Fahrschulwagen zugelassen",tip:"Auch bei niedrigem Kilometerstand: Taxi und Mietwagen bedeuten extreme Belastung durch viele Kaltstarts, Stadtverkehr und wechselnde Fahrer."},
        {id:"d7",crit:true, text:"Unfalldokumentation fehlt trotz sichtbarer Reparaturen",tip:"Keine Pflicht zur Meldung — aber sichtbare Spuren ohne Erklärung sind ein Red Flag. Schriftliche Bestätigung der Unfallfreiheit verlangen."},
        
      ]},
      { label:"Import & Belastungen", flags:[
        {id:"d9",crit:true, text:"Ausländische Papiere ohne geklärten Import-Status",tip:"Import aus DE/AT in die Schweiz: Zollabgaben, Mehrwertsteuer-Nachzahlung und COC-Dokument nötig. Kann CHF 500–2'000 zusätzlich kosten."},
        {id:"d10",crit:true, text:"Tacho in Meilen — Kilometerstand möglicherweise falsch",tip:"Meilen × 1.609 = Kilometer. 60'000 Meilen = knapp 100'000 km. Immer im Serviceheft gegenchecken."},
        
      ]},
    ]
  },
  {
    id:"kaufvertrag", label:"Kaufvertrag", short:"Vor der Unterschrift",
    intro:"Nach der Unterschrift gelten andere Regeln. Nimm dir Zeit. Du darfst den Vertrag mitnehmen und später unterschreiben — das ist dein Recht.",
    groups:[
      { label:"Vertragsform", flags:[
        {id:"v1",crit:true, text:"Vertrag handschriftlich, mit Bleistift oder schwer lesbar",tip:"Bleistift ist nachträglich veränderbar. Unleserliches Schreiben ist Absicht. Nur klare, gedruckte Verträge akzeptieren."},
        {id:"v2",crit:true, text:"Preis oder Bedingungen kurz vor Unterschrift geändert",tip:"Überführungskosten, Aufbereitungspauschale, Dokumentengebühr — alles muss bereits im Angebot enthalten gewesen sein."},
        {id:"v3",crit:true, text:"Mündliche Zusagen stehen nicht im Vertrag",tip:"Was nicht im Vertrag steht, existiert nicht. Reparaturzusagen, Zubehör, Nachbesserungen — alles schriftlich."},
      ]},
      { label:"Gewährleistung", flags:[
        {id:"v4",crit:true, text:"Gekauft wie gesehen ohne schriftliche Mängelliste",tip:"Damit gibst du alle Rechte auf. Alle bekannten Mängel — auch kleine — müssen schriftlich im Vertrag stehen."},
        {id:"v5",crit:true, text:"Händler trägt sich als Privatperson ein",tip:"Illegal bei gewerblichem Verkauf. Du verlierst 2 Jahre gesetzliche Gewährleistung. Gewerbe-Nachweis verlangen."},
        {id:"v6",crit:false,text:"Keine Rücktrittsklausel bei versteckten Mängeln",tip:"Bei Händlern gilt in CH/DE 2 Jahre Gewährleistung. Bei Privatkauf: zumindest auf schriftlicher Unfallfreiheit bestehen."},
      ]},
      { label:"Zahlung & Übergabe", flags:[
        
        
        
        
      ]},
    ]
  },
];

// ─── SEVERITY ─────────────────────────────────────────────────────────────────
const ANSWERS = [
  { id:"ok",    label:"Alles gut",    short:"Gut",     color:"#36C068", bg:"rgba(54,192,104,.13)"  },
  { id:"note",  label:"Auffällig",   short:"Auffällig",color:"#E8A020", bg:"rgba(232,160,32,.13)" },
  { id:"stop",  label:"Abbruchgrund",short:"Stopp",   color:"#E84040", bg:"rgba(232,64,64,.13)"   },
  { id:"skip",  label:"Nicht geprüft",short:"—",       color:"#5A5753", bg:"rgba(90,87,83,.1)"    },
];
const ANS = Object.fromEntries(ANSWERS.map(a => [a.id, a]));

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#09090B;--bg2:#101013;--bg3:#161619;--bg4:#1C1C20;--bg5:#222227;
  --ln:#1E1E23;--ln2:#27272D;--ln3:#333339;
  --ink:#F0ECE4;--ink2:#918D87;--ink3:#5A5753;
  --lime:#C8EC3A;--lime2:rgba(200,236,58,.14);--lime3:rgba(200,236,58,.06);
  --red:#E84040;--red2:rgba(232,64,64,.13);
  --amr:#E8A020;--amr2:rgba(232,160,32,.13);
  --grn:#36C068;--grn2:rgba(54,192,104,.13);
  --fb:'Archivo',sans-serif;--fd:'Libre Baskerville',serif;
}
.light-mode {
  --bg:#F5F4F0;--bg2:#EDECEA;--bg3:#E5E3DE;--bg4:#DDDBD5;--bg5:#D5D2CB;
  --ln:#D0CEC8;--ln2:#C8C5BE;--ln3:#B8B5AE;
  --ink:#1A1917;--ink2:#4A4845;--ink3:#7A7874;
  --lime:#7AAE00;--lime2:rgba(122,174,0,.12);--lime3:rgba(122,174,0,.06);
  --red:#C82020;--red2:rgba(200,32,32,.1);
  --amr:#B07000;--amr2:rgba(176,112,0,.1);
  --grn:#1A8040;--grn2:rgba(26,128,64,.1);
}
html,body{background:var(--bg);color:var(--ink);font-family:var(--fb);font-size:15px;-webkit-font-smoothing:antialiased;min-height:100dvh}
.app{max-width:430px;min-height:100dvh;margin:0 auto;background:var(--bg);display:flex;flex-direction:column}

/* WELCOME */
.wlc{flex:1;display:flex;flex-direction:column;justify-content:flex-end;position:relative;min-height:100dvh;overflow:hidden}
.wlc-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(200,236,58,.08) 0%,transparent 70%),radial-gradient(ellipse 60% 40% at 100% 100%,rgba(200,236,58,.04) 0%,transparent 60%)}
.wlc-grid{position:absolute;inset:0;opacity:.04;background-image:linear-gradient(var(--ln2) 1px,transparent 1px),linear-gradient(90deg,var(--ln2) 1px,transparent 1px);background-size:32px 32px}
.wlc-body{position:relative;z-index:2;padding:0 24px 40px}
.wlc-badge{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--ln3);background:var(--bg3);padding:6px 12px;border-radius:20px;margin-bottom:28px;font-size:11px;color:var(--ink2);letter-spacing:.5px;text-transform:uppercase}
.wlc-dot{width:6px;height:6px;border-radius:50%;background:var(--lime);animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
.wlc-title{font-family:var(--fd);font-size:40px;line-height:1.08;letter-spacing:-.5px;margin-bottom:10px}
.wlc-title em{color:var(--lime);font-style:italic}
.wlc-sub{font-size:14px;color:var(--ink2);line-height:1.65;margin-bottom:24px}
.wlc-how{background:var(--bg3);border:1px solid var(--ln2);border-radius:12px;padding:14px;margin-bottom:24px}
.wlc-how-title{font-size:11px;color:var(--lime);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
.wlc-how-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;font-size:13px;color:var(--ink2);line-height:1.5}
.wlc-how-row:last-child{margin-bottom:0}
.wlc-num{width:20px;height:20px;border-radius:50%;border:1px solid var(--ln3);background:var(--bg4);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--lime);font-weight:700;flex-shrink:0;margin-top:1px}
.wlc-disclaimer{font-size:11px;color:var(--ink3);line-height:1.6;margin-bottom:20px;padding:10px 12px;background:var(--bg3);border-left:2px solid var(--ln3);border-radius:0 6px 6px 0}
.wlc-btns{display:flex;flex-direction:column;gap:8px}
.wlc-garage-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;background:var(--bg3);border:1px solid var(--ln2);border-radius:12px;font-family:var(--fb);font-size:13px;font-weight:600;color:var(--ink2);cursor:pointer;transition:all .15s}
.wlc-garage-btn:hover{border-color:var(--ln3);color:var(--ink)}
.garage-count{background:var(--lime2);color:var(--lime);font-size:11px;padding:1px 7px;border-radius:10px;font-weight:700}

/* VEHICLE */
.vpk{flex:1;display:flex;flex-direction:column;overflow:hidden}
.vpk-hdr{padding:20px 20px 0;border-bottom:1px solid var(--ln)}
.step-lbl{font-size:11px;color:var(--lime);text-transform:uppercase;letter-spacing:1.5px;font-weight:600;margin-bottom:8px}
.vpk-title{font-family:var(--fd);font-size:24px;letter-spacing:-.3px;margin-bottom:4px}
.vpk-sub{font-size:13px;color:var(--ink2);padding-bottom:16px}
.vpk-body{flex:1;overflow-y:auto;padding:16px 20px}
.pk-lbl{font-size:11px;color:var(--ink3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;margin-top:16px}
.pk-lbl:first-child{margin-top:0}
.pk-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pk-btn{padding:11px 14px;background:var(--bg3);border:1px solid var(--ln2);border-radius:10px;font-family:var(--fb);font-size:13px;font-weight:500;color:var(--ink2);cursor:pointer;text-align:left;transition:all .12s}
.pk-btn:hover{border-color:var(--ln3);color:var(--ink);background:var(--bg4)}
.pk-btn.sel{background:var(--lime2);border-color:var(--lime);color:var(--lime)}
.pk-model{padding:12px 14px;background:var(--bg3);border:1px solid var(--ln2);border-radius:10px;font-family:var(--fb);font-size:13px;color:var(--ink2);cursor:pointer;text-align:left;transition:all .12s;margin-bottom:6px}
.pk-model:hover{border-color:var(--ln3);color:var(--ink);background:var(--bg4)}
.pk-model.sel{background:var(--lime2);border-color:var(--lime);color:var(--lime)}
.pk-model-name{font-weight:700}
.pk-model-yr{font-size:11px;color:var(--ink3);margin-top:2px}
.pk-model.sel .pk-model-yr{color:rgba(200,236,58,.7)}
.cust-inp{width:100%;padding:11px 14px;background:var(--bg3);border:1px solid var(--ln2);border-radius:10px;font-family:var(--fb);font-size:13px;color:var(--ink);outline:none}
.cust-inp:focus{border-color:var(--lime)}
.cust-inp::placeholder{color:var(--ink3)}
.skip-lnk{background:none;border:none;font-family:var(--fb);font-size:13px;color:var(--ink3);cursor:pointer;text-decoration:underline;text-underline-offset:3px;margin-top:10px;display:block}
.skip-lnk:hover{color:var(--ink2)}

/* TOPBAR */
.topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid var(--ln);background:rgba(9,9,11,.96);backdrop-filter:blur(16px);position:sticky;top:0;z-index:30}
.tb-back{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--ink2);cursor:pointer}
.tb-back:hover{color:var(--ink)}
.tb-dots{display:flex;gap:4px}
.tb-dot{width:6px;height:6px;border-radius:50%;transition:all .2s}
.tb-dot.done{background:var(--lime)}
.tb-dot.active{background:var(--lime);opacity:.6;width:16px;border-radius:3px}
.tb-dot.todo{background:var(--ln3)}
.tb-right{font-size:12px;color:var(--lime);font-weight:700}

/* PHASE */
.ph-screen{flex:1;display:flex;flex-direction:column;overflow:hidden}
.ph-scroll{flex:1;overflow-y:auto}
.ph-intro{padding:20px 20px 16px;border-bottom:1px solid var(--ln)}
.ph-eyebrow{font-size:11px;color:var(--lime);text-transform:uppercase;letter-spacing:1.5px;font-weight:600;margin-bottom:8px}
.ph-title{font-family:var(--fd);font-size:26px;letter-spacing:-.3px;line-height:1.15;margin-bottom:6px}
.ph-short{font-size:12px;color:var(--ink3);font-style:italic;margin-bottom:8px}
.ph-text{font-size:13px;color:var(--ink2);line-height:1.7;border-left:2px solid var(--lime3);padding-left:12px}
.ph-optional-badge{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:11px;color:var(--ink3);background:var(--bg3);border:1px solid var(--ln2);padding:4px 10px;border-radius:20px}

/* critical flags highlight */
.crit-section{margin:14px 20px 0;padding:12px 14px;background:rgba(232,64,64,.06);border:1px solid rgba(232,64,64,.2);border-radius:12px}
.crit-title{font-size:10px;color:var(--red);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:10px}

/* model banner */
.mdl-banner{margin:14px 20px 0;padding:12px 14px;background:var(--bg3);border:1px solid var(--ln2);border-radius:12px}
.mdl-banner-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.mdl-banner-name{font-size:14px;font-weight:700}
.mdl-banner-yr{font-size:11px;color:var(--ink3)}
.mdl-tags{display:flex;flex-wrap:wrap;gap:4px}
.mdl-tag{font-size:10px;background:var(--red2);color:var(--red);border:1px solid rgba(232,64,64,.2);padding:1px 7px;border-radius:20px}

/* model checks */
.mdl-checks{padding:14px 20px 0}
.mdl-checks-title{font-size:10px;color:var(--lime);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.mdl-checks-title::after{content:'';flex:1;height:1px;background:rgba(200,236,58,.15)}
.mdl-card{background:var(--bg3);border:1px solid var(--ln2);border-radius:12px;padding:12px 13px;margin-bottom:8px}
.mdl-card.crit{border-color:rgba(232,64,64,.25)}
.mdl-card-row{display:flex;align-items:flex-start;gap:8px;margin-bottom:10px}
.mdl-card-lbl{font-size:13px;line-height:1.5;flex:1}
.mdl-crit-dot{width:5px;height:5px;border-radius:50%;background:var(--red);flex-shrink:0;margin-top:7px}
.mdl-btns{display:flex;gap:5px}
.mdl-btn{flex:1;padding:8px 4px;border-radius:8px;border:1px solid var(--ln2);background:var(--bg4);color:var(--ink3);cursor:pointer;font-family:var(--fb);font-size:11px;display:flex;align-items:center;justify-content:center;gap:4px;transition:all .12s}
.mdl-btn.ok{background:var(--grn2);border-color:rgba(54,192,104,.25);color:var(--grn)}
.mdl-btn.note{background:var(--amr2);border-color:rgba(232,160,32,.25);color:var(--amr)}
.mdl-btn.stop{background:var(--red2);border-color:rgba(232,64,64,.25);color:var(--red)}
.mdl-note{width:100%;margin-top:7px;padding:7px 9px;background:var(--bg5);border:1px solid var(--ln2);border-radius:7px;color:var(--ink);font-size:12px;font-family:var(--fb);resize:none;outline:none}
.mdl-note:focus{border-color:var(--lime)}
.mdl-note::placeholder{color:var(--ink3)}
.mdl-note-btn{background:none;border:none;color:var(--ink3);font-size:11px;cursor:pointer;font-family:var(--fb);margin-top:6px;display:flex;align-items:center;gap:4px}

/* group sections */
.grp-section{padding:14px 20px 0}
.grp-title{font-size:10px;color:var(--ink3);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.grp-title::after{content:'';flex:1;height:1px;background:var(--ln)}

/* flag cards */
.flag-card{background:var(--bg2);border:1px solid var(--ln);border-radius:14px;margin-bottom:10px;overflow:hidden}
.fc-top{padding:14px 14px 0;display:flex;align-items:flex-start;gap:10px}
.fc-bar{width:3px;min-height:34px;border-radius:2px;flex-shrink:0;margin-top:2px;background:var(--ln3)}
.fc-bar.crit{background:var(--red)}
.fc-text{font-size:13.5px;line-height:1.55;flex:1}
.fc-tip-btn{display:flex;align-items:center;gap:5px;background:none;border:none;font-family:var(--fb);font-size:11px;color:var(--ink3);cursor:pointer;padding:8px 14px 0;transition:color .15s}
.fc-tip-btn:hover{color:var(--ink2)}
.fc-tip{margin:8px 14px;padding:10px 12px;background:var(--bg4);border-radius:8px;font-size:12px;color:var(--ink2);line-height:1.65;border-left:2px solid var(--ln3)}
.fc-actions{display:flex;gap:5px;padding:10px 14px 14px}
.fca{flex:1;padding:8px 4px;border-radius:8px;border:1px solid var(--ln2);background:var(--bg4);color:var(--ink3);cursor:pointer;font-family:var(--fb);font-size:11px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:4px;transition:all .12s}
.fca:hover{border-color:var(--ln3);color:var(--ink2)}
.fca.ok{background:var(--grn2);border-color:rgba(54,192,104,.25);color:var(--grn)}
.fca.note{background:var(--amr2);border-color:rgba(232,160,32,.25);color:var(--amr)}
.fca.stop{background:var(--red2);border-color:rgba(232,64,64,.25);color:var(--red)}
.fca.skip{background:var(--bg5);border-color:var(--ln2);color:var(--ink3)}

/* PHASE END */
.ph-end{flex:1;display:flex;flex-direction:column;overflow:hidden}
.ph-end-scroll{flex:1;overflow-y:auto;padding:24px 20px}
.ph-end-title{font-family:var(--fd);font-size:22px;margin-bottom:4px}
.ph-end-sub{font-size:13px;color:var(--ink2);margin-bottom:20px}
.ph-end-item{display:flex;align-items:flex-start;gap:10px;padding:11px 12px;background:var(--bg2);border:1px solid var(--ln);border-radius:10px;margin-bottom:7px}
.pei-icon{width:24px;height:24px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
.pei-stop{background:var(--red2);color:var(--red)}
.pei-note{background:var(--amr2);color:var(--amr)}
.pei-text{font-size:13px;line-height:1.5;flex:1}
.ph-end-ok{text-align:center;padding:30px 0;color:var(--ink3);font-size:13px}
.ph-end-ok-icon{font-size:32px;margin-bottom:8px;color:var(--grn)}

/* BOTTOM BAR */
.bbar{position:sticky;bottom:0;z-index:20;background:rgba(9,9,11,.97);backdrop-filter:blur(16px);border-top:1px solid var(--ln);padding:10px 20px 18px;display:flex;gap:8px}
.bbar-info{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--ink3);flex:0 0 auto;padding-left:2px}
.bbar-count{font-weight:700;color:var(--ink2)}
.btn{flex:1;padding:14px;border-radius:12px;font-family:var(--fb);font-size:14px;font-weight:700;cursor:pointer;border:none;display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:-.1px;transition:all .15s}
.btn-p{background:var(--lime);color:#09090B}
.btn-p:hover{filter:brightness(1.07)}
.btn-p:active{transform:scale(.98)}
.btn-p:disabled{background:var(--bg5);color:var(--ink3);cursor:not-allowed}
.btn-g{background:var(--bg4);color:var(--ink);border:1px solid var(--ln2)}
.btn-g:hover{border-color:var(--ln3)}
.btn-icon{flex:0 0 auto;padding:14px 15px}

/* SUMMARY */
.sum{flex:1;display:flex;flex-direction:column;overflow:hidden}
.sum-scroll{flex:1;overflow-y:auto}
.sum-verdict{padding:28px 20px 20px;text-align:center}
.sv-ring{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-family:var(--fb);font-size:13px;font-weight:800}
.sv-go{background:var(--grn2);border:2px solid rgba(54,192,104,.35);color:var(--grn)}
.sv-warn{background:var(--amr2);border:2px solid rgba(232,160,32,.35);color:var(--amr)}
.sv-stop{background:var(--red2);border:2px solid rgba(232,64,64,.35);color:var(--red)}
.sv-title{font-family:var(--fd);font-size:22px;letter-spacing:-.3px}
.sv-desc{font-size:13px;color:var(--ink2);margin-top:6px;line-height:1.65;max-width:320px;margin-left:auto;margin-right:auto}
.sv-chips{display:flex;gap:7px;justify-content:center;margin-top:12px;flex-wrap:wrap}
.sv-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:20px;font-size:11px;font-weight:700}
.sv-chip-red{background:var(--red2);color:var(--red)}
.sv-chip-amr{background:var(--amr2);color:var(--amr)}
.sv-chip-grn{background:var(--grn2);color:var(--grn)}
.sum-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin:0 20px 14px}
.ss-card{background:var(--bg3);border:1px solid var(--ln2);border-radius:10px;padding:12px 8px;text-align:center}
.ss-n{font-family:var(--fd);font-size:26px;font-weight:700}
.ss-l{font-size:10px;color:var(--ink3);text-transform:uppercase;letter-spacing:.4px;margin-top:2px}
.sum-sec{padding:0 20px 0}
.sum-sec-hd{font-size:10px;color:var(--ink3);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px;margin-top:16px}
.sum-item{display:flex;align-items:flex-start;gap:10px;padding:11px 12px;background:var(--bg2);border:1px solid var(--ln);border-radius:10px;margin-bottom:7px}
.si-ico{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px}
.si-ico.red{background:var(--red2);color:var(--red)}
.si-ico.amr{background:var(--amr2);color:var(--amr)}
.si-txt{font-size:13px;line-height:1.5;flex:1}
.si-phase{font-size:10px;color:var(--ink3);margin-top:3px;text-transform:uppercase;letter-spacing:.4px}
.si-note{font-size:11px;color:var(--ink2);margin-top:3px;font-style:italic}
.next-box{margin:16px 20px 0;padding:14px;background:var(--bg3);border:1px solid var(--ln2);border-radius:12px}
.nb-hd{font-size:11px;color:var(--lime);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.nb-body{font-size:13px;color:var(--ink2);line-height:1.65}
.nb-body strong{color:var(--ink)}
.sum-disclaimer{margin:14px 20px;font-size:11px;color:var(--ink3);line-height:1.6;padding:10px 12px;background:var(--bg3);border-left:2px solid var(--ln3);border-radius:0 6px 6px 0}
.save-btn-row{padding:12px 20px 0}
.save-btn{width:100%;padding:16px;background:var(--lime);color:#09090B;border:none;border-radius:12px;font-family:var(--fb);font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:filter .15s}
.save-btn:hover{filter:brightness(1.07)}
.save-note{font-size:11px;color:var(--ink3);text-align:center;margin-top:8px;padding:0 20px}

/* CALC */
.calc-sec{padding:0 20px}
.calc-card{background:var(--bg2);border:1px solid var(--ln);border-radius:14px;padding:16px;margin-bottom:10px}
.calc-title{font-size:14px;font-weight:700;letter-spacing:-.2px;margin-bottom:12px}
.calc-row{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.calc-lbl{flex:1;font-size:12px;color:var(--ink2)}
.calc-inp{width:90px;padding:6px 10px;background:var(--bg4);border:1px solid var(--ln2);border-radius:8px;color:var(--ink);font-size:13px;font-weight:600;text-align:right;outline:none}
.calc-inp:focus{border-color:var(--lime)}
.calc-total{border-top:1px solid var(--ln);margin-top:10px;padding-top:10px;display:flex;justify-content:space-between;align-items:center}
.ct-l{font-size:13px;color:var(--ink2)}
.ct-v{font-family:var(--fd);font-size:22px;color:var(--red)}
.neg-card{background:linear-gradient(135deg,rgba(200,236,58,.07),rgba(200,236,58,.03));border:1px solid rgba(200,236,58,.2);border-radius:14px;padding:16px;margin-bottom:10px}
.neg-hd{font-size:11px;color:var(--lime);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:10px}
.neg-prices{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:10px}
.neg-ask{font-size:13px;color:var(--ink3);text-decoration:line-through}
.neg-offer{font-family:var(--fd);font-size:28px;color:var(--lime)}
.neg-save{font-size:11px;font-weight:700;background:var(--grn2);color:var(--grn);padding:2px 9px;border-radius:20px}
.neg-body{font-size:12px;color:var(--ink2);line-height:1.7}
.neg-body strong{color:var(--ink)}
.ask-lbl{font-size:11px;color:var(--ink3);margin:0 20px 5px}
.ask-inp{display:block;width:calc(100% - 40px);margin:0 20px 10px;padding:12px 14px;background:var(--bg3);border:1px solid var(--ln2);border-radius:10px;color:var(--ink);font-size:18px;font-weight:700;outline:none}
.ask-inp:focus{border-color:var(--lime)}

/* GARAGE */
.garage{flex:1;display:flex;flex-direction:column;overflow:hidden}
.garage-scroll{flex:1;overflow-y:auto;padding:16px 20px}
.garage-empty{text-align:center;padding:60px 20px;color:var(--ink3);font-size:14px}
.garage-empty-icon{font-size:40px;margin-bottom:12px;opacity:.3}
.garage-card{background:var(--bg2);border:1px solid var(--ln);border-radius:14px;margin-bottom:10px;overflow:hidden}
.gc-top{padding:14px;display:flex;align-items:flex-start;gap:12px}
.gc-verdict{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0}
.gc-v-go{background:var(--grn2);border:1.5px solid rgba(54,192,104,.35);color:var(--grn)}
.gc-v-warn{background:var(--amr2);border:1.5px solid rgba(232,160,32,.35);color:var(--amr)}
.gc-v-stop{background:var(--red2);border:1.5px solid rgba(232,64,64,.35);color:var(--red)}
.gc-info{flex:1;min-width:0}
.gc-name{font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gc-meta{font-size:11px;color:var(--ink3);margin-top:3px}
.gc-chips{display:flex;gap:5px;margin-top:8px;flex-wrap:wrap}
.gc-chip{font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px}
.gc-chip-red{background:var(--red2);color:var(--red)}
.gc-chip-amr{background:var(--amr2);color:var(--amr)}
.gc-chip-grn{background:var(--grn2);color:var(--grn)}
.gc-del{background:none;border:none;color:var(--ink3);cursor:pointer;padding:4px;font-size:18px;line-height:1;flex-shrink:0}
.gc-del:hover{color:var(--red)}
.gc-bottom{border-top:1px solid var(--ln);padding:10px 14px;display:flex;gap:6px}
.gc-tag{font-size:10px;color:var(--ink3);background:var(--bg4);border:1px solid var(--ln2);padding:2px 7px;border-radius:20px}

/* COMPARE */
.compare{flex:1;display:flex;flex-direction:column;overflow:hidden}
.compare-scroll{flex:1;overflow-y:auto}
.compare-grid{display:grid;gap:8px;padding:14px 20px}
.cmp-card{background:var(--bg2);border:1px solid var(--ln);border-radius:14px;overflow:hidden}
.cmp-hdr{padding:12px 14px;background:var(--bg3);border-bottom:1px solid var(--ln);display:flex;align-items:center;gap:10px}
.cmp-v{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0}
.cmp-name{font-size:13px;font-weight:700;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cmp-rows{padding:10px 14px}
.cmp-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--ln);font-size:12px}
.cmp-row:last-child{border-bottom:none}
.cmp-row-lbl{color:var(--ink3)}
.cmp-row-val{font-weight:700}
.cmp-row-val.red{color:var(--red)}
.cmp-row-val.amr{color:var(--amr)}
.cmp-row-val.grn{color:var(--grn)}

/* misc */
.spacer{height:28px}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:var(--ln2);border-radius:2px}
`;

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ico = ({ d, s=16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}
  </svg>
);
const IC = {
  back:  <Ico d="M19 12H5M12 19l-7-7 7-7"/>,
  fwd:   <Ico d="M5 12h14M12 5l7 7-7 7"/>,
  chk:   <Ico d="M20 6L9 17l-5-5"/>,
  x:     <Ico d="M18 6L6 18M6 6l12 12"/>,
  warn:  <Ico d={["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z","M12 9v4M12 17h.01"]}/>,
  info:  <Ico d={["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M12 16v-4M12 8h.01"]}/>,
  reset: <Ico d={["M23 4v6h-6","M20.49 15a9 9 0 11-2.12-9.36L23 10"]}/>,
  spark: <Ico d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>,
  car:   <Ico d={["M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2","M7 17a2 2 0 100 4 2 2 0 000-4z","M17 17a2 2 0 100 4 2 2 0 000-4z"]}/>,
  save:  <Ico d={["M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z","M17 21v-8H7v8","M7 3v5h8"]}/>,
  cmp:   <Ico d={["M18 20V10","M12 20V4","M6 20v-6"]}/>,
  plus:  <Ico d="M12 5v14M5 12h14"/>,
  trash: <Ico d={["M3 6h18","M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"]}/>,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const phaseAllFlags = (ph) => ph.groups.flatMap(g => g.flags);
// verdict calculated inline with coverage awareness

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function CHECKR() {
  // onboard
  const [onboard, setOnboard] = useState(loadOnboard); // {name, lang} or null
  const [obStep, setObStep]   = useState("lang"); // lang | name
  const [obLang, setObLang]   = useState("de");
  const [obName, setObName]   = useState("");

  const [dark, setDark] = useState(true);
  const t = T[onboard?.lang || "de"];
  const userName = onboard?.name || "";

  const [screen, setScreen] = useState(onboard ? "welcome" : "onboard");
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  // vehicle
  const [selMake, setSelMake]   = useState(null);
  const [selModel, setSelModel] = useState(null);
  const [custMake, setCustMake] = useState("");
  const [custModel,setCustModel]= useState("");

  // results
  const [flagR, setFlagR]   = useState({});
  const [mdlR, setMdlR]     = useState({});
  const [mdlNotes,setMdlNotes]=useState({});
  const [noteFor,setNoteFor] = useState(null);
  const [tipOpen, setTipOpen]= useState({});
  const [askPrice,setAskPrice]=useState("");
  const [dmg, setDmg]        = useState({});

  // garage
  const [renameId, setRenameId]   = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [garage, setGarage] = useState(loadGarage);
  const [selCompare, setSelCompare] = useState([]); // ids selected for compare

  const scrollRef = useRef(null);
  useEffect(()=>{ scrollRef.current?.scrollTo(0,0); },[screen,phaseIdx]);

  // ── Vehicle ──
  const makes = Object.keys(MODELS);
  const models = selMake && MODELS[selMake] ? Object.keys(MODELS[selMake]) : [];
  const vData  = selMake && selModel && MODELS[selMake]?.[selModel];
  const vName  = vData ? `${selMake} ${selModel}`
    : (custMake && custModel) ? `${custMake} ${custModel}`
    : selMake && custModel ? `${selMake} ${custModel}` : "Unbekanntes Fahrzeug";

  const getModelChecks = (type) => vData ? (vData[type]||[]) : GENERIC[type]||[];

  const phases = BASE_PHASES.map(ph => {
    if (ph.id==="besichtigung") return {...ph, modelChecks: getModelChecks("besichtigung")};
    if (ph.id==="probefahrt")   return {...ph, modelChecks: getModelChecks("probefahrt")};
    return ph;
  });
  const curPhase = phases[phaseIdx];

  // ── Setters ──
  const setFlag = (id,val) => setFlagR(r=>({...r,[id]:r[id]===val?undefined:val}));
  const setMdl  = (id,val) => setMdlR(r=>({...r,[id]:r[id]===val?undefined:val}));
  const toggleTip = (id)   => setTipOpen(t=>({...t,[id]:!t[id]}));

  // ── Computed ──
  const allFlags = phases.flatMap(ph => phaseAllFlags(ph).map(f=>({...f,phase:ph.label})));
  const allStops = allFlags.filter(f=>flagR[f.id]==="stop");
  const allNotes = allFlags.filter(f=>flagR[f.id]==="note");
  const mdlFails = Object.values(mdlR).filter(v=>v==="stop").length;
  const mdlNoteCount = Object.values(mdlR).filter(v=>v==="note").length;

  const totalStops = allStops.length + mdlFails;
  const totalNotes = allNotes.length + mdlNoteCount;

  // Coverage: how many total checkable flags exist vs how many were actually answered
  const totalCheckable = allFlags.length +
    phases.filter(ph=>ph.modelChecks).flatMap(ph=>ph.modelChecks||[]).length;
  const totalAnswered  = allFlags.filter(f=>flagR[f.id]).length +
    Object.keys(mdlR).length;
  const coveragePct = totalCheckable > 0 ? totalAnswered / totalCheckable : 0;
  const incomplete  = coveragePct < 0.5; // less than half checked = incomplete

  // Verdict logic:
  // STOP  — any Abbruchgrund found
  // WARN  — any Auffällig, OR checked less than 50% (can't say it's fine if you didn't look)
  // GO    — ≥50% checked AND zero stops AND zero notes
  const verdict = totalStops >= 1 ? "stop"
    : (totalNotes >= 1 || incomplete) ? "warn"
    : "go";

  const VDICT = {
    stop: {label: t.verdictLabels.stop, cls:"sv-stop", gcls:"gc-v-stop", desc: t.verdictDesc.stop},
    warn: {label: t.verdictLabels.warn, cls:"sv-warn", gcls:"gc-v-warn",
      desc: incomplete && totalNotes===0 && totalStops===0 ? t.verdictDesc.warnIncomplete : t.verdictDesc.warn},
    go:   {label: t.verdictLabels.go,   cls:"sv-go",   gcls:"gc-v-go",   desc: t.verdictDesc.go},
  };

  const phaseAnswered = (ph) =>
    phaseAllFlags(ph).filter(f=>flagR[f.id]&&flagR[f.id]!=="skip").length +
    ((ph.modelChecks||[]).filter(c=>mdlR[c.id]).length);

  const phaseStops = (ph) => phaseAllFlags(ph).filter(f=>flagR[f.id]==="stop").length;
  const phaseNotes = (ph) => phaseAllFlags(ph).filter(f=>flagR[f.id]==="note").length;

  const mdlIssues = phases.filter(ph=>ph.modelChecks)
    .flatMap(ph=>(ph.modelChecks||[]).filter(c=>mdlR[c.id]==="stop"||mdlR[c.id]==="note").map(c=>({...c,phase:ph.label})));
  const mdlFailItems = phases.filter(ph=>ph.modelChecks)
    .flatMap(ph=>(ph.modelChecks||[]).filter(c=>mdlR[c.id]==="stop"));

  const totalDmg = Object.values(dmg).reduce((s,v)=>s+(Number(v)||0),0);
  const askNum   = Number(askPrice.replace(/\D/g,""))||0;
  const offer    = askNum>0 ? Math.max(askNum-Math.round(totalDmg*.8),0) : 0;

  // ── Action points for summary ──
  const actionPoints = [...allStops, ...allNotes.slice(0, 3-allStops.length)]
    .filter(Boolean).slice(0,3);

  // ── Save to garage ──
  const saveToGarage = () => {
    const entry = {
      id: Date.now(),
      name: vName,
      make: selMake||custMake,
      model: selModel||custModel,
      date: new Date().toLocaleDateString("de-CH"),
      verdict,
      stops: totalStops,
      notes: totalNotes,
      issues: [...allStops.map(f=>f.text), ...mdlIssues.filter(c=>mdlR[c.id]==="stop").map(c=>c.label)].slice(0,5),
      weaknesses: vData?.weaknesses||[],
    };
    const updated = [entry, ...garage];
    setGarage(updated);
    saveGarage(updated);
    resetSession();
    setScreen("vehicle");
  };

  const delFromGarage = (id) => {
    const updated = garage.filter(g=>g.id!==id);
    setGarage(updated);
    saveGarage(updated);
  };
  const startRename = (g) => { setRenameId(g.id); setRenameVal(g.name); };
  const commitRename = () => {
    if (!renameVal.trim()) { setRenameId(null); return; }
    const updated = garage.map(g=>g.id===renameId?{...g,name:renameVal.trim()}:g);
    setGarage(updated); saveGarage(updated); setRenameId(null);
  };

  const resetSession = () => {
    setFlagR({}); setMdlR({}); setMdlNotes({}); setNoteFor(null); setTipOpen({});
    setAskPrice(""); setDmg({}); setSelMake(null); setSelModel(null);
    setCustMake(""); setCustModel(""); setPhaseIdx(0);
  };

  const startNew = () => { resetSession(); setScreen("vehicle"); };

  // ─── WELCOME ────────────────────────────────────────────────────────────
  // ─── ONBOARD ─────────────────────────────────────────────────────────────
  if (screen==="onboard") {
    const tob = T[obLang];
    return (
      <div className={`app${dark?"":" light-mode"}`}><style>{CSS}</style>
        <div className="wlc">
          <div className="wlc-bg"/><div className="wlc-grid"/>
          <div className="wlc-body">
            <div className="wlc-badge"><div className="wlc-dot"/>CHECKR</div>
            <h1 className="wlc-title">Kein Risiko.<br/><em>Nur Klarheit.</em></h1>

            {obStep==="lang" && (<>
              <p style={{fontSize:14,color:"var(--ink2)",marginBottom:20,lineHeight:1.6}}>
                {tob.onboardLang}
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:28}}>
                {[["de","Deutsch"],["fr","Français"],["en","English"]].map(([code,label])=>(
                  <button key={code}
                    style={{padding:"14px 18px",background:obLang===code?"var(--lime2)":"var(--bg3)",
                      border:`1px solid ${obLang===code?"var(--lime)":"var(--ln2)"}`,
                      borderRadius:12,fontFamily:"var(--fb)",fontSize:15,fontWeight:600,
                      color:obLang===code?"var(--lime)":"var(--ink2)",cursor:"pointer",textAlign:"left",
                      transition:"all .15s"}}
                    onClick={()=>setObLang(code)}>{label}</button>
                ))}
              </div>
              <button className="welcome-start-btn"
                style={{width:"100%",padding:"16px",background:"var(--lime)",color:"#09090B",border:"none",
                  borderRadius:"14px",fontFamily:"var(--fb)",fontSize:"15px",fontWeight:700,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"}}
                onClick={()=>setObStep("name")}>
                {IC.fwd} Weiter
              </button>
            </>)}

            {obStep==="name" && (<>
              <p style={{fontSize:14,color:"var(--ink2)",marginBottom:8,lineHeight:1.6}}>{tob.onboardName}</p>
              <p style={{fontSize:12,color:"var(--ink3)",marginBottom:20}}>{tob.onboardNameHint}</p>
              <input
                style={{width:"100%",padding:"14px 16px",background:"var(--bg3)",border:"1px solid var(--ln2)",
                  borderRadius:12,fontFamily:"var(--fb)",fontSize:18,fontWeight:700,color:"var(--ink)",
                  outline:"none",marginBottom:16}}
                placeholder={tob.onboardNamePlaceholder}
                value={obName}
                onChange={e=>setObName(e.target.value)}
                onFocus={e=>e.target.style.borderColor="var(--lime)"}
                onBlur={e=>e.target.style.borderColor="var(--ln2)"}
                autoFocus
              />
              <button className="welcome-start-btn"
                style={{width:"100%",padding:"16px",background:"var(--lime)",color:"#09090B",border:"none",
                  borderRadius:"14px",fontFamily:"var(--fb)",fontSize:"15px",fontWeight:700,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"}}
                onClick={()=>{
                  const ob = {name:obName.trim()||"du", lang:obLang};
                  setOnboard(ob); saveOnboard(ob); setScreen("welcome");
                }}>
                {IC.spark} {tob.onboardStart}
              </button>
            </>)}
          </div>
        </div>
      </div>
    );
  }

  // ─── PHASE POPUP ─────────────────────────────────────────────────────────
  const PhasePopup = ({phase, onClose}) => {
    const popup = t.phasePopups[phase.id];
    const msg = popup ? popup(userName) : null;
    if (!msg || !showPopup) return null;
    return (
      <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",
        background:"rgba(0,0,0,.7)",backdropFilter:"blur(8px)"}}>
        <div style={{width:"100%",maxWidth:430,margin:"0 auto",background:"var(--bg2)",
          borderTop:"1px solid var(--ln2)",borderRadius:"20px 20px 0 0",padding:"24px 24px 36px"}}>
          <div style={{width:36,height:4,background:"var(--ln3)",borderRadius:2,margin:"0 auto 20px"}}/>
          <div style={{fontFamily:"var(--fd)",fontSize:13,color:"var(--lime)",marginBottom:10,
            textTransform:"uppercase",letterSpacing:"1px"}}>
            Phase {phases.findIndex(p=>p.id===phase.id)+1} — {phase.label}
          </div>
          <div style={{fontSize:15,lineHeight:1.75,color:"var(--ink)",marginBottom:24}}>{msg}</div>
          <button onClick={onClose}
            style={{width:"100%",padding:"15px",background:"var(--lime)",color:"#09090B",border:"none",
              borderRadius:12,fontFamily:"var(--fb)",fontSize:14,fontWeight:700,cursor:"pointer"}}>
            {t.phasePopupCta}
          </button>
        </div>
      </div>
    );
  };

  if (screen==="welcome") return (
    <div className={`app${dark?"":" light-mode"}`}><style>{CSS}</style>
      <div className="wlc">
        <div className="wlc-bg"/><div className="wlc-grid"/>
        <div className="wlc-body">
          <div className="wlc-badge"><div className="wlc-dot"/>Gebrauchtwagen-Begleitung</div>
          <h1 className="wlc-title">Kein Risiko.<br/><em>Nur Klarheit.</em></h1>
          <p className="wlc-sub">{t.appSub}</p>
          <div className="wlc-how">
            <div className="wlc-how-title">{t.howTitle}</div>
            {t.how.map((txt,i)=>(
              <div className="wlc-how-row" key={i}><div className="wlc-num">{i+1}</div><span>{txt}</span></div>
            ))}
          </div>
          <div className="wlc-disclaimer">
            {t.disclaimer}
          </div>
          <div className="wlc-btns">
            <button className="welcome-start-btn" style={{width:"100%",padding:"16px",background:"var(--lime)",color:"#09090B",border:"none",borderRadius:"14px",fontFamily:"var(--fb)",fontSize:"15px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",transition:"filter .15s"}}
              onClick={()=>setScreen("vehicle")}>
              {IC.spark} Kaufprozess starten
            </button>
            {garage.length>0 && (
              <button className="wlc-garage-btn" onClick={()=>setScreen("garage")}>
                {IC.car} Meine Autos
                <span className="garage-count">{garage.length}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── VEHICLE ─────────────────────────────────────────────────────────────
  if (screen==="vehicle") return (
    <div className={`app${dark?"":" light-mode"}`}><style>{CSS}</style>
      <div className="vpk">
        <div className="vpk-hdr">
          <div className="step-lbl">Fahrzeug wählen</div>
          <div className="vpk-title">Welches Auto?</div>
          <div className="vpk-sub">Für bekannte Modelle laden wir automatisch die häufigsten Schwachstellen.</div>
        </div>
        <div className="vpk-body">
          <div className="pk-lbl">Marke</div>
          <div className="pk-grid">
            {makes.map(m=>(
              <button key={m} className={`pk-btn${selMake===m?" sel":""}`}
                onClick={()=>{setSelMake(m);setSelModel(null);}}>{m}</button>
            ))}
          </div>
          {selMake && (<>
            <div className="pk-lbl">Modell</div>
            {models.map(m=>{
              const d=MODELS[selMake][m];
              return (
                <button key={m} className={`pk-model${selModel===m?" sel":""}`} onClick={()=>setSelModel(m)}>
                  <div className="pk-model-name">{m}</div>
                  <div className="pk-model-yr">{d.years}</div>
                </button>
              );
            })}
            <div className="pk-lbl" style={{marginTop:16}}>Modell nicht dabei?</div>
            <input className="cust-inp" placeholder={`${selMake} Modell eingeben`} value={custModel} onChange={e=>setCustModel(e.target.value)}/>
          </>)}
          {!selMake && (<>
            <div className="pk-lbl" style={{marginTop:20}}>Oder manuell eingeben</div>
            <input className="cust-inp" placeholder="Marke" value={custMake} onChange={e=>setCustMake(e.target.value)} style={{marginBottom:8}}/>
            <input className="cust-inp" placeholder="Modell" value={custModel} onChange={e=>setCustModel(e.target.value)}/>
          </>)}
          <button className="skip-lnk" onClick={()=>{ setPhaseIdx(0); setScreen("phase"); }}>
            Ohne Modell fortfahren
          </button>
          <div style={{height:20}}/>
        </div>
        <div className="bbar">
          <button className="btn btn-g btn-icon" onClick={()=>setScreen("welcome")}>{IC.back}</button>
          <button className="btn btn-p"
            disabled={!(selModel||(custMake&&custModel)||(selMake&&custModel))}
            onClick={()=>{ setPhaseIdx(0); setShowPopup(true); setScreen("phase"); }}>
            Los geht's {IC.fwd}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── PHASE END (between phases) ──────────────────────────────────────────
  // ─── PHASE ───────────────────────────────────────────────────────────────
  if (screen==="phase") {
    const ph = curPhase;
    const allPh = phaseAllFlags(ph);
    const totalInPh = allPh.length+(ph.modelChecks?.length||0);
    const doneInPh  = phaseAnswered(ph);
    const critFlags = allPh.filter(f=>f.crit);
    const nonCritGroups = ph.groups.map(g=>({...g,flags:g.flags.filter(f=>!f.crit)})).filter(g=>g.flags.length>0);

    return (
      <div className={`app${dark?"":" light-mode"}`}><style>{CSS}</style>
        <div className="ph-screen">
          <div className="topbar">
            <button onClick={()=>setDark(d=>!d)} style={{background:"none",border:"1px solid var(--ln2)",borderRadius:8,padding:"5px 10px",color:"var(--ink2)",fontSize:13,cursor:"pointer",fontFamily:"var(--fb)"}}>
              {dark?"☀️":"🌙"}
            </button>
            <div className="tb-back" onClick={()=>{ if(phaseIdx===0) setScreen("vehicle"); else { setPhaseIdx(i=>i-1); } }}>
              {IC.back} <span>{phaseIdx===0?"Fahrzeug":phases[phaseIdx-1].label}</span>
            </div>
            <div className="tb-dots">
              {phases.map((_,i)=>(
                <div key={i} className={`tb-dot ${i<phaseIdx?"done":i===phaseIdx?"active":"todo"}`}/>
              ))}
            </div>
          </div>

          <PhasePopup phase={ph} onClose={()=>setShowPopup(false)}/>
          <div className="ph-scroll" ref={scrollRef}>
            <div className="ph-intro">
              <div className="ph-eyebrow">Phase {phaseIdx+1} / {phases.length} — {ph.label}</div>
              <div className="ph-title">{ph.label}</div>
              <div className="ph-short">{ph.short}</div>
              <div className="ph-text">{ph.intro}</div>
              {ph.optional && (
                <div className="ph-optional-badge">{IC.info} Diese Phase kannst du überspringen</div>
              )}
            </div>

            {/* Critical flags first */}
            {critFlags.length>0 && (
              <div className="crit-section">
                <div className="crit-title">Wichtigste Punkte zuerst</div>
                {critFlags.map(flag=>(
                  <FlagCard key={flag.id} flag={flag} result={flagR[flag.id]} tipOpen={tipOpen[flag.id]}
                    onToggleTip={()=>toggleTip(flag.id)} onSet={(v)=>setFlag(flag.id,v)}/>
                ))}
              </div>
            )}

            {/* Model banner + checks */}
            {vData && (ph.id==="besichtigung"||ph.id==="probefahrt") && (
              <div className="mdl-banner">
                <div className="mdl-banner-top">
                  <div className="mdl-banner-name">{vName}</div>
                  <div className="mdl-banner-yr">{vData.years}</div>
                </div>
                <div className="mdl-tags">
                  {vData.weaknesses.map((w,i)=><span key={i} className="mdl-tag">{w}</span>)}
                </div>
              </div>
            )}
            {ph.modelChecks && ph.modelChecks.length>0 && (
              <div className="mdl-checks">
                <div className="mdl-checks-title">
                  {vData ? `${vName} — Bekannte Schwachstellen` : "Allgemeine Fahrzeug-Checks"}
                </div>
                {ph.modelChecks.map(c=>(
                  <div className={`mdl-card${c.crit?" crit":""}`} key={c.id}>
                    <div className="mdl-card-row">
                      <div className="mdl-card-lbl">{c.label}</div>
                      {c.crit && <div className="mdl-crit-dot"/>}
                    </div>
                    <div className="mdl-btns">
                      <button className={`mdl-btn${mdlR[c.id]==="ok"?" ok":""}`} onClick={()=>setMdl(c.id,"ok")}>{IC.chk} OK</button>
                      <button className={`mdl-btn${mdlR[c.id]==="note"?" note":""}`} onClick={()=>setMdl(c.id,"note")}>{IC.warn} Auffällig</button>
                      <button className={`mdl-btn${mdlR[c.id]==="stop"?" stop":""}`} onClick={()=>setMdl(c.id,"stop")}>{IC.x} Kritisch</button>
                    </div>
                    {(noteFor===c.id||mdlNotes[c.id])
                      ? <textarea className="mdl-note" rows={2} placeholder="Notiz..."
                          value={mdlNotes[c.id]||""} onChange={e=>setMdlNotes(n=>({...n,[c.id]:e.target.value}))}
                          onFocus={()=>setNoteFor(c.id)}/>
                      : (mdlR[c.id]==="note"||mdlR[c.id]==="stop") &&
                        <button className="mdl-note-btn" onClick={()=>setNoteFor(c.id)}>{IC.info} Notiz</button>
                    }
                  </div>
                ))}
              </div>
            )}

            {/* Non-critical grouped flags */}
            {nonCritGroups.map(group=>(
              <div className="grp-section" key={group.label}>
                <div className="grp-title">{group.label}</div>
                {group.flags.map(flag=>(
                  <FlagCard key={flag.id} flag={flag} result={flagR[flag.id]} tipOpen={tipOpen[flag.id]}
                    onToggleTip={()=>toggleTip(flag.id)} onSet={(v)=>setFlag(flag.id,v)}/>
                ))}
              </div>
            ))}

            <div className="spacer"/>
          </div>

          <div className="bbar">
            <div className="bbar-info">
              <span className="bbar-count">{doneInPh}/{totalInPh}</span>
            </div>
            <button className="btn btn-p" onClick={()=>{
              const isLast = phaseIdx === phases.length-1;
              if(isLast){ setScreen("summary"); }
              else { setPhaseIdx(i=>i+1); setShowPopup(true); setScreen("phase"); }
            }}>
              {phaseIdx === phases.length-1 ? `Auswertung ${IC.fwd}` : `Weiter ${IC.fwd}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── SUMMARY ─────────────────────────────────────────────────────────────
  if (screen==="summary") return (
    <div className={`app${dark?"":" light-mode"}`}><style>{CSS}</style>
      <div className="sum">
        <div className="topbar">
          <div className="tb-back" onClick={()=>{ setPhaseIdx(phases.length-1); setScreen("phase"); }}>{IC.back} Zurück</div>
          <span style={{fontSize:12,color:"var(--lime)",fontWeight:700}}>Auswertung</span>
        </div>
        <div className="sum-scroll" ref={scrollRef}>
          <div className="sum-verdict">
            <div className={`sv-ring ${VDICT[verdict].cls}`}>
              {verdict==="go"?"GO":verdict==="warn"?"!":"STOP"}
            </div>
            <div className="sv-title">{VDICT[verdict].label}</div>
            <div className="sv-desc">{VDICT[verdict].desc}</div>
            <div className="sv-chips">
              {totalStops>0 && <span className="sv-chip sv-chip-red">{IC.x} {totalStops} Abbruchgrund{totalStops>1?"e":""}</span>}
              {totalNotes>0 && <span className="sv-chip sv-chip-amr">{IC.warn} {totalNotes} Auffällig{totalNotes>1?"e":""}</span>}
              {totalStops===0&&totalNotes===0 && <span className="sv-chip sv-chip-grn">{IC.chk} Alles OK</span>}
            </div>
          </div>

          <div className="sum-stats">
            <div className="ss-card"><div className="ss-n" style={{color:"var(--red)"}}>{totalStops}</div><div className="ss-l">Stopp</div></div>
            <div className="ss-card"><div className="ss-n" style={{color:"var(--amr)"}}>{totalNotes}</div><div className="ss-l">Auffällig</div></div>
            <div className="ss-card"><div className="ss-n" style={{color:"var(--lime)"}}>{phases.filter(ph=>phaseAnswered(ph)>0).length}</div><div className="ss-l">Phasen</div></div>
          </div>

          {actionPoints.length>0 && (
            <div className="sum-sec">
              <div className="sum-sec-hd">Jetzt klären</div>
              {actionPoints.map(f=>(
                <div className="sum-item" key={f.id}>
                  <div className={`si-ico ${flagR[f.id]==="stop"?"red":"amr"}`}>{flagR[f.id]==="stop"?"!":"·"}</div>
                  <div><div className="si-txt">{f.text}</div><div className="si-phase">{f.phase}</div></div>
                </div>
              ))}
            </div>
          )}

          {allStops.length>0 && (
            <div className="sum-sec">
              <div className="sum-sec-hd">Alle Abbruchgründe</div>
              {allStops.map(f=>(
                <div className="sum-item" key={f.id}>
                  <div className="si-ico red">!</div>
                  <div><div className="si-txt">{f.text}</div><div className="si-phase">{f.phase}</div></div>
                </div>
              ))}
            </div>
          )}

          {allNotes.length>0 && (
            <div className="sum-sec">
              <div className="sum-sec-hd">Auffällige Punkte</div>
              {allNotes.map(f=>(
                <div className="sum-item" key={f.id}>
                  <div className="si-ico amr">·</div>
                  <div><div className="si-txt">{f.text}</div><div className="si-phase">{f.phase}</div></div>
                </div>
              ))}
            </div>
          )}

          {mdlIssues.length>0 && (
            <div className="sum-sec">
              <div className="sum-sec-hd">Fahrzeug-Mängel — {vName}</div>
              {mdlIssues.map(c=>(
                <div className="sum-item" key={c.id}>
                  <div className={`si-ico ${mdlR[c.id]==="stop"?"red":"amr"}`}>{mdlR[c.id]==="stop"?"!":"·"}</div>
                  <div style={{flex:1}}>
                    <div className="si-txt">{c.label}</div>
                    {mdlNotes[c.id]&&<div className="si-note">"{mdlNotes[c.id]}"</div>}
                    <div className="si-phase">{c.phase}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mdlFailItems.length>0 && (<>
            <div className="sum-sec"><div className="sum-sec-hd">Kosten schätzen</div></div>
            <div className="calc-sec">
              <div className="calc-card">
                <div className="calc-title">Reparaturkosten</div>
                {mdlFailItems.map(c=>(
                  <div className="calc-row" key={c.id}>
                    <div className="calc-lbl">{c.label.split(":")[0].trim().slice(0,36)}</div>
                    <input type="number" className="calc-inp" placeholder="CHF"
                      value={dmg[c.id]||""} onChange={e=>setDmg(d=>({...d,[c.id]:e.target.value}))}/>
                  </div>
                ))}
                {totalDmg>0 && (
                  <div className="calc-total"><span className="ct-l">Gesamt</span><span className="ct-v">CHF {totalDmg.toLocaleString("de-CH")}</span></div>
                )}
              </div>
              {totalDmg>0&&(<>
                <div className="ask-lbl">Verlangter Preis (CHF)</div>
                <input type="text" className="ask-inp" placeholder="z.B. 28500" value={askPrice} onChange={e=>setAskPrice(e.target.value)}/>
                {askNum>0&&(
                  <div className="neg-card">
                    <div className="neg-hd">Verhandlungsempfehlung</div>
                    <div className="neg-prices">
                      <span className="neg-ask">CHF {askNum.toLocaleString("de-CH")}</span>
                      <span className="neg-offer">CHF {offer.toLocaleString("de-CH")}</span>
                      <span className="neg-save">–{(askNum-offer).toLocaleString("de-CH")}</span>
                    </div>
                    <div className="neg-body">
                      <strong>Einstieg bei CHF {Math.round(offer*.97).toLocaleString("de-CH")}.</strong>{" "}
                      „{mdlFails} Mängel dokumentiert, Reparaturkosten CHF {totalDmg.toLocaleString("de-CH")}. Bei CHF {offer.toLocaleString("de-CH")} sind wir einig."
                    </div>
                  </div>
                )}
              </>)}
            </div>
          </>)}

          <div className="next-box">
            <div className="nb-hd">Nächster Schritt</div>
            <div className="nb-body">
              {verdict==="stop" && <><strong>Abbrechen oder externe Begutachtung.</strong> Mit so vielen kritischen Punkten empfehlen wir diesen Kauf nicht weiterzuführen.</>}
              {verdict==="warn" && <><strong>Offene Punkte klären.</strong> Alle markierten Punkte direkt beim Händler ansprechen und schriftlich im Kaufvertrag festhalten.</>}
              {verdict==="go"   && <><strong>Gutes Zeichen.</strong> Kaufvertrag sorgfältig lesen. Alle bekannten Punkte schriftlich in den Vertrag aufnehmen.</>}
            </div>
          </div>

          <div className="sum-disclaimer">
            CHECKR ersetzt keine professionelle Begutachtung durch eine Fachperson oder einen DEKRA/TCS-Stützpunkt. Alle Einschätzungen sind unverbindlich.
          </div>

          <div className="save-btn-row">
            <button className="save-btn" onClick={saveToGarage}>
              {IC.save} Speichern & nächstes Auto prüfen
            </button>
          </div>
          <div className="save-note">Auto wird gespeichert — du kannst es danach mit anderen vergleichen.</div>

          <div className="spacer"/>
        </div>

        <div className="bbar">
          <button className="btn btn-g" onClick={()=>{ resetSession(); setScreen("welcome"); }}>{IC.reset}</button>
          <button className="btn btn-p" onClick={saveToGarage}>{IC.save} Speichern</button>
        </div>
      </div>
    </div>
  );

  // ─── GARAGE ──────────────────────────────────────────────────────────────
  if (screen==="garage") return (
    <div className={`app${dark?"":" light-mode"}`}><style>{CSS}</style>
      <div className="garage">
        <div className="topbar">
          <div className="tb-back" onClick={()=>setScreen("welcome")}>{IC.back} Start</div>
          <span style={{fontSize:12,color:"var(--lime)",fontWeight:700}}>Meine Autos ({garage.length})</span>
        </div>
        <div className="garage-scroll" ref={scrollRef}>
          {garage.length===0 ? (
            <div className="garage-empty">
              <div className="garage-empty-icon">🚗</div>
              <div>Noch keine Autos gespeichert.</div>
            </div>
          ) : garage.map(g=>(
            <div className="garage-card" key={g.id}>
              <div className="gc-top">
                <div className={`gc-verdict ${VDICT[g.verdict].gcls}`}>
                  {g.verdict==="go"?"GO":g.verdict==="warn"?"!":"STOP"}
                </div>
                <div className="gc-info">
                  {renameId===g.id ? (
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={e=>setRenameVal(e.target.value)}
                        onKeyDown={e=>{if(e.key==="Enter")commitRename();if(e.key==="Escape")setRenameId(null);}}
                        style={{flex:1,background:"var(--bg4)",border:"1px solid var(--lime)",borderRadius:7,
                          padding:"4px 8px",fontSize:13,color:"var(--ink)",fontFamily:"var(--fb)",outline:"none"}}
                      />
                      <button onClick={commitRename}
                        style={{background:"var(--lime)",color:"#09090B",border:"none",borderRadius:7,
                          padding:"4px 10px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"var(--fb)"}}>
                        OK
                      </button>
                      <button onClick={()=>setRenameId(null)}
                        style={{background:"var(--bg5)",color:"var(--ink2)",border:"1px solid var(--ln2)",borderRadius:7,
                          padding:"4px 8px",fontSize:12,cursor:"pointer",fontFamily:"var(--fb)"}}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="gc-name" onClick={()=>startRename(g)} style={{cursor:"pointer"}}
                      title="Tippen zum Umbenennen">
                      {g.name} <span style={{fontSize:10,color:"var(--ink3)",marginLeft:4}}>✎</span>
                    </div>
                  )}
                  <div className="gc-meta">{g.date}</div>
                  <div className="gc-chips">
                    {g.stops>0&&<span className="gc-chip gc-chip-red">{g.stops} Stopp</span>}
                    {g.notes>0&&<span className="gc-chip gc-chip-amr">{g.notes} Auffällig</span>}
                    {g.stops===0&&g.notes===0&&<span className="gc-chip gc-chip-grn">Alles OK</span>}
                  </div>
                </div>
                <button className="gc-del" onClick={()=>delFromGarage(g.id)}>{IC.trash}</button>
              </div>
              {g.issues.length>0&&(
                <div className="gc-bottom">
                  {g.issues.slice(0,2).map((iss,i)=>(
                    <span key={i} className="gc-tag">{iss.slice(0,30)}{iss.length>30?"...":""}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="spacer"/>
        </div>
        <div className="bbar">
          {garage.length>=2&&(
            <button className="btn btn-g" onClick={()=>setScreen("compare")}>{IC.cmp} Vergleichen</button>
          )}
          <button className="btn btn-p" onClick={startNew}>{IC.plus} Neues Auto</button>
        </div>
      </div>
    </div>
  );

  // ─── COMPARE ─────────────────────────────────────────────────────────────
  if (screen==="compare") {
    const items = selCompare.length >= 2
      ? garage.filter(g=>selCompare.includes(g.id))
      : garage.slice(0,3);

    // Score: lower is better. stops*10 + notes*2 + (incomplete penalty handled by verdict)
    const score = (g) => g.stops*10 + g.notes*2 + (g.verdict==="stop"?20:g.verdict==="warn"?5:0);
    const sorted = [...items].sort((a,b)=>score(a)-score(b));
    const best = sorted[0];
    const allBad = items.every(g=>g.verdict==="stop");

    return (
      <div className={`app${dark?"":" light-mode"}`}><style>{CSS}</style>
        <div className="compare">
          <div className="topbar">
            <div className="tb-back" onClick={()=>setScreen("garage")}>{IC.back} Garage</div>
            <span style={{fontSize:12,color:"var(--lime)",fontWeight:700}}>{t.compareTitle}</span>
          </div>
          <div className="compare-scroll" ref={scrollRef}>

            {/* Recommendation banner */}
            <div style={{margin:"16px 20px 0",padding:"14px 16px",
              background:"linear-gradient(135deg,rgba(200,236,58,.08),rgba(200,236,58,.03))",
              border:"1px solid rgba(200,236,58,.2)",borderRadius:14}}>
              <div style={{fontSize:11,color:"var(--lime)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>
                {t.compareRec(userName)}
              </div>
              <div style={{fontSize:15,fontWeight:700,color:"var(--ink)"}}>
                {allBad ? t.compareRecWarn : t.compareRecBest(best.name)}
              </div>
              {!allBad && best.issues.length===0 && (
                <div style={{fontSize:12,color:"var(--ink3)",marginTop:4}}>Keine Abbruchgründe oder Auffälligkeiten.</div>
              )}
              {!allBad && best.issues.length>0 && (
                <div style={{fontSize:12,color:"var(--ink3)",marginTop:4}}>Trotzdem: {best.issues[0].slice(0,60)}</div>
              )}
            </div>

            {/* Cards */}
            {items.map((g,idx)=>{
              const isBest = !allBad && g.id===best.id;
              const maxScore = Math.max(...items.map(score), 1);
              const pct = Math.max(0, 100 - Math.round((score(g)/maxScore)*80));
              return (
                <div key={g.id} style={{margin:"12px 20px 0",background:"var(--bg2)",
                  border:`1px solid ${isBest?"rgba(200,236,58,.35)":"var(--ln)"}`,
                  borderRadius:16,overflow:"hidden"}}>

                  {isBest && (
                    <div style={{background:"rgba(200,236,58,.12)",padding:"6px 14px",
                      fontSize:10,color:"var(--lime)",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px"}}>
                      Beste Wahl
                    </div>
                  )}

                  {/* Header */}
                  <div style={{padding:"14px 14px 10px",display:"flex",alignItems:"center",gap:12}}>
                    <div className={`gc-verdict ${VDICT[g.verdict].gcls}`} style={{width:44,height:44,flexShrink:0}}>
                      {g.verdict==="go"?"GO":g.verdict==="warn"?"!":"NO"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:15,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{g.name}</div>
                      <div style={{fontSize:11,color:"var(--ink3)",marginTop:2}}>{g.date} · {VDICT[g.verdict].label}</div>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div style={{padding:"0 14px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--ink3)",marginBottom:5}}>
                      <span>Bewertung</span>
                      <span style={{fontWeight:700,color:pct>=70?"var(--grn)":pct>=40?"var(--amr)":"var(--red)"}}>{pct}%</span>
                    </div>
                    <div style={{height:6,background:"var(--ln2)",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,borderRadius:3,transition:"width .4s",
                        background:pct>=70?"var(--grn)":pct>=40?"var(--amr)":"var(--red)"}}/>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderTop:"1px solid var(--ln)"}}>
                    {[
                      {l:"Abbruch",v:g.stops,c:g.stops>0?"var(--red)":"var(--grn)"},
                      {l:"Auffällig",v:g.notes,c:g.notes>0?"var(--amr)":"var(--grn)"},
                      {l:"Urteil",v:VDICT[g.verdict].label,c:g.verdict==="go"?"var(--grn)":g.verdict==="warn"?"var(--amr)":"var(--red)"},
                    ].map(({l,v,c})=>(
                      <div key={l} style={{padding:"10px 8px",textAlign:"center",borderRight:"1px solid var(--ln)"}}>
                        <div style={{fontSize:13,fontWeight:700,color:c}}>{v}</div>
                        <div style={{fontSize:10,color:"var(--ink3)",marginTop:2}}>{l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Issues */}
                  {g.issues.length>0 && (
                    <div style={{padding:"10px 14px 14px"}}>
                      {g.issues.slice(0,3).map((iss,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:5}}>
                          <span style={{color:"var(--red)",fontSize:11,marginTop:1,flexShrink:0}}>·</span>
                          <span style={{fontSize:11,color:"var(--ink3)",lineHeight:1.5}}>{iss.slice(0,60)}{iss.length>60?"...":""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {garage.length>3 && (
              <div style={{padding:"12px 20px",fontSize:11,color:"var(--ink3)",textAlign:"center"}}>
                {selCompare.length>=2 ? `${selCompare.length} Autos ausgewählt` : "Die 3 neuesten Autos werden verglichen."}
              </div>
            )}
            <div className="spacer"/>
          </div>
          <div className="bbar">
            <button className="btn btn-g" onClick={()=>setScreen("garage")}>{IC.back}</button>
            <button className="btn btn-p" onClick={()=>{ resetSession(); setScreen("vehicle"); }}>{IC.plus} {t.newAuto}</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// ─── FLAG CARD COMPONENT ──────────────────────────────────────────────────────
function FlagCard({ flag, result, tipOpen, onToggleTip, onSet }) {
  return (
    <div className="flag-card">
      <div className="fc-top">
        <div className={`fc-bar${flag.crit?" crit":""}`}/>
        <div className="fc-text">{flag.text}</div>
      </div>
      <button className="fc-tip-btn" onClick={onToggleTip}>
        {tipOpen ? "▲ Ausblenden" : "▼ Was bedeutet das?"}
      </button>
      {tipOpen && <div className="fc-tip">{flag.tip}</div>}
      <div className="fc-actions">
        <button className={`fca${result==="ok"?" ok":""}`}   onClick={()=>onSet("ok")}>Alles gut</button>
        <button className={`fca${result==="note"?" note":""}`} onClick={()=>onSet("note")}>Auffällig</button>
        <button className={`fca${result==="stop"?" stop":""}`} onClick={()=>onSet("stop")}>Kritisch</button>
        <button className={`fca${result==="skip"?" skip":""}`} onClick={()=>onSet("skip")}>—</button>
      </div>
    </div>
  );
}
