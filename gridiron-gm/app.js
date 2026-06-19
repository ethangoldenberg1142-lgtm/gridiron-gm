(() => {
  "use strict";

  const LEGACY_SAVE_KEY = "detroit-wolverines-gm-save-v2";
  const LEAGUE_INDEX_KEY = "gridiron-gm-league-index-v1";
  const LEAGUE_SAVE_PREFIX = "gridiron-gm-league-";
  const DISCRETE_MODE_KEY = "gridiron-gm-discrete-mode";
  const MOBILE_MODE_KEY = "gridiron-gm-mobile-mode";
  const DB_NAME = "gridiron-gm-db-v1";
  const DB_STORE = "leagues";
  const CURRENT_YEAR = 2026;
  const NFL_START_YEAR = 2025;
  const NFL_2025_CAP = 279.2;
  const BASE_CAP = 301.2;
  const USER_TEAM_ID = "DET";
  const STANDARD_LEAGUE_SEED = "gridiron-standard-2026-v4";
  const NFL_LEAGUE_SEED = "gridiron-nfl-2025-v1";

  const ALL_ATTRS = ["spd", "str", "agi", "acc", "awr", "inj", "sta", "tgh", "thp", "tha", "cth", "rr", "car", "trk", "pbk", "rbk", "bshed", "pmv", "fmv", "tak", "man", "zon", "prs", "kpw", "kac"];
  const POSITIONS = ["QB", "RB", "WR", "TE", "T", "OG", "C", "DE", "DT", "LB", "CB", "S", "K", "P"];
  const DRAFT_CLASS_SIZE = 300;
  const DRAFT_SELECTIONS = 224;
  const NFL_TEAM_LABEL_TO_ID = {
    "Arizona Cardinals": "ARI", "Atlanta Falcons": "ATL", "Baltimore Ravens": "BAL", "Buffalo Bills": "BUF",
    "Carolina Panthers": "CAR", "Chicago Bears": "CHI", "Cincinnati Bengals": "CIN", "Cleveland Browns": "CLE",
    "Dallas Cowboys": "DAL", "Denver Broncos": "DEN", "Detroit Lions": "DET", "Green Bay Packers": "GB",
    "Houston Texans": "HOU", "Indianapolis Colts": "IND", "Jacksonville Jaguars": "JAX", "Kansas City Chiefs": "KC",
    "Las Vegas Raiders": "LV", "Los Angeles Chargers": "LAC", "Los Angeles Rams": "LAR", "Miami Dolphins": "MIA",
    "Minnesota Vikings": "MIN", "NY Giants": "NYG", "New York Giants": "NYG", "NY Jets": "NYJ", "New York Jets": "NYJ",
    "New England Patriots": "NE", "New Orleans Saints": "NO", "Philadelphia Eagles": "PHI", "Pittsburgh Steelers": "PIT",
    "San Francisco 49ers": "SF", "Seattle Seahawks": "SEA", "Tampa Bay Buccaneers": "TB", "Tennessee Titans": "TEN",
    "Washington Commanders": "WAS"
  };
  const NFL_POSITION_MAP = {
    HB: "RB", FB: "RB", OT: "T", LT: "T", RT: "T", G: "OG", LG: "OG", RG: "OG", LS: "C",
    EDGE: "DE", ED: "DE", LEDG: "DE", REDG: "DE", DI: "DT", IDL: "DT", DL: "DT",
    MLB: "LB", OLB: "LB", ROLB: "LB", LOLB: "LB", MIKE: "LB", SAM: "LB", WILL: "LB",
    FS: "S", SS: "S", PK: "K"
  };
  const DEPTH_NEEDS = { QB: 2, RB: 3, WR: 5, TE: 2, T: 3, OG: 3, C: 2, DE: 3, DT: 3, LB: 4, CB: 4, S: 3, K: 1, P: 1 };
  const ROSTER_PLAN = { QB: 3, RB: 4, WR: 7, TE: 3, T: 4, OG: 4, C: 2, DE: 4, DT: 4, LB: 6, CB: 6, S: 4, K: 1, P: 1 };
  const POSITION_VALUE = { QB: 1.95, RB: 0.78, WR: 1.2, TE: 0.82, T: 1.18, OG: 0.76, C: 0.72, DE: 1.28, DT: 1.04, LB: 0.92, CB: 1.18, S: 0.82, K: 0.18, P: 0.13 };
  const REGRESSION_AGES = { QB: 34, RB: 28, WR: 30, TE: 31, T: 32, OG: 31, C: 32, DE: 31, DT: 31, LB: 30, CB: 30, S: 31, K: 36, P: 37 };
  const POSITION_AGING = {
    QB: { variance: 3.4, min: 27, max: 40, declineRate: 0.82, declineSpan: 8.8, warningYears: 2.2, volatility: 0.82 },
    RB: { variance: 2.4, min: 24, max: 33, declineRate: 1.25, declineSpan: 5.8, warningYears: 2.7, volatility: 1.02 },
    WR: { variance: 2.6, min: 25, max: 36, declineRate: 1.0, declineSpan: 6.8, warningYears: 2.4, volatility: 0.92 },
    TE: { variance: 2.8, min: 26, max: 37, declineRate: 0.94, declineSpan: 7.2, warningYears: 2.2, volatility: 0.88 },
    T: { variance: 2.8, min: 27, max: 38, declineRate: 0.88, declineSpan: 7.8, warningYears: 2.0, volatility: 0.82 },
    OG: { variance: 2.7, min: 26, max: 37, declineRate: 0.92, declineSpan: 7.3, warningYears: 2.1, volatility: 0.84 },
    C: { variance: 2.8, min: 27, max: 38, declineRate: 0.86, declineSpan: 7.8, warningYears: 2.0, volatility: 0.82 },
    DE: { variance: 2.7, min: 26, max: 37, declineRate: 0.96, declineSpan: 7.0, warningYears: 2.3, volatility: 0.9 },
    DT: { variance: 2.8, min: 26, max: 38, declineRate: 0.92, declineSpan: 7.4, warningYears: 2.2, volatility: 0.88 },
    LB: { variance: 2.6, min: 25, max: 36, declineRate: 1.0, declineSpan: 6.8, warningYears: 2.4, volatility: 0.92 },
    CB: { variance: 2.5, min: 25, max: 36, declineRate: 1.05, declineSpan: 6.4, warningYears: 2.5, volatility: 0.95 },
    S: { variance: 2.7, min: 25, max: 37, declineRate: 0.96, declineSpan: 7.0, warningYears: 2.3, volatility: 0.9 },
    K: { variance: 3.8, min: 29, max: 43, declineRate: 0.62, declineSpan: 9.5, warningYears: 1.7, volatility: 0.7 },
    P: { variance: 3.8, min: 29, max: 44, declineRate: 0.6, declineSpan: 9.8, warningYears: 1.7, volatility: 0.68 }
  };
  const ROOKIE_SCALE = [7.2, 4.2, 2.35, 1.45, 1.05, 0.92, 0.84];
  const MAX_ROSTER = 53;
  const TEAM_TARGET_OVR = {
    KC: 91.5, BAL: 89.5, SF: 89, PHI: 88.5,
    BUF: 86.5, CIN: 86, DAL: 85, HOU: 85, LAR: 84, GB: 83.5, MIA: 83.5, LAC: 82.5,
    MIN: 81.5, PIT: 81, SEA: 80.5, TB: 80.5, WAS: 80, ATL: 79.5, DEN: 79, CHI: 78.5, ARI: 78, JAX: 77.5, LV: 77, IND: 76.5,
    NYJ: 75.5, NE: 75, CLE: 74.5, NO: 74, TEN: 73, CAR: 72, NYG: 72,
    DET: 65.8
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
  const BODY_PROFILES = {
    QB: { h: [75, 2.1, 70, 79], w: [222, 13, 200, 245] },
    RB: { h: [70, 1.8, 66, 74], w: [214, 13, 190, 235] },
    WR: { h: [73, 2.7, 68, 79], w: [202, 14, 175, 230] },
    TE: { h: [77, 1.7, 73, 80], w: [250, 13, 225, 275] },
    T: { h: [78, 1.7, 75, 81], w: [318, 17, 285, 355] },
    OG: { h: [76, 1.4, 73, 79], w: [314, 17, 285, 350] },
    C: { h: [75, 1.3, 72, 78], w: [306, 15, 280, 335] },
    DE: { h: [76, 2.0, 72, 80], w: [266, 22, 235, 305] },
    DT: { h: [75, 1.7, 72, 79], w: [306, 24, 275, 360] },
    LB: { h: [74, 1.8, 70, 78], w: [238, 14, 215, 260] },
    CB: { h: [71, 2.0, 67, 76], w: [194, 11, 175, 215] },
    S: { h: [72, 1.9, 68, 77], w: [207, 12, 185, 230] },
    K: { h: [72, 2.2, 67, 77], w: [202, 16, 175, 230] },
    P: { h: [73, 2.3, 68, 78], w: [210, 17, 185, 240] }
  };
  const REAL_PLAYER_COMPS = {
    QB: {
      elite: ["Patrick Mahomes", "Josh Allen", "Joe Burrow", "Justin Herbert", "C.J. Stroud"],
      mobile: ["Lamar Jackson", "Jalen Hurts", "Kyler Murray", "Michael Vick", "Anthony Richardson"],
      pocket: ["Tom Brady", "Peyton Manning", "Drew Brees", "Kirk Cousins", "Jared Goff"],
      power: ["Josh Allen", "Cam Newton", "Ben Roethlisberger", "Anthony Richardson", "Daunte Culpepper"],
      developmental: ["Jordan Love", "Will Levis", "Trey Lance", "Baker Mayfield", "Geno Smith"]
    },
    RB: {
      elite: ["LaDainian Tomlinson", "Adrian Peterson", "Christian McCaffrey", "Saquon Barkley", "Bijan Robinson"],
      speed: ["Chris Johnson", "Jamaal Charles", "Jahmyr Gibbs", "Reggie Bush", "De'Von Achane"],
      power: ["Derrick Henry", "Marshawn Lynch", "Nick Chubb", "Jonathan Taylor", "Earl Campbell"],
      balanced: ["Alvin Kamara", "Breece Hall", "Josh Jacobs", "Matt Forte", "Arian Foster"]
    },
    WR: {
      elite: ["Calvin Johnson", "Justin Jefferson", "Ja'Marr Chase", "Julio Jones", "Larry Fitzgerald"],
      speed: ["Tyreek Hill", "DeSean Jackson", "Jaylen Waddle", "DJ Moore", "Terry McLaurin"],
      size: ["Mike Evans", "A.J. Green", "Brandon Marshall", "Drake London", "DK Metcalf"],
      route: ["Davante Adams", "Stefon Diggs", "Keenan Allen", "Cooper Kupp", "Amon-Ra St. Brown"]
    },
    TE: {
      elite: ["Travis Kelce", "Rob Gronkowski", "Tony Gonzalez", "George Kittle", "Antonio Gates"],
      receiving: ["Jimmy Graham", "Darren Waller", "Evan Engram", "Dallas Goedert", "Sam LaPorta"],
      blocking: ["George Kittle", "Mark Andrews", "Jason Witten", "Heath Miller", "T.J. Hockenson"]
    },
    T: {
      elite: ["Trent Williams", "Jonathan Ogden", "Joe Thomas", "Tyron Smith", "Penei Sewell"],
      pass: ["Andrew Whitworth", "David Bakhtiari", "Lane Johnson", "Laremy Tunsil", "Ryan Ramczyk"],
      power: ["Trent Williams", "Orlando Pace", "Willie Roaf", "Jordan Mailata", "Dawand Jones"]
    },
    OG: {
      elite: ["Quenton Nelson", "Zack Martin", "Steve Hutchinson", "Alan Faneca", "Marshal Yanda"],
      power: ["Quenton Nelson", "Larry Allen", "Brandon Scherff", "Joel Bitonio", "Mike Iupati"],
      balanced: ["Zack Martin", "Joe Thuney", "Chris Lindstrom", "Wyatt Teller", "Kevin Zeitler"]
    },
    C: {
      elite: ["Jason Kelce", "Creed Humphrey", "Travis Frederick", "Maurkice Pouncey", "Nick Mangold"],
      power: ["Ryan Kelly", "Ryan Jensen", "Corey Linsley", "Alex Mack", "Frank Ragnow"],
      balanced: ["Jason Kelce", "Creed Humphrey", "Frank Ragnow", "Tyler Linderbaum", "Erik McCoy"]
    },
    DE: {
      elite: ["Myles Garrett", "T.J. Watt", "Micah Parsons", "Nick Bosa", "Von Miller"],
      speed: ["Micah Parsons", "Von Miller", "Brian Burns", "Danielle Hunter", "Dwight Freeney"],
      power: ["Myles Garrett", "Khalil Mack", "Julius Peppers", "Cameron Jordan", "Maxx Crosby"]
    },
    DT: {
      elite: ["Aaron Donald", "Chris Jones", "Quinnen Williams", "Ndamukong Suh", "Cameron Heyward"],
      rush: ["Aaron Donald", "Chris Jones", "Jalen Carter", "Geno Atkins", "DeForest Buckner"],
      nose: ["Vince Wilfork", "Dexter Lawrence", "Vita Vea", "Haloti Ngata", "D.J. Reader"]
    },
    LB: {
      elite: ["Ray Lewis", "Luke Kuechly", "Fred Warner", "Patrick Willis", "Roquan Smith"],
      coverage: ["Fred Warner", "Lavonte David", "Shaquille Leonard", "Demario Davis", "Bobby Wagner"],
      downhill: ["Ray Lewis", "Patrick Willis", "Brian Urlacher", "Jeremiah Owusu-Koramoah", "Zach Thomas"]
    },
    CB: {
      elite: ["Darrelle Revis", "Sauce Gardner", "Patrick Surtain II", "Jalen Ramsey", "Champ Bailey"],
      press: ["Richard Sherman", "Jalen Ramsey", "Aqib Talib", "Marshon Lattimore", "Stephon Gilmore"],
      speed: ["Deion Sanders", "Denzel Ward", "Tariq Woolen", "Dominique Rodgers-Cromartie", "Trent McDuffie"]
    },
    S: {
      elite: ["Ed Reed", "Troy Polamalu", "Derwin James", "Earl Thomas", "Minkah Fitzpatrick"],
      coverage: ["Ed Reed", "Earl Thomas", "Kevin Byard", "Jessie Bates III", "Antoine Winfield Jr."],
      box: ["Troy Polamalu", "Derwin James", "Kam Chancellor", "Brian Dawkins", "Budda Baker"]
    },
    K: { balanced: ["Justin Tucker", "Harrison Butker", "Adam Vinatieri", "Evan McPherson", "Brandon Aubrey"] },
    P: { balanced: ["Johnny Hekker", "Michael Dickson", "Thomas Morstead", "A.J. Cole", "Bryan Anger"] }
  };
  const DEFAULT_ATTR_PROFILE = {
    spd: [-8, 8, 35, 92], str: [-8, 10, 30, 94], agi: [-8, 8, 35, 92], acc: [-7, 8, 35, 92],
    awr: [-2, 7, 35, 96], inj: [2, 9, 45, 99], sta: [4, 7, 55, 99], tgh: [1, 8, 45, 99],
    thp: [-30, 8, 20, 55], tha: [-30, 8, 20, 55], cth: [-12, 10, 25, 90], rr: [-14, 10, 25, 90],
    car: [-12, 9, 25, 90], trk: [-14, 10, 25, 90], pbk: [-20, 9, 20, 70], rbk: [-20, 9, 20, 70],
    bshed: [-18, 10, 20, 85], pmv: [-20, 10, 20, 85], fmv: [-20, 10, 20, 85], tak: [-14, 10, 20, 88],
    man: [-18, 10, 20, 88], zon: [-16, 10, 20, 88], prs: [-20, 10, 20, 88], kpw: [-35, 8, 15, 55], kac: [-35, 8, 15, 55]
  };
  const POSITION_ATTR_PROFILES = {
    QB: { spd: [-14, 9, 45, 90], str: [-15, 8, 35, 78], agi: [-10, 8, 45, 90], acc: [-9, 8, 45, 90], thp: [4, 5, 55, 99], tha: [3, 5, 50, 99], awr: [1, 6, 45, 99], car: [-8, 8, 30, 86], trk: [-14, 8, 25, 80] },
    RB: { spd: [6, 5, 68, 99], agi: [5, 5, 65, 99], acc: [6, 5, 68, 99], str: [-6, 8, 45, 88], car: [4, 5, 55, 99], trk: [1, 7, 45, 96], cth: [-5, 7, 38, 88], rr: [-9, 7, 32, 82], pbk: [-28, 8, 15, 55], rbk: [-24, 8, 15, 58] },
    WR: { spd: [7, 5, 70, 99], agi: [5, 5, 65, 99], acc: [6, 5, 68, 99], str: [-18, 7, 30, 78], cth: [3, 5, 50, 99], rr: [4, 5, 50, 99], car: [-9, 7, 30, 85], trk: [-16, 8, 25, 78], pbk: [-35, 7, 10, 45], rbk: [-22, 8, 20, 65] },
    TE: { spd: [-4, 6, 55, 88], agi: [-7, 6, 48, 84], acc: [-5, 6, 52, 86], str: [2, 6, 55, 94], cth: [2, 5, 48, 98], rr: [-1, 6, 45, 94], rbk: [0, 6, 42, 94], pbk: [-8, 7, 30, 82], car: [-11, 7, 28, 78] },
    T: { spd: [-22, 5, 38, 72], agi: [-24, 5, 35, 70], acc: [-20, 5, 38, 74], str: [7, 5, 58, 99], pbk: [3, 5, 50, 99], rbk: [1, 5, 48, 98], awr: [1, 6, 45, 98], cth: [-38, 6, 10, 45], car: [-38, 6, 10, 45], man: [-40, 7, 10, 45], zon: [-40, 7, 10, 45] },
    OG: { spd: [-25, 5, 35, 68], agi: [-25, 5, 35, 68], acc: [-22, 5, 35, 70], str: [8, 5, 58, 99], pbk: [1, 5, 48, 98], rbk: [3, 5, 50, 99], awr: [0, 6, 42, 96], cth: [-40, 6, 10, 42], car: [-40, 6, 10, 42] },
    C: { spd: [-26, 5, 35, 66], agi: [-24, 5, 35, 68], acc: [-23, 5, 35, 70], str: [5, 5, 55, 97], pbk: [2, 5, 48, 98], rbk: [2, 5, 48, 98], awr: [4, 5, 48, 99], cth: [-40, 6, 10, 42], car: [-40, 6, 10, 42] },
    DE: { spd: [-5, 7, 50, 91], agi: [-7, 7, 45, 88], acc: [-4, 7, 50, 92], str: [4, 6, 55, 99], bshed: [2, 5, 48, 98], pmv: [2, 6, 45, 99], fmv: [1, 7, 42, 98], tak: [0, 6, 45, 98], man: [-30, 8, 15, 62], zon: [-22, 8, 20, 72], prs: [-28, 8, 15, 65] },
    DT: { spd: [-18, 6, 38, 78], agi: [-18, 6, 35, 78], acc: [-15, 6, 40, 82], str: [8, 5, 60, 99], bshed: [4, 5, 50, 99], pmv: [3, 6, 48, 99], fmv: [-4, 7, 35, 90], tak: [1, 6, 45, 98], man: [-38, 7, 10, 48], zon: [-30, 8, 15, 60] },
    LB: { spd: [-2, 7, 55, 92], agi: [-4, 7, 50, 90], acc: [-2, 7, 55, 93], str: [-1, 7, 48, 94], tak: [3, 5, 50, 99], bshed: [0, 6, 42, 96], zon: [0, 6, 42, 96], man: [-8, 7, 30, 84], pmv: [-8, 8, 30, 84], fmv: [-7, 8, 30, 86], prs: [-12, 8, 25, 80] },
    CB: { spd: [6, 5, 70, 99], agi: [6, 5, 68, 99], acc: [6, 5, 70, 99], str: [-22, 7, 28, 75], man: [4, 5, 50, 99], zon: [2, 5, 48, 98], prs: [0, 6, 42, 96], tak: [-9, 7, 28, 85], cth: [-6, 7, 35, 88], bshed: [-28, 7, 15, 58] },
    S: { spd: [2, 6, 62, 96], agi: [1, 6, 58, 96], acc: [2, 6, 62, 97], str: [-10, 7, 38, 84], zon: [3, 5, 48, 99], man: [-1, 6, 40, 94], tak: [2, 5, 48, 98], prs: [-7, 7, 30, 86], cth: [-7, 7, 35, 86], bshed: [-16, 7, 22, 78] },
    K: { spd: [-30, 5, 30, 58], str: [-28, 6, 25, 62], agi: [-30, 6, 25, 58], acc: [-28, 6, 25, 60], kpw: [5, 5, 55, 99], kac: [5, 5, 55, 99], awr: [0, 6, 40, 96], tak: [-45, 5, 5, 35] },
    P: { spd: [-30, 5, 30, 58], str: [-28, 6, 25, 62], agi: [-30, 6, 25, 58], acc: [-28, 6, 25, 60], kpw: [6, 5, 55, 99], kac: [2, 5, 50, 98], awr: [0, 6, 40, 96], tak: [-45, 5, 5, 35] }
  };

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
  const DISCRETE_TAB_LABELS = {
    dashboard: "Overview",
    roster: "Personnel",
    depth: "Assignments",
    players: "Directory",
    schedule: "Calendar",
    standings: "Scorecard",
    stats: "Metrics",
    draft: "Pipeline",
    freeAgency: "Open Roles",
    trades: "Transactions",
    finance: "Budget",
    records: "Archive",
    awards: "Reviews",
    settings: "Settings"
  };

  const app = document.getElementById("app");
  let state = null;
  let nflContractLookupCache = null;
  let ui = {
    screen: "hub",
    tab: "dashboard",
    selectedPlayerId: null,
    profileOpen: false,
    prospectProfileOpen: false,
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
    newLeagueMode: "standard",
    newLeagueNflSetup: "real",
    importText: "",
    discreteMode: loadDiscreteModePreference(),
    mobileMode: loadMobileModePreference()
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

  function makeSeededRandom(seed) {
    let value = hashString(seed) || 1;
    return () => {
      value |= 0;
      value = value + 0x6D2B79F5 | 0;
      let t = Math.imul(value ^ value >>> 15, 1 | value);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function withRandomSeed(seed, fn) {
    const originalRandom = Math.random;
    Math.random = makeSeededRandom(seed);
    try {
      return fn();
    } finally {
      Math.random = originalRandom;
    }
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
    if (year === NFL_START_YEAR) return NFL_2025_CAP;
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

  function renderRealContractDetails(player) {
    const real = player.contract?.real;
    if (!real) return "";
    return `<div><strong>Real Contract</strong><div class="muted">${real.source}: ${money(real.totalValue)} total, ${money(real.apy)} APY, ${money(real.totalGuaranteed)} guaranteed</div></div>`;
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

  function createNewLeague(name = "", mode = "standard", options = {}) {
    const build = () => {
      const nflSetup = options.nflSetup || ui.newLeagueNflSetup || "real";
      const isNflMode = mode === "nfl";
      const startYear = isNflMode ? NFL_START_YEAR : CURRENT_YEAR;
      state = {
        version: 1,
        leagueId: newLeagueId(),
        leagueName: name || (isNflMode ? `NFL 2025 Wolverines ${new Date().toLocaleDateString()}` : `Detroit Rebuild ${new Date().toLocaleDateString()}`),
        leagueMode: isNflMode ? `nfl-${nflSetup}` : mode,
        year: startYear,
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
      if (isNflMode) {
        loadNflModePlayers(nflSetup);
      } else {
        for (const team of state.teams) {
          generateRoster(team);
          buildDepthChart(team.id);
          assignStarterContracts(team.id);
        }
        generateFreeAgents(170);
      }
      ensureFutureDraftClasses(state.year + 1);
      if (isNflMode) applyNflDraftClasses();
      else if (mode === "standard") applyStandardDraftStorylines();
      state.schedule = buildSeasonSchedule();
      resetSeasonStats();
      ui.draftYear = state.year + 1;
      ui.scheduleWeek = 1;
      const createdBody = isNflMode && nflSetup === "draft"
        ? "NFL league draft pool loaded. Detroit picks its players while the other teams draft by AI."
        : `${leagueModeLabel(mode, nflSetup)} loaded. Offseason training, free agency, and roster setup are complete. Week 1 is ready.`;
      addNews("League created", createdBody);
    };
    if (mode === "standard") return withRandomSeed(STANDARD_LEAGUE_SEED, build);
    if (mode === "nfl") return withRandomSeed(`${NFL_LEAGUE_SEED}:${options.nflSetup || ui.newLeagueNflSetup || "real"}`, build);
    return build();
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
    const startYear = state?.year || CURRENT_YEAR;
    for (let year = startYear + 1; year <= startYear + 3; year += 1) {
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
    let pot = rookieProfile ? rookieProfile.pot : generatePotential(base, age);
    pot = Math.max(base, pot);
    const ratings = makeRatingsForPosition(pos, base, pot);
    pot = Math.max(pot, ratings.ovr);
    ratings.pot = pot;
    const devTrait = rookieProfile ? rookieProfile.devTrait : devTraitFor(ratings.ovr, pot);
    const contract = rookieProfile ? makeRookieContract(rookieProfile.round, rookieProfile.pickInRound, pos, base) : makeContract(pos, base, pot, age);
    const body = rookieProfile?.height && rookieProfile?.weight ? { height: rookieProfile.height, weight: rookieProfile.weight } : makeBody(pos);
    const hidden = {
      bustGem: rookieProfile ? rookieProfile.bustGem : gaussian(0, 0.5),
      workEthic: clamp(gaussian(0.55, 0.18), 0.1, 0.98),
      longevity: clamp(gaussian(0.52, 0.22), 0.05, 0.98)
    };
    return {
      id: id("p", "nextPlayerId"),
      firstName,
      lastName,
      pos,
      height: body.height,
      weight: body.weight,
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
      regressionAge: generateRegressionAge(pos, hidden.longevity),
      injury: { status: "Healthy", weeks: 0, history: [], prone: clamp(gaussian(0.08, 0.04) + (pos === "RB" ? 0.05 : 0), 0.02, 0.28) },
      contract,
      stats: { season: blankStats(), career: blankStats(), history: [] },
      awards: [],
      morale: randInt(45, 85),
      hidden
    };
  }

  function agingProfile(pos) {
    return POSITION_AGING[pos] || { variance: 2.8, min: 25, max: 38, declineRate: 0.95, declineSpan: 7, warningYears: 2.2, volatility: 0.88 };
  }

  function generateRegressionAge(pos, longevity = 0.52) {
    const profile = agingProfile(pos);
    const median = REGRESSION_AGES[pos] || 31;
    let age = gaussian(median + (longevity - 0.5) * profile.variance * 1.6, profile.variance);
    if (chance(clamp(0.13 - longevity * 0.08, 0.03, 0.13))) age -= rand(1, 4);
    if (chance(clamp(0.06 + longevity * 0.12, 0.07, 0.2))) age += rand(1, 4);
    return Math.round(clamp(age, profile.min, profile.max));
  }

  function bodyProfile(pos) {
    return BODY_PROFILES[pos] || BODY_PROFILES.LB;
  }

  function makeBody(pos) {
    const profile = bodyProfile(pos);
    const height = Math.round(clamp(gaussian(profile.h[0], profile.h[1]), profile.h[2], profile.h[3]));
    const weight = Math.round(clamp(gaussian(profile.w[0], profile.w[1]), profile.w[2], profile.w[3]));
    return { height, weight };
  }

  function formatHeight(inches) {
    if (!inches) return "";
    return `${Math.floor(inches / 12)}'${inches % 12}"`;
  }

  function sizeLabel(player) {
    return `${formatHeight(player.height)} / ${player.weight || ""} lb`;
  }

  function bodyRoleAdjustment(player, role) {
    if (!player?.height || !player?.weight) return 0;
    const profile = bodyProfile(player.pos);
    const heightEdge = player.height - profile.h[0];
    const weightEdge = (player.weight - profile.w[0]) / 10;
    if (["passBlock", "runBlock"].includes(role)) return clamp(heightEdge * 0.35 + weightEdge * 0.55, -3.5, 4);
    if (role === "passRush") return clamp(heightEdge * 0.25 + weightEdge * 0.18, -2.5, 2.8);
    if (role === "runStop") return clamp(weightEdge * 0.6 + heightEdge * 0.12, -3, 4);
    if (role === "receiver") return clamp(heightEdge * 0.32 + weightEdge * 0.08, -2.5, 3);
    if (role === "coverage") return clamp(heightEdge * 0.28 - Math.max(0, weightEdge) * 0.05, -2, 2.5);
    if (role === "runner") return clamp(weightEdge * 0.22 - Math.max(0, heightEdge) * 0.08, -1.8, 2);
    if (role === "tackling") return clamp(weightEdge * 0.28 + heightEdge * 0.08, -2, 2.5);
    return 0;
  }

  function receiverCoverageSizeEdge(receiver, defender) {
    if (!receiver || !defender) return 0;
    return clamp((receiver.height - defender.height) * 0.45 + ((receiver.weight - defender.weight) / 10) * 0.08, -3, 3.5);
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

  function attrProfile(pos, attr) {
    return (POSITION_ATTR_PROFILES[pos] && POSITION_ATTR_PROFILES[pos][attr]) || DEFAULT_ATTR_PROFILE[attr] || [-10, 8, 20, 90];
  }

  function attrBounds(pos, attr) {
    const profile = attrProfile(pos, attr);
    return { min: profile[2], max: profile[3] };
  }

  function generatedAttr(pos, attr, ovr) {
    const [offset, sd, min, max] = attrProfile(pos, attr);
    return Math.round(clamp(gaussian(ovr + offset, sd), min, max));
  }

  function makeRatingsForPosition(pos, ovr, pot) {
    const base = {};
    for (const attr of ALL_ATTRS) base[attr] = generatedAttr(pos, attr, ovr);
    const primaries = primaryAttrsForPosition(pos);
    for (let i = 0; i < 5; i += 1) {
      const current = computeOverall(pos, base);
      const diff = ovr - current;
      if (Math.abs(diff) <= 1) break;
      const perAttr = diff / primaries.length;
      for (const attr of primaries) {
        const { min, max } = attrBounds(pos, attr);
        base[attr] = Math.round(clamp(base[attr] + perAttr, min, max));
      }
    }
    base.ovr = computeOverall(pos, base);
    base.pot = pot;
    return base;
  }

  function normalizeRatingsForPosition(pos, ratings, targetOvr = null) {
    if (!ratings) return makeRatingsForPosition(pos, targetOvr || 60, targetOvr || 60);
    for (const attr of ALL_ATTRS) {
      if (typeof ratings[attr] !== "number") ratings[attr] = generatedAttr(pos, attr, targetOvr || ratings.ovr || 60);
      const { min, max } = attrBounds(pos, attr);
      ratings[attr] = Math.round(clamp(ratings[attr], min, max));
    }
    if (targetOvr !== null) {
      const primaries = primaryAttrsForPosition(pos);
      for (let i = 0; i < 5; i += 1) {
        const current = computeOverall(pos, ratings);
        const diff = targetOvr - current;
        if (Math.abs(diff) <= 1) break;
        const perAttr = diff / primaries.length;
        for (const attr of primaries) {
          const { min, max } = attrBounds(pos, attr);
          ratings[attr] = Math.round(clamp(ratings[attr] + perAttr, min, max));
        }
      }
    }
    ratings.ovr = computeOverall(pos, ratings);
    return ratings;
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

  function leagueModeLabel(mode, nflSetup = "real") {
    if (mode === "nfl") return nflSetup === "draft" ? "NFL 2025 league draft" : "NFL 2025 current-team roster";
    return mode === "standard" ? "Standard roster set" : "Randomized roster set";
  }

  function nflModeData() {
    return window.NFL_MODE_DATA || null;
  }

  function mapNflTeam(teamLabel) {
    return NFL_TEAM_LABEL_TO_ID[teamLabel] || null;
  }

  function mapNflPosition(position) {
    const key = String(position || "").toUpperCase();
    return POSITIONS.includes(key) ? key : (NFL_POSITION_MAP[key] || "LB");
  }

  function normalizeNflContractName(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/\bmatthew\b/g, "matt")
      .replace(/\bnicholas\b/g, "nick")
      .replace(/\bchristopher\b/g, "chris")
      .replace(/\bjoshua\b/g, "josh")
      .replace(/\bwilliam\b/g, "will")
      .replace(/\bkenneth\b/g, "kenny")
      .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?/g, "")
      .replace(/[^a-z]/g, "");
  }

  function addUniqueContractLookup(map, key, contract) {
    if (!key) return;
    if (map.has(key)) map.set(key, null);
    else map.set(key, contract);
  }

  function nflContractLookup() {
    const data = nflModeData();
    if (nflContractLookupCache?.source === data) return nflContractLookupCache.lookup;
    const lookup = {
      exactByTeam: new Map(),
      exactAnyByPos: new Map(),
      lastByTeamPos: new Map()
    };
    for (const contract of data?.contracts || []) {
      const normalized = normalizeNflContractName(contract.player);
      const team = contract.team;
      const pos = mapNflPosition(contract.pos);
      if (!normalized || !team) continue;
      lookup.exactByTeam.set(`${normalized}|${team}`, contract);
      addUniqueContractLookup(lookup.exactAnyByPos, `${normalized}|${pos}`, contract);
      const parts = String(contract.player || "").trim().split(/\s+/);
      const last = normalizeNflContractName(parts.slice(1).join(" ") || parts[0]);
      addUniqueContractLookup(lookup.lastByTeamPos, `${last}|${team}|${pos}`, contract);
    }
    nflContractLookupCache = { source: data, lookup };
    return lookup;
  }

  function realNflContractForSource(source, pos) {
    const teamId = mapNflTeam(source.team);
    const normalized = normalizeNflContractName(`${source.firstName || ""} ${source.lastName || ""}`);
    const last = normalizeNflContractName(source.lastName || "");
    const contractPos = mapNflPosition(source.pos || pos);
    const lookup = nflContractLookup();
    const contractData =
      lookup.exactByTeam.get(`${normalized}|${teamId}`) ||
      lookup.lastByTeamPos.get(`${last}|${teamId}|${contractPos}`) ||
      lookup.exactAnyByPos.get(`${normalized}|${contractPos}`);
    return makeRealNflContract(contractData, contractPos);
  }

  function makeRealNflContract(contractData, pos) {
    if (!contractData) return null;
    const total = round((contractData.totalValue || 0) / 1000000, 2);
    const apy = round((contractData.apy || 0) / 1000000, 2);
    const totalGuaranteed = round((contractData.totalGuaranteed || 0) / 1000000, 2);
    if (total <= 0 || apy <= 0) return null;
    const years = Math.max(1, Math.min(10, Math.round(total / apy)));
    const modeledGuarantee = Math.min(total, Math.max(0, totalGuaranteed));
    const signingBonus = round(Math.min(total * 0.36, modeledGuarantee * 0.58), 2);
    const salaryTotal = round(Math.max(0, total - signingBonus), 2);
    let weightTotal = 0;
    for (let i = 0; i < years; i += 1) weightTotal += 0.94 + i * 0.06;
    const salaries = [];
    for (let i = 0; i < years; i += 1) salaries.push(round(salaryTotal * (0.94 + i * 0.06) / weightTotal, 2));
    const guaranteed = Array.from({ length: years }, () => 0);
    let guaranteeLeft = round(Math.max(0, modeledGuarantee - signingBonus), 2);
    for (let i = 0; i < years && guaranteeLeft > 0; i += 1) {
      const value = Math.min(salaries[i], guaranteeLeft);
      guaranteed[i] = round(value, 2);
      guaranteeLeft = round(guaranteeLeft - value, 2);
    }
    return {
      startYear: state.year,
      years,
      salaries,
      signingBonus,
      bonusYears: Math.min(years, 5),
      guaranteed,
      real: {
        source: "Over the Cap",
        sourceUrl: "https://overthecap.com/contracts",
        player: contractData.player,
        team: contractData.team,
        pos: contractData.pos || pos,
        totalValue: total,
        apy,
        totalGuaranteed
      }
    };
  }

  function cloneContract(contract) {
    return contract ? JSON.parse(JSON.stringify(contract)) : null;
  }

  function maddenStat(stats, key, fallback = 50) {
    const value = stats?.[key];
    return Number.isFinite(value) ? Number(value) : fallback;
  }

  function maddenAverage(stats, keys, fallback = 50) {
    const values = keys.map(key => maddenStat(stats, key, null)).filter(value => Number.isFinite(value) && value > 0);
    if (!values.length) return fallback;
    return round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }

  function maddenRatingsForPosition(source, pos, pot) {
    const stats = source.stats || {};
    const fallback = attr => generatedAttr(pos, attr, source.ovr || 60);
    const ratings = {
      spd: maddenStat(stats, "speed", fallback("spd")),
      str: maddenStat(stats, "strength", fallback("str")),
      agi: maddenAverage(stats, ["agility", "changeOfDirection"], fallback("agi")),
      acc: maddenStat(stats, "acceleration", fallback("acc")),
      awr: maddenAverage(stats, ["awareness", "playRecognition"], fallback("awr")),
      inj: maddenStat(stats, "injury", fallback("inj")),
      sta: maddenStat(stats, "stamina", fallback("sta")),
      tgh: maddenStat(stats, "toughness", fallback("tgh")),
      thp: maddenStat(stats, "throwPower", fallback("thp")),
      tha: maddenAverage(stats, ["throwAccuracyShort", "throwAccuracyMid", "throwAccuracyDeep", "throwOnTheRun", "throwUnderPressure"], fallback("tha")),
      cth: maddenAverage(stats, ["catching", "catchInTraffic", "spectacularCatch"], fallback("cth")),
      rr: maddenAverage(stats, ["shortRouteRunning", "mediumRouteRunning", "deepRouteRunning", "release"], fallback("rr")),
      car: maddenAverage(stats, ["carrying", "bCVision"], fallback("car")),
      trk: maddenAverage(stats, ["trucking", "breakTackle", "stiffArm"], fallback("trk")),
      pbk: maddenAverage(stats, ["passBlock", "passBlockPower", "passBlockFinesse"], fallback("pbk")),
      rbk: maddenAverage(stats, ["runBlock", "runBlockPower", "runBlockFinesse", "impactBlocking", "leadBlock"], fallback("rbk")),
      bshed: maddenAverage(stats, ["blockShedding", "pursuit", "playRecognition"], fallback("bshed")),
      pmv: maddenStat(stats, "powerMoves", fallback("pmv")),
      fmv: maddenStat(stats, "finesseMoves", fallback("fmv")),
      tak: maddenAverage(stats, ["tackle", "hitPower", "pursuit"], fallback("tak")),
      man: maddenStat(stats, "manCoverage", fallback("man")),
      zon: maddenStat(stats, "zoneCoverage", fallback("zon")),
      prs: maddenStat(stats, "press", fallback("prs")),
      kpw: maddenStat(stats, "kickPower", fallback("kpw")),
      kac: maddenStat(stats, "kickAccuracy", fallback("kac")),
      ovr: clamp(source.ovr || maddenStat(stats, "overall", computeOverall(pos, stats)), 35, 99),
      pot
    };
    for (const attr of ALL_ATTRS) ratings[attr] = Math.round(clamp(ratings[attr], 1, 99));
    return ratings;
  }

  function nflDevTrait(source, ovr, pot) {
    const abilityTypes = (source.abilities || []).map(ability => String(ability.type || "").toLowerCase());
    const hasXFactor = abilityTypes.some(type => type.includes("xfactor") || type.includes("x-factor"));
    const hasSuperstar = hasXFactor || abilityTypes.some(type => type.includes("superstar"));
    if (hasXFactor && ovr >= 97 && source.age <= 25) return "Generational";
    if (hasXFactor || ovr >= 94 || pot >= 95) return "Superstar";
    if (hasSuperstar || ovr >= 86 || pot >= 88) return "Star";
    return "Normal";
  }

  function nflPotential(source, pos) {
    const ovr = clamp(source.ovr || 60, 35, 99);
    const age = source.age || 25;
    const abilityTypes = (source.abilities || []).map(ability => String(ability.type || "").toLowerCase());
    const abilityBoost = abilityTypes.some(type => type.includes("xfactor") || type.includes("x-factor")) ? 4 : abilityTypes.some(type => type.includes("superstar")) ? 2 : 0;
    let ageGap = age <= 22 ? 8 : age <= 25 ? 5 : age <= 28 ? 2 : age <= REGRESSION_AGES[pos] ? 0 : -3;
    if (source.yearsPro <= 1) ageGap += 2;
    const raw = ovr + ageGap + abilityBoost + gaussian(0, age <= 25 ? 2.8 : 2.2);
    const floor = age >= REGRESSION_AGES[pos] + 2 ? ovr - 6 : ovr;
    return Math.round(clamp(raw, floor, 99));
  }

  function nflInjuryProne(pos, injuryRating) {
    const positional = { RB: 0.045, WR: 0.025, TE: 0.025, DE: 0.022, DT: 0.025, LB: 0.028, CB: 0.024, S: 0.024 }[pos] || 0.012;
    return clamp(0.035 + positional + Math.max(0, 90 - injuryRating) * 0.0045, 0.02, 0.3);
  }

  function makeNflPlayer(source, teamId = null) {
    const pos = mapNflPosition(source.pos);
    const ovr = clamp(source.ovr || 60, 35, 99);
    const pot = nflPotential(source, pos);
    const ratings = maddenRatingsForPosition(source, pos, pot);
    ratings.ovr = ovr;
    const hidden = {
      bustGem: gaussian(0, 0.32),
      workEthic: clamp(0.5 + Math.max(0, pot - ovr) * 0.018 + gaussian(0, 0.13), 0.1, 0.98),
      longevity: clamp((ratings.inj || 75) / 110 + gaussian(0, 0.1), 0.05, 0.98)
    };
    const body = source.height && source.weight ? { height: source.height, weight: source.weight } : makeBody(pos);
    const realContract = realNflContractForSource(source, pos);
    return {
      id: id("p", "nextPlayerId"),
      firstName: source.firstName || "Unknown",
      lastName: source.lastName || "Player",
      pos,
      height: body.height,
      weight: body.weight,
      age: source.age || generateAge(pos, true),
      yearsPro: source.yearsPro || 0,
      teamId,
      college: source.college || "Unknown",
      draftYear: state.year - (source.yearsPro || 0),
      draftPick: source.yearsPro > 0 ? "NFL" : "Rookie",
      ratings,
      ovr,
      pot,
      truePot: pot,
      devTrait: nflDevTrait(source, ovr, pot),
      regressionAge: generateRegressionAge(pos, hidden.longevity),
      injury: { status: "Healthy", weeks: 0, history: [], prone: nflInjuryProne(pos, ratings.inj) },
      contract: teamId ? (cloneContract(realContract) || makeContract(pos, ovr, pot, source.age || 25)) : null,
      realContract: realContract ? cloneContract(realContract) : null,
      stats: { season: blankStats(), career: blankStats(), history: [] },
      awards: [],
      morale: randInt(48, 86),
      hidden,
      madden: {
        source: "EA Madden NFL 26 ratings",
        team: source.team,
        originalPosition: source.pos,
        archetype: source.archetype || "",
        abilities: (source.abilities || []).map(ability => ability.label).filter(Boolean),
        stats: source.stats || {}
      }
    };
  }

  function loadNflModePlayers(setup = "real") {
    const data = nflModeData();
    if (!data?.ratings?.length) throw new Error("NFL mode data is not loaded.");
    const sources = data.ratings.filter(player => player.ovr && player.firstName && player.lastName);
    if (setup === "draft") {
      const pool = sources.map(source => makeNflPlayer(source, null)).sort((a, b) => nflRosterDraftValue(b) - nflRosterDraftValue(a));
      startNflLeagueDraft(pool);
    } else {
      loadNflCurrentTeams(sources);
      refreshTeamTargetsFromRosters();
    }
    for (const team of state.teams) buildDepthChart(team.id);
  }

  function loadNflCurrentTeams(sources) {
    const grouped = {};
    for (const source of sources) {
      const teamId = mapNflTeam(source.team);
      (grouped[teamId || "FA"] ||= []).push(source);
    }
    for (const team of state.teams) {
      const teamSources = (grouped[team.id] || []).sort((a, b) => b.ovr - a.ovr);
      for (const [index, source] of teamSources.entries()) {
        const player = makeNflPlayer(source, index < MAX_ROSTER ? team.id : null);
        if (player.teamId) state.players.push(player);
        else {
          player.contract = null;
          state.freeAgents.push(player);
        }
      }
    }
    for (const source of grouped.FA || []) {
      const player = makeNflPlayer(source, null);
      player.contract = null;
      state.freeAgents.push(player);
    }
  }

  function runNflLeagueDraft(pool) {
    const draftOrder = state.teams.slice().sort((a, b) => a.targetOverall - b.targetOverall || a.id.localeCompare(b.id));
    const rosterCounts = Object.fromEntries(state.teams.map(team => [team.id, 0]));
    for (let roundValue = 0; roundValue < MAX_ROSTER; roundValue += 1) {
      const order = roundValue % 2 === 0 ? draftOrder : draftOrder.slice().reverse();
      for (const team of order) {
        const player = selectNflLeagueDraftPlayer(pool, team.id);
        if (!player) continue;
        player.teamId = team.id;
        player.contract = cloneContract(player.realContract) || makeContract(player.pos, player.ovr, player.pot, player.age);
        state.players.push(player);
        rosterCounts[team.id] += 1;
      }
    }
    for (const player of pool) {
      player.teamId = null;
      player.contract = null;
      state.freeAgents.push(player);
    }
  }

  function startNflLeagueDraft(pool) {
    state.phase = "leagueDraft";
    state.week = 0;
    state.freeAgents = pool;
    state.currentLeagueDraft = {
      order: state.teams.slice().sort((a, b) => a.targetOverall - b.targetOverall || a.id.localeCompare(b.id)).map(team => team.id),
      overall: 1,
      round: 1,
      pick: 1,
      totalSelections: MAX_ROSTER * state.teams.length,
      complete: false,
      selections: []
    };
    ui.tab = "draft";
  }

  function currentLeagueDraftInfo() {
    const draft = state.currentLeagueDraft;
    if (!draft || draft.complete) return null;
    if (draft.overall > draft.totalSelections) return null;
    const roundValue = Math.ceil(draft.overall / state.teams.length);
    const pickInRound = ((draft.overall - 1) % state.teams.length) + 1;
    const roundOrder = roundValue % 2 === 1 ? draft.order : draft.order.slice().reverse();
    return { overall: draft.overall, round: roundValue, pickInRound, ownerTeam: roundOrder[pickInRound - 1] };
  }

  function makeLeagueDraftSelection(playerId) {
    const pickInfo = currentLeagueDraftInfo();
    if (!pickInfo) return;
    const player = state.freeAgents.find(item => item.id === playerId);
    const team = getTeam(pickInfo.ownerTeam);
    if (!player || !team || teamPlayers(team.id).length >= MAX_ROSTER) return;
    player.teamId = team.id;
    player.contract = cloneContract(player.realContract) || makeContract(player.pos, player.ovr, player.pot, player.age);
    state.freeAgents = state.freeAgents.filter(item => item.id !== player.id);
    state.players.push(player);
    state.currentLeagueDraft.selections.push({ overall: pickInfo.overall, round: pickInfo.round, pick: pickInfo.pickInRound, teamId: team.id, playerId: player.id, name: playerName(player), pos: player.pos, ovr: player.ovr });
    buildDepthChart(team.id);
    addNews("League draft pick", `${team.abbr} selected ${playerName(player)}, ${player.pos}, ${player.ovr} OVR at ${pickInfo.round}.${pickInfo.pickInRound}.`);
    state.currentLeagueDraft.overall += 1;
    state.currentLeagueDraft.round = Math.ceil(state.currentLeagueDraft.overall / state.teams.length);
    state.currentLeagueDraft.pick = ((state.currentLeagueDraft.overall - 1) % state.teams.length) + 1;
    if (state.currentLeagueDraft.overall > state.currentLeagueDraft.totalSelections || state.teams.every(teamValue => teamPlayers(teamValue.id).length >= MAX_ROSTER)) finishNflLeagueDraft();
  }

  function userLeagueDraftPlayer(playerId) {
    const pickInfo = currentLeagueDraftInfo();
    if (!pickInfo || pickInfo.ownerTeam !== USER_TEAM_ID) {
      ui.toast = "Detroit is not on the clock.";
      render();
      return;
    }
    const player = getPlayer(playerId);
    if (player && !confirmAction(`Draft ${playerName(player)} (${player.pos}, ${player.ovr} OVR) for Detroit?`)) return;
    makeLeagueDraftSelection(playerId);
    save();
    render();
  }

  function aiMakeLeagueDraftPick(pickInfo) {
    const player = selectNflLeagueDraftPlayer(state.freeAgents, pickInfo.ownerTeam, false, pickInfo);
    if (player) makeLeagueDraftSelection(player.id);
  }

  function simOneLeagueDraftPick() {
    const pickInfo = currentLeagueDraftInfo();
    if (!pickInfo) {
      finishNflLeagueDraft();
      save();
      render();
      return;
    }
    if (pickInfo.ownerTeam === USER_TEAM_ID) {
      ui.toast = "Detroit is on the clock. Pick a player from the league draft pool.";
      render();
      return;
    }
    aiMakeLeagueDraftPick(pickInfo);
    save();
    render();
  }

  function simLeagueDraftToUserPick() {
    let pickInfo = currentLeagueDraftInfo();
    if (!pickInfo) {
      finishNflLeagueDraft();
      save();
      render();
      return;
    }
    if (pickInfo.ownerTeam === USER_TEAM_ID) {
      ui.toast = "Detroit is already on the clock.";
      render();
      return;
    }
    let count = 0;
    while (pickInfo && pickInfo.ownerTeam !== USER_TEAM_ID && count < state.currentLeagueDraft.totalSelections) {
      aiMakeLeagueDraftPick(pickInfo);
      count += 1;
      pickInfo = currentLeagueDraftInfo();
    }
    if (pickInfo?.ownerTeam === USER_TEAM_ID) ui.toast = `Detroit is on the clock at ${pickInfo.round}.${pickInfo.pickInRound}.`;
    save();
    render();
  }

  function finishNflLeagueDraft() {
    if (!state.currentLeagueDraft || state.currentLeagueDraft.complete) return;
    state.currentLeagueDraft.complete = true;
    state.phase = "regular";
    state.week = 1;
    for (const team of state.teams) {
      buildDepthChart(team.id);
    }
    refreshTeamTargetsFromRosters();
    addNews("League draft complete", "Rosters are full. Week 1 is ready.");
  }

  function selectNflLeagueDraftPlayer(pool, teamId, remove = true, pickInfo = null) {
    if (!pool.length) return null;
    const needs = draftPositionNeeds(teamId);
    const preferredPositions = new Set(needs.slice(0, 5).map(item => item.pos));
    const rosterCount = teamPlayers(teamId).length;
    let bestIndex = -1;
    let bestScore = -Infinity;
    const limit = Math.min(pool.length, 180);
    for (let i = 0; i < limit; i += 1) {
      const player = pool[i];
      const need = needs.find(item => item.pos === player.pos)?.need || 0;
      const needBoost = preferredPositions.has(player.pos) ? 10 + need * 1.8 : need * 0.75;
      const specialistPenalty = (player.pos === "K" || player.pos === "P") && rosterCount < 45 ? 70 : 0;
      const roundPenalty = (player.pos === "K" || player.pos === "P") && pickInfo?.round <= 12 ? 25 : 0;
      const score = nflRosterDraftValue(player) + needBoost + POSITION_VALUE[player.pos] * 8 - specialistPenalty - roundPenalty - i * 0.06;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
    const index = bestIndex >= 0 ? bestIndex : 0;
    return remove ? pool.splice(index, 1)[0] : pool[index];
  }

  function nflRosterDraftValue(player) {
    return player.ovr * 1.7 + Math.max(0, player.pot - player.ovr) * 1.1 + POSITION_VALUE[player.pos] * 10 - Math.max(0, player.age - 29) * 1.3;
  }

  function refreshTeamTargetsFromRosters() {
    for (const team of state.teams) {
      const rating = teamRatingSummary(team);
      team.targetOverall = rating.overall;
      team.qualitySeed = (rating.overall - 78) / 6;
    }
  }

  function generateDraftClass(year) {
    const classSize = DRAFT_CLASS_SIZE;
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
      const body = makeBody(pos);
      const prospectAge = randInt(20, 23);
      const prospect = {
        id: `d${year}-${i + 1}`,
        firstName: pick(FIRST_NAMES),
        lastName: pick(LAST_NAMES),
        pos,
        height: body.height,
        weight: body.weight,
        age: prospectAge,
        college: "",
        year,
        trueOvr,
        truePot,
        pot: truePot,
        devTrait,
        bustGem,
        ratings: makeRatingsForPosition(pos, trueOvr, truePot),
        combine: makeCombine(pos, trueOvr),
        collegeStats: makeCollegeStats(pos, trueOvr, truePot),
        collegeAwards: makeCollegeAwards(pos, trueOvr, truePot, prospectAge),
        comp: "",
        rank: 0,
        projectedRound: 7
      };
      players.push(prospect);
    }
    players.sort((a, b) => prospectGrade(b) - prospectGrade(a));
    assignDraftClassColleges(players);
    rankDraftClass(players);
    return players;
  }

  function applyStandardDraftStorylines() {
    const year = 2027;
    const draftClass = state.draftClasses[String(year)];
    if (!draftClass) return;
    const prospect = makeStandardMichiganQuarterback(year);
    const existingIndex = draftClass.findIndex(item => item.pos === "QB" && item.college === "Michigan");
    const replaceIndex = existingIndex >= 0 ? existingIndex : lowestRatedProspectIndex(draftClass, "QB");
    draftClass[replaceIndex >= 0 ? replaceIndex : draftClass.length - 1] = prospect;
    rankDraftClass(draftClass);
  }

  function applyNflDraftClasses() {
    const data = nflModeData();
    if (!data) return;
    replaceDraftClassWithNflSeeds(2026, data.draft2026 || [], "nfl2026");
    replaceDraftClassWithNflSeeds(2027, data.prospects2027 || [], "prospects2027");
    replaceDraftClassWithNflSeeds(2028, data.prospects2028 || [], "prospects2028");
  }

  function replaceDraftClassWithNflSeeds(year, seeds, sourceKey) {
    const generated = state.draftClasses[String(year)] || generateDraftClass(year);
    const named = [];
    const seenNames = new Set();
    for (const [index, seed] of seeds.entries()) {
      if (!seed?.name || !seed?.pos) continue;
      const key = `${seed.name}:${seed.school || ""}`.toLowerCase();
      if (seenNames.has(key)) continue;
      seenNames.add(key);
      named.push(makeNflDraftProspect(seed, year, sourceKey, index));
    }
    const namedKeys = new Set(named.map(prospect => playerName(prospect).toLowerCase()));
    const filler = generated.filter(prospect => !namedKeys.has(playerName(prospect).toLowerCase()));
    state.draftClasses[String(year)] = named.concat(filler).slice(0, DRAFT_CLASS_SIZE);
    ensureDraftClassSize(year);
    rankDraftClass(state.draftClasses[String(year)]);
  }

  function makeNflDraftProspect(seed, year, sourceKey, index) {
    const pos = mapNflPosition(seed.pos);
    const [firstName, lastName] = splitProspectName(seed.name);
    const sourceRank = seed.overall || seed.rank || index + 1;
    const yearsAway = Math.max(0, year - (state.year + 1));
    const rankStrength = 1 - Math.min(1, Math.max(0, sourceRank - 1) / (sourceKey === "nfl2026" ? 224 : 90));
    let trueOvr = Math.round(clamp(51 + rankStrength * 27 - yearsAway * 1.8 + POSITION_VALUE[pos] * 0.9 + gaussian(0, 1.8), 40, 82));
    let truePot = Math.round(clamp(trueOvr + 5 + rankStrength * 14 + yearsAway * 1.7 + gaussian(0, 3.2), trueOvr - 2, 99));
    if (sourceRank <= 3) {
      trueOvr = Math.max(trueOvr, randInt(76, 81));
      truePot = Math.max(truePot, randInt(91, 97));
    } else if (sourceRank <= 12) {
      trueOvr = Math.max(trueOvr, randInt(72, 78));
      truePot = Math.max(truePot, randInt(86, 94));
    } else if (sourceRank <= 32) {
      trueOvr = Math.max(trueOvr, randInt(68, 75));
      truePot = Math.max(truePot, randInt(81, 91));
    }
    if (sourceKey !== "nfl2026") {
      trueOvr = Math.max(42, trueOvr - yearsAway);
      truePot = Math.min(99, truePot + yearsAway);
    }
    trueOvr = Math.round(clamp(trueOvr, 40, 85));
    truePot = Math.round(clamp(truePot, Math.max(38, trueOvr - 3), 99));
    const body = bodyFromSeed(seed, pos);
    const ratings = makeRatingsForPosition(pos, trueOvr, truePot);
    const prospect = {
      id: `d${year}-${sourceKey}-${slugify(seed.name)}-${sourceRank}`,
      firstName,
      lastName,
      pos,
      height: body.height,
      weight: body.weight,
      age: sourceKey === "nfl2026" ? randInt(21, 23) : sourceKey === "prospects2027" ? randInt(20, 22) : randInt(19, 21),
      college: normalizeCollegeName(seed.school || "Unknown"),
      year,
      trueOvr,
      truePot,
      pot: truePot,
      devTrait: nflDraftDevTrait(trueOvr, truePot, sourceRank),
      bustGem: nflDraftBustGem(sourceRank),
      ratings,
      combine: makeCombine(pos, trueOvr),
      collegeStats: seed.stats || makeCollegeStats(pos, trueOvr, truePot),
      collegeAwards: nflDraftResume(pos, trueOvr, truePot, sourceRank, sourceKey),
      comp: "",
      rank: 0,
      projectedRound: clamp(Math.ceil(sourceRank / 32), 1, 7),
      sourceRank,
      source: sourceKey
    };
    prospect.ratings.pot = truePot;
    return prospect;
  }

  function nflDraftDevTrait(trueOvr, truePot, sourceRank) {
    if (sourceRank <= 2 && trueOvr >= 78 && truePot >= 96) return "Generational";
    if (sourceRank <= 8 && truePot >= 92) return "Superstar";
    if (truePot >= 87 || trueOvr >= 74) return "Star";
    return "Normal";
  }

  function nflDraftBustGem(sourceRank) {
    const base = sourceRank <= 8 ? 0.55 : sourceRank <= 32 ? 0.25 : sourceRank <= 96 ? 0 : -0.12;
    return clamp(base + gaussian(0, 0.58), -1.7, 1.7);
  }

  function nflDraftResume(pos, ovr, pot, sourceRank, sourceKey) {
    const awards = makeCollegeAwards(pos, ovr, pot, sourceKey === "prospects2028" ? 20 : 21);
    if (sourceRank <= 5) awards.unshift("Consensus top-5 prospect");
    else if (sourceRank <= 32) awards.unshift("Projected first-round pick");
    if (["QB", "RB", "WR"].includes(pos) && sourceRank <= 12 && !awards.some(award => award.includes("Heisman"))) awards.push("Heisman watch list");
    return Array.from(new Set(awards));
  }

  function splitProspectName(name) {
    const parts = String(name || "").replace(/\s+/g, " ").trim().split(" ");
    const firstName = parts.shift() || "Unknown";
    const lastName = parts.join(" ") || "Prospect";
    return [capitalizeName(firstName), capitalizeName(lastName)];
  }

  function normalizeCollegeName(name) {
    const value = String(name || "").replace(/\s+/g, " ").trim();
    const abbreviations = new Set(["LSU", "USC", "UCLA", "TCU", "SMU", "BYU", "UNLV", "UTSA", "UCF"]);
    return value.split(" ").map(part => {
      const clean = part.replace(/[^A-Za-z]/g, "").toUpperCase();
      if (abbreviations.has(clean)) return part.toUpperCase();
      if (part === "(FL)" || part === "(OH)") return part;
      return capitalizeName(part.toLowerCase());
    }).join(" ");
  }

  function capitalizeName(value) {
    return String(value || "").split("-").map(part => part ? part[0].toUpperCase() + part.slice(1) : part).join("-");
  }

  function slugify(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function bodyFromSeed(seed, pos) {
    const height = parseHeight(seed.height);
    const weight = Number(seed.weight || 0);
    if (height && weight) return { height, weight };
    return makeBody(pos);
  }

  function parseHeight(value) {
    const match = String(value || "").match(/(\d+)'\s*(\d+)(?:\s+(\d+)\/(\d+))?/);
    if (!match) return 0;
    const fraction = match[3] && match[4] ? Number(match[3]) / Number(match[4]) : 0;
    return Math.round(Number(match[1]) * 12 + Number(match[2]) + fraction);
  }

  function lowestRatedProspectIndex(draftClass, pos) {
    return draftClass
      .map((prospect, index) => ({ prospect, index }))
      .filter(item => !pos || item.prospect.pos === pos)
      .sort((a, b) => prospectGrade(a.prospect) - prospectGrade(b.prospect))[0]?.index ?? -1;
  }

  function makeStandardMichiganQuarterback(year) {
    const ratings = makeRatingsForPosition("QB", 85, 99);
    Object.assign(ratings, {
      spd: 76,
      str: 70,
      agi: 72,
      acc: 73,
      awr: 84,
      inj: 92,
      sta: 92,
      tgh: 88,
      thp: 88,
      tha: 87
    });
    ratings.ovr = computeOverall("QB", ratings);
    ratings.pot = 99;
    return {
      id: `d${year}-michigan-generational-qb`,
      firstName: "Andrew",
      lastName: "Whitmore",
      pos: "QB",
      height: 76,
      weight: 232,
      age: 21,
      college: "Michigan",
      year,
      trueOvr: ratings.ovr,
      truePot: 99,
      pot: 99,
      devTrait: "Generational",
      bustGem: 2.35,
      ratings,
      combine: { forty: 4.67, bench: 18, vert: 35 },
      collegeStats: "4288 yds, 43 TD, 5 INT",
      collegeAwards: ["Heisman winner", "1st Team All-Conference", "All-American", "National QB of the Year"],
      comp: "Andrew Luck / Peyton Manning",
      fixedComp: "Andrew Luck / Peyton Manning",
      rank: 0,
      projectedRound: 1
    };
  }

  function rankDraftClass(players) {
    players.sort((a, b) => prospectGrade(b) - prospectGrade(a));
    players.forEach((prospect, index) => {
      prospect.rank = index + 1;
      prospect.projectedRound = clamp(Math.ceil((index + 1) / 32), 1, 7);
      prospect.comp = prospect.fixedComp || makePlayerComp(prospect);
    });
  }

  function collegePositionLimit(pos, rankIndex) {
    if (pos === "QB") return 1;
    if (rankIndex >= 160) return 3;
    if (["WR", "CB", "LB", "DE", "DT", "T", "OG", "S"].includes(pos)) return 2;
    return 1;
  }

  function assignDraftClassColleges(players) {
    const counts = {};
    const topProgramCounts = {};
    players.forEach((prospect, index) => {
      const posCounts = counts[prospect.pos] ||= {};
      const topLimit = index < 96 ? 5 : 99;
      const candidates = shuffle(COLLEGES);
      const limit = collegePositionLimit(prospect.pos, index);
      let college = candidates.find(name => (posCounts[name] || 0) < limit && (topProgramCounts[name] || 0) < topLimit);
      if (!college) {
        college = candidates.slice().sort((a, b) => (posCounts[a] || 0) - (posCounts[b] || 0) || (topProgramCounts[a] || 0) - (topProgramCounts[b] || 0))[0];
      }
      prospect.college = college;
      posCounts[college] = (posCounts[college] || 0) + 1;
      if (index < 160) topProgramCounts[college] = (topProgramCounts[college] || 0) + 1;
    });
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

  function makeCollegeAwards(pos, ovr, pot, age) {
    const grade = ovr * 0.62 + pot * 0.38;
    const seasons = clamp(age - 18, 1, 4);
    const experience = seasons / 4;
    const awards = [];
    if (age <= 20 && grade >= 82 && chance(0.38)) awards.push("Freshman All-American");
    if (grade >= 84 && chance(0.24 + experience * 0.32)) awards.push(`${pick(["1st", "2nd"])} Team All-Conference`);
    if (grade >= 88 && chance(0.18 + experience * 0.3)) awards.push("All-American");
    if (grade >= 91 && ["QB", "RB", "WR"].includes(pos) && chance((0.16 + experience * 0.25))) awards.push("Heisman finalist");
    if (grade >= 94 && pos === "QB" && chance(0.08 + experience * 0.16)) awards.push("National QB of the Year");
    if (grade >= 92 && ["DE", "DT", "LB", "CB", "S"].includes(pos) && chance(0.1 + experience * 0.22)) awards.push("Defensive Player of the Year finalist");
    return awards;
  }

  function makePlayerComp(prospect) {
    const pools = REAL_PLAYER_COMPS[prospect.pos] || { balanced: ["Kirk Cousins", "Bobby Wagner", "Jason Kelce"] };
    const grade = prospect.trueOvr * 0.45 + prospect.truePot * 0.55;
    const r = prospect.ratings || {};
    let bucket = "balanced";
    if (prospect.pos === "QB") {
      if (grade >= 90) bucket = "elite";
      else if ((r.spd || 0) >= 78 || (r.acc || 0) >= 80) bucket = "mobile";
      else if ((r.thp || 0) >= 86 && prospect.weight >= 225) bucket = "power";
      else if ((r.tha || 0) >= 76 || (r.awr || 0) >= 76) bucket = "pocket";
      else bucket = "developmental";
    } else if (prospect.pos === "RB") {
      if (grade >= 90) bucket = "elite";
      else if ((r.spd || 0) >= 92 || (r.acc || 0) >= 92) bucket = "speed";
      else if ((r.trk || 0) >= 82 || prospect.weight >= 224) bucket = "power";
      else bucket = "balanced";
    } else if (prospect.pos === "WR") {
      if (grade >= 90) bucket = "elite";
      else if (prospect.height >= 75 || prospect.weight >= 218) bucket = "size";
      else if ((r.spd || 0) >= 92 || (r.acc || 0) >= 92) bucket = "speed";
      else bucket = "route";
    } else if (prospect.pos === "TE") {
      if (grade >= 90) bucket = "elite";
      else if ((r.cth || 0) + (r.rr || 0) > (r.rbk || 0) + (r.str || 0)) bucket = "receiving";
      else bucket = "blocking";
    } else if (["T", "OG", "C"].includes(prospect.pos)) {
      if (grade >= 90) bucket = "elite";
      else if ((r.pbk || 0) > (r.rbk || 0) + 4) bucket = "pass";
      else if ((r.str || 0) >= 86 || prospect.weight >= bodyProfile(prospect.pos).w[0] + 15) bucket = "power";
      else bucket = "balanced";
    } else if (prospect.pos === "DE") {
      if (grade >= 90) bucket = "elite";
      else if ((r.spd || 0) >= 84 || (r.fmv || 0) > (r.pmv || 0) + 5) bucket = "speed";
      else bucket = "power";
    } else if (prospect.pos === "DT") {
      if (grade >= 90) bucket = "elite";
      else if ((r.pmv || 0) + (r.fmv || 0) > (r.bshed || 0) + (r.str || 0)) bucket = "rush";
      else bucket = "nose";
    } else if (prospect.pos === "LB") {
      if (grade >= 90) bucket = "elite";
      else if ((r.zon || 0) >= (r.tak || 0)) bucket = "coverage";
      else bucket = "downhill";
    } else if (prospect.pos === "CB") {
      if (grade >= 90) bucket = "elite";
      else if ((r.spd || 0) >= 93 || prospect.height >= 74) bucket = "speed";
      else bucket = "press";
    } else if (prospect.pos === "S") {
      if (grade >= 90) bucket = "elite";
      else if ((r.zon || 0) + (r.man || 0) >= (r.tak || 0) + (r.str || 0)) bucket = "coverage";
      else bucket = "box";
    }
    const pool = pools[bucket] || pools.balanced || Object.values(pools)[0];
    return pick(pool);
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
    if (state.phase === "leagueDraft") return "League Draft";
    if (state.phase === "preseason") return `Preseason W${state.week}`;
    if (state.phase === "regular") return `Week ${state.week}`;
    if (state.phase === "playoffs") return state.playoffRound;
    if (state.phase === "draft") return "Draft";
    if (state.phase === "freeAgency") return "Free Agency";
    if (state.phase === "awards") return "Awards";
    if (state.phase === "offseason") return "Offseason";
    return state.phase;
  }

  function displayPhaseLabel() {
    if (!ui.discreteMode) return phaseLabel();
    if (state.phase === "leagueDraft") return "Staffing Draft";
    if (state.phase === "preseason" || state.phase === "regular") return `Cycle ${state.week}`;
    if (state.phase === "playoffs") return "Review Cycle";
    if (state.phase === "draft") return "Planning Board";
    if (state.phase === "freeAgency") return "Resource Review";
    if (state.phase === "awards") return "Annual Review";
    if (state.phase === "offseason") return "Planning";
    return "Active";
  }

  function displayPhaseCaption() {
    if (!ui.discreteMode) return phaseCaption();
    if (state.gm.fired) return "Access has been archived.";
    return "Workbook updates are ready to process.";
  }

  function displayTabLabel(key, label) {
    return ui.discreteMode ? (DISCRETE_TAB_LABELS[key] || label) : label;
  }

  function loadDiscreteModePreference() {
    try {
      return localStorage.getItem(DISCRETE_MODE_KEY) === "1";
    } catch {
      return false;
    }
  }

  function saveDiscreteModePreference(value) {
    try {
      localStorage.setItem(DISCRETE_MODE_KEY, value ? "1" : "0");
    } catch {
      // League saves still retain the UI setting when localStorage is unavailable.
    }
  }

  function setDiscreteMode(value) {
    ui.discreteMode = !!value;
    saveDiscreteModePreference(ui.discreteMode);
  }

  function loadMobileModePreference() {
    try {
      return localStorage.getItem(MOBILE_MODE_KEY) === "1";
    } catch {
      return false;
    }
  }

  function saveMobileModePreference(value) {
    try {
      localStorage.setItem(MOBILE_MODE_KEY, value ? "1" : "0");
    } catch {
      // League saves still retain the UI setting when localStorage is unavailable.
    }
  }

  function setMobileMode(value) {
    ui.mobileMode = !!value;
    saveMobileModePreference(ui.mobileMode);
  }

  function save() {
    if (!state) return Promise.resolve();
    state.updatedAt = Date.now();
    const packed = {
      state,
      ui: { ...ui, screen: "game", tradeMine: Array.from(ui.tradeMine), tradeTheirs: Array.from(ui.tradeTheirs), toast: "", profileOpen: false, prospectProfileOpen: false }
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
    ui.discreteMode = loadDiscreteModePreference();
    ui.mobileMode = loadMobileModePreference();
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
      const migratedUi = { ...ui, ...(packed.ui || {}), screen: "game", tradeMine: [], tradeTheirs: [], toast: "", profileOpen: false, prospectProfileOpen: false };
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
        profileOpen: false,
        prospectProfileOpen: false,
        discreteMode: loadDiscreteModePreference(),
        mobileMode: loadMobileModePreference()
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
      ui.prospectProfileOpen = false;
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

  function ensureDevelopmentFields(player) {
    player.hidden ||= {};
    if (typeof player.hidden.bustGem !== "number") player.hidden.bustGem = gaussian(0, 0.5);
    if (typeof player.hidden.workEthic !== "number") player.hidden.workEthic = clamp(gaussian(0.55, 0.18), 0.1, 0.98);
    if (typeof player.hidden.longevity !== "number") {
      const median = REGRESSION_AGES[player.pos] || 31;
      const existing = typeof player.regressionAge === "number" ? player.regressionAge : median;
      player.hidden.longevity = clamp(0.5 + (existing - median) * 0.08 + gaussian(0, 0.1), 0.05, 0.98);
    }
    const profile = agingProfile(player.pos);
    if (typeof player.regressionAge !== "number") player.regressionAge = generateRegressionAge(player.pos, player.hidden.longevity);
    player.regressionAge = Math.round(clamp(player.regressionAge, profile.min, profile.max));
  }

  function ensureBodyFields(player) {
    if (typeof player.height === "number" && typeof player.weight === "number") return;
    const body = makeBody(player.pos);
    player.height = body.height;
    player.weight = body.weight;
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
      player.ratings = normalizeRatingsForPosition(player.pos, player.ratings, player.ovr || player.ratings?.ovr || 60);
      player.ovr = player.ratings.ovr;
      syncPlayerPotential(player);
      ensureBodyFields(player);
      ensureDevelopmentFields(player);
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
    for (const player of state.retiredPlayers || []) {
      player.ratings = normalizeRatingsForPosition(player.pos, player.ratings, player.ovr || player.ratings?.ovr || 60);
      player.ovr = player.ratings.ovr;
      syncPlayerPotential(player);
      ensureBodyFields(player);
      ensureDevelopmentFields(player);
    }
    for (const draftClass of Object.values(state.draftClasses || {})) {
      for (const prospect of draftClass) {
        prospect.ratings = normalizeRatingsForPosition(prospect.pos, prospect.ratings, prospect.trueOvr || prospect.ratings?.ovr || 58);
        prospect.trueOvr = prospect.ratings.ovr;
        prospect.truePot = Math.max(prospect.truePot || prospect.trueOvr, prospect.trueOvr);
        prospect.pot = prospect.truePot;
        ensureBodyFields(prospect);
        prospect.collegeAwards ||= makeCollegeAwards(prospect.pos, prospect.trueOvr, prospect.truePot, prospect.age || 21);
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
    else if (state.phase === "leagueDraft") simLeagueDraftToUserPick();
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
        const growthWindow = clamp(((player.regressionAge || REGRESSION_AGES[player.pos]) - player.age + 3) / 10, 0, 1.2);
        const growthChance = clamp(0.035 + Math.max(0, player.truePot - player.ovr) * 0.006 + growthWindow * 0.075 + coaching * 0.006, 0.01, 0.24);
        if (player.ovr < player.truePot && chance(growthChance)) {
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

  function weightedAttrs(r, weights) {
    let total = 0;
    let weightTotal = 0;
    for (const [attr, weight] of Object.entries(weights)) {
      total += (r[attr] || 35) * weight;
      weightTotal += weight;
    }
    return total / weightTotal;
  }

  function weightedChoice(items, weightFor) {
    const weighted = items.map(item => ({ item, weight: Math.max(0, weightFor(item)) })).filter(entry => entry.weight > 0);
    if (!weighted.length) return items[0] || null;
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = rand(0, total);
    for (const entry of weighted) {
      roll -= entry.weight;
      if (roll <= 0) return entry.item;
    }
    return weighted[weighted.length - 1].item;
  }

  function defaultRoleForPos(pos) {
    if (pos === "QB") return "qbPass";
    if (pos === "RB") return "runner";
    if (["WR", "TE"].includes(pos)) return "receiver";
    if (["T", "OG", "C"].includes(pos)) return "passBlock";
    if (["DE", "DT"].includes(pos)) return "passRush";
    if (pos === "LB") return "runStop";
    if (["CB", "S"].includes(pos)) return "coverage";
    if (pos === "K") return "kick";
    if (pos === "P") return "punt";
    return "overall";
  }

  function playerSkill(player, role = "overall") {
    if (!player) return 35;
    const r = player.ratings;
    const weights = {
      overall: null,
      qbPass: { tha: 0.36, thp: 0.2, awr: 0.22, acc: 0.06, agi: 0.04, sta: 0.06, tgh: 0.06 },
      qbMobility: { spd: 0.22, acc: 0.22, agi: 0.2, car: 0.14, awr: 0.12, tgh: 0.1 },
      runner: { car: 0.21, spd: 0.17, agi: 0.16, acc: 0.14, trk: 0.14, awr: 0.09, sta: 0.05, tgh: 0.04 },
      receiver: { cth: 0.25, rr: 0.25, spd: 0.15, acc: 0.12, agi: 0.1, awr: 0.08, sta: 0.05 },
      passBlock: { pbk: 0.39, awr: 0.2, str: 0.18, agi: 0.08, tgh: 0.08, sta: 0.07 },
      runBlock: { rbk: 0.39, str: 0.22, awr: 0.16, tgh: 0.08, agi: 0.08, sta: 0.07 },
      passRush: { fmv: 0.22, pmv: 0.2, bshed: 0.17, acc: 0.11, spd: 0.08, str: 0.08, tak: 0.08, awr: 0.06 },
      runStop: { tak: 0.24, bshed: 0.22, str: 0.17, awr: 0.14, tgh: 0.08, acc: 0.07, spd: 0.05, agi: 0.03 },
      coverage: { man: 0.21, zon: 0.2, spd: 0.16, acc: 0.12, agi: 0.11, awr: 0.11, prs: 0.06, tak: 0.03 },
      tackling: { tak: 0.42, awr: 0.18, str: 0.14, spd: 0.1, acc: 0.08, tgh: 0.08 },
      kick: { kac: 0.45, kpw: 0.43, awr: 0.12 },
      punt: { kpw: 0.48, kac: 0.34, awr: 0.18 }
    }[role];
    const base = weights ? weightedAttrs(r, weights) : computeOverall(player.pos, r);
    return round(clamp(base + bodyRoleAdjustment(player, role), 20, 99), 1);
  }

  function unitRating(team, pos, count, role = null) {
    const group = starters(team, pos, count);
    if (!group.length) return 35;
    const weights = [1, 0.82, 0.7, 0.58, 0.48, 0.38, 0.3];
    let totalWeight = 0;
    let total = 0;
    group.forEach((player, index) => {
      const weight = weights[index] || 0.25;
      total += playerSkill(player, role || defaultRoleForPos(pos)) * weight;
      totalWeight += weight;
    });
    return total / totalWeight;
  }

  function gameProfile(team, opponent, home, weather) {
    const qb = starters(team, "QB", 1)[0];
    const rb = starters(team, "RB", 2);
    const wr = starters(team, "WR", 3);
    const te = starters(team, "TE", 1)[0];
    const passBlock = unitRating(team, "T", 2, "passBlock") * 0.46 + unitRating(team, "OG", 2, "passBlock") * 0.34 + unitRating(team, "C", 1, "passBlock") * 0.2;
    const runBlock = unitRating(team, "T", 2, "runBlock") * 0.38 + unitRating(team, "OG", 2, "runBlock") * 0.42 + unitRating(team, "C", 1, "runBlock") * 0.2;
    const ol = passBlock * 0.58 + runBlock * 0.42;
    const qbPass = playerSkill(qb, "qbPass");
    const rbRun = unitRating(team, "RB", 2, "runner");
    const wrRoute = unitRating(team, "WR", 3, "receiver");
    const teRecv = te ? playerSkill(te, "receiver") : 55;
    const passRush = unitRating(team, "DE", 2, "passRush") * 0.62 + unitRating(team, "DT", 2, "passRush") * 0.38;
    const runStop = unitRating(team, "DT", 2, "runStop") * 0.38 + unitRating(team, "LB", 3, "runStop") * 0.4 + unitRating(team, "DE", 2, "runStop") * 0.22;
    const coverage = unitRating(team, "CB", 3, "coverage") * 0.48 + unitRating(team, "S", 2, "coverage") * 0.32 + unitRating(team, "LB", 3, "coverage") * 0.2;
    const tackling = unitRating(team, "LB", 3, "tackling") * 0.42 + unitRating(team, "S", 2, "tackling") * 0.28 + unitRating(team, "CB", 3, "tackling") * 0.18 + unitRating(team, "DT", 2, "tackling") * 0.12;
    const offense = qbPass * 0.31 + wrRoute * 0.17 + rbRun * 0.1 + teRecv * 0.06 + passBlock * 0.16 + runBlock * 0.07 + team.facilities.coaching * 1.4;
    const defense = passRush * 0.19 + runStop * 0.19 + coverage * 0.25 + tackling * 0.12 + team.facilities.coaching * 1.2 + 18;
    const oppDefense = defensiveRating(opponent);
    const oppOffense = offensiveRating(opponent);
    const topWr = wr[0];
    const topCb = starters(opponent, "CB", 1)[0];
    const wrCb = playerSkill(topWr, "receiver") - playerSkill(topCb, "coverage") + receiverCoverageSizeEdge(topWr, topCb);
    const oppPassRush = unitRating(opponent, "DE", 2, "passRush") * 0.62 + unitRating(opponent, "DT", 2, "passRush") * 0.38;
    const oppRunStop = unitRating(opponent, "DT", 2, "runStop") * 0.4 + unitRating(opponent, "LB", 3, "runStop") * 0.42 + unitRating(opponent, "DE", 2, "runStop") * 0.18;
    const passEdge = (qbPass - 70) * 0.42 + wrCb * 0.2 + (passBlock - oppPassRush) * 0.18 + (wrRoute - defensiveCoverageRating(opponent)) * 0.11 + (weather.pass - 1) * 35;
    const rushEdge = rbRun * 0.28 + runBlock * 0.34 - oppRunStop * 0.38 + (weather.rush - 1) * 24;
    const marginEdge = offense - oppDefense + (defense - oppOffense) * 0.72 + (home ? 2.2 : 0) + (team.facilities.coaching - opponent.facilities.coaching) * 0.55;
    return { team, opponent, home, weather, qb, rb, wr, te, ol, passBlock, runBlock, passRush, runStop, coverage, tackling, qbPass, rbRun, wrRoute, teRecv, offense, defense, passEdge, rushEdge, marginEdge };
  }

  function offensiveRating(team) {
    const qb = unitRating(team, "QB", 1, "qbPass");
    const skill = unitRating(team, "WR", 3, "receiver") * 0.46 + unitRating(team, "RB", 2, "runner") * 0.27 + unitRating(team, "TE", 1, "receiver") * 0.12;
    const passBlock = unitRating(team, "T", 2, "passBlock") * 0.46 + unitRating(team, "OG", 2, "passBlock") * 0.34 + unitRating(team, "C", 1, "passBlock") * 0.2;
    const runBlock = unitRating(team, "T", 2, "runBlock") * 0.38 + unitRating(team, "OG", 2, "runBlock") * 0.42 + unitRating(team, "C", 1, "runBlock") * 0.2;
    return qb * 0.34 + skill * 0.24 + passBlock * 0.14 + runBlock * 0.1 + team.facilities.coaching * 1.3;
  }

  function defensiveRating(team) {
    return unitRating(team, "DE", 2, "passRush") * 0.15 + unitRating(team, "DT", 2, "runStop") * 0.14 + unitRating(team, "LB", 3, "runStop") * 0.16 + unitRating(team, "CB", 3, "coverage") * 0.21 + unitRating(team, "S", 2, "coverage") * 0.13 + unitRating(team, "LB", 3, "coverage") * 0.06 + team.facilities.coaching * 1.2 + 17;
  }

  function specialTeamsRating(team) {
    return unitRating(team, "K", 1, "kick") * 0.58 + unitRating(team, "P", 1, "punt") * 0.3 + team.facilities.coaching * 0.8 + 7;
  }

  function teamRatingSummary(team) {
    if (!team) return { overall: 0, offense: 0, defense: 0, specialTeams: 0 };
    const offense = round(clamp(offensiveRating(team), 35, 99), 1);
    const defense = round(clamp(defensiveRating(team), 35, 99), 1);
    const specialTeams = round(clamp(specialTeamsRating(team), 35, 99), 1);
    const overall = round(clamp(offense * 0.49 + defense * 0.45 + specialTeams * 0.06, 35, 99), 1);
    return { overall, offense, defense, specialTeams };
  }

  function teamRatingLine(team) {
    const rating = teamRatingSummary(team);
    return `OVR ${rating.overall} / OFF ${rating.offense} / DEF ${rating.defense} / ST ${rating.specialTeams}`;
  }

  function renderTeamNameWithRatings(team) {
    return `<div><strong>${teamName(team)}</strong><div class="muted">${teamRatingLine(team)}</div></div>`;
  }

  function defensiveCoverageRating(team) {
    return unitRating(team, "CB", 3, "coverage") * 0.52 + unitRating(team, "S", 2, "coverage") * 0.33 + unitRating(team, "LB", 3, "coverage") * 0.15;
  }

  function buildBoxScore(game, homeProfile, awayProfile) {
    const homeBox = makeTeamBox(homeProfile, game.homeScore, game.awayScore);
    const awayBox = makeTeamBox(awayProfile, game.awayScore, game.homeScore);
    distributeDefense(homeBox.players, homeProfile.team, awayBox.sacksAllowed, awayBox.passAtt, awayBox.rushAtt, awayBox.interceptions);
    distributeDefense(awayBox.players, awayProfile.team, homeBox.sacksAllowed, homeBox.passAtt, homeBox.rushAtt, homeBox.interceptions);
    return {
      home: homeBox,
      away: awayBox,
      summary: `${game.weather.label}, ${teamName(homeProfile.team)} ${game.homeScore}, ${teamName(awayProfile.team)} ${game.awayScore}`
    };
  }

  function makeTeamBox(profile, points, oppPoints) {
    const qbPass = playerSkill(profile.qb, "qbPass");
    const qbMobility = playerSkill(profile.qb, "qbMobility");
    const qbAccuracy = profile.qb?.ratings.tha || qbPass;
    const qbAwareness = profile.qb?.ratings.awr || qbPass;
    const oppCoverage = defensiveCoverageRating(profile.opponent);
    const oppPassRush = unitRating(profile.opponent, "DE", 2, "passRush") * 0.62 + unitRating(profile.opponent, "DT", 2, "passRush") * 0.38;
    const pressure = oppPassRush - profile.passBlock;
    const passHeavy = clamp(0.56 + profile.passEdge * 0.006 + (points < oppPoints ? 0.06 : -0.03), 0.44, 0.68);
    const plays = Math.round(clamp(61 + gaussian(0, 5) + (points + oppPoints - 43) * 0.15, 48, 76));
    const passAtt = Math.round(plays * passHeavy);
    const rushAtt = Math.max(14, plays - passAtt - randInt(0, 3));
    const compRate = clamp(0.55 + (qbAccuracy - 65) * 0.0022 + (qbAwareness - 65) * 0.0012 + profile.passEdge * 0.0022, 0.48, 0.76);
    const passCmp = Math.round(passAtt * compRate);
    const ypa = clamp(6.2 + profile.passEdge * 0.038 + (qbPass - 70) * 0.018 + (profile.wrRoute - oppCoverage) * 0.015 + gaussian(0, 0.7), 4.0, 10.8);
    const passYds = Math.round(passAtt * ypa);
    const passTd = Math.max(0, Math.round(points / 13 + (qbPass - 70) * 0.018 + profile.passEdge * 0.018 + gaussian(0, 0.75) - (profile.rushEdge > 8 ? 0.35 : 0)));
    const interceptions = Math.max(0, Math.round(rand(0, 1.05) + (68 - qbPass) * 0.017 + (oppCoverage - qbPass) * 0.012 + Math.max(0, pressure) * 0.01 + (profile.weather.turnover - 1) * 1.8));
    const ypc = clamp(4.0 + profile.rushEdge * 0.023 + (profile.rbRun - 70) * 0.012 + gaussian(0, 0.34), 2.6, 6.7);
    const rushYds = Math.round(rushAtt * ypc);
    const rushTd = Math.max(0, Math.round(points / 18 + (profile.rbRun - 70) * 0.013 + profile.rushEdge * 0.012 + gaussian(0, 0.62) - passTd * 0.15));
    const sacksAllowed = Math.max(0, Math.round(rand(0, 1.9) + Math.max(0, pressure) * 0.07 + Math.max(0, 66 - qbAwareness) * 0.018 - Math.max(0, qbMobility - 70) * 0.018));
    const players = [];
    if (profile.qb) {
      const qbRushAtt = Math.round(clamp(rand(1, 4) + (qbMobility - 65) * 0.07, 0, 9));
      const qbRushYds = Math.round(qbRushAtt * clamp(3.2 + (qbMobility - 65) * 0.045 + gaussian(0, 1.2), -0.6, 8.8));
      players.push({ playerId: profile.qb.id, passAtt, passCmp, passYds, passTd, int: interceptions, rushAtt: qbRushAtt, rushYds: qbRushYds, rushTd: chance(clamp((qbMobility - 55) * 0.006, 0.02, 0.18)) ? 1 : 0, usage: 1 });
    }
    distributeRushing(players, profile.rb, rushAtt, rushYds, rushTd);
    distributeReceiving(players, profile.wr.concat(profile.te ? [profile.te] : []).filter(Boolean), passCmp, passYds, passTd);
    const k = starters(profile.team, "K", 1)[0];
    if (k) {
      const fg = Math.max(0, Math.round((points - passTd * 7 - rushTd * 7) / 3 + rand(-0.5, 0.8)));
      players.push({ playerId: k.id, fg, fga: fg + (chance(0.18) ? 1 : 0), xp: Math.max(0, passTd + rushTd), usage: 0.2 });
    }
    const p = starters(profile.team, "P", 1)[0];
    if (p) players.push({ playerId: p.id, punts: Math.max(1, Math.round(5 - points / 12 + rand(-1, 2))), pAvg: round(39 + playerSkill(p, "punt") * 0.11 + gaussian(0, 1.7), 1), usage: 0.1 });
    return { points, passAtt, passCmp, passYds, passTd, interceptions, rushAtt, rushYds, rushTd, sacksAllowed, players };
  }

  function distributeRushing(players, backs, rushAtt, rushYds, rushTd) {
    if (!backs.length) return;
    const shares = backs.map((player, i) => Math.max(0.08, (i === 0 ? 0.66 : 0.24) * (0.75 + playerSkill(player, "runner") / 95) + gaussian(0, 0.04)));
    const total = shares.reduce((sum, value) => sum + value, 0);
    const tdWeights = backs.map((player, i) => shares[i] * (0.8 + (player.ratings.trk || playerSkill(player, "runner")) / 115));
    const tdTotal = tdWeights.reduce((sum, value) => sum + value, 0);
    let remainingTd = rushTd;
    backs.forEach((player, i) => {
      const share = shares[i] / total;
      const runner = playerSkill(player, "runner");
      const receiver = playerSkill(player, "receiver");
      const att = Math.round(rushAtt * share);
      const yds = Math.round(rushYds * share * (1 + (runner - 70) * 0.003) + gaussian(0, 5));
      const td = i === backs.length - 1 ? remainingTd : Math.min(remainingTd, Math.max(0, Math.round(rushTd * tdWeights[i] / Math.max(0.01, tdTotal))));
      remainingTd -= td;
      const rec = Math.max(0, Math.round(rand(0, 2.2) + (receiver - 60) * 0.025));
      const recYds = Math.max(0, Math.round(rec * clamp(5.4 + (player.ratings.spd - 70) * 0.045 + gaussian(0, 1.4), 2.5, 11.5)));
      players.push({ playerId: player.id, rushAtt: att, rushYds: yds, rushTd: td, rec, recYds, usage: 1 });
    });
  }

  function distributeReceiving(players, targets, completions, yards, tds) {
    if (!targets.length) return;
    const baseShares = targets.map((player, index) => {
      const posBoost = player.pos === "WR" ? 1 : 0.76;
      const receiver = playerSkill(player, "receiver");
      const explosive = ((player.ratings.spd || receiver) + (player.ratings.acc || receiver)) / 2;
      return Math.max(0.06, posBoost * (targets.length - index + 1) * (0.68 + receiver / 100) + (explosive - 70) * 0.018 + gaussian(0, 0.26));
    });
    const total = baseShares.reduce((sum, value) => sum + value, 0);
    let remainingTd = tds;
    targets.forEach((player, index) => {
      const share = baseShares[index] / total;
      const receiver = playerSkill(player, "receiver");
      const yardsSkill = ((player.ratings.spd || receiver) * 0.28 + (player.ratings.rr || receiver) * 0.36 + (player.ratings.cth || receiver) * 0.22 + (player.ratings.acc || receiver) * 0.14);
      const rec = Math.max(0, Math.round(completions * share + gaussian(0, 1.1)));
      const recYds = Math.max(0, Math.round(yards * share * (1 + (yardsSkill - 70) * 0.0035) + gaussian(0, 15)));
      const tdWeight = share * (0.75 + receiver / 115);
      const recTd = index === 0 ? Math.min(remainingTd, Math.max(0, Math.round(tds * tdWeight + rand(-0.25, 0.55)))) : (remainingTd > 0 && chance(tdWeight * 1.65) ? 1 : 0);
      remainingTd -= recTd;
      players.push({ playerId: player.id, rec, recYds, recTd, usage: 0.88 });
    });
  }

  function distributeDefense(players, team, opponentSacksAllowed, opponentPassAtt = 34, opponentRushAtt = 25, opponentInterceptions = 0) {
    const defenders = ["DE", "DT", "LB", "CB", "S"].flatMap(pos => starters(team, pos, pos === "LB" || pos === "CB" ? 3 : 2));
    const sacksById = {};
    let halfSacks = Math.round(opponentSacksAllowed * 2);
    const sackEligible = defenders.filter(defender => ["DE", "DT", "LB"].includes(defender.pos));
    while (halfSacks > 0 && sackEligible.length) {
      const defender = weightedChoice(sackEligible, player => {
        const posWeight = player.pos === "DE" ? 1.22 : player.pos === "DT" ? 0.95 : 0.66;
        return Math.max(1, playerSkill(player, "passRush") - 42) * posWeight;
      });
      const amount = halfSacks === 1 || chance(0.28) ? 0.5 : 1;
      sacksById[defender.id] = round((sacksById[defender.id] || 0) + amount, 1);
      halfSacks -= Math.round(amount * 2);
    }
    const interceptionsById = {};
    for (let i = 0; i < opponentInterceptions; i += 1) {
      const defender = weightedChoice(defenders.filter(item => ["CB", "S", "LB"].includes(item.pos)), player => {
        const posWeight = player.pos === "CB" ? 1.18 : player.pos === "S" ? 0.92 : 0.55;
        return Math.max(1, playerSkill(player, "coverage") - 45) * posWeight;
      });
      if (defender) interceptionsById[defender.id] = (interceptionsById[defender.id] || 0) + 1;
    }
    const playLoad = clamp((opponentPassAtt + opponentRushAtt) / 64, 0.78, 1.28);
    for (const defender of defenders) {
      const tackleSkill = playerSkill(defender, "tackling");
      const runSkill = playerSkill(defender, "runStop");
      const passRush = playerSkill(defender, "passRush");
      const baseTackles = { DE: 2.8, DT: 3.2, LB: 5.8, CB: 3.5, S: 4.4 }[defender.pos] || 3;
      const tackles = Math.max(0, Math.round((baseTackles + (tackleSkill - 65) * 0.045 + (opponentRushAtt - 24) * 0.035) * playLoad + gaussian(0, 1.4)));
      const tflChance = clamp(0.08 + (runSkill - 60) * 0.005 + (["DE", "DT", "LB"].includes(defender.pos) ? 0.08 : 0), 0.03, 0.42);
      const sacks = sacksById[defender.id] || 0;
      players.push({
        playerId: defender.id,
        tackles,
        tfl: chance(tflChance) ? randInt(1, runSkill >= 82 ? 3 : 2) : 0,
        sacks,
        defInt: interceptionsById[defender.id] || 0,
        ff: chance(clamp(0.025 + (tackleSkill - 65) * 0.0025 + (passRush - 70) * 0.001, 0.01, 0.09)) ? 1 : 0,
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
        const production = weeklyProductionScore(player);
        const potentialGap = player.truePot - player.ovr;
        const ageGap = player.age - (player.regressionAge || REGRESSION_AGES[player.pos]);
        const injuryWeeks = recentInjuryWeeks(player, 1);
        const growthChance = clamp(0.035 + Math.max(0, potentialGap) * 0.005 + Math.max(0, 26 - player.age) * 0.014 + team.facilities.coaching * 0.004 + production * 0.0008 - Math.max(0, ageGap) * 0.009, 0.005, 0.22);
        const declineChance = clamp((ageGap + 2) * 0.009 + injuryWeeks * 0.0009 + Math.max(0, player.ovr - player.truePot) * 0.003 - production * 0.0006, 0, 0.11);
        if (chance(growthChance)) adjustPlayer(player, rand(0.03, 0.18) + production * 0.003);
        else if (chance(declineChance)) adjustPlayer(player, -rand(0.03, 0.16));
        applyPotentialDelta(player, potentialDevelopmentDelta(player, team, false));
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

  function recentInjuryWeeks(player, yearsBack = 2) {
    return (player.injury?.history || []).filter(injury => injury.year >= state.year - yearsBack).reduce((sum, injury) => sum + injury.weeks, 0);
  }

  function recentMajorInjuries(player, yearsBack = 3) {
    return (player.injury?.history || []).filter(injury => injury.year >= state.year - yearsBack && injury.weeks >= 8).length;
  }

  function developmentAttrsForPosition(pos, direction) {
    const growth = {
      QB: ["thp", "tha", "awr"], RB: ["spd", "agi", "acc", "car", "trk"], WR: ["spd", "cth", "rr", "acc"], TE: ["cth", "rr", "rbk", "str"],
      T: ["pbk", "rbk", "str", "awr"], OG: ["pbk", "rbk", "str", "awr"], C: ["pbk", "rbk", "str", "awr"], DE: ["fmv", "pmv", "bshed", "tak"],
      DT: ["pmv", "bshed", "str", "tak"], LB: ["tak", "bshed", "zon", "awr"], CB: ["man", "zon", "prs", "spd"], S: ["zon", "tak", "man", "awr"],
      K: ["kpw", "kac", "awr"], P: ["kpw", "kac", "awr"]
    };
    const decline = {
      QB: ["thp", "tha", "agi", "acc", "sta"], RB: ["spd", "agi", "acc", "car", "trk", "sta"], WR: ["spd", "acc", "agi", "cth", "rr", "sta"], TE: ["spd", "acc", "cth", "rr", "rbk", "str"],
      T: ["pbk", "rbk", "str", "agi", "sta"], OG: ["pbk", "rbk", "str", "agi", "sta"], C: ["pbk", "rbk", "str", "awr", "sta"], DE: ["fmv", "pmv", "bshed", "acc", "str", "tak"],
      DT: ["pmv", "bshed", "str", "acc", "tak"], LB: ["spd", "acc", "tak", "bshed", "zon"], CB: ["spd", "acc", "agi", "man", "zon", "prs"], S: ["spd", "acc", "zon", "tak", "man"],
      K: ["kpw", "kac"], P: ["kpw", "kac"]
    };
    return (direction >= 0 ? growth[pos] : decline[pos]) || primaryAttrsForPosition(pos);
  }

  function adjustPlayer(player, amount) {
    const direction = amount >= 0 ? 1 : -1;
    const chancePerAttr = clamp(Math.abs(amount), 0.02, 1);
    const attrsByPos = developmentAttrsForPosition(player.pos, direction);
    for (const attr of attrsByPos) {
      if (chance(chancePerAttr)) {
        const { min, max } = attrBounds(player.pos, attr);
        player.ratings[attr] = Math.round(clamp(player.ratings[attr] + direction, min, max));
      }
    }
    updateOverall(player);
    syncPlayerPotential(player);
  }

  function syncPlayerPotential(player) {
    const current = typeof player.truePot === "number" ? player.truePot : (typeof player.pot === "number" ? player.pot : player.ovr);
    const pot = Math.round(clamp(current, player.ovr, 99));
    player.truePot = pot;
    player.pot = pot;
    if (player.ratings) player.ratings.pot = pot;
    player.devTrait = devTraitFor(player.ovr, player.pot);
  }

  function potentialDevelopmentDelta(player, team, offseason = false) {
    const profile = agingProfile(player.pos);
    const performance = weeklyProductionScore(player);
    const ageGap = player.age - (player.regressionAge || REGRESSION_AGES[player.pos]);
    const growthWindow = clamp(((player.regressionAge || REGRESSION_AGES[player.pos]) - player.age + 2) / 10, -0.45, 1.25);
    const workEthic = player.hidden?.workEthic ?? 0.55;
    const bustGem = player.hidden?.bustGem ?? 0;
    const injuryWeeks = recentInjuryWeeks(player, 2);
    const majorInjuries = recentMajorInjuries(player, 3);
    const coaching = (team.facilities.coaching || 5) - 5;
    const underCeiling = clamp((player.truePot - player.ovr) / 16, -1, 1.5);
    const lateCareer = clamp((ageGap + profile.warningYears) / profile.declineSpan, 0, 1.8);
    const performanceSignal = clamp(performance * 0.05, -0.75, 1.1);
    const growthMean = growthWindow * 0.42 + underCeiling * 0.16 + performanceSignal + coaching * 0.055 + (workEthic - 0.5) * 0.72 + bustGem * 0.36;
    const declineMean = lateCareer * (0.48 + Math.max(0, player.ovr - 72) * 0.014) + injuryWeeks * 0.04 + majorInjuries * 0.38 + Math.max(0, 68 - (player.ratings.inj || 68)) * 0.012;
    const scale = offseason ? 1 : 0.13;
    const volatility = (offseason ? 0.72 : 0.22) + profile.volatility * (offseason ? 0.22 : 0.05) + majorInjuries * 0.05 + Math.max(0, Math.abs(bustGem) - 0.7) * 0.08;
    return clamp(gaussian((growthMean - declineMean) * scale, volatility), offseason ? -4.5 : -1.1, offseason ? 3.6 : 1);
  }

  function applyPotentialDelta(player, delta) {
    const magnitude = Math.abs(delta);
    if (magnitude < 0.25 && !chance(magnitude)) return;
    let steps = Math.floor(magnitude);
    if (chance(magnitude - steps)) steps += 1;
    if (!steps) return;
    const current = typeof player.truePot === "number" ? player.truePot : player.pot;
    const next = Math.round(clamp(current + steps * Math.sign(delta), player.ovr, 99));
    if (next === current) return;
    player.truePot = next;
    player.pot = next;
    if (player.ratings) player.ratings.pot = next;
    player.devTrait = devTraitFor(player.ovr, player.pot);
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
      const profile = agingProfile(player.pos);
      const injuryPenalty = recentMajorInjuries(player, 4) * 0.07 + recentInjuryWeeks(player, 2) * 0.008;
      const ageGap = player.age - (player.regressionAge || REGRESSION_AGES[player.pos]);
      const agePressure = ageGap * 0.055 + Math.max(0, player.age - profile.max + 1) * 0.08;
      const playingTime = player.stats.season.games < 6 ? 0.08 : 0;
      const rolePressure = player.ovr < 66 && player.age >= player.regressionAge - 1 ? 0.08 : 0;
      const minRetirementAge = player.pos === "RB" ? 29 : (player.pos === "K" || player.pos === "P" ? 34 : 31);
      if (player.age >= minRetirementAge && chance(clamp(agePressure + injuryPenalty + playingTime + rolePressure, 0, 0.65))) {
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

  function developmentDelta(player, team) {
    const profile = agingProfile(player.pos);
    const performance = weeklyProductionScore(player);
    const games = player.stats?.season?.games || 0;
    const potentialGap = player.truePot - player.ovr;
    const ageGap = player.age - (player.regressionAge || REGRESSION_AGES[player.pos]);
    const longevity = player.hidden?.longevity ?? 0.5;
    const workEthic = player.hidden?.workEthic ?? 0.55;
    const bustGem = player.hidden?.bustGem ?? 0;
    const injuryWeeks = recentInjuryWeeks(player, 2);
    const majorInjuries = recentMajorInjuries(player, 3);
    const growthWindow = clamp(((player.regressionAge || REGRESSION_AGES[player.pos]) - player.age + 3) / 9, 0, 1.25);
    const declinePressure = clamp((ageGap + profile.warningYears) / profile.declineSpan, 0, 1.85);
    const potentialGrowth = Math.max(0, potentialGap) * (0.028 + growthWindow * 0.045);
    const overCapDrag = Math.max(0, -potentialGap) * 0.035;
    const performanceBonus = clamp(performance * 0.035, -0.85, 1.15);
    const playingTime = games >= 10 ? 0.08 : (games > 0 && games < 6 ? -0.25 : 0);
    const coachingBonus = ((team.facilities.coaching || 5) - 5) * 0.075;
    const workBonus = (workEthic - 0.5) * 0.85 + bustGem * 0.48;
    const injuryPenalty = injuryWeeks * 0.032 + majorInjuries * 0.22 + Math.max(0, 72 - (player.ratings.inj || 72)) * 0.008;
    const eliteDrag = Math.max(0, player.ovr - 88) * 0.055;
    const declineMean = declinePressure * profile.declineRate * (0.72 + Math.max(0, player.ovr - 72) * 0.016) * (1.12 - longevity * 0.36);
    const mean = potentialGrowth + performanceBonus + playingTime + coachingBonus + workBonus - declineMean - injuryPenalty - eliteDrag - overCapDrag;
    const volatility = profile.volatility + Math.max(0, ageGap) * 0.045 + injuryWeeks * 0.006 + Math.max(0, Math.abs(bustGem) - 0.7) * 0.12;
    return clamp(gaussian(mean, volatility), -5.5, 4.8);
  }

  function applyDevelopmentDelta(player, delta) {
    let steps = Math.floor(Math.abs(delta));
    if (chance(Math.abs(delta) - steps)) steps += 1;
    for (let i = 0; i < steps; i += 1) {
      adjustPlayer(player, delta > 0 ? rand(0.45, 0.9) : -rand(0.45, 0.9));
    }
  }

  function offseasonProgression() {
    for (const team of state.teams) {
      for (const player of teamPlayers(team.id)) {
        applyDevelopmentDelta(player, developmentDelta(player, team));
        applyPotentialDelta(player, potentialDevelopmentDelta(player, team, true));
        player.age += 1;
        player.yearsPro += 1;
        player.stats.history.push({ year: state.year, ...player.stats.season, ovr: player.ovr, pot: player.pot, team: getTeam(player.teamId)?.abbr || "FA" });
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
        const needs = draftPositionNeeds(team.id);
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

  function positionGroupProfile(teamId, pos) {
    const players = teamPlayers(teamId).filter(player => player.pos === pos && !playerIsRetired(player)).sort((a, b) => b.ovr - a.ovr);
    const starterCount = DEPTH_NEEDS[pos] || 1;
    const targetCount = ROSTER_PLAN[pos] || starterCount;
    const startersGroup = players.slice(0, starterCount);
    const topGroup = players.slice(0, Math.min(targetCount, players.length));
    const avg = items => items.length ? items.reduce((sum, player) => sum + player.ovr, 0) / items.length : 45;
    const ageRisk = startersGroup.length
      ? startersGroup.reduce((sum, player) => sum + clamp((player.age - ((player.regressionAge || REGRESSION_AGES[player.pos]) - 2)) / 5, 0, 1.8), 0) / startersGroup.length
      : 0.8;
    const futureHelp = topGroup.length
      ? topGroup.reduce((sum, player) => sum + Math.max(0, player.pot - player.ovr), 0) / topGroup.length
      : 0;
    return {
      pos,
      count: players.length,
      starterCount,
      targetCount,
      starterAvg: round(avg(startersGroup), 1),
      depthAvg: round(avg(topGroup), 1),
      shortage: Math.max(0, targetCount - players.length),
      starterShortage: Math.max(0, starterCount - players.length),
      ageRisk,
      futureHelp
    };
  }

  function draftPositionNeed(teamId, pos) {
    const profile = positionGroupProfile(teamId, pos);
    const countNeed = profile.shortage * 1.8 + profile.starterShortage * 5.5;
    const qualityNeed = clamp((77 - profile.starterAvg) * 0.34 + (72 - profile.depthAvg) * 0.18, 0, 18);
    const ageNeed = clamp(profile.ageRisk * 7.5, 0, 12);
    const upsideRelief = clamp(profile.futureHelp * 0.25, 0, 4);
    const premiumLift = POSITION_VALUE[pos] * 2.2;
    const specialistLimit = pos === "K" || pos === "P" ? -12 : 0;
    return round(clamp(countNeed + qualityNeed + ageNeed + premiumLift + specialistLimit - upsideRelief, 0, 36), 1);
  }

  function draftPositionNeeds(teamId) {
    return POSITIONS
      .map(pos => ({ pos, need: draftPositionNeed(teamId, pos), profile: positionGroupProfile(teamId, pos) }))
      .sort((a, b) => b.need - a.need || POSITION_VALUE[b.pos] - POSITION_VALUE[a.pos]);
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
    if (state.phase === "leagueDraft") {
      if (noisy) ui.toast = "Complete the league draft before signing free agents.";
      return false;
    }
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
    if (overall > DRAFT_SELECTIONS) return null;
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
    const poolSize = pickInfo.round <= 1 ? 70 : pickInfo.round <= 3 ? 120 : pickInfo.round <= 5 ? 190 : 260;
    let candidates = prospects.slice(0, Math.min(prospects.length, poolSize));
    if (pickInfo.round <= 5) {
      const nonSpecialists = candidates.filter(prospect => prospect.pos !== "K" && prospect.pos !== "P");
      if (nonSpecialists.length) candidates = nonSpecialists;
    }
    const best = candidates.sort((a, b) => aiDraftProspectScore(b, team, pickInfo) - aiDraftProspectScore(a, team, pickInfo))[0] || prospects[0];
    makeDraftSelection(pickInfo, best.id);
  }

  function aiDraftProspectScore(prospect, team, pickInfo) {
    const need = draftPositionNeed(team.id, prospect.pos);
    const grade = prospectGrade(prospect);
    const premium = POSITION_VALUE[prospect.pos] * (pickInfo.round <= 2 ? 5.6 : 3.8);
    const reach = Math.max(0, (prospect.rank || pickInfo.overall) - pickInfo.overall);
    const reachPenalty = pickInfo.round <= 2 ? reach * 0.13 : reach * 0.06;
    const specialistPenalty = (prospect.pos === "K" || prospect.pos === "P")
      ? pickInfo.round <= 5 ? 90 : pickInfo.round === 6 ? 28 : 8
      : 0;
    const needWeight = pickInfo.round <= 2 ? 0.82 : pickInfo.round <= 5 ? 1.05 : 1.22;
    return grade + need * needWeight + premium - reachPenalty - specialistPenalty + seededGaussian(`${team.id}:${pickInfo.overall}:${prospect.id}`, 0, 1.7);
  }

  function makePlayerFromProspect(prospect, teamId, pickInfo = null) {
    const player = makePlayer(prospect.pos, teamId, false, 0, {
      ovr: prospect.trueOvr,
      pot: prospect.truePot,
      devTrait: prospect.devTrait,
      bustGem: prospect.bustGem,
      height: prospect.height,
      weight: prospect.weight,
      round: pickInfo?.round || 7,
      pickInRound: pickInfo?.pickInRound || 32
    });
    player.firstName = prospect.firstName;
    player.lastName = prospect.lastName;
    player.college = prospect.college;
    player.ratings = { ...prospect.ratings };
    player.draftYear = pickInfo?.year || prospect.year || state.year + 1;
    player.draftPick = pickInfo ? `${pickInfo.round}.${pickInfo.pickInRound}` : "UDFA";
    updateOverall(player);
    if (!pickInfo) {
      player.teamId = null;
      player.contract = null;
    }
    return player;
  }

  function makeDraftSelection(pickInfo, prospectId) {
    const draftClass = state.draftClasses[String(pickInfo.year)];
    const prospect = draftClass.find(item => item.id === prospectId) || draftClass[0];
    const team = getTeam(pickInfo.ownerTeam);
    const player = makePlayerFromProspect(prospect, team.id, pickInfo);
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
    if (state.currentDraft.overall > DRAFT_SELECTIONS) finishDraft();
  }

  function simOneDraftPick() {
    if (state.phase !== "draft") return;
    const pickInfo = currentPickInfo();
    if (!pickInfo) {
      finishDraft();
      save();
      render();
      return;
    }
    if (pickInfo.ownerTeam === USER_TEAM_ID) {
      ui.toast = "Detroit is on the clock. Pick a player from the board.";
      render();
      return;
    }
    aiMakePick(pickInfo);
    save();
    render();
  }

  function simDraftToUserPick() {
    if (state.phase !== "draft") return;
    let pickInfo = currentPickInfo();
    if (!pickInfo) {
      finishDraft();
      save();
      render();
      return;
    }
    if (pickInfo.ownerTeam === USER_TEAM_ID) {
      ui.toast = "Detroit is already on the clock.";
      render();
      return;
    }
    let count = 0;
    while (pickInfo && pickInfo.ownerTeam !== USER_TEAM_ID && count < DRAFT_SELECTIONS) {
      aiMakePick(pickInfo);
      count += 1;
      pickInfo = currentPickInfo();
    }
    if (pickInfo?.ownerTeam === USER_TEAM_ID) ui.toast = `Detroit is on the clock at ${pickInfo.round}.${pickInfo.pickInRound}.`;
    save();
    render();
  }

  function simDraftRound() {
    if (state.phase !== "draft") return;
    const startRound = state.currentDraft.round;
    while (state.currentDraft && !state.currentDraft.complete && state.currentDraft.round === startRound) {
      const pickInfo = currentPickInfo();
      if (!pickInfo) break;
      if (pickInfo.ownerTeam === USER_TEAM_ID) {
        ui.toast = `Detroit is on the clock at ${pickInfo.round}.${pickInfo.pickInRound}.`;
        break;
      }
      aiMakePick(pickInfo);
    }
    save();
    render();
  }

  function finishDraft() {
    if (state.currentDraft) state.currentDraft.complete = true;
    if (state.currentDraft?.year) {
      convertUndraftedProspectsToFreeAgents(state.currentDraft.year);
      delete state.draftClasses[String(state.currentDraft.year)];
      ensureFutureDraftClasses(state.currentDraft.year + 1);
      ui.draftYear = state.currentDraft.year + 1;
    }
    state.phase = "offseason";
    addNews("Draft complete", "The draft is complete. Offseason setup will roll into the next preseason.");
  }

  function convertUndraftedProspectsToFreeAgents(year) {
    const draftClass = state.draftClasses[String(year)] || [];
    if (!draftClass.length) return;
    let added = 0;
    for (const prospect of draftClass) {
      const player = makePlayerFromProspect(prospect, null, null);
      player.draftYear = year;
      player.draftPick = "UDFA";
      state.freeAgents.push(player);
      added += 1;
    }
    if (added) addNews("Undrafted free agents", `${added} undrafted rookies entered free agency.`);
  }

  function ensureFutureDraftClasses(startYear = state.year + 1) {
    for (let year = startYear; year <= startYear + 2; year += 1) {
      if (!state.draftClasses[String(year)]) state.draftClasses[String(year)] = generateDraftClass(year);
      ensureDraftClassSize(year);
    }
  }

  function ensureDraftClassSize(year, minSize = DRAFT_CLASS_SIZE) {
    const key = String(year);
    const draftClass = state.draftClasses[key] ||= [];
    if (draftClass.length >= minSize) return;
    let guard = 0;
    const seen = new Set(draftClass.map(prospect => `${playerName(prospect)}:${prospect.college}:${prospect.pos}`.toLowerCase()));
    while (draftClass.length < minSize && guard < 6) {
      guard += 1;
      const fillers = generateDraftClass(year);
      for (const filler of fillers) {
        if (draftClass.length >= minSize) break;
        const seenKey = `${playerName(filler)}:${filler.college}:${filler.pos}`.toLowerCase();
        if (seen.has(seenKey)) continue;
        seen.add(seenKey);
        draftClass.push(cloneDraftFiller(filler, year, draftClass.length + 1));
      }
    }
    rankDraftClass(draftClass);
  }

  function cloneDraftFiller(prospect, year, index) {
    return {
      ...prospect,
      id: `d${year}-filler-${index}-${slugify(playerName(prospect))}`,
      ratings: { ...prospect.ratings },
      combine: { ...prospect.combine },
      collegeAwards: [...(prospect.collegeAwards || [])],
      source: prospect.source || "generated-filler"
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

  function projectedDraftScore(team) {
    const games = team.wins + team.losses + team.ties;
    const rating = teamRatingSummary(team).overall;
    const strengthWinPct = clamp(0.5 + (rating - 78) / 52, 0.18, 0.82);
    if (!games) return strengthWinPct * 100 + (rating - 78) * 0.08;
    const currentWinPct = (team.wins + team.ties * 0.5) / games;
    const resultWeight = clamp(games / 12, 0.12, 0.78);
    const pointDiffPerGame = clamp((team.pf - team.pa) / games, -24, 24);
    const pointDiffSignal = pointDiffPerGame / 30;
    const projectedWinPct = currentWinPct * resultWeight + strengthWinPct * (1 - resultWeight) + pointDiffSignal * resultWeight * 0.45;
    return projectedWinPct * 100 + (rating - 78) * 0.08;
  }

  function projectedDraftOrder() {
    return state.teams.slice().sort((a, b) => projectedDraftScore(a) - projectedDraftScore(b) || a.id.localeCompare(b.id));
  }

  function projectedPickInRound(pickAsset) {
    if (pickAsset.overall) return ((pickAsset.overall - 1) % 32) + 1;
    const order = projectedDraftOrder();
    const index = order.findIndex(team => team.id === pickAsset.originalTeam);
    const rawSlot = index >= 0 ? index + 1 : 16.5;
    const yearGap = Math.max(0, pickAsset.year - (state.year + 1));
    const confidence = 0.78 ** yearGap;
    return Math.round(clamp(16.5 + (rawSlot - 16.5) * confidence, 1, 32));
  }

  function projectedOverallForPick(pickAsset) {
    return pickAsset.overall || ((pickAsset.round - 1) * 32 + projectedPickInRound(pickAsset));
  }

  function pickValue(pickAsset) {
    const yearGap = Math.max(0, pickAsset.year - (state.year + 1));
    const overall = projectedOverallForPick(pickAsset);
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

  function tradeProductionScore(player, stats) {
    if (!stats) return 0;
    if (player.pos === "QB") return stats.passYds / 120 + stats.passTd * 8 - stats.int * 5 + stats.rushYds / 45 + stats.rushTd * 5;
    if (player.pos === "RB") return stats.rushYds / 16 + stats.rushTd * 8 + stats.recYds / 26 + stats.recTd * 6;
    if (player.pos === "WR" || player.pos === "TE") return stats.recYds / 14 + stats.recTd * 8 + stats.rushYds / 32 + stats.rushTd * 5;
    if (player.pos === "DE" || player.pos === "DT" || player.pos === "LB") return stats.sacks * 18 + stats.tfl * 5 + stats.tackles * 0.4 + stats.defInt * 8 + stats.ff * 10;
    if (player.pos === "CB" || player.pos === "S") return stats.defInt * 22 + stats.tackles * 0.3 + stats.sacks * 10 + stats.tfl * 4 + stats.ff * 10;
    if (player.pos === "K") return stats.fg * 3 + stats.xp * 0.4 - Math.max(0, stats.fga - stats.fg) * 2;
    if (player.pos === "P") return Math.max(0, stats.pAvg - 40) * 4 + stats.punts * 0.08;
    return 0;
  }

  function tradeProductionValue(player) {
    const current = tradeProductionScore(player, player.stats.season);
    const history = (player.stats.history || []).slice(-3).reverse().reduce((sum, row, index) => sum + tradeProductionScore(player, row) * (0.55 ** (index + 1)), 0);
    return clamp((current + history) * 1.4, 0, 520);
  }

  const TRADE_REPLACEMENT_LEVEL = {
    QB: 74, RB: 70, WR: 72, TE: 71, T: 72, OG: 71, C: 71,
    DE: 72, DT: 72, LB: 71, CB: 72, S: 71, K: 78, P: 78
  };

  const TRADE_POSITION_MODEL = {
    QB: { mult: 6.35, exp: 2.13, cap: 7200, contract: 18, surplusCap: 1650, badContract: 2300, production: 11, potential: 31, eliteFloor: 3300 },
    RB: { mult: 2.0, exp: 1.8, cap: 1450, contract: 8, surplusCap: 500, badContract: 650, production: 8, potential: 8, eliteFloor: 650 },
    WR: { mult: 2.75, exp: 2.03, cap: 2700, contract: 13, surplusCap: 850, badContract: 900, production: 8, potential: 13, eliteFloor: 1550 },
    TE: { mult: 1.65, exp: 1.96, cap: 1650, contract: 9, surplusCap: 600, badContract: 650, production: 6, potential: 10, eliteFloor: 900 },
    T: { mult: 2.95, exp: 2.0, cap: 3100, contract: 12, surplusCap: 850, badContract: 850, production: 3, potential: 11, eliteFloor: 1800 },
    OG: { mult: 1.55, exp: 1.88, cap: 1550, contract: 8, surplusCap: 550, badContract: 600, production: 2, potential: 7, eliteFloor: 850 },
    C: { mult: 1.5, exp: 1.88, cap: 1500, contract: 8, surplusCap: 525, badContract: 575, production: 2, potential: 7, eliteFloor: 800 },
    DE: { mult: 3.25, exp: 2.05, cap: 3400, contract: 13, surplusCap: 900, badContract: 950, production: 8, potential: 12, eliteFloor: 1900 },
    DT: { mult: 2.25, exp: 2.02, cap: 2550, contract: 11, surplusCap: 750, badContract: 800, production: 7, potential: 10, eliteFloor: 1350 },
    LB: { mult: 1.85, exp: 1.96, cap: 1800, contract: 8, surplusCap: 575, badContract: 625, production: 6, potential: 8, eliteFloor: 950 },
    CB: { mult: 3.05, exp: 2.03, cap: 3200, contract: 12, surplusCap: 850, badContract: 850, production: 7, potential: 12, eliteFloor: 1850 },
    S: { mult: 1.75, exp: 1.94, cap: 1750, contract: 8, surplusCap: 575, badContract: 625, production: 6, potential: 8, eliteFloor: 900 },
    K: { mult: 0.75, exp: 1.55, cap: 150, contract: 2, surplusCap: 60, badContract: 150, production: 2, potential: 1, eliteFloor: 80 },
    P: { mult: 0.65, exp: 1.55, cap: 130, contract: 2, surplusCap: 50, badContract: 130, production: 2, potential: 1, eliteFloor: 70 }
  };

  const TRADE_AWARD_VALUES = {
    MVP: 800,
    "SB MVP": 360,
    DPOY: 520,
    OPOY: 450,
    "All-Pro": 280,
    "Pro Bowl": 85,
    OROY: 180,
    DROY: 180
  };

  const TRADE_ELITE_FLOOR_MAX_AGE = {
    QB: 32, RB: 27, WR: 29, TE: 30, T: 31, OG: 30, C: 31,
    DE: 30, DT: 30, LB: 29, CB: 29, S: 30, K: 35, P: 35
  };

  function tradePositionModel(pos) {
    return TRADE_POSITION_MODEL[pos] || TRADE_POSITION_MODEL.LB;
  }

  function tradeEffectiveRating(player) {
    const age = player.age || 25;
    const current = clamp(Number(player.ovr) || 0, 35, 99);
    const potential = clamp(Math.max(current, Number(player.pot) || current), current, 99);
    let potentialWeight = 0.02;
    if (age <= 21) potentialWeight = 0.45;
    else if (age <= 23) potentialWeight = 0.34;
    else if (age <= 25) potentialWeight = 0.2;
    else if (age <= 27) potentialWeight = 0.08;
    return current * (1 - potentialWeight) + potential * potentialWeight;
  }

  function tradeAgeFactor(player) {
    const pos = player.pos;
    const age = player.age || 25;
    const regressionAge = player.regressionAge || REGRESSION_AGES[pos] || 31;
    const yearsToDecline = regressionAge - age;
    const earlyUpside = age <= 24 && (player.pot || player.ovr) > player.ovr ? Math.min(0.1, ((player.pot || player.ovr) - player.ovr) * 0.006) : 0;
    if (yearsToDecline >= 4) return 1.04 + earlyUpside;
    if (yearsToDecline >= 0) return 0.92 + yearsToDecline * 0.03 + earlyUpside;
    const declineRate = { QB: 0.09, RB: 0.18, WR: 0.13, TE: 0.13, T: 0.11, OG: 0.12, C: 0.11, DE: 0.13, DT: 0.12, LB: 0.14, CB: 0.14, S: 0.13, K: 0.08, P: 0.08 }[pos] || 0.13;
    const floor = pos === "QB" ? 0.38 : (pos === "K" || pos === "P" ? 0.5 : 0.24);
    return clamp(0.92 + yearsToDecline * declineRate, floor, 0.92);
  }

  function tradeVeteranMarketMultiplier(player) {
    const age = player.age || 25;
    const pos = player.pos;
    if (pos === "QB") {
      if (age <= 32) return 1;
      if (age <= 34) return 0.86;
      if (age <= 36) return 0.66;
      if (age <= 38) return 0.48;
      return 0.32;
    }
    if (pos === "K" || pos === "P") return age <= 36 ? 1 : 0.82;
    const threshold = { RB: 27, WR: 29, TE: 30, T: 31, OG: 30, C: 31, DE: 30, DT: 30, LB: 29, CB: 29, S: 30 }[pos] || 30;
    if (age <= threshold) return 1;
    const rate = { RB: 0.22, WR: 0.16, TE: 0.14, T: 0.15, OG: 0.16, C: 0.15, DE: 0.14, DT: 0.14, LB: 0.16, CB: 0.16, S: 0.15 }[pos] || 0.15;
    const floor = { RB: 0.18, WR: 0.24, TE: 0.26, T: 0.22, OG: 0.2, C: 0.2, DE: 0.25, DT: 0.25, LB: 0.22, CB: 0.22, S: 0.24 }[pos] || 0.22;
    return clamp(1 - (age - threshold) * rate, floor, 1);
  }

  function tradeEliteFloorApplies(player) {
    const maxAge = TRADE_ELITE_FLOOR_MAX_AGE[player.pos] || 30;
    const regressionAge = player.regressionAge || REGRESSION_AGES[player.pos] || 31;
    return (player.age || 25) <= maxAge && (player.age || 25) <= regressionAge;
  }

  function tradePotentialAdjustment(player, model) {
    const gap = Math.max(0, (player.pot || player.ovr) - player.ovr);
    if (!gap) return 0;
    const age = player.age || 25;
    const ageWindow = age <= 21 ? 1 : age <= 23 ? 0.82 : age <= 25 ? 0.54 : age <= 27 ? 0.22 : 0.04;
    return (gap ** 1.35) * model.potential * ageWindow;
  }

  function tradeAwardValue(player) {
    return (player.awards || []).reduce((sum, item) => {
      const award = typeof item === "string" ? item : item.award;
      const year = typeof item === "string" ? state.year : item.year;
      const base = TRADE_AWARD_VALUES[award] || (String(award).includes("All-Pro") ? TRADE_AWARD_VALUES["All-Pro"] : 0);
      if (!base) return sum;
      const age = clamp(state.year - year, 0, 8);
      return sum + base * (0.72 ** age);
    }, 0);
  }

  function tradeProductionAdjustment(player, model) {
    return Math.sqrt(tradeProductionValue(player)) * model.production;
  }

  function tradeInjuryMultiplier(player) {
    const currentPenalty = player.injury?.weeks > 0 ? Math.min(0.65, player.injury.weeks * 0.035) : 0;
    const historyPenalty = Math.min(0.34, recentInjuryWeeks(player, 2) * 0.012 + recentMajorInjuries(player, 3) * 0.06);
    const pronePenalty = clamp((player.injury?.prone || 0.08) * 0.32, 0.01, 0.11);
    return clamp(1 - currentPenalty - historyPenalty - pronePenalty, 0.32, 1);
  }

  function tradeContractAdjustment(player, baseValue, model) {
    if (!player.contract || currentYearIndex(player) < 0) return 0;
    const yearsLeft = player.contract.years - currentYearIndex(player);
    if (yearsLeft <= 0) return 0;
    const market = marketAnnual(player);
    const actual = avgRemainingSalary(player);
    const yearlySurplus = market - actual;
    const yearsFactor = Math.sqrt(clamp(yearsLeft, 1, 5));
    const raw = yearlySurplus * model.contract * yearsFactor;
    if (raw >= 0) {
      return clamp(raw, 0, Math.min(model.surplusCap, baseValue * (player.pos === "QB" ? 0.55 : 0.42)));
    }
    return -clamp(Math.abs(raw), 0, Math.min(model.badContract, baseValue * 0.85 + 250));
  }

  function teamTradeStrategy(teamId) {
    const team = getTeam(teamId);
    if (!team) return "neutral";
    const rating = teamRatingSummary(team).overall;
    const games = team.wins + team.losses + team.ties;
    const winPct = games ? (team.wins + team.ties * 0.5) / games : 0.5;
    if (rating >= 82 || (games >= 6 && winPct >= 0.58)) return "contending";
    if (rating <= 75 || (games >= 6 && winPct <= 0.4)) return "rebuilding";
    return "neutral";
  }

  function tradeStrategyMultiplier(player, evaluatingTeamId) {
    const strategy = teamTradeStrategy(evaluatingTeamId);
    if (strategy === "rebuilding") {
      if (player.age <= 23) return 1.08;
      if (player.age <= 25) return 1.04;
      if (player.age >= 30) return player.pos === "QB" ? 0.9 : 0.82;
      if (player.age >= 28) return 0.93;
    } else if (strategy === "contending") {
      if (player.age <= 21) return 0.88;
      if (player.age <= 23) return 0.93;
      if (player.ovr >= 82 && player.age <= 31) return 1.05;
    }
    return 1;
  }

  function tradeTeamNeedMultiplier(player, evaluatingTeamId) {
    const team = getTeam(evaluatingTeamId);
    if (!team || player.pos === "K" || player.pos === "P") return 1;
    const profile = positionGroupProfile(evaluatingTeamId, player.pos);
    const need = draftPositionNeed(evaluatingTeamId, player.pos);
    let multiplier = 1 + clamp((need - 12) / 95, -0.1, 0.18);
    if (player.teamId === evaluatingTeamId && player.ovr >= profile.starterAvg - 1) multiplier += 0.05;
    if (player.teamId !== evaluatingTeamId && profile.shortage > 0) multiplier += 0.04;
    return clamp(multiplier, 0.86, 1.24);
  }

  function tradePickValue(pickAsset, evaluatingTeamId) {
    let value = pickValue(pickAsset);
    const strategy = teamTradeStrategy(evaluatingTeamId || USER_TEAM_ID);
    const future = pickAsset.year > state.year + 1 || (pickAsset.year === state.year + 1 && state.phase !== "draft");
    if (strategy === "rebuilding") {
      value *= future ? 1.1 : 1.04;
    } else if (strategy === "contending") {
      value *= future ? 0.86 : 0.93;
    }
    return round(value, 1);
  }

  function playerTradeChartValue(player, evaluatingTeamId = null, includeInjuries = true) {
    if (playerIsRetired(player)) return 0;
    const model = tradePositionModel(player.pos);
    const replacement = TRADE_REPLACEMENT_LEVEL[player.pos] || 71;
    const rating = tradeEffectiveRating(player);
    const score = Math.max(0, rating - replacement);
    let base = (score ** model.exp) * model.mult;
    base *= tradeAgeFactor(player);
    const contract = tradeContractAdjustment(player, base, model);
    let value = base + tradePotentialAdjustment(player, model) + tradeAwardValue(player) + tradeProductionAdjustment(player, model) + contract;
    if (value > 0) value *= tradeVeteranMarketMultiplier(player);
    if (includeInjuries) value *= tradeInjuryMultiplier(player);
    if (evaluatingTeamId) value *= tradeStrategyMultiplier(player, evaluatingTeamId) * tradeTeamNeedMultiplier(player, evaluatingTeamId);
    if (player.yearsPro === 0 && player.draftYear === state.year) value = Math.max(0, value);
    if (player.pos === "QB" && player.ovr >= 95 && tradeEliteFloorApplies(player) && includeInjuries && tradeInjuryMultiplier(player) >= 0.68) {
      value = Math.max(value, model.eliteFloor + (player.ovr - 95) * 425 + Math.max(0, (player.pot || player.ovr) - player.ovr) * 110);
    } else if (model.eliteFloor && player.ovr >= 95 && tradeEliteFloorApplies(player)) {
      value = Math.max(value, model.eliteFloor);
    }
    const minValue = player.contract && contract < -base * 0.6 ? -model.badContract : 0;
    return round(clamp(value, minValue, model.cap), 1);
  }

  function playerTradeValue(player, evaluatingTeamId = null) {
    return playerTradeChartValue(player, evaluatingTeamId, true);
  }

  function marketAnnual(player) {
    return projectedAnnual(player);
  }

  function tradePackagePlayerMultiplier(value, index) {
    if (index === 0) return 1;
    if (value >= 1800) return index === 1 ? 0.92 : 0.82;
    if (value >= 850) return [1, 0.9, 0.78, 0.64, 0.52][index] || 0.45;
    if (value >= 350) return [1, 0.82, 0.62, 0.45, 0.32][index] || 0.24;
    if (value >= 150) return [1, 0.62, 0.42, 0.28, 0.18][index] || 0.12;
    return index === 1 ? 0.34 : index === 2 ? 0.2 : 0.08;
  }

  function tradePackageValue(assetIds, evaluatingTeamId) {
    const playerValues = [];
    let total = 0;
    for (const assetId of assetIds) {
      const asset = parseAsset(assetId);
      if (!asset) continue;
      if (asset.type === "player") {
        const player = getPlayer(asset.playerId);
        if (!player) continue;
        const value = playerTradeChartValue(player, evaluatingTeamId, true);
        if (value >= 0) playerValues.push(value);
        else total += value;
      } else {
        const pickAsset = findPickAsset(asset);
        if (pickAsset) total += tradePickValue(pickAsset, evaluatingTeamId);
      }
    }
    playerValues.sort((a, b) => b - a);
    playerValues.forEach((value, index) => {
      total += value * tradePackagePlayerMultiplier(value, index);
    });
    return round(total, 1);
  }

  function parseAsset(assetId) {
    const [type, ...parts] = assetId.split(":");
    if (type === "player") return { type, playerId: parts[0] };
    if (type === "pick") return { type, teamId: parts[0], year: Number(parts[1]), round: Number(parts[2]), originalTeam: parts[3] };
    return null;
  }

  function pickAssetId(holderTeamId, pickAsset) {
    return `pick:${holderTeamId}:${pickAsset.year}:${pickAsset.round}:${pickAsset.originalTeam}`;
  }

  function findPickAsset(asset) {
    const holder = getTeam(asset.teamId);
    return holder?.draftPicks.find(item => item.year === asset.year && item.round === asset.round && item.originalTeam === asset.originalTeam) || null;
  }

  function pickInRound(pickAsset) {
    return pickAsset.overall ? ((pickAsset.overall - 1) % 32) + 1 : null;
  }

  function pickSlotLabel(pickAsset) {
    const pickNumber = pickInRound(pickAsset);
    return pickNumber ? `R${pickAsset.round}.${pickNumber}` : `R${pickAsset.round}.${projectedPickInRound(pickAsset)} proj`;
  }

  function assetLabel(assetId) {
    const asset = parseAsset(assetId);
    if (!asset) return "";
    if (asset.type === "player") {
      const player = getPlayer(asset.playerId);
      return player ? `${player.pos} ${playerName(player)} (${player.ovr}/${player.pot})` : "Player";
    }
    const pickAsset = findPickAsset(asset) || asset;
    const team = getTeam(asset.originalTeam);
    return `${asset.year} ${pickSlotLabel(pickAsset)} (${team?.abbr || asset.originalTeam})`;
  }

  function assetValue(assetId) {
    const asset = parseAsset(assetId);
    if (!asset) return 0;
    if (asset.type === "player") {
      const player = getPlayer(asset.playerId);
      return player ? playerTradeValue(player) : 0;
    }
    const pickAsset = findPickAsset(asset);
    return pickAsset ? pickValue(pickAsset) : 0;
  }

  function tradePreview() {
    const mine = Array.from(ui.tradeMine);
    const theirs = Array.from(ui.tradeTheirs);
    const partner = getTeam(ui.tradePartner);
    const mineValue = tradePackageValue(mine, partner.id);
    const theirsValue = tradePackageValue(theirs, partner.id);
    const aiNeedPremium = 1.03 + (partner.wins >= 8 ? 0.04 : 0) + (state.phase === "draft" ? -0.02 : 0);
    const cap = previewTradeCap(USER_TEAM_ID, partner.id, mine, theirs);
    const roster = previewTradeRoster(USER_TEAM_ID, partner.id, mine, theirs);
    const accepted = mineValue >= theirsValue * aiNeedPremium && cap.userAfter >= -1 && cap.partnerAfter >= -8 && roster.userAfter <= MAX_ROSTER + 3 && roster.partnerAfter <= MAX_ROSTER + 3;
    return { mineValue, theirsValue, delta: round(mineValue - theirsValue * aiNeedPremium, 1), accepted, cap, roster };
  }

  function countPlayerAssets(assetIds) {
    return assetIds.reduce((sum, assetId) => parseAsset(assetId)?.type === "player" ? sum + 1 : sum, 0);
  }

  function previewTradeRoster(userTeamId, partnerTeamId, userAssets, partnerAssets) {
    const userSends = countPlayerAssets(userAssets);
    const userReceives = countPlayerAssets(partnerAssets);
    const partnerSends = userReceives;
    const partnerReceives = userSends;
    return {
      userAfter: teamPlayers(userTeamId).length - userSends + userReceives,
      partnerAfter: teamPlayers(partnerTeamId).length - partnerSends + partnerReceives
    };
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
      const rosterBlocked = preview.roster.userAfter > MAX_ROSTER + 3 || preview.roster.partnerAfter > MAX_ROSTER + 3;
      const capBlocked = preview.cap.userAfter < -1 || preview.cap.partnerAfter < -8;
      ui.toast = rosterBlocked
        ? "Trade rejected because one roster would be too far over 53 players."
        : capBlocked
          ? "Trade rejected by cap room."
          : `Offer short by about ${round(Math.abs(preview.delta), 1)} value points.`;
      render();
      return;
    }
    const partnerId = ui.tradePartner;
    const mine = Array.from(ui.tradeMine).map(assetLabel).join(", ") || "nothing";
    const theirs = Array.from(ui.tradeTheirs).map(assetLabel).join(", ") || "nothing";
    if (!confirmAction(`Offer this trade?\n\nDetroit sends: ${mine}\n\n${getTeam(partnerId).abbr} sends: ${theirs}\n\nDetroit cap after: ${money(preview.cap.userAfter)} (${money(-preview.cap.userChange)} change)\n${getTeam(partnerId).abbr} cap after: ${money(preview.cap.partnerAfter)} (${money(-preview.cap.partnerChange)} change)`)) return;
    executeTrade(USER_TEAM_ID, partnerId, Array.from(ui.tradeMine), Array.from(ui.tradeTheirs));
    ui.tradeMine.clear();
    ui.tradeTheirs.clear();
    ui.toast = "Trade accepted.";
    save();
    render();
  }

  function startTradeForPlayer(playerId) {
    const player = getPlayer(playerId);
    if (!player || !player.teamId || playerIsRetired(player)) return;
    ui.profileOpen = false;
    ui.prospectProfileOpen = false;
    ui.tab = "trades";
    if (tradeDeadlinePassed()) {
      ui.toast = "The trade deadline has passed for player trades.";
      render();
      return;
    }
    const assetId = `player:${player.id}`;
    if (player.teamId === USER_TEAM_ID) {
      ui.tradeMine.add(assetId);
    } else {
      if (ui.tradePartner !== player.teamId) {
        ui.tradePartner = player.teamId;
        ui.tradeTheirs.clear();
      }
      ui.tradeTheirs.add(assetId);
    }
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

  function scoutedDevTrait(prospect, ovr = scoutedValue(prospect, "ovr"), pot = scoutedValue(prospect, "pot")) {
    if (pot >= 95 && ovr >= 78) return "Generational";
    if ((pot >= 91 && ovr >= 75) || ovr >= 90) return "Superstar";
    if ((pot >= 84 && ovr >= 70) || ovr >= 83) return "Star";
    return "Normal";
  }

  function render() {
    if (!state || ui.screen === "hub") {
      renderLeagueHub();
      return;
    }
    const team = getTeam(USER_TEAM_ID);
    const discreteClass = ui.discreteMode ? " discrete-mode" : "";
    const mobileClass = ui.mobileMode ? " mobile-mode" : "";
    const shellTitle = ui.discreteMode ? "Operations Workbook" : "Detroit Wolverines GM";
    const shellSubtitle = ui.discreteMode
      ? `${state.year} - ${displayPhaseLabel()} - Portfolio ${team.wins}-${team.losses}${team.ties ? `-${team.ties}` : ""}`
      : `${state.year} - ${phaseLabel()} - ${team.wins}-${team.losses}${team.ties ? `-${team.ties}` : ""}`;
    app.innerHTML = `
      <div class="shell${discreteClass}${mobileClass}">
        <header class="topbar">
          <div class="brand-row">
            <div class="badge">${ui.discreteMode ? "OPS" : "DW"}</div>
            <div class="brand-title">
              <h1>${shellTitle}</h1>
              <div>${shellSubtitle}</div>
            </div>
            <div class="status-strip">
              <span class="pill">${ui.discreteMode ? "ACTIVE" : state.phase.toUpperCase()}</span>
              <span class="pill ${capSpace(USER_TEAM_ID) < 0 ? "bad" : "good"}">${ui.discreteMode ? "Budget" : "Cap"} ${money(capSpace(USER_TEAM_ID))}</span>
              <span class="pill ${team.cash < 0 ? "bad" : "good"}">Cash ${money(team.cash)}</span>
              <span class="pill ${state.gm.jobSecurity < 35 ? "bad" : state.gm.jobSecurity < 55 ? "warn" : "good"}">${ui.discreteMode ? "Review" : "Job"} ${state.gm.jobSecurity}/100</span>
              <button class="mode-toggle" data-action="toggleDiscrete" aria-pressed="${ui.discreteMode ? "true" : "false"}">${ui.discreteMode ? "Standard" : "Discrete"}</button>
              <button class="mode-toggle" data-action="toggleMobile" aria-pressed="${ui.mobileMode ? "true" : "false"}">${ui.mobileMode ? "Desktop" : "Mobile"}</button>
            </div>
          </div>
          <nav class="nav-tabs">${TABS.map(([key, label]) => `<button data-tab="${key}" class="${ui.tab === key ? "active" : ""}">${displayTabLabel(key, label)}</button>`).join("")}</nav>
        </header>
        <main class="main">
          ${ui.toast ? `<div class="toast">${escapeHtml(ui.toast)}</div>` : ""}
          ${renderPhaseBanner()}
          ${renderTab()}
        </main>
        ${renderProfileModal()}
      </div>
    `;
  }

  function renderLeagueHub() {
    const leagues = loadLeagueIndex();
    const discreteClass = ui.discreteMode ? " discrete-mode" : "";
    const mobileClass = ui.mobileMode ? " mobile-mode" : "";
    app.innerHTML = `
      <div class="league-hub${discreteClass}${mobileClass}">
        <header class="hub-header">
          <h1>${ui.discreteMode ? "Operations Workbook" : "Detroit Wolverines GM"}</h1>
          <div>${ui.discreteMode ? "Choose a workbook, import data, or start a clean file." : "Choose a league, import a save, or generate a new clean league."}</div>
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
                <select data-control="newLeagueMode">
                  <option value="standard" ${ui.newLeagueMode === "standard" ? "selected" : ""}>Standard Set</option>
                  <option value="random" ${ui.newLeagueMode === "random" ? "selected" : ""}>Randomized Set</option>
                  <option value="nfl" ${ui.newLeagueMode === "nfl" ? "selected" : ""}>NFL 2025</option>
                </select>
                ${ui.newLeagueMode === "nfl" ? `<select data-control="newLeagueNflSetup">
                  <option value="real" ${ui.newLeagueNflSetup === "real" ? "selected" : ""}>Current teams</option>
                  <option value="draft" ${ui.newLeagueNflSetup === "draft" ? "selected" : ""}>League draft</option>
                </select>` : ""}
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

  function renderProfileModal() {
    if (ui.prospectProfileOpen && ui.selectedProspectId) {
      const prospect = getProspect(ui.selectedProspectId);
      if (!prospect) return "";
      return `<div class="modal-backdrop">
        <section class="modal" data-modal="profile">
          <div class="modal-header"><h3>${playerName(prospect)}</h3><span class="pill light">Draft Prospect</span><button data-action="closeProfile">Close</button></div>
          <div class="modal-body">${renderProspectProfile(prospect)}</div>
        </section>
      </div>`;
    }
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
    const userDraftPick = (state.phase === "draft" && currentPickInfo()?.ownerTeam === USER_TEAM_ID) || (state.phase === "leagueDraft" && currentLeagueDraftInfo()?.ownerTeam === USER_TEAM_ID);
    const action = userDraftPick ? (ui.discreteMode ? "Pending" : "On the clock") : (ui.discreteMode ? "Process" : "Advance");
    return `<div class="phase-banner">
      <strong>${displayPhaseLabel()}</strong>
      <span class="muted">${displayPhaseCaption()}</span>
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
    if (state.phase === "leagueDraft") return "Build Detroit's roster from the NFL player pool.";
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
    const rating = teamRatingSummary(team);
    return `
      <div class="grid two">
        <div class="grid">
          <section class="panel">
            <div class="panel-header"><h3>Team Command</h3></div>
            <div class="panel-body stack">
              <div class="metric-row">
                <div class="metric"><label>Record</label><strong>${team.wins}-${team.losses}</strong><span>${team.conf} ${team.div}</span></div>
                <div class="metric"><label>Team Overall</label><strong>${rating.overall}</strong><span>OFF ${rating.offense} / DEF ${rating.defense} / ST ${rating.specialTeams}</span></div>
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
                <div class="metric"><label>Offense</label><strong>${rating.offense}</strong><span>QB, skill, OL, coaching</span></div>
                <div class="metric"><label>Defense</label><strong>${rating.defense}</strong><span>front, coverage, coaching</span></div>
                <div class="metric"><label>Special Teams</label><strong>${rating.specialTeams}</strong><span>K, P, coaching</span></div>
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
        <div class="field-team"><b>${away.abbr}</b><span>${teamName(away)}</span><small>${teamRatingLine(away)}</small></div>
        <div class="score">${score}</div>
        <div class="field-team align-right"><b>${home.abbr}</b><span>${teamName(home)} - ${label}</span><small>${teamRatingLine(home)}</small></div>
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
        <h2>${displayTabLabel("roster", "Roster")}</h2>
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

  function renderTradeShortcut(player) {
    if (!player?.teamId || playerIsRetired(player)) return "";
    const disabled = tradeDeadlinePassed() ? "disabled" : "";
    return `<button class="mini-button" data-action="startTradeForPlayer" data-player="${player.id}" ${disabled}>Trade</button>`;
  }

  function renderRosterTable(players) {
    return `<table><thead><tr><th>Pos</th><th>Name</th><th class="num">Age</th><th>Ht/Wt</th><th class="num">Ovr</th><th class="num">Pot</th><th>Injury</th><th>Contract</th><th class="num">Cap</th><th class="num">Release</th><th></th></tr></thead><tbody>
      ${players.map(player => {
        const dead = deadCapIfRelease(player);
        const savings = capHit(player) - dead.current;
        return `<tr>
          <td>${player.pos}</td>
          <td><span class="inline-player-actions"><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button>${renderTradeShortcut(player)}</span></td>
          <td class="num">${player.age}</td>
          <td>${sizeLabel(player)}</td>
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
        <div class="split"><div><strong>${playerName(player)}</strong><div class="muted">${player.pos} - ${playerStatus(player)} - ${player.college}</div></div><span class="compact-actions"><span class="pill light">${player.devTrait}</span>${renderTradeShortcut(player)}</span></div>
        <div class="metric-row">
          <div class="metric"><label>Overall</label><strong>${player.ovr}</strong><span>Potential ${player.pot}</span></div>
          <div class="metric"><label>Age</label><strong>${player.age}</strong><span>Aging midpoint ${player.regressionAge}</span></div>
          <div class="metric"><label>Size</label><strong>${formatHeight(player.height)}</strong><span>${player.weight} lb</span></div>
          <div class="metric"><label>Trade Value</label><strong>${playerTradeValue(player)}</strong><span>contract adjusted</span></div>
          <div class="metric"><label>Cap Hit</label><strong>${money(currentCap)}</strong><span>${contractSummary(player)}</span></div>
        </div>
        ${renderRealContractDetails(player)}
        <div class="table-wrap"><table><thead><tr><th>Stat</th><th class="num">Season</th><th class="num">Career</th></tr></thead><tbody>${renderStatRows(player)}</tbody></table></div>
        <div class="table-wrap"><table><thead><tr><th>Attr</th>${attrs.slice(0, 11).map(attr => `<th class="num">${attr.toUpperCase()}</th>`).join("")}</tr></thead><tbody><tr><td>Ratings</td>${attrs.slice(0, 11).map(attr => `<td class="num">${player.ratings[attr] || ""}</td>`).join("")}</tr><tr><td>Skills</td>${attrs.slice(11).map(attr => `<td class="num">${player.ratings[attr] || ""}</td>`).join("")}</tr></tbody></table></div>
        ${player.madden?.abilities?.length ? `<div><strong>Madden Abilities</strong><div class="muted">${player.madden.abilities.slice(0, 8).join(", ")}</div></div>` : ""}
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
      <div class="toolbar"><h2>${displayTabLabel("depth", "Depth Chart")}</h2><button data-action="autoDepth">Auto</button></div>
      <div class="depth-grid">${POSITIONS.map(pos => `
        <div class="depth-slot">
          <h3>${pos}</h3>
          <table><tbody>${(team.depthChart[pos] || []).map((playerId, index) => {
            const player = getPlayer(playerId);
            if (!player) return "";
            return `<tr><td class="num">${index + 1}</td><td><button class="link-button" data-action="selectPlayerTab" data-player="${player.id}">${playerName(player)}</button><div class="muted">${sizeLabel(player)}</div></td><td class="num">${player.ovr}</td><td>${injuryLabel(player)}</td><td><span class="compact-actions"><button data-action="depthUp" data-pos="${pos}" data-player="${player.id}">Up</button><button data-action="depthDown" data-pos="${pos}" data-player="${player.id}">Dn</button></span></td></tr>`;
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
        <h2>${ui.discreteMode ? "Personnel Directory" : "All-Time Player Database"}</h2>
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
    return `<table><thead><tr><th>Pos</th><th>Name</th><th>Status</th><th class="num">Age</th><th>Ht/Wt</th><th class="num">Ovr</th><th class="num">Pot</th><th>Contract</th><th class="num">Pass Yds</th><th class="num">Pass TD</th><th class="num">Rush Yds</th><th class="num">Rec Yds</th><th class="num">Sacks</th><th class="num">INT</th><th class="num">Value</th>${attrs.map(attr => `<th class="num">${attr.toUpperCase()}</th>`).join("")}</tr></thead><tbody>
      ${players.map(player => `<tr><td>${player.pos}</td><td><span class="inline-player-actions"><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button>${renderTradeShortcut(player)}</span></td><td>${playerStatus(player)}</td><td class="num">${player.age}</td><td>${sizeLabel(player)}</td><td class="num">${player.ovr}</td><td class="num">${player.pot}</td><td>${contractSummary(player)}</td><td class="num">${player.stats.season.passYds}</td><td class="num">${player.stats.season.passTd}</td><td class="num">${player.stats.season.rushYds}</td><td class="num">${player.stats.season.recYds}</td><td class="num">${player.stats.season.sacks}</td><td class="num">${player.stats.season.defInt}</td><td class="num">${playerTradeValue(player)}</td>${attrs.map(attr => `<td class="num">${player.ratings[attr] || ""}</td>`).join("")}</tr>`).join("")}
    </tbody></table>`;
  }

  function renderSchedule() {
    const weeks = Array.from(new Set(state.schedule.filter(game => game.year === state.year).map(game => game.week))).sort((a, b) => a - b);
    const games = state.schedule.filter(game => game.year === state.year && game.week === Number(ui.scheduleWeek));
    const selected = state.schedule.find(game => game.id === ui.selectedGameId) || games.find(game => game.played) || games[0];
    return `
      <div class="toolbar">
        <h2>${displayTabLabel("schedule", "Schedule")}</h2>
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
      ${games.map(game => {
        const away = getTeam(game.awayTeamId);
        const home = getTeam(game.homeTeamId);
        return `<tr><td>${renderTeamNameWithRatings(away)}</td><td>${renderTeamNameWithRatings(home)}</td><td>${game.weather?.label || makeWeather(home, game.week).label}</td><td>${game.played ? "" : spreadForGame(game)}</td><td>${game.played ? `${game.awayScore}-${game.homeScore}` : "Upcoming"}</td><td><button data-action="selectGame" data-game="${game.id}">${game.played ? "Box" : "Preview"}</button></td></tr>`;
      }).join("")}
    </tbody></table>`;
  }

  function renderGamePreview(game) {
    const home = getTeam(game.homeTeamId);
    const away = getTeam(game.awayTeamId);
    const weather = game.weather || makeWeather(home, game.week);
    const homeProfile = gameProfile(home, away, true, weather);
    const awayProfile = gameProfile(away, home, false, weather);
    const homeRating = teamRatingSummary(home);
    const awayRating = teamRatingSummary(away);
    const rows = matchupRows(awayProfile, homeProfile).concat(matchupRows(homeProfile, awayProfile));
    return `<div class="stack">
      ${renderFieldGame(game, "Preview")}
      <div class="metric-row">
        <div class="metric"><label>Spread</label><strong>${spreadForGame(game)}</strong><span>home field included</span></div>
        <div class="metric"><label>Weather</label><strong>${weather.label}</strong><span>pass ${pct(weather.pass)}, rush ${pct(weather.rush)}</span></div>
        <div class="metric"><label>${away.abbr} OVR</label><strong>${awayRating.overall}</strong><span>OFF ${awayRating.offense} / DEF ${awayRating.defense} / ST ${awayRating.specialTeams}</span></div>
        <div class="metric"><label>${home.abbr} OVR</label><strong>${homeRating.overall}</strong><span>OFF ${homeRating.offense} / DEF ${homeRating.defense} / ST ${homeRating.specialTeams}</span></div>
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
    const qbPass = playerSkill(qb, "qbPass");
    const wrSkill = playerSkill(wr, "receiver");
    const cbSkill = playerSkill(cb, "coverage");
    const wrSizeEdge = receiverCoverageSizeEdge(wr, cb);
    const rbSkill = playerSkill(rb, "runner");
    const lbRunStop = unitRating(def, "LB", 3, "runStop");
    const passRush = unitRating(def, "DE", 2, "passRush") * 0.62 + unitRating(def, "DT", 2, "passRush") * 0.38;
    const runStop = unitRating(def, "DT", 2, "runStop") * 0.36 + lbRunStop * 0.42 + unitRating(def, "S", 2, "tackling") * 0.1 + unitRating(def, "DE", 2, "runStop") * 0.12;
    const coverage = defensiveCoverageRating(def);
    return [
      {
        label: `${off.abbr} pass game`,
        offense: `${qb ? playerName(qb) : "QB room"} / ${wr ? playerName(wr) : "WR room"}`,
        defense: `${cb ? playerName(cb) : "CB room"} plus ${def.abbr} coverage`,
        edge: qbPass * 0.36 + unitRating(off, "WR", 3, "receiver") * 0.22 + offProfile.passBlock * 0.17 - coverage * 0.25 - passRush * 0.16,
        impact: "explosive plays, turnovers"
      },
      {
        label: `${off.abbr} WR-CB`,
        offense: wr ? `${playerName(wr)} ${round(wrSkill, 1)} REC` : "WR room",
        defense: cb ? `${playerName(cb)} ${round(cbSkill, 1)} COV` : "CB room",
        edge: wrSkill - cbSkill + wrSizeEdge,
        impact: "target share, third downs"
      },
      {
        label: `${off.abbr} protection`,
        offense: `Pass block ${round(offProfile.passBlock, 1)}`,
        defense: `${def.abbr} rush ${round(passRush, 1)}`,
        edge: offProfile.passBlock - passRush,
        impact: "sacks, QB efficiency"
      },
      {
        label: `${off.abbr} run game`,
        offense: `${rb ? playerName(rb) : "RB room"} / OL`,
        defense: `${def.abbr} front seven`,
        edge: rbSkill * 0.34 + offProfile.runBlock * 0.36 - runStop * 0.46,
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
    return `<table><thead><tr><th>Div</th><th>Team</th><th class="num">OVR</th><th class="num">OFF</th><th class="num">DEF</th><th class="num">ST</th><th class="num">W</th><th class="num">L</th><th class="num">Pct</th><th class="num">PF</th><th class="num">PA</th><th>Strk</th></tr></thead><tbody>
      ${["East", "North", "South", "West"].flatMap(div => state.teams.filter(team => team.conf === conf && team.div === div).sort(compareTeams).map(team => {
        const rating = teamRatingSummary(team);
        return `<tr><td>${div}</td><td>${teamName(team)}</td><td class="num">${rating.overall}</td><td class="num">${rating.offense}</td><td class="num">${rating.defense}</td><td class="num">${rating.specialTeams}</td><td class="num">${team.wins}</td><td class="num">${team.losses}</td><td class="num">${(team.wins / Math.max(1, team.wins + team.losses)).toFixed(3)}</td><td class="num">${team.pf}</td><td class="num">${team.pa}</td><td>${team.streak}</td></tr>`;
      })).join("")}
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
    <div class="table-wrap"><table><thead><tr><th class="num">Year</th><th>Pos</th><th>Name</th><th>Team</th><th>Ht/Wt</th><th class="num">Ovr</th><th class="num">G</th><th class="num">Pass Yds</th><th class="num">Pass TD</th><th class="num">INT</th><th class="num">Rush Yds</th><th class="num">Rush TD</th><th class="num">Rec</th><th class="num">Rec Yds</th><th class="num">Rec TD</th><th class="num">Tk</th><th class="num">TFL</th><th class="num">Sk</th><th class="num">Def INT</th></tr></thead><tbody>
      ${rows.slice(0, 600).map(({ player, season }) => `<tr><td class="num">${season.year}</td><td>${player.pos}</td><td><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button></td><td>${season.team}</td><td>${sizeLabel(player)}</td><td class="num">${season.ovr}</td><td class="num">${season.games}</td><td class="num">${season.passYds}</td><td class="num">${season.passTd}</td><td class="num">${season.int}</td><td class="num">${season.rushYds}</td><td class="num">${season.rushTd}</td><td class="num">${season.rec}</td><td class="num">${season.recYds}</td><td class="num">${season.recTd}</td><td class="num">${season.tackles}</td><td class="num">${season.tfl}</td><td class="num">${season.sacks}</td><td class="num">${season.defInt}</td></tr>`).join("")}
    </tbody></table></div>`;
  }

  function renderDraft() {
    if (state.phase === "leagueDraft" && state.currentLeagueDraft && !state.currentLeagueDraft.complete) return renderNflLeagueDraft();
    const years = Object.keys(state.draftClasses).map(Number).sort((a, b) => a - b);
    const draftClass = state.draftClasses[String(ui.draftYear)] || [];
    const pickInfo = currentPickInfo();
    const selected = getProspect(ui.selectedProspectId) || draftClass[0];
    const userOnClock = state.phase === "draft" && pickInfo?.ownerTeam === USER_TEAM_ID;
    const prospects = draftClass.slice().sort((a, b) => {
      if (ui.draftSort === "pos") return a.pos.localeCompare(b.pos) || a.rank - b.rank;
      if (ui.draftSort === "pot") return scoutedValue(b, "pot") - scoutedValue(a, "pot") || a.rank - b.rank;
      if (ui.draftSort === "ovr") return scoutedValue(b, "ovr") - scoutedValue(a, "ovr") || a.rank - b.rank;
      return a.rank - b.rank;
    }).slice(0, 180);
    return `
      <div class="toolbar">
        <h2>${displayTabLabel("draft", "Draft")}</h2>
        <select data-control="draftYear">${years.map(year => `<option value="${year}" ${Number(ui.draftYear) === year ? "selected" : ""}>${year}</option>`).join("")}</select>
        <select data-control="draftSort"><option value="rank" ${ui.draftSort === "rank" ? "selected" : ""}>Rank</option><option value="pot" ${ui.draftSort === "pot" ? "selected" : ""}>Potential</option><option value="ovr" ${ui.draftSort === "ovr" ? "selected" : ""}>Current</option><option value="pos" ${ui.draftSort === "pos" ? "selected" : ""}>Position</option></select>
        ${state.phase === "draft" ? `<button data-action="simPick" ${userOnClock ? "disabled" : ""}>Sim Pick</button><button data-action="simToUserPick" ${userOnClock ? "disabled" : ""}>Sim To My Pick</button><button data-action="simRound" ${userOnClock ? "disabled" : ""}>Sim Round</button>` : ""}
      </div>
      ${state.phase === "draft" && pickInfo ? `<div class="phase-banner"><strong>Pick ${pickInfo.overall}</strong><span>${getTeam(pickInfo.ownerTeam).abbr} - Round ${pickInfo.round}, Pick ${pickInfo.pickInRound}</span></div>` : ""}
      <div class="grid two">
        <section class="panel"><div class="panel-header"><h3>Board</h3></div><div class="table-wrap">${renderProspectTable(prospects, pickInfo)}</div></section>
        <section class="panel"><div class="panel-header"><h3>Scouting Card</h3></div><div class="panel-body">${selected ? renderProspectCard(selected) : `<div class="empty">No prospects.</div>`}</div></section>
      </div>
    `;
  }

  function renderNflLeagueDraft() {
    const pickInfo = currentLeagueDraftInfo();
    const team = pickInfo ? getTeam(pickInfo.ownerTeam) : null;
    const userOnClock = pickInfo?.ownerTeam === USER_TEAM_ID;
    const query = ui.playerSearch.toLowerCase();
    const pool = state.freeAgents
      .filter(player => (ui.rosterPos === "ALL" || player.pos === ui.rosterPos) && (!query || playerName(player).toLowerCase().includes(query) || player.pos.toLowerCase().includes(query) || player.college.toLowerCase().includes(query)))
      .sort((a, b) => {
        if (ui.playerSort === "age") return a.age - b.age;
        if (ui.playerSort === "value") return playerTradeValue(b) - playerTradeValue(a);
        if (ui.playerSort === "pot") return b.pot - a.pot || b.ovr - a.ovr;
        return b.ovr - a.ovr || b.pot - a.pot;
      })
      .slice(0, 260);
    return `
      <div class="toolbar">
        <h2>NFL League Draft</h2>
        <input data-control="playerSearch" placeholder="Search player pool" value="${escapeAttr(ui.playerSearch)}">
        <select data-control="rosterPos"><option value="ALL">All</option>${POSITIONS.map(pos => `<option value="${pos}" ${ui.rosterPos === pos ? "selected" : ""}>${pos}</option>`).join("")}</select>
        <select data-control="playerSort">${["ovr", "pot", "age", "value"].map(key => `<option value="${key}" ${ui.playerSort === key ? "selected" : ""}>${key}</option>`).join("")}</select>
        <button data-action="simLeagueDraftPick" ${userOnClock ? "disabled" : ""}>Sim Pick</button>
        <button data-action="simLeagueDraftToUserPick" ${userOnClock ? "disabled" : ""}>Sim To My Pick</button>
      </div>
      ${pickInfo ? `<div class="phase-banner"><strong>Pick ${pickInfo.overall}</strong><span>${team?.abbr || ""} - Round ${pickInfo.round}, Pick ${pickInfo.pickInRound}</span></div>` : ""}
      <div class="grid two">
        <section class="panel">
          <div class="panel-header"><h3>Player Pool</h3><span class="spacer muted">${state.freeAgents.length} available</span></div>
          <div class="table-wrap">${renderLeagueDraftPoolTable(pool, userOnClock)}</div>
        </section>
        <section class="panel">
          <div class="panel-header"><h3>Detroit Roster</h3><span class="spacer muted">${teamPlayers(USER_TEAM_ID).length}/53</span></div>
          <div class="table-wrap">${renderRosterTable(teamPlayers(USER_TEAM_ID).sort((a, b) => positionOrder(a.pos) - positionOrder(b.pos) || b.ovr - a.ovr))}</div>
        </section>
      </div>
    `;
  }

  function renderLeagueDraftPoolTable(players, userOnClock) {
    return `<table><thead><tr><th>Pos</th><th>Name</th><th class="num">Age</th><th>Ht/Wt</th><th class="num">Ovr</th><th class="num">Pot</th><th>College</th><th class="num">Value</th><th></th></tr></thead><tbody>
      ${players.map(player => `<tr>
        <td>${player.pos}</td>
        <td><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button></td>
        <td class="num">${player.age}</td>
        <td>${sizeLabel(player)}</td>
        <td class="num">${player.ovr}</td>
        <td class="num">${player.pot}</td>
        <td>${player.college}</td>
        <td class="num">${playerTradeValue(player)}</td>
        <td>${userOnClock ? `<button class="primary" data-action="draftLeaguePlayer" data-player="${player.id}">Draft</button>` : ""}</td>
      </tr>`).join("")}
    </tbody></table>`;
  }

  function renderProspectTable(prospects, pickInfo) {
    return `<table><thead><tr><th class="num">Rank</th><th>Pos</th><th>Name</th><th>College</th><th>Ht/Wt</th><th class="num">Ovr</th><th class="num">Pot</th><th>Proj</th><th>Combine</th><th></th></tr></thead><tbody>
      ${prospects.map(prospect => `<tr>
        <td class="num">${prospect.rank}</td><td>${prospect.pos}</td><td><button class="link-button" data-action="selectProspect" data-player="${prospect.id}">${playerName(prospect)}</button></td><td>${prospect.college}</td>
        <td>${sizeLabel(prospect)}</td><td class="num">${scoutedValue(prospect, "ovr")}</td><td class="num">${scoutedValue(prospect, "pot")}</td><td>R${prospect.projectedRound}</td><td>${prospect.combine.forty}s / ${prospect.combine.bench} / ${prospect.combine.vert}"</td>
        <td>${state.phase === "draft" && pickInfo?.ownerTeam === USER_TEAM_ID ? `<button class="primary" data-action="draftProspect" data-player="${prospect.id}">Draft</button>` : ""}</td>
      </tr>`).join("")}
    </tbody></table>`;
  }

  function renderProspectCard(prospect) {
    const scoutedOvr = scoutedValue(prospect, "ovr");
    const scoutedPot = scoutedValue(prospect, "pot");
    const scoutedTrait = scoutedDevTrait(prospect, scoutedOvr, scoutedPot);
    return `<div class="stack">
      <div class="split"><div><strong>${playerName(prospect)}</strong><div class="muted">${prospect.pos} - ${prospect.college} - Age ${prospect.age} - ${sizeLabel(prospect)}</div></div><span class="pill light">Proj R${prospect.projectedRound}</span></div>
      <div class="metric-row">
        <div class="metric"><label>Scouted OVR</label><strong>${scoutedOvr}</strong><span>true accuracy: scouting</span></div>
        <div class="metric"><label>Scouted POT</label><strong>${scoutedPot}</strong><span>${scoutedTrait}</span></div>
        <div class="metric"><label>Size</label><strong>${formatHeight(prospect.height)}</strong><span>${prospect.weight} lb</span></div>
        <div class="metric"><label>40</label><strong>${prospect.combine.forty}</strong><span>${prospect.combine.vert}" vert</span></div>
        <div class="metric"><label>Bench</label><strong>${prospect.combine.bench}</strong><span>college: ${prospect.collegeStats}</span></div>
      </div>
      <div><strong>Awards</strong><div class="muted">${prospect.collegeAwards?.length ? prospect.collegeAwards.join(", ") : "None yet"}</div></div>
      <div><strong>Player Comp</strong><div class="muted">${prospect.comp}</div></div>
      <div class="table-wrap"><table><thead><tr><th>Attribute</th><th class="num">Grade</th><th>Attribute</th><th class="num">Grade</th></tr></thead><tbody>${renderProspectAttrs(prospect)}</tbody></table></div>
    </div>`;
  }

  function renderProspectProfile(prospect) {
    const scoutedOvr = scoutedValue(prospect, "ovr");
    const scoutedPot = scoutedValue(prospect, "pot");
    const scoutedTrait = scoutedDevTrait(prospect, scoutedOvr, scoutedPot);
    return `<div class="stack">
      <div class="split">
        <div>
          <strong>${prospect.pos} - ${prospect.college}</strong>
          <div class="muted">${prospect.year} Draft Class - Age ${prospect.age} - ${sizeLabel(prospect)}</div>
        </div>
        <span class="pill light">#${prospect.rank} Board / ${prospect.projectedRound === 1 ? "Round 1" : `Round ${prospect.projectedRound}`}</span>
      </div>
      <div class="metric-row">
        <div class="metric"><label>Scouted OVR</label><strong>${scoutedOvr}</strong><span>scouting-adjusted</span></div>
        <div class="metric"><label>Scouted POT</label><strong>${scoutedPot}</strong><span>${scoutedTrait}</span></div>
        <div class="metric"><label>Size</label><strong>${formatHeight(prospect.height)}</strong><span>${prospect.weight} lb</span></div>
        <div class="metric"><label>Projection</label><strong>R${prospect.projectedRound}</strong><span>rank ${prospect.rank}</span></div>
      </div>
      <div class="metric-row">
        <div class="metric"><label>40 Yard</label><strong>${prospect.combine.forty}</strong><span>speed/acceleration signal</span></div>
        <div class="metric"><label>Bench</label><strong>${prospect.combine.bench}</strong><span>strength signal</span></div>
        <div class="metric"><label>Vertical</label><strong>${prospect.combine.vert}"</strong><span>explosiveness signal</span></div>
        <div class="metric"><label>Player Comp</label><strong>${prospect.comp}</strong><span>archetype match</span></div>
      </div>
      <div class="grid two">
        <section class="panel"><div class="panel-header"><h3>College Resume</h3></div><div class="panel-body stack">
          <div><strong>Stats</strong><div class="muted">${prospect.collegeStats}</div></div>
          <div><strong>Awards</strong><div class="muted">${prospect.collegeAwards?.length ? prospect.collegeAwards.join(", ") : "None yet"}</div></div>
        </div></section>
        <section class="panel"><div class="panel-header"><h3>Scouting Notes</h3></div><div class="panel-body stack">
          <div><strong>Accuracy</strong><div class="muted">OVR/POT can be wrong depending on Detroit's scouting level and how far away the class is.</div></div>
          <div><strong>Development</strong><div class="muted">Potential can change after entering the league based on age, coaching, injuries, performance, position, and luck.</div></div>
        </div></section>
      </div>
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
    return `<div class="toolbar"><h2>${displayTabLabel("freeAgency", "Free Agency")}</h2><span class="pill light">${ui.discreteMode ? "Budget" : "Cap"} ${money(capSpace(USER_TEAM_ID))}</span><span class="pill light">${ui.discreteMode ? "Personnel" : "Roster"} ${teamPlayers(USER_TEAM_ID).length}/53</span></div>
      ${renderRetirementPanel()}
      <section class="panel"><div class="table-wrap"><table><thead><tr><th>Pos</th><th>Name</th><th class="num">Age</th><th>Ht/Wt</th><th class="num">Ovr</th><th class="num">Pot</th><th class="num">Ask</th><th class="num">Cap After</th><th></th></tr></thead><tbody>
      ${players.map(player => {
        const ask = estimatedAsk(player);
        return `<tr><td>${player.pos}</td><td><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button></td><td class="num">${player.age}</td><td>${sizeLabel(player)}</td><td class="num">${player.ovr}</td><td class="num">${player.pot}</td><td class="num">${money(ask)}</td><td class="num">${money(capSpace(USER_TEAM_ID) - ask)}</td><td><button data-action="signFA" data-player="${player.id}">Sign</button></td></tr>`;
      }).join("")}</tbody></table></div></section>`;
  }

  function renderRetirementPanel() {
    const team = getTeam(USER_TEAM_ID);
    const pending = (team.retiredPending || []).map(getPlayer).filter(Boolean);
    if (!pending.length) return "";
    return `<section class="panel mb-12"><div class="panel-header"><h3>Retirement Decisions</h3></div><div class="table-wrap"><table><thead><tr><th>Pos</th><th>Name</th><th class="num">Age</th><th>Ht/Wt</th><th class="num">Ovr</th><th>Injuries</th><th></th></tr></thead><tbody>
      ${pending.map(player => `<tr><td>${player.pos}</td><td>${playerName(player)}</td><td class="num">${player.age}</td><td>${sizeLabel(player)}</td><td class="num">${player.ovr}</td><td>${player.injury.history.length}</td><td><button data-action="convinceRetirement" data-player="${player.id}">Convince</button></td></tr>`).join("")}
    </tbody></table></div></section>`;
  }

  function renderTrades() {
    const partner = getTeam(ui.tradePartner) || state.teams.find(team => team.id !== USER_TEAM_ID);
    ui.tradePartner = partner.id;
    const preview = tradePreview();
    const userRating = teamRatingSummary(getTeam(USER_TEAM_ID));
    const partnerRating = teamRatingSummary(partner);
    return `
      <div class="toolbar">
        <h2>${displayTabLabel("trades", "Trades")}</h2>
        <select data-control="tradePartner">${state.teams.filter(team => team.id !== USER_TEAM_ID).map(team => `<option value="${team.id}" ${ui.tradePartner === team.id ? "selected" : ""}>${teamName(team)} - ${teamRatingLine(team)}</option>`).join("")}</select>
        <button class="primary" data-action="offerTrade" ${preview.accepted ? "" : "disabled"}>Offer Trade</button>
      </div>
      ${renderTradePreviewPanel(preview, partner, userRating, partnerRating)}
      <div class="asset-grid">
        ${renderAssetPanel(USER_TEAM_ID, ui.tradeMine, "Detroit Assets", "mine")}
        ${renderAssetPanel(partner.id, ui.tradeTheirs, `${partner.abbr} Assets`, "theirs")}
      </div>
    `;
  }

  function renderTradePreviewPanel(preview, partner, userRating, partnerRating) {
    const userCapDelta = round(-preview.cap.userChange, 2);
    const partnerCapDelta = round(-preview.cap.partnerChange, 2);
    const rosterClass = preview.roster.userAfter <= MAX_ROSTER + 3 && preview.roster.partnerAfter <= MAX_ROSTER + 3 ? "" : "bad";
    return `<section class="panel" data-trade-preview>
      <div class="panel-header"><h3>Preview</h3><span class="spacer ${preview.accepted ? "good" : "bad"}">${preview.accepted ? "Likely accepted" : "Needs more value"}</span></div>
      <div class="panel-body">
        <div class="metric-row">
          <div class="metric"><label>Detroit Sends</label><strong>${round(preview.mineValue, 1)}</strong><span>${ui.tradeMine.size} assets</span></div>
          <div class="metric"><label>${partner.abbr} Sends</label><strong>${round(preview.theirsValue, 1)}</strong><span>${ui.tradeTheirs.size} assets</span></div>
          <div class="metric"><label>Value Gap</label><strong class="${preview.delta >= 0 ? "good" : "bad"}">${round(preview.delta, 1)}</strong><span>premium adjusted</span></div>
          <div class="metric"><label>DET Cap Impact</label><strong class="${userCapDelta >= 0 ? "good" : "bad"}">${money(userCapDelta)}</strong><span>${money(capSpace(USER_TEAM_ID))} to ${money(preview.cap.userAfter)}</span></div>
          <div class="metric"><label>${partner.abbr} Cap Impact</label><strong class="${partnerCapDelta >= 0 ? "good" : "bad"}">${money(partnerCapDelta)}</strong><span>${money(capSpace(partner.id))} to ${money(preview.cap.partnerAfter)}</span></div>
          <div class="metric"><label>Roster After</label><strong class="${rosterClass}">DET ${preview.roster.userAfter} / ${partner.abbr} ${preview.roster.partnerAfter}</strong><span>53 active target</span></div>
          <div class="metric"><label>DET OVR</label><strong>${userRating.overall}</strong><span>OFF ${userRating.offense} / DEF ${userRating.defense} / ST ${userRating.specialTeams}</span></div>
          <div class="metric"><label>${partner.abbr} OVR</label><strong>${partnerRating.overall}</strong><span>OFF ${partnerRating.offense} / DEF ${partnerRating.defense} / ST ${partnerRating.specialTeams}</span></div>
        </div>
      </div>
    </section>`;
  }

  function refreshTradeSelectionUi() {
    const partner = getTeam(ui.tradePartner) || state.teams.find(team => team.id !== USER_TEAM_ID);
    if (!partner) return;
    const preview = tradePreview();
    const previewEl = app.querySelector("[data-trade-preview]");
    if (previewEl) {
      previewEl.outerHTML = renderTradePreviewPanel(preview, partner, teamRatingSummary(getTeam(USER_TEAM_ID)), teamRatingSummary(partner));
    }
    const offerButton = app.querySelector('[data-action="offerTrade"]');
    if (offerButton) offerButton.disabled = !preview.accepted;
    updateTradeAssetCount("mine", getTeam(USER_TEAM_ID), ui.tradeMine);
    updateTradeAssetCount("theirs", partner, ui.tradeTheirs);
  }

  function updateTradeAssetCount(side, team, selectedSet) {
    const node = app.querySelector(`[data-asset-count="${side}"]`);
    if (node && team) node.textContent = `${teamRatingLine(team)} - ${selectedSet.size} selected`;
  }

  function renderAssetPanel(teamId, selectedSet, title, side) {
    const team = getTeam(teamId);
    const players = teamPlayers(teamId).sort((a, b) => b.ovr - a.ovr || POSITION_VALUE[b.pos] - POSITION_VALUE[a.pos]);
    const picks = team.draftPicks
      .filter(pickItem => pickItem.year >= state.year + 1 && pickItem.year <= state.year + 3)
      .sort((a, b) => a.year - b.year || a.round - b.round || projectedOverallForPick(a) - projectedOverallForPick(b) || a.originalTeam.localeCompare(b.originalTeam));
    return `<section class="panel">
      <div class="panel-header"><h3>${title}</h3><span class="spacer muted" data-asset-count="${side}">${teamRatingLine(team)} - ${selectedSet.size} selected</span></div>
      <div class="trade-assets">
        <div class="asset-section-title"><strong>Roster</strong><span>${players.length} players</span></div>
        <div class="table-wrap asset-table-wrap">${renderTradeRosterAssets(players, selectedSet, side)}</div>
        <div class="asset-section-title"><strong>Draft Picks</strong><span>${picks.length} picks</span></div>
        <div class="table-wrap asset-table-wrap">${renderTradePickAssets(team, picks, selectedSet, side)}</div>
      </div>
    </section>`;
  }

  function tradePlayerDetroitCapDelta(player, side) {
    return round(side === "mine" ? capHit(player) - deadCapIfTrade(player) : -capHit(player), 2);
  }

  function renderTradeRosterAssets(players, selectedSet, side) {
    return `<table class="asset-table"><thead><tr><th></th><th>Pos</th><th>Name</th><th class="num">Age</th><th>Ht/Wt</th><th class="num">Ovr</th><th class="num">Pot</th><th class="num">Cap</th><th class="num">DET Cap</th><th class="num">Value</th></tr></thead><tbody>
      ${players.map(player => {
        const assetId = `player:${player.id}`;
        const disabled = tradeDeadlinePassed() ? "disabled" : "";
        const capDelta = tradePlayerDetroitCapDelta(player, side);
        return `<tr>
          <td><input type="checkbox" data-action="toggleAsset" data-side="${side}" data-asset="${assetId}" ${selectedSet.has(assetId) ? "checked" : ""} ${disabled}></td>
          <td>${player.pos}</td>
          <td><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button><div class="muted">${contractSummary(player)}</div></td>
          <td class="num">${player.age}</td>
          <td>${sizeLabel(player)}</td>
          <td class="num">${player.ovr}</td>
          <td class="num">${player.pot}</td>
          <td class="num">${money(capHit(player))}</td>
          <td class="num ${capDelta >= 0 ? "good" : "bad"}">${money(capDelta)}</td>
          <td class="num">${playerTradeValue(player)}</td>
        </tr>`;
      }).join("")}
    </tbody></table>`;
  }

  function renderTradePickAssets(team, picks, selectedSet, side) {
    return `<table class="asset-table"><thead><tr><th></th><th class="num">Year</th><th>Round</th><th>Pick</th><th>Original Team</th><th class="num">Value</th></tr></thead><tbody>
      ${picks.map(pickItem => {
        const assetId = pickAssetId(team.id, pickItem);
        const pickNumber = pickInRound(pickItem);
        const original = getTeam(pickItem.originalTeam);
        return `<tr>
          <td><input type="checkbox" data-action="toggleAsset" data-side="${side}" data-asset="${assetId}" ${selectedSet.has(assetId) ? "checked" : ""}></td>
          <td class="num">${pickItem.year}</td>
          <td>Round ${pickItem.round}</td>
          <td>${pickNumber ? `${pickItem.round}.${pickNumber}` : `Proj ${pickItem.round}.${projectedPickInRound(pickItem)}`}</td>
          <td>${original ? `<div><strong>${original.abbr}</strong><div class="muted">${teamName(original)} - ${teamRatingLine(original)}</div></div>` : pickItem.originalTeam}</td>
          <td class="num">${pickValue(pickItem)}</td>
        </tr>`;
      }).join("")}
    </tbody></table>`;
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
    return `<table><thead><tr><th>Pos</th><th>Name</th><th class="num">Age</th><th>Ht/Wt</th><th class="num">Ovr</th><th class="num">Cap Hit</th><th class="num">Release Dead</th><th class="num">Release Savings</th><th class="num">Post-June Now</th><th class="num">Post-June Next</th><th class="num">Trade Dead</th><th class="num">Trade Savings</th></tr></thead><tbody>
      ${players.map(player => {
        const hit = capHit(player);
        const releaseDead = deadCapIfRelease(player);
        const postJune = deadCapIfRelease(player, state.year, true);
        const tradeDead = deadCapIfTrade(player);
        return `<tr><td>${player.pos}</td><td><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button></td><td class="num">${player.age}</td><td>${sizeLabel(player)}</td><td class="num">${player.ovr}</td><td class="num">${money(hit)}</td><td class="num">${money(releaseDead.current)}</td><td class="num ${hit - releaseDead.current >= 0 ? "good" : "bad"}">${money(hit - releaseDead.current)}</td><td class="num">${money(postJune.current)}</td><td class="num">${money(postJune.next)}</td><td class="num">${money(tradeDead)}</td><td class="num ${hit - tradeDead >= 0 ? "good" : "bad"}">${money(hit - tradeDead)}</td></tr>`;
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
    return `<table><thead><tr><th>Pos</th><th>Name</th><th class="num">Age</th><th>Ht/Wt</th><th class="num">Ovr</th><th class="num">Pot</th><th class="num">Left</th><th class="num">Current Hit</th><th class="num">Projected AAV</th><th class="num">New Hit</th><th class="num">Cap After</th><th></th></tr></thead><tbody>
      ${candidates.map(player => {
        const offer = extensionOffer(player);
        const oldHit = capHit(player);
        const newHit = contractYearHit(offer, 0);
        const after = capSpace(USER_TEAM_ID) + oldHit - newHit;
        const idx = currentYearIndex(player);
        return `<tr><td>${player.pos}</td><td><button class="link-button" data-action="selectPlayer" data-player="${player.id}">${playerName(player)}</button></td><td class="num">${player.age}</td><td>${sizeLabel(player)}</td><td class="num">${player.ovr}</td><td class="num">${player.pot}</td><td class="num">${player.contract.years - idx}y</td><td class="num">${money(oldHit)}</td><td class="num">${money(contractAav(offer))}</td><td class="num">${money(newHit)}</td><td class="num ${after >= 0 ? "good" : "bad"}">${money(after)}</td><td><button data-action="extendPlayer" data-player="${player.id}" ${after < -1 ? "disabled" : ""}>Extend</button></td></tr>`;
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
    return `<div class="toolbar"><h2>${displayTabLabel("records", "Records")}</h2></div><div class="record-book">${Object.entries(labels).map(([key, label]) => {
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
      <section class="panel"><div class="panel-header"><h3>Display</h3></div><div class="panel-body stack">
        <label class="toggle-row"><input type="checkbox" data-control="discreteMode" ${ui.discreteMode ? "checked" : ""}><span>Discrete mode</span></label>
        <label class="toggle-row"><input type="checkbox" data-control="mobileMode" ${ui.mobileMode ? "checked" : ""}><span>Mobile mode</span></label>
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
      ui.prospectProfileOpen = false;
      render();
      return;
    }
    const tab = event.target.closest("[data-tab]");
    if (tab) {
      ui.tab = tab.dataset.tab;
      ui.toast = "";
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
        ui.prospectProfileOpen = false;
        createNewLeague(leagueName, ui.newLeagueMode, { nflSetup: ui.newLeagueNflSetup });
        ui.newLeagueName = "";
        render();
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
      ui.prospectProfileOpen = false;
      render();
    } else if (action === "closeProfile") {
      ui.profileOpen = false;
      ui.prospectProfileOpen = false;
      render();
    } else if (action === "selectPlayerTab") {
      ui.selectedPlayerId = target.dataset.player;
      ui.profileOpen = false;
      ui.tab = "roster";
      render();
    } else if (action === "startTradeForPlayer") startTradeForPlayer(target.dataset.player);
    else if (action === "release") releasePlayer(target.dataset.player);
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
      ui.prospectProfileOpen = true;
      ui.profileOpen = false;
      render();
    } else if (action === "draftProspect") userDraftProspect(target.dataset.player);
    else if (action === "simPick") simOneDraftPick();
    else if (action === "simToUserPick") simDraftToUserPick();
    else if (action === "simRound") simDraftRound();
    else if (action === "draftLeaguePlayer") userLeagueDraftPlayer(target.dataset.player);
    else if (action === "simLeagueDraftPick") simOneLeagueDraftPick();
    else if (action === "simLeagueDraftToUserPick") simLeagueDraftToUserPick();
    else if (action === "signFA") signFreeAgent(target.dataset.player);
    else if (action === "convinceRetirement") convinceRetirement(target.dataset.player);
    else if (action === "toggleAsset") {
      const set = target.dataset.side === "mine" ? ui.tradeMine : ui.tradeTheirs;
      if (target.checked) set.add(target.dataset.asset);
      else set.delete(target.dataset.asset);
      refreshTradeSelectionUi();
    } else if (action === "offerTrade") offerTrade();
    else if (action === "extendPlayer") extendPlayer(target.dataset.player);
    else if (action === "upgradeFacility") upgradeFacility(target.dataset.kind);
    else if (action === "toggleDiscrete") {
      setDiscreteMode(!ui.discreteMode);
      await save();
      render();
    }
    else if (action === "toggleMobile") {
      setMobileMode(!ui.mobileMode);
      await save();
      render();
    }
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
        createNewLeague(ui.newLeagueName.trim(), ui.newLeagueMode, { nflSetup: ui.newLeagueNflSetup });
        render();
        await save();
        render();
      }
    }
  });

  app.addEventListener("change", async event => {
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
    if (key === "discreteMode") setDiscreteMode(control.checked);
    if (key === "mobileMode") setMobileMode(control.checked);
    if (key === "tradePartner") {
      ui.tradePartner = control.value;
      ui.tradeTheirs.clear();
    }
    if (key === "newLeagueName") ui.newLeagueName = control.value;
    if (key === "newLeagueMode") ui.newLeagueMode = control.value;
    if (key === "newLeagueNflSetup") ui.newLeagueNflSetup = control.value;
    if (key === "importText") ui.importText = control.value;
    await save();
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
