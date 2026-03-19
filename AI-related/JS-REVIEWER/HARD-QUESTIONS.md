# 🔴 Hard Questions — JavaScript Coding Challenges
> These separate the good from the elite.
> Passing even 50% of these makes you Toptal-ready.

---

## Instructions
- Give yourself **45-60 minutes** per problem
- Drawing out the problem on paper before coding helps a lot
- Hard problems require you to **combine multiple patterns**
- Don't feel bad checking hints — learn the pattern, then solve it clean

---

## 📋 Problem List

### 1. Trapping Rain Water
- [ ] Solved | [ ] Reviewed Answer

Given an array of heights, compute how much water it can trap between the bars after raining.

```
Input:  [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6

Input:  [4,2,0,3,2,5]
Output: 9
```

```
Visual for [0,1,0,2,1,0,1,3,2,1,2,1]:
         |
   |     |     |  |
   |  |  |  |  |  |
___|__|__|__|__|__|__|___
Water trapped = 6 units
```

💡 **Hint:** At each position, water level = min(maxLeft, maxRight) - height[i]. Two pointers can do this O(1) space.

---

### 2. Median of Two Sorted Arrays
- [ ] Solved | [ ] Reviewed Answer

Given two sorted arrays, find the median of the combined array in **O(log(m+n))** time.

```
Input:  nums1 = [1, 3], nums2 = [2]
Output: 2.0
Explanation: merged = [1,2,3], median = 2.0

Input:  nums1 = [1, 2], nums2 = [3, 4]
Output: 2.5
Explanation: merged = [1,2,3,4], median = (2+3)/2 = 2.5
```

💡 **Hint:** Binary search on the smaller array. Partition both arrays so left halves have all the smaller elements.

---

### 3. Word Ladder
- [ ] Solved | [ ] Reviewed Answer

Given a `beginWord`, `endWord`, and a `wordList`, find the **shortest transformation sequence** from begin to end. Each step changes exactly one letter and each intermediate word must be in `wordList`. Return 0 if no path.

```
Input:  beginWord = "hit", endWord = "cog"
        wordList = ["hot","dot","dog","lot","log","cog"]
Output: 5
Explanation: "hit" → "hot" → "dot" → "dog" → "cog"

Input:  beginWord = "hit", endWord = "cog"
        wordList = ["hot","dot","dog","lot","log"]
Output: 0 (cog not in wordList)
```

💡 **Hint:** BFS — treat each word as a graph node. Neighbors = words that differ by 1 letter.

---

### 4. Serialize and Deserialize a Binary Tree
- [ ] Solved | [ ] Reviewed Answer

Design an algorithm to serialize a binary tree to a string and deserialize back to the tree structure.

```
Input tree:
    1
   / \
  2   3
      / \
     4   5

Serialized: "1,2,null,null,3,4,null,null,5,null,null"
Deserialized: original tree structure
```

Your functions:
```js
function serialize(root) { ... }   // Tree → String
function deserialize(data) { ... } // String → Tree
```

💡 **Hint:** Use preorder DFS. Mark null nodes explicitly. Use a queue/index for deserialization.

---

### 5. LRU Cache
- [ ] Solved | [ ] Reviewed Answer

Design a data structure for a **Least Recently Used (LRU) Cache** that supports:
- `get(key)` — return the value if it exists, else -1
- `put(key, value)` — insert/update the value. If cache is at capacity, evict the least recently used item.

Both operations must be **O(1)**.

```
LRUCache cache = new LRUCache(2); // capacity = 2
cache.put(1, 1);
cache.put(2, 2);
cache.get(1);    // returns 1
cache.put(3, 3); // evicts key 2
cache.get(2);    // returns -1 (evicted)
cache.put(4, 4); // evicts key 1
cache.get(1);    // returns -1 (evicted)
cache.get(3);    // returns 3
cache.get(4);    // returns 4
```

💡 **Hint:** Use a HashMap + Doubly Linked List. Map gives O(1) access, DLL gives O(1) insertion/removal.

