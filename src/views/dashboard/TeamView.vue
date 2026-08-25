<template>
  <div>
    <PageHeader title="Team" subtitle="Writers on your Agency plan share every brand profile and its scoring context.">
      <template #actions>
        <BaseButton @click="inviteModal = true"><PhUserPlus :size="15" weight="bold" /> Invite member</BaseButton>
      </template>
    </PageHeader>

    <!-- Team summary -->
    <div class="team-summary card">
      <div class="team-info">
        <div class="team-avatar font-display">{{ teamInitials }}</div>
        <div>
          <h3>{{ team?.name ?? 'Your team' }}</h3>
          <p class="muted">Owner since {{ formatDate(team?.created_at) }}</p>
        </div>
      </div>
      <div class="seats">
        <span class="seats-label">Seats</span>
        <div class="seat-dots">
          <span v-for="n in seatsLimit" :key="n" class="seat-dot" :class="{ filled: n <= seatCount }" />
        </div>
        <span class="seats-count">{{ seatCount }} / {{ seatsLimit }} in use</span>
      </div>
    </div>

    <div class="team-grid">
      <!-- Members -->
      <section class="card">
        <h3>Members</h3>
        <ul v-if="members.length" class="member-list">
          <li v-for="m in members" :key="m.id" class="member-row">
            <div class="avatar" :class="`avatar--${m.role}`">{{ initials(m.name) }}</div>
            <div class="member-main">
              <strong>{{ m.name }} <span v-if="isMe(m)" class="you-tag">you</span></strong>
              <span class="member-email">{{ m.email }}</span>
            </div>
            <select
              v-if="m.role !== 'owner'"
              class="role-select"
              :value="m.role"
              :aria-label="`Role for ${m.name}`"
              @change="changeRole(m, $event.target.value)"
            >
              <option value="admin">Admin</option>
              <option value="writer">Writer</option>
            </select>
            <BaseBadge v-else tone="brand">Owner</BaseBadge>
            <button
              v-if="m.role !== 'owner'"
              class="row-remove"
              aria-label="Remove member"
              @click="removeMember(m)"
            >&times;</button>
          </li>
        </ul>

        <!-- Pending invites -->
        <template v-if="invites.length">
          <h4 class="section-sub">Pending invites</h4>
          <ul class="member-list">
            <li v-for="inv in invites" :key="inv.id" class="member-row invite-row">
              <div class="avatar avatar--pending"><PhPaperPlaneTilt :size="16" /></div>
              <div class="member-main">
                <strong>{{ inv.email }}</strong>
                <span class="member-email">Expires {{ formatDate(inv.expires_at) }}</span>
              </div>
              <BaseBadge tone="neutral">invited · {{ inv.role }}</BaseBadge>
              <button class="row-remove" aria-label="Revoke invite" @click="revokeInvite(inv)">&times;</button>
            </li>
          </ul>
        </template>
      </section>

      <!-- Role explainer -->
      <aside class="card roles-card">
        <h3>What each role can do</h3>
        <div v-for="r in roleExplainers" :key="r.role" class="role-block">
          <BaseBadge :tone="r.tone">{{ r.label }}</BaseBadge>
          <p>{{ r.text }}</p>
        </div>
      </aside>
    </div>

    <!-- Invite modal -->
    <BaseModal :open="inviteModal" title="Invite a member" narrow @close="inviteModal = false">
      <form @submit.prevent="sendInvite">
        <div class="field">
          <label for="invite-email">Email address</label>
          <input id="invite-email" v-model.trim="inviteForm.email" type="email" placeholder="writer@agency.co" required />
        </div>
        <div class="field">
          <label for="invite-role">Role</label>
          <select id="invite-role" v-model="inviteForm.role">
            <option value="writer">Writer — read brands, run analysis</option>
            <option value="admin">Admin — manage writers and brands</option>
          </select>
        </div>
        <p class="hint">Invites expire after 7 days (BR-T-04).</p>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="inviteModal = false">Cancel</button>
          <BaseButton type="submit" :loading="inviting">Send invite</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { teamsApi } from '@/api/teams'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { PhUserPlus, PhPaperPlaneTilt } from '@phosphor-icons/vue'

const auth = useAuthStore()
const toast = useToast()

const team = ref(null)
const members = ref([])
const invites = ref([])
const loading = ref(true)

const inviteModal = ref(false)
const inviting = ref(false)
const inviteForm = reactive({ email: '', role: 'writer' })

