# 🟢 Easy Answers — JavaScript Coding Challenges
> Full solutions with explanations, time complexity, and tips

---

## 1. Two Sum

### ✅ Optimal Solution — HashMap O(n)
```js
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

// Test
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]
```

### 💡 Explanation
- For every number, we calculate what value we **need** to find: `complement = target - nums[i]`
- We check if that complement already exists in our Map
- If yes → we found our pair, return both indices
- If no → store current number and its index in the Map

### ❌ Brute Force (Don't do this in interviews)
```js
// O(n²) — nested loops — too slow
function twoSumBrute(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}
```

**Time:** O(n) | **Space:** O(n)

---

## 2. Reverse a String

### ✅ Solution
```js
// Method 1: Two pointers (no built-in reverse)
function reverseString(str) {
  const arr = str.split('');
  let left = 0, right = arr.length - 1;

  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]]; // swap
    left++;
    right--;
  }

  return arr.join('');
}

// Method 2: Using array reverse (acceptable in interviews)
function reverseString2(str) {
  return str.split('').reverse().join('');
}

// Method 3: Using reduce
function reverseString3(str) {
  return str.split('').reduce((rev, char) => char + rev, '');
}

console.log(reverseString("hello"));      // "olleh"
console.log(reverseString("JavaScript")); // "tpircSavaJ"
```

### 💡 Explanation
- Strings are immutable in JS — we convert to array first
- Two pointer approach: swap characters from outside in
- Destructuring `[a, b] = [b, a]` is a clean JS swap trick

**Time:** O(n) | **Space:** O(n)

---

## 3. Valid Parentheses

### ✅ Solution — Stack
```js
function isValid(s) {
  const stack = [];
  const map = {
    ')': '(',
    '}': '{',
    ']': '['
  };

  for (let char of s) {
    if ('({['.includes(char)) {
      // Opening bracket — push to stack
      stack.push(char);
    } else {
      // Closing bracket — check if top of stack matches
      if (stack.pop() !== map[char]) return false;
    }
  }

  // If stack is empty, all brackets were matched
  return stack.length === 0;
}

console.log(isValid("()"));     // true
console.log(isValid("()[]{}")); // true
console.log(isValid("(]"));     // false
console.log(isValid("{[]}"));   // true
```

### 💡 Explanation
- Use a **stack** (LIFO — last in, first out)
- When we see an opening bracket → push it
- When we see a closing bracket → pop from stack and check if it matches
- The map tells us what the expected opening bracket is for each closing bracket
- At the end, stack must be empty (all opened brackets were closed)

**Time:** O(n) | **Space:** O(n)

---

## 4. FizzBuzz

### ✅ Solution
```js
function fizzBuzz(n) {
  const result = [];

  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      result.push("FizzBuzz");
    } else if (i % 3 === 0) {
      result.push("Fizz");
    } else if (i % 5 === 0) {
      result.push("Buzz");
    } else {
      result.push(i);
    }
  }

  return result;
}

console.log(fizzBuzz(15));
// [1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz", 13, 14, "FizzBuzz"]
```

### 💡 Explanation
- Key: check `% 3 === 0 && % 5 === 0` (FizzBuzz) FIRST before individual checks
- `%` is the modulo operator — gives the remainder of division
- If remainder is 0, it's a multiple

**Time:** O(n) | **Space:** O(n)

---

## 5. Find the Maximum Number in an Array

### ✅ Solution
```js
function findMax(arr) {
  let max = arr[0]; // start with first element

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }

  return max;
}

// Cleaner version with reduce
function findMax2(arr) {
  return arr.reduce((max, curr) => curr > max ? curr : max, arr[0]);
}

console.log(findMax([3, 1, 9, 2, 7])); // 9
console.log(findMax([-5, -1, -10]));   // -1
```

### 💡 Explanation
- Initialize max with the first element (not 0! — handles negative arrays)
- Loop through and update max whenever we find something bigger

**Time:** O(n) | **Space:** O(1)

---

## 6. Remove Duplicates from Sorted Array

