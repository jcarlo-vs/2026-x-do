# 🔴 Hard Answers — JavaScript Coding Challenges
> Full solutions with step-by-step explanations and complexity analysis

---

## 1. Trapping Rain Water

### ✅ Optimal Solution — Two Pointers O(n) time, O(1) space
```js
function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let water = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left]; // Update left max wall
      } else {
        water += leftMax - height[left]; // Water trapped here
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right]; // Update right max wall
      } else {
        water += rightMax - height[right]; // Water trapped here
      }
      right--;
    }
  }

  return water;
}

console.log(trap([0,1,0,2,1,0,1,3,2,1,2,1])); // 6
console.log(trap([4,2,0,3,2,5]));               // 9
```

### 💡 Explanation
- Water at any position = `min(maxLeft, maxRight) - height[i]`
- Two pointers meet in the middle — we always process the shorter side
- If `height[left] < height[right]`: the right wall is taller, so left side is constrained by `leftMax`
- Move shorter side inward — the other side is guaranteed to be taller or equal

**Time:** O(n) | **Space:** O(1)

---

## 2. Median of Two Sorted Arrays

### ✅ Solution — Binary Search O(log(min(m,n)))
```js
function findMedianSortedArrays(nums1, nums2) {
  // Ensure nums1 is the smaller array
  if (nums1.length > nums2.length) {
    return findMedianSortedArrays(nums2, nums1);
  }

  const m = nums1.length, n = nums2.length;
  let low = 0, high = m;

  while (low <= high) {
    const partX = Math.floor((low + high) / 2);
    const partY = Math.floor((m + n + 1) / 2) - partX;

    const maxLeftX = partX === 0 ? -Infinity : nums1[partX - 1];
    const minRightX = partX === m ? Infinity : nums1[partX];
    const maxLeftY = partY === 0 ? -Infinity : nums2[partY - 1];
    const minRightY = partY === n ? Infinity : nums2[partY];

    if (maxLeftX <= minRightY && maxLeftY <= minRightX) {
      // Perfect partition found
      if ((m + n) % 2 === 0) {
        return (Math.max(maxLeftX, maxLeftY) + Math.min(minRightX, minRightY)) / 2;
      } else {
        return Math.max(maxLeftX, maxLeftY);
      }
    } else if (maxLeftX > minRightY) {
      high = partX - 1; // Move left in nums1
    } else {
      low = partX + 1;  // Move right in nums1
    }
  }
}

console.log(findMedianSortedArrays([1,3], [2]));   // 2.0
console.log(findMedianSortedArrays([1,2], [3,4])); // 2.5
```

### 💡 Explanation
- The key insight: partition both arrays so that all left-half elements ≤ all right-half elements
- Binary search on the smaller array to find the correct partition
- Check: `maxLeftX ≤ minRightY` AND `maxLeftY ≤ minRightX`
- Handle even/odd total length differently for median calculation
- Edge cases: use -Infinity and Infinity for out-of-bounds partitions

**Time:** O(log(min(m,n))) | **Space:** O(1)

---

## 3. Word Ladder

### ✅ Solution — BFS
```js
function ladderLength(beginWord, endWord, wordList) {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;

  const queue = [[beginWord, 1]]; // [word, steps]
  const visited = new Set([beginWord]);

  while (queue.length > 0) {
    const [word, steps] = queue.shift();

    // Try changing each character
    for (let i = 0; i < word.length; i++) {
      for (let c = 97; c <= 122; c++) { // 'a' to 'z'
        const newChar = String.fromCharCode(c);
        if (newChar === word[i]) continue;

        const newWord = word.slice(0, i) + newChar + word.slice(i + 1);

        if (newWord === endWord) return steps + 1;

        if (wordSet.has(newWord) && !visited.has(newWord)) {
          visited.add(newWord);
          queue.push([newWord, steps + 1]);
        }
      }
    }
  }

  return 0;
}

console.log(ladderLength("hit", "cog", ["hot","dot","dog","lot","log","cog"])); // 5
```

### 💡 Explanation
- Treat each word as a node in a graph
- Two words are connected if they differ by exactly 1 letter
- BFS guarantees the **shortest path** (minimum transformations)
- For each word, try all 26 letters at each position → O(26 × L × N)
- Use visited set to avoid revisiting words

**Time:** O(M² × N) where M=word length, N=wordList size | **Space:** O(M² × N)

---

## 4. Serialize and Deserialize a Binary Tree

