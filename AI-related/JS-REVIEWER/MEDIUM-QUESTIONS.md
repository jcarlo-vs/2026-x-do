# 🟡 Medium Questions — JavaScript Coding Challenges
> These are the level you need to pass Toptal and most vetted platforms.
> Try each problem on your own before checking **MEDIUM-ANSWERS.md**

---

## Instructions
- Aim to solve each in **20-30 minutes max**
- If stuck after 15 mins — look at the hint, try again before checking answers
- Focus on **optimal time complexity**, not just "it works"

---

## 📋 Problem List

### 1. Maximum Subarray (Kadane's Algorithm)
- [ ] Solved | [ ] Reviewed Answer

Given an integer array, find the **contiguous subarray** with the largest sum and return that sum.

```
Input:  [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Output: 6
Explanation: [4, -1, 2, 1] has the largest sum = 6

Input:  [1]
Output: 1

Input:  [5, 4, -1, 7, 8]
Output: 23
```

💡 **Hint:** Think about what to do when your running sum becomes negative.

---

### 2. Longest Substring Without Repeating Characters
- [ ] Solved | [ ] Reviewed Answer

Given a string, find the length of the **longest substring without repeating characters**.

```
Input:  "abcabcbb"
Output: 3
Explanation: "abc" is the longest

Input:  "bbbbb"
Output: 1
Explanation: "b"

Input:  "pwwkew"
Output: 3
Explanation: "wke"
```

💡 **Hint:** Use a sliding window + Set to track current characters.

---

### 3. 3Sum
- [ ] Solved | [ ] Reviewed Answer

Given an array, return all **unique triplets** that sum to zero.

```
Input:  [-1, 0, 1, 2, -1, -4]
Output: [[-1, -1, 2], [-1, 0, 1]]

Input:  [0, 0, 0]
Output: [[0, 0, 0]]

Input:  [1, 2, -2, -1]
Output: []
```

💡 **Hint:** Sort first, then use two pointers for the inner loop.

---

### 4. Product of Array Except Self
- [ ] Solved | [ ] Reviewed Answer

Return an array where each element is the product of all other elements **without using division** and in O(n) time.

```
Input:  [1, 2, 3, 4]
Output: [24, 12, 8, 6]
Explanation:
  result[0] = 2*3*4 = 24
  result[1] = 1*3*4 = 12
  result[2] = 1*2*4 = 8
  result[3] = 1*2*3 = 6
```

💡 **Hint:** Think about prefix products and suffix products.

---

### 5. Merge Intervals
- [ ] Solved | [ ] Reviewed Answer

Given a collection of intervals, merge all overlapping intervals.

```
Input:  [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: [1,3] and [2,6] overlap → merged to [1,6]

Input:  [[1,4],[4,5]]
Output: [[1,5]]
```

💡 **Hint:** Sort by start time first, then compare end times.

---

### 6. Valid Anagram (with Unicode/frequency)
- [ ] Solved | [ ] Reviewed Answer

Given two strings `s` and `t`, return true if `t` is an anagram of `s`. Must work with any Unicode characters (not just a-z).

```
Input:  s = "anagram", t = "nagaram"  → Output: true
Input:  s = "rat", t = "car"          → Output: false
```

**Follow-up:** What if inputs contain Unicode characters?

💡 **Hint:** HashMap frequency count beats sorting for Unicode.

---

### 7. Group Anagrams
- [ ] Solved | [ ] Reviewed Answer

Given an array of strings, group the anagrams together.

```
Input:  ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]

Input:  [""]
Output: [[""]]
```

💡 **Hint:** What can you use as a key that all anagrams share?

---

### 8. Climbing Stairs
- [ ] Solved | [ ] Reviewed Answer

You can climb 1 or 2 steps at a time. In how many distinct ways can you climb to the top of n stairs?

```
Input:  n = 2
Output: 2
Explanation: 1+1, 2

Input:  n = 3
Output: 3
Explanation: 1+1+1, 1+2, 2+1

Input:  n = 5
Output: 8
```

💡 **Hint:** This is secretly just Fibonacci.

---

### 9. Coin Change
- [ ] Solved | [ ] Reviewed Answer

Given coins of different denominations and a total amount, find the **minimum number of coins** to make up that amount. Return -1 if impossible.

