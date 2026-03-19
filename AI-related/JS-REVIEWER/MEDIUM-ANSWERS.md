# 🟡 Medium Answers — JavaScript Coding Challenges
> Full solutions with explanations, time complexity, and patterns

---

## 1. Maximum Subarray — Kadane's Algorithm

### ✅ Solution
```js
function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    // Either extend current subarray or start fresh from current element
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // 6
console.log(maxSubArray([5,4,-1,7,8]));              // 23
```

### 💡 Explanation
- The key insight: if `currentSum` becomes negative, **drop it and start fresh**
- `Math.max(nums[i], currentSum + nums[i])` — is it better to start over or extend?
- Always track the global max separately because `currentSum` can drop

**Time:** O(n) | **Space:** O(1)

---

## 2. Longest Substring Without Repeating Characters

### ✅ Solution — Sliding Window
```js
function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let left = 0, maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    // Shrink window from left until no duplicate
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }

    seen.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("bbbbb"));    // 1
console.log(lengthOfLongestSubstring("pwwkew"));   // 3
```

### 💡 Explanation
- **Sliding window** technique — expand right, shrink left when duplicate found
- Set tracks characters in current window
- Window size = `right - left + 1`
- When duplicate found: remove from left until clear

**Time:** O(n) | **Space:** O(min(n, alphabet size))

---

## 3. 3Sum

### ✅ Solution — Sort + Two Pointers
```js
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    // Skip duplicates for the first element
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1, right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        // Skip duplicates
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}

console.log(threeSum([-1, 0, 1, 2, -1, -4])); // [[-1,-1,2],[-1,0,1]]
```

### 💡 Explanation
1. Sort first — enables two pointer technique
2. Fix first element with outer loop
3. Use two pointers on the rest to find pairs that sum to `-nums[i]`
4. Skip duplicates carefully to avoid duplicate triplets

**Time:** O(n²) | **Space:** O(1) excluding output

---

## 4. Product of Array Except Self

### ✅ Solution — Prefix + Suffix Products
```js
function productExceptSelf(nums) {
  const n = nums.length;
  const result = new Array(n).fill(1);

  // Left pass: result[i] = product of all elements to the LEFT of i
  let leftProduct = 1;
  for (let i = 0; i < n; i++) {
    result[i] = leftProduct;
    leftProduct *= nums[i];
  }

  // Right pass: multiply by product of all elements to the RIGHT of i
  let rightProduct = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= rightProduct;
    rightProduct *= nums[i];
  }

  return result;
}

console.log(productExceptSelf([1, 2, 3, 4])); // [24, 12, 8, 6]
```

### 💡 Explanation
- Can't use division (what if there's a zero?)
- Two passes: left products, then right products
- `result[i]` = (product of everything left) × (product of everything right)
- No extra array needed — do both passes in one result array

**Time:** O(n) | **Space:** O(1) excluding output

---

## 5. Merge Intervals

### ✅ Solution
```js
function merge(intervals) {
  if (intervals.length <= 1) return intervals;

  // Sort by start time
  intervals.sort((a, b) => a[0] - b[0]);

  const result = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = result[result.length - 1];

    if (current[0] <= last[1]) {
      // Overlap — extend the last interval's end if needed
      last[1] = Math.max(last[1], current[1]);
    } else {
      // No overlap — add as new interval
      result.push(current);
    }
  }

  return result;
}

console.log(merge([[1,3],[2,6],[8,10],[15,18]])); // [[1,6],[8,10],[15,18]]
console.log(merge([[1,4],[4,5]]));                 // [[1,5]]
```

### 💡 Explanation
- Sort by start time first
- Keep track of the last merged interval
- If current start ≤ last end → they overlap, extend end to max of both
- Otherwise → no overlap, push as new interval

**Time:** O(n log n) | **Space:** O(n)

---

## 6. Valid Anagram (Unicode)

