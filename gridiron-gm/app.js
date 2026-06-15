(() => {
  "use strict";

  const LEGACY_SAVE_KEY = "detroit-wolverines-gm-save-v2";
  const LEAGUE_INDEX_KEY = "gridiron-gm-league-index-v1";
  const LEAGUE_SAVE_PREFIX = "gridiron-gm-league-";
  const DB_NAME = "gridiron-gm-db-v1";
  const DB_STORE = "leagues";
  const CURRENT_YEAR = 2026;
  const BASE_CAP = 301.2;
  const USER_TEAM_ID = "DET";

  const POSITIONS = ["QB", "RB", "WR", "TE", "T", "OG", "C", "DE", "DT", "LB", "CB", "S", "K", "P"];
  const DEPTH_NEEDS = { QB: 2, RB: 3, WR: 5, TE: 2, T: 3, OG: 3, C: 2, DE: 3, DT: 3, LB: 4, CB: 4, S: 3, K: 1, P: 1 };
  const ROSTER_PLAN = { QB: 3, RB: 4, WR: 7, TE: 3, T: 4, OG: 4, C: 2, DE: 4, DT: 4, LB: 6, CB: 6, S: 4, K: 1, P: 1 };
  const POSITION_VALUE = { QB: 1.95, RB: 0.78, WR: 1.2, TE: 0.82, T: 1.18, OG: 0.76, C: 0.72, DE: 1.28, DT: 1.04, LB: 0.92, CB: 1.18, S: 0.82, K: 0.18, P: 0.13 };
  const REGRESSION_AGES = { QB: 34, RB: 28, WR: 30, TE: 31, T: 32, OG: 31, C: 32, DE: 31, DT: 31, LB: 30, CB: 30, S: 31, K: 36, P: 37 };
  const ROOKIE_SCALE = [7.2, 4.2, 2.35, 1.45, 1.05, 0.92, 0.84];
  const MAX_ROSTER = 53;
  const TEAM_TARGET_OVR = {
    KC: 91.5, BAL: 89.5, SF: 89, PHI: 88.5,
    BUF: 86.5, CIN: 86, DAL: 85, HOU: 85, LAR: 84, GB: 83.5, MIA: 83.5, LAC: 82.5,
    MIN: 81.5, PIT: 81, SEA: 80.5, TB: 80.5, WAS: 80, ATL: 79.5, DEN: 79, CHI: 78.5, ARI: 78, JAX: 77.5, LV: 77, IND: 76.5,
    NYJ: 75.5, NE: 75, CLE: 74.5, NO: 74, TEN: 73, CAR: 72, NYG: 72,
    DET: 68.8
  };
  const ROSTER_SLOT_OFFSETS = {
    QB: [2, -12, -21],
    RB: [-3, -9, -17, -24],
    WR: [0, -4, -9, -15, -20, -25, -29],
    TE: [-4, -12, -21],
    T: [0, -5, -15, -23],
    OG: [-2, -7, -16, -24],
    C: [-3, -14],
    DE: [0, -5, -14, -22],
    DT: [-1, -6, -15, -23],
    LB: [-2, -6, -10, -17, -23, -27],
    CB: [0, -4, -9, -16, -22, -26],
    S: [-2, -7, -16, -24],
    K: [-8],
    P: [-10]
  };
  const PREMIUM_POSITIONS = new Set(["QB", "WR", "T", "DE", "DT", "CB"]);

  const TEAM_DEFS = [
    ["ARI", "Arizona", "Cardinals", "NFC", "West", "#97233f", false, "hot", 0.82],
    ["ATL", "Atlanta", "Falcons", "NFC", "South", "#a71930", true, "warm", 0.91],
    ["CAR", "Carolina", "Panthers", "NFC", "South", "#0085ca", false, "warm", 0.86],
    ["CHI", "Chicago", "Bears", "NFC", "North", "#0b162a", false, "cold", 1.03],
    ["DAL", "Dallas", "Cowboys", "NFC", "East", "#003594", true, "warm", 1.25],
    ["DET", "Detroit", "Wolverines", "NFC", "North", "#0f766e", true, "cold", 1.0],
    ["GB", "Green Bay", "Packers", "NFC", "North", "#203731", false, "cold", 0.95],
    ["LAR", "Los Angeles", "Rams", "NFC", "West", "#003594", true, "mild", 1.13],
    ["MIN", "Minnesota", "Vikings", "NFC", "North", "#4f2683", true, "cold", 0.98],
    ["NO", "New Orleans", "Saints", "NFC", "South", "#9f8958", true, "warm", 0.9],
    ["NYG", "New York", "Giants", "NFC", "East", "#0b2265", false, "cold", 1.2],
    ["PHI", "Philadelphia", "Eagles", "NFC", "East", "#004c54", false, "cold", 1.12],
    ["SEA", "Seattle", "Seahawks", "NFC", "West", "#002244", false, "rain", 1.01],
    ["SF", "San Francisco", "49ers", "NFC", "West", "#aa0000", false, "mild", 1.15],
    ["TB", "Tampa Bay", "Buccaneers", "NFC", "South", "#d50a0a", false, "hot", 0.94],
    ["WAS", "Washington", "Commanders", "NFC", "East", "#5a1414", false, "mixed", 1.07],
    ["BAL", "Baltimore", "Ravens", "AFC", "North", "#241773", false, "mixed", 0.99],
    ["BUF", "Buffalo", "Bills", "AFC", "East", "#00338d", false, "cold", 0.97],
    ["CIN", "Cincinnati", "Bengals", "AFC", "North", "#fb4f14", false, "mixed", 0.92],
    ["CLE", "Cleveland", "Browns", "AFC", "North", "#311d00", false, "cold", 0.9],
    ["DEN", "Denver", "Broncos", "AFC", "West", "#fb4f14", false, "cold", 1.02],
    ["HOU", "Houston", "Texans", "AFC", "South", "#03202f", true, "hot", 1.0],
    ["IND", "Indianapolis", "Colts", "AFC", "South", "#002c5f", true, "mixed", 0.89],
    ["JAX", "Jacksonville", "Jaguars", "AFC", "South", "#006778", false, "hot", 0.84],
    ["KC", "Kansas City", "Chiefs", "AFC", "West", "#e31837", false, "mixed", 1.04],
    ["LAC", "Los Angeles", "Chargers", "AFC", "West", "#0080c6", true, "mild", 1.08],
    ["LV", "Las Vegas", "Raiders", "AFC", "West", "#000000", true, "hot", 1.06],
    ["MIA", "Miami", "Dolphins", "AFC", "East", "#008e97", false, "hot", 1.08],
    ["NE", "New England", "Patriots", "AFC", "East", "#002244", false, "cold", 1.08],
    ["NYJ", "New York", "Jets", "AFC", "East", "#125740", false, "cold", 1.16],
    ["PIT", "Pittsburgh", "Steelers", "AFC", "North", "#ffb612", false, "cold", 0.98],
    ["TEN", "Tennessee", "Titans", "AFC", "South", "#4b92db", false, "warm", 0.87],
  ];

  const FIRST_NAMES = ["Aiden", "Andre", "Axel", "Bishop", "Brady", "Bryce", "Caleb", "Cam", "Carter", "Cedric", "Chance", "Cole", "Darius", "Dawson", "DeShawn", "Dominic", "Eli", "Emmett", "Ezekiel", "Felix", "Gavin", "Grant", "Hayes", "Isaiah", "Jalen", "Jamal", "Jaxon", "Jonah", "Jordan", "Kai", "Keenan", "Khalil", "Landon", "Leo", "Malik", "Marcus", "Mason", "Micah", "Miles", "Nico", "Noah", "Owen", "Parker", "Quentin", "Rashad", "Roman", "Silas", "Tariq", "Theo", "Tobias", "Trent", "Ty", "Victor", "Wesley", "Xavier", "Zion"];
  const LAST_NAMES = ["Abbott", "Banks", "Bennett", "Blackwell", "Brooks", "Bryant", "Carter", "Chandler", "Coleman", "Collins", "Daniels", "Davenport", "Dawkins", "Ellis", "Fields", "Foster", "Garrett", "Gibson", "Graves", "Hampton", "Harris", "Hayes", "Holland", "Irving", "Jackson", "Jefferson", "Johnson", "King", "Knight", "Lawson", "Lewis", "Marshall", "Mason", "McCoy", "Mitchell", "Morrison", "Owens", "Parker", "Patterson", "Porter", "Reed", "Rhodes", "Russell", "Sanders", "Sims", "Stone", "Sullivan", "Taylor", "Thomas", "Walker", "Wallace", "Ward", "Watkins", "White", "Williams", "Wilson", "Young"];
  const COLLEGES = ["Alabama", "Georgia", "Ohio State", "Michigan", "Texas", "USC", "Oregon", "LSU", "Penn State", "Notre Dame", "Clemson", "Florida State", "Miami", "Tennessee", "Oklahoma", "Washington", "Iowa", "Wisconsin", "Utah", "Ole Miss", "Auburn", "TCU", "Boise State", "North Carolina", "Virginia Tech", "Kansas State", "Colorado", "Arizona State", "UCLA", "Missouri"];
  const INJURIES = [
    ["ankle sprain", 1, 4, 0.2], ["hamstring strain", 1, 5, 0.18], ["shoulder sprain", 1, 5, 0.12],
    ["concussion", 1, 3, 0.12], ["knee sprain", 2, 8, 0.12], ["high ankle sprain", 3, 7, 0.09],
    ["broken hand", 3, 7, 0.05], ["MCL sprain", 4, 10, 0.05], ["torn meniscus", 6, 14, 0.035],
    ["fractured collarbone", 7, 12, 0.02], ["Achilles tear", 24, 42, 0.01], ["ACL tear", 28, 48, 0.015]
  ];

  const TABS = [
    ["dashboard", "Dashboard"], ["roster", "Roster"], ["depth", "Depth Chart"], ["players", "Players"],
    ["schedule", "Schedule"], ["standings", "Standings"], ["stats", "Stats"], ["draft", "Draft"],
    ["freeAgency", "Free Agency"], ["trades", "Trades"], ["finance", "Finance"], ["records", "Records"],
    ["awards", "Awards"], ["settings", "Settings"]
  ];

  const app = document.getElementById("app");
  let state = null;
  let ui = {
    screen: "hub",
    tab: "dashboard",
    selectedPlayerId: null,
    profileOpen: false,
    rosterPos: "ALL",
    playerSearch: "",
    playerSort: "ovr",
    playerScope: "all",
    historyYear: "ALL",
    scheduleWeek: 1,
    selectedGameId: null,
    draftYear: CURRENT_YEAR + 1,
    draftSort: "rank",
    selectedProspectId: null,
    tradePartner: "CHI",
    tradeMine: new Set(),
    tradeTheirs: new Set(),
    toast: "",
    newLeagueName: "",
    importText: ""
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits = 0) {
    const f = 10 ** digits;
    return Math.round(value * f) / f;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function chance(probability) {
    return Math.random() < probability;
  }

  function pick(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function gaussian(mean = 0, sd = 1) {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededUnit(seed) {
    return (hashString(seed) % 1000000) / 1000000;
  }

  function seededGaussian(seed, mean = 0, sd = 1) {
    const u = Math.max(0.000001, seededUnit(`${seed}:u`));
    const v = Math.max(0.000001, seededUnit(`${seed}:v`));
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function id(prefix, nextKey) {
    state[nextKey] += 1;
    return `${prefix}${state[nextKey]}`;
  }

  function newLeagueId() {
    return `lg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function leagueSaveKey(leagueId) {
    return `${LEAGUE_SAVE_PREFIX}${leagueId}`;
  }

  let dbPromise = null;

  function openLeagueDb() {
    if (!("indexedDB" in window)) return Promise.resolve(null);
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }

  function pruneLocalLeaguePayloads() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) keys.push(localStorage.key(i));
    keys.filter(key => key && (key.startsWith(LEAGUE_SAVE_PREFIX) || key === LEGACY_SAVE_KEY)).forEach(key => localStorage.removeItem(key));
  }

  async function saveLeaguePayload(leagueId, packed) {
    const db = await openLeagueDb();
    if (!db) {
      localStorage.setItem(leagueSaveKey(leagueId), JSON.stringify(packed));
      return;
    }
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put({ id: leagueId, packed, updatedAt: Date.now() });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    localStorage.removeItem(leagueSaveKey(leagueId));
  }

  async function loadLeaguePayload(leagueId) {
    const db = await openLeagueDb();
    if (db) {
      const record = await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readonly");
        const request = tx.objectStore(DB_STORE).get(leagueId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      if (record?.packed) return record.packed;
    }
    const raw = localStorage.getItem(leagueSaveKey(leagueId));
    return raw ? JSON.parse(raw) : null;
  }

  async function deleteLeaguePayload(leagueId) {
    const db = await openLeagueDb();
    if (db) {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).delete(leagueId);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    }
    localStorage.removeItem(leagueSaveKey(leagueId));
  }

  async function migrateLocalLeaguePayloads() {
    for (const league of loadLeagueIndex()) {
      const key = leagueSaveKey(league.id);
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        await saveLeaguePayload(league.id, JSON.parse(raw));
        localStorage.removeItem(key);
      } catch (error) {
        console.error(error);
      }
    }
  }

  function loadLeagueIndex() {
    try {
      return JSON.parse(localStorage.getItem(LEAGUE_INDEX_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveLeagueIndex(index) {
    try {
      localStorage.setItem(LEAGUE_INDEX_KEY, JSON.stringify(index));
    } catch {
      pruneLocalLeaguePayloads();
      localStorage.setItem(LEAGUE_INDEX_KEY, JSON.stringify(index));
    }
  }

  function leagueMetaFromState() {
    const team = state ? getTeam(USER_TEAM_ID) : null;
    return {
      id: state.leagueId,
      name: state.leagueName || "Detroit Wolverines League",
      year: state.year,
      phase: phaseLabel(),
      record: team ? `${team.wins}-${team.losses}${team.ties ? `-${team.ties}` : ""}` : "0-0",
      updatedAt: Date.now()
    };
  }

  function upsertLeagueIndex(meta) {
    const index = loadLeagueIndex().filter(item => item.id !== meta.id);
    index.unshift(meta);
    saveLeagueIndex(index);
  }

  function confirmAction(message) {
    return window.confirm(message);
  }

  function money(value) {
    const sign = value < 0 ? "-" : "";
    return `${sign}$${Math.abs(value).toFixed(Math.abs(value) >= 10 ? 1 : 2)}M`;
  }

  function pct(value) {
    return `${Math.round(value * 100)}%`;
  }

  function playerName(player) {
    return `${player.firstName} ${player.lastName}`;
  }

  function teamName(team) {
    return `${team.city} ${team.name}`;
  }

  function getTeam(teamId) {
    return state.teams.find(team => team.id === teamId);
  }

  function getPlayer(playerId) {
    return state.players.find(player => player.id === playerId) || state.freeAgents.find(player => player.id === playerId) || (state.retiredPlayers || []).find(player => player.id === playerId);
  }

  function getProspect(playerId) {
    for (const draftClass of Object.values(state.draftClasses)) {
      const found = draftClass.find(player => player.id === playerId);
      if (found) return found;
    }
    return null;
  }

  function teamPlayers(teamId) {
    return state.players.filter(player => player.teamId === teamId);
  }

  function allKnownPlayers() {
    return state.players.concat(state.freeAgents, state.retiredPlayers || []);
  }

  function playerIsRetired(player) {
    return !!player && (state.retiredPlayers || []).some(retired => retired.id === player.id);
  }

  function playerStatus(player) {
    if (playerIsRetired(player)) return "Retired";
    return getTeam(player.teamId)?.abbr || "FA";
  }

  function salaryCap(year = state.year) {
    return round(BASE_CAP * (1.055 ** (year - CURRENT_YEAR)), 1);
  }

  function currentYearIndex(player, year = state.year) {
    if (!player.contract) return -1;
    const index = year - player.contract.startYear;
    return index >= 0 && index < player.contract.years ? index : -1;
  }

  function capHit(player, year = state.year) {
    const idx = currentYearIndex(player, year);
    if (idx < 0) return 0;
    const proration = idx < player.contract.bonusYears ? player.contract.signingBonus / player.contract.bonusYears : 0;
    return player.contract.salaries[idx] + proration;
  }

  function remainingContractValue(player, year = state.year) {
    const idx = currentYearIndex(player, year);
    if (idx < 0) return 0;
    return player.contract.salaries.slice(idx).reduce((sum, value) => sum + value, 0);
  }

  function avgRemainingSalary(player, year = state.year) {
    const idx = currentYearIndex(player, year);
    if (idx < 0) return 0;
    const salaries = player.contract.salaries.slice(idx);
    return salaries.reduce((sum, value) => sum + value, 0) / salaries.length;
  }

  function deadCapIfRelease(player, year = state.year, postJune = false) {
    const idx = currentYearIndex(player, year);
    if (idx < 0) return { current: 0, next: 0 };
    const proration = player.contract.signingBonus / player.contract.bonusYears;
    let remainingBonus = 0;
    for (let i = idx; i < player.contract.bonusYears; i += 1) remainingBonus += proration;
    let guaranteedCurrent = 0;
    let guaranteedFuture = 0;
    for (let i = idx; i < player.contract.salaries.length; i += 1) {
      const guaranteed = player.contract.guaranteed[i] || 0;
      if (i === idx) guaranteedCurrent += guaranteed;
      else guaranteedFuture += guaranteed;
    }
    if (postJune) {
      const currentBonus = idx < player.contract.bonusYears ? proration : 0;
      return { current: currentBonus + guaranteedCurrent, next: remainingBonus - currentBonus + guaranteedFuture };
    }
    return { current: remainingBonus + guaranteedCurrent + guaranteedFuture, next: 0 };
  }

  function deadCapIfTrade(player, year = state.year) {
    const idx = currentYearIndex(player, year);
    if (idx < 0) return 0;
    const proration = player.contract.signingBonus / player.contract.bonusYears;
    let remainingBonus = 0;
    for (let i = idx; i < player.contract.bonusYears; i += 1) remainingBonus += proration;
    return remainingBonus;
  }

  function teamPayroll(teamId, year = state.year) {
    const roster = teamPlayers(teamId);
    return roster.reduce((sum, player) => sum + capHit(player, year), 0);
  }

  function teamDeadCap(teamId, year = state.year) {
    const team = getTeam(teamId);
    return team.deadCap[String(year)] || 0;
  }

  function teamCapUsed(teamId, year = state.year) {
    return teamPayroll(teamId, year) + teamDeadCap(teamId, year);
  }

  function capSpace(teamId, year = state.year) {
    return salaryCap(year) - teamCapUsed(teamId, year);
  }

  function contractSummary(player) {
    if (playerIsRetired(player)) return "Retired";
    if (!player.contract) return "FA";
    const idx = currentYearIndex(player);
    if (idx < 0) return "Expired";
    return `${player.contract.years - idx}y/${money(remainingContractValue(player))}`;
  }

  function blankStats() {
    return {
      games: 0, passAtt: 0, passCmp: 0, passYds: 0, passTd: 0, int: 0,
      rushAtt: 0, rushYds: 0, rushTd: 0, rec: 0, recYds: 0, recTd: 0,
      tackles: 0, tfl: 0, sacks: 0, defInt: 0, ff: 0, fg: 0, fga: 0,
      xp: 0, pAvg: 0, punts: 0
    };
  }

  function addStats(target, source) {
    for (const key of Object.keys(blankStats())) {
      if (key === "pAvg") continue;
      target[key] = (target[key] || 0) + (source[key] || 0);
    }
    if ((target.punts || 0) > 0) {
      target.pAvg = round(((target.pAvg || 0) + (source.pAvg || 0)) / 2, 1);
    }
  }

  function createNewLeague(name = "") {
    state = {
      version: 1,
      leagueId: newLeagueId(),
      leagueName: name || `Detroit Rebuild ${new Date().toLocaleDateString()}`,
      year: CURRENT_YEAR,
      phase: "regular",
      week: 1,
      playoffRound: "",
      currentDraft: null,
      nextPlayerId: 0,
      nextGameId: 0,
      teams: [],
      players: [],
      freeAgents: [],
      draftClasses: {},
      schedule: [],
      games: [],
      awardsHistory: [],
      retiredPlayers: [],
      records: initialRecords(),
      news: [],
      gm: { teamId: USER_TEAM_ID, jobSecurity: 72, seasons: 0, fired: false },
      lastAdvance: Date.now()
    };

    state.teams = TEAM_DEFS.map((teamDef, index) => makeTeam(teamDef, index));
    for (const team of state.teams) {
      generateRoster(team);
      buildDepthChart(team.id);
      assignStarterContracts(team.id);
    }
    generateFreeAgents(170);
    for (let year = CURRENT_YEAR + 1; year <= CURRENT_YEAR + 3; year += 1) {
      state.draftClasses[String(year)] = generateDraftClass(year);
    }
    state.schedule = buildSeasonSchedule();
    resetSeasonStats();
    addNews("League created", "Offseason training, free agency, and roster setup are complete. Week 1 is ready.");
  }

  function makeTeam(teamDef, index) {
    const [idValue, city, name, conf, div, color, dome, climate, market] = teamDef;
    const targetOverall = TEAM_TARGET_OVR[idValue] || 78;
    return {
      id: idValue,
      city,
      name,
      abbr: idValue,
      conf,
      div,
      color,
      dome,
      climate,
      market,
      qualitySeed: (targetOverall - 78) / 6,
      targetOverall,
      cash: idValue === USER_TEAM_ID ? round(185 + rand(-12, 12), 1) : round(235 + market * 55 + rand(-24, 24), 1),
      facilities: {
        stadium: idValue === USER_TEAM_ID ? 4 : randInt(3, 7),
        scouting: idValue === USER_TEAM_ID ? 5 : randInt(3, 7),
        medical: idValue === USER_TEAM_ID ? 4 : randInt(3, 7),
        coaching: idValue === USER_TEAM_ID ? 4 : randInt(3, 8)
      },
      ticketPrice: round(78 + market * 18 + rand(-6, 10), 1),
      wins: 0,
      losses: 0,
      ties: 0,
      pf: 0,
      pa: 0,
      streak: "",
      deadCap: {},
      draftPicks: createDefaultPicks(idValue),
      depthChart: {},
      retiredPending: [],
      finances: { revenue: 0, expenses: 0, profit: 0 },
      owner: { patience: randInt(45, 75), expectations: index % 7 === 0 ? "playoffs" : "steady" }
    };
  }

  function createDefaultPicks(teamId) {
    const picks = [];
    for (let year = CURRENT_YEAR + 1; year <= CURRENT_YEAR + 3; year += 1) {
      for (let roundValue = 1; roundValue <= 7; roundValue += 1) {
        picks.push({ year, round: roundValue, originalTeam: teamId, ownerTeam: teamId, overall: null });
      }
    }
    return picks;
  }

  function generateRoster(team) {
    for (const pos of POSITIONS) {
      const count = ROSTER_PLAN[pos];
      for (let i = 0; i < count; i += 1) {
        const starterLine = i < DEPTH_NEEDS[pos];
        const player = makePlayer(pos, team.id, starterLine, team.targetOverall, null, i);
        state.players.push(player);
      }
    }
  }

  function makePlayer(pos, teamId, starterLine, teamQuality = 76, rookieProfile = null, slotIndex = 0) {
    const age = rookieProfile ? randInt(21, 23) : generateAge(pos, starterLine);
    const yearsPro = Math.max(0, age - randInt(21, 24));
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const base = rookieProfile ? rookieProfile.ovr : generateOverall(pos, starterLine, teamQuality, age, slotIndex);
    const pot = rookieProfile ? rookieProfile.pot : generatePotential(base, age);
    const devTrait = rookieProfile ? rookieProfile.devTrait : devTraitFor(base, pot);
    const ratings = makeRatingsForPosition(pos, base, pot);
    const contract = rookieProfile ? makeRookieContract(rookieProfile.round, rookieProfile.pickInRound, pos, base) : makeContract(pos, base, pot, age);
    return {
      id: id("p", "nextPlayerId"),
      firstName,
      lastName,
      pos,
      age,
      yearsPro,
      teamId,
      college: pick(COLLEGES),
      draftYear: rookieProfile ? state.year : state.year - yearsPro,
      draftPick: rookieProfile ? `${rookieProfile.round}.${rookieProfile.pickInRound}` : (yearsPro > 0 ? `${randInt(1, 7)}.${randInt(1, 32)}` : "UDFA"),
      ratings,
      ovr: ratings.ovr,
      pot,
      truePot: pot,
      devTrait,
      regressionAge: Math.round(gaussian(REGRESSION_AGES[pos], pos === "QB" || pos === "K" || pos === "P" ? 2.6 : 1.8)),
      injury: { status: "Healthy", weeks: 0, history: [], prone: clamp(gaussian(0.08, 0.04) + (pos === "RB" ? 0.05 : 0), 0.02, 0.28) },
      contract,
      stats: { season: blankStats(), career: blankStats(), history: [] },
      awards: [],
      morale: randInt(45, 85),
      hidden: {
        bustGem: rookieProfile ? rookieProfile.bustGem : gaussian(0, 0.5),
        workEthic: clamp(gaussian(0.55, 0.18), 0.1, 0.98)
      }
    };
  }

  function generateAge(pos, starterLine) {
    const peak = REGRESSION_AGES[pos] - (pos === "QB" ? 4 : 3);
    if (starterLine) return clamp(Math.round(gaussian(peak, 4.5)), 22, pos === "QB" || pos === "K" || pos === "P" ? 39 : 35);
    return clamp(Math.round(gaussian(25.5, 3.8)), 21, 35);
  }

  function generateOverall(pos, starterLine, teamQuality, age, slotIndex = 0) {
    const offsets = ROSTER_SLOT_OFFSETS[pos] || [-3, -10, -18];
    const offset = offsets[Math.min(slotIndex, offsets.length - 1)] - Math.max(0, slotIndex - offsets.length + 1) * 2;
    const sd = slotIndex === 0 ? 3.8 : starterLine ? 3.2 : 4.5;
    let value = gaussian(teamQuality + offset, sd);
    const teamBoost = clamp((teamQuality - 78) / 16, -0.65, 0.9);
    const eliteChance = slotIndex === 0 && PREMIUM_POSITIONS.has(pos) ? clamp(0.025 + teamBoost * 0.12, 0.004, 0.13) : clamp(0.008 + teamBoost * 0.035, 0.002, 0.045);
    if (chance(eliteChance)) value += rand(4, teamQuality >= 88 ? 9 : 7);
    if (teamQuality <= 72 && slotIndex === 0 && chance(0.28)) value -= rand(2, 5);
    if (age > REGRESSION_AGES[pos] + 2) value -= rand(2, 7);
    if (pos === "K" || pos === "P") value += rand(-1, 4);
    const max = teamQuality >= 88 && slotIndex === 0 && PREMIUM_POSITIONS.has(pos) ? 98 : teamQuality >= 82 && slotIndex === 0 ? 94 : 89;
    return Math.round(clamp(value, 39, max));
  }

  function generatePotential(ovr, age) {
    let meanGap = 1.5;
    if (age <= 23) meanGap = 7.5;
    else if (age <= 25) meanGap = 5;
    else if (age <= 28) meanGap = 2;
    else if (age <= 31) meanGap = 0;
    else meanGap = -2.5;
    let gap = gaussian(meanGap, age <= 25 ? 4.8 : 3.3);
    if (age <= 24 && chance(0.045)) gap += rand(5, 11);
    if (chance(0.014)) gap += rand(8, 15);
    if (chance(0.13)) gap -= rand(4, 10);
    const capRoll = Math.random();
    let softCap = 83;
    if (capRoll > 0.7) softCap = 88;
    if (capRoll > 0.9) softCap = 92;
    if (capRoll > 0.975) softCap = 99;
    const maxPot = Math.max(ovr, softCap);
    return Math.round(clamp(ovr + gap, Math.max(ovr - (age >= 31 ? 5 : 2), 42), maxPot));
  }

  function devTraitFor(ovr, pot) {
    if (pot >= 97 && ovr >= 83) return "Generational";
    if ((pot >= 93 && ovr >= 78) || ovr >= 92) return "Superstar";
    if ((pot >= 87 && ovr >= 72) || ovr >= 84) return "Star";
    return "Normal";
  }

  function primaryAttrsForPosition(pos) {
    return {
      QB: ["thp", "tha", "awr"],
      RB: ["spd", "agi", "acc", "car", "trk"],
      WR: ["spd", "agi", "acc", "cth", "rr"],
      TE: ["cth", "rr", "rbk", "str"],
      T: ["str", "pbk", "rbk", "awr"],
      OG: ["str", "pbk", "rbk", "awr"],
      C: ["str", "pbk", "rbk", "awr"],
      DE: ["str", "bshed", "pmv", "fmv", "tak"],
      DT: ["str", "bshed", "pmv", "fmv", "tak"],
      LB: ["tak", "bshed", "zon", "spd", "awr"],
      CB: ["spd", "agi", "man", "zon", "prs"],
      S: ["spd", "tak", "zon", "man", "awr"],
      K: ["kpw", "kac", "awr"],
      P: ["kpw", "kac", "awr"]
    }[pos] || ["awr"];
  }

  function makeRatingsForPosition(pos, ovr, pot) {
    const base = {};
    const attrNames = ["spd", "str", "agi", "acc", "awr", "inj", "sta", "tgh", "thp", "tha", "cth", "rr", "car", "trk", "pbk", "rbk", "bshed", "pmv", "fmv", "tak", "man", "zon", "prs", "kpw", "kac"];
    for (const attr of attrNames) base[attr] = Math.round(clamp(gaussian(ovr - 6, 9), 30, 99));
    base.inj = Math.round(clamp(gaussian(78, 10), 45, 99));
    base.sta = Math.round(clamp(gaussian(82, 7), 55, 99));
    base.tgh = Math.round(clamp(gaussian(78, 9), 45, 99));
    const tune = (attrs, bump = 2) => attrs.forEach(attr => { base[attr] = Math.round(clamp(gaussian(ovr + bump, 5.5), 30, 99)); });
    tune(primaryAttrsForPosition(pos), PREMIUM_POSITIONS.has(pos) ? 2.5 : 1.5);
    const current = computeOverall(pos, base);
    const diff = ovr - current;
    for (const attr of primaryAttrsForPosition(pos)) {
      base[attr] = Math.round(clamp(base[attr] + diff, 30, 99));
    }
    base.ovr = computeOverall(pos, base);
    base.pot = pot;
    return base;
  }

  function computeOverall(pos, r) {
    const weighted = {
      QB: r.thp * 0.23 + r.tha * 0.33 + r.awr * 0.22 + r.agi * 0.08 + r.acc * 0.05 + r.sta * 0.04 + r.tgh * 0.05,
      RB: r.spd * 0.18 + r.agi * 0.16 + r.acc * 0.12 + r.car * 0.17 + r.trk * 0.13 + r.awr * 0.12 + r.sta * 0.06 + r.tgh * 0.06,
      WR: r.spd * 0.18 + r.acc * 0.13 + r.agi * 0.12 + r.cth * 0.21 + r.rr * 0.2 + r.awr * 0.1 + r.sta * 0.06,
      TE: r.cth * 0.18 + r.rr * 0.12 + r.rbk * 0.18 + r.str * 0.14 + r.awr * 0.14 + r.spd * 0.1 + r.sta * 0.07 + r.tgh * 0.07,
      T: r.pbk * 0.31 + r.rbk * 0.22 + r.str * 0.18 + r.awr * 0.18 + r.tgh * 0.06 + r.sta * 0.05,
      OG: r.rbk * 0.29 + r.pbk * 0.24 + r.str * 0.21 + r.awr * 0.16 + r.tgh * 0.06 + r.sta * 0.04,
      C: r.awr * 0.25 + r.pbk * 0.25 + r.rbk * 0.22 + r.str * 0.16 + r.tgh * 0.07 + r.sta * 0.05,
      DE: r.fmv * 0.22 + r.pmv * 0.2 + r.bshed * 0.18 + r.tak * 0.14 + r.str * 0.12 + r.spd * 0.08 + r.awr * 0.06,
      DT: r.bshed * 0.24 + r.pmv * 0.18 + r.str * 0.18 + r.tak * 0.16 + r.fmv * 0.11 + r.awr * 0.08 + r.tgh * 0.05,
      LB: r.tak * 0.21 + r.bshed * 0.16 + r.zon * 0.16 + r.spd * 0.13 + r.awr * 0.16 + r.str * 0.08 + r.acc * 0.06 + r.tgh * 0.04,
      CB: r.man * 0.24 + r.zon * 0.18 + r.spd * 0.18 + r.acc * 0.12 + r.prs * 0.12 + r.agi * 0.1 + r.awr * 0.06,
      S: r.zon * 0.2 + r.tak * 0.17 + r.man * 0.13 + r.spd * 0.14 + r.awr * 0.18 + r.acc * 0.08 + r.tgh * 0.05 + r.str * 0.05,
      K: r.kpw * 0.45 + r.kac * 0.43 + r.awr * 0.12,
      P: r.kpw * 0.48 + r.kac * 0.34 + r.awr * 0.18
    }[pos];
    return Math.round(clamp(weighted, 35, 99));
  }

  function updateOverall(player) {
    player.ratings.ovr = computeOverall(player.pos, player.ratings);
    player.ovr = player.ratings.ovr;
  }

  function makeContract(pos, ovr, pot, age) {
    const maxByPos = { QB: 58, RB: 17, WR: 34, TE: 20, T: 29, OG: 22, C: 18, DE: 34, DT: 29, LB: 22, CB: 28, S: 20, K: 5.2, P: 4.2 };
    const minByPos = { QB: 1.1, RB: 0.9, WR: 0.9, TE: 0.9, T: 1.0, OG: 0.95, C: 0.95, DE: 1.0, DT: 1.0, LB: 0.95, CB: 0.95, S: 0.95, K: 0.82, P: 0.82 };
    const valueCurve = (clamp(ovr, 45, 99) - 45) / 54;
    let annual = minByPos[pos] + (maxByPos[pos] - minByPos[pos]) * (valueCurve ** 2.45);
    annual *= 0.88 + Math.max(0, pot - ovr) * 0.008;
    if (age >= REGRESSION_AGES[pos]) annual *= 0.88;
    annual = round(clamp(annual + rand(-0.45, 0.75), minByPos[pos], maxByPos[pos] * 1.05), 2);
    const years = ovr >= 84 ? randInt(3, 5) : ovr >= 72 ? randInt(2, 4) : randInt(1, 3);
    const bonusPct = ovr >= 82 ? rand(0.24, 0.38) : rand(0.08, 0.24);
    const total = annual * years;
    const signingBonus = round(total * bonusPct, 2);
    const baseTotal = total - signingBonus;
    const salaries = [];
    let weightTotal = 0;
    for (let i = 0; i < years; i += 1) weightTotal += 0.92 + i * 0.08;
    for (let i = 0; i < years; i += 1) salaries.push(round(baseTotal * (0.92 + i * 0.08) / weightTotal, 2));
    const guaranteed = salaries.map((salary, i) => i === 0 ? round(salary * (ovr >= 80 ? 0.75 : 0.35), 2) : (i === 1 && ovr >= 86 ? round(salary * 0.35, 2) : 0));
    return { startYear: state.year, years, salaries, signingBonus, bonusYears: Math.min(years, 5), guaranteed };
  }

  function makeRookieContract(roundValue, pickInRound, pos, ovr) {
    const years = roundValue === 1 ? 4 : 4;
    const slot = ROOKIE_SCALE[roundValue - 1] * (roundValue === 1 ? (1.45 - (pickInRound - 1) * 0.018) : (1.12 - (pickInRound - 1) * 0.006));
    const annual = round(clamp(slot + (ovr - 65) * 0.035, 0.78, 11), 2);
    const signingBonus = round(annual * years * (roundValue === 1 ? 0.42 : 0.18), 2);
    const baseTotal = annual * years - signingBonus;
    const salaries = Array.from({ length: years }, (_, i) => round(baseTotal * (0.88 + i * 0.08) / (0.88 + 0.96 + 1.04 + 1.12), 2));
    const guaranteed = salaries.map((salary, i) => round(i === 0 || roundValue === 1 ? salary * 0.75 : salary * 0.2, 2));
    return { startYear: state.year, years, salaries, signingBonus, bonusYears: Math.min(years, 5), guaranteed };
  }

  function assignStarterContracts(teamId) {
    const team = getTeam(teamId);
    let used = teamCapUsed(teamId);
    const targetSpend = salaryCap() * clamp(0.74 + (team.targetOverall - 70) * 0.008, 0.72, 0.94);
    if (used < targetSpend) {
      const scale = targetSpend / Math.max(used, 1);
      for (const player of teamPlayers(teamId)) {
        player.contract.salaries = player.contract.salaries.map(value => round(value * scale, 2));
        player.contract.signingBonus = round(player.contract.signingBonus * scale, 2);
        player.contract.guaranteed = player.contract.guaranteed.map(value => round(value * scale, 2));
      }
      used = teamCapUsed(teamId);
    }
    if (used > salaryCap() * 0.96) {
      const scale = salaryCap() * 0.92 / used;
      for (const player of teamPlayers(teamId)) {
        player.contract.salaries = player.contract.salaries.map(value => round(value * scale, 2));
        player.contract.signingBonus = round(player.contract.signingBonus * scale, 2);
        player.contract.guaranteed = player.contract.guaranteed.map(value => round(value * scale, 2));
      }
    }
  }

  function generateFreeAgents(count) {
    for (let i = 0; i < count; i += 1) {
      const pos = pick(POSITIONS);
      const player = makePlayer(pos, null, chance(0.16), gaussian(-0.2, 1.1));
      player.teamId = null;
      player.contract = null;
      state.freeAgents.push(player);
    }
  }

  function generateDraftClass(year) {
    const classSize = 300;
    const players = [];
    const generational = chance(0.1) ? 1 : 0;
    const blueChips = randInt(2, 5);
    const posPool = ["QB", "RB", "WR", "WR", "TE", "T", "T", "OG", "C", "DE", "DE", "DT", "LB", "LB", "CB", "CB", "S", "K", "P"];
    for (let i = 0; i < classSize; i += 1) {
      const pos = pick(posPool);
      let trueOvr = Math.round(clamp(gaussian(58.5, 7.6), 39, 77));
      let truePot = draftPotential(trueOvr);
      let devTrait = "Normal";
      let bustGem = gaussian(0, 0.7);
      if (i < generational) {
        trueOvr = randInt(78, 84);
        truePot = randInt(96, 99);
        devTrait = "Generational";
        bustGem = rand(1.2, 2.2);
      } else if (i < generational + blueChips) {
        trueOvr = randInt(72, 80);
        truePot = randInt(86, 95);
        devTrait = truePot >= 93 ? "Superstar" : "Star";
        bustGem = rand(0.45, 1.4);
      } else if (chance(0.045)) {
        trueOvr += randInt(2, 7);
        truePot += randInt(6, 13);
        devTrait = truePot >= 88 ? "Star" : "Normal";
        bustGem = rand(0.4, 1.6);
      } else if (chance(0.18)) {
        truePot -= randInt(5, 14);
        bustGem = rand(-1.7, -0.4);
      }
      trueOvr = clamp(trueOvr, 39, 85);
      truePot = clamp(truePot, Math.max(40, trueOvr - 5), 99);
      const prospect = {
        id: `d${year}-${i + 1}`,
        firstName: pick(FIRST_NAMES),
        lastName: pick(LAST_NAMES),
        pos,
        age: randInt(20, 23),
        college: pick(COLLEGES),
        year,
        trueOvr,
        truePot,
        pot: truePot,
        devTrait,
        bustGem,
        ratings: makeRatingsForPosition(pos, trueOvr, truePot),
        combine: makeCombine(pos, trueOvr),
        collegeStats: makeCollegeStats(pos, trueOvr, truePot),
        comp: "",
        rank: 0,
        projectedRound: 7
      };
      players.push(prospect);
    }
    players.sort((a, b) => prospectGrade(b) - prospectGrade(a));
    players.forEach((prospect, index) => {
      prospect.rank = index + 1;
      prospect.projectedRound = clamp(Math.ceil((index + 1) / 32), 1, 7);
      prospect.comp = makePlayerComp(prospect);
    });
    return players;
  }

  function draftPotential(ovr) {
    const capRoll = Math.random();
    let cap = 82;
    if (capRoll > 0.65) cap = 86;
    if (capRoll > 0.87) cap = 90;
    if (capRoll > 0.97) cap = 95;
    return Math.round(clamp(ovr + gaussian(7, 5.5), Math.max(ovr - 4, 39), Math.max(ovr, cap)));
  }

  function prospectGrade(prospect) {
    return prospect.trueOvr * 0.62 + prospect.truePot * 0.38 + POSITION_VALUE[prospect.pos] * 2 + prospect.bustGem * 4;
  }

  function makeCombine(pos, ovr) {
    const speedBase = { QB: 4.82, RB: 4.48, WR: 4.45, TE: 4.68, T: 5.12, OG: 5.2, C: 5.18, DE: 4.73, DT: 4.98, LB: 4.64, CB: 4.43, S: 4.52, K: 4.95, P: 4.98 }[pos];
    const forty = round(clamp(speedBase - (ovr - 65) * 0.006 + gaussian(0, 0.06), 4.22, 5.55), 2);
    const bench = Math.round(clamp(({ QB: 12, RB: 18, WR: 14, TE: 20, T: 27, OG: 29, C: 28, DE: 25, DT: 30, LB: 23, CB: 15, S: 17, K: 10, P: 10 }[pos]) + (ovr - 65) * 0.18 + gaussian(0, 4), 4, 45));
    const vert = Math.round(clamp(({ QB: 31, RB: 36, WR: 37, TE: 34, T: 28, OG: 27, C: 27, DE: 34, DT: 30, LB: 35, CB: 38, S: 37, K: 28, P: 28 }[pos]) + (ovr - 65) * 0.12 + gaussian(0, 3), 20, 46));
    return { forty, bench, vert };
  }

  function makeCollegeStats(pos, ovr, pot) {
    const grade = (ovr + pot) / 2;
    if (pos === "QB") return `${randInt(2600, 4800)} yds, ${randInt(18, 45)} TD, ${randInt(4, 16)} INT`;
    if (pos === "RB") return `${randInt(650, 1900)} rush yds, ${randInt(5, 22)} TD`;
    if (["WR", "TE"].includes(pos)) return `${randInt(420, 1450)} rec yds, ${randInt(3, 17)} TD`;
    if (["T", "OG", "C"].includes(pos)) return `${randInt(4, 14)} pressures allowed, ${randInt(0, 7)} sacks allowed`;
    if (["DE", "DT", "LB"].includes(pos)) return `${randInt(38, 105)} tackles, ${randInt(4, 18)} TFL, ${randInt(1, 14)} sacks`;
    if (["CB", "S"].includes(pos)) return `${randInt(28, 86)} tackles, ${randInt(1, 7)} INT, ${randInt(4, 17)} PBU`;
    if (pos === "K") return `${Math.round(clamp(grade + gaussian(8, 5), 62, 97))}% FG, long ${randInt(45, 62)}`;
    return `${round(rand(42, 49), 1)} punt avg, ${randInt(12, 31)} inside 20`;
  }

  function makePlayerComp(prospect) {
    const comps = state.players.filter(player => player.pos === prospect.pos).sort((a, b) => Math.abs(b.ovr - prospect.trueOvr) - Math.abs(a.ovr - prospect.trueOvr));
    const veteran = comps.length ? pick(comps.slice(0, Math.min(30, comps.length))) : null;
    const styles = ["bigger", "raw", "polished", "faster", "higher-variance", "safer", "more physical"];
    return veteran ? `${pick(styles)} ${playerName(veteran)}` : `${pick(styles)} starter profile`;
  }

  function buildDepthChart(teamId) {
    const team = getTeam(teamId);
    const players = teamPlayers(teamId);
    for (const pos of POSITIONS) {
      team.depthChart[pos] = players.filter(player => player.pos === pos).sort((a, b) => b.ovr - a.ovr).map(player => player.id);
    }
  }

  function resetSeasonStats() {
    for (const team of state.teams) {
      team.wins = 0;
      team.losses = 0;
      team.ties = 0;
      team.pf = 0;
      team.pa = 0;
      team.streak = "";
    }
    for (const player of state.players) {
      player.stats.season = blankStats();
    }
  }

  function buildSeasonSchedule() {
    const teams = state.teams.map(team => team.id);
    const byes = {};
    const byeWeeks = [5, 6, 7, 8, 9, 10, 11, 12];
    const shuffled = shuffle(teams);
    byeWeeks.forEach((week, i) => {
      byes[week] = shuffled.slice(i * 4, i * 4 + 4);
    });

    const pairCounts = {};
    const addPair = (a, b) => {
      const key = [a, b].sort().join("-");
      pairCounts[key] = (pairCounts[key] || 0) + 1;
    };
    const teamsById = Object.fromEntries(state.teams.map(team => [team.id, team]));
    for (const team of state.teams) {
      const divisionOpponents = state.teams.filter(other => other.id !== team.id && other.conf === team.conf && other.div === team.div);
      for (const opponent of divisionOpponents) addPair(team.id, opponent.id);
    }

    const gamesForTeam = Object.fromEntries(teams.map(team => [team, 0]));
    for (const [key, count] of Object.entries(pairCounts)) {
      const [a, b] = key.split("-");
      gamesForTeam[a] += count;
      gamesForTeam[b] += count;
    }
    let guard = 0;
    while (Object.values(gamesForTeam).some(count => count < 17) && guard < 5000) {
      guard += 1;
      const needy = shuffle(teams.filter(team => gamesForTeam[team] < 17));
      for (const teamId of needy) {
        if (gamesForTeam[teamId] >= 17) continue;
        const candidates = shuffle(teams.filter(otherId => {
          if (otherId === teamId || gamesForTeam[otherId] >= 17) return false;
          const key = [teamId, otherId].sort().join("-");
          const maxPair = teamsById[teamId].div === teamsById[otherId].div && teamsById[teamId].conf === teamsById[otherId].conf ? 2 : 1;
          return (pairCounts[key] || 0) < maxPair;
        })).sort((a, b) => {
          const sameConfA = teamsById[a].conf === teamsById[teamId].conf ? 0 : 1;
          const sameConfB = teamsById[b].conf === teamsById[teamId].conf ? 0 : 1;
          return sameConfA - sameConfB;
        });
        if (!candidates.length) continue;
        const opponent = candidates[0];
        addPair(teamId, opponent);
        gamesForTeam[teamId] += 1;
        gamesForTeam[opponent] += 1;
      }
    }

    let matchups = [];
    for (const [key, count] of Object.entries(pairCounts)) {
      const [a, b] = key.split("-");
      for (let i = 0; i < count; i += 1) {
        const home = chance(0.5) ? a : b;
        matchups.push({ homeTeamId: home, awayTeamId: home === a ? b : a });
      }
    }
    matchups = shuffle(matchups).slice(0, 272);

    for (let attempt = 0; attempt < 250; attempt += 1) {
      const schedule = [];
      const remaining = shuffle(matchups);
      let ok = true;
      for (let week = 1; week <= 18; week += 1) {
        const byeSet = new Set(byes[week] || []);
        const used = new Set(byeSet);
        const gamesThisWeek = [];
        let target = (32 - byeSet.size) / 2;
        for (let i = remaining.length - 1; i >= 0 && gamesThisWeek.length < target; i -= 1) {
          const game = remaining[i];
          if (!used.has(game.homeTeamId) && !used.has(game.awayTeamId)) {
            used.add(game.homeTeamId);
            used.add(game.awayTeamId);
            gamesThisWeek.push(game);
            remaining.splice(i, 1);
          }
        }
        for (const game of gamesThisWeek) {
          schedule.push(makeScheduledGame(game.homeTeamId, game.awayTeamId, week));
        }
        if (gamesThisWeek.length < target) {
          ok = false;
          break;
        }
      }
      if (ok && schedule.length === 272) return schedule.sort((a, b) => a.week - b.week);
    }

    return matchups.map((game, index) => makeScheduledGame(game.homeTeamId, game.awayTeamId, (index % 18) + 1));
  }

  function makeScheduledGame(homeTeamId, awayTeamId, week, playoffRound = "") {
    return {
      id: id("g", "nextGameId"),
      year: state.year,
      week,
      phase: playoffRound ? "playoffs" : "regular",
      playoffRound,
      homeTeamId,
      awayTeamId,
      played: false,
      homeScore: null,
      awayScore: null,
      weather: null,
      box: null
    };
  }

  function teamGames(teamId) {
    return state.schedule.filter(game => game.year === state.year && (game.homeTeamId === teamId || game.awayTeamId === teamId));
  }

  function addNews(title, body) {
    state.news.unshift({ title, body, stamp: `${state.year} ${phaseLabel()}` });
    state.news = state.news.slice(0, 80);
  }

  function phaseLabel() {
    if (state.phase === "preseason") return `Preseason W${state.week}`;
    if (state.phase === "regular") return `Week ${state.week}`;
    if (state.phase === "playoffs") return state.playoffRound;
    if (state.phase === "draft") return "Draft";
    if (state.phase === "freeAgency") return "Free Agency";
    if (state.phase === "awards") return "Awards";
    if (state.phase === "offseason") return "Offseason";
    return state.phase;
  }

  function save() {
    if (!state) return Promise.resolve();
    state.updatedAt = Date.now();
    const packed = {
      state,
      ui: { ...ui, screen: "game", tradeMine: Array.from(ui.tradeMine), tradeTheirs: Array.from(ui.tradeTheirs), toast: "", profileOpen: false }
    };
    const meta = leagueMetaFromState();
    return saveLeaguePayload(state.leagueId, packed).then(() => {
      upsertLeagueIndex(meta);
    }).catch(error => {
      console.error(error);
      ui.toast = "Save failed. Browser storage may be blocked.";
    });
  }

  function load() {
    Promise.all([migrateLegacySave(), migrateLocalLeaguePayloads()]).then(() => {
      if (!state && ui.screen === "hub") render();
    });
    state = null;
    ui.screen = "hub";
  }

  async function migrateLegacySave() {
    const index = loadLeagueIndex();
    if (index.length || !localStorage.getItem(LEGACY_SAVE_KEY)) return;
    try {
      const packed = JSON.parse(localStorage.getItem(LEGACY_SAVE_KEY));
      const migratedState = packed.state;
      migratedState.leagueId ||= newLeagueId();
      migratedState.leagueName ||= "Migrated Detroit League";
      migratedState.updatedAt = Date.now();
      const migratedUi = { ...ui, ...(packed.ui || {}), screen: "game", tradeMine: [], tradeTheirs: [], toast: "", profileOpen: false };
      state = migratedState;
      migrateState();
      await saveLeaguePayload(migratedState.leagueId, { state: migratedState, ui: migratedUi });
      upsertLeagueIndex(leagueMetaFromState());
      localStorage.removeItem(LEGACY_SAVE_KEY);
      state = null;
    } catch (error) {
      console.error(error);
    }
  }

  async function loadLeague(leagueId) {
    try {
      const packed = await loadLeaguePayload(leagueId);
      if (!packed) {
        ui.toast = "League save was not found.";
        render();
        return;
      }
      state = packed.state;
      ui = {
        ...ui,
        ...(packed.ui || {}),
        screen: "game",
        tradeMine: new Set(packed.ui?.tradeMine || []),
        tradeTheirs: new Set(packed.ui?.tradeTheirs || []),
        toast: "",
        profileOpen: false
      };
      migrateState();
      await save();
      render();
    } catch (error) {
      console.error(error);
      ui.toast = "League failed to load.";
      render();
    }
  }

  async function deleteLeague(leagueId) {
    const index = loadLeagueIndex().filter(item => item.id !== leagueId);
    saveLeagueIndex(index);
    await deleteLeaguePayload(leagueId);
    if (state?.leagueId === leagueId) state = null;
    ui.screen = "hub";
    render();
  }

  async function importLeagueFromText() {
    try {
      const importedState = JSON.parse(ui.importText);
      state = importedState.state ? importedState.state : importedState;
      state.leagueId = newLeagueId();
      state.leagueName = ui.newLeagueName.trim() || state.leagueName || "Imported Detroit League";
      migrateState();
      ui.screen = "game";
      ui.tab = "dashboard";
      ui.tradeMine = new Set();
      ui.tradeTheirs = new Set();
      ui.profileOpen = false;
      await save();
      ui.toast = "Imported league.";
      render();
    } catch {
      ui.toast = "Import failed.";
      state = null;
      ui.screen = "hub";
      render();
    }
  }

  function migrateState() {
    state.leagueId ||= newLeagueId();
    state.leagueName ||= "Detroit Wolverines League";
    state.retiredPlayers ||= [];
    for (const team of state.teams) {
      team.retiredPending ||= [];
      team.finances ||= { revenue: 0, expenses: 0, profit: 0 };
      team.owner ||= { patience: 55, expectations: "steady" };
      team.deadCap ||= {};
      for (const year of Object.keys(team.deadCap)) team.deadCap[year] = Number(team.deadCap[year]) || 0;
    }
    for (const player of state.players.concat(state.freeAgents)) {
      player.injury ||= { status: "Healthy", weeks: 0, history: [], prone: 0.08 };
      player.injury.history ||= [];
      player.awards ||= [];
      player.stats ||= { season: blankStats(), career: blankStats(), history: [] };
      player.stats.season ||= blankStats();
      player.stats.career ||= blankStats();
      player.stats.history ||= [];
      if (player.contract) {
        player.contract.bonusYears ||= Math.min(player.contract.years, 5);
        player.contract.guaranteed ||= player.contract.salaries.map((salary, i) => i === 0 ? salary * 0.25 : 0);
      }
    }
  }

  function advance() {
    if (state.gm.fired) {
      ui.toast = "Ownership has already fired you.";
      render();
      return;
    }
    if (state.phase === "preseason") advancePreseason();
    else if (state.phase === "regular") advanceRegularWeek();
    else if (state.phase === "playoffs") advancePlayoffs();
    else if (state.phase === "awards") completeAwards();
    else if (state.phase === "freeAgency") autoFreeAgencyThenDraft();
    else if (state.phase === "draft") simDraftPickOrAdvance();
    else if (state.phase === "offseason") startNextSeason();
    state.lastAdvance = Date.now();
    save();
    render();
  }

  function advancePreseason() {
    preseasonTraining();
    if (state.week < 3) {
      state.week += 1;
      addNews("Preseason work", "Coaches made minor depth-chart and development adjustments.");
    } else {
      state.phase = "regular";
      state.week = 1;
      ui.scheduleWeek = 1;
      addNews("Regular season begins", "Final rosters are set and Week 1 is ready.");
    }
  }

  function preseasonTraining() {
    for (const team of state.teams) {
      const coaching = team.facilities.coaching;
      for (const player of teamPlayers(team.id)) {
        if (player.age <= 25 && player.ovr < player.truePot && chance(0.16 + coaching * 0.012)) {
          adjustPlayer(player, rand(0.12, 0.45));
        }
        maybePracticeInjury(player, team);
      }
    }
    tickInjuries();
  }

  function advanceRegularWeek() {
    const games = state.schedule.filter(game => game.year === state.year && game.phase === "regular" && game.week === state.week && !game.played);
    for (const game of games) simulateGame(game);
    applyWeeklyProgression();
    tickInjuries();
    collectWeeklyFinance();
    if (state.week === 10) addNews("Trade deadline", "The deadline has passed. Player trades reopen in the offseason; draft-pick deals remain available during the draft.");
    if (state.week < 18) {
      state.week += 1;
      ui.scheduleWeek = state.week;
    } else {
      createPlayoffBracket();
    }
  }

  function createPlayoffBracket() {
    const seeds = getPlayoffSeeds();
    const games = [];
    for (const conf of ["AFC", "NFC"]) {
      const confSeeds = seeds[conf];
      games.push(makePlayoffGame(confSeeds[1], confSeeds[6], "Wild Card"));
      games.push(makePlayoffGame(confSeeds[2], confSeeds[5], "Wild Card"));
      games.push(makePlayoffGame(confSeeds[3], confSeeds[4], "Wild Card"));
    }
    state.phase = "playoffs";
    state.playoffRound = "Wild Card";
    state.schedule.push(...games);
    addNews("Playoffs set", "Seven teams per conference qualified; top seeds earned first-round byes.");
  }

  function makePlayoffGame(homeTeam, awayTeam, roundName) {
    return makeScheduledGame(homeTeam.id, awayTeam.id, 19 + ["Wild Card", "Divisional", "Conference", "Super Bowl"].indexOf(roundName), roundName);
  }

  function advancePlayoffs() {
    const roundName = state.playoffRound;
    const games = state.schedule.filter(game => game.year === state.year && game.phase === "playoffs" && game.playoffRound === roundName && !game.played);
    for (const game of games) simulateGame(game);
    const winners = games.map(game => game.homeScore >= game.awayScore ? game.homeTeamId : game.awayTeamId);
    if (roundName === "Wild Card") {
      const seeds = getPlayoffSeeds();
      const newGames = [];
      for (const conf of ["AFC", "NFC"]) {
        const alive = winners.filter(idValue => getTeam(idValue).conf === conf).map(idValue => seeds[conf].findIndex(team => team.id === idValue) + 1).sort((a, b) => a - b);
        const topSeed = seeds[conf][0];
        const lowestWinner = seeds[conf][alive[alive.length - 1] - 1];
        const otherWinners = alive.slice(0, -1).map(seed => seeds[conf][seed - 1]);
        newGames.push(makePlayoffGame(topSeed, lowestWinner, "Divisional"));
        newGames.push(makePlayoffGame(otherWinners[0], otherWinners[1], "Divisional"));
      }
      state.schedule.push(...newGames);
      state.playoffRound = "Divisional";
    } else if (roundName === "Divisional") {
      const newGames = [];
      for (const conf of ["AFC", "NFC"]) {
        const confWinners = winners.filter(idValue => getTeam(idValue).conf === conf).map(getTeam).sort(compareTeams);
        newGames.push(makePlayoffGame(confWinners[0], confWinners[1], "Conference"));
      }
      state.schedule.push(...newGames);
      state.playoffRound = "Conference";
    } else if (roundName === "Conference") {
      const finalists = winners.map(getTeam);
      state.schedule.push(makePlayoffGame(finalists[0], finalists[1], "Super Bowl"));
      state.playoffRound = "Super Bowl";
    } else {
      const superBowl = games[0];
      const championId = superBowl.homeScore >= superBowl.awayScore ? superBowl.homeTeamId : superBowl.awayTeamId;
      const mvp = pick((superBowl.box?.home.players || []).concat(superBowl.box?.away.players || []).filter(line => line.passTd || line.rushTd || line.recTd || line.sacks || line.defInt));
      if (mvp) awardPlayer(mvp.playerId, "SB MVP");
      addNews("Champion crowned", `${teamName(getTeam(championId))} won the Super Bowl.`);
      state.phase = "awards";
      state.playoffRound = "";
      decideAwards(championId);
    }
    tickInjuries();
  }

  function completeAwards() {
    processRetirements();
    offseasonProgression();
    expireContracts();
    evaluateGM();
    state.phase = "freeAgency";
    state.week = 0;
    addNews("Offseason opens", "Free agency is active. The draft room is next.");
  }

  function autoFreeAgencyThenDraft() {
    aiFreeAgency();
    setupDraft();
    state.phase = "draft";
    ui.tab = "draft";
  }

  function simDraftPickOrAdvance() {
    if (!state.currentDraft || state.currentDraft.complete) {
      state.phase = "offseason";
      addNews("Draft complete", "Rookies signed four-year contracts and joined their new teams.");
      return;
    }
    const pickInfo = currentPickInfo();
    if (!pickInfo) {
      finishDraft();
      return;
    }
    if (pickInfo.ownerTeam === USER_TEAM_ID) {
      ui.toast = "Detroit is on the clock.";
      ui.tab = "draft";
      return;
    }
    aiMakePick(pickInfo);
    if (!currentPickInfo()) finishDraft();
  }

  function startNextSeason() {
    state.year += 1;
    state.phase = "regular";
    state.week = 1;
    state.playoffRound = "";
    state.currentDraft = null;
    resetSeasonStats();
    ensureFutureDraftClasses();
    ensureFuturePicks();
    state.schedule = state.schedule.filter(game => game.year < state.year - 1);
    state.schedule.push(...buildSeasonSchedule());
    for (const team of state.teams) buildDepthChart(team.id);
    addNews("New league year", `${state.year} opened after offseason training. Week 1 is ready.`);
  }

  function tickInjuries() {
    for (const player of state.players) {
      if (player.injury.weeks > 0) {
        player.injury.weeks -= 1;
        if (player.injury.weeks <= 0) {
          player.injury.status = "Healthy";
          player.injury.weeks = 0;
        }
      }
    }
  }

  function maybePracticeInjury(player, team) {
    if (player.injury.status !== "Healthy") return;
    const medical = team.facilities.medical;
    const base = (0.0025 + player.injury.prone * 0.004) * (1.12 - player.ratings.inj / 120);
    if (chance(base * (1.12 - medical * 0.035))) injurePlayer(player, team, 0.45);
  }

  function gameInjuryCheck(player, team, usage = 1) {
    if (!player || player.injury.status !== "Healthy") return;
    const positionRisk = { RB: 1.35, WR: 1.08, TE: 1.12, T: 0.9, OG: 0.92, C: 0.88, DE: 1.05, DT: 1.1, LB: 1.18, CB: 1.02, S: 1.12, QB: 0.78, K: 0.22, P: 0.18 }[player.pos] || 1;
    const medical = team.facilities.medical;
    const probability = (0.006 + player.injury.prone * 0.018) * positionRisk * usage * (1.18 - player.ratings.inj / 125) * (1.12 - medical * 0.035);
    if (chance(probability)) injurePlayer(player, team, 1);
  }

  function injurePlayer(player, team, multiplier = 1) {
    const roll = Math.random();
    let cumulative = 0;
    let selected = INJURIES[0];
    for (const injury of INJURIES) {
      cumulative += injury[3];
      if (roll <= cumulative) {
        selected = injury;
        break;
      }
    }
    const [name, minWeeks, maxWeeks] = selected;
    const medicalBonus = 1 - team.facilities.medical * 0.035;
    const weeks = Math.max(1, Math.round(rand(minWeeks, maxWeeks) * multiplier * medicalBonus));
    player.injury.status = name;
    player.injury.weeks = weeks;
    player.injury.history.push({ year: state.year, injury: name, weeks });
    player.injury.history = player.injury.history.slice(-12);
    if (weeks >= 8) player.hidden.bustGem -= 0.08;
    if (team.id === USER_TEAM_ID || player.ovr >= 84) addNews("Injury", `${playerName(player)} (${team.abbr}) will miss about ${weeks} week${weeks === 1 ? "" : "s"} with a ${name}.`);
  }

  function simulateGame(game) {
    const home = getTeam(game.homeTeamId);
    const away = getTeam(game.awayTeamId);
    game.weather = makeWeather(home, game.week);
    const homeProfile = gameProfile(home, away, true, game.weather);
    const awayProfile = gameProfile(away, home, false, game.weather);
    let homeScore = Math.round(clamp(22 + homeProfile.marginEdge * 0.44 + gaussian(0, 7.5), 3, 52));
    let awayScore = Math.round(clamp(21 + awayProfile.marginEdge * 0.44 + gaussian(0, 7.5), 3, 52));
    if (homeScore === awayScore) {
      if (chance(0.5)) homeScore += 3;
      else awayScore += 3;
    }
    game.homeScore = footballizeScore(homeScore);
    game.awayScore = footballizeScore(awayScore);
    game.played = true;
    game.box = buildBoxScore(game, homeProfile, awayProfile);
    applyGameStats(game, homeProfile, awayProfile);
    updateTeamRecords(home, away, game.homeScore, game.awayScore);
    updateRecordsFromGame(game);
    for (const line of game.box.home.players) {
      const player = getPlayer(line.playerId);
      if (player) gameInjuryCheck(player, home, line.usage || 0.8);
    }
    for (const line of game.box.away.players) {
      const player = getPlayer(line.playerId);
      if (player) gameInjuryCheck(player, away, line.usage || 0.8);
    }
  }

  function footballizeScore(score) {
    const common = [0, 3, 6, 7, 10, 13, 14, 16, 17, 20, 21, 23, 24, 27, 28, 30, 31, 34, 35, 38, 41, 42, 45, 48, 51, 52, 55];
    return common.reduce((best, value) => Math.abs(value - score) < Math.abs(best - score) ? value : best, common[0]);
  }

  function makeWeather(team, week) {
    if (team.dome) return { label: "Dome", pass: 1, rush: 1, kick: 1, turnover: 1 };
    const late = week >= 11;
    let label = "Clear";
    let pass = 1;
    let rush = 1;
    let kick = 1;
    let turnover = 1;
    if (team.climate === "rain" && chance(0.38)) {
      label = "Rain";
      pass -= 0.08;
      kick -= 0.04;
      turnover += 0.1;
    } else if (["cold", "mixed"].includes(team.climate) && late && chance(team.climate === "cold" ? 0.34 : 0.18)) {
      label = chance(0.4) ? "Snow" : "Cold wind";
      pass -= label === "Snow" ? 0.12 : 0.06;
      rush += 0.03;
      kick -= label === "Snow" ? 0.1 : 0.06;
      turnover += 0.08;
    } else if (team.climate === "hot" && week <= 5 && chance(0.22)) {
      label = "Heat";
      pass -= 0.02;
      rush -= 0.02;
      turnover += 0.03;
    } else if (chance(0.12)) {
      label = "Wind";
      pass -= 0.06;
      kick -= 0.08;
    }
    return { label, pass, rush, kick, turnover };
  }

  function starters(team, pos, count = 1) {
    const ids = team.depthChart[pos] || [];
    const available = ids.map(getPlayer).filter(player => player && player.injury.status === "Healthy");
    if (available.length >= count) return available.slice(0, count);
    const extras = teamPlayers(team.id).filter(player => player.pos === pos && player.injury.status === "Healthy" && !available.some(p => p.id === player.id)).sort((a, b) => b.ovr - a.ovr);
    return available.concat(extras).slice(0, count);
  }

  function unitRating(team, pos, count) {
    const group = starters(team, pos, count);
    if (!group.length) return 35;
    const weights = [1, 0.82, 0.7, 0.58, 0.48, 0.38, 0.3];
    let totalWeight = 0;
    let total = 0;
    group.forEach((player, index) => {
      const weight = weights[index] || 0.25;
      total += player.ovr * weight;
      totalWeight += weight;
    });
    return total / totalWeight;
  }

  function gameProfile(team, opponent, home, weather) {
    const qb = starters(team, "QB", 1)[0];
    const rb = starters(team, "RB", 2);
    const wr = starters(team, "WR", 3);
    const te = starters(team, "TE", 1)[0];
    const t = unitRating(team, "T", 2);
    const og = unitRating(team, "OG", 2);
    const c = unitRating(team, "C", 1);
    const ol = t * 0.44 + og * 0.36 + c * 0.2;
    const de = unitRating(team, "DE", 2);
    const dt = unitRating(team, "DT", 2);
    const lb = unitRating(team, "LB", 3);
    const cb = unitRating(team, "CB", 3);
    const s = unitRating(team, "S", 2);
    const offense = (qb?.ovr || 45) * 0.31 + unitRating(team, "WR", 3) * 0.17 + unitRating(team, "RB", 2) * 0.1 + (te?.ovr || 55) * 0.06 + ol * 0.23 + team.facilities.coaching * 1.4;
    const defense = de * 0.14 + dt * 0.12 + lb * 0.16 + cb * 0.19 + s * 0.11 + team.facilities.coaching * 1.2 + 18;
    const oppDefense = defensiveRating(opponent);
    const oppOffense = offensiveRating(opponent);
    const topWr = wr[0];
    const topCb = starters(opponent, "CB", 1)[0];
    const wrCb = (topWr?.ovr || 55) - (topCb?.ovr || 55);
    const edgeVsTackle = (unitRating(opponent, "DE", 2) + unitRating(opponent, "DT", 2) * 0.45) - ol;
    const passEdge = ((qb?.ovr || 45) - 70) * 0.42 + wrCb * 0.18 - edgeVsTackle * 0.15 + (weather.pass - 1) * 35;
    const rushEdge = unitRating(team, "RB", 2) * 0.33 + ol * 0.3 - (unitRating(opponent, "DT", 2) * 0.2 + unitRating(opponent, "LB", 3) * 0.24) + (weather.rush - 1) * 24;
    const marginEdge = offense - oppDefense + (defense - oppOffense) * 0.72 + (home ? 2.2 : 0) + (team.facilities.coaching - opponent.facilities.coaching) * 0.55;
    return { team, opponent, home, qb, rb, wr, te, ol, offense, defense, passEdge, rushEdge, marginEdge };
  }

  function offensiveRating(team) {
    const qb = unitRating(team, "QB", 1);
    const skill = unitRating(team, "WR", 3) * 0.46 + unitRating(team, "RB", 2) * 0.27 + unitRating(team, "TE", 1) * 0.12;
    const ol = unitRating(team, "T", 2) * 0.44 + unitRating(team, "OG", 2) * 0.36 + unitRating(team, "C", 1) * 0.2;
    return qb * 0.34 + skill * 0.24 + ol * 0.24 + team.facilities.coaching * 1.3;
  }

  function defensiveRating(team) {
    return unitRating(team, "DE", 2) * 0.15 + unitRating(team, "DT", 2) * 0.14 + unitRating(team, "LB", 3) * 0.19 + unitRating(team, "CB", 3) * 0.21 + unitRating(team, "S", 2) * 0.13 + team.facilities.coaching * 1.2 + 17;
  }

  function buildBoxScore(game, homeProfile, awayProfile) {
    return {
      home: makeTeamBox(homeProfile, game.homeScore, game.awayScore),
      away: makeTeamBox(awayProfile, game.awayScore, game.homeScore),
      summary: `${game.weather.label}, ${teamName(homeProfile.team)} ${game.homeScore}, ${teamName(awayProfile.team)} ${game.awayScore}`
    };
  }

  function makeTeamBox(profile, points, oppPoints) {
    const passHeavy = clamp(0.56 + profile.passEdge * 0.006 + (points < oppPoints ? 0.06 : -0.03), 0.44, 0.68);
    const plays = Math.round(clamp(61 + gaussian(0, 5) + (points + oppPoints - 43) * 0.15, 48, 76));
    const passAtt = Math.round(plays * passHeavy);
    const rushAtt = Math.max(14, plays - passAtt - randInt(0, 3));
    const compRate = clamp(0.61 + profile.passEdge * 0.003 + (profile.qb?.ratings.tha || 60) * 0.0012 - 0.08, 0.48, 0.76);
    const passCmp = Math.round(passAtt * compRate);
    const ypa = clamp(6.5 + profile.passEdge * 0.045 + gaussian(0, 0.75), 4.1, 10.6);
    const passYds = Math.round(passAtt * ypa);
    const passTd = Math.max(0, Math.round(points / 13 + gaussian(0, 0.8) - (profile.rushEdge > 8 ? 0.4 : 0)));
    const interceptions = Math.max(0, Math.round(rand(0, 1.1) + (62 - (profile.qb?.ovr || 55)) * 0.018 - profile.passEdge * 0.01));
    const ypc = clamp(4.1 + profile.rushEdge * 0.025 + gaussian(0, 0.35), 2.7, 6.6);
    const rushYds = Math.round(rushAtt * ypc);
    const rushTd = Math.max(0, Math.round(points / 18 + gaussian(0, 0.65) - passTd * 0.15));
    const sacksAllowed = Math.max(0, Math.round(rand(0, 2.8) + Math.max(0, -profile.passEdge) * 0.055));
    const players = [];
    if (profile.qb) players.push({ playerId: profile.qb.id, passAtt, passCmp, passYds, passTd, int: interceptions, rushAtt: randInt(1, 5), rushYds: randInt(-2, 38), rushTd: chance(0.08) ? 1 : 0, usage: 1 });
    distributeRushing(players, profile.rb, rushAtt, rushYds, rushTd);
    distributeReceiving(players, profile.wr.concat(profile.te ? [profile.te] : []).filter(Boolean), passCmp, passYds, passTd);
    distributeDefense(players, profile.team, sacksAllowed);
    const k = starters(profile.team, "K", 1)[0];
    if (k) {
      const fg = Math.max(0, Math.round((points - passTd * 7 - rushTd * 7) / 3 + rand(-0.5, 0.8)));
      players.push({ playerId: k.id, fg, fga: fg + (chance(0.18) ? 1 : 0), xp: Math.max(0, passTd + rushTd), usage: 0.2 });
    }
    const p = starters(profile.team, "P", 1)[0];
    if (p) players.push({ playerId: p.id, punts: Math.max(1, Math.round(5 - points / 12 + rand(-1, 2))), pAvg: round(rand(42, 51), 1), usage: 0.1 });
    return { points, passAtt, passCmp, passYds, passTd, interceptions, rushAtt, rushYds, rushTd, sacksAllowed, players };
  }

  function distributeRushing(players, backs, rushAtt, rushYds, rushTd) {
    if (!backs.length) return;
    const shares = backs.map((player, i) => Math.max(0.08, (i === 0 ? 0.68 : 0.25) + gaussian(0, 0.04)));
    const total = shares.reduce((sum, value) => sum + value, 0);
    backs.forEach((player, i) => {
      const att = Math.round(rushAtt * shares[i] / total);
      const yds = Math.round(rushYds * shares[i] / total + gaussian(0, 6));
      const td = i === 0 ? Math.max(0, Math.round(rushTd * 0.72)) : Math.max(0, rushTd - Math.round(rushTd * 0.72));
      players.push({ playerId: player.id, rushAtt: att, rushYds: yds, rushTd: td, rec: randInt(0, 4), recYds: randInt(0, 35), usage: 1 });
    });
  }

  function distributeReceiving(players, targets, completions, yards, tds) {
    if (!targets.length) return;
    const baseShares = targets.map((player, index) => {
      const posBoost = player.pos === "WR" ? 1 : 0.76;
      return Math.max(0.06, posBoost * (targets.length - index + 1) + gaussian(0, 0.3));
    });
    const total = baseShares.reduce((sum, value) => sum + value, 0);
    let remainingTd = tds;
    targets.forEach((player, index) => {
      const share = baseShares[index] / total;
      const rec = Math.max(0, Math.round(completions * share + gaussian(0, 1.1)));
      const recYds = Math.max(0, Math.round(yards * share + gaussian(0, 18)));
      const recTd = index === 0 ? Math.min(remainingTd, Math.max(0, Math.round(tds * 0.42 + rand(-0.3, 0.6)))) : (remainingTd > 0 && chance(share * 1.8) ? 1 : 0);
      remainingTd -= recTd;
      players.push({ playerId: player.id, rec, recYds, recTd, usage: 0.88 });
    });
  }

  function distributeDefense(players, team, opponentSacksAllowed) {
    const defenders = ["DE", "DT", "LB", "CB", "S"].flatMap(pos => starters(team, pos, pos === "LB" || pos === "CB" ? 3 : 2));
    for (const defender of defenders) {
      const sackChance = ["DE", "DT", "LB"].includes(defender.pos) ? 0.18 : 0.03;
      const sacks = chance(sackChance) ? round(rand(0.5, 1.5), 1) : 0;
      players.push({
        playerId: defender.id,
        tackles: randInt(defender.pos === "CB" ? 2 : 3, defender.pos === "LB" ? 11 : 8),
        tfl: chance(0.22) ? randInt(1, 2) : 0,
        sacks,
        defInt: ["CB", "S", "LB"].includes(defender.pos) && chance(0.09) ? 1 : 0,
        ff: chance(0.04) ? 1 : 0,
        usage: 0.9
      });
    }
  }

  function applyGameStats(game) {
    for (const side of ["home", "away"]) {
      for (const line of game.box[side].players) {
        const player = getPlayer(line.playerId);
        if (!player) continue;
        const statLine = { ...blankStats(), ...line, games: 1 };
        addStats(player.stats.season, statLine);
        addStats(player.stats.career, statLine);
      }
    }
  }

  function updateTeamRecords(home, away, homeScore, awayScore) {
    home.pf += homeScore;
    home.pa += awayScore;
    away.pf += awayScore;
    away.pa += homeScore;
    if (homeScore > awayScore) {
      home.wins += 1;
      away.losses += 1;
      home.streak = home.streak.startsWith("W") ? `W${Number(home.streak.slice(1)) + 1}` : "W1";
      away.streak = away.streak.startsWith("L") ? `L${Number(away.streak.slice(1)) + 1}` : "L1";
    } else {
      away.wins += 1;
      home.losses += 1;
      away.streak = away.streak.startsWith("W") ? `W${Number(away.streak.slice(1)) + 1}` : "W1";
      home.streak = home.streak.startsWith("L") ? `L${Number(home.streak.slice(1)) + 1}` : "L1";
    }
  }

  function updateRecordsFromGame(game) {
    for (const side of ["home", "away"]) {
      const teamId = side === "home" ? game.homeTeamId : game.awayTeamId;
      for (const line of game.box[side].players) {
        const player = getPlayer(line.playerId);
        if (!player) continue;
        considerRecord("gamePassYds", line.passYds || 0, player, teamId);
        considerRecord("gamePassTd", line.passTd || 0, player, teamId);
        considerRecord("gameRushYds", line.rushYds || 0, player, teamId);
        considerRecord("gameRecYds", line.recYds || 0, player, teamId);
        considerRecord("gameSacks", line.sacks || 0, player, teamId);
        considerRecord("gameDefInt", line.defInt || 0, player, teamId);
      }
    }
  }

  function initialRecords() {
    const names = ["gamePassYds", "gamePassTd", "gameRushYds", "gameRushTd", "gameRecYds", "gameRecTd", "gameSacks", "gameDefInt", "seasonPassYds", "seasonPassTd", "seasonRushYds", "seasonRushTd", "seasonRecYds", "seasonRecTd", "seasonSacks", "seasonDefInt", "careerMvp", "careerTitles"];
    return Object.fromEntries(names.map(name => [name, { value: 0, player: "", team: "", year: CURRENT_YEAR }]));
  }

  function considerRecord(key, value, player, teamId) {
    if (!state.records[key] || value <= state.records[key].value) return;
    state.records[key] = { value: round(value, 1), player: playerName(player), team: getTeam(teamId).abbr, year: state.year };
  }

  function applyWeeklyProgression() {
    for (const team of state.teams) {
      for (const player of teamPlayers(team.id)) {
        if (player.age <= 25 && player.ovr < player.truePot && chance(0.12 + team.facilities.coaching * 0.008)) {
          const production = weeklyProductionScore(player);
          adjustPlayer(player, rand(0.03, 0.18) + production * 0.005);
        } else if (player.age > player.regressionAge && chance(0.05)) {
          adjustPlayer(player, -rand(0.03, 0.13));
        }
      }
    }
  }

  function weeklyProductionScore(player) {
    const s = player.stats.season;
    if (player.pos === "QB") return s.passTd * 0.35 + s.passYds / 950 - s.int * 0.25;
    if (player.pos === "RB") return s.rushYds / 480 + s.rushTd * 0.18;
    if (["WR", "TE"].includes(player.pos)) return s.recYds / 520 + s.recTd * 0.18;
    if (["DE", "DT", "LB"].includes(player.pos)) return s.sacks * 0.23 + s.tfl * 0.08 + s.tackles / 95;
    if (["CB", "S"].includes(player.pos)) return s.defInt * 0.35 + s.tackles / 130;
    return 0;
  }

  function adjustPlayer(player, amount) {
    const attrsByPos = {
      QB: ["thp", "tha", "awr"], RB: ["spd", "agi", "acc", "car", "trk"], WR: ["spd", "cth", "rr", "acc"], TE: ["cth", "rr", "rbk", "str"],
      T: ["pbk", "rbk", "str", "awr"], OG: ["pbk", "rbk", "str", "awr"], C: ["pbk", "rbk", "str", "awr"], DE: ["fmv", "pmv", "bshed", "tak"],
      DT: ["pmv", "bshed", "str", "tak"], LB: ["tak", "bshed", "zon", "awr"], CB: ["man", "zon", "prs", "spd"], S: ["zon", "tak", "man", "awr"],
      K: ["kpw", "kac", "awr"], P: ["kpw", "kac", "awr"]
    }[player.pos];
    const direction = amount >= 0 ? 1 : -1;
    const chancePerAttr = clamp(Math.abs(amount), 0.02, 1);
    for (const attr of attrsByPos) {
      if (chance(chancePerAttr)) player.ratings[attr] = Math.round(clamp(player.ratings[attr] + direction, 30, 99));
    }
    updateOverall(player);
  }

  function collectWeeklyFinance() {
    for (const team of state.teams) {
      const homeGames = state.schedule.filter(game => game.year === state.year && game.week === state.week && game.homeTeamId === team.id && game.played).length;
      const attendance = (0.72 + team.wins * 0.012 + team.facilities.stadium * 0.021 + team.market * 0.05) * 65500;
      const revenue = homeGames * attendance * team.ticketPrice / 1000000 + team.market * 0.9;
      const payrollWeekly = teamPayroll(team.id) / 18;
      const facilityExpense = facilityCost(team) / 18;
      const expense = payrollWeekly + facilityExpense;
      team.cash = round(team.cash + revenue - expense, 2);
      team.finances.revenue = round(team.finances.revenue + revenue, 2);
      team.finances.expenses = round(team.finances.expenses + expense, 2);
      team.finances.profit = round(team.finances.revenue - team.finances.expenses, 2);
    }
  }

  function facilityCost(team) {
    const levels = team.facilities;
    return round((levels.stadium ** 1.55) * 1.4 + (levels.scouting ** 1.5) * 0.9 + (levels.medical ** 1.5) * 1.0 + (levels.coaching ** 1.55) * 1.25, 2);
  }

  function getPlayoffSeeds() {
    const seeds = {};
    for (const conf of ["AFC", "NFC"]) {
      const confTeams = state.teams.filter(team => team.conf === conf);
      const divisionWinners = [];
      for (const div of ["East", "North", "South", "West"]) {
        divisionWinners.push(confTeams.filter(team => team.div === div).sort(compareTeams)[0]);
      }
      const wildCards = confTeams.filter(team => !divisionWinners.includes(team)).sort(compareTeams).slice(0, 3);
      seeds[conf] = divisionWinners.sort(compareTeams).concat(wildCards);
    }
    return seeds;
  }

  function compareTeams(a, b) {
    const winPctA = a.wins / Math.max(1, a.wins + a.losses + a.ties);
    const winPctB = b.wins / Math.max(1, b.wins + b.losses + b.ties);
    if (winPctB !== winPctA) return winPctB - winPctA;
    const diffB = b.pf - b.pa;
    const diffA = a.pf - a.pa;
    if (diffB !== diffA) return diffB - diffA;
    return b.pf - a.pf;
  }

  function decideAwards(championId) {
    const all = state.players.slice();
    const qbs = all.filter(player => player.pos === "QB").sort((a, b) => mvpScore(b) - mvpScore(a));
    const offensive = all.filter(player => ["QB", "RB", "WR", "TE"].includes(player.pos)).sort((a, b) => opoyScore(b) - opoyScore(a));
    const defensive = all.filter(player => ["DE", "DT", "LB", "CB", "S"].includes(player.pos)).sort((a, b) => dpoyScore(b) - dpoyScore(a));
    const rookies = all.filter(player => player.draftYear === state.year);
    const oroy = rookies.filter(player => ["QB", "RB", "WR", "TE"].includes(player.pos)).sort((a, b) => opoyScore(b) - opoyScore(a))[0];
    const droy = rookies.filter(player => ["DE", "DT", "LB", "CB", "S"].includes(player.pos)).sort((a, b) => dpoyScore(b) - dpoyScore(a))[0];
    const awards = [
      ["MVP", qbs[0] || offensive[0]],
      ["OPOY", offensive[0]],
      ["DPOY", defensive[0]],
      ["OROY", oroy],
      ["DROY", droy]
    ];
    for (const [award, player] of awards) if (player) awardPlayer(player.id, award);
    const allPros = [];
    for (const pos of POSITIONS) {
      const count = ["WR", "CB"].includes(pos) ? 3 : (["T", "OG", "DE", "DT", "LB", "S"].includes(pos) ? 2 : 1);
      allPros.push(...all.filter(player => player.pos === pos).sort((a, b) => allProScore(b) - allProScore(a)).slice(0, count));
    }
    for (const player of allPros) awardPlayer(player.id, "All-Pro");
    const proBowlers = [];
    for (const pos of POSITIONS) {
      proBowlers.push(...all.filter(player => player.pos === pos).sort((a, b) => allProScore(b) - allProScore(a)).slice(0, Math.max(2, Math.ceil(DEPTH_NEEDS[pos] / 2))));
    }
    for (const player of proBowlers) awardPlayer(player.id, "Pro Bowl");
    const champion = getTeam(championId);
    state.awardsHistory.unshift({ year: state.year, champion: teamName(champion), awards: awards.filter(item => item[1]).map(([award, player]) => ({ award, playerId: player.id, player: playerName(player), team: getTeam(player.teamId)?.abbr || "FA" })) });
    updateSeasonRecords();
    addNews("Awards announced", `${playerName((qbs[0] || offensive[0]))} won MVP.`);
  }

  function awardPlayer(playerId, award) {
    const player = getPlayer(playerId);
    if (!player) return;
    player.awards.push({ year: state.year, award });
  }

  function mvpScore(player) {
    const s = player.stats.season;
    return s.passYds / 80 + s.passTd * 5 - s.int * 3 + (getTeam(player.teamId)?.wins || 0) * 2 + player.ovr * 0.45;
  }

  function opoyScore(player) {
    const s = player.stats.season;
    return s.passYds / 95 + s.passTd * 4.2 - s.int * 2.5 + s.rushYds / 12 + s.rushTd * 5 + s.recYds / 12 + s.recTd * 5 + player.ovr * 0.35;
  }

  function dpoyScore(player) {
    const s = player.stats.season;
    return s.sacks * 7 + s.defInt * 8 + s.tfl * 2.2 + s.tackles * 0.42 + player.ovr * 0.5;
  }

  function allProScore(player) {
    return player.ovr * 1.6 + opoyScore(player) * 0.35 + dpoyScore(player) * 0.35;
  }

  function updateSeasonRecords() {
    for (const player of state.players) {
      considerRecord("seasonPassYds", player.stats.season.passYds, player, player.teamId);
      considerRecord("seasonPassTd", player.stats.season.passTd, player, player.teamId);
      considerRecord("seasonRushYds", player.stats.season.rushYds, player, player.teamId);
      considerRecord("seasonRushTd", player.stats.season.rushTd, player, player.teamId);
      considerRecord("seasonRecYds", player.stats.season.recYds, player, player.teamId);
      considerRecord("seasonRecTd", player.stats.season.recTd, player, player.teamId);
      considerRecord("seasonSacks", player.stats.season.sacks, player, player.teamId);
      considerRecord("seasonDefInt", player.stats.season.defInt, player, player.teamId);
    }
  }

  function processRetirements() {
    const retired = [];
    for (const player of state.players.slice()) {
      const injuryPenalty = player.injury.history.filter(injury => injury.weeks >= 8).length * 0.07;
      const agePressure = (player.age - REGRESSION_AGES[player.pos]) * 0.08;
      const playingTime = player.stats.season.games < 6 ? 0.08 : 0;
      if (player.age >= 31 && chance(clamp(agePressure + injuryPenalty + playingTime, 0, 0.65))) {
        retired.push(player);
        const team = getTeam(player.teamId);
        if (team) team.retiredPending.push(player.id);
      }
    }
    for (const player of retired) {
      state.players = state.players.filter(item => item.id !== player.id);
      state.retiredPlayers.push(player);
      if (player.teamId === USER_TEAM_ID) {
        addNews("Retirement", `${playerName(player)} retired. Coaching can occasionally convince players to return before next preseason.`);
      }
    }
  }

  function convinceRetirement(playerId) {
    const team = getTeam(USER_TEAM_ID);
    const player = getPlayer(playerId);
    if (!player) return;
    const probability = clamp(0.15 + team.facilities.coaching * 0.055 - Math.max(0, player.age - player.regressionAge) * 0.04, 0.05, 0.72);
    if (chance(probability)) {
      player.teamId = USER_TEAM_ID;
      state.players.push(player);
      state.retiredPlayers = state.retiredPlayers.filter(item => item.id !== playerId);
      team.retiredPending = team.retiredPending.filter(idValue => idValue !== playerId);
      addNews("Retirement reversed", `${playerName(player)} agreed to play one more season.`);
    } else {
      addNews("Retirement final", `${playerName(player)} declined a return.`);
      team.retiredPending = team.retiredPending.filter(idValue => idValue !== playerId);
    }
    save();
    render();
  }

  function offseasonProgression() {
    for (const team of state.teams) {
      const coaching = team.facilities.coaching;
      for (const player of teamPlayers(team.id)) {
        const age = player.age;
        const performance = weeklyProductionScore(player);
        let delta = 0;
        if (age <= 25) delta += rand(0.4, 2.0) + (player.truePot - player.ovr) * 0.09 + coaching * 0.07 + performance * 0.045;
        else if (age <= player.regressionAge) delta += rand(-0.6, 0.9) + Math.max(0, player.truePot - player.ovr) * 0.025 + performance * 0.025;
        else delta -= rand(0.5, 2.4) + (age - player.regressionAge) * rand(0.25, 0.7);
        delta += player.hidden.bustGem * 0.65 + player.hidden.workEthic * 0.5;
        delta -= player.injury.history.filter(injury => injury.year >= state.year - 2).reduce((sum, injury) => sum + injury.weeks, 0) * 0.028;
        const steps = Math.round(Math.abs(delta));
        for (let i = 0; i < steps; i += 1) adjustPlayer(player, delta > 0 ? rand(0.45, 0.9) : -rand(0.45, 0.9));
        player.age += 1;
        player.yearsPro += 1;
        player.stats.history.push({ year: state.year, ...player.stats.season, ovr: player.ovr, team: getTeam(player.teamId)?.abbr || "FA" });
        player.stats.history = player.stats.history.slice(-18);
      }
    }
  }

  function expireContracts() {
    const expired = [];
    for (const player of state.players.slice()) {
      if (currentYearIndex(player, state.year + 1) < 0) expired.push(player);
    }
    for (const player of expired) {
      const team = getTeam(player.teamId);
      player.teamId = null;
      player.contract = null;
      state.players = state.players.filter(item => item.id !== player.id);
      state.freeAgents.push(player);
      if (team?.id === USER_TEAM_ID) addNews("Contract expired", `${playerName(player)} entered free agency.`);
    }
  }

  function evaluateGM() {
    const team = getTeam(USER_TEAM_ID);
    let delta = 0;
    if (team.wins >= 11) delta += 12;
    else if (team.wins >= 9) delta += 6;
    else if (team.wins <= 4) delta -= 14;
    else if (team.wins <= 6) delta -= 7;
    if (team.cash < 0) delta -= 15;
    if (capSpace(USER_TEAM_ID) < -5) delta -= 8;
    state.gm.jobSecurity = clamp(state.gm.jobSecurity + delta, 0, 100);
    state.gm.seasons += 1;
    if (state.gm.jobSecurity <= 0 || team.cash < -75) {
      state.gm.fired = true;
      addNews("Fired", "Ownership ended your tenure after the annual review.");
    } else {
      addNews("GM review", `Ownership set your job security at ${state.gm.jobSecurity}/100.`);
    }
  }

  function aiFreeAgency() {
    for (const team of shuffle(state.teams)) {
      let attempts = 0;
      while (capSpace(team.id) > 8 && teamPlayers(team.id).length < MAX_ROSTER && attempts < 12) {
        attempts += 1;
        const needs = rosterNeeds(team.id);
        const pos = needs[0]?.pos || pick(POSITIONS);
        const candidate = state.freeAgents.filter(player => player.pos === pos).sort((a, b) => b.ovr - a.ovr)[0];
        if (!candidate || estimatedAsk(candidate) > capSpace(team.id) + 3) break;
        signFreeAgent(candidate.id, team.id, false);
      }
    }
  }

  function rosterNeeds(teamId) {
    const counts = Object.fromEntries(POSITIONS.map(pos => [pos, teamPlayers(teamId).filter(player => player.pos === pos).length]));
    return POSITIONS.map(pos => ({ pos, need: ROSTER_PLAN[pos] - counts[pos] })).filter(item => item.need > 0).sort((a, b) => b.need - a.need);
  }

  function estimatedAsk(player) {
    return projectedAnnual(player);
  }

  function projectedAnnual(player) {
    const maxByPos = { QB: 58, RB: 17, WR: 34, TE: 20, T: 29, OG: 22, C: 18, DE: 34, DT: 29, LB: 22, CB: 28, S: 20, K: 5.2, P: 4.2 };
    const minByPos = { QB: 1.1, RB: 0.9, WR: 0.9, TE: 0.9, T: 1.0, OG: 0.95, C: 0.95, DE: 1.0, DT: 1.0, LB: 0.95, CB: 0.95, S: 0.95, K: 0.82, P: 0.82 };
    const valueCurve = (clamp(player.ovr, 45, 99) - 45) / 54;
    let annual = minByPos[player.pos] + (maxByPos[player.pos] - minByPos[player.pos]) * (valueCurve ** 2.45);
    annual *= 0.9 + Math.max(0, player.pot - player.ovr) * 0.008;
    annual *= 1 + player.awards.filter(award => state.year - award.year <= 3).length * 0.018;
    if (player.age >= REGRESSION_AGES[player.pos]) annual *= 0.84;
    if (player.injury.history.filter(injury => injury.year >= state.year - 2).reduce((sum, injury) => sum + injury.weeks, 0) >= 12) annual *= 0.88;
    return round(clamp(annual, minByPos[player.pos], maxByPos[player.pos] * 1.08), 2);
  }

  function extensionOffer(player) {
    const annual = projectedAnnual(player);
    const years = player.ovr >= 86 ? 5 : player.ovr >= 78 ? 4 : player.age >= player.regressionAge ? 2 : 3;
    const bonusPct = player.ovr >= 84 ? 0.34 : player.ovr >= 74 ? 0.24 : 0.12;
    const oldBonus = deadCapIfTrade(player);
    const signingBonus = round(annual * years * bonusPct + oldBonus, 2);
    const baseTotal = annual * years - annual * years * bonusPct;
    const salaries = [];
    let weightTotal = 0;
    for (let i = 0; i < years; i += 1) weightTotal += 0.88 + i * 0.09;
    for (let i = 0; i < years; i += 1) salaries.push(round(baseTotal * (0.88 + i * 0.09) / weightTotal, 2));
    const guaranteed = salaries.map((salary, i) => i === 0 ? round(salary * (player.ovr >= 80 ? 0.7 : 0.3), 2) : (i === 1 && player.ovr >= 88 ? round(salary * 0.28, 2) : 0));
    return { startYear: state.year, years, salaries, signingBonus, bonusYears: Math.min(years, 5), guaranteed };
  }

  function contractAav(contract) {
    return round((contract.salaries.reduce((sum, salary) => sum + salary, 0) + contract.signingBonus) / contract.years, 2);
  }

  function extendPlayer(playerId) {
    const player = getPlayer(playerId);
    if (!player || player.teamId !== USER_TEAM_ID) return;
    const offer = extensionOffer(player);
    if (!confirmAction(`Extend ${playerName(player)} for ${offer.years} years at about ${money(contractAav(offer))} per year?`)) return;
    const spaceBefore = capSpace(USER_TEAM_ID);
    const oldHit = capHit(player);
    const newHit = contractYearHit(offer, 0);
    if (spaceBefore + oldHit - newHit < -1) {
      ui.toast = "That extension would put Detroit over the cap.";
      render();
      return;
    }
    player.contract = offer;
    addNews("Extension signed", `${playerName(player)} signed a ${offer.years}-year extension worth ${money(contractAav(offer))} per year.`);
    save();
    render();
  }

  function signFreeAgent(playerId, teamId = USER_TEAM_ID, noisy = true) {
    const player = state.freeAgents.find(item => item.id === playerId);
    if (!player) return false;
    const team = getTeam(teamId);
    if (teamId === USER_TEAM_ID && noisy && !confirmAction(`Sign ${playerName(player)} (${player.pos}, ${player.ovr} OVR) for an estimated ${money(estimatedAsk(player))} per year?`)) return false;
    if (teamPlayers(teamId).length >= MAX_ROSTER) {
      if (noisy) ui.toast = "Roster is already at 53 players.";
      return false;
    }
    player.contract = makeContract(player.pos, player.ovr, player.pot, player.age);
    if (capSpace(teamId) - capHit(player) < -2) {
      player.contract = null;
      if (noisy) ui.toast = "That signing would put you over the cap.";
      return false;
    }
    player.teamId = teamId;
    state.freeAgents = state.freeAgents.filter(item => item.id !== playerId);
    state.players.push(player);
    buildDepthChart(teamId);
    if (noisy || teamId === USER_TEAM_ID) addNews("Free agent signed", `${team.abbr} signed ${playerName(player)} for ${contractSummary(player)}.`);
    save();
    render();
    return true;
  }

  function setupDraft() {
    assignDraftOrder();
    state.currentDraft = {
      year: state.year + 1,
      round: 1,
      pick: 1,
      overall: 1,
      complete: false,
      selections: []
    };
    ui.draftYear = state.currentDraft.year;
    addNews("Draft room", "The draft is live. Trades can be previewed from the Trades tab.");
  }

  function assignDraftOrder() {
    const order = state.teams.slice().sort((a, b) => {
      const winPctA = a.wins / Math.max(1, a.wins + a.losses);
      const winPctB = b.wins / Math.max(1, b.wins + b.losses);
      if (winPctA !== winPctB) return winPctA - winPctB;
      return (a.pf - a.pa) - (b.pf - b.pa);
    });
    for (const team of state.teams) {
      for (const pickValue of team.draftPicks) {
        if (pickValue.year === state.year + 1) {
          const originalIndex = order.findIndex(item => item.id === pickValue.originalTeam);
          pickValue.overall = (pickValue.round - 1) * 32 + originalIndex + 1;
        }
      }
    }
  }

  function currentPickInfo() {
    if (!state.currentDraft || state.currentDraft.complete) return null;
    const overall = state.currentDraft.overall;
    if (overall > 224) return null;
    const roundValue = Math.ceil(overall / 32);
    const pickInRound = ((overall - 1) % 32) + 1;
    for (const team of state.teams) {
      const pickValue = team.draftPicks.find(item => item.year === state.currentDraft.year && item.overall === overall);
      if (pickValue) return { ...pickValue, ownerTeam: team.id, round: roundValue, pickInRound, overall };
    }
    return { year: state.currentDraft.year, round: roundValue, pickInRound, overall, ownerTeam: draftOrderTeam(overall) };
  }

  function draftOrderTeam(overall) {
    const roundPick = ((overall - 1) % 32);
    const order = state.teams.slice().sort((a, b) => a.wins - b.wins || (a.pf - a.pa) - (b.pf - b.pa));
    return order[roundPick].id;
  }

  function userDraftProspect(prospectId) {
    if (state.phase !== "draft") return;
    const pickInfo = currentPickInfo();
    if (!pickInfo || pickInfo.ownerTeam !== USER_TEAM_ID) {
      ui.toast = "Detroit is not on the clock.";
      render();
      return;
    }
    const prospect = getProspect(prospectId);
    if (prospect && !confirmAction(`Draft ${playerName(prospect)}, ${prospect.pos}, ${prospect.college} at pick ${pickInfo.round}.${pickInfo.pickInRound}?`)) return;
    makeDraftSelection(pickInfo, prospectId);
    save();
    render();
  }

  function aiMakePick(pickInfo) {
    const prospects = state.draftClasses[String(pickInfo.year)];
    const team = getTeam(pickInfo.ownerTeam);
    const needs = rosterNeeds(team.id).map(item => item.pos);
    const best = prospects.slice(0, 40).sort((a, b) => {
      const needA = needs.includes(a.pos) ? 4 : 0;
      const needB = needs.includes(b.pos) ? 4 : 0;
      return prospectGrade(b) + needB - (prospectGrade(a) + needA);
    })[0];
    makeDraftSelection(pickInfo, best.id);
  }

  function makeDraftSelection(pickInfo, prospectId) {
    const draftClass = state.draftClasses[String(pickInfo.year)];
    const prospect = draftClass.find(item => item.id === prospectId) || draftClass[0];
    const team = getTeam(pickInfo.ownerTeam);
    const player = makePlayer(prospect.pos, team.id, false, 0, {
      ovr: prospect.trueOvr,
      pot: prospect.truePot,
      devTrait: prospect.devTrait,
      bustGem: prospect.bustGem,
      round: pickInfo.round,
      pickInRound: pickInfo.pickInRound
    });
    player.firstName = prospect.firstName;
    player.lastName = prospect.lastName;
    player.college = prospect.college;
    player.ratings = { ...prospect.ratings };
    updateOverall(player);
    state.players.push(player);
    state.draftClasses[String(pickInfo.year)] = draftClass.filter(item => item.id !== prospect.id);
    state.currentDraft.selections.push({ overall: pickInfo.overall, round: pickInfo.round, pick: pickInfo.pickInRound, teamId: team.id, playerId: player.id, name: playerName(player), pos: player.pos, college: player.college });
    for (const holder of state.teams) {
      holder.draftPicks = holder.draftPicks.filter(pickValue => !(pickValue.year === pickInfo.year && pickValue.overall === pickInfo.overall));
    }
    buildDepthChart(team.id);
    addNews("Draft pick", `${team.abbr} selected ${playerName(player)}, ${player.pos}, ${player.college} at ${pickInfo.round}.${pickInfo.pickInRound}.`);
    state.currentDraft.overall += 1;
    state.currentDraft.round = Math.ceil(state.currentDraft.overall / 32);
    state.currentDraft.pick = ((state.currentDraft.overall - 1) % 32) + 1;
    if (state.currentDraft.overall > 224) finishDraft();
  }

  function simDraftRound() {
    if (state.phase !== "draft") return;
    const startRound = state.currentDraft.round;
    while (state.currentDraft && !state.currentDraft.complete && state.currentDraft.round === startRound) {
      const pickInfo = currentPickInfo();
      if (!pickInfo) break;
      if (pickInfo.ownerTeam === USER_TEAM_ID) {
        const best = state.draftClasses[String(pickInfo.year)][0];
        makeDraftSelection(pickInfo, best.id);
      } else {
        aiMakePick(pickInfo);
      }
    }
    save();
    render();
  }

  function finishDraft() {
    if (state.currentDraft) state.currentDraft.complete = true;
    state.phase = "offseason";
    addNews("Draft complete", "The draft is complete. Offseason setup will roll into the next preseason.");
  }

  function ensureFutureDraftClasses() {
    for (let year = state.year + 1; year <= state.year + 3; year += 1) {
      if (!state.draftClasses[String(year)]) state.draftClasses[String(year)] = generateDraftClass(year);
    }
  }

  function ensureFuturePicks() {
    for (const team of state.teams) {
      for (let year = state.year + 1; year <= state.year + 3; year += 1) {
        for (let roundValue = 1; roundValue <= 7; roundValue += 1) {
          const exists = state.teams.some(holder => holder.draftPicks.some(pickValue => pickValue.year === year && pickValue.round === roundValue && pickValue.originalTeam === team.id));
          if (!exists) team.draftPicks.push({ year, round: roundValue, originalTeam: team.id, ownerTeam: team.id, overall: null });
        }
      }
      team.draftPicks = team.draftPicks.filter(pickValue => pickValue.year >= state.year + 1 && pickValue.year <= state.year + 3);
    }
  }

  function tradeDeadlinePassed() {
    return state.phase === "regular" && state.week > 10;
  }

  function pickValue(pickAsset) {
    const yearGap = Math.max(0, pickAsset.year - (state.year + 1));
    const overall = pickAsset.overall || ((pickAsset.round - 1) * 32 + 16);
    const firstRound = [3000, 2600, 2200, 1800, 1700, 1600, 1500, 1400, 1350, 1300, 1250, 1200, 1150, 1100, 1050, 1000, 950, 900, 875, 850, 800, 780, 760, 740, 720, 700, 680, 660, 640, 620, 600, 590];
    let value;
    if (overall <= 32) value = firstRound[overall - 1];
    else if (overall <= 64) value = 580 - (overall - 33) * 9.7;
    else if (overall <= 96) value = 265 - (overall - 65) * 4.7;
    else if (overall <= 128) value = 112 - (overall - 97) * 2.2;
    else if (overall <= 160) value = 43 - (overall - 129) * 0.75;
    else if (overall <= 192) value = 19 - (overall - 161) * 0.42;
    else value = Math.max(0.5, 5.8 - (overall - 193) * 0.16);
    return round(value * (0.78 ** yearGap), 1);
  }

  function playerTradeValue(player) {
    if (playerIsRetired(player)) return 0;
    const agePeak = REGRESSION_AGES[player.pos] - 3;
    const ageFactor = clamp(1.2 - Math.max(0, player.age - agePeak) * 0.08 + Math.max(0, 24 - player.age) * 0.035, 0.28, 1.35);
    const ability = Math.max(0, player.ovr - 52) ** 2.05 * 0.48 * POSITION_VALUE[player.pos];
    const potential = Math.max(0, player.pot - player.ovr) * 18 * POSITION_VALUE[player.pos];
    const awards = player.awards.filter(award => state.year - award.year <= 4).reduce((sum, award) => sum + ({ MVP: 220, "All-Pro": 120, "Pro Bowl": 45, DPOY: 180, OPOY: 180, OROY: 80, DROY: 80, "SB MVP": 110 }[award.award] || 20), 0);
    const production = allProScore(player) * 2.2;
    const injuryPenalty = player.injury.history.reduce((sum, injury) => sum + injury.weeks, 0) * 4.2;
    const surplus = Math.max(-400, (marketAnnual(player) - avgRemainingSalary(player)) * 28);
    const value = (ability + potential + awards + production + surplus - injuryPenalty) * ageFactor;
    return round(clamp(value, player.pos === "K" || player.pos === "P" ? 1 : 8, 4800), 1);
  }

  function marketAnnual(player) {
    return projectedAnnual(player);
  }

  function parseAsset(assetId) {
    const [type, ...parts] = assetId.split(":");
    if (type === "player") return { type, playerId: parts[0] };
    if (type === "pick") return { type, teamId: parts[0], year: Number(parts[1]), round: Number(parts[2]), originalTeam: parts[3] };
    return null;
  }

  function assetLabel(assetId) {
    const asset = parseAsset(assetId);
    if (!asset) return "";
    if (asset.type === "player") {
      const player = getPlayer(asset.playerId);
      return player ? `${player.pos} ${playerName(player)} (${player.ovr}/${player.pot})` : "Player";
    }
    const team = getTeam(asset.originalTeam);
    return `${asset.year} R${asset.round} (${team?.abbr || asset.originalTeam})`;
  }

  function assetValue(assetId) {
    const asset = parseAsset(assetId);
    if (!asset) return 0;
    if (asset.type === "player") {
      const player = getPlayer(asset.playerId);
      return player ? playerTradeValue(player) : 0;
    }
    const holder = getTeam(asset.teamId);
    const pickAsset = holder?.draftPicks.find(item => item.year === asset.year && item.round === asset.round && item.originalTeam === asset.originalTeam);
    return pickAsset ? pickValue(pickAsset) : 0;
  }

  function tradePreview() {
    const mine = Array.from(ui.tradeMine);
    const theirs = Array.from(ui.tradeTheirs);
    const mineValue = mine.reduce((sum, asset) => sum + assetValue(asset), 0);
    const theirsValue = theirs.reduce((sum, asset) => sum + assetValue(asset), 0);
    const partner = getTeam(ui.tradePartner);
    const aiNeedPremium = 1.03 + (partner.wins >= 8 ? 0.04 : 0) + (state.phase === "draft" ? -0.02 : 0);
    const cap = previewTradeCap(USER_TEAM_ID, partner.id, mine, theirs);
    const accepted = mineValue >= theirsValue * aiNeedPremium && cap.userAfter >= -1 && cap.partnerAfter >= -8;
    return { mineValue, theirsValue, delta: round(mineValue - theirsValue * aiNeedPremium, 1), accepted, cap };
  }

  function previewTradeCap(userTeamId, partnerTeamId, userAssets, partnerAssets) {
    let userCapChange = 0;
    let partnerCapChange = 0;
    for (const assetId of userAssets) {
      const asset = parseAsset(assetId);
      if (asset?.type === "player") {
        const player = getPlayer(asset.playerId);
        userCapChange += deadCapIfTrade(player) - capHit(player);
        partnerCapChange += capHit(player);
      }
    }
    for (const assetId of partnerAssets) {
      const asset = parseAsset(assetId);
      if (asset?.type === "player") {
        const player = getPlayer(asset.playerId);
        partnerCapChange += deadCapIfTrade(player) - capHit(player);
        userCapChange += capHit(player);
      }
    }
    return {
      userChange: round(userCapChange, 2),
      partnerChange: round(partnerCapChange, 2),
      userAfter: round(capSpace(userTeamId) - userCapChange, 2),
      partnerAfter: round(capSpace(partnerTeamId) - partnerCapChange, 2)
    };
  }

  function offerTrade() {
    const preview = tradePreview();
    if (!preview.accepted) {
      ui.toast = `Offer short by about ${round(Math.abs(preview.delta), 1)} value points or cap room.`;
      render();
      return;
    }
    const partnerId = ui.tradePartner;
    const mine = Array.from(ui.tradeMine).map(assetLabel).join(", ") || "nothing";
    const theirs = Array.from(ui.tradeTheirs).map(assetLabel).join(", ") || "nothing";
    if (!confirmAction(`Offer this trade?\n\nDetroit sends: ${mine}\n\n${getTeam(partnerId).abbr} sends: ${theirs}\n\nDetroit cap after: ${money(preview.cap.userAfter)}`)) return;
    executeTrade(USER_TEAM_ID, partnerId, Array.from(ui.tradeMine), Array.from(ui.tradeTheirs));
    ui.tradeMine.clear();
    ui.tradeTheirs.clear();
    ui.toast = "Trade accepted.";
    save();
    render();
  }

  function executeTrade(teamAId, teamBId, assetsA, assetsB) {
    moveAssets(teamAId, teamBId, assetsA);
    moveAssets(teamBId, teamAId, assetsB);
    buildDepthChart(teamAId);
    buildDepthChart(teamBId);
    addNews("Trade", `${getTeam(teamAId).abbr} and ${getTeam(teamBId).abbr} completed a trade.`);
  }

  function moveAssets(fromTeamId, toTeamId, assets) {
    const from = getTeam(fromTeamId);
    const to = getTeam(toTeamId);
    for (const assetId of assets) {
      const asset = parseAsset(assetId);
      if (asset.type === "player") {
        const player = getPlayer(asset.playerId);
        if (!player) continue;
        from.deadCap[String(state.year)] = round((from.deadCap[String(state.year)] || 0) + deadCapIfTrade(player), 2);
        player.teamId = toTeamId;
      } else if (asset.type === "pick") {
        const index = from.draftPicks.findIndex(pickItem => pickItem.year === asset.year && pickItem.round === asset.round && pickItem.originalTeam === asset.originalTeam);
        if (index >= 0) {
          const [pickItem] = from.draftPicks.splice(index, 1);
          pickItem.ownerTeam = toTeamId;
          to.draftPicks.push(pickItem);
        }
      }
    }
  }

  function releasePlayer(playerId) {
    const player = getPlayer(playerId);
    if (!player || player.teamId !== USER_TEAM_ID) return;
    const team = getTeam(USER_TEAM_ID);
    const dead = deadCapIfRelease(player);
    const savings = capHit(player) - dead.current;
    if (!confirmAction(`Release ${playerName(player)} (${player.pos}, ${player.ovr} OVR)?\n\nCurrent dead cap: ${money(dead.current)}\nCap savings: ${money(savings)}`)) return;
    team.deadCap[String(state.year)] = round((team.deadCap[String(state.year)] || 0) + dead.current, 2);
    if (dead.next > 0) team.deadCap[String(state.year + 1)] = round((team.deadCap[String(state.year + 1)] || 0) + dead.next, 2);
    player.teamId = null;
    player.contract = null;
    state.players = state.players.filter(item => item.id !== player.id);
    state.freeAgents.push(player);
    buildDepthChart(USER_TEAM_ID);
    addNews("Released", `${playerName(player)} was released. Current dead cap: ${money(dead.current)}.`);
    save();
    render();
  }

  function upgradeFacility(kind) {
    const team = getTeam(USER_TEAM_ID);
    if (team.facilities[kind] >= 10) return;
    const cost = round((team.facilities[kind] + 1) ** 1.7 * (kind === "stadium" ? 4.2 : kind === "coaching" ? 3.8 : 3.1), 1);
    if (team.cash < cost) {
      ui.toast = "Not enough cash for that upgrade.";
      render();
      return;
    }
    if (!confirmAction(`Upgrade ${kind} to level ${team.facilities[kind] + 1} for ${money(cost)}?`)) return;
    team.cash = round(team.cash - cost, 1);
    team.facilities[kind] += 1;
    addNews("Facility upgrade", `${kind[0].toUpperCase() + kind.slice(1)} upgraded to level ${team.facilities[kind]}.`);
    save();
    render();
  }

  function moveDepth(pos, playerId, direction) {
    const team = getTeam(USER_TEAM_ID);
    const list = team.depthChart[pos] || [];
    const index = list.indexOf(playerId);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= list.length) return;
    [list[index], list[next]] = [list[next], list[index]];
    team.depthChart[pos] = list;
    save();
    render();
  }

  function spreadForGame(game) {
    const home = getTeam(game.homeTeamId);
    const away = getTeam(game.awayTeamId);
    const weather = game.weather || makeWeather(home, game.week);
    const h = gameProfile(home, away, true, weather);
    const a = gameProfile(away, home, false, weather);
    const margin = round((h.marginEdge - a.marginEdge) * 0.28 + 2.1, 1);
    return margin >= 0 ? `${home.abbr} -${Math.abs(margin).toFixed(1)}` : `${away.abbr} -${Math.abs(margin).toFixed(1)}`;
  }

  function scoutedValue(prospect, field) {
    const team = getTeam(USER_TEAM_ID);
    const yearsAway = Math.max(0, prospect.year - (state.year + 1));
    const noise = (10 - team.facilities.scouting) * 1.05 + yearsAway * 3.5;
    const trueValue = field === "ovr" ? prospect.trueOvr : prospect.truePot;
    return Math.round(clamp(trueValue + seededGaussian(`${prospect.id}:${field}:${team.facilities.scouting}:${state.year}`, 0, noise), 30, 99));
  }

  function render() {
    if (!state || ui.screen === "hub") {
      renderLeagueHub();
      return;
    }
    const team = getTeam(USER_TEAM_ID);
    app.innerHTML = `
      <div class="shell">
        <header class="topbar">
          <div class="brand-row">
            <div class="badge">DW</div>
            <div class="brand-title">
              <h1>Detroit Wolverines GM</h1>
              <div>${state.year} - ${phaseLabel()} - ${team.wins}-${team.losses}${team.ties ? `-${team.ties}` : ""}</div>
            </div>
            <div class="status-strip">
              <span class="pill">${state.phase.toUpperCase()}</span>
              <span class="pill ${capSpace(USER_TEAM_ID) < 0 ? "bad" : "good"}">Cap ${money(capSpace(USER_TEAM_ID))}</span>
              <span class="pill ${team.cash < 0 ? "bad" : "good"}">Cash ${money(team.cash)}</span>
              <span class="pill ${state.gm.jobSecurity < 35 ? "bad" : state.gm.jobSecurity < 55 ? "warn" : "good"}">Job ${state.gm.jobSecurity}/100</span>
            </div>
          </div>
          <nav class="nav-tabs">${TABS.map(([key, label]) => `<button data-tab="${key}" class="${ui.tab === key ? "active" : ""}">${label}</button>`).join("")}</nav>
        </header>
        <main class="main">
          ${ui.toast ? `<div class="toast">${escapeHtml(ui.toast)}</div>` : ""}
          ${renderPhaseBanner()}
          ${renderTab()}
        </main>
        ${renderPlayerModal()}
      </div>
    `;
  }

  function renderLeagueHub() {
    const leagues = loadLeagueIndex();
    app.innerHTML = `
      <div class="league-hub">
        <header class="hub-header">
          <h1>Detroit Wolverines GM</h1>
          <div>Choose a league, import a save, or generate a new clean league.</div>
        </header>
        <main class="hub-main">
          ${ui.toast ? `<div class="toast">${escapeHtml(ui.toast)}</div>` : ""}
          <div class="grid two">
            <section class="panel">
              <div class="panel-header"><h3>Leagues</h3><span class="spacer muted">${leagues.length} saved</span></div>
              ${leagues.length ? leagues.map(league => `<div class="league-row">
                <div><strong>${escapeHtml(league.name)}</strong><span>${league.year} - ${escapeHtml(league.phase)} - Detroit ${escapeHtml(league.record)} - updated ${new Date(league.updatedAt).toLocaleString()}</span></div>
                <button class="primary" data-action="loadLeague" data-league="${league.id}">Play</button>
                <button class="danger" data-action="deleteLeague" data-league="${league.id}">Delete</button>
              </div>`).join("") : `<div class="empty">No saved leagues yet.</div>`}
            </section>
            <section class="panel">
              <div class="panel-header"><h3>Start Or Import</h3></div>
              <div class="panel-body stack">
                <input data-control="newLeagueName" placeholder="League name" value="${escapeAttr(ui.newLeagueName || "")}">
                <button class="primary" data-action="createLeague">Start Clean League</button>
                <textarea data-control="importText" placeholder="Paste exported save JSON">${escapeHtml(ui.importText)}</textarea>
                <button data-action="importLeagueFromHub">Import Save As League</button>
              </div>
            </section>
          </div>
        </main>
      </div>
    `;
  }

  function renderPlayerModal() {
    if (!ui.profileOpen || !ui.selectedPlayerId) return "";
    const player = getPlayer(ui.selectedPlayerId);
    if (!player) return "";
    return `<div class="modal-backdrop">
      <section class="modal" data-modal="profile">
        <div class="modal-header"><h3>${playerName(player)}</h3><span class="pill light">${playerStatus(player)}</span><button data-action="closeProfile">Close</button></div>
        <div class="modal-body">${renderPlayerCard(player)}</div>
      </section>
    </div>`;
  }

  function renderPhaseBanner() {
    const disabled = state.gm.fired ? "disabled" : "";
    const action = state.phase === "draft" && currentPickInfo()?.ownerTeam === USER_TEAM_ID ? "On the clock" : "Advance";
    return `<div class="phase-banner">
      <strong>${phaseLabel()}</strong>
      <span class="muted">${state.gm.fired ? "Ownership has ended your tenure." : phaseCaption()}</span>
      <button class="primary" data-action="advance" ${disabled}>${action}</button>
    </div>`;
  }

  function phaseCaption() {
    if (state.phase === "preseason") return "Training, minor progression, and injury risk.";
    if (state.phase === "regular") return state.week <= 10 ? "Trades are open through Week 10." : "Trade deadline has passed.";
    if (state.phase === "playoffs") return "Single-elimination bracket with conference reseeding.";
    if (state.phase === "awards") return "Awards, retirements, progression, and GM review.";
    if (state.phase === "freeAgency") return "Sign free agents or advance to the draft.";
    if (state.phase === "draft") return "Draft picks are live; trade preview remains available.";
    return "Prepare the next league year.";
  }

  function renderTab() {
    if (ui.tab === "dashboard") return renderDashboard();
    if (ui.tab === "roster") return renderRoster();
    if (ui.tab === "depth") return renderDepth();
    if (ui.tab === "players") return renderPlayers();
    if (ui.tab === "schedule") return renderSchedule();
    if (ui.tab === "standings") return renderStandings();
    if (ui.tab === "stats") return renderStats();
    if (ui.tab === "draft") return renderDraft();
    if (ui.tab === "freeAgency") return renderFreeAgency();
    if (ui.tab === "trades") return renderTrades();
    if (ui.tab === "finance") return renderFinance();
    if (ui.tab === "records") return renderRecords();
    if (ui.tab === "awards") return renderAwards();
    if (ui.tab === "settings") return renderSettings();
    return "";
  }

  function renderDashboard() {
    const team = getTeam(USER_TEAM_ID);
    const nextGame = state.schedule.find(game => game.year === state.year && !game.played && (game.homeTeamId === USER_TEAM_ID || game.awayTeamId === USER_TEAM_ID));
    const lastGame = state.schedule.slice().reverse().find(game => game.year === state.year && game.played && (game.homeTeamId === USER_TEAM_ID || game.awayTeamId === USER_TEAM_ID));
    const offense = round(offensiveRating(team), 1);
    const defense = round(defensiveRating(team), 1);
    return `
      <div class="grid two">
        <div class="grid">
          <section class="panel">
            <div class="panel-header"><h3>Team Command</h3></div>
            <div class="panel-body stack">
              <div class="metric-row">
                <div class="metric"><label>Record</label><strong>${team.wins}-${team.losses}</strong><span>${team.conf} ${team.div}</span></div>
                <div class="metric"><label>Cap Space</label><strong>${money(capSpace(USER_TEAM_ID))}</strong><span>${money(teamCapUsed(USER_TEAM_ID))} used</span></div>
                <div class="metric"><label>Cash</label><strong>${money(team.cash)}</strong><span>${money(team.finances.profit)} year profit</span></div>
                <div class="metric"><label>Job Security</label><strong>${state.gm.jobSecurity}</strong><span>${team.owner.expectations}</span></div>
              </div>
              ${nextGame ? renderFieldGame(nextGame, "Next Game") : lastGame ? renderFieldGame(lastGame, "Last Game") : ""}
            </div>
          </section>
          <section class="panel">
            <div class="panel-header"><h3>Unit Grades</h3></div>
            <div class="panel-body">
              <div class="metric-row">
                <div class="metric"><label>Offense</label><strong>${offense}</strong><span>QB, skill, OL, coaching</span></div>
                <div class="metric"><label>Defense</label><strong>${defense}</strong><span>front, coverage, coaching</span></div>
                <div class="metric"><label>Medical</label><strong>${team.facilities.medical}/10</strong><span>injury odds and length</span></div>
                <div class="metric"><label>Scouting</label><strong>${team.facilities.scouting}/10</strong><span>draft accuracy</span></div>
              </div>
            </div>
          </section>
          <section class="panel">
            <div class="panel-header"><h3>League Leaders</h3></div>
            <div class="panel-body">${renderLeaderGrid()}</div>
          </section>
        </div>
        <aside class="grid">
          <section class="panel">
            <div class="panel-header"><h3>News</h3></div>
            <div class="panel-body">${renderNews()}</div>
          </section>
          <section class="panel">
            <div class="panel-header"><h3>Awards Race</h3></div>
            <div class="panel-body">${renderAwardsRace()}</div>
          </section>
        </aside>
      </div>
    `;
  }

  function renderFieldGame(game, label) {
    const home = getTeam(game.homeTeamId);
    const away = getTeam(game.awayTeamId);
    const score = game.played ? `${game.awayScore}-${game.homeScore}` : spreadForGame(game);
    return `<div class="field-strip">
      <div class="field-content">
        <div class="field-team"><b>${away.abbr}</b><span>${teamName(away)}</span></div>
        <div class="score">${score}</div>
        <div class="field-team align-right"><b>${home.abbr}</b><span>${teamName(home)} - ${label}</span></div>
      </div>
    </div>`;
  }

  function renderLeaderGrid() {
    const categories = [
      ["Pass Yds", "passYds"], ["Pass TD", "passTd"], ["Rush Yds", "rushYds"], ["Rec Yds", "recYds"], ["Sacks", "sacks"], ["INT", "defInt"]
    ];
    return `<div class="grid three">${categories.map(([label, key]) => `
      <div>
        <div class="split"><strong>${label}</strong><span class="muted">Top 5</span></div>
        <ul class="mini-list">${statLeaders(key, 5).map(player => `<li><span>${playerName(player)}</span><b>${round(player.stats.season[key] || 0, 1)}</b></li>`).join("")}</ul>
      </div>
    `).join("")}</div>`;
  }

  function renderNews() {
    if (!state.news.length) return `<div class="empty">No news.</div>`;
    return `<ul class="mini-list">${state.news.slice(0, 12).map(item => `<li><span><b>${escapeHtml(item.title)}</b><br><span class="muted">${escapeHtml(item.body)}</span></span><span class="muted nowrap">${escapeHtml(item.stamp)}</span></li>`).join("")}</ul>`;
  }

  function renderRoster() {
    const players = teamPlayers(USER_TEAM_ID).filter(player => ui.rosterPos === "ALL" || player.pos === ui.rosterPos).sort((a, b) => positionOrder(a.pos) - positionOrder(b.pos) || b.ovr - a.ovr);
    const selected = getPlayer(ui.selectedPlayerId) || players[0];
    return `
      <div class="toolbar">
        <h2>Roster</h2>
        <select data-control="rosterPos"><option value="ALL">All</option>${POSITIONS.map(pos => `<option value="${pos}" ${ui.rosterPos === pos ? "selected" : ""}>${pos}</option>`).join("")}</select>
      </div>
      <div class="grid two">
        <section class="panel">
          <div class="panel-header"><h3>Detroit Players</h3><span class="spacer muted">${players.length}/53</span></div>
          <div class="table-wrap">${renderRosterTable(players)}</div>
        </section>
        <section class="panel">
          <div class="panel-header"><h3>Player Card</h3></div>
          <div class="panel-body">${selected ? renderPlayerCard(selected) : `<div class="empty">Select a player.</div>`}</div>
        </section>
      </div>
    `;
  }

  function renderRosterTable(players) {
    return `<table><thead><tr><th>Pos</th><th>Name</th><th class="num">Age</th><th class="num">Ovr</th><th class="num">Pot</th><th>Injury</th><th>Contract</th><th class="num">Cap</th><th class="num">Release</th><th></th></tr></thead><tbody>
      ${players.map(player => {
        const dead = deadCapIfRelease(player);
        const savings = capHit(player) - dead.current;
        return `<tr>
          <td>${player.pos}</td>
          <td><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button></td>
          <td class="num">${player.age}</td>
          <td class="num">${player.ovr}</td>
          <td class="num">${player.pot}</td>
          <td>${injuryLabel(player)}</td>
          <td>${contractSummary(player)}</td>
          <td class="num">${money(capHit(player))}</td>
          <td class="num ${savings >= 0 ? "good" : "bad"}">${money(savings)}</td>
          <td><button class="danger" data-action="release" data-player="${player.id}">Release</button></td>
        </tr>`;
      }).join("")}
    </tbody></table>`;
  }

  function renderPlayerCard(player) {
    const team = player.teamId ? getTeam(player.teamId) : null;
    const currentCap = playerIsRetired(player) ? 0 : capHit(player);
    const attrs = ["spd", "str", "agi", "acc", "awr", "inj", "thp", "tha", "cth", "rr", "car", "pbk", "rbk", "bshed", "pmv", "fmv", "tak", "man", "zon", "prs", "kpw", "kac"];
    return `
      <div class="stack">
        <div class="split"><div><strong>${playerName(player)}</strong><div class="muted">${player.pos} - ${playerStatus(player)} - ${player.college}</div></div><span class="pill light">${player.devTrait}</span></div>
        <div class="metric-row">
          <div class="metric"><label>Overall</label><strong>${player.ovr}</strong><span>Potential ${player.pot}</span></div>
          <div class="metric"><label>Age</label><strong>${player.age}</strong><span>Regresses near ${player.regressionAge}</span></div>
          <div class="metric"><label>Trade Value</label><strong>${playerTradeValue(player)}</strong><span>contract adjusted</span></div>
          <div class="metric"><label>Cap Hit</label><strong>${money(currentCap)}</strong><span>${contractSummary(player)}</span></div>
        </div>
        <div class="table-wrap"><table><thead><tr><th>Stat</th><th class="num">Season</th><th class="num">Career</th></tr></thead><tbody>${renderStatRows(player)}</tbody></table></div>
        <div class="table-wrap"><table><thead><tr><th>Attr</th>${attrs.slice(0, 11).map(attr => `<th class="num">${attr.toUpperCase()}</th>`).join("")}</tr></thead><tbody><tr><td>Ratings</td>${attrs.slice(0, 11).map(attr => `<td class="num">${player.ratings[attr] || ""}</td>`).join("")}</tr><tr><td>Skills</td>${attrs.slice(11).map(attr => `<td class="num">${player.ratings[attr] || ""}</td>`).join("")}</tr></tbody></table></div>
        <div><strong>Awards</strong><div class="muted">${player.awards.length ? player.awards.slice(-8).map(award => `${award.year} ${award.award}`).join(", ") : "None"}</div></div>
        <div><strong>History</strong><div class="muted">${player.stats.history.length ? player.stats.history.slice(-5).map(row => `${row.year} ${row.team} ${row.ovr} OVR`).join(" - ") : "No completed seasons"}</div></div>
      </div>
    `;
  }

  function renderStatRows(player) {
    const keys = [
      ["Games", "games"], ["Pass Yds", "passYds"], ["Pass TD", "passTd"], ["INT Thrown", "int"], ["Rush Yds", "rushYds"], ["Rush TD", "rushTd"], ["Rec", "rec"], ["Rec Yds", "recYds"], ["Rec TD", "recTd"], ["Tackles", "tackles"], ["TFL", "tfl"], ["Sacks", "sacks"], ["Def INT", "defInt"]
    ];
    return keys.map(([label, key]) => `<tr><td>${label}</td><td class="num">${round(player.stats.season[key] || 0, 1)}</td><td class="num">${round(player.stats.career[key] || 0, 1)}</td></tr>`).join("");
  }

  function renderDepth() {
    const team = getTeam(USER_TEAM_ID);
    return `
      <div class="toolbar"><h2>Depth Chart</h2><button data-action="autoDepth">Auto</button></div>
      <div class="depth-grid">${POSITIONS.map(pos => `
        <div class="depth-slot">
          <h3>${pos}</h3>
          <table><tbody>${(team.depthChart[pos] || []).map((playerId, index) => {
            const player = getPlayer(playerId);
            if (!player) return "";
            return `<tr><td class="num">${index + 1}</td><td><button class="link-button" data-action="selectPlayerTab" data-player="${player.id}">${playerName(player)}</button></td><td class="num">${player.ovr}</td><td>${injuryLabel(player)}</td><td><span class="compact-actions"><button data-action="depthUp" data-pos="${pos}" data-player="${player.id}">Up</button><button data-action="depthDown" data-pos="${pos}" data-player="${player.id}">Dn</button></span></td></tr>`;
          }).join("")}</tbody></table>
        </div>
      `).join("")}</div>
    `;
  }

  function renderPlayers() {
    const query = ui.playerSearch.toLowerCase();
    const pool = playerPoolForScope();
    const all = pool.filter(player => !query || playerName(player).toLowerCase().includes(query) || player.pos.toLowerCase().includes(query) || playerStatus(player).toLowerCase().includes(query) || player.college.toLowerCase().includes(query));
    const sorted = sortPlayers(all, ui.playerSort).slice(0, 450);
    return `
      <div class="toolbar">
        <h2>All-Time Player Database</h2>
        <input data-control="playerSearch" placeholder="Search" value="${escapeAttr(ui.playerSearch)}">
        <select data-control="playerScope">
          <option value="all" ${ui.playerScope === "all" ? "selected" : ""}>All players</option>
          <option value="active" ${ui.playerScope === "active" ? "selected" : ""}>Active rosters</option>
          <option value="freeAgents" ${ui.playerScope === "freeAgents" ? "selected" : ""}>Free agents</option>
          <option value="retired" ${ui.playerScope === "retired" ? "selected" : ""}>Retired</option>
        </select>
        <select data-control="playerSort">${["ovr", "pot", "passYds", "passTd", "rushYds", "rushTd", "recYds", "recTd", "int", "defInt", "sacks", "tackles", "age", "value"].map(key => `<option value="${key}" ${ui.playerSort === key ? "selected" : ""}>${key}</option>`).join("")}</select>
      </div>
      <section class="panel"><div class="table-wrap">${renderPlayerSpreadsheet(sorted)}</div></section>
    `;
  }

  function playerPoolForScope() {
    if (ui.playerScope === "active") return state.players.slice();
    if (ui.playerScope === "freeAgents") return state.freeAgents.slice();
    if (ui.playerScope === "retired") return (state.retiredPlayers || []).slice();
    return allKnownPlayers();
  }

  function sortPlayers(players, key) {
    return players.slice().sort((a, b) => {
      if (key === "age") return a.age - b.age;
      if (key === "value") return playerTradeValue(b) - playerTradeValue(a);
      if (key === "ovr" || key === "pot") return b[key] - a[key];
      return (b.stats.season[key] || 0) - (a.stats.season[key] || 0);
    });
  }

  function renderPlayerSpreadsheet(players) {
    const attrs = ["spd", "str", "agi", "acc", "awr", "inj", "sta", "tgh", "thp", "tha", "cth", "rr", "car", "trk", "pbk", "rbk", "bshed", "pmv", "fmv", "tak", "man", "zon", "prs", "kpw", "kac"];
    return `<table><thead><tr><th>Pos</th><th>Name</th><th>Status</th><th class="num">Age</th><th class="num">Ovr</th><th class="num">Pot</th><th>Contract</th><th class="num">Pass Yds</th><th class="num">Pass TD</th><th class="num">Rush Yds</th><th class="num">Rec Yds</th><th class="num">Sacks</th><th class="num">INT</th><th class="num">Value</th>${attrs.map(attr => `<th class="num">${attr.toUpperCase()}</th>`).join("")}</tr></thead><tbody>
      ${players.map(player => `<tr><td>${player.pos}</td><td><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button></td><td>${playerStatus(player)}</td><td class="num">${player.age}</td><td class="num">${player.ovr}</td><td class="num">${player.pot}</td><td>${contractSummary(player)}</td><td class="num">${player.stats.season.passYds}</td><td class="num">${player.stats.season.passTd}</td><td class="num">${player.stats.season.rushYds}</td><td class="num">${player.stats.season.recYds}</td><td class="num">${player.stats.season.sacks}</td><td class="num">${player.stats.season.defInt}</td><td class="num">${playerTradeValue(player)}</td>${attrs.map(attr => `<td class="num">${player.ratings[attr] || ""}</td>`).join("")}</tr>`).join("")}
    </tbody></table>`;
  }

  function renderSchedule() {
    const weeks = Array.from(new Set(state.schedule.filter(game => game.year === state.year).map(game => game.week))).sort((a, b) => a - b);
    const games = state.schedule.filter(game => game.year === state.year && game.week === Number(ui.scheduleWeek));
    const selected = state.schedule.find(game => game.id === ui.selectedGameId) || games.find(game => game.played) || games[0];
    return `
      <div class="toolbar">
        <h2>Schedule</h2>
        <select data-control="scheduleWeek">${weeks.map(week => `<option value="${week}" ${Number(ui.scheduleWeek) === week ? "selected" : ""}>Week ${week}</option>`).join("")}</select>
      </div>
      <div class="grid two">
        <section class="panel"><div class="panel-header"><h3>Games</h3></div><div class="table-wrap">${renderGamesTable(games)}</div></section>
        <section class="panel"><div class="panel-header"><h3>${selected?.played ? "Box Score" : "Game Preview"}</h3></div><div class="panel-body">${selected ? (selected.played ? renderBoxScore(selected) : renderGamePreview(selected)) : `<div class="empty">No game selected.</div>`}</div></section>
      </div>
    `;
  }

  function renderGamesTable(games) {
    return `<table><thead><tr><th>Away</th><th>Home</th><th>Weather</th><th>Spread</th><th>Result</th><th></th></tr></thead><tbody>
      ${games.map(game => `<tr><td>${teamName(getTeam(game.awayTeamId))}</td><td>${teamName(getTeam(game.homeTeamId))}</td><td>${game.weather?.label || makeWeather(getTeam(game.homeTeamId), game.week).label}</td><td>${game.played ? "" : spreadForGame(game)}</td><td>${game.played ? `${game.awayScore}-${game.homeScore}` : "Upcoming"}</td><td><button data-action="selectGame" data-game="${game.id}">${game.played ? "Box" : "Preview"}</button></td></tr>`).join("")}
    </tbody></table>`;
  }

  function renderGamePreview(game) {
    const home = getTeam(game.homeTeamId);
    const away = getTeam(game.awayTeamId);
    const weather = game.weather || makeWeather(home, game.week);
    const homeProfile = gameProfile(home, away, true, weather);
    const awayProfile = gameProfile(away, home, false, weather);
    const rows = matchupRows(awayProfile, homeProfile).concat(matchupRows(homeProfile, awayProfile));
    return `<div class="stack">
      ${renderFieldGame(game, "Preview")}
      <div class="metric-row">
        <div class="metric"><label>Spread</label><strong>${spreadForGame(game)}</strong><span>home field included</span></div>
        <div class="metric"><label>Weather</label><strong>${weather.label}</strong><span>pass ${pct(weather.pass)}, rush ${pct(weather.rush)}</span></div>
        <div class="metric"><label>${away.abbr} Edge</label><strong>${round(awayProfile.marginEdge, 1)}</strong><span>holistic game rating</span></div>
        <div class="metric"><label>${home.abbr} Edge</label><strong>${round(homeProfile.marginEdge, 1)}</strong><span>holistic game rating</span></div>
      </div>
      <div class="table-wrap"><table><thead><tr><th>Matchup</th><th>Offense</th><th>Defense</th><th class="num">Edge</th><th>Impact</th></tr></thead><tbody>${rows.map(row => `<tr><td>${row.label}</td><td>${row.offense}</td><td>${row.defense}</td><td class="num ${row.edge >= 0 ? "good" : "bad"}">${round(row.edge, 1)}</td><td>${row.impact}</td></tr>`).join("")}</tbody></table></div>
    </div>`;
  }

  function matchupRows(offProfile, defProfile) {
    const off = offProfile.team;
    const def = defProfile.team;
    const qb = offProfile.qb;
    const wr = offProfile.wr[0];
    const cb = starters(def, "CB", 1)[0];
    const rb = offProfile.rb[0];
    const lbUnit = unitRating(def, "LB", 3);
    const passRush = unitRating(def, "DE", 2) * 0.62 + unitRating(def, "DT", 2) * 0.38;
    const safety = unitRating(def, "S", 2);
    return [
      {
        label: `${off.abbr} pass game`,
        offense: `${qb ? playerName(qb) : "QB room"} / ${wr ? playerName(wr) : "WR room"}`,
        defense: `${cb ? playerName(cb) : "CB room"} plus ${def.abbr} coverage`,
        edge: (qb?.ovr || 45) * 0.42 + unitRating(off, "WR", 3) * 0.25 + offProfile.ol * 0.18 - defensiveRating(def) * 0.5,
        impact: "explosive plays, turnovers"
      },
      {
        label: `${off.abbr} WR-CB`,
        offense: wr ? `${playerName(wr)} ${wr.ovr} OVR` : "WR room",
        defense: cb ? `${playerName(cb)} ${cb.ovr} OVR` : "CB room",
        edge: (wr?.ovr || 55) - (cb?.ovr || 55),
        impact: "target share, third downs"
      },
      {
        label: `${off.abbr} protection`,
        offense: `OL ${round(offProfile.ol, 1)}`,
        defense: `${def.abbr} rush ${round(passRush, 1)}`,
        edge: offProfile.ol - passRush,
        impact: "sacks, QB efficiency"
      },
      {
        label: `${off.abbr} run game`,
        offense: `${rb ? playerName(rb) : "RB room"} / OL`,
        defense: `${def.abbr} front seven`,
        edge: (rb?.ovr || 55) * 0.32 + offProfile.ol * 0.33 - (unitRating(def, "DT", 2) * 0.22 + lbUnit * 0.28 + safety * 0.08),
        impact: "clock, red zone"
      }
    ];
  }

  function renderBoxScore(game) {
    const sideRows = side => game.box[side].players.filter(line => Object.values(line).some(value => typeof value === "number" && value > 0)).map(line => {
      const player = getPlayer(line.playerId);
      return `<tr><td>${player?.pos || ""}</td><td>${player ? playerName(player) : ""}</td><td class="num">${line.passYds || 0}</td><td class="num">${line.passTd || 0}</td><td class="num">${line.rushYds || 0}</td><td class="num">${line.rushTd || 0}</td><td class="num">${line.recYds || 0}</td><td class="num">${line.recTd || 0}</td><td class="num">${line.tackles || 0}</td><td class="num">${line.sacks || 0}</td><td class="num">${line.defInt || 0}</td></tr>`;
    }).join("");
    return `<div class="stack">
      <div class="split"><strong>${game.box.summary}</strong><span class="muted">${game.playoffRound || `Week ${game.week}`}</span></div>
      <div class="table-wrap"><table><thead><tr><th>Pos</th><th>${getTeam(game.awayTeamId).abbr}</th><th class="num">PY</th><th class="num">PTD</th><th class="num">RY</th><th class="num">RTD</th><th class="num">RecY</th><th class="num">RecTD</th><th class="num">Tk</th><th class="num">Sk</th><th class="num">INT</th></tr></thead><tbody>${sideRows("away")}</tbody></table></div>
      <div class="table-wrap"><table><thead><tr><th>Pos</th><th>${getTeam(game.homeTeamId).abbr}</th><th class="num">PY</th><th class="num">PTD</th><th class="num">RY</th><th class="num">RTD</th><th class="num">RecY</th><th class="num">RecTD</th><th class="num">Tk</th><th class="num">Sk</th><th class="num">INT</th></tr></thead><tbody>${sideRows("home")}</tbody></table></div>
    </div>`;
  }

  function renderStandings() {
    return `<div class="grid two">${["AFC", "NFC"].map(conf => `<section class="panel"><div class="panel-header"><h3>${conf}</h3></div><div class="table-wrap">${renderConferenceStandings(conf)}</div></section>`).join("")}</div>`;
  }

  function renderConferenceStandings(conf) {
    return `<table><thead><tr><th>Div</th><th>Team</th><th class="num">W</th><th class="num">L</th><th class="num">Pct</th><th class="num">PF</th><th class="num">PA</th><th>Strk</th></tr></thead><tbody>
      ${["East", "North", "South", "West"].flatMap(div => state.teams.filter(team => team.conf === conf && team.div === div).sort(compareTeams).map(team => `<tr><td>${div}</td><td>${teamName(team)}</td><td class="num">${team.wins}</td><td class="num">${team.losses}</td><td class="num">${(team.wins / Math.max(1, team.wins + team.losses)).toFixed(3)}</td><td class="num">${team.pf}</td><td class="num">${team.pa}</td><td>${team.streak}</td></tr>`)).join("")}
    </tbody></table>`;
  }

  function renderStats() {
    return `<div class="grid two">
      <section class="panel"><div class="panel-header"><h3>Top 5 Leaders</h3></div><div class="panel-body">${renderLeaderGrid()}</div></section>
      <section class="panel"><div class="panel-header"><h3>Awards Race</h3></div><div class="panel-body">${renderAwardsRace()}</div></section>
      <section class="panel wide"><div class="panel-header"><h3>Sortable Season Stats</h3></div><div class="panel-body">${renderStatsTableOnly()}</div></section>
      <section class="panel wide"><div class="panel-header"><h3>Past Season Spreadsheet</h3></div><div class="panel-body">${renderHistoryTable()}</div></section>
    </div>`;
  }

  function renderStatsTableOnly() {
    const all = sortPlayers(state.players.concat(state.freeAgents), ui.playerSort).slice(0, 450);
    return `<div class="filter-row">
      <select data-control="playerSort">${["ovr", "pot", "passYds", "passTd", "rushYds", "rushTd", "recYds", "recTd", "int", "defInt", "sacks", "tackles", "age", "value"].map(key => `<option value="${key}" ${ui.playerSort === key ? "selected" : ""}>${key}</option>`).join("")}</select>
    </div>
    <div class="table-wrap">${renderPlayerSpreadsheet(all)}</div>`;
  }

  function renderHistoryTable() {
    const allPlayers = state.players.concat(state.freeAgents, state.retiredPlayers || []);
    const rows = [];
    for (const player of allPlayers) {
      for (const season of player.stats.history || []) {
        if (ui.historyYear !== "ALL" && Number(ui.historyYear) !== season.year) continue;
        rows.push({ player, season });
      }
    }
    const years = Array.from(new Set(rows.map(row => row.season.year).concat([state.year]))).sort((a, b) => b - a);
    const valueFor = row => {
      if (ui.playerSort === "ovr") return row.season.ovr || row.player.ovr;
      if (ui.playerSort === "pot") return row.player.pot;
      if (ui.playerSort === "age") return -row.player.age;
      if (ui.playerSort === "value") return playerTradeValue(row.player);
      return row.season[ui.playerSort] || 0;
    };
    rows.sort((a, b) => valueFor(b) - valueFor(a));
    if (!rows.length) {
      return `<div class="filter-row"><select data-control="historyYear"><option value="ALL">All years</option>${years.map(year => `<option value="${year}" ${String(ui.historyYear) === String(year) ? "selected" : ""}>${year}</option>`).join("")}</select></div><div class="empty">Past seasons appear here after a season is completed.</div>`;
    }
    return `<div class="filter-row">
      <select data-control="historyYear"><option value="ALL">All years</option>${years.map(year => `<option value="${year}" ${String(ui.historyYear) === String(year) ? "selected" : ""}>${year}</option>`).join("")}</select>
      <select data-control="playerSort">${["ovr", "passYds", "passTd", "rushYds", "rushTd", "recYds", "recTd", "int", "defInt", "sacks", "tackles", "value"].map(key => `<option value="${key}" ${ui.playerSort === key ? "selected" : ""}>${key}</option>`).join("")}</select>
    </div>
    <div class="table-wrap"><table><thead><tr><th class="num">Year</th><th>Pos</th><th>Name</th><th>Team</th><th class="num">Ovr</th><th class="num">G</th><th class="num">Pass Yds</th><th class="num">Pass TD</th><th class="num">INT</th><th class="num">Rush Yds</th><th class="num">Rush TD</th><th class="num">Rec</th><th class="num">Rec Yds</th><th class="num">Rec TD</th><th class="num">Tk</th><th class="num">TFL</th><th class="num">Sk</th><th class="num">Def INT</th></tr></thead><tbody>
      ${rows.slice(0, 600).map(({ player, season }) => `<tr><td class="num">${season.year}</td><td>${player.pos}</td><td><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button></td><td>${season.team}</td><td class="num">${season.ovr}</td><td class="num">${season.games}</td><td class="num">${season.passYds}</td><td class="num">${season.passTd}</td><td class="num">${season.int}</td><td class="num">${season.rushYds}</td><td class="num">${season.rushTd}</td><td class="num">${season.rec}</td><td class="num">${season.recYds}</td><td class="num">${season.recTd}</td><td class="num">${season.tackles}</td><td class="num">${season.tfl}</td><td class="num">${season.sacks}</td><td class="num">${season.defInt}</td></tr>`).join("")}
    </tbody></table></div>`;
  }

  function renderDraft() {
    const years = Object.keys(state.draftClasses).map(Number).sort((a, b) => a - b);
    const draftClass = state.draftClasses[String(ui.draftYear)] || [];
    const pickInfo = currentPickInfo();
    const selected = getProspect(ui.selectedProspectId) || draftClass[0];
    const prospects = draftClass.slice().sort((a, b) => {
      if (ui.draftSort === "pos") return a.pos.localeCompare(b.pos) || a.rank - b.rank;
      if (ui.draftSort === "pot") return scoutedValue(b, "pot") - scoutedValue(a, "pot") || a.rank - b.rank;
      if (ui.draftSort === "ovr") return scoutedValue(b, "ovr") - scoutedValue(a, "ovr") || a.rank - b.rank;
      return a.rank - b.rank;
    }).slice(0, 180);
    return `
      <div class="toolbar">
        <h2>Draft</h2>
        <select data-control="draftYear">${years.map(year => `<option value="${year}" ${Number(ui.draftYear) === year ? "selected" : ""}>${year}</option>`).join("")}</select>
        <select data-control="draftSort"><option value="rank" ${ui.draftSort === "rank" ? "selected" : ""}>Rank</option><option value="pot" ${ui.draftSort === "pot" ? "selected" : ""}>Potential</option><option value="ovr" ${ui.draftSort === "ovr" ? "selected" : ""}>Current</option><option value="pos" ${ui.draftSort === "pos" ? "selected" : ""}>Position</option></select>
        ${state.phase === "draft" ? `<button data-action="simPick">Sim Pick</button><button data-action="simRound">Sim Round</button>` : ""}
      </div>
      ${state.phase === "draft" && pickInfo ? `<div class="phase-banner"><strong>Pick ${pickInfo.overall}</strong><span>${getTeam(pickInfo.ownerTeam).abbr} - Round ${pickInfo.round}, Pick ${pickInfo.pickInRound}</span></div>` : ""}
      <div class="grid two">
        <section class="panel"><div class="panel-header"><h3>Board</h3></div><div class="table-wrap">${renderProspectTable(prospects, pickInfo)}</div></section>
        <section class="panel"><div class="panel-header"><h3>Scouting Card</h3></div><div class="panel-body">${selected ? renderProspectCard(selected) : `<div class="empty">No prospects.</div>`}</div></section>
      </div>
    `;
  }

  function renderProspectTable(prospects, pickInfo) {
    return `<table><thead><tr><th class="num">Rank</th><th>Pos</th><th>Name</th><th>College</th><th class="num">Ovr</th><th class="num">Pot</th><th>Proj</th><th>Combine</th><th></th></tr></thead><tbody>
      ${prospects.map(prospect => `<tr>
        <td class="num">${prospect.rank}</td><td>${prospect.pos}</td><td><button class="link-button" data-action="selectProspect" data-player="${prospect.id}">${playerName(prospect)}</button></td><td>${prospect.college}</td>
        <td class="num">${scoutedValue(prospect, "ovr")}</td><td class="num">${scoutedValue(prospect, "pot")}</td><td>R${prospect.projectedRound}</td><td>${prospect.combine.forty}s / ${prospect.combine.bench} / ${prospect.combine.vert}"</td>
        <td>${state.phase === "draft" && pickInfo?.ownerTeam === USER_TEAM_ID ? `<button class="primary" data-action="draftProspect" data-player="${prospect.id}">Draft</button>` : ""}</td>
      </tr>`).join("")}
    </tbody></table>`;
  }

  function renderProspectCard(prospect) {
    return `<div class="stack">
      <div class="split"><div><strong>${playerName(prospect)}</strong><div class="muted">${prospect.pos} - ${prospect.college} - Age ${prospect.age}</div></div><span class="pill light">Proj R${prospect.projectedRound}</span></div>
      <div class="metric-row">
        <div class="metric"><label>Scouted OVR</label><strong>${scoutedValue(prospect, "ovr")}</strong><span>true accuracy: scouting</span></div>
        <div class="metric"><label>Scouted POT</label><strong>${scoutedValue(prospect, "pot")}</strong><span>${prospect.devTrait}</span></div>
        <div class="metric"><label>40</label><strong>${prospect.combine.forty}</strong><span>${prospect.combine.vert}" vert</span></div>
        <div class="metric"><label>Bench</label><strong>${prospect.combine.bench}</strong><span>college: ${prospect.collegeStats}</span></div>
      </div>
      <div><strong>Player Comp</strong><div class="muted">${prospect.comp}</div></div>
      <div class="table-wrap"><table><thead><tr><th>Attribute</th><th class="num">Grade</th><th>Attribute</th><th class="num">Grade</th></tr></thead><tbody>${renderProspectAttrs(prospect)}</tbody></table></div>
    </div>`;
  }

  function renderProspectAttrs(prospect) {
    const attrs = ["spd", "str", "agi", "acc", "awr", "inj", "thp", "tha", "cth", "rr", "car", "pbk", "rbk", "bshed", "pmv", "fmv", "tak", "man", "zon", "prs", "kpw", "kac"];
    const rows = [];
    for (let i = 0; i < attrs.length; i += 2) {
      rows.push(`<tr><td>${attrs[i].toUpperCase()}</td><td class="num">${scoutedAttribute(prospect, attrs[i])}</td><td>${(attrs[i + 1] || "").toUpperCase()}</td><td class="num">${attrs[i + 1] ? scoutedAttribute(prospect, attrs[i + 1]) : ""}</td></tr>`);
    }
    return rows.join("");
  }

  function scoutedAttribute(prospect, attr) {
    const team = getTeam(USER_TEAM_ID);
    const yearsAway = Math.max(0, prospect.year - (state.year + 1));
    const noise = (10 - team.facilities.scouting) * 1.25 + yearsAway * 3.2;
    return Math.round(clamp((prospect.ratings[attr] || 50) + seededGaussian(`${prospect.id}:${attr}:${team.facilities.scouting}:${state.year}`, 0, noise), 30, 99));
  }

  function renderFreeAgency() {
    const players = state.freeAgents.slice().sort((a, b) => b.ovr - a.ovr).slice(0, 220);
    return `<div class="toolbar"><h2>Free Agency</h2><span class="pill light">Cap ${money(capSpace(USER_TEAM_ID))}</span><span class="pill light">Roster ${teamPlayers(USER_TEAM_ID).length}/53</span></div>
      ${renderRetirementPanel()}
      <section class="panel"><div class="table-wrap"><table><thead><tr><th>Pos</th><th>Name</th><th class="num">Age</th><th class="num">Ovr</th><th class="num">Pot</th><th class="num">Ask</th><th class="num">Cap After</th><th></th></tr></thead><tbody>
      ${players.map(player => {
        const ask = estimatedAsk(player);
        return `<tr><td>${player.pos}</td><td><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button></td><td class="num">${player.age}</td><td class="num">${player.ovr}</td><td class="num">${player.pot}</td><td class="num">${money(ask)}</td><td class="num">${money(capSpace(USER_TEAM_ID) - ask)}</td><td><button data-action="signFA" data-player="${player.id}">Sign</button></td></tr>`;
      }).join("")}</tbody></table></div></section>`;
  }

  function renderRetirementPanel() {
    const team = getTeam(USER_TEAM_ID);
    const pending = (team.retiredPending || []).map(getPlayer).filter(Boolean);
    if (!pending.length) return "";
    return `<section class="panel mb-12"><div class="panel-header"><h3>Retirement Decisions</h3></div><div class="table-wrap"><table><thead><tr><th>Pos</th><th>Name</th><th class="num">Age</th><th class="num">Ovr</th><th>Injuries</th><th></th></tr></thead><tbody>
      ${pending.map(player => `<tr><td>${player.pos}</td><td>${playerName(player)}</td><td class="num">${player.age}</td><td class="num">${player.ovr}</td><td>${player.injury.history.length}</td><td><button data-action="convinceRetirement" data-player="${player.id}">Convince</button></td></tr>`).join("")}
    </tbody></table></div></section>`;
  }

  function renderTrades() {
    const partner = getTeam(ui.tradePartner) || state.teams.find(team => team.id !== USER_TEAM_ID);
    ui.tradePartner = partner.id;
    const preview = tradePreview();
    return `
      <div class="toolbar">
        <h2>Trades</h2>
        <select data-control="tradePartner">${state.teams.filter(team => team.id !== USER_TEAM_ID).map(team => `<option value="${team.id}" ${ui.tradePartner === team.id ? "selected" : ""}>${teamName(team)}</option>`).join("")}</select>
        <button class="primary" data-action="offerTrade" ${preview.accepted ? "" : "disabled"}>Offer Trade</button>
      </div>
      <section class="panel">
        <div class="panel-header"><h3>Preview</h3><span class="spacer ${preview.accepted ? "good" : "bad"}">${preview.accepted ? "Likely accepted" : "Needs more value"}</span></div>
        <div class="panel-body">
          <div class="metric-row">
            <div class="metric"><label>Detroit Sends</label><strong>${round(preview.mineValue, 1)}</strong><span>${Array.from(ui.tradeMine).length} assets</span></div>
            <div class="metric"><label>${partner.abbr} Sends</label><strong>${round(preview.theirsValue, 1)}</strong><span>${Array.from(ui.tradeTheirs).length} assets</span></div>
            <div class="metric"><label>Value Gap</label><strong class="${preview.delta >= 0 ? "good" : "bad"}">${round(preview.delta, 1)}</strong><span>premium adjusted</span></div>
            <div class="metric"><label>Cap After</label><strong>${money(preview.cap.userAfter)}</strong><span>change ${money(-preview.cap.userChange)}</span></div>
          </div>
        </div>
      </section>
      <div class="asset-grid">
        ${renderAssetPanel(USER_TEAM_ID, ui.tradeMine, "Detroit Assets", "mine")}
        ${renderAssetPanel(partner.id, ui.tradeTheirs, `${partner.abbr} Assets`, "theirs")}
      </div>
    `;
  }

  function renderAssetPanel(teamId, selectedSet, title, side) {
    const team = getTeam(teamId);
    const playerAssets = teamPlayers(teamId).sort((a, b) => b.ovr - a.ovr).map(player => `player:${player.id}`);
    const pickAssets = team.draftPicks.filter(pickItem => pickItem.year <= state.year + 3).sort((a, b) => a.year - b.year || a.round - b.round).map(pickItem => `pick:${team.id}:${pickItem.year}:${pickItem.round}:${pickItem.originalTeam}`);
    const assets = playerAssets.concat(pickAssets);
    return `<section class="panel">
      <div class="panel-header"><h3>${title}</h3><span class="spacer muted">${selectedSet.size} selected</span></div>
      <div class="asset-list">${assets.map(assetId => {
        const asset = parseAsset(assetId);
        const player = asset.type === "player" ? getPlayer(asset.playerId) : null;
        const disabled = asset.type === "player" && tradeDeadlinePassed() ? "disabled" : "";
        return `<label class="asset-row"><input type="checkbox" data-action="toggleAsset" data-side="${side}" data-asset="${assetId}" ${selectedSet.has(assetId) ? "checked" : ""} ${disabled}><span>${assetLabel(assetId)} ${player ? `<span class="muted">- ${contractSummary(player)}</span>` : ""}</span><b>${assetValue(assetId)}</b></label>`;
      }).join("")}</div>
    </section>`;
  }

  function renderFinance() {
    const team = getTeam(USER_TEAM_ID);
    const facilities = Object.entries(team.facilities);
    return `<div class="grid two">
      <section class="panel"><div class="panel-header"><h3>Money</h3></div><div class="panel-body">
        <div class="metric-row">
          <div class="metric"><label>Cash</label><strong>${money(team.cash)}</strong><span>${money(team.finances.profit)} profit</span></div>
          <div class="metric"><label>Revenue</label><strong>${money(team.finances.revenue)}</strong><span>tickets and market</span></div>
          <div class="metric"><label>Expenses</label><strong>${money(team.finances.expenses)}</strong><span>payroll and facilities</span></div>
          <div class="metric"><label>Facility Cost</label><strong>${money(facilityCost(team))}</strong><span>annual</span></div>
        </div>
      </div></section>
      <section class="panel"><div class="panel-header"><h3>Salary Cap</h3></div><div class="panel-body">
        <div class="metric-row">
          <div class="metric"><label>Cap</label><strong>${money(salaryCap())}</strong><span>2026 baseline ${money(BASE_CAP)}</span></div>
          <div class="metric"><label>Payroll</label><strong>${money(teamPayroll(USER_TEAM_ID))}</strong><span>active contracts</span></div>
          <div class="metric"><label>Dead Cap</label><strong>${money(teamDeadCap(USER_TEAM_ID))}</strong><span>accelerated bonus</span></div>
          <div class="metric"><label>Space</label><strong>${money(capSpace(USER_TEAM_ID))}</strong><span>hard cap room</span></div>
        </div>
      </div></section>
      <section class="panel wide"><div class="panel-header"><h3>Future Cap Table</h3></div><div class="table-wrap">${renderFutureCapTable()}</div></section>
      <section class="panel wide"><div class="panel-header"><h3>Release / Trade Cap Planning</h3></div><div class="table-wrap">${renderCapPlanningPanel()}</div></section>
      <section class="panel wide"><div class="panel-header"><h3>Extensions</h3></div><div class="table-wrap">${renderExtensionPanel()}</div></section>
      <section class="panel wide"><div class="panel-header"><h3>Facilities</h3></div><div class="panel-body grid three">
        ${facilities.map(([kind, level]) => {
          const cost = round((level + 1) ** 1.7 * (kind === "stadium" ? 4.2 : kind === "coaching" ? 3.8 : 3.1), 1);
          return `<div class="metric"><label>${kind[0].toUpperCase() + kind.slice(1)}</label><strong>${level}/10</strong><span><div class="progress"><span style="width:${level * 10}%"></span></div></span><button data-action="upgradeFacility" data-kind="${kind}" ${level >= 10 ? "disabled" : ""}>Upgrade ${money(cost)}</button></div>`;
        }).join("")}
      </div></section>
    </div>`;
  }

  function renderFutureCapTable() {
    const years = Array.from({ length: 5 }, (_, index) => state.year + index);
    return `<table><thead><tr><th class="num">Year</th><th class="num">Cap</th><th class="num">Payroll</th><th class="num">Dead Cap</th><th class="num">Space</th><th class="num">Signed</th></tr></thead><tbody>
      ${years.map(year => `<tr><td class="num">${year}</td><td class="num">${money(salaryCap(year))}</td><td class="num">${money(teamPayroll(USER_TEAM_ID, year))}</td><td class="num">${money(teamDeadCap(USER_TEAM_ID, year))}</td><td class="num ${capSpace(USER_TEAM_ID, year) >= 0 ? "good" : "bad"}">${money(capSpace(USER_TEAM_ID, year))}</td><td class="num">${teamPlayers(USER_TEAM_ID).filter(player => capHit(player, year) > 0).length}</td></tr>`).join("")}
    </tbody></table>`;
  }

  function renderCapPlanningPanel() {
    const players = teamPlayers(USER_TEAM_ID).filter(player => player.contract).sort((a, b) => capHit(b) - capHit(a)).slice(0, 28);
    return `<table><thead><tr><th>Pos</th><th>Name</th><th class="num">Age</th><th class="num">Ovr</th><th class="num">Cap Hit</th><th class="num">Release Dead</th><th class="num">Release Savings</th><th class="num">Post-June Now</th><th class="num">Post-June Next</th><th class="num">Trade Dead</th><th class="num">Trade Savings</th></tr></thead><tbody>
      ${players.map(player => {
        const hit = capHit(player);
        const releaseDead = deadCapIfRelease(player);
        const postJune = deadCapIfRelease(player, state.year, true);
        const tradeDead = deadCapIfTrade(player);
        return `<tr><td>${player.pos}</td><td><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button></td><td class="num">${player.age}</td><td class="num">${player.ovr}</td><td class="num">${money(hit)}</td><td class="num">${money(releaseDead.current)}</td><td class="num ${hit - releaseDead.current >= 0 ? "good" : "bad"}">${money(hit - releaseDead.current)}</td><td class="num">${money(postJune.current)}</td><td class="num">${money(postJune.next)}</td><td class="num">${money(tradeDead)}</td><td class="num ${hit - tradeDead >= 0 ? "good" : "bad"}">${money(hit - tradeDead)}</td></tr>`;
      }).join("")}
    </tbody></table>`;
  }

  function renderExtensionPanel() {
    const candidates = teamPlayers(USER_TEAM_ID)
      .filter(player => player.contract)
      .sort((a, b) => {
        const ai = currentYearIndex(a);
        const bi = currentYearIndex(b);
        const ar = a.contract.years - ai;
        const br = b.contract.years - bi;
        return ar - br || b.ovr - a.ovr;
      })
      .slice(0, 24);
    return `<table><thead><tr><th>Pos</th><th>Name</th><th class="num">Age</th><th class="num">Ovr</th><th class="num">Pot</th><th class="num">Left</th><th class="num">Current Hit</th><th class="num">Projected AAV</th><th class="num">New Hit</th><th class="num">Cap After</th><th></th></tr></thead><tbody>
      ${candidates.map(player => {
        const offer = extensionOffer(player);
        const oldHit = capHit(player);
        const newHit = contractYearHit(offer, 0);
        const after = capSpace(USER_TEAM_ID) + oldHit - newHit;
        const idx = currentYearIndex(player);
        return `<tr><td>${player.pos}</td><td><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button></td><td class="num">${player.age}</td><td class="num">${player.ovr}</td><td class="num">${player.pot}</td><td class="num">${player.contract.years - idx}y</td><td class="num">${money(oldHit)}</td><td class="num">${money(contractAav(offer))}</td><td class="num">${money(newHit)}</td><td class="num ${after >= 0 ? "good" : "bad"}">${money(after)}</td><td><button data-action="extendPlayer" data-player="${player.id}" ${after < -1 ? "disabled" : ""}>Extend</button></td></tr>`;
      }).join("")}
    </tbody></table>`;
  }

  function contractYearHit(contract, index) {
    if (index < 0 || index >= contract.years) return 0;
    const proration = index < contract.bonusYears ? contract.signingBonus / contract.bonusYears : 0;
    return contract.salaries[index] + proration;
  }

  function renderRecords() {
    const labels = {
      gamePassYds: "Game Passing Yards", gamePassTd: "Game Passing TD", gameRushYds: "Game Rushing Yards", gameRushTd: "Game Rushing TD", gameRecYds: "Game Receiving Yards", gameRecTd: "Game Receiving TD", gameSacks: "Game Sacks", gameDefInt: "Game Defensive INT",
      seasonPassYds: "Season Passing Yards", seasonPassTd: "Season Passing TD", seasonRushYds: "Season Rushing Yards", seasonRushTd: "Season Rushing TD", seasonRecYds: "Season Receiving Yards", seasonRecTd: "Season Receiving TD", seasonSacks: "Season Sacks", seasonDefInt: "Season Defensive INT"
    };
    return `<div class="toolbar"><h2>Records</h2></div><div class="record-book">${Object.entries(labels).map(([key, label]) => {
      const record = state.records[key];
      return `<section class="panel"><div class="panel-header"><h3>${label}</h3></div><div class="panel-body"><strong>${record.value}</strong><div class="muted">${record.player || "None"} - ${record.team || ""} - ${record.year || ""}</div></div></section>`;
    }).join("")}</div>`;
  }

  function renderAwards() {
    return `<div class="grid two">
      <section class="panel"><div class="panel-header"><h3>Current Races</h3></div><div class="panel-body">${renderAwardsRace()}</div></section>
      <section class="panel"><div class="panel-header"><h3>History</h3></div><div class="panel-body">${state.awardsHistory.length ? state.awardsHistory.map(season => `<div class="stack mb-12"><strong>${season.year}: ${season.champion}</strong><ul class="mini-list">${season.awards.map(item => `<li><span>${item.award}</span><b>${item.player} (${item.team})</b></li>`).join("")}</ul></div>`).join("") : `<div class="empty">No completed seasons.</div>`}</div></section>
    </div>`;
  }

  function renderAwardsRace() {
    const race = [
      ["MVP", state.players.filter(player => player.pos === "QB").sort((a, b) => mvpScore(b) - mvpScore(a)).slice(0, 5), mvpScore],
      ["OPOY", state.players.filter(player => ["QB", "RB", "WR", "TE"].includes(player.pos)).sort((a, b) => opoyScore(b) - opoyScore(a)).slice(0, 5), opoyScore],
      ["DPOY", state.players.filter(player => ["DE", "DT", "LB", "CB", "S"].includes(player.pos)).sort((a, b) => dpoyScore(b) - dpoyScore(a)).slice(0, 5), dpoyScore]
    ];
    return `<div class="grid three">${race.map(([label, players, scorer]) => `<div><div class="split"><strong>${label}</strong><span class="muted">Top 5</span></div><ul class="mini-list">${players.map(player => `<li><span>${playerName(player)} <span class="muted">${getTeam(player.teamId)?.abbr || "FA"}</span></span><b>${round(scorer(player), 1)}</b></li>`).join("")}</ul></div>`).join("")}</div>`;
  }

  function renderSettings() {
    return `<div class="grid two">
      <section class="panel"><div class="panel-header"><h3>Save</h3></div><div class="panel-body stack">
        <button data-action="returnHub">League Dashboard</button>
        <button data-action="manualSave">Save Now</button>
        <button data-action="exportSave">Export Save</button>
        <textarea data-control="importText" placeholder="Save JSON">${escapeHtml(ui.importText)}</textarea>
        <button data-action="importSave">Import Save</button>
      </div></section>
      <section class="panel"><div class="panel-header"><h3>Device Access</h3></div><div class="panel-body stack">
        <div><strong>This device</strong><div class="muted">${escapeHtml(location.origin)}</div></div>
        <div><strong>Same Wi-Fi</strong><div class="muted">Run the server with: py -m http.server 5173 --bind 0.0.0.0 --directory gridiron-gm. Then open http://YOUR_IPV4_ADDRESS:5173/ from the phone or laptop.</div></div>
        <div><strong>Anywhere</strong><div class="muted">Deploy the gridiron-gm folder to GitHub Pages, Cloudflare Pages, Netlify, or another static host. Saves are per browser; use export/import to move them.</div></div>
      </div></section>
      <section class="panel"><div class="panel-header"><h3>Reset</h3></div><div class="panel-body stack">
        <button class="danger" data-action="newLeague">New League</button>
      </div></section>
    </div>`;
  }

  function statLeaders(key, count) {
    return state.players.slice().sort((a, b) => (b.stats.season[key] || 0) - (a.stats.season[key] || 0)).slice(0, count);
  }

  function positionOrder(pos) {
    return POSITIONS.indexOf(pos);
  }

  function injuryLabel(player) {
    return player.injury.status === "Healthy" ? `<span class="good">Healthy</span>` : `<span class="bad">${player.injury.status} (${player.injury.weeks})</span>`;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }

  function sortDomTable(header) {
    const table = header.closest("table");
    const tbody = table?.querySelector("tbody");
    if (!table || !tbody) return;
    const headers = Array.from(header.parentElement.children);
    const index = headers.indexOf(header);
    const direction = header.dataset.sortDirection === "asc" ? "desc" : "asc";
    headers.forEach(item => {
      item.classList.remove("sorted-asc", "sorted-desc");
      delete item.dataset.sortDirection;
    });
    header.dataset.sortDirection = direction;
    header.classList.add(direction === "asc" ? "sorted-asc" : "sorted-desc");
    const parse = value => {
      const cleaned = value.replace(/[$,%]/g, "").replace(/M\b/i, "").trim();
      const number = Number(cleaned);
      return Number.isFinite(number) && cleaned !== "" ? number : value.toLowerCase();
    };
    const rows = Array.from(tbody.querySelectorAll("tr"));
    rows.sort((a, b) => {
      const av = parse(a.children[index]?.innerText || "");
      const bv = parse(b.children[index]?.innerText || "");
      if (typeof av === "number" && typeof bv === "number") return direction === "asc" ? av - bv : bv - av;
      return direction === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    rows.forEach(row => tbody.appendChild(row));
  }

  app.addEventListener("click", async event => {
    const header = event.target.closest("th");
    if (header) {
      sortDomTable(header);
      return;
    }
    if (event.target.classList?.contains("modal-backdrop")) {
      ui.profileOpen = false;
      render();
      return;
    }
    const tab = event.target.closest("[data-tab]");
    if (tab) {
      ui.tab = tab.dataset.tab;
      ui.toast = "";
      save();
      render();
      return;
    }
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    ui.toast = "";
    if (action === "loadLeague") await loadLeague(target.dataset.league);
    else if (action === "deleteLeague") {
      if (confirmAction("Delete this league save? This cannot be undone.")) await deleteLeague(target.dataset.league);
    } else if (action === "createLeague") {
      try {
        await migrateLocalLeaguePayloads();
        const leagueName = ui.newLeagueName.trim();
        ui.screen = "game";
        ui.tab = "dashboard";
        ui.profileOpen = false;
        createNewLeague(leagueName);
        ui.newLeagueName = "";
        await save();
        render();
      } catch (error) {
        console.error(error);
        state = null;
        ui.screen = "hub";
        ui.toast = "New league creation failed.";
        render();
      }
    } else if (action === "importLeagueFromHub") {
      if (!confirmAction("Import this save as a separate league?")) return;
      await importLeagueFromText();
    } else if (action === "advance") advance();
    else if (action === "returnHub") {
      await save();
      state = null;
      ui.screen = "hub";
      render();
    }
    else if (action === "selectPlayer") {
      ui.selectedPlayerId = target.dataset.player;
      ui.profileOpen = true;
      render();
    } else if (action === "closeProfile") {
      ui.profileOpen = false;
      render();
    } else if (action === "selectPlayerTab") {
      ui.selectedPlayerId = target.dataset.player;
      ui.profileOpen = false;
      ui.tab = "roster";
      render();
    } else if (action === "release") releasePlayer(target.dataset.player);
    else if (action === "autoDepth") {
      buildDepthChart(USER_TEAM_ID);
      save();
      render();
    } else if (action === "depthUp") moveDepth(target.dataset.pos, target.dataset.player, -1);
    else if (action === "depthDown") moveDepth(target.dataset.pos, target.dataset.player, 1);
    else if (action === "selectGame") {
      ui.selectedGameId = target.dataset.game;
      render();
    } else if (action === "selectProspect") {
      ui.selectedProspectId = target.dataset.player;
      render();
    } else if (action === "draftProspect") userDraftProspect(target.dataset.player);
    else if (action === "simPick") {
      const pickInfo = currentPickInfo();
      if (pickInfo) {
        if (pickInfo.ownerTeam === USER_TEAM_ID) makeDraftSelection(pickInfo, state.draftClasses[String(pickInfo.year)][0].id);
        else aiMakePick(pickInfo);
      }
      save();
      render();
    } else if (action === "simRound") simDraftRound();
    else if (action === "signFA") signFreeAgent(target.dataset.player);
    else if (action === "convinceRetirement") convinceRetirement(target.dataset.player);
    else if (action === "toggleAsset") {
      const set = target.dataset.side === "mine" ? ui.tradeMine : ui.tradeTheirs;
      if (target.checked) set.add(target.dataset.asset);
      else set.delete(target.dataset.asset);
      render();
    } else if (action === "offerTrade") offerTrade();
    else if (action === "extendPlayer") extendPlayer(target.dataset.player);
    else if (action === "upgradeFacility") upgradeFacility(target.dataset.kind);
    else if (action === "manualSave") {
      save();
      ui.toast = "Saved.";
      render();
    } else if (action === "exportSave") {
      ui.importText = JSON.stringify(state);
      render();
    } else if (action === "importSave") {
      if (!confirmAction("Replace the current league with this imported save?")) return;
      try {
        state = JSON.parse(ui.importText);
        state.leagueId ||= newLeagueId();
        state.leagueName ||= ui.newLeagueName || "Imported Detroit League";
        migrateState();
        save();
        ui.toast = "Imported.";
      } catch {
        ui.toast = "Import failed.";
      }
      render();
    } else if (action === "newLeague") {
      if (confirmAction("Start a separate clean league? Your current league will remain saved.")) {
        ui = { ...ui, tab: "dashboard", tradeMine: new Set(), tradeTheirs: new Set(), toast: "" };
        createNewLeague(ui.newLeagueName.trim());
        await save();
        render();
      }
    }
  });

  app.addEventListener("change", event => {
    const control = event.target.closest("[data-control]");
    if (!control) return;
    const key = control.dataset.control;
    if (key === "rosterPos") ui.rosterPos = control.value;
    if (key === "playerSearch") ui.playerSearch = control.value;
    if (key === "playerSort") ui.playerSort = control.value;
    if (key === "playerScope") ui.playerScope = control.value;
    if (key === "historyYear") ui.historyYear = control.value;
    if (key === "scheduleWeek") ui.scheduleWeek = Number(control.value);
    if (key === "draftYear") ui.draftYear = Number(control.value);
    if (key === "draftSort") ui.draftSort = control.value;
    if (key === "tradePartner") {
      ui.tradePartner = control.value;
      ui.tradeTheirs.clear();
    }
    if (key === "newLeagueName") ui.newLeagueName = control.value;
    if (key === "importText") ui.importText = control.value;
    save();
    render();
  });

  app.addEventListener("input", event => {
    const control = event.target.closest("[data-control]");
    if (!control) return;
    if (control.dataset.control === "playerSearch") {
      ui.playerSearch = control.value;
      render();
    }
    if (control.dataset.control === "importText") ui.importText = control.value;
    if (control.dataset.control === "newLeagueName") ui.newLeagueName = control.value;
  });

  load();
  render();
})();
