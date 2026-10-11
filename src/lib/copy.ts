/** English interface copy; the Indonesian ("wkwk") copy in copy.id.ts has the same shape. */
export const en = {
  meta: {
    title: 'FMath: Fee and profit calculator for fomo traders',
    description:
      'Independent calculator for fomo traders: per-chain trade fees, break-even, net profit, and perps fees with liquidation price. Live market data from DexScreener and Hyperliquid.',
  },
  nav: {
    home: 'Home',
    fee: 'Fee',
    profit: 'Profit',
    perps: 'Perps',
    referral: 'Referral',
    quiz: 'Practice',
    offShort: '10% off',
    calculators: 'Calculators',
    method: 'Methodology',
    faq: 'FAQ',
    privacy: 'Privacy',
    disclaimer: 'Disclaimer',
    sources: 'Sources',
    skip: 'Skip to content',
    primary: 'Primary',
    mobile: 'App sections',
  },
  header: {
    toggleTheme: 'Switch between light and dark mode',
    install: 'Install app',
    referralCta: 'Get 10% off',
  },
  hero: {
    eyebrow: 'An independent calculator for fomo traders',
    by: 'by',
    title: 'Know the cost before you hit Buy.',
    lead: 'Work out trade fees, break-even and net profit for spot and perps on fomo. Uses the latest fee schedule and live market prices from DexScreener and Hyperliquid.',
    cta: 'Open the fee calculator',
    ctaSecondary: 'See the math',
    receipt: 'Fee receipt',
    referralLead: 'New to fomo?',
    referralLink: 'Trade with me and get 10% off fees',
    badge: '10% OFF',
    schedule: (d: string) => `Help Center fee schedule dated ${d}`,
  },
  facts: {
    standard: 'Standard spot fee',
    solana: 'Solana fee bands',
    solanaValue: (n: number) => `${n} bands`,
    builder: 'Perps builder fee per side',
    referral: 'Referral discount',
  },
  features: {
    title: 'Every number you check before a trade, in one place',
    items: [
      {
        title: 'Fee per trade',
        body: 'See which fee band applies, the effective rate and the network fee on each chain before the order goes out.',
      },
      {
        title: 'Targets and break-even',
        body: 'Look up a token live, set a market cap target, plan a stepped exit and see net profit after every buy and sell fee.',
      },
      {
        title: 'Perps and liquidation',
        body: 'Work out builder fee, venue fee, funding, liquidation price and a stop-loss sized to the loss you can take.',
      },
    ],
  },
  calc: {
    title: 'Calculator',
    lead: 'Everything is computed in your browser. Inputs are saved on this device.',
    tabs: { fee: 'Trade fee', profit: 'Profit & target', perps: 'Perps' },
    tabsLabel: 'Calculator type',
    pages: {
      fee: {
        title: 'Trade fee calculator',
        lead: 'The fomo fee for one order on any chain, with network fee, price impact and the referral discount.',
      },
      profit: {
        title: 'Profit and break-even calculator',
        lead: 'Net profit after the buy and sell fees, the move you need to break even, a target by market cap or multiple, and an exit plan that sells in steps.',
      },
      perps: {
        title: 'Perps fee and liquidation calculator',
        lead: 'Builder and venue fees, funding, the isolated liquidation price and stop-loss risk for Hyperliquid and trade.xyz markets.',
      },
    },
  },
  home: {
    toolsTitle: 'Pick a calculator',
    toolsLead: 'Each one opens on its own page and remembers your inputs on this device.',
    open: 'Open',
    feeExample: (fee: string, rate: string) => `$50 on Solana pays ${fee} (${rate})`,
    profitExample: (net: string) => `$100 that doubles nets ${net} after fees`,
    perpsExample: (rate: string) => `${rate} per side on Hyperliquid, taker`,
    referralCta: 'How the referral works',
    more: 'Also on FMath',
    methodBody: 'Every rate and formula, with sources.',
    faqBody: 'Accuracy, data sources and the referral.',
    quizBody: 'Five quick questions on fees, liquidation and stop-losses.',
  },
  common: {
    chain: 'Chain',
    side: 'Side',
    buy: 'Buy',
    sell: 'Sell',
    amount: 'Order size',
    buyAmount: 'Amount to buy',
    referral: 'Signed up with a referral link',
    referralHint: '10% off fomo trading fees.',
    tokenClass: 'Token type',
    standard: 'Standard / memecoin',
    major: 'Major token',
    majorHint: 'Special rate for selected major tokens. Make sure the token page in the app shows it.',
    networkFee: 'Network fee per transaction',
    networkFeeHint: 'Copy it from the fomo quote screen.',
    gasCovered: (chain: string) => `fomo covers gas, priority fees and token rent on ${chain}.`,
    priceImpact: 'Price impact / slippage',
    optional: 'optional',
    advanced: 'Advanced settings',
    live: 'Live',
    refresh: 'Refresh',
    updated: (t: string) => `Updated ${t}`,
    loading: 'Loading live data...',
    loadError: 'Could not load live data. Check your connection and try again.',
    retry: 'Try again',
    quick: 'Quick picks',
    clear: 'Clear',
    yes: 'Yes',
    no: 'No',
    invalid: 'Enter a valid number.',
    seeResults: 'See breakdown',
    readAs: (v: string) => `Read as ${v}`,
  },
  fee: {
    results: 'Fee breakdown',
    fomoFee: 'fomo fee',
    effective: 'effective rate',
    band: 'Fee band',
    network: 'Network fee',
    impact: 'Price impact',
    total: 'Total cost',
    allIn: 'Total cost as share of order',
    receivedBuy: 'Token value received',
    receivedSell: 'USDC received',
    saved: 'Saved by referral',
    covered: 'Covered by fomo',
    minSell: (min: string, chain: string) => `The minimum sell on ${chain} is ${min}. The app will reject this order.`,
    majorCap: 'For major tokens under 1,000 USDC, fomo charges a minimum fee without publishing the amount. This uses the last published cap, 0.50 USDC.',
    otherRoute: (fee: string) => `This is the lowest-fee Solana route. On fomo's other routes, 0.50% with a 0.95 USDC minimum, this order pays ${fee}. The route changes from trade to trade; the in-app quote shows which one you got.`,
    flat: (v: string) => `flat ${v}`,
    percent: (v: string) => `${v} of the order`,
    range: (lo: string, hi: string) => `${lo} to under ${hi}`,
    from: (lo: string) => `${lo} and up`,
    below: (hi: string) => `under ${hi}`,
    any: 'Any size',
    enterAmount: 'Enter an order size to see the fee.',
  },
  chart: {
    title: 'Effective rate by order size',
    subtitle: (chain: string) => `${chain}, including the network fee you entered`,
    xLabel: 'Order size (USDC, log scale)',
    you: 'Your order',
    order: 'Order',
    fee: 'Fee',
    rate: 'Rate',
    showTable: 'Band table',
    showChart: 'Chart',
    clipped: (max: string) => `Y axis capped at ${max}.`,
  },
  profit: {
    token: 'Token',
    tokenHint: 'Optional. Fills in market cap from live DexScreener data.',
    searchPlaceholder: 'Search name, symbol or contract address',
    searchLabel: 'Search token',
    searching: 'Searching...',
    noResults: 'No matching token on a chain fomo supports.',
    change: 'Change token',
    price: 'Price',
    mcap: 'Market cap',
    fdv: 'FDV',
    liquidity: 'Liquidity',
    change24h: '24h',
    openDex: 'Open on DexScreener',
    entryMcap: 'Market cap at buy',
    exitBy: 'Sell target by',
    byMcap: 'Market cap',
    byMultiple: 'Multiple',
    targetMcap: 'Target market cap',
    targetMultiple: 'Target multiple',
    impliedPrice: (p: string) => `Equals a price of ${p}`,
    impliedMcap: (m: string) => `Equals a market cap of ${m}`,
    buyImpact: 'Price impact on buy',
    sellImpact: 'Price impact on sell',
    needEntry: 'Enter the market cap at buy to use a market cap target.',
    netPnl: 'Net profit',
    loss: 'Net loss',
    roi: 'ROI',
    proceeds: 'USDC back',
    breakEven: 'Break-even',
    breakEvenMcap: 'Break-even market cap',
    breakEvenNote: (move: string) => `The token has to rise ${move} just to get your money back after fees.`,
    costs: 'Total costs',
    buyLeg: 'On buy',
    sellLeg: 'On sell',
    positionEntry: 'Position value after buy',
    positionExit: 'Position value at target',
    fomoFee: 'fomo fee',
    network: 'Network fee',
    impact: 'Price impact',
    scenarios: 'Scenarios',
    scenariosHint: 'Same amount and fees at a few price multiples.',
    scenarioMultiple: 'Multiple',
    scenarioProceeds: 'Back',
    scenarioPnl: 'Profit',
  },
  ladder: {
    title: 'Exit plan',
    lead: 'Sell the bag in steps as the price climbs. Every step is its own sell and pays its own fomo fee.',
    presets: 'Start from',
    presetInitials: 'Initials out at 2x',
    presetLadder: '2x · 5x · 10x',
    multiple: 'Sell at',
    share: 'Share of bag',
    multipleLabel: (n: number) => `Step ${n} price multiple`,
    shareLabel: (n: number) => `Step ${n} share of the bag`,
    remove: (n: number) => `Remove step ${n}`,
    add: 'Add step',
    initialsHint: (share: string, m: string) => `Selling ${share} of the bag at ${m} gets back what you spent, after fees.`,
    initialsNever: (m: string) => `Selling the whole bag at ${m} does not get back what you spent.`,
    allocated: (p: string) => `${p} of the bag allocated`,
    over: 'The steps add up to more than the whole bag. Later steps only sell what is left.',
    asked: (p: string) => `${p} asked, cut to what is left`,
    back: 'USDC back',
    realized: 'Realized profit',
    realizedLoss: 'Realized loss',
    fees: 'fomo fees on sells',
    feesSub: (n: number) => (n === 1 ? '1 sell' : `${n} sells`),
    initialsBack: 'Initials back',
    initialsNotBack: 'Not yet',
    left: 'Still holding',
    leftSub: (share: string, m: string) => `${share} of the bag, valued at ${m}`,
    colSell: 'Sell',
    colFee: 'fomo fee',
    colBack: 'Back',
    colTotal: 'Total back',
    smallSells: (n: number, under: string, rate: string) =>
      `${n === 1 ? '1 step sells' : `${n} steps sell`} under ${under} on Solana and ${n === 1 ? 'pays' : 'pay'} up to ${rate} in fomo fees. Fewer, larger steps cost less.`,
    minSell: (min: string, chain: string) => `A step sells under the ${min} minimum on ${chain}. The app will reject it.`,
    empty: 'Add a step to plan the exit.',
    needBuy: 'Enter an amount to buy to plan the exit.',
  },
  perps: {
    venue: 'Venue',
    hlHint: 'Crypto',
    xyzHint: 'Stocks, indices, commodities',
    market: 'Market',
    marketLoading: 'Loading markets...',
    mark: 'Mark',
    fundingLive: 'Funding/h',
    maxLev: (n: number) => `max ${n}x`,
    side: 'Side',
    long: 'Long',
    short: 'Short',
    margin: 'Margin (isolated)',
    leverage: 'Leverage',
    entry: 'Entry price',
    useMark: 'Use mark price',
    exit: 'Exit / target price',
    exitHint: 'Quick moves from entry',
    orderType: 'Order type',
    taker: 'Taker (market)',
    maker: 'Maker (limit)',
    growth: 'Growth mode',
    growthHint: 'HIP-3 markets in growth mode cut venue fees by at least 90%. Crypto and gold markets on trade.xyz are not eligible.',
    growthFromApi: 'Status from the Hyperliquid API.',
    funding: 'Funding per hour',
    fundingHint: 'Positive means longs pay shorts.',
    hold: 'Hours the position stays open',
    venueFee: 'Venue fee',
    feeSplit: (b: string, v: string) => `fomo ${b} + venue ${v}`,
    builderFee: 'fomo builder fee',
    usNote: 'fomo perps are not available to users in the United States.',
    netPnl: 'Net PnL',
    roe: 'ROE',
    notional: 'Position size',
    size: 'Size',
    feeRate: 'Fee per side',
    openFee: 'Open fee',
    closeFee: 'Close fee',
    fundingCost: 'Funding paid',
    fundingGain: 'Funding received',
    grossPnl: 'Gross PnL',
    liq: 'Liquidation price',
    liqNone: 'None',
    liqDistance: (p: string) => `${p} from entry`,
    breakEven: 'Break-even price',
    minPosition: (min: string) => `fomo's minimum perps position is ${min} notional. The app will reject this order.`,
    tierWarn: (n: number) => `At this position size the margin tier only allows ${n}x. Lower the leverage or margin.`,
    noMarket: 'Pick a market or type an entry price.',
    estimate: 'Funding uses the current rate and the entry price; the real amount changes every hour.',
    stop: 'Stop-loss price',
    stopHint: 'Quick moves against you',
    stopSideLong: 'For a long, the stop-loss goes below the entry price.',
    stopSideShort: 'For a short, the stop-loss goes above the entry price.',
    risk: 'Max loss at stop',
    riskHint: 'The most you want to lose if the stop fills, fees included.',
    riskMargin: (m: string, n: string) => `Margin for this risk: ${m} (position ${n}).`,
    riskNeedStop: 'Set a stop-loss price to size the margin from this risk.',
    useMargin: 'Use',
    useMarginLabel: (m: string) => `Set margin to ${m}`,
    lossAtStop: 'Loss at stop',
    lossAtStopSub: (p: string, d: string) => `${p} of margin · stop ${d} from entry`,
    riskReward: 'Risk : reward',
    riskRewardValue: (r: string) => `1 : ${r}`,
    riskRewardNone: 'Target not in profit',
    stopBeyondLiq: (liq: string) => `The stop is past the liquidation price (${liq}), so the position would be liquidated before the stop fills. Move the stop closer or lower the leverage.`,
    liquidatedFirst: 'Liquidated first',
    riskBeyondLiq: 'At this leverage the stop is past the liquidation price. Move the stop closer or lower the leverage.',
    stopNote: 'Stops trigger on the mark price and fill as market orders, so the close pays the taker fee and can slip.',
  },
  quiz: {
    title: 'Practice the math',
    lead: 'Five short questions on fees, break-even, liquidation and stop-losses, built from the same formulas as the calculators. Every wrong answer shows which mistake it is.',
    topicLabel: 'Topic',
    topics: { all: 'Mixed', fees: 'Spot fees', profit: 'Profit', perps: 'Perps', risk: 'Stop-loss' },
    start: 'Start',
    meta: (n: number) => `${n} questions · about 2 minutes · nothing leaves your browser`,
    progress: (i: number, n: number) => `Question ${i} of ${n}`,
    level: (n: number) => ['Easy', 'Medium', 'Hard'][n - 1] ?? '',
    given: 'Given',
    options: 'Answers',
    right: 'Right',
    wrong: 'Not quite',
    yourPick: 'Your pick',
    answer: 'Answer',
    solution: 'How it works',
    formula: 'Formula',
    open: 'Do it in the calculator',
    next: 'Next question',
    finish: 'See results',
    score: 'Your score',
    scoreValue: (r: number, n: number) => `${r} / ${n}`,
    verdict: (r: number, n: number): string =>
      r === n ? 'Every one right. You know where the fees hide.' : r >= n - 1 ? 'Nearly all right. Check the one you missed below.' : r >= n / 2 ? 'Good base. A few formulas are worth another look.' : 'Worth another round. The solutions show each step.',
    solid: 'Solid',
    practice: 'Practice this',
    again: 'New questions',
    retryWeak: (topic: string) => `Practice ${topic}`,
    changeTopic: 'Change topic',
    review: 'Review',
    disclaimer: 'Practice only. Rates follow the fomo and Hyperliquid schedules on the methodology page; real fills, funding and fees vary.',
  },
  method: {
    title: 'Methodology',
    lead: 'The formulas and rates this calculator uses, with sources. When fomo changes its fee schedule, these numbers need to change too.',
    spotTitle: 'fomo spot fees',
    sizeCol: 'Order size (USDC)',
    feeCol: 'fomo fee',
    solanaTitle: 'Solana (gas covered by fomo)',
    solanaRoute: 'This is the lowest-fee route. When a trade goes through another route, the fee is 0.50% with a 0.95 USDC minimum, so orders under 190 USDC pay 0.95 USDC. The route changes from trade to trade.',
    otherTitle: 'Base, BNB Chain, Monad, Robinhood Chain, Ethereum, Arc',
    otherBody: '0.50% of the order, plus the network fee shown in the quote.',
    majorTitle: 'Selected major tokens',
    majorBody: 'From 1,000 USDC: 0.05%. Smaller trades pay a minimum fee fomo no longer publishes; the calculator uses the last published cap, 0.50 USDC.',
    referralBody: 'Signing up with a referral link takes 10% off trading fees (0.50% becomes 0.45%). The calculator applies it to every band.',
    minSell: 'Minimum sell: 2 USDC on most chains, 5 USDC on Ethereum.',
    formulasTitle: 'Formulas',
    formulas: [
      { name: 'Trade fee', expr: 'fee = band(order) × (1 - referral discount)' },
      { name: 'Received', expr: 'received = order - fomo fee - network fee - price impact' },
      { name: 'Round trip', expr: 'back = (buy - buy fee) × multiple - sell fee' },
      { name: 'Break-even', expr: 'find multiple k where back(k) = amount spent (bisection)' },
      { name: 'Perps fee', expr: 'fee per side = notional × (builder fee + venue fee)' },
      { name: 'Liquidation', expr: 'liq = (size × entry - side × (margin + deduction)) / (size × (1 - side × mmr))' },
      { name: 'Maintenance', expr: 'mmr = 1 / (2 × tier max leverage)' },
      { name: 'Exit plan step', expr: 'back = value × (1 - impact) - fomo fee(step order) - network fee' },
      { name: 'Initials out', expr: 'find share s where back(s × position × multiple) = amount spent (bisection)' },
      { name: 'Loss at stop', expr: 'loss = size × |entry - stop| + open fee + size × stop × taker fee + funding' },
      { name: 'Risk sizing', expr: 'margin = max loss / loss at the stop per 1 USDC of margin' },
    ],
    perpsTitle: 'Perps fees',
    perpsBody: 'fomo builder fee 0.05% per side (0.045% with a referral), plus the venue fee. Hyperliquid base tier: taker 0.045%, maker 0.015%. trade.xyz (HIP-3): 2x the standard rate, or 90% lower in growth mode.',
    sourcesTitle: 'Sources',
    kinds: { official: 'Official', secondary: 'Secondary', api: 'Live API', opensource: 'Open source' },
    checked: (d: string) => `Rates last checked ${d}.`,
  },
  referral: {
    eyebrow: 'Referral',
    couponOff: '10%',
    couponFees: 'off trading fees',
    headline: 'Trade with me on fomo and get 10% off fees!',
    lead: 'Sign up through my link and the discount is applied to your trading fees. Same app, same trades, smaller fee on every order.',
    cta: 'Get 10% off on fomo',
    ctaShort: 'Get 10% off',
    code: 'Referral code',
    copy: 'Copy code',
    copied: 'Referral code copied',
    steps: [
      { title: 'Open the link', body: 'It opens fomo with my referral attached.' },
      { title: 'Create your account', body: 'Sign up as a new user in the fomo app.' },
      { title: 'Trade with 10% off', body: 'Trading fees come in 10% lower, for example 0.50% becomes 0.45%.' },
    ],
    estimatorTitle: 'What 10% off is worth to you',
    estimatorLead: 'Based on the fomo fee schedule, not an estimate of returns.',
    volume: 'Monthly trading volume',
    orderSize: 'Typical order size',
    chain: 'Chain',
    otherChains: 'Other chains',
    feesWithout: 'Fees without the link',
    perMonth: 'per month',
    savedMonth: 'You keep per month',
    savedYear: 'You keep per year',
    trades: (n: string) => `${n} orders a month`,
    disclosure: 'Referral link. When you sign up through it, Willy, who makes FMath, receives referral rewards from fomo. Your discount does not depend on it, and FMath stays independent of fomo.',
    from: 'Referral from',
    nudgeTitle: (save: string) => `Save ${save} on this trade`,
    nudgeTitleRoundTrip: (save: string) => `Keep ${save} more on this round trip`,
    nudgeTitlePerps: (save: string) => `Save ${save} on this position`,
    nudgeCompare: (now: string, then: string) => `Pay ${then} instead of ${now} with 10% off fees.`,
    nudgeHave: 'Already signed up with a referral? Turn on the switch above.',
  },
  creator: {
    label: 'Made by',
    role: 'Creator of FMath',
    body: 'Questions, a fee that looks off, or an idea for FMath? Reach Willy on X.',
    follow: 'Follow on X',
    followLabel: (handle: string) => `Follow ${handle} on X`,
  },
  share: {
    button: 'Share',
    label: 'Share this calculation',
    copied: 'Link copied',
    failed: 'Could not copy the link',
    title: 'FMath calculation',
  },
  pwa: {
    offline: 'You are offline. Fee math still works; live prices come back when you reconnect.',
    update: 'A new version of FMath is ready.',
    reload: 'Reload',
    installed: 'FMath is installed',
    iosTitle: 'Install FMath on iPhone or iPad',
    iosSteps: ['Tap the Share button in Safari.', 'Choose Add to Home Screen.', 'Tap Add.'],
    close: 'Close',
  },
  notFound: {
    title: 'Page not found',
    body: 'This page does not exist. The calculator is one tap away.',
    cta: 'Back to the calculator',
  },
  error: {
    title: 'Something went wrong',
    body: 'The calculator hit an unexpected error. Your inputs are saved on this device.',
    retry: 'Try again',
  },
  faq: {
    title: 'Questions',
    description: 'Answers on accuracy, live data sources, the fomo fee schedule and the referral discount.',
    items: [
      {
        q: 'Is FMath part of fomo?',
        a: 'No. FMath is an independent tool. It never asks for your wallet, a login or funds. Every calculation runs in your browser.',
      },
      {
        q: 'Why do small Solana orders feel expensive?',
        a: 'Under 190 USDC, Solana uses flat and 2% bands. A 50 USDC order pays 0.95 USDC, or 1.90%. From 190 USDC the rate drops to 0.50%. Those bands are the lowest-fee route; on fomo\'s other routes every order under 190 USDC pays 0.95 USDC.',
      },
      {
        q: 'Where do prices and market caps come from?',
        a: 'Token prices and market caps come straight from the public DexScreener API. Perps mark price, funding and max leverage come from the Hyperliquid info API. There is no sample data.',
      },
      {
        q: 'How accurate is it?',
        a: 'The fomo fee follows the published schedule exactly. Price impact, network fees and funding depend on the market when the order fills, so the final number is always the one on the in-app quote.',
      },
      {
        q: 'Why is there a referral link?',
        a: 'It is how FMath is supported. Signing up through it gives you 10% off fomo trading fees, and Willy, who makes FMath, receives referral rewards from fomo. The calculator works the same whether you use it or not.',
      },
      {
        q: 'Why does selling in small steps cost more on Solana?',
        a: 'Every sell pays its own fomo fee. On Solana, sells under 190 USDC pay a flat 0.95 USDC or 2%, so four 50 USDC sells pay 3.80 USDC where one 200 USDC sell pays 1.00 USDC. The exit plan in the profit calculator shows the fee on every step.',
      },
      {
        q: 'How does the perps stop-loss math work?',
        a: 'The loss at the stop adds the price move, the open fee, the close fee at the taker rate and the funding for the hours you hold. Set a max loss and the calculator works out the margin that loses exactly that much at your stop and leverage. If the stop sits past the liquidation price, it warns you: the position would be liquidated first.',
      },
      {
        q: 'Does the referral discount apply to flat fees?',
        a: 'fomo describes it as 10% off trading fees. The calculator applies it to every band, flat ones included. Check the quote screen to be sure.',
      },
      {
        q: 'Why does my Android phone warn "Risks May Exist" when I install FMath?',
        a: 'Installing FMath from the browser makes Chrome build a small Android package (a WebAPK) for it. Some phones, such as Infinix, Tecno and itel, flag every app that was not installed from their own store or Google Play, and their virus scan can time out on it. FMath asks for no permissions; Notifications is listed because Chrome adds it to every installed web app, and FMath never sends any. Tap Ignore to finish, or install FMath from Google Play once it is listed there.',
      },
    ],
  },
  legal: {
    updated: (d: string) => `Last updated ${d}`,
    privacy: {
      title: 'Privacy policy',
      lead: 'FMath has no accounts, no analytics, no ads and no cookies. Everything it calculates stays on your device.',
      sections: [
        {
          title: 'What FMath collects',
          body: [
            'Nothing that identifies you. FMath never asks for your name, email, wallet, private keys or funds, and it does not run analytics, tracking pixels or ads.',
          ],
        },
        {
          title: 'What stays on your device',
          body: [
            'Your theme, language and calculator inputs are saved in your browser\'s local storage so they are still there next time. A service worker keeps a copy of the app so it opens offline.',
            'None of this leaves your device. Clear the site data in your browser, or uninstall the app, to remove it.',
          ],
        },
        {
          title: 'Live market data',
          body: [
            'When you look up a token, the address or name you type is sent to the public DexScreener API. Perps prices, funding and leverage limits come from the public Hyperliquid API. These requests go straight from your device to those services, which see your IP address like any website does and handle it under their own privacy policies.',
          ],
        },
        {
          title: 'Hosting',
          body: [
            'The host that serves FMath\'s files may keep standard access logs, such as IP address, browser and time of request, to keep the site running and secure. FMath does not use them to profile anyone.',
          ],
        },
        {
          title: 'Links to other sites',
          body: [
            'Links to fomo, X, DexScreener, Hyperliquid and the fee sources open those sites, which have their own privacy policies. Signing up to fomo through the referral link tells fomo which referral you used.',
          ],
        },
        {
          title: 'Android app',
          body: [
            'The Android app is this website running in Chrome. It has the same privacy terms and requests no extra permissions. Android may list Notifications for any installed web app; FMath never sends notifications.',
          ],
        },
        {
          title: 'Children',
          body: ['FMath is a trading tool for adults and is not directed at anyone under 18.'],
        },
        {
          title: 'Changes and contact',
          body: [
            'If this policy changes, the date at the top changes with it. Questions go to the creator on X.',
          ],
        },
      ],
    },
    disclaimer: {
      title: 'Disclaimer',
      lead: 'FMath is an independent estimation tool. It is not financial advice and it is not part of fomo.',
      sections: [
        {
          title: 'Not financial advice',
          body: [
            'Everything FMath shows is general information to help you check costs. It is not a recommendation to buy, sell or hold anything. Make your own decisions and, if you need advice, ask a licensed professional.',
          ],
        },
        {
          title: 'Not affiliated',
          body: [
            'FMath is not affiliated with, endorsed by or operated by fomo, DexScreener or Hyperliquid. Their names are used only to describe what FMath calculates and where its data comes from.',
          ],
        },
        {
          title: 'Estimates, not quotes',
          body: [
            'Fees follow the published fomo schedule as of the date shown on the Methodology page, and schedules change. Price impact, network fees, funding and liquidation depend on the market when an order fills. The number on the fomo quote screen is always the final one.',
            'Live data comes from third-party APIs and can be delayed, missing or wrong.',
          ],
        },
        {
          title: 'High risk',
          body: [
            'Memecoins and leveraged perps are highly volatile. You can lose all of your money, and a leveraged position can be liquidated before your stop-loss is reached.',
          ],
        },
        {
          title: 'No custody, no trading',
          body: [
            'FMath never holds funds, connects to wallets or places orders. It only calculates.',
          ],
        },
        {
          title: 'Referral',
          body: [
            'FMath links to the creator\'s fomo referral. Signing up through it gives you 10% off fomo trading fees and gives the creator referral rewards from fomo. The calculator works the same whether you use it or not.',
          ],
        },
        {
          title: 'No warranty',
          body: [
            'FMath is provided as is, without warranty of any kind. To the extent the law allows, its creator is not liable for losses from using it or relying on its numbers.',
          ],
        },
      ],
    },
  },
  footer: {
    disclaimer: 'FMath is an independent tool and is not affiliated with fomo. Not financial advice. Memecoin and perps trading is high risk. Fee schedules change; the final number is always the one on the fomo quote screen.',
    built: 'Built with Next.js, React, Tailwind CSS, Lucide and Geist.',
    install: 'Install app',
    referral: 'Get 10% off fomo fees',
    nav: 'Footer',
    copyright: (year: number, name: string) => `© ${year} FMath by ${name}. Not affiliated with fomo.`,
  },
};