### ✅ Solution — HashMap (works for Unicode)
```js
function isAnagram(s, t) {
  if (s.length !== t.length) return false;

  const freq = new Map();

  for (let char of s) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }

  for (let char of t) {
    if (!freq.get(char)) return false; // 0 or undefined
    freq.set(char, freq.get(char) - 1);
  }

  return true;
}

console.log(isAnagram("anagram", "nagaram")); // true
console.log(isAnagram("rat", "car"));          // false
```

### 💡 Explanation
- Map works for any Unicode character (emoji, Chinese, etc.)
- First loop: count frequency of each char in s
- Second loop: decrement for each char in t — if hits 0 and we still need it → false

**Time:** O(n) | **Space:** O(k) — k unique chars

---

## 7. Group Anagrams

### ✅ Solution — Sorted Key
```js
function groupAnagrams(strs) {
  const map = new Map();

  for (let str of strs) {
    // All anagrams share the same sorted key
    const key = str.split('').sort().join('');

    if (!map.has(key)) map.set(key, []);
    map.get(key).push(str);
  }

  return [...map.values()];
}

console.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"]));
// [["eat","tea","ate"],["tan","nat"],["bat"]]
```

### 💡 Explanation
- Anagrams always produce the same string when sorted
- Use sorted string as HashMap key
- Group words under the same key

**Time:** O(n * k log k) — k is max string length | **Space:** O(nk)

---

## 8. Climbing Stairs

### ✅ Solution — Dynamic Programming
```js
function climbStairs(n) {
  if (n <= 2) return n;

  let prev = 1, curr = 2;

  for (let i = 3; i <= n; i++) {
    let next = prev + curr;
    prev = curr;
    curr = next;
  }

  return curr;
}

console.log(climbStairs(2)); // 2
console.log(climbStairs(3)); // 3
console.log(climbStairs(5)); // 8
```

### 💡 Explanation
- To reach step n: you came from step n-1 (1 step) or n-2 (2 steps)
- `ways(n) = ways(n-1) + ways(n-2)` — it's Fibonacci!
- Use iterative approach to avoid recursion overhead

**Time:** O(n) | **Space:** O(1)

---

## 9. Coin Change

### ✅ Solution — Bottom-Up DP
```js
function coinChange(coins, amount) {
  // dp[i] = min coins needed to make amount i
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // 0 coins needed to make amount 0

  for (let i = 1; i <= amount; i++) {
    for (let coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChange([1,5,10,25], 36)); // 3 (25+10+1)
console.log(coinChange([1,2,5], 11));     // 3 (5+5+1)
console.log(coinChange([2], 3));           // -1
```

### 💡 Explanation
- Build up from 0 to target amount
- For each amount, try every coin: if `dp[i - coin] + 1` is less than current → update
- Think of it as: "to make amount i, take coin c and add it to the solution for amount i-c"
- Infinity means "impossible" — return -1 at the end

**Time:** O(amount × coins) | **Space:** O(amount)

---

## 10. Number of Islands

### ✅ Solution — DFS
```js
function numIslands(grid) {
  if (!grid || !grid.length) return 0;

  let count = 0;

  function dfs(r, c) {
    // Out of bounds or water or already visited
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] === '0') {
      return;
    }

    grid[r][c] = '0'; // Mark as visited (sink the island)

    // Explore all 4 directions
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c); // Sink the entire island
      }
    }
  }

  return count;
}
```

### 💡 Explanation
- Loop through grid — when we find '1' (land), increment count and DFS
- DFS "sinks" the entire island by marking connected '1's as '0'
- This avoids revisiting and double-counting
- 4-directional DFS covers all connected land cells

**Time:** O(m × n) | **Space:** O(m × n) recursion stack

---

## 11. Binary Tree Level Order Traversal (BFS)

### ✅ Solution
```js
function levelOrder(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length; // nodes at current level
    const currentLevel = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(currentLevel);
  }

  return result;
}
```

