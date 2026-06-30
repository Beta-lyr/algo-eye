// ============================================================
// English translations
// ============================================================

export const en: Record<string, any> = {
  // Common
  common: {
    about: 'About',
    github: 'GITHUB',
    loading: 'Loading...',
    ready: 'Ready',
    apply: 'Apply',
    reset: 'Reset',
    cancel: 'Cancel',
    confirm: 'Confirm',
    switchLang: '切换到中文',
  },

  // Topbar
  topbar: {
    tagline: 'phosphor terminal for algorithms',
    live: 'LIVE',
    elements: 'elements',
  },

  // Navigation categories
  nav: {
    sorting: 'Sort',
    searching: 'Search',
    graph: 'Graph',
    'data-structure': 'Structure',
    string: 'String',
    'dynamic-programming': 'DP',
    playground: 'Playground',
  },

  // Algorithm categories (detailed)
  category: {
    sorting: 'Sorting',
    searching: 'Searching',
    graph: 'Graph',
    'data-structure': 'Data Structure',
    string: 'String Matching',
    'dynamic-programming': 'Dynamic Programming',
  },

  // V3 Playground custom code page
  playground: {
    apiRef: 'viz API Reference',
    editor: 'Code Editor',
    data: 'Data',
    run: '▸ Run',
    running: 'Running...',
    tabArray: 'Array',
    tabString: 'String',
    tabGrid: 'Grid',
    // array
    compareDesc: 'compare i,j',
    swapDesc: 'swap i,j',
    setDesc: 'assign [i]=v',
    markDesc: 'mark persistent state',
    pointerDesc: 'pointer label',
    visitDesc: 'visit i',
    logDesc: 'free text step',
    doneDesc: 'done',
    valueDesc: 'read [i]',
    lengthDesc: 'data length',
    errorLength: 'Data length must be 2-64',
    errorNumber: 'Data contains non-number',
    // string
    text: 'Text',
    pattern: 'Pattern',
    markTextDesc: 'mark text char',
    markPatternDesc: 'mark pattern char',
    textCharAtDesc: 'read text char',
    patternCharAtDesc: 'read pattern char',
    textLengthDesc: 'text length',
    patternLengthDesc: 'pattern length',
    setTextDesc: 'set text',
    setPatternDesc: 'set pattern',
    // grid
    rows: 'Rows',
    cols: 'Cols',
    wallRatio: 'Wall Ratio',
    start: 'Start',
    target: 'Target',
    regenerate: 'Regenerate',
    indexDesc: 'row,col → index',
    rowDesc: 'index → row',
    colDesc: 'index → col',
    inBoundsDesc: 'check bounds',
    cellValueDesc: 'read cell value',
    markCellDesc: 'mark cell',
    visitCellDesc: 'visit cell',
    setCellDesc: 'set cell value',
    setColsDesc: 'set column count',
    setStartDesc: 'set start',
    setTargetDesc: 'set target',
    rowsDesc: 'grid rows',
    colsDesc: 'grid cols',
    // common
    trace: 'Execution Trace',
    traceEmpty: 'No steps yet, click Run',
  },

  // Landing page
  landing: {
    subtitle: 'Phosphor Terminal for Algorithms',
    tagline: 'Watch algorithms run, make logic visible',
    cta: '▸ Enter Terminal',
    footer: 'React + TypeScript + Canvas 2D · CRT Retro Terminal Style',
    algoCount: '{count} algorithms',
    categoryDesc: {
      sorting: 'Bubble · Selection · Insertion · Quick · Merge · Heap · Shell · Radix · Counting · Bucket',
      searching: 'Linear · Binary · Jump · Interpolation · Exponential',
      graph: 'BFS · DFS · Dijkstra · A* · Bellman-Ford · Prim · Kruskal',
      'data-structure': 'BST · Heap · Linked List · Hash Table',
      string: 'KMP · Rabin-Karp · Boyer-Moore',
      'dynamic-programming': 'LCS · Knapsack · Edit Distance',
    },
  },

  // Left panel
  tree: {
    title: 'Algorithms',
    hint: '/tree',
    diffAll: 'All',
    diffBeginner: 'Beginner',
    diffIntermediate: 'Intermediate',
    diffAdvanced: 'Advanced',
    searchPlaceholder: 'Search algorithms…',
  },

  // Visualization area
  viz: {
    title: 'Visualization',
    selectAlgo: 'Select an algorithm',
    time: 'Time',
    space: 'Space',
    stable: 'Stable',
    inPlace: 'In-place',
    yes: 'Y',
    no: 'N',
    compareMode: '▸ Compare Mode',
    focusMode: 'Focus Mode',
    fullscreen: 'Fullscreen',
    learn: 'Learn',
    clickHint: '— Click a bar to select',
    selectedHint: 'Selected [{i}], pick another',
    mainProgress: 'Main: {a}/{b} · Compare: {c}/{d}',
    trendTitle: 'Complexity Trend',
    compares: 'Compares',
    swaps: 'Swaps',
    challengeSwapCount: '{n} swaps',
  },

  // Legend
  legend: {
    // Graph algorithms
    empty: 'Empty',
    wall: 'Wall',
    visited: 'Visited',
    frontier: 'Frontier',
    path: 'Shortest Path',
    // Sorting algorithms
    unsorted: 'Unsorted',
    comparing: 'Comparing',
    swapping: 'Swapping',
    sorted: 'Sorted',
  },

  // Code panel
  code: {
    title: 'Code',
    line: 'line',
    selectAlgo: 'Select an algorithm to view code',
    currentStep: 'Current Step',
    ready: '▸ Ready',
  },

  // Stats panel
  stats: {
    comparisons: 'Comparisons',
    swaps: 'Swaps',
    currentStep: 'Current Step',
    totalSteps: 'Total Steps',
    visits: 'Visits',
    pathLength: 'Path Length',
  },

  // Tutorial
  tutorial: {
    skip: 'Skip',
    next: 'Next',
    start: 'Get Started',
    step1Title: 'Welcome to ALGO::VIZ',
    step1Desc: 'A terminal-style algorithm visualization tool. Watch animations to intuitively understand how algorithms work.',
    step2Title: 'Left Panel — Select Algorithm',
    step2Desc: 'Browse 36 algorithms organized by category. Click any algorithm to view its visualization. Supports search and difficulty filtering.',
    step3Title: 'Bottom Controls — Playback',
    step3Desc: 'Use ▶ to play, ⏮ ⏭ to step forward/back. Click the progress bar to jump, and add bookmarks to mark key steps.',
    step4Title: 'Keyboard Shortcuts',
    step4Desc: 'Space play/pause · ← → step · F focus mode · ? view all shortcuts',
    step5Title: 'Learn More',
    step5Desc: 'Click the ▸ Learn button in the header to view detailed explanations, complexity analysis, and pseudocode.',
  },

  // Learn page
  learn: {
    notFound: 'Algorithm Not Found',
    notFoundDesc: 'The requested algorithm explanation page does not exist',
    backHome: 'Back to Home',
    home: 'Home',
    viz: 'Visualize',
    sections: {
      overview: 'Overview',
      coreIdea: 'Core Idea',
      keySteps: 'Key Steps',
      complexity: 'Complexity Analysis',
      useCases: 'Use Cases',
      pitfalls: 'Common Pitfalls',
      variants: 'Variants & Improvements',
      pseudoCode: 'Pseudocode',
    },
    viewViz: '▸ View Visualization',
  },

  // Manual mode hints
  hint: {
    noSelection: 'No selection needed for this step',
    allDone: 'All steps completed!',
    correct: '[Y] Correct!',
    wrong: '[N] Expected indices [{i}], try again',
  },

  // Controls
  controls: {
    prev: 'Previous',
    next: 'Next',
    play: 'Play',
    pause: 'Pause',
    speed: 'Speed',
    dataSize: 'Size',
    randomData: 'Random',
    customData: 'Custom: {data} (Enter to apply)',
    reset: 'Reset',
    bookmarkAdd: 'Add Bookmark',
    bookmarkRemove: 'Remove Bookmark',
    bookmarkPlaceholder: 'Click to add note…',
    export: 'Export',
    compareMode: 'Compare',
    manualMode: 'Manual Sort',
    challengeMode: 'Challenge',
    challengeExit: 'Exit',
    swaps: '{n} swaps',
    screenshot: 'Screenshot',
    share: 'Share Link',
    copied: '[Copied]',
    achievements: 'Achievements',
    shortcuts: 'Shortcuts',
    shortcutPanel: 'Keyboard Shortcuts',
    shortcutPlay: 'Play / Pause',
    shortcutPrev: 'Previous Step',
    shortcutNext: 'Next Step',
    shortcutFocus: 'Focus Mode (full-screen canvas)',
    shortcutPanelToggle: 'Toggle this panel',
    challengeResultTime: 'You: {t} · {n} swaps',
    challengeResultAlgo: 'Algorithm: {s} swaps · {c} comparisons',
  },

  // Algorithm names (for display)
  algorithms: {
    'bubble-sort': 'Bubble Sort',
    'selection-sort': 'Selection Sort',
    'insertion-sort': 'Insertion Sort',
    'quick-sort': 'Quick Sort',
    'merge-sort': 'Merge Sort',
    'heap-sort': 'Heap Sort',
    'shell-sort': 'Shell Sort',
    'radix-sort': 'Radix Sort',
    'counting-sort': 'Counting Sort',
    'bucket-sort': 'Bucket Sort',
    'linear-search': 'Linear Search',
    'binary-search': 'Binary Search',
    'jump-search': 'Jump Search',
    'interpolation-search': 'Interpolation Search',
    'exponential-search': 'Exponential Search',
    'binary-search-tree': 'Binary Search Tree',
    'heap': 'Heap',
    'linked-list': 'Linked List',
    'hash-table': 'Hash Table',
    'avl-tree': 'AVL Tree',
    'red-black-tree': 'Red-Black Tree',
    'bfs': 'Breadth-First Search',
    'dfs': 'Depth-First Search',
    'dijkstra': 'Dijkstra\'s Shortest Path',
    'astar': 'A* Algorithm',
    'bellman-ford': 'Bellman-Ford',
    'prim': 'Prim MST',
    'kruskal': 'Kruskal MST',
    'floyd-warshall': 'Floyd-Warshall',
    'kmp': 'KMP String Matching',
    'rabin-karp': 'Rabin-Karp',
    'boyer-moore': 'Boyer-Moore',
    'lcs': 'Longest Common Subsequence',
    'knapsack': '0-1 Knapsack',
    'edit-distance': 'Edit Distance',
    'matrix-chain': 'Matrix Chain',
  },

  // Step message templates
  steps: {
    compare: 'Compare a[{i}]={a} with a[{j}]={b}',
    swap: 'Swap a[{i}] ↔ a[{j}]',
    set: 'Set a[{i}] = {value}',
    markSorted: 'Mark a[{i}] as sorted',
    visit: 'Visit node {node}',
    current: 'Current node {node}',
    found: 'Target found!',
    notFound: 'Target not found',
    done: 'Sorting complete!',
  },
} as const;