export type Copy = typeof en;

export type Lang = 'en' | 'id';

export const LANGS: readonly Lang[] = ['en', 'id'];

/** Toggle labels: Indonesian is shown as "wkwk". */
export const LANG_LABELS: Record<Lang, string> = { en: 'EN', id: 'wkwk' };

/** Copy per language. Indonesian ships as its own chunk and loads only on /id/ pages. */
const COPY: Partial<Record<Lang, Copy>> = { en };

const loading: Partial<Record<Lang, Promise<void>>> = {};

/** Whether a language's copy is loaded, so `t` can read it without waiting. */
export function hasLang(lang: Lang): boolean {
  return COPY[lang] !== undefined;
}

/**
 * Fetches a language's copy if this page has not loaded it yet. The same
 * promise comes back every time, so LangProvider can suspend on it with use().
 */
export function loadLang(lang: Lang): Promise<void> {
  if (COPY[lang]) return Promise.resolve();
  loading[lang] ??= import('./copy.id').then(
    (m) => {
      COPY.id = m.id;
    },
    (err: unknown) => {
      // let the next attempt try again, e.g. once back online
      delete loading[lang];
      throw err;
    },
  );
  return loading[lang];
}

let current: Lang = 'en';

export function getLang(): Lang {
  return current;
}

/**
 * Switches the language `t` reads from. Only LangProvider calls this, during
 * render and before its subtree renders, once loadLang has finished. The
 * language comes from the URL: /id/ pages are Indonesian, the rest English.
 */
export function setLang(lang: Lang) {
  current = lang;
}

/**
 * All interface copy, in the current language. Every read goes through the
 * proxy, so code reads `t.nav.home` at render time and gets the language the
 * page is showing; LangProvider remounts the app when it changes.
 */
export const t: Copy = new Proxy(en, {
  get: (_, key) => (COPY[current] ?? en)[key as keyof Copy],
});