### ✅ Solution — Preorder DFS
```js
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function serialize(root) {
  const parts = [];

  function dfs(node) {
    if (!node) {
      parts.push('null');
      return;
    }
    parts.push(node.val);
    dfs(node.left);
    dfs(node.right);
  }

  dfs(root);
  return parts.join(',');
}

function deserialize(data) {
  const parts = data.split(',');
  let index = 0;

  function dfs() {
    if (parts[index] === 'null') {
      index++;
      return null;
    }

    const node = new TreeNode(parseInt(parts[index++]));
    node.left = dfs();
    node.right = dfs();
    return node;
  }

  return dfs();
}

// Test
const root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
root.right.left = new TreeNode(4);
root.right.right = new TreeNode(5);

const serialized = serialize(root);
console.log(serialized); // "1,2,null,null,3,4,null,null,5,null,null"
const tree = deserialize(serialized);
console.log(serialize(tree)); // same string
```

### 💡 Explanation
- Preorder DFS: visit root → left → right
- Null nodes are explicitly marked as "null" string
- Deserialization: use shared index (or queue) that increments as we consume tokens
- Preorder lets us reconstruct perfectly because root always comes first

**Time:** O(n) | **Space:** O(n)

---

## 5. LRU Cache

### ✅ Solution — HashMap + Doubly Linked List
```js
class DLLNode {
  constructor(key, val) {
    this.key = key;
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // key → node

    // Dummy head and tail for easy insertion/removal
    this.head = new DLLNode(0, 0); // Most recently used end
    this.tail = new DLLNode(0, 0); // Least recently used end
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _insertFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._insertFront(node); // Mark as recently used
    return node.val;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this._remove(this.map.get(key));
    }

    const node = new DLLNode(key, value);
    this._insertFront(node);
    this.map.set(key, node);

    if (this.map.size > this.capacity) {
      // Evict LRU — it's just before tail
      const lru = this.tail.prev;
      this._remove(lru);
      this.map.delete(lru.key);
    }
  }
}

const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1)); // 1
cache.put(3, 3);           // evicts 2
console.log(cache.get(2)); // -1
```

### 💡 Explanation
- HashMap gives O(1) key → node lookup
- Doubly Linked List gives O(1) insertion and removal of any node
- Most recently used → near dummy head
- Least recently used → near dummy tail
- On `get`: move node to front (now recently used)
- On `put`: add to front; if over capacity, remove tail's prev node

**Time:** O(1) for both get and put | **Space:** O(capacity)

---

## 6. Merge K Sorted Lists

### ✅ Solution — Divide and Conquer
```js
class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let curr = dummy;

  while (l1 && l2) {
    if (l1.val <= l2.val) {
      curr.next = l1;
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next;
  }

  curr.next = l1 || l2;
  return dummy.next;
}

function mergeKLists(lists) {
  if (!lists || lists.length === 0) return null;

  let interval = 1;

  while (interval < lists.length) {
    for (let i = 0; i + interval < lists.length; i += interval * 2) {
      lists[i] = mergeTwoLists(lists[i], lists[i + interval]);
    }
    interval *= 2;
  }

  return lists[0];
}
```

### 💡 Explanation
- Don't merge one by one (O(kN) per pass is slow)
- Divide and conquer: merge pairs, then merge results — like merge sort
- Round 1: merge list 0+1, 2+3, 4+5...
- Round 2: merge (0+1)+(2+3), (4+5)+(6+7)...
- Total work: O(N log k) where N = total nodes, k = number of lists

**Time:** O(N log k) | **Space:** O(1) iterative

---

## 7. Longest Valid Parentheses

### ✅ Solution — Stack
```js
function longestValidParentheses(s) {
  // Stack holds indices of unmatched brackets
  const stack = [-1]; // Sentinel base index
  let maxLen = 0;

  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else {
      stack.pop(); // Try to match with opening bracket

      if (stack.length === 0) {
        stack.push(i); // No match — this ) is the new base
      } else {
        // Valid sequence length = i - top of stack
        maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
      }
    }
  }

  return maxLen;
}

console.log(longestValidParentheses("(()")); // 2
console.log(longestValidParentheses(")()())")); // 4
console.log(longestValidParentheses("")); // 0
```

### 💡 Explanation
- Stack stores **indices** of unmatched characters
- Start with sentinel `-1` as the base
- For `(`: push its index
- For `)`: pop to try matching; if stack empty → push current index as new base
- Valid length = `current index - top of stack`
- The sentinel ensures the calculation works from the start

**Time:** O(n) | **Space:** O(n)

---

## 8. Find Minimum in Rotated Sorted Array

