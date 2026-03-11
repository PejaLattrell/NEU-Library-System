# Book Borrowing Feature

Add a complete book borrowing system: book detail popup, borrow request form with date/duration fields, 3-book borrow limit, and automatic overdue tracking visible to admins.

## Proposed Changes

### Book Detail & Borrow Modal Components

#### [NEW] [BookDetailModal.jsx](file:///c:/Users/User/OneDrive/Desktop/Dev%20Projects/NEU%20Library%20System/frontend-react/src/components/BookDetailModal.jsx)
- Full-screen modal triggered when clicking any book (from dashboard list or search results)
- Shows: title, author, category, ISBN, description, availability count, gradient thumbnail
- "Borrow This Book" button opens the inline borrow form
- Disabled borrow button when book unavailable or user already has 3 active borrows
- Shows user's current active borrow count (e.g. "2/3 books borrowed")

#### [NEW] [BookDetailModal.css](file:///c:/Users/User/OneDrive/Desktop/Dev%20Projects/NEU%20Library%20System/frontend-react/src/styles/BookDetailModal.css)
- Modal overlay with backdrop blur, centered card, slide-up animation
- Form section with polished inputs matching existing design system
- Responsive layout

---

### Borrowing Service Functions

#### [MODIFY] [userService.js](file:///c:/Users/User/OneDrive/Desktop/Dev%20Projects/NEU%20Library%20System/frontend-react/src/services/userService.js)
Add the following functions:
- **`borrowBook(bookId, borrowData)`** — Creates a checkout document in `checkouts` collection with fields: `userId`, `bookId`, `bookTitle`, `borrowDate`, `borrowTime`, `duration` (days), `dueDate`, `status: "active"`, `createdAt`. Also decrements the book's `available` count via Firestore transaction
- **`getUserBorrows(userId)`** — Queries `checkouts` where `userId == current user` and `status == "active"`, returns list of active borrows
- **`getActiveborrowCount(userId)`** — Returns count of active borrows (for enforcing 3-book limit)

#### [MODIFY] [adminService.js](file:///c:/Users/User/OneDrive/Desktop/Dev%20Projects/NEU%20Library%20System/frontend-react/src/services/adminService.js)
Add:
- **`returnBook(checkoutId, bookId)`** — Updates checkout `status` to `"returned"` with `returnedAt` timestamp, increments book `available` count
- **`getOverdueCheckouts()`** — Queries all checkouts where `status == "active"` and `dueDate < now`, returns list with user details

---

### Dashboard Integration

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/User/OneDrive/Desktop/Dev%20Projects/NEU%20Library%20System/frontend-react/src/pages/Dashboard.jsx)
- Import and render `BookDetailModal`
- Add `selectedBook` state — when a book card is clicked, open the modal
- Add `myBorrows` state — fetch on mount via `getUserBorrows()`, display in a "My Borrowed Books" section
- Update stats row: change "Books Available" stat to "Books Borrowed" showing active borrow count
- Make book cards clickable (add `onClick` handler on `.book-card`)
- Load ALL books (not just 5) into a "Browse Books" section with the existing `allBooks` data from search

#### [MODIFY] [Navbar.jsx](file:///c:/Users/User/OneDrive/Desktop/Dev%20Projects/NEU%20Library%20System/frontend-react/src/components/Navbar.jsx)
- When clicking a search result, instead of just navigating to `/dashboard`, emit a callback to open the book detail modal for that specific book

---

### Firestore Rules

#### [MODIFY] [firestore.rules](file:///c:/Users/User/OneDrive/Desktop/Dev%20Projects/NEU%20Library%20System/firestore.rules)
- Allow users to update their own checkout documents (for status changes) — Actually, per the user request, only admins should confirm returns. The existing rules already handle this (users can create, admins can update). No changes needed.

> [!NOTE]
> The existing Firestore rules already support this feature:
> - Users can **create** checkouts (`allow create: if userId == auth.uid`)
> - Users can **read** their own checkouts
> - Admins can **update/delete** checkouts (for processing returns)
> - Book availability updates are handled by the existing `onCheckoutCreated` Cloud Function

---

### Admin Overdue Tracking

#### [MODIFY] [AdminDashboard.jsx](file:///c:/Users/User/OneDrive/Desktop/Dev%20Projects/NEU%20Library%20System/frontend-react/src/pages/AdminDashboard.jsx)
- Add an "Overdue Books" section/card below the stats row
- Fetch overdue checkouts on mount via `getOverdueCheckouts()`
- Show a table with: student name, email, book title, due date, days overdue
- Admin can click "Mark Returned" to process the return
- Add overdue count to stats row

---

### Checkout Document Schema (Firestore)
```
checkouts/{checkoutId}: {
  userId: string,
  bookId: string,
  bookTitle: string,
  bookAuthor: string,
  borrowDate: string (YYYY-MM-DD),
  borrowTime: string (HH:mm),
  duration: number (days),
  dueDate: string (ISO),
  status: "active" | "returned" | "overdue",
  createdAt: Timestamp,
  returnedAt: Timestamp | null
}
```

## Verification Plan

### Manual Verification
1. **Book Detail Modal** — Click any book on the student dashboard → the modal should appear with full details and a "Borrow" button
2. **Borrow Flow** — Click "Borrow" → fill in pickup date, time, duration → submit → should see success, book added to "My Borrowed Books"
3. **3-Book Limit** — Borrow 3 books → the borrow button on the 4th book should be disabled with a message
4. **Search → Modal** — Use the search bar, click a result → book detail modal should open
5. **Admin Overdue View** — After a borrow's due date passes, refresh admin dashboard → overdue section should show the book
6. **Mark Returned (Admin)** — Admin clicks "Mark Returned" → checkout status updates, book availability increments