### ✅ Solution — Two Pointers
```js
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;

  let slow = 0; // pointer for unique position

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }

  return slow + 1; // length of unique elements
}

const arr = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];
console.log(removeDuplicates(arr)); // 5
console.log(arr.slice(0, 5));       // [0, 1, 2, 3, 4]
```

### 💡 Explanation
- `slow` pointer tracks the last unique position
- `fast` pointer scans through the array
- When `fast` finds a new unique value, increment `slow` and place the value there
- Works because the array is **sorted** — duplicates are always adjacent

**Time:** O(n) | **Space:** O(1)

---

## 7. Palindrome Check

### ✅ Solution
```js
function isPalindrome(str) {
  // Clean string — remove non-alphanumeric, lowercase
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');

  let left = 0, right = clean.length - 1;

  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }

  return true;
}

console.log(isPalindrome("racecar"));                    // true
console.log(isPalindrome("hello"));                      // false
console.log(isPalindrome("A man a plan a canal Panama")); // true
```

### 💡 Explanation
- Clean the string first (lowercase, remove spaces/symbols)
- Use two pointers from both ends moving inward
- If any characters don't match → not a palindrome

**Time:** O(n) | **Space:** O(n)

---

## 8. Fibonacci

### ✅ Recursive Solution (Naive — O(2ⁿ))
```js
function fibRecursive(n) {
  if (n <= 1) return n;
  return fibRecursive(n - 1) + fibRecursive(n - 2);
}
```

### ✅ Recursive with Memoization — O(n)
```js
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}
```

### ✅ Iterative — O(n) (Best for interviews)
```js
function fibIterative(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    let next = prev + curr;
    prev = curr;
    curr = next;
  }
  return curr;
}

console.log(fibIterative(6)); // 8
console.log(fibIterative(10)); // 55
```

### 💡 Explanation
- Naive recursion is exponential — recalculates same values over and over
- Memoization caches results so we never recalculate
- Iterative is cleanest — just track previous two values

**Time (iterative):** O(n) | **Space:** O(1)

---

## 9. Count Vowels in a String

### ✅ Solution
```js
function countVowels(str) {
  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
  let count = 0;

  for (let char of str.toLowerCase()) {
    if (vowels.has(char)) count++;
  }

  return count;
}

// One-liner version
function countVowels2(str) {
  return (str.match(/[aeiou]/gi) || []).length;
}

console.log(countVowels("Hello World")); // 3
console.log(countVowels("JavaScript"));  // 3
```

### 💡 Explanation
- Use a Set for O(1) vowel lookup
- Loop through each character
- Regex version: `/[aeiou]/gi` matches all vowels case-insensitively

**Time:** O(n) | **Space:** O(1)

---

## 10. Binary Search

### ✅ Iterative Solution
```js
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;  // target is in right half
    else right = mid - 1;                          // target is in left half
  }

  return -1; // not found
}

// Recursive version
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
  if (left > right) return -1;
  const mid = Math.floor((left + right) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) return binarySearchRecursive(arr, target, mid + 1, right);
  return binarySearchRecursive(arr, target, left, mid - 1);
}

console.log(binarySearch([1, 3, 5, 7, 9, 11], 7));  // 3
console.log(binarySearch([1, 3, 5, 7, 9, 11], 6));  // -1
```

### 💡 Explanation
- Only works on **sorted** arrays
- Each step cuts the search space in **half** → O(log n)
- `mid` is the middle index — compare target to middle value
- Adjust left or right pointer based on comparison

**Time:** O(log n) | **Space:** O(1)

---

## 11. Find Missing Number

### ✅ Solution — Math Formula
```js
function missingNumber(nums) {
  const n = nums.length;
  const expectedSum = (n * (n + 1)) / 2; // sum of 0 to n
  const actualSum = nums.reduce((acc, num) => acc + num, 0);
  return expectedSum - actualSum;
}

console.log(missingNumber([3, 0, 1]));          // 2
console.log(missingNumber([9,6,4,2,3,5,7,0,1])); // 8
```

### 💡 Explanation
- The sum of numbers from 0 to n = `n * (n + 1) / 2` (Gauss formula)
- Subtract the actual array sum → the difference is the missing number
- Clean O(n) with O(1) space — interviewers love this approach

