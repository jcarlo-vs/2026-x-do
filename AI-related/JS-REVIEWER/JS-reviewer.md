# 📘 JS-reviewer — JavaScript Coding Interview Reviewer
> Prepared for Toptal, Arc.dev, and other vetted platform screenings
> Stack: JavaScript (ES6+)

---

## 📌 Table of Contents
1. [Big O Notation (Time & Space Complexity)](#big-o)
2. [Arrays](#arrays)
3. [Strings](#strings)
4. [HashMaps / Objects / Sets](#hashmaps)
5. [Stacks & Queues](#stacks-queues)
6. [Recursion](#recursion)
7. [Sorting](#sorting)
8. [Linked Lists](#linked-lists)
9. [Trees & Graphs (Basics)](#trees-graphs)
10. [Dynamic Programming (Intro)](#dynamic-programming)
11. [Common JS Gotchas](#js-gotchas)
12. [Practice Problem Checklist](#checklist)

---

## 1. 📊 Big O Notation (Time & Space Complexity) <a name="big-o"></a>

Understanding Big O tells the interviewer you think about performance — not just "does it work."

| Notation | Name | Example |
|---|---|---|
| O(1) | Constant | Accessing array index |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Looping through array |
| O(n log n) | Linearithmic | Merge sort |
| O(n²) | Quadratic | Nested loops |
| O(2ⁿ) | Exponential | Recursive Fibonacci (naive) |

### Rules of Thumb
- Drop constants: O(2n) → O(n)
- Drop non-dominant terms: O(n² + n) → O(n²)
- Nested loops = multiply: O(n) inside O(n) = O(n²)

```js
// O(1) — constant
function getFirst(arr) {
  return arr[0];
}

// O(n) — linear
function printAll(arr) {
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
  }
}

// O(n²) — quadratic (nested loop)
function printPairs(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      console.log(arr[i], arr[j]);
    }
  }
}
```

---

## 2. 📦 Arrays <a name="arrays"></a>

### Must-Know Array Methods
```js
const arr = [3, 1, 4, 1, 5, 9, 2, 6];

arr.push(7);          // add to end
arr.pop();            // remove from end
arr.shift();          // remove from start
arr.unshift(0);       // add to start
arr.slice(1, 3);      // [1, 4] — non-destructive
arr.splice(1, 2);     // removes 2 items from index 1 — destructive
arr.indexOf(5);       // returns index of 5
arr.includes(5);      // true/false
arr.reverse();        // reverses in place
arr.join('-');        // "3-1-4..."

// Functional
arr.map(x => x * 2);          // new array, transformed
arr.filter(x => x > 3);       // new array, filtered
arr.reduce((acc, x) => acc + x, 0); // single value
arr.find(x => x > 4);         // first match
arr.findIndex(x => x > 4);    // index of first match
arr.some(x => x > 8);         // true if any match
arr.every(x => x > 0);        // true if all match
arr.flat();                    // flatten nested arrays
arr.flatMap(x => [x, x * 2]); // map then flatten
```

### ⚠️ Sort Gotcha — Always Pass Comparator!
```js
// WRONG — sorts alphabetically by default
[10, 2, 21].sort(); // [10, 2, 21] ❌

// CORRECT
[10, 2, 21].sort((a, b) => a - b); // [2, 10, 21] ✅
[10, 2, 21].sort((a, b) => b - a); // [21, 10, 2] descending ✅
```

### Common Pattern: Two Pointers
```js
// Check if array is palindrome
function isPalindrome(arr) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    if (arr[left] !== arr[right]) return false;
    left++;
    right--;
  }
  return true;
}
```

### Common Pattern: Sliding Window
```js
// Max sum of subarray of size k
function maxSubarraySum(arr, k) {
  let maxSum = 0, windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
```

---

## 3. 🔤 Strings <a name="strings"></a>

### Must-Know String Methods
```js
const str = "Hello World";

str.length;                   // 11
str.toUpperCase();            // "HELLO WORLD"
str.toLowerCase();            // "hello world"
str.trim();                   // removes whitespace
str.split(' ');               // ["Hello", "World"]
str.includes('World');        // true
str.startsWith('Hello');      // true
str.endsWith('World');        // true
str.indexOf('o');             // 4
str.replace('World', 'PH');   // "Hello PH"
str.replaceAll('l', 'r');     // "Herro Worrd"
str.slice(0, 5);              // "Hello"
str.charAt(0);                // "H"
str.charCodeAt(0);            // 72 (ASCII)
String.fromCharCode(72);      // "H"
str.repeat(2);                // "Hello WorldHello World"
str.padStart(15, '*');        // "****Hello World"
```

### String ↔ Array Trick
```js
// Reverse a string
const reversed = str.split('').reverse().join('');

// Check anagram
function isAnagram(s, t) {
  return s.split('').sort().join('') === t.split('').sort().join('');
}
```

### Common Pattern: Character Frequency
```js
function charFrequency(str) {
  const freq = {};
  for (let char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  return freq;
}
```

---

## 4. 🗂️ HashMaps / Objects / Sets <a name="hashmaps"></a>

**Why it matters:** HashMap lookups are O(1) — use them to optimize nested loops from O(n²) to O(n).

### Object as HashMap
```js
const map = {};
map['key'] = 'value';
map['key'];             // 'value'
delete map['key'];
'key' in map;           // false
Object.keys(map);       // []
Object.values(map);     // []
Object.entries(map);    // []
```

### ES6 Map (better for interview use)
```js
const map = new Map();
map.set('a', 1);
map.get('a');       // 1
map.has('a');       // true
map.delete('a');
map.size;           // 0
for (let [key, val] of map) { console.log(key, val); }
```

### Set — Unique Values
```js
const set = new Set([1, 2, 2, 3, 3]);
// Set {1, 2, 3}
set.add(4);
set.has(2);       // true
set.delete(2);
set.size;         // 3

// Remove duplicates from array
const unique = [...new Set([1, 2, 2, 3])]; // [1, 2, 3]
```

### Classic Problem: Two Sum
```js
// Brute force O(n²) — BAD
// HashMap approach O(n) — GOOD
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}
```

---

## 5. 📚 Stacks & Queues <a name="stacks-queues"></a>

### Stack (LIFO — Last In First Out)
```js
// Use array as stack
const stack = [];
stack.push(1);    // [1]
stack.push(2);    // [1, 2]
stack.pop();      // returns 2, stack = [1]
stack[stack.length - 1]; // peek at top = 1
```

### Queue (FIFO — First In First Out)
```js
const queue = [];
queue.push(1);    // enqueue
queue.push(2);
queue.shift();    // dequeue — returns 1
```

### Classic Problem: Valid Parentheses
```js
function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if ('({['.includes(char)) {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}
```

---

## 6. 🔁 Recursion <a name="recursion"></a>

Every recursive function needs:
1. **Base case** — when to stop
2. **Recursive case** — call itself with smaller input

```js
// Factorial
function factorial(n) {
  if (n <= 1) return 1;           // base case
  return n * factorial(n - 1);    // recursive case
}

// Fibonacci (naive O(2ⁿ))
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// Fibonacci with Memoization O(n)
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}
```

---

## 7. 🔀 Sorting <a name="sorting"></a>

### Built-in Sort (know when to use)
```js
// Numbers
[3,1,2].sort((a, b) => a - b);   // ascending [1,2,3]
[3,1,2].sort((a, b) => b - a);   // descending [3,2,1]

// Strings
['banana','apple','cherry'].sort(); // alphabetical

// Objects by property
const people = [{name:'Bob',age:30},{name:'Ana',age:25}];
people.sort((a, b) => a.age - b.age); // by age ascending
```

### Binary Search — O(log n)
```js
// Only works on SORTED arrays
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1; // not found
}
```

---

## 8. 🔗 Linked Lists <a name="linked-lists"></a>

```js
// Node structure
class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

// Reverse Linked List
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    let next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}

// Detect cycle (Floyd's algorithm)
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
```

---

## 9. 🌳 Trees & Graphs (Basics) <a name="trees-graphs"></a>

### Binary Tree Node
```js
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}
```

### Tree Traversals
```js
// Depth First Search (DFS) — Inorder
function inorder(root, result = []) {
  if (!root) return result;
  inorder(root.left, result);
  result.push(root.val);
  inorder(root.right, result);
  return result;
}

// Breadth First Search (BFS) — Level by Level
function bfs(root) {
  if (!root) return [];
  const queue = [root], result = [];
  while (queue.length) {
    const node = queue.shift();
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}

// Max Depth of Tree
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

---

## 10. 🧮 Dynamic Programming (Intro) <a name="dynamic-programming"></a>

DP = Recursion + Memoization (top-down) or Tabulation (bottom-up)

### Classic: Climbing Stairs
```js
// You can climb 1 or 2 steps. How many ways to reach step n?
function climbStairs(n) {
  if (n <= 2) return n;
  const dp = [0, 1, 2];
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}
```

### Classic: Maximum Subarray (Kadane's Algorithm)
```js
function maxSubArray(nums) {
  let maxSum = nums[0], currentSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}
```

---

## 11. ⚠️ Common JS Gotchas <a name="js-gotchas"></a>

```js
// 1. == vs ===
0 == false   // true ❌
0 === false  // false ✅ always use ===

// 2. typeof null
typeof null  // "object" (JS bug, know this)

// 3. NaN comparison
NaN === NaN  // false ❌
isNaN(NaN)   // true ✅

// 4. Floating point
0.1 + 0.2 === 0.3  // false ❌ (0.30000000000000004)

// 5. Array sort default
[10, 2, 1].sort()  // [1, 10, 2] ❌ — always pass comparator!

// 6. let vs var in loops
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // prints 3 3 3 ❌
}
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // prints 0 1 2 ✅
}

// 7. Object reference vs value
const a = { x: 1 };
const b = a;
b.x = 2;
console.log(a.x); // 2 — same reference!

// 8. Spread for shallow copy
const copy = { ...a }; // new object ✅

// 9. Falsy values
// false, 0, "", null, undefined, NaN are all falsy

// 10. Optional chaining
const user = null;
user?.name;       // undefined (no error) ✅
user.name;        // TypeError ❌
```

---

## 12. ✅ Practice Problem Checklist <a name="checklist"></a>

### 🟢 Easy (Start Here)
- [ ] Two Sum — HashMap
- [ ] Valid Parentheses — Stack
- [ ] Reverse String
- [ ] FizzBuzz
- [ ] Find Maximum in Array
- [ ] Remove Duplicates from Sorted Array
- [ ] Palindrome Check
- [ ] Fibonacci (iterative + recursive)
- [ ] Count vowels in a string
- [ ] Binary Search

### 🟡 Medium (Target This Level for Toptal)
- [ ] Maximum Subarray (Kadane's)
- [ ] 3Sum
- [ ] Longest Substring Without Repeating Characters
- [ ] Product of Array Except Self
- [ ] Merge Intervals
- [ ] Valid Anagram
- [ ] Group Anagrams
- [ ] Climbing Stairs
- [ ] Coin Change
- [ ] Number of Islands (BFS/DFS)
- [ ] Binary Tree Level Order Traversal
- [ ] Reverse Linked List
- [ ] Detect Cycle in Linked List

### 🔴 Hard (Bonus — Impress Them)
- [ ] Trapping Rain Water
- [ ] Median of Two Sorted Arrays
- [ ] Word Ladder
- [ ] Serialize/Deserialize Binary Tree

---

## 🗓️ Daily Practice Plan

| Week | Focus | Goal |
|---|---|---|
| Week 1 | Arrays + Strings + HashMaps | 15 Easy problems |
| Week 2 | Stacks + Recursion + Sorting | 10 Easy + 5 Medium |
| Week 3 | Linked Lists + Trees + BFS/DFS | 10 Medium problems |
| Week 4 | DP + Mixed + Mock interviews | 10 Medium + simulate test |

> 💡 **Rule:** Do minimum 2-3 problems per day. Consistency beats cramming.

---

## 🔗 Resources

- [LeetCode](https://leetcode.com) — Primary practice platform
- [NeetCode.io](https://neetcode.io) — Best roadmap + JS video solutions
- [Codewars](https://codewars.com) — Fun JS kata problems
- [HackerRank](https://hackerrank.com) — Toptal-style environment
- [JavaScript.info](https://javascript.info) — Deep JS concepts
- [Big-O Cheat Sheet](https://bigocheatsheet.com)

---

> **You already know JavaScript. Now you just need to learn how to think algorithmically.**
> Practice daily, be consistent, and Toptal won't know what hit them. 🚀🇵🇭
