/**
 * Frontend API client for communicating with the backend.
 * Backend calls are same-origin under /api.
 */

// ============ Types (align with backend schemas) ============

export interface GroupBackend {
  id: number;
  name: string;
  invite_code: string;
  created_by: number;
}

export interface ExpenseBackend {
  id: number;
  group_id: number;
  paid_by: number;
  receipt_id: number | null;
  title: string;
  total_amount: number;
  split_type: string; // "equal" | "custom"
}

export interface ExpenseCreatePayload {
  group_id: number;
  paid_by: number;
  receipt_id?: number | null;
  title: string;
  total_amount: number;
  split_type: string;
}

export interface ChoreBackend {
  id: number;
  group_id: number;
  title: string;
  frequency: string; // "daily" | "weekly" | "monthly" | "one_time"
}

export interface ChoreCreatePayload {
  group_id: number;
  title: string;
  frequency: string;
}

export interface ReceiptBackend {
  id: number;
  group_id: number;
  uploaded_by: number;
  image_url: string;
  total_extracted: number | null;
  status: string; // "pending" | "processed" | "error"
}

export interface ReceiptCreatePayload {
  group_id: number;
  uploaded_by: number;
  image_url: string;
  total_extracted?: number | null;
  status: string;
}

export interface ReceiptItemBackend {
  id: number;
  receipt_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
}

export interface ReceiptItemCreatePayload {
  receipt_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
}

// ============ Groups API ============

export async function fetchGroups(): Promise<GroupBackend[]> {
  const res = await fetch(`/api/groups`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Fetch groups failed: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

export async function fetchGroupByInviteCode(
  inviteCode: string
): Promise<GroupBackend | null> {
  const groups = await fetchGroups();
  return groups.find((group) => group.invite_code === inviteCode) ?? null;
}

// ============ Expenses API ============

export async function fetchExpenses(groupId: number): Promise<ExpenseBackend[]> {
  const res = await fetch(`/api/expenses?group_id=${groupId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Fetch expenses failed: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

export async function createExpense(
  payload: ExpenseCreatePayload
): Promise<ExpenseBackend | null> {
  try {
    const res = await fetch(`/api/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create expense failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error("Error creating expense:", err);
    return null;
  }
}

export async function updateExpense(
  id: number,
  payload: Partial<ExpenseCreatePayload>
): Promise<ExpenseBackend | null> {
  try {
    const res = await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Update expense failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error("Error updating expense:", err);
    return null;
  }
}

export async function deleteExpense(id: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/expenses/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Delete expense failed: ${res.statusText}`);
    return true;
  } catch (err) {
    console.error("Error deleting expense:", err);
    return false;
  }
}

// ============ Chores API ============

export async function fetchChores(groupId: number): Promise<ChoreBackend[]> {
  const res = await fetch(`/api/chores?group_id=${groupId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Fetch chores failed: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

export async function createChore(
  payload: ChoreCreatePayload
): Promise<ChoreBackend | null> {
  try {
    const res = await fetch(`/api/chores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create chore failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error("Error creating chore:", err);
    return null;
  }
}

export async function updateChore(
  id: number,
  payload: Partial<ChoreCreatePayload>
): Promise<ChoreBackend | null> {
  try {
    const res = await fetch(`/api/chores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Update chore failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error("Error updating chore:", err);
    return null;
  }
}

export async function deleteChore(id: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/chores/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Delete chore failed: ${res.statusText}`);
    return true;
  } catch (err) {
    console.error("Error deleting chore:", err);
    return false;
  }
}

// ============ Receipts & Receipt Items API ============

export async function createReceipt(
  payload: ReceiptCreatePayload
): Promise<ReceiptBackend | null> {
  try {
    const res = await fetch(`/api/receipts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create receipt failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error("Error creating receipt:", err);
    return null;
  }
}

export async function createReceiptItem(
  payload: ReceiptItemCreatePayload
): Promise<ReceiptItemBackend | null> {
  try {
    const res = await fetch(`/api/receipt-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create receipt item failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error("Error creating receipt item:", err);
    return null;
  }
}