### 💡 Explanation
- Use a queue (BFS — Breadth First Search)
- Key trick: capture `queue.length` at the start of each level
- Process exactly that many nodes → that's one complete level
- Add children to queue for next level

**Time:** O(n) | **Space:** O(n)

---

## 12. Reverse Linked List

### ✅ Iterative Solution
```js
function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr !== null) {
    let next = curr.next; // Save next
    curr.next = prev;     // Reverse the link
    prev = curr;          // Move prev forward
    curr = next;          // Move curr forward
  }

  return prev; // prev is now the new head
}

// Recursive Solution
function reverseListRecursive(head) {
  if (!head || !head.next) return head;

  const newHead = reverseListRecursive(head.next);
  head.next.next = head;
  head.next = null;

  return newHead;
}
```

### 💡 Explanation (Iterative)
- Three pointers: `prev`, `curr`, `next`
- Each step: save next → point curr back to prev → advance both
- When curr is null, prev is the new head

**Time:** O(n) | **Space:** O(1) iterative, O(n) recursive

---

## 13. Detect Cycle in Linked List — Floyd's Algorithm

### ✅ Solution
```js
function hasCycle(head) {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow.next;        // Move 1 step
    fast = fast.next.next;   // Move 2 steps

    if (slow === fast) return true; // They met → cycle!
  }

  return false;
}
```

### 💡 Explanation
- **Floyd's Tortoise and Hare** algorithm
- Slow moves 1 step, fast moves 2 steps
- If there's a cycle, fast will eventually lap slow and they'll meet
- If fast reaches null → no cycle
- This works because in a cycle, fast gains 1 step per iteration — must eventually catch slow

**Time:** O(n) | **Space:** O(1)

---

## 14. Find First and Last Position in Sorted Array

### ✅ Solution — Two Binary Searches
```js
function searchRange(nums, target) {
  return [findFirst(nums, target), findLast(nums, target)];
}

function findFirst(nums, target) {
  let left = 0, right = nums.length - 1, result = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      result = mid;
      right = mid - 1; // Keep searching LEFT
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}

function findLast(nums, target) {
  let left = 0, right = nums.length - 1, result = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      result = mid;
      left = mid + 1; // Keep searching RIGHT
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}

console.log(searchRange([5,7,7,8,8,10], 8)); // [3, 4]
console.log(searchRange([5,7,7,8,8,10], 6)); // [-1, -1]
```

### 💡 Explanation
- Run binary search twice with a twist
- When target found: for first occurrence, keep going LEFT; for last, keep going RIGHT
- Store result and continue searching

**Time:** O(log n) | **Space:** O(1)

---

## 15. Container With Most Water

### ✅ Solution — Two Pointers
```js
function maxArea(height) {
  let left = 0, right = height.length - 1;
  let maxWater = 0;

  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, width * h);

    // Move the shorter side — it can only get better
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return maxWater;
}

console.log(maxArea([1,8,6,2,5,4,8,3,7])); // 49
```

### 💡 Explanation
- Area = width × min(height left, height right)
- Start with widest container (left=0, right=end)
- The bottleneck is always the shorter side
- Moving the shorter side inward might find a taller line → more water
- Moving the taller side inward can only make things worse

**Time:** O(n) | **Space:** O(1)

---

## 🏆 Summary — Medium Patterns to Remember

| Pattern | Problems It Solves |
|---|---|
| Sliding Window | Longest substring, max subarray |
| Two Pointers | 3Sum, Container with water, Remove dupes |
| BFS (Queue) | Level order traversal, shortest path |
| DFS (Recursion) | Number of islands, tree problems |
| Dynamic Programming | Coin change, climbing stairs |
| Prefix/Suffix Products | Product except self |
| Floyd's Algorithm | Cycle detection |
| Sort + Greedy | Merge intervals |
| HashMap Key | Group anagrams |
| Binary Search Variants | First/last position |

---

> ✅ Finished Medium? Move to **HARD-QUESTIONS.md** — if you dare 🔥