```
Input:  coins = [1, 5, 10, 25], amount = 36
Output: 3
Explanation: 25 + 10 + 1 = 36

Input:  coins = [1, 2, 5], amount = 11
Output: 3
Explanation: 5 + 5 + 1 = 11

Input:  coins = [2], amount = 3
Output: -1
```

💡 **Hint:** Dynamic programming — build up from smaller amounts.

---

### 10. Number of Islands
- [ ] Solved | [ ] Reviewed Answer

Given a 2D grid of `'1'` (land) and `'0'` (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.

```
Input:
  [["1","1","1","1","0"],
   ["1","1","0","1","0"],
   ["1","1","0","0","0"],
   ["0","0","0","0","0"]]
Output: 1

Input:
  [["1","1","0","0","0"],
   ["1","1","0","0","0"],
   ["0","0","1","0","0"],
   ["0","0","0","1","1"]]
Output: 3
```

💡 **Hint:** DFS — when you find a '1', explore all connected land and mark visited.

---

### 11. Binary Tree Level Order Traversal (BFS)
- [ ] Solved | [ ] Reviewed Answer

Given the root of a binary tree, return the node values in **level order** (left to right, level by level).

```
Input tree:
      3
     / \
    9  20
       / \
      15   7

Output: [[3], [9, 20], [15, 7]]
```

💡 **Hint:** Use a queue. Process all nodes at current level before moving to next.

---

### 12. Reverse Linked List
- [ ] Solved | [ ] Reviewed Answer

Reverse a singly linked list both **iteratively** and **recursively**.

```
Input:  1 → 2 → 3 → 4 → 5 → null
Output: 5 → 4 → 3 → 2 → 1 → null

Input:  1 → 2 → null
Output: 2 → 1 → null
```

💡 **Hint:** For iterative — track prev, curr, and next pointers.

---

### 13. Detect Cycle in Linked List
- [ ] Solved | [ ] Reviewed Answer

Given a linked list, determine if it has a cycle. A cycle exists if a node's `next` pointer points back to a previous node.

```
Input:  1 → 2 → 3 → 4 → 2 (cycle back to node 2)
Output: true

Input:  1 → 2 → 3 → null
Output: false
```

💡 **Hint:** Floyd's Cycle Detection — slow and fast pointers.

---

### 14. Find First and Last Position in Sorted Array
- [ ] Solved | [ ] Reviewed Answer

Given a sorted array and a target, find the starting and ending position. Return `[-1, -1]` if not found. Must be O(log n).

```
Input:  nums = [5,7,7,8,8,10], target = 8
Output: [3, 4]

Input:  nums = [5,7,7,8,8,10], target = 6
Output: [-1, -1]
```

💡 **Hint:** Two binary searches — one finds leftmost, one finds rightmost.

---

### 15. Container With Most Water
- [ ] Solved | [ ] Reviewed Answer

Given an array of heights, find two lines that together with the x-axis forms a container that holds the most water.

```
Input:  [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: Lines at index 1 (height 8) and 8 (height 7)
             Width = 7, min height = 7, area = 49
```

💡 **Hint:** Two pointers from both ends. Move the shorter side inward.

---

## 📊 Progress Tracker

| # | Problem | Solved | Reviewed |
|---|---|---|---|
| 1 | Maximum Subarray | ☐ | ☐ |
| 2 | Longest Substring No Repeat | ☐ | ☐ |
| 3 | 3Sum | ☐ | ☐ |
| 4 | Product Except Self | ☐ | ☐ |
| 5 | Merge Intervals | ☐ | ☐ |
| 6 | Valid Anagram (Unicode) | ☐ | ☐ |
| 7 | Group Anagrams | ☐ | ☐ |
| 8 | Climbing Stairs | ☐ | ☐ |
| 9 | Coin Change | ☐ | ☐ |
| 10 | Number of Islands | ☐ | ☐ |
| 11 | Binary Tree Level Order | ☐ | ☐ |
| 12 | Reverse Linked List | ☐ | ☐ |
| 13 | Detect Cycle in Linked List | ☐ | ☐ |
| 14 | First and Last Position | ☐ | ☐ |
| 15 | Container With Most Water | ☐ | ☐ |

---

> ✅ Done with Medium? Move on to **HARD-QUESTIONS.md**
> 📖 Stuck? Check **MEDIUM-ANSWERS.md**
