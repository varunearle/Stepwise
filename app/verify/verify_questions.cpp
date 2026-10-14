// Runs the code from every code-based question in src/data/questions.ts
// and prints "<id> <output>". verify.mjs compares these with the marked answers.
#include <bits/stdc++.h>
using namespace std;

struct Node { int val; Node* next; };
Node* build(vector<int> v) {
    Node* head = nullptr;
    for (int i = (int)v.size() - 1; i >= 0; i--) head = new Node{v[i], head};
    return head;
}
struct TNode { int val; TNode *left, *right; };
TNode* insert(TNode* r, int k) {
    if (!r) return new TNode{k, nullptr, nullptr};
    if (k < r->val) r->left = insert(r->left, k); else r->right = insert(r->right, k);
    return r;
}
void pre(TNode* r, string& out) {
    if (!r) return;
    out += (out.empty() ? "" : " ") + to_string(r->val);
    pre(r->left, out); pre(r->right, out);
}
int f(TNode* r) { if (r == nullptr) return 0; return 1 + max(f(r->left), f(r->right)); }

string arr(vector<int> v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) s += (i ? ", " : "") + to_string(v[i]);
    return s + "]";
}

int main() {
    { ostringstream cout;  // AR-02
      int a[5] = {3, 1, 4, 1, 5};
      int s = 0;
      for (int i = 1; i < 5; i += 2)
          s += a[i];
      cout << s;
      std::cout << "AR-02 " << cout.str() << "\n"; }
    { ostringstream cout;  // AR-05
      string s = "level";
      bool ok = true;
      for (int i = 0, j = s.size() - 1; i < j; i++, j--)
          if (s[i] != s[j])
              ok = false;
      cout << ok;
      std::cout << "AR-05 " << cout.str() << "\n"; }
    { int m[3][4]; // AR-06
      std::cout << "AR-06 " << (&m[1][2] - &m[0][0]) << "\n"; }
    { ostringstream cout;  // AR-07
      int a[] = {1, 2, 3, 4, 5, 6};
      int n = 6;
      for (int i = 0; i < n / 2; i++)
          swap(a[i], a[n - 1 - i]);
      cout << a[1] << a[4];
      std::cout << "AR-07 " << cout.str() << "\n"; }
    { ostringstream cout;  // LL-03
      Node* head = build({1, 2, 3, 4});
      Node* p = head;
      int sum = 0;
      while (p != nullptr && p->next != nullptr) {
          sum += p->val;
          p = p->next->next;
      }
      cout << sum;
      std::cout << "LL-03 " << cout.str() << "\n"; }
    { ostringstream cout;  // LL-06
      Node* head = build({1, 2, 3});
      Node* prev = nullptr;
      Node* cur = head;
      while (cur != nullptr) {
          Node* nxt = cur->next;
          cur->next = prev;
          prev = cur;
          cur = nxt;
      }
      cout << prev->val << prev->next->val;
      std::cout << "LL-06 " << cout.str() << "\n"; }
    { ostringstream cout;  // SQ-01
      stack<int> st;
      st.push(1); st.push(2); st.push(3);
      st.pop();
      st.push(4);
      cout << st.top() << st.size();
      std::cout << "SQ-01 " << cout.str() << "\n"; }
    { ostringstream cout;  // SQ-02
      queue<int> q;
      q.push(5); q.push(7); q.push(9);
      q.pop();
      q.push(2);
      cout << q.front() << q.back();
      std::cout << "SQ-02 " << cout.str() << "\n"; }
    { // SQ-03 postfix "2 3 4 * +"
      stack<int> st; istringstream in("2 3 4 * +"); string tok;
      while (in >> tok) {
          if (tok == "*" || tok == "+") {
              int b = st.top(); st.pop(); int a = st.top(); st.pop();
              st.push(tok == "*" ? a * b : a + b);
          } else st.push(stoi(tok));
      }
      std::cout << "SQ-03 " << st.top() << "\n"; }
    { // SQ-07 circular queue capacity for N = 8
      int N = 8, front = 0, rear = 0, count = 0;
      while ((rear + 1) % N != front) { rear = (rear + 1) % N; count++; }
      std::cout << "SQ-07 N=" << N << " capacity=" << count << "\n"; }
    { // SQ-08
      stack<char> st; string popped;
      st.push('A'); st.push('B');
      popped += st.top(); st.pop();
      st.push('C');
      popped += st.top(); st.pop();
      popped += st.top(); st.pop();
      std::cout << "SQ-08 " << popped[0] << " " << popped[1] << " " << popped[2] << "\n"; }
    { // TR-03
      TNode* r = nullptr;
      for (int k : {50, 30, 70, 20, 40}) r = insert(r, k);
      string out; pre(r, out);
      std::cout << "TR-03 " << out << "\n";
      // TR-05 on this tree: longest path 50-30-20 has 3 nodes
      std::cout << "TR-05 f=" << f(r) << " (expected 3 nodes on longest path)\n"; }
    { // SO-03 one bubble pass
      vector<int> a = {5, 1, 4, 2, 8};
      for (size_t i = 0; i + 1 < a.size(); i++) if (a[i] > a[i + 1]) swap(a[i], a[i + 1]);
      std::cout << "SO-03 " << arr(a) << "\n"; }
    { // SO-06 two selection passes
      vector<int> a = {64, 25, 12, 22, 11};
      for (int pass = 0; pass < 2; pass++) {
          int m = pass;
          for (size_t j = pass + 1; j < a.size(); j++) if (a[j] < a[m]) m = j;
          swap(a[pass], a[m]);
      }
      std::cout << "SO-06 " << arr(a) << "\n"; }
    { // TC-04
      int n = 4, count = 0;
      for (int i = 0; i < n; i++)
          for (int j = i; j < n; j++)
              count++;
      std::cout << "TC-04 " << count << "\n"; }
    { // TC-05: first n from which 2^n > n^3 holds for all larger n checked up to 60
      int first = -1;
      for (int n = 60; n >= 1; n--) { if (pow(2.0, n) > pow(n, 3.0)) first = n; else break; }
      std::cout << "TC-05 2^n > n^3 for all n >= " << first << "\n"; }
    return 0;
}