const seatCount = computed(() => members.value.length + invites.value.length)
const seatsLimit = computed(() => team.value?.seats_limit ?? 5)
const teamInitials = computed(() =>
  (team.value?.name ?? '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
)

const isMe = (m) => m.email === auth.user?.email

const roleExplainers = [
  { role: 'owner', label: 'Owner', tone: 'brand', text: 'Full permissions on all team brands and members. Cannot be removed.' },
  { role: 'admin', label: 'Admin', tone: 'info', text: 'Manages writers and brands, but cannot delete the team or change ownership.' },
  { role: 'writer', label: 'Writer', tone: 'neutral', text: 'Reads brand profiles and runs analysis — cannot modify profiles.' },
]

const initials = (name) =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

async function load() {
  try {
    const [teams] = await Promise.all([teamsApi.list()])
    team.value = teams[0] ?? null
    if (!team.value) return
    const data = await teamsApi.listMembers(team.value.id)
    members.value = data.members
    invites.value = data.invites
  } catch (e) {
    toast.error(e.message)
  } finally {
    loading.value = false
  }
}

async function sendInvite() {
  inviting.value = true
  try {
    const invite = await teamsApi.inviteMember(team.value.id, { ...inviteForm })
    invites.value.push(invite)
    inviteForm.email = ''
    inviteForm.role = 'writer'
    inviteModal.value = false
    toast.success(`Invite sent to ${invite.email}.`)
  } catch (e) {
    toast.error(e.message)
  } finally {
    inviting.value = false
  }
}

async function changeRole(member, role) {
  try {
    const updated = await teamsApi.updateMemberRole(team.value.id, member.id, role)
    Object.assign(member, updated)
    toast.success(`${member.name} is now an ${role}.`)
  } catch (e) {
    toast.error(e.message)
  }
}

async function removeMember(member) {
  if (!window.confirm(`Remove ${member.name} from the team?`)) return
  try {
    await teamsApi.removeMember(team.value.id, member.id)
    members.value.splice(members.value.indexOf(member), 1)
    toast.success(`${member.name} removed.`)
  } catch (e) {
    toast.error(e.message)
  }
}

async function revokeInvite(invite) {
  try {
    await teamsApi.revokeInvite(team.value.id, invite.id)
    invites.value.splice(invites.value.indexOf(invite), 1)
    toast.success(`Invite to ${invite.email} revoked.`)
  } catch (e) {
    toast.error(e.message)
  }
}

onMounted(load)
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}
.card h3 {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.2px;
  margin-bottom: 14px;
  color: var(--text-primary);
}

.team-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.team-info { display: flex; align-items: center; gap: 14px; }
.team-avatar {
  display: grid; place-items: center;
  width: 44px; height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0066FF 0%, #0047CC 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  flex-shrink: 0;
}
.team-info h3 {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
  margin-bottom: 2px;
}
.team-info .muted { font-size: 12.5px; color: var(--text-muted); }

.seats { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.seats-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.seat-dots { display: flex; gap: 6px; }
.seat-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--bg-sunken);
  border: 1px solid var(--border-strong);
  transition: background 0.15s, border-color 0.15s;
}
.seat-dot.filled { background: var(--brand); border-color: var(--brand); }
.seats-count { font-size: 12px; color: var(--text-muted); font-weight: 500; }

.team-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(260px, 1fr);
  gap: 16px;
  align-items: start;
}

.member-list { list-style: none; display: flex; flex-direction: column; }
.member-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  transition: background 0.12s;
}
.member-row:last-child { border-bottom: none; }
.member-row:hover { background: var(--bg-surface); margin: 0 -20px; padding: 12px 20px; border-radius: 8px; }

@media (max-width: 640px) {
  .member-row {
    flex-wrap: wrap;
    gap: 10px;
  }
  .member-main { flex: 1 1 calc(100% - 58px); }
  .role-select, .row-remove { margin-left: 0; }
}

.avatar {
  display: grid; place-items: center;
  width: 36px; height: 36px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.2px;
}
.avatar--owner { background: var(--brand-light); color: var(--brand-text); }
.avatar--admin { background: #dbeafe; color: #1d4ed8; }
.avatar--writer { background: var(--bg-sunken); color: var(--text-secondary); }
.avatar--pending { background: var(--bg-surface); color: var(--text-muted); }

.member-main { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.member-main strong {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.3;
}
.you-tag {
  font-size: 10px;
  font-weight: 600;
  color: var(--brand-text);
  background: var(--brand-light);
  border-radius: 999px;
  padding: 1px 6px;
  margin-left: 6px;
  vertical-align: 1px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.member-email {
  font-size: 12.5px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.role-select {
  margin-left: auto;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  color: var(--text-primary);
  transition: border-color 0.14s;
}
.role-select:hover { border-color: var(--border-strong); }
.role-select:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 2px rgba(0,102,255,0.1); }

.row-remove {
  border: none;
  background: none;
  font-size: 18px;
  color: var(--text-disabled);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: color 0.12s, background 0.12s;
}
.row-remove:hover { color: var(--error-text); background: var(--error-bg); }

.section-sub {
  margin-top: 18px;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.invite-row .member-email { font-style: italic; }

.roles-card h3 { margin-bottom: 14px; }
.role-block {
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.role-block:last-child { border-bottom: none; }
.role-block p {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 6px;
  line-height: 1.5;
}

.field { margin-bottom: 16px; }
.field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-primary);
}
.field input, .field select {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  background: var(--bg-card);
  color: var(--text-primary);
  transition: border-color 0.14s;
}
.field input:focus, .field select:focus { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(0,102,255,0.08); }
.hint { font-size: 12.5px; color: var(--text-muted); margin-top: 6px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-cancel {
  height: 40px;
  padding: 0 18px;
  border-radius: 6px;
  border: 1px solid var(--border-strong);
  background: transparent;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.14s;
}
.btn-cancel:hover { background: var(--bg-surface); }

.muted { color: var(--text-muted); font-size: 13px; }

@media (max-width: 860px) {
  .team-grid { grid-template-columns: 1fr; }
}
</style>
