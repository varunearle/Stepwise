import type { TopicId } from './topics';

export interface Question {
  id: string;
  topic: TopicId;
  title: string;
  prompt: string;
  code?: string;
  options: string[];
  answer: number; // index into options
  explanation: string;
}

export const QUESTIONS: Question[] = [
  // ---------------------------------------------------------------- Arrays & Strings
  {
    id: 'AR-01', topic: 'arrays', title: 'Index of the last element',
    prompt: 'An array holds n elements and uses 0-based indexing. What is the index of its last element?',
    options: ['n', 'n − 1', 'n + 1', '1'],
    answer: 1,
    explanation: 'Indices run from 0 to n − 1, so the last of the n elements sits at n − 1.',
  },
  {
    id: 'AR-02', topic: 'arrays', title: 'Summing alternate positions',
    prompt: 'What does this C++ fragment print?',
    code: `int a[5] = {3, 1, 4, 1, 5};
int s = 0;
for (int i = 1; i < 5; i += 2)
    s += a[i];
cout << s;`,
    options: ['9', '5', '2', '4'],
    answer: 2,
    explanation: 'The loop visits i = 1 and i = 3 only. a[1] + a[3] = 1 + 1 = 2.',
  },
  {
    id: 'AR-03', topic: 'arrays', title: 'Access by index',
    prompt: 'What is the time complexity of reading a[i] from an array, given the index i?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    answer: 0,
    explanation: 'The address of a[i] is base + i × (element size), computed directly. No search is needed.',
  },
  {
    id: 'AR-04', topic: 'arrays', title: 'Inserting at the front',
    prompt: 'An array stores n elements in order with free space at the end. What is the worst-case time to insert a new element at index 0 while keeping the existing order?',
    options: ['O(1)', 'O(log n)', 'O(n²)', 'O(n)'],
    answer: 3,
    explanation: 'All n existing elements must shift one position to the right to make room at index 0.',
  },
  {
    id: 'AR-05', topic: 'arrays', title: 'Palindrome check',
    prompt: 'What does this C++ fragment print?',
    code: `string s = "level";
bool ok = true;
for (int i = 0, j = s.size() - 1; i < j; i++, j--)
    if (s[i] != s[j])
        ok = false;
cout << ok;`,
    options: ['0', '1', 'level', 'true'],
    answer: 1,
    explanation: '"level" reads the same from both ends, so ok stays true. cout prints a bool as 1 unless std::boolalpha is set.',
  },
  {
    id: 'AR-06', topic: 'arrays', title: 'Row-major offset',
    prompt: 'The array int m[3][4] is stored in row-major order. How many elements after m[0][0] is m[1][2] stored?',
    options: ['5', '6', '7', '9'],
    answer: 1,
    explanation: 'Row-major offset = row × (number of columns) + column = 1 × 4 + 2 = 6.',
  },
  {
    id: 'AR-07', topic: 'arrays', title: 'In-place reversal',
    prompt: 'What does this C++ fragment print?',
    code: `int a[] = {1, 2, 3, 4, 5, 6};
int n = 6;
for (int i = 0; i < n / 2; i++)
    swap(a[i], a[n - 1 - i]);
cout << a[1] << a[4];`,
    options: ['25', '52', '24', '53'],
    answer: 1,
    explanation: 'The loop reverses the array to {6, 5, 4, 3, 2, 1}. a[1] is 5 and a[4] is 2, printed with no separator: 52.',
  },
  {
    id: 'AR-08', topic: 'arrays', title: 'Pair sum in a sorted array',
    prompt: 'The array is already sorted. Using two pointers (one at each end, moving inward), how long does it take in the worst case to decide whether two elements add up to a target?',
    options: ['O(log n)', 'O(n log n)', 'O(n)', 'O(n²)'],
    answer: 2,
    explanation: 'Each step moves one pointer inward, so the pointers meet after at most n − 1 steps.',
  },

  // ---------------------------------------------------------------- Linked Lists
  {
    id: 'LL-01', topic: 'lists', title: 'Reaching the k-th node',
    prompt: 'Given only the head pointer of a singly linked list with n nodes, what is the worst-case time to reach the k-th node?',
    options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    answer: 0,
    explanation: 'Nodes are not stored contiguously, so the list must be walked one node at a time from the head.',
  },
  {
    id: 'LL-02', topic: 'lists', title: 'Insert at the head',
    prompt: 'What is the time complexity of inserting a new node at the head of a singly linked list?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
    answer: 2,
    explanation: 'Point the new node at the current head and make it the new head: two pointer assignments, independent of n.',
  },
  {
    id: 'LL-03', topic: 'lists', title: 'Skipping nodes',
    prompt: 'The list is 1 → 2 → 3 → 4 → nullptr and head points to the node holding 1. What does this C++ fragment print?',
    code: `Node* p = head;
int sum = 0;
while (p != nullptr && p->next != nullptr) {
    sum += p->val;
    p = p->next->next;
}
cout << sum;`,
    options: ['10', '4', '6', '1'],
    answer: 1,
    explanation: 'First pass adds 1 and jumps to 3. Second pass adds 3 and jumps to nullptr (the node after 4). The sum is 1 + 3 = 4.',
  },
  {
    id: 'LL-04', topic: 'lists', title: 'Doubly linked node',
    prompt: 'What does a node in a doubly linked list store that a node in a singly linked list does not?',
    options: ['The length of the list', 'A pointer to the head', 'A pointer to the previous node', 'Its own index'],
    answer: 2,
    explanation: 'Each node keeps both a next pointer and a previous pointer, which allows traversal in both directions.',
  },
  {
    id: 'LL-05', topic: 'lists', title: 'Floyd’s cycle detection',
    prompt: 'A slow pointer moves one node per step and a fast pointer moves two nodes per step, both starting at the head. If the list contains a cycle, what happens?',
    options: ['The fast pointer reaches nullptr', 'The two pointers meet at a node inside the cycle', 'The slow pointer reaches nullptr', 'The two pointers never meet'],
    answer: 1,
    explanation: 'Inside the cycle the fast pointer gains one node per step on the slow one, so the gap closes and they meet. Neither can reach nullptr.',
  },
  {
    id: 'LL-06', topic: 'lists', title: 'Iterative reversal',
    prompt: 'The list is 1 → 2 → 3 → nullptr and head points to the node holding 1. What does this C++ fragment print?',
    code: `Node* prev = nullptr;
Node* cur = head;
while (cur != nullptr) {
    Node* nxt = cur->next;
    cur->next = prev;
    prev = cur;
    cur = nxt;
}
cout << prev->val << prev->next->val;`,
    options: ['12', '21', '32', '31'],
    answer: 2,
    explanation: 'The loop reverses the list to 3 → 2 → 1, and prev ends at the new head. It prints 3 then 2: 32.',
  },
  {
    id: 'LL-07', topic: 'lists', title: 'Deleting after a known node',
    prompt: 'In a singly linked list you hold a pointer to node p. What is the time to delete the node that comes right after p?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    answer: 3,
    explanation: 'Set p->next = p->next->next and free the removed node. No traversal is needed.',
  },
  {
    id: 'LL-08', topic: 'lists', title: 'Why use a linked list',
    prompt: 'Which of these is an advantage of a linked list over an array?',
    options: ['Inserting or deleting at a known position without shifting other elements', 'Access to any element by index in O(1)', 'Better cache locality', 'Less memory used per element'],
    answer: 0,
    explanation: 'Only pointers change on insert or delete. Arrays win on index access, cache locality and memory per element.',
  },

  // ---------------------------------------------------------------- Stacks & Queues
  {
    id: 'SQ-01', topic: 'stacks', title: 'Stack operations',
    prompt: 'What does this C++ fragment print?',
    code: `stack<int> st;
st.push(1); st.push(2); st.push(3);
st.pop();
st.push(4);
cout << st.top() << st.size();`,
    options: ['43', '33', '42', '13'],
    answer: 0,
    explanation: 'After pushing 1, 2, 3 and popping 3, the stack is 1, 2. Pushing 4 makes the top 4 and the size 3.',
  },
  {
    id: 'SQ-02', topic: 'stacks', title: 'Queue operations',
    prompt: 'What does this C++ fragment print?',
    code: `queue<int> q;
q.push(5); q.push(7); q.push(9);
q.pop();
q.push(2);
cout << q.front() << q.back();`,
    options: ['59', '92', '72', '52'],
    answer: 2,
    explanation: 'pop removes 5, the oldest element. The queue is then 7, 9, 2, so front is 7 and back is 2.',
  },
  {
    id: 'SQ-03', topic: 'stacks', title: 'Evaluating postfix',
    prompt: 'What is the value of the postfix expression 2 3 4 * + ?',
    options: ['20', '24', '9', '14'],
    answer: 3,
    explanation: 'Push 2, 3, 4. On * pop 4 and 3 and push 12. On + pop 12 and 2 and push 14.',
  },
  {
    id: 'SQ-04', topic: 'stacks', title: 'Function calls',
    prompt: 'Which data structure does a program use to keep track of active function calls, including recursive ones?',
    options: ['Queue', 'Stack', 'Priority queue', 'Hash table'],
    answer: 1,
    explanation: 'The call stack. The most recent call is the first to return: last in, first out.',
  },
  {
    id: 'SQ-05', topic: 'stacks', title: 'Breadth-first search',
    prompt: 'Which data structure holds the frontier in breadth-first search (BFS) of a graph?',
    options: ['Stack', 'Queue', 'Binary search tree', 'Hash table'],
    answer: 1,
    explanation: 'BFS visits vertices in the order they were discovered, which is first in, first out.',
  },
  {
    id: 'SQ-06', topic: 'stacks', title: 'Balanced brackets',
    prompt: 'Which of these strings has correctly balanced and nested brackets?',
    options: ['([)]', '(()', '{[()]}', '())('],
    answer: 2,
    explanation: 'In {[()]} every closing bracket matches the most recent unmatched opening bracket, which a stack checks directly.',
  },
  {
    id: 'SQ-07', topic: 'stacks', title: 'Circular queue capacity',
    prompt: 'A circular queue uses an array of size N. front is the index of the first element and rear is the index where the next element will be written. It is empty when front == rear and full when (rear + 1) % N == front. How many elements can it hold at most?',
    options: ['N', 'N − 1', 'N + 1', 'N / 2'],
    answer: 1,
    explanation: 'One slot is always left empty so that the full condition never coincides with the empty condition front == rear.',
  },
  {
    id: 'SQ-08', topic: 'stacks', title: 'Order of pops',
    prompt: 'Starting from an empty stack: push A, push B, pop, push C, pop, pop. In what order are the elements popped?',
    options: ['A B C', 'C B A', 'B A C', 'B C A'],
    answer: 3,
    explanation: 'The first pop removes B. Then C is pushed and popped. The last pop removes A.',
  },

  // ---------------------------------------------------------------- Trees
  {
    id: 'TR-01', topic: 'trees', title: 'Inorder traversal of a BST',
    prompt: 'What order does an inorder traversal visit the keys of a binary search tree in?',
    options: ['Ascending order', 'Descending order', 'Level by level', 'The order they were inserted'],
    answer: 0,
    explanation: 'Inorder visits the left subtree (smaller keys), then the node, then the right subtree (larger keys).',
  },
  {
    id: 'TR-02', topic: 'trees', title: 'Maximum nodes',
    prompt: 'Height is the number of edges on the longest path from the root to a leaf, so a single node has height 0. What is the maximum number of nodes in a binary tree of height h?',
    options: ['2ʰ', '2ʰ − 1', '2ʰ⁺¹ − 1', 'h²'],
    answer: 2,
    explanation: 'Level k can hold at most 2ᵏ nodes, for levels 0 to h. 1 + 2 + … + 2ʰ = 2ʰ⁺¹ − 1.',
  },
  {
    id: 'TR-03', topic: 'trees', title: 'Preorder after insertion',
    prompt: 'The keys 50, 30, 70, 20, 40 are inserted in that order into an empty binary search tree. What is its preorder traversal?',
    options: ['20 30 40 50 70', '50 30 20 40 70', '20 40 30 70 50', '50 30 70 20 40'],
    answer: 1,
    explanation: '50 is the root, 30 and 70 its children, and 20 and 40 the children of 30. Preorder is node, left, right: 50 30 20 40 70.',
  },
  {
    id: 'TR-04', topic: 'trees', title: 'Unbalanced BST search',
    prompt: 'What is the worst-case time to search for a key in a binary search tree with n nodes that is not kept balanced?',
    options: ['O(log n)', 'O(1)', 'O(n log n)', 'O(n)'],
    answer: 3,
    explanation: 'Inserting keys in sorted order produces a chain, so a search may have to visit every node.',
  },
  {
    id: 'TR-05', topic: 'trees', title: 'Reading a recursive function',
    prompt: 'What does f compute for a binary tree rooted at r?',
    code: `int f(Node* r) {
    if (r == nullptr) return 0;
    return 1 + max(f(r->left), f(r->right));
}`,
    options: ['The total number of nodes', 'The number of nodes on the longest root-to-leaf path', 'The number of leaves', 'The sum of all values'],
    answer: 1,
    explanation: 'Each call adds 1 for the current node to the deeper of its two subtrees. An empty tree gives 0.',
  },
  {
    id: 'TR-06', topic: 'trees', title: 'Edges in a tree',
    prompt: 'How many edges does a tree with n nodes have?',
    options: ['n', 'n + 1', 'n − 1', '2n'],
    answer: 2,
    explanation: 'Every node except the root has exactly one edge to its parent.',
  },
  {
    id: 'TR-07', topic: 'trees', title: 'Heap stored in an array',
    prompt: 'A binary heap is stored in an array with the root at index 0. What are the indices of the children of the node at index i?',
    options: ['2i and 2i + 1', '2i + 1 and 2i + 2', 'i + 1 and i + 2', '2i − 1 and 2i'],
    answer: 1,
    explanation: 'With 0-based indexing the left child is at 2i + 1 and the right child at 2i + 2. The 2i and 2i + 1 rule is for 1-based arrays.',
  },
  {
    id: 'TR-08', topic: 'trees', title: 'Smallest key in a BST',
    prompt: 'Where is the smallest key in a non-empty binary search tree?',
    options: ['At the root', 'At the rightmost node', 'At any leaf', 'At the leftmost node, reached by following left pointers from the root'],
    answer: 3,
    explanation: 'Every left step leads to a smaller key, so the node with no left child at the end of that path holds the minimum.',
  },

  // ---------------------------------------------------------------- Sorting
  {
    id: 'SO-01', topic: 'sorting', title: 'Stable sorting',
    prompt: 'In their standard array implementations, which of these sorting algorithms is stable?',
    options: ['Quick sort', 'Heap sort', 'Merge sort', 'Selection sort'],
    answer: 2,
    explanation: 'When two keys are equal, merge takes from the left half first, so equal elements keep their original order.',
  },
  {
    id: 'SO-02', topic: 'sorting', title: 'Quick sort worst case',
    prompt: 'What is the worst-case time complexity of quick sort?',
    options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
    answer: 1,
    explanation: 'If every pivot is the smallest or largest element, each partition removes only one element: n + (n − 1) + … = O(n²).',
  },
  {
    id: 'SO-03', topic: 'sorting', title: 'One bubble sort pass',
    prompt: 'Bubble sort (ascending) compares adjacent pairs from left to right and swaps them when out of order. What is the array after the first pass over [5, 1, 4, 2, 8]?',
    options: ['[1, 4, 2, 5, 8]', '[1, 2, 4, 5, 8]', '[1, 5, 4, 2, 8]', '[1, 4, 5, 2, 8]'],
    answer: 0,
    explanation: '5 is swapped past 1, 4 and 2, and then stops before 8. The largest element of the unsorted part ends up at the end.',
  },
  {
    id: 'SO-04', topic: 'sorting', title: 'Merge sort worst case',
    prompt: 'What is the worst-case time complexity of merge sort?',
    options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(log n)'],
    answer: 2,
    explanation: 'There are log n levels of halving and each level merges n elements in total, whatever the input.',
  },
  {
    id: 'SO-05', topic: 'sorting', title: 'Insertion sort best case',
    prompt: 'What is the time complexity of insertion sort when the input is already sorted?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
    answer: 0,
    explanation: 'Each new element is compared once with the element before it and stays in place, so there are n − 1 comparisons.',
  },
  {
    id: 'SO-06', topic: 'sorting', title: 'Two selection sort passes',
    prompt: 'Selection sort (ascending) swaps the minimum of the unsorted part into the next position on each pass. What is [64, 25, 12, 22, 11] after two passes?',
    options: ['[11, 25, 12, 22, 64]', '[11, 12, 22, 25, 64]', '[11, 12, 25, 22, 64]', '[12, 11, 25, 22, 64]'],
    answer: 2,
    explanation: 'Pass 1 swaps 11 with 64: [11, 25, 12, 22, 64]. Pass 2 swaps 12 with 25: [11, 12, 25, 22, 64].',
  },
  {
    id: 'SO-07', topic: 'sorting', title: 'Not a comparison sort',
    prompt: 'Which of these is not a comparison-based sorting algorithm?',
    options: ['Merge sort', 'Heap sort', 'Insertion sort', 'Counting sort'],
    answer: 3,
    explanation: 'Counting sort counts how many times each key value occurs and never compares two elements with each other.',
  },
  {
    id: 'SO-08', topic: 'sorting', title: 'Lower bound',
    prompt: 'What is the lower bound on the worst-case number of comparisons for any comparison-based sorting algorithm on n elements?',
    options: ['Ω(n)', 'Ω(n log n)', 'Ω(n²)', 'Ω(log n)'],
    answer: 1,
    explanation: 'A comparison sort must distinguish all n! orderings, so its decision tree has height at least log₂(n!), which is Ω(n log n).',
  },

  // ---------------------------------------------------------------- Time Complexity
  {
    id: 'TC-01', topic: 'complexity', title: 'Nested loops',
    prompt: 'What is the time complexity of this fragment?',
    code: `for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        count++;`,
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
    answer: 2,
    explanation: 'The inner body runs n times for each of the n outer iterations: n × n.',
  },
  {
    id: 'TC-02', topic: 'complexity', title: 'Doubling loop',
    prompt: 'What is the time complexity of this fragment?',
    code: `for (int i = 1; i < n; i *= 2)
    count++;`,
    options: ['O(log n)', 'O(n)', 'O(√n)', 'O(n log n)'],
    answer: 0,
    explanation: 'i takes the values 1, 2, 4, 8, … and stops at n, so the loop runs about log₂ n times.',
  },
  {
    id: 'TC-03', topic: 'complexity', title: 'Binary search',
    prompt: 'What is the worst-case time complexity of binary search on a sorted array of n elements?',
    options: ['O(n)', 'O(1)', 'O(n log n)', 'O(log n)'],
    answer: 3,
    explanation: 'Each comparison halves the remaining range, so at most about log₂ n + 1 comparisons are needed.',
  },
  {
    id: 'TC-04', topic: 'complexity', title: 'Counting iterations',
    prompt: 'count starts at 0 and n = 4. What is count after this fragment runs?',
    code: `for (int i = 0; i < n; i++)
    for (int j = i; j < n; j++)
        count++;`,
    options: ['16', '6', '10', '8'],
    answer: 2,
    explanation: 'The inner loop runs 4, 3, 2 and 1 times: 4 + 3 + 2 + 1 = 10. In general n(n + 1) / 2.',
  },
  {
    id: 'TC-05', topic: 'complexity', title: 'Fastest growth',
    prompt: 'Which function grows fastest as n becomes large?',
    options: ['n³', '2ⁿ', 'n² log n', 'n log n'],
    answer: 1,
    explanation: 'An exponential eventually exceeds every polynomial. For example 2ⁿ passes n³ from n = 10 onwards.',
  },
  {
    id: 'TC-06', topic: 'complexity', title: 'vector::push_back',
    prompt: 'std::vector grows its capacity geometrically when it is full. What is the amortised time per push_back over a long sequence of calls?',
    options: ['O(n) per call', 'O(log n)', 'O(1)', 'O(n²)'],
    answer: 2,
    explanation: 'A resize copies all elements but happens only after geometrically many cheap pushes, so the total cost of n pushes is O(n).',
  },
  {
    id: 'TC-07', topic: 'complexity', title: 'Divide and conquer recurrence',
    prompt: 'What does the recurrence T(n) = 2T(n/2) + n, with T(1) = 1, solve to?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    answer: 1,
    explanation: 'There are log₂ n levels and each level does n work in total. This is the merge sort recurrence (Master theorem case 2).',
  },
  {
    id: 'TC-08', topic: 'complexity', title: 'Constant inner loop',
    prompt: 'What is the time complexity of this fragment?',
    code: `for (int i = 0; i < n; i++)
    for (int j = 0; j < 100; j++)
        count++;`,
    options: ['O(n²)', 'O(1)', 'O(n)', 'O(100ⁿ)'],
    answer: 2,
    explanation: 'The inner loop always runs 100 times, a constant. 100n is O(n).',
  },
];
