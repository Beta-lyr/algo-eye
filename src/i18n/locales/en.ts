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
  },

  // Algorithm categories (detailed)
  category: {
    sorting: 'Sorting',
    searching: 'Searching',
    graph: 'Graph',
    'data-structure': 'Data Structure',
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
      searching: 'Linear Search · Binary Search',
      graph: 'BFS · DFS · Dijkstra',
      'data-structure': 'Binary Search Tree',
    },
  },

  // Left panel
  tree: {
    title: 'Algorithms',
    hint: '/tree',
  },

  // Visualization area
  viz: {
    title: 'Visualization',
    selectAlgo: 'Select an algorithm',
    time: 'Time',
    space: 'Space',
    stable: 'Stable',
    inPlace: 'In-place',
    yes: '✓',
    no: '✗',
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
    'binary-search-tree': 'Binary Search Tree',
    'bfs': 'Breadth-First Search',
    'dfs': 'Depth-First Search',
    'dijkstra': 'Dijkstra\'s Shortest Path',
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
