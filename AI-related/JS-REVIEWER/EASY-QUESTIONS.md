# 🟢 Easy Questions — JavaScript Coding Challenges
> No peeking at answers first! Try each problem on your own.
> Use: [LeetCode](https://leetcode.com) | [Codewars](https://codewars.com) | Your own editor

---

## Instructions
- Try to solve each problem **without looking at hints**
- Write your solution in JavaScript
- After solving, check **EASY-ANSWERS.md** for the optimal solution + explanation
- Track your progress with the checkboxes

---

## 📋 Problem List

### 1. Two Sum
- [ ] Solved | [ ] Reviewed Answer

Given an array of integers `nums` and an integer `target`, return the **indices** of the two numbers that add up to the target.

```
Input:  nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9
```

**Constraints:**
- Each input has exactly one solution
- You may not use the same element twice
- Try to solve in O(n) time

---

### 2. Reverse a String
- [ ] Solved | [ ] Reviewed Answer

Write a function that reverses a string. Do it without using `.reverse()` directly on the string.

```
Input:  "hello"
Output: "olleh"

Input:  "JavaScript"
Output: "tpircSavaJ"
```

---

### 3. Valid Parentheses
- [ ] Solved | [ ] Reviewed Answer

Given a string containing only `(`, `)`, `{`, `}`, `[`, `]`, determine if the input string is **valid**.

A string is valid if:
- Open brackets are closed by the same type
- Open brackets are closed in the correct order

```
Input:  "()"       → Output: true
Input:  "()[]{}"   → Output: true
Input:  "(]"       → Output: false
Input:  "([)]"     → Output: false
Input:  "{[]}"     → Output: true
```

---

### 4. FizzBuzz
- [ ] Solved | [ ] Reviewed Answer

Write a function that prints numbers from 1 to n:
- Print `"Fizz"` for multiples of 3
- Print `"Buzz"` for multiples of 5
- Print `"FizzBuzz"` for multiples of both
- Otherwise print the number

```
Input:  n = 15
Output: [1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz", 13, 14, "FizzBuzz"]
```

---

### 5. Find the Maximum Number in an Array
- [ ] Solved | [ ] Reviewed Answer

Find the maximum value in an array **without using `Math.max()`**.

```
Input:  [3, 1, 9, 2, 7]
Output: 9

Input:  [-5, -1, -10]
Output: -1
```

---

### 6. Remove Duplicates from Sorted Array
- [ ] Solved | [ ] Reviewed Answer

Given a **sorted** array, remove duplicates **in-place** and return the new length.

```
Input:  [1, 1, 2]
Output: 2  (array becomes [1, 2, ...])

Input:  [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
Output: 5  (array becomes [0, 1, 2, 3, 4, ...])
```

---

### 7. Palindrome Check
- [ ] Solved | [ ] Reviewed Answer

Check if a given string is a **palindrome** (reads the same forwards and backwards). Ignore spaces and casing.

```
Input:  "racecar"   → Output: true
Input:  "hello"     → Output: false
Input:  "A man a plan a canal Panama"  → Output: true
```

---

### 8. Fibonacci (Iterative + Recursive)
- [ ] Solved | [ ] Reviewed Answer

Return the nth Fibonacci number. Solve it **two ways**: recursively and iteratively.

```
Input:  n = 6
Output: 8
Sequence: 0, 1, 1, 2, 3, 5, 8, 13...
```

---

### 9. Count Vowels in a String
- [ ] Solved | [ ] Reviewed Answer

Count the number of vowels (`a, e, i, o, u`) in a given string. Case-insensitive.

```
Input:  "Hello World"
Output: 3

Input:  "JavaScript"
Output: 3
```

---

### 10. Binary Search
- [ ] Solved | [ ] Reviewed Answer

Given a **sorted** array and a target value, return its index using Binary Search. Return -1 if not found.

```
Input:  arr = [1, 3, 5, 7, 9, 11], target = 7
Output: 3

Input:  arr = [1, 3, 5, 7, 9, 11], target = 6
Output: -1
```

**Challenge:** Solve it both iteratively AND recursively.

---

### 11. Find Missing Number
- [ ] Solved | [ ] Reviewed Answer

Given an array containing n distinct numbers from `0` to `n`, find the one missing number.

```
Input:  [3, 0, 1]
Output: 2

Input:  [9,6,4,2,3,5,7,0,1]
Output: 8
```

---

### 12. Count Character Occurrences
- [ ] Solved | [ ] Reviewed Answer

Given a string, return an object showing how many times each character appears.

```
Input:  "banana"
Output: { b: 1, a: 3, n: 2 }

Input:  "hello"
Output: { h: 1, e: 1, l: 2, o: 1 }
```

---

### 13. Flatten a Nested Array (One Level)
- [ ] Solved | [ ] Reviewed Answer

Flatten a nested array by **one level** without using `.flat()`.

```
Input:  [1, [2, 3], [4, 5], 6]
Output: [1, 2, 3, 4, 5, 6]
```

---

### 14. Check if Two Strings are Anagrams
- [ ] Solved | [ ] Reviewed Answer

Given two strings, return `true` if they are anagrams of each other (same characters, different order).

```
Input:  "listen", "silent"  → Output: true
Input:  "hello", "world"    → Output: false
Input:  "Astronomer", "Moon starer" → Output: true (ignore spaces/case)
```

---

### 15. Sum of All Numbers in Array
- [ ] Solved | [ ] Reviewed Answer

Return the sum of all numbers in an array. Solve it using a loop AND using `reduce()`.

```
Input:  [1, 2, 3, 4, 5]
Output: 15

Input:  [-1, -2, 3]
Output: 0
```

---

## 📊 Progress Tracker

| # | Problem | Solved | Reviewed |
|---|---|---|---|
| 1 | Two Sum | ☐ | ☐ |
| 2 | Reverse a String | ☐ | ☐ |
| 3 | Valid Parentheses | ☐ | ☐ |
| 4 | FizzBuzz | ☐ | ☐ |
| 5 | Find Maximum | ☐ | ☐ |
| 6 | Remove Duplicates | ☐ | ☐ |
| 7 | Palindrome Check | ☐ | ☐ |
| 8 | Fibonacci | ☐ | ☐ |
| 9 | Count Vowels | ☐ | ☐ |
| 10 | Binary Search | ☐ | ☐ |
| 11 | Find Missing Number | ☐ | ☐ |
| 12 | Count Characters | ☐ | ☐ |
| 13 | Flatten Array | ☐ | ☐ |
| 14 | Anagram Check | ☐ | ☐ |
| 15 | Sum of Array | ☐ | ☐ |

---

> ✅ Done with Easy? Move on to **MEDIUM-QUESTIONS.md**
> 📖 Stuck? Check **EASY-ANSWERS.md** — no shame in learning from the answer!