---

### 6. Merge K Sorted Lists
- [ ] Solved | [ ] Reviewed Answer

Given `k` sorted linked lists, merge them all into one sorted linked list.

```
Input:  [1→4→5, 1→3→4, 2→6]
Output: 1→1→2→3→4→4→5→6
```

💡 **Hint:** Divide and conquer — merge lists pairwise like merge sort. Or use a min-heap (Priority Queue).

---

### 7. Longest Valid Parentheses
- [ ] Solved | [ ] Reviewed Answer

Given a string of `(` and `)`, find the length of the longest valid parentheses substring.

```
Input:  "(()"
Output: 2
Explanation: "()" is valid

Input:  ")()())"
Output: 4
Explanation: "()()" is valid

Input:  ""
Output: 0
```

💡 **Hint:** Stack-based approach — push indices. When closing bracket found, pop and check length.

---

### 8. Find Minimum in Rotated Sorted Array
- [ ] Solved | [ ] Reviewed Answer

Given a rotated sorted array with **unique** elements, find the minimum element. Must be O(log n).

```
Input:  [3,4,5,1,2]
Output: 1

Input:  [4,5,6,7,0,1,2]
Output: 0

Input:  [11,13,15,17]
Output: 11 (no rotation)
```

💡 **Hint:** Modified binary search. Compare mid to right — if mid > right, minimum is in right half.

---

### 9. Sliding Window Maximum
- [ ] Solved | [ ] Reviewed Answer

Given an array and a window size `k`, return the maximum value in each sliding window.

```
Input:  nums = [1,3,-1,-3,5,3,6,7], k = 3
Output: [3,3,5,5,6,7]

Explanation:
Window [1,3,-1]  → 3
Window [3,-1,-3] → 3
Window [-1,-3,5] → 5
Window [-3,5,3]  → 5
Window [5,3,6]   → 6
Window [3,6,7]   → 7
```

💡 **Hint:** Use a Deque (monotonic decreasing queue) to track max in O(n) time.

---

### 10. Course Schedule II (Topological Sort)
- [ ] Solved | [ ] Reviewed Answer

There are `n` courses. Given prerequisites pairs `[a, b]` meaning "take b before a", return the order to finish all courses. Return empty array if impossible (cycle).

```
Input:  numCourses = 4,
        prerequisites = [[1,0],[2,0],[3,1],[3,2]]
Output: [0,2,1,3] or [0,1,2,3]

Input:  numCourses = 2,
        prerequisites = [[1,0],[0,1]]
Output: [] (cycle — impossible)
```

💡 **Hint:** Build adjacency list + in-degree count. BFS (Kahn's algorithm) starting from nodes with in-degree 0.

---

## 📊 Progress Tracker

| # | Problem | Solved | Reviewed |
|---|---|---|---|
| 1 | Trapping Rain Water | ☐ | ☐ |
| 2 | Median of Two Sorted Arrays | ☐ | ☐ |
| 3 | Word Ladder | ☐ | ☐ |
| 4 | Serialize/Deserialize Binary Tree | ☐ | ☐ |
| 5 | LRU Cache | ☐ | ☐ |
| 6 | Merge K Sorted Lists | ☐ | ☐ |
| 7 | Longest Valid Parentheses | ☐ | ☐ |
| 8 | Find Min in Rotated Array | ☐ | ☐ |
| 9 | Sliding Window Maximum | ☐ | ☐ |
| 10 | Course Schedule II | ☐ | ☐ |

---

## 🧠 Hard Problem Tips

- **Draw it out first** — visualize before coding
- **Think out loud** — in real interviews, narrate your thinking
- **Start with brute force** — then optimize
- **Know your patterns** — most hard problems combine 2-3 patterns
- **Don't panic** — even senior devs struggle with hard problems cold

---

> 📖 Stuck? Check **HARD-ANSWERS.md**
> 🏆 If you can solve 6/10 of these — you're Toptal ready!
