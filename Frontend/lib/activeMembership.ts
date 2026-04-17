import {
  fetchGroupMembers,
  fetchGroups,
  type GroupBackend,
  type GroupMemberBackend,
} from "@/lib/apiClient";
import { fetchCurrentUser, type AuthenticatedUser } from "@/lib/authClient";

export const POINTS_UPDATED_EVENT = "divitup:points-updated";

export function notifyPointsUpdated(points: number): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(POINTS_UPDATED_EVENT, {
      detail: { points },
    })
  );
}

export interface ActiveMembershipContext {
  currentUser: AuthenticatedUser;
  activeGroup: GroupBackend;
  activeMembership: GroupMemberBackend;
  membersInActiveGroup: GroupMemberBackend[];
}

function membershipPriority(
  membership: GroupMemberBackend,
  group: GroupBackend,
  userId: number
): number {
  if (group.created_by === userId) {
    return 3;
  }

  if (membership.role.toLowerCase() === "admin") {
    return 2;
  }

  return 1;
}

export async function resolveActiveMembership(): Promise<ActiveMembershipContext> {
  const currentUser = await fetchCurrentUser();
  if (!currentUser) {
    throw new Error("No authenticated session found.");
  }

  const [groups, groupMembers] = await Promise.all([
    fetchGroups(),
    fetchGroupMembers(),
  ]);

  const groupById = new Map(groups.map((group) => [group.id, group]));

  const memberships = groupMembers.filter(
    (member) => member.user_id === currentUser.id && groupById.has(member.group_id)
  );

  if (memberships.length === 0) {
    throw new Error("Authenticated user is not a member of any group.");
  }

  const rankedMemberships = [...memberships].sort((a, b) => {
    const groupA = groupById.get(a.group_id)!;
    const groupB = groupById.get(b.group_id)!;
    const scoreDiff =
      membershipPriority(b, groupB, currentUser.id) -
      membershipPriority(a, groupA, currentUser.id);

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return a.group_id - b.group_id;
  });

  const activeMembership = rankedMemberships[0];
  const activeGroup = groupById.get(activeMembership.group_id)!;
  const membersInActiveGroup = groupMembers.filter(
    (member) => member.group_id === activeGroup.id
  );

  return {
    currentUser,
    activeGroup,
    activeMembership,
    membersInActiveGroup,
  };
}