**Time:** O(n) | **Space:** O(1)

---

## 12. Count Character Occurrences

### ✅ Solution
```js
function charFrequency(str) {
  const freq = {};

  for (let char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }

  return freq;
}

console.log(charFrequency("banana")); // { b: 1, a: 3, n: 2 }
console.log(charFrequency("hello"));  // { h: 1, e: 1, l: 2, o: 1 }
```

### 💡 Explanation
- `freq[char] || 0` — if char doesn't exist yet, treat as 0, then add 1
- This pattern is used everywhere in interview problems — memorize it!

**Time:** O(n) | **Space:** O(k) where k = unique characters

---

## 13. Flatten a Nested Array (One Level)

### ✅ Solution
```js
// Manual flatten (one level)
function flattenOne(arr) {
  const result = [];

  for (let item of arr) {
    if (Array.isArray(item)) {
      for (let inner of item) {
        result.push(inner);
      }
    } else {
      result.push(item);
    }
  }

  return result;
}

// Using concat + spread
function flattenOne2(arr) {
  return [].concat(...arr);
}

// Using reduce
function flattenOne3(arr) {
  return arr.reduce((flat, item) => flat.concat(item), []);
}

console.log(flattenOne([1, [2, 3], [4, 5], 6])); // [1, 2, 3, 4, 5, 6]
```

### 💡 Explanation
- Check if each item is an Array using `Array.isArray()`
- If it is, spread its contents into the result
- Multiple elegant approaches — know at least 2

**Time:** O(n) | **Space:** O(n)

---

## 14. Check if Two Strings are Anagrams

### ✅ Solution
```js
function isAnagram(s, t) {
  // Clean both strings
  const clean = str => str.toLowerCase().replace(/\s/g, '');
  const a = clean(s), b = clean(t);

  if (a.length !== b.length) return false;

  // Sort and compare
  return a.split('').sort().join('') === b.split('').sort().join('');
}

// Optimal using frequency map O(n)
function isAnagramOptimal(s, t) {
  const clean = str => str.toLowerCase().replace(/\s/g, '');
  const a = clean(s), b = clean(t);
  if (a.length !== b.length) return false;

  const freq = {};
  for (let char of a) freq[char] = (freq[char] || 0) + 1;
  for (let char of b) {
    if (!freq[char]) return false;
    freq[char]--;
  }
  return true;
}

console.log(isAnagram("listen", "silent"));             // true
console.log(isAnagram("hello", "world"));               // false
console.log(isAnagram("Astronomer", "Moon starer"));    // true
```

### 💡 Explanation
- Sort approach: both strings sorted should be identical if anagram
- Optimal: use frequency map — add for first string, subtract for second
- If any count goes to 0 or doesn't exist → not an anagram

**Time:** O(n log n) sort | O(n) optimal | **Space:** O(n)

---

## 15. Sum of All Numbers in Array

### ✅ Solution
```js
// Using a loop
function sumLoop(arr) {
  let total = 0;
  for (let num of arr) {
    total += num;
  }
  return total;
}

// Using reduce (preferred in JS)
function sumReduce(arr) {
  return arr.reduce((acc, curr) => acc + curr, 0);
}

console.log(sumLoop([1, 2, 3, 4, 5]));   // 15
console.log(sumReduce([-1, -2, 3]));      // 0
```

### 💡 Explanation
- `reduce()` takes an accumulator (running total) and current value
- The `0` is the initial value of the accumulator
- Always provide initial value to `reduce` — avoids errors on empty arrays

**Time:** O(n) | **Space:** O(1)

---

## 🏆 Summary — Easy Patterns to Remember

| Pattern | Problems It Solves |
|---|---|
| HashMap / frequency count | Two Sum, Anagram, Count chars |
| Two Pointers | Palindrome, Remove duplicates, Reverse |
| Stack | Valid Parentheses |
| Modulo `%` | FizzBuzz, even/odd checks |
| Gauss Formula | Missing number |
| Sort + Compare | Anagram check |
| Reduce | Sum, flatten, frequency |

---

> ✅ Finished Easy? Move to **MEDIUM-QUESTIONS.md**