### ✅ Solution — Modified Binary Search
```js
function findMin(nums) {
  let left = 0, right = nums.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] > nums[right]) {
      // Minimum is in the right half
      left = mid + 1;
    } else {
      // Minimum is in the left half (including mid)
      right = mid;
    }
  }

  return nums[left];
}

console.log(findMin([3,4,5,1,2]));     // 1
console.log(findMin([4,5,6,7,0,1,2])); // 0
console.log(findMin([11,13,15,17]));   // 11
```

### 💡 Explanation
- Key insight: compare `nums[mid]` to `nums[right]`
- If `nums[mid] > nums[right]`: the rotation point (minimum) is in the right half
- If `nums[mid] ≤ nums[right]`: minimum is in left half (or at mid itself)
- Unlike standard binary search, we use `right = mid` (not mid-1) to avoid skipping the minimum

**Time:** O(log n) | **Space:** O(1)

---

## 9. Sliding Window Maximum

### ✅ Solution — Monotonic Deque
```js
function maxSlidingWindow(nums, k) {
  const result = [];
  const deque = []; // Stores indices, front is always the max

  for (let i = 0; i < nums.length; i++) {
    // Remove indices outside the window
    while (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift();
    }

    // Remove indices whose values are less than current
    // (they can never be the max while current is in window)
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    deque.push(i);

    // Start recording results after first full window
    if (i >= k - 1) {
      result.push(nums[deque[0]]); // Front is always the max
    }
  }

  return result;
}

console.log(maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3)); // [3,3,5,5,6,7]
```

### 💡 Explanation
- Deque (double-ended queue) maintains indices in **decreasing order of values**
- Front of deque = index of the maximum in current window
- Before each step:
  1. Remove front if it's out of window (`< i - k + 1`)
  2. Remove from back while back's value < current (they're useless — current is bigger and newer)
- Push current index to back
- Front always gives the max for current window

**Time:** O(n) | **Space:** O(k)

---

## 10. Course Schedule II — Topological Sort

### ✅ Solution — BFS / Kahn's Algorithm
```js
function findOrder(numCourses, prerequisites) {
  // Build adjacency list and in-degree count
  const adj = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);

  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course);
    inDegree[course]++;
  }

  // Start BFS with courses that have no prerequisites
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const order = [];

  while (queue.length > 0) {
    const course = queue.shift();
    order.push(course);

    for (const next of adj[course]) {
      inDegree[next]--;
      if (inDegree[next] === 0) {
        queue.push(next);
      }
    }
  }

  // If we processed all courses → valid order. Otherwise → cycle
  return order.length === numCourses ? order : [];
}

console.log(findOrder(4, [[1,0],[2,0],[3,1],[3,2]])); // [0,1,2,3] or [0,2,1,3]
console.log(findOrder(2, [[1,0],[0,1]]));              // [] (cycle)
```

### 💡 Explanation
- **Topological sort** = ordering nodes so that for every edge A→B, A comes before B
- **In-degree** = number of prerequisites a course has
- Start with courses that have **no prerequisites** (in-degree = 0)
- Process each course: remove it from graph (reduce in-degree of its dependents)
- When a course's in-degree hits 0 → all its prerequisites done → add to queue
- If final order contains all courses → no cycle. Otherwise → cycle detected

**Time:** O(V + E) where V = courses, E = prerequisites | **Space:** O(V + E)

---

## 🏆 Summary — Hard Patterns to Remember

| Pattern | Problems It Solves |
|---|---|
| Two Pointers (advanced) | Trapping Rain Water, Container Water |
| Binary Search (variants) | Median 2 Arrays, Min Rotated Array |
| BFS on graphs/strings | Word Ladder, Level Order |
| DFS + Memoization | Serialize Tree, Path problems |
| Monotonic Stack/Deque | Longest Valid Parens, Sliding Window Max |
| HashMap + DLL | LRU Cache |
| Divide & Conquer | Merge K Lists |
| Topological Sort (BFS) | Course Schedule |

---

## 🎯 Final Advice

Hard problems are really just **medium patterns combined**. When you see a hard problem:

1. **Identify the core pattern** — is it BFS? DP? Binary Search?
2. **Start with brute force** — state it out loud, then optimize
3. **Draw it on paper** — especially for trees, graphs, linked lists
4. **Know your edge cases** — empty input, single element, all same values
5. **Practice explaining** — in Toptal interviews, communication is as important as the code

> 🔥 If you can consistently solve Medium problems and understand Hard ones — you're ready to apply.
> Go get that bag! 💪🇵🇭